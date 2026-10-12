const {chromium,webkit}=require('playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');
const out='evidence/pergunta';fs.mkdirSync(out,{recursive:true});
(async()=>{const results=[];
for(const [engine,type] of Object.entries({chromium,webkit})){
 const browser=await type.launch();
 try{for(const width of [320,390,768,1440]){
 const context=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce'});
 await context.addInitScript(()=>sessionStorage.setItem('esc-atlas-access-v2','yes'));
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:18773/pergunta.html');await page.waitForLoadState('networkidle');
 assert.equal(await page.locator('h1').count(),1);
 const visible=await page.locator('.question-atlas').innerText();
 assert(!/L-\d{3}|REF-\d{3}|HYP-\d{3}/.test(visible),'Internal codes visible before expansion');
 assert(visible.includes('podem coexistir'));assert(visible.includes('não isola'));
 assert(visible.includes('Outras explicações'));assert(visible.includes('Microgravidade, descarga mecânica e fluxo'));
 async function overflow(){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal page overflow');}
 await overflow();
 for(const detail of await page.locator('.question-atlas details').all()){
  const summary=detail.locator(':scope > summary');await summary.focus();await page.keyboard.press('Enter');
  assert(await detail.evaluate(e=>e.open),'Keyboard cannot expand');
  await overflow();await summary.focus();await page.keyboard.press('Enter');
  assert(!(await detail.evaluate(e=>e.open)),'Keyboard cannot close');
 }
 assert.equal(await page.locator('.question-trace .tbl tbody tr').count(),10,'Technical tables lost');
 for(const a of await page.locator('.question-links a').all()){const href=await a.getAttribute('href');const response=await page.request.get('http://127.0.0.1:18773/'+href);assert(response.ok(),'Broken navigation '+href);}
 assert.deepEqual(errors,[]);
 if(width===390||width===1440){
  await page.evaluate(()=>scrollTo(0,0));
  const name=engine+'-'+width+'-depois';
  const screenshot=await page.screenshot({path:out+'/'+name+'.jpg',fullPage:true,type:'jpeg',quality:70});
  console.log('QUESTION_IMAGE '+name+' '+screenshot.toString('base64'));
  await page.goto('http://127.0.0.1:18773/before/pergunta.html');await page.waitForLoadState('networkidle');
  const before=engine+'-'+width+'-antes';await page.evaluate(()=>scrollTo(0,0));
  const shot=await page.screenshot({path:out+'/'+before+'.jpg',fullPage:true,type:'jpeg',quality:65});
  console.log('QUESTION_IMAGE '+before+' '+shot.toString('base64'));
 }
 results.push({engine,width,status:'PASS',checks:['closed disclosures','keyboard','overflow expanded and collapsed','scientific limits','links','page errors']});await context.close();
 }}finally{await browser.close();}
}
fs.writeFileSync(out+'/report.json',JSON.stringify(results,null,2));console.log('QUESTION_REPORT '+JSON.stringify(results));
})().catch(e=>{console.error(e);process.exitCode=1;});
