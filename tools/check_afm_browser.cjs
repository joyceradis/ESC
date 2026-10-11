const { chromium, webkit, devices } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
(async () => {
 await fs.mkdir('evidence', {recursive:true});
 const result = [];
 for (const [engine, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await type.launch();
  try {
   for (const [device, options] of [['desktop', {viewport:{width:1440,height:1000}}], ['iphone', {...devices['iPhone 13'], deviceScaleFactor:1}]]) {
    const ctx = await browser.newContext({...options, reducedMotion:'reduce'});
    await ctx.addInitScript(() => sessionStorage.setItem('esc-atlas-access-v2','yes'));
    const page = await ctx.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    for (const phase of ['before','after']) {
     await page.goto('http://127.0.0.1:18768/'+phase+'/laboratorio.html');
     await page.locator('#lab-estudos').screenshot({path:'evidence/'+engine+'-'+device+'-'+phase+'.jpg',animations:'disabled',type:'jpeg',quality:70,style:'.mobile-head { visibility: hidden !important; }'});
    }
    assert.equal(await page.locator('.lab-evidence-legend li').count(),3);
    assert.match(await page.locator('#lab-paper-title').innerText(),/O que exatamente/);
    assert.match(await page.locator('#lab-ref-design').innerText(), /HUVECs/);
    assert.match(await page.locator('#lab-ref-method').innerText(), /provavelmente errôneos/);
    assert.match(await page.locator('#lab-ref-culture').innerText(), /inferido/);
    assert.equal(await page.locator('#lab-ref-method-source').getAttribute('href'), 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7136287/');
    const originalArt=await page.locator('.lab-paper-svg').innerHTML();
    assert.match(await page.locator('#lab-ref-height').innerText(),/380 ± 50/);
    assert.match(await page.locator('#lab-ref-stiffness').innerText(),/0,7 ± 0,5/);
    await page.selectOption('#lab-reference-source','waugh-2020');
    assert.match(await page.locator('#lab-ref-height').innerText(),/110/);
    assert.match(await page.locator('#lab-ref-stiffness').innerText(),/0,025/);
    assert.match(await page.locator('#lab-ref-method').innerText(), /350 nm/);
    assert.match(await page.locator('#lab-ref-design').innerText(), /HPMECs/);
    assert.equal(await page.locator('#lab-relative').isVisible(),false);
    assert.equal(await page.locator('#lab-apply-published-flow').isVisible(),false);
    assert.equal(await page.locator('.lab-paper-svg').innerHTML(),originalArt,'trocar estudo não deve encurtar filamentos');
    await page.locator('#lab-estudos').screenshot({path:'evidence/'+engine+'-'+device+'-2020.jpg',animations:'disabled',type:'jpeg',quality:70,style:'.mobile-head { visibility: hidden !important; }'});
    await page.selectOption('#lab-reference-source','marsh-2013');
    await page.locator('#lab-apply-published-flow').click();
    assert.match(await page.locator('#lab-tau').innerText(),/^1\s+Pa$/);
    assert.equal(await page.locator('#lab-relative').isVisible(),true);
    assert.match(await page.locator('#lab-ref-method').innerText(), /provavelmente errôneos/);
    assert.match(await page.locator('#lab-darcy-result').innerText(), /^2 nm/);
    const beforeViscosity = await page.locator('#lab-darcy-result').innerText();
    await page.locator('#lab-mu').focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#lab-darcy-result').innerText(), beforeViscosity, 'viscosidade do fluxo não deve alterar Darcy');
    await page.locator('#lab-darcy-mu').fill('2');
    await page.locator('#lab-darcy-mu').dispatchEvent('input');
    assert.match(await page.locator('#lab-darcy-result').innerText(), /^1 nm/);
    assert.equal(await page.locator('.lab-antennae').getAttribute('style'), null);
    assert.match(await page.locator('#lab-flow-speed').innerText(), /sem escala/);
    await page.locator('#lab-method-scope summary').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#lab-method-scope').getAttribute('open'), '');
    await page.locator('#lab-method-scope summary').click();
    await page.locator('#lab-fisica').screenshot({path:'evidence/'+engine+'-'+device+'-physics.jpg',animations:'disabled',type:'jpeg',quality:65,style:'.mobile-head { visibility: hidden !important; }'});
    const measurements=[];
    for(const width of [320,390,768,1024,1440]){
     await page.setViewportSize({width,height:1000});
     const m=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('#lab-estudos *, #lab-fisica *, #lab-quimica *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).length}));
     assert.equal(m.scroll,m.width);assert.equal(m.overflow,0);measurements.push(m);
    }
    assert.deepEqual(errors,[]);
    result.push({engine,device,studyValuesPreserved:true,artUnchangedBetweenStudies:true,applyFlow:true,methodologyVisible:true,darcyIndependent:true,keyboard:true,measurements});
    await ctx.close();
   }
  } finally {await browser.close();}
 }
 await fs.writeFile('evidence/validation.json',JSON.stringify(result,null,2));
 console.log('AFM_BROWSER_PASS '+JSON.stringify(result));
 for (const name of ['webkit-desktop-before','webkit-desktop-after','webkit-iphone-before','webkit-iphone-after']) {
  console.log('AFM_IMAGE '+name+' '+(await fs.readFile('evidence/'+name+'.jpg')).toString('base64'));
 }
})().catch(e=>{console.error(e);process.exitCode=1});
