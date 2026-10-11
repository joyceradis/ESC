// Verificação visual remota: desktop e celular. Não acessa dispositivos pessoais.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'artifacts', 'responsive');
const pages = ['index.html','retomar.html','pergunta.html','candidatura.html','protocolo.html','biblioteca.html','hipoteses.html','laboratorio.html','vocabulario.html','acervo.html'];
const devices = [
  { name: 'desktop', viewport: {width:1440,height:900}, isMobile:false, hasTouch:false },
  { name: 'mobile', viewport: {width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:1 }
];
fs.mkdirSync(OUTPUT,{recursive:true});
const types = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server = http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(ROOT,'.'+pathname);
  if (!(file===ROOT || file.startsWith(ROOT+path.sep))) {res.writeHead(403);return res.end();}
  const target=fs.existsSync(file)&&fs.statSync(file).isDirectory()?path.join(file,'index.html'):file;
  fs.readFile(target,(err,data)=>{if(err){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'});res.end(data);});
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=server.address().port;
  const browser=await chromium.launch({headless:true});
  const results=[]; let failures=0;
  try{
    for(const device of devices){
      const context=await browser.newContext({viewport:device.viewport,isMobile:device.isMobile,hasTouch:device.hasTouch,deviceScaleFactor:1});
      for(const pageName of pages){
        const page=await context.newPage();
        const errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        const response=await page.goto('http://127.0.0.1:'+port+'/'+pageName,{waitUntil:'networkidle',timeout:30000});
        await page.screenshot({path:path.join(OUTPUT,device.name+'-'+pageName.replace('.html','')+'.png'),fullPage:true});
        const metrics=await page.evaluate(()=>({
          title:document.title,
          bodyWidth:document.body.scrollWidth,
          viewportWidth:window.innerWidth,
          htmlWidth:document.documentElement.scrollWidth,
          interactive:document.querySelectorAll('a,button,input,select,textarea').length,
          brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)
        }));
        const issues=[];
        // Smoke tests de navegação e interação em cada viewport.
        const navigation=page.locator(device.name==='mobile'?'.mobile-nav a':'.sidebar nav a');
        if(await navigation.count()===0) issues.push('Navegação ausente');
        else if(!(await navigation.first().isVisible())) issues.push('Navegação invisível');
        const navLinks=await navigation.evaluateAll(nodes=>nodes.map(a=>a.getAttribute('href')).filter(Boolean));
        if(navLinks.some(h=>!pages.includes(h.split('#')[0])&&!h.startsWith('#'))) issues.push('Destino de navegação inesperado');
        if(pageName==='biblioteca.html'){
          const search=page.locator('#search'),result=page.locator('#resultsMeta');
          if(await search.count()&&await result.count()){
            const before=await result.textContent();
            await search.fill('zzzz-busca-sem-resultados-esc');
            if(await result.textContent()===before)issues.push('Busca não atualiza resultados');
            await search.fill('');
          }else issues.push('Busca da biblioteca ausente');
        }
        if(pageName==='hipoteses.html'){
          const summaries=page.locator('#hypotheses details summary');
          if(await summaries.count()){
            const first=summaries.first();
            const wasOpen=await first.evaluate(e=>e.parentElement.open);
            await first.click();
            if(wasOpen===await first.evaluate(e=>e.parentElement.open))issues.push('Hipóteses não expandem/recolhem');
          }else issues.push('Controle de hipóteses ausente');
        }
        if(pageName==='laboratorio.html'&&await page.locator('input,button,select').count()===0)issues.push('Laboratório sem controles');

        if(response.status()!==200)issues.push('HTTP '+response.status());
        if(!metrics.title.trim())issues.push('Sem título');
        if(metrics.htmlWidth>metrics.viewportWidth+2)issues.push('Rolagem horizontal: '+metrics.htmlWidth+'px / '+metrics.viewportWidth+'px');
        if(metrics.brokenImages.length)issues.push('Imagens quebradas: '+metrics.brokenImages.length);
        if(errors.length)issues.push('Erros JS: '+errors.join(' | '));
        results.push({device:device.name,page:pageName,...metrics,issues});
        if(issues.length){failures++;console.error(device.name,pageName,issues.join('; '));}
        else console.log('OK',device.name,pageName);
        await page.close();
      }
      await context.close();
    }
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
  fs.writeFileSync(path.join(OUTPUT,'report.json'),JSON.stringify({checked:results.length,failed:failures,results},null,2));
  if(failures)process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
