const { chromium } = require('playwright');
const fs = require('fs');
(async()=>{
 fs.mkdirSync('evidence',{recursive:true});
 const browser=await chromium.launch();
 for(const [device,width,height] of [['desktop',1440,1000],['iphone-emulado',390,844]]){
  for(const version of ['before','after']){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
   await page.goto('http://127.0.0.1:18768/'+version+'/hipoteses.html');
   // The existing gate is only a visual overlay; remove it for isolated layout evidence.
   await page.evaluate(()=>{for(const e of document.querySelectorAll('[id*="gate"],[class*="access-gate"]'))e.remove();document.documentElement.classList.remove('esc-access-locked');document.body.style.overflow='auto';});
   await page.screenshot({path:'evidence/'+device+'-'+version+'.png',fullPage:true});
   if(version==='after'){
    const cards=page.locator('#matriz-decisao details');
    if(await cards.count()!==12)throw Error('Missing comparison cards');
    await cards.first().locator('summary').focus();
    await page.keyboard.press('Enter');
    if(!await cards.first().getAttribute('open').then(x=>x!==null))throw Error('Keyboard details failed');
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Horizontal overflow');
    await page.locator('#matriz-decisao').screenshot({path:'evidence/'+device+'-matriz.png'});
   }
   await page.close();
  }
 }
 await browser.close();
 console.log('PASS: desktop/mobile, keyboard details, reduced-motion, overflow, captures');
})().catch(e=>{console.error(e);process.exit(1)});
