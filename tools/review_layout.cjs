const {webkit}=require('playwright');
const fs=require('fs');
(async()=>{
 const browser=await webkit.launch();
 const report=[];
 try{
  for(const width of [390,1440]){
   const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
   await page.addInitScript(()=>sessionStorage.setItem('esc-atlas-access-v2','yes'));
   for(const name of ['index','protocolo']){
    for(const version of ['before','after']){
     await page.goto('http://127.0.0.1:18770/'+(version==='before'?'before/':'')+name+'.html',{waitUntil:'load'});
     await page.evaluate(()=>document.fonts.ready);
     await page.locator('#conteudo').waitFor({state:'visible'});
     const metrics=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,text:document.querySelector('#conteudo').innerText.length}));
     if(metrics.width>width+2)throw Error('Overflow '+version+' '+name+' '+width);
     const file='evidence/layout-'+name+'-'+width+'-'+version+'.jpg';
     await page.screenshot({path:file,type:'jpeg',quality:78,animations:'disabled'});
     console.log('LAYOUT_IMAGE '+file+' '+fs.readFileSync(file).toString('base64'));
     report.push({page:name,width,version,...metrics});
     if(version==='after'&&name==='protocolo'){
      for(const id of ['piloto-curto','agenda-hs']){
       const card=page.locator('#'+id);
       await card.scrollIntoViewIfNeeded();
       const summary=card.locator('summary').first();
       await summary.focus();
       await summary.press('Enter');
       if(!await card.locator('details').first().evaluate(e=>e.open))throw Error('Disclosure '+id);
       await summary.press('Enter');
      }
      await page.locator('#piloto-curto').scrollIntoViewIfNeeded();
      const file2='evidence/layout-plans-'+width+'.jpg';
      await page.screenshot({path:file2,type:'jpeg',quality:78,animations:'disabled'});
      console.log('LAYOUT_IMAGE '+file2+' '+fs.readFileSync(file2).toString('base64'));
     }
    }
   }
   await page.close();
  }
  fs.writeFileSync('evidence/layout-report.json',JSON.stringify(report,null,2));
  console.log('LAYOUT_REPORT='+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
