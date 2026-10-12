const {chromium,webkit}=require('playwright');
const fs=require('node:fs');const crypto=require('node:crypto');const assert=require('node:assert/strict');
const source=fs.readFileSync('assets/js/access-gate.js','utf8');
const synthetic='test-'+crypto.randomUUID();
const hash=crypto.createHash('sha256').update(synthetic).digest('hex');
const testSource=source.replace(/var EXPECTED_SHA256 = ['"][a-f0-9]+['"];/,'var EXPECTED_SHA256 = "'+hash+'";');
assert.notEqual(source,testSource,'fixture must replace only expected digest in memory');
const KEY='esc-atlas-remember-v1', SESSION='esc-atlas-access-v2';
const base='http://127.0.0.1:18771';
const results=[];fs.mkdirSync('evidence/access',{recursive:true});
(async()=>{
 for(const [name,type] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await type.launch();
  async function context(options={}){
   const c=await browser.newContext(options);
   // Synthetic verifier only in this isolated test browser. No real password.
   await c.route('**/assets/js/access-gate.js',r=>r.fulfill({contentType:'application/javascript',body:testSource}));
   return c;
  }
  async function open(c){
   const p=await c.newPage();p.setDefaultTimeout(10000);
   await p.goto(base+'/index.html');return p;
  }
  async function enter(p,remember=true){
   await p.locator('#esc-access-remember').setChecked(remember);
   await p.locator('#esc-access-password').fill(synthetic);
   await p.locator('#esc-access-enter').click();
   await p.locator('#esc-access-gate').waitFor({state:'detached'});
  }
  const checks=[];
  try{
   const c=await context({viewport:{width:390,height:844}});
   const p=await open(c);
   await p.locator('#esc-access-gate').waitFor();
   assert(await p.locator('#esc-access-remember').isChecked());
   for(const width of [390,1440]){
    await p.setViewportSize({width,height:900});
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
    await p.screenshot({path:'evidence/access/'+name+'-'+width+'.png'});
   }
   await p.locator('#esc-access-remember').focus();await p.keyboard.press('Space');
   assert.equal(await p.locator('#esc-access-remember').isChecked(),false);
   await p.keyboard.press('Space');
   await p.locator('#esc-access-password').fill('incorrect-synthetic-value');
   await p.locator('#esc-access-enter').click();
   await p.waitForFunction(()=>document.querySelector('#esc-access-error').textContent.includes('incorreta'));
   assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),null);
   checks.push('wrong password cannot persist; checkbox keyboard');
   await enter(p);
   const stored=await p.evaluate(k=>localStorage.getItem(k),KEY);
   const record=JSON.parse(stored);
   assert.deepEqual(Object.keys(record).sort(),['expiresAt','revision']);
   assert(record.expiresAt>Date.now()+29*86400000 && record.expiresAt<=Date.now()+30*86400000);
   assert.equal(await p.evaluate(k=>sessionStorage.getItem(k),SESSION),null);
   await p.reload();await p.locator('#conteudo').waitFor({state:'visible'});
   assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),stored);
   const second=await open(c);await second.locator('#conteudo').waitFor({state:'visible'});
   assert.equal(await second.locator('#esc-access-gate').count(),0);
   checks.push('remember; new tab; no credential saved; fixed expiration');
   const state=await c.storageState();
   const reopened=await context({storageState:state});
   const rp=await open(reopened);await rp.locator('#conteudo').waitFor({state:'visible'});
   assert.equal(await rp.locator('#esc-access-gate').count(),0);
   checks.push('reopen with persisted browser storage');
   await reopened.close();
   await p.locator('#esc-access-forget').focus();await p.keyboard.press('Enter');
   await p.locator('#esc-access-gate').waitFor();
   await second.locator('#esc-access-gate').waitFor();
   assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),null);
   assert.equal(await p.evaluate(k=>sessionStorage.getItem(k),SESSION),null);
   checks.push('forget current and sibling tab by keyboard');
   await c.close();

   const only=await context();const op=await open(only);await enter(op,false);
   assert.equal(await op.evaluate(k=>localStorage.getItem(k),KEY),null);
   await op.reload();await op.locator('#conteudo').waitFor({state:'visible'});
   const other=await open(only);await other.locator('#esc-access-gate').waitFor();
   checks.push('unchecked: session only; new independent tab asks');
   await only.close();

   for(const raw of [
    JSON.stringify({revision:'access-2026-10-v1',expiresAt:Date.now()-1000}),
    JSON.stringify({revision:'old-version',expiresAt:Date.now()+86400000}),
    'broken-json'
   ]){
    const invalid=await context();
    await invalid.addInitScript(({key,session,raw})=>{
     localStorage.setItem(key,raw);sessionStorage.setItem(session,'yes');
    },{key:KEY,session:SESSION,raw});
    const ip=await open(invalid);await ip.locator('#esc-access-gate').waitFor();
    assert.equal(await ip.evaluate(k=>sessionStorage.getItem(k),SESSION),null);
    await invalid.close();
   }
   checks.push('expired/corrupt/old revision overrides stale session');

   const blocked=await context();
   await blocked.addInitScript(()=>{
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){
     if(this===localStorage)throw new DOMException('Storage blocked','SecurityError');
     return original.call(this,key,value);
    };
   });
   const bp=await open(blocked);await enter(bp);
   assert.equal(await bp.evaluate(k=>sessionStorage.getItem(k),SESSION),'yes');
   await bp.reload();await bp.locator('#conteudo').waitFor({state:'visible'});
   checks.push('persistent storage failure falls back to session');
   await blocked.close();
   results.push({browser:name,passed:true,checks});
  }catch(e){results.push({browser:name,passed:false,checks,error:e.message});process.exitCode=1;}
  finally{await browser.close();fs.writeFileSync('evidence/access/report.json',JSON.stringify(results,null,2));}
 }
 console.log('ACCESS_REPORT='+JSON.stringify(results));
})().catch(e=>{console.error(e);process.exitCode=1});
