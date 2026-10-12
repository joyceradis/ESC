const {chromium,webkit}=require('playwright');const fs=require('fs');
(async()=>{fs.mkdirSync('evidence',{recursive:true});let results=[];
for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await type.launch();
 for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
 await page.addInitScript(()=>sessionStorage.setItem('esc-atlas-access-v2','yes'));
 let errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:18770/before/protocolo.html');
 await page.screenshot({path:'evidence/'+engine+'-'+width+'-before.jpg',type:'jpeg',quality:75});
 await page.goto('http://127.0.0.1:18770/protocolo.html');
 await page.locator('#piloto-hs').waitFor();
 for(const w of [320,390,768,1440]){await page.setViewportSize({width:w,height:1000});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);if(overflow>2)throw Error('overflow '+engine+' '+w+' '+overflow);}
 await page.setViewportSize({width,height:1000});
 // O desenho tem um expansor de leitura e outro de parâmetros; testar ambos.
 const outer=page.locator('#piloto-hs > details');
 const outerSummary=outer.locator(':scope > summary');
 for(const key of ['Enter','Space']){
  await outerSummary.focus();await outerSummary.press(key);
  if(!await outer.evaluate(el=>el.open))throw Error('outer disclosure '+key);
  const inner=outer.locator('details').first();
  const innerSummary=inner.locator(':scope > summary');
  await innerSummary.focus();await innerSummary.press(key);
  if(!await inner.evaluate(el=>el.open))throw Error('inner disclosure '+key);
  await innerSummary.press(key);
  if(await inner.evaluate(el=>el.open))throw Error('inner close '+key);
  await outerSummary.press(key);
  if(await outer.evaluate(el=>el.open))throw Error('outer close '+key);
 }
 await page.evaluate(()=>{document.activeElement.blur();window.scrollTo(0,0)});
 await page.screenshot({path:'evidence/'+engine+'-'+width+'.jpg',type:'jpeg',quality:75});
 await page.locator('#piloto-hs').scrollIntoViewIfNeeded();
 await page.screenshot({path:'evidence/'+engine+'-'+width+'-pilot.jpg',type:'jpeg',quality:75});
 if(errors.length)throw Error(errors.join(';'));
 results.push({engine,width,overflow:false,keyboard:true,errors});
 await page.close();
 }await browser.close();
}
fs.writeFileSync('evidence/browser.json',JSON.stringify(results,null,2));console.log('BROWSER_RESULTS='+JSON.stringify(results));
for(const name of ['webkit-390.jpg','webkit-1440.jpg','webkit-390-before.jpg','webkit-1440-before.jpg','webkit-1440-pilot.jpg'])console.log('IMAGE_BASE64 '+name+' '+fs.readFileSync('evidence/'+name).toString('base64'));
})().catch(e=>{console.error(e);process.exit(1);});
