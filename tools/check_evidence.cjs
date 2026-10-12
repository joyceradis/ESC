const {chromium,webkit}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{fs.mkdirSync('evidence/sync',{recursive:true});const results=[];
for(const [name,type] of Object.entries({chromium,webkit})){const browser=await type.launch();
try{for(const width of [320,390,768,1440]){const context=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce'});await context.addInitScript(()=>sessionStorage.setItem('esc-atlas-access-v2','yes'));
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:18774/biblioteca.html');await page.waitForLoadState('networkidle');
assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('#ev-results article').count(),5);
assert(!/L-\d{3}|F11-\d{3}/.test(await page.locator('#ev-results').innerText()));
const check=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow');
await check();
const summary=page.locator('#ev-results summary').first();await summary.focus();await page.keyboard.press('Enter');assert(await summary.evaluate(s=>s.parentElement.open));await check();await page.keyboard.press('Enter');
await page.selectOption('#ev-filter','all');assert.equal(await page.locator('#ev-results article').count(),6);assert((await page.locator('#ev-count').innerText()).includes(String(await page.evaluate(()=>window.ESC_EVIDENCE.records.length))));
await page.click('#ev-next');assert((await page.locator('#ev-count').innerText()).includes('página 2'));
const search=await page.evaluate(()=>window.ESC_EVIDENCE.records[0].title);await page.fill('#ev-search',search);assert((await page.locator('#ev-results article').count())>=1);
await page.fill('#ev-search','zzzz-no-results');assert.equal(await page.locator('#ev-results article').count(),0);
await page.fill('#ev-search','');await page.click('[data-ev-mode=connections]');assert.equal(await page.locator('#ev-results article').count(),4);
await page.selectOption('#ev-filter','hypothesis');assert.equal(await page.locator('#ev-results article').count(),2);assert((await page.locator('#ev-results').innerText()).includes('Hipótese em aberto'));await check();
if(width===390||width===1440){await page.selectOption('#ev-filter','selected');const shot=await page.screenshot({path:'evidence/sync/'+name+'-'+width+'-conexoes.jpg',fullPage:true,type:'jpeg',quality:70});console.log('SYNC_IMAGE '+name+'-'+width+'-conexoes '+shot.toString('base64'));
await page.click('[data-ev-mode=cards]');await page.locator('h1').click();await page.evaluate(()=>scrollTo(0,0));const cards=await page.screenshot({path:'evidence/sync/'+name+'-'+width+'-fichas.jpg',fullPage:true,type:'jpeg',quality:70});console.log('SYNC_IMAGE '+name+'-'+width+'-fichas '+cards.toString('base64'));
await page.goto('http://127.0.0.1:18774/before/biblioteca.html');await page.waitForLoadState('networkidle');const before=await page.screenshot({path:'evidence/sync/'+name+'-'+width+'-antes.jpg',fullPage:true,type:'jpeg',quality:60});console.log('SYNC_IMAGE '+name+'-'+width+'-antes '+before.toString('base64'));}
assert.deepEqual(errors,[]);results.push({engine:name,width,status:'PASS'});fs.writeFileSync('evidence/sync/report.json',JSON.stringify(results,null,2));await context.close();
}
const page=await browser.newPage();await page.addInitScript(()=>sessionStorage.setItem('esc-atlas-access-v2','yes'));await page.goto('http://127.0.0.1:18774/biblioteca.html');await page.waitForLoadState('networkidle');
await page.evaluate(()=>window.ESC_EVIDENCE.records.push({id:'xss',title:'<img src=x onerror="window.PWNED=true">',authors:'Synthetic injection',year:'2020',url:'',doi:'',aliases:['xss'],absent:false}));
await page.selectOption('#ev-filter','all');await page.fill('#ev-search','Synthetic injection');assert.equal(await page.locator('#ev-results img').count(),0);assert.equal(await page.evaluate(()=>!!window.PWNED),false);assert((await page.locator('#ev-results').innerText()).includes('<img'));
}finally{await browser.close();}}
console.log('SYNC_REPORT '+JSON.stringify(results));})().catch(e=>{console.error(e);process.exitCode=1;});
