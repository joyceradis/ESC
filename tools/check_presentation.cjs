// Revisão de apresentação em nuvem: não usa senha, Drive ou dispositivos pessoais.
// NODE_PATH=/tmp/esc-visual/node_modules ESC_REFERENCE_ROOT=/tmp/esc-before node tools/check_presentation.cjs
const { chromium, webkit } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'evidence', 'presentation');
fs.mkdirSync(output, { recursive: true });
const pages = ['index','retomar','decisao','plano','pergunta','candidatura','protocolo','biblioteca','hipoteses','laboratorio','vocabulario','acervo'];
const viewports = [
  {width:1440,height:900},
  {width:1366,height:768},
  {width:1280,height:600},
  {width:1024,height:768},
  {width:791,height:700},
  {width:790,height:844},
  {width:390,height:844},
  {width:320,height:700},
  {width:844,height:390},
];
const results = [];
function serverFor(dir) {
  const server = http.createServer((req,res) => {
    const file = path.resolve(dir, '.' + new URL(req.url,'http://localhost').pathname);
    if (!file.startsWith(dir + path.sep)) {res.writeHead(403);res.end();return;}
    const types = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.svg':'image/svg+xml'};
    fs.readFile(file,(err,data) => {
      res.writeHead(err ? 404 : 200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'});
      res.end(err ? '' : data);
    });
  });
  return new Promise(resolve => server.listen(0,'127.0.0.1',() => resolve({server,url:'http://127.0.0.1:'+server.address().port})));
}
async function inspect(page) {
  return page.evaluate(() => {
    const rect = sel => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};
    };
    const css = sel => {const el=document.querySelector(sel);return el ? getComputedStyle(el) : null;};
    const r = css(':root');
    const sidebar = document.querySelector('.sidebar');
    const mark = document.querySelector('.brandmark');
    const range = document.createRange(); range.selectNodeContents(mark);
    const glyph = range.getBoundingClientRect();
    const box = mark.getBoundingClientRect();
    return {
      overflow:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-document.documentElement.clientWidth,
      colors:{
        bg:css('body').backgroundColor,
        tokens:Object.fromEntries(['--bg','--paper','--esc','--escDeep','--escNight'].map(k=>[k,r.getPropertyValue(k).trim()])),
        sidebar:css('.sidebar').backgroundImage,
        homeWine:css('.esc-home')?.getPropertyValue('--home-wine').trim() || null,
        specimen:css('.home-specimen')?.backgroundColor || null,
        progress:css('.he-bar>i')?.backgroundImage || null,
      },
      mark:rect('.brandmark'),
      markCenterOffset:{x:glyph.x+glyph.width/2-box.x-box.width/2,y:glyph.y+glyph.height/2-box.y-box.height/2},
      sidebar:{visible:css('.sidebar').display!=='none',height:sidebar.clientHeight,scrollHeight:sidebar.scrollHeight},
      navCount:document.querySelectorAll('.nav a').length,
      heading:rect('.home-cover h1'),
      status:rect('.home-estado'),
      art:rect('.home-specimen'),
      cover:rect('.home-cover'),
      headingFont:parseFloat(css('.home-cover h1')?.fontSize || 0),
      statusFont:parseFloat(css('.he-head h2')?.fontSize || 0),
      animation:css('.home-blood')?.animationName || null,
      brokenImages:[...document.images].filter(i=>!i.complete || !i.naturalWidth).map(i=>i.src),
    };
  });
}
async function check(browser, browserName, variant, baseURL, viewport, slug, capture) {
  const row = {browser:browserName,variant,page:slug,...viewport,errors:[],screenshots:[]};
  results.push(row);
  const context = await browser.newContext({viewport,reducedMotion:'reduce'});
  // Mesmo estado efêmero de teste já usado pelo workflow visual aprovado.
  await context.addInitScript(() => sessionStorage.setItem('esc-atlas-access-v2','yes'));
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.on('pageerror',e=>row.errors.push('JavaScript: '+e.message));
  page.on('response',r=>{if(r.url().startsWith(baseURL) && r.status()>=400) row.errors.push('HTTP '+r.status()+': '+r.url());});
  try {
    assert.equal((await page.goto(baseURL+'/'+slug+'.html',{waitUntil:'load'})).status(),200);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('#esc-access-gate').isVisible(),false,'Barreira cobrindo o layout');
    await page.locator('#conteudo').waitFor({state:'visible'});
    row.metrics = await inspect(page);
    assert.ok(row.metrics.overflow<=2,'Overflow horizontal: '+row.metrics.overflow);
    assert.equal(row.metrics.brokenImages.length,0,'Imagens quebradas');
    assert.equal(row.metrics.navCount,12,'Menu incompleto');
    if (capture) {
      const name = browserName+'-'+slug+'-'+viewport.width+'x'+viewport.height+'-'+variant+'.jpg';
      await page.screenshot({path:path.join(output,name),type:'jpeg',quality:80,animations:'disabled'});
      row.screenshots.push(name);
    }
    if (row.metrics.sidebar.visible) {
      // O foco de teclado deve alcançar o último destino sem rolar o documento.
      const scrollBefore = await page.evaluate(() => window.scrollY);
      await page.locator('.nav a').last().focus();
      row.lastNav = await page.locator('.nav a').last().evaluate(el => {
        const link=el.getBoundingClientRect(),side=el.closest('.sidebar').getBoundingClientRect();
        return {visible:link.top>=side.top-1 && link.bottom<=side.bottom+1,scrollTop:el.closest('.sidebar').scrollTop,documentScroll:window.scrollY};
      });
      assert.ok(row.lastNav.visible,'Último item inacessível na lateral');
      assert.equal(row.lastNav.documentScroll,scrollBefore,'Foco no menu rolou o documento');
      if (capture && slug==='index' && viewport.width===1366) {
        const name=browserName+'-menu-1366x768-'+variant+'.jpg';
        await page.screenshot({path:path.join(output,name),type:'jpeg',quality:80});
        row.screenshots.push(name);
      }
      await page.locator('.brandmark').focus();
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.nav a').first().evaluate(el=>el===document.activeElement),true,'Ordem de Tab inesperada');
      if (variant==='after') {
        assert.ok(Math.abs(row.metrics.mark.width-row.metrics.mark.height)<1,'Monograma não é circular');
        assert.ok(Math.abs(row.metrics.markCenterOffset.x)<1,'Monograma deslocado horizontalmente');
      }
    } else {
      await page.locator('.mobile-nav a').last().focus();
      row.mobileNav = await page.locator('.mobile-nav a').last().evaluate(el=>{
        const r=el.getBoundingClientRect(),nav=el.parentElement.getBoundingClientRect();
        return {visible:r.left>=nav.left-1 && r.right<=nav.right+1,scrollLeft:el.parentElement.scrollLeft};
      });
      assert.ok(row.mobileNav.visible,'Última aba mobile inacessível');
    }
    if (slug==='index') {
      assert.equal(await page.locator('.home-cover-art title').count(),1,'Ilustração científica ausente');
      assert.equal(row.metrics.animation,'none','Movimento reduzido ignorado');
      assert.equal(await page.locator('.he-bar').getAttribute('aria-valuenow'),'2');
      assert.equal(await page.locator('.he-bar').getAttribute('aria-valuemax'),'3');
      assert.equal(await page.locator('.he-stage').count(),3,'Marcos administrativos ausentes');
      assert.ok(row.metrics.headingFont > row.metrics.statusFont*1.6,'Status compete com o hero');
      if(variant==='after') assert.ok(row.metrics.status.height <= (viewport.width>1000 ? 120 : 185),'Status excessivamente alto');
      await page.locator('.home-actions a[href="laboratorio.html"]').click();
      await page.waitForURL('**/laboratorio.html');
      assert.ok(await page.locator('input[type="range"]').count(),'CTA não abriu laboratório');
      row.homeToLab = true;
    }
    if (slug==='laboratorio') {
      const range = page.locator('input[type="range"]').first();
      const beforeText = await page.locator('#conteudo').innerText();
      const value = await range.inputValue();
      const max = await range.getAttribute('max');
      const min = await range.getAttribute('min');
      await range.fill(value===max ? min : max);
      assert.notEqual(await page.locator('#conteudo').innerText(),beforeText,'Controle do laboratório não atualizou resultados');
      row.labControl = true;
    }
  } catch(error) {row.errors.push(error.message);}
  finally {await context.close();}
  console.log(variant,browserName,slug,viewport.width+'x'+viewport.height,row.errors.length ? row.errors.join(' | ') : 'OK');
}
(async()=>{
  const servers=[];
  try {
    const variants=[];
    if(process.env.ESC_REFERENCE_ROOT) variants.push(['before',path.resolve(process.env.ESC_REFERENCE_ROOT)]);
    variants.push(['after',root]);
    for(const [variant,dir] of variants) {
      const hosted=await serverFor(dir); servers.push(hosted.server);
      for(const [browserName,type] of [['chromium',chromium],['webkit',webkit]]) {
        const browser=await type.launch();
        try {
          for(const viewport of viewports) for(const slug of ['index','laboratorio']) {
            const capture=[1440,1366,390].includes(viewport.width);
            await check(browser,browserName,variant,hosted.url,viewport,slug,capture);
          }
          // Todas as páginas que compartilham a lateral e a navegação mobile.
          for(const viewport of [viewports[1],viewports[6]]) for(const slug of pages.filter(s=>!['index','laboratorio'].includes(s))) {
            await check(browser,browserName,variant,hosted.url,viewport,slug,false);
          }
        } finally {await browser.close();}
      }
    }
    const regressions=[];
    for(const row of results.filter(r=>r.variant==='after')) {
      const ref=results.find(r=>r.variant==='before' && r.browser===row.browser && r.page===row.page && r.width===row.width && r.height===row.height);
      if(ref?.metrics && row.metrics) {
        if(JSON.stringify(ref.metrics.colors)!==JSON.stringify(row.metrics.colors)) regressions.push('Paleta mudou: '+row.browser+'/'+row.page+'/'+row.width);
        if(row.metrics.status && row.metrics.status.height > ref.metrics.status.height*.9) regressions.push('Status não ficou ao menos 10% mais compacto: '+row.browser+'/'+row.width);
        row.comparison={statusHeightBefore:ref.metrics.status?.height,statusHeightAfter:row.metrics.status?.height,markBefore:ref.metrics.mark,markAfter:row.metrics.mark};
      }
    }
    const failed=results.filter(r=>r.variant==='after' && r.errors.length);
    const report={reference:process.env.ESC_REFERENCE_SHA || null,scope:'Execução em VM temporária na nuvem; não é teste da produção nem de aparelho físico.',viewports,checked:results.length,failed:failed.length,regressions,results};
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({checked:report.checked,failed:report.failed,regressions}));
    if(failed.length || regressions.length) process.exitCode=1;
  } finally {await Promise.all(servers.map(s=>new Promise(resolve=>s.close(resolve))));}
})().catch(e=>{console.error(e);process.exitCode=1;});
