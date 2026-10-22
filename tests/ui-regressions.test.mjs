import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root = new URL('../', import.meta.url);
const file = path => readFileSync(new URL(path, root),'utf8');

test('contador submetido atualiza todos os indicadores sem erro de seletor', () => {
 const js=file('assets/js/app.js');
 assert.ok(js.includes("document.querySelectorAll('[data-countdown]').forEach"));
 assert.ok(js.includes("document.querySelectorAll('[data-countdown-label]').forEach"));
 assert.ok(!js.includes("querySelector('[data-countdown]').forEach"));
});

test('estado submetido preserva progresso acessível com três marcos administrativos', () => {
 const js=file('assets/js/home-estado.js');
 assert.match(js, /root\.replaceChildren\(heading,bar,stages\)/);
 assert.match(js, /setAttribute\('aria-valuemax','3'\)/);
 assert.match(js, /setAttribute\('aria-valuenow','2'\)/);
 assert.match(js, /66\.6667%/);
 assert.match(js, /Resultado previsto/);
});

test('home privilegia laboratório e projeto científico antes do arquivo de candidatura', () => {
 for(const path of ['src/pages/index.html','index.html']){
  const html=file(path);
  const cover=html.indexOf('class="home-rv home-cover"');
  const lab=html.indexOf('class="home-rv home-explore"');
  const cand=html.indexOf('class="section cand-now"');
  assert.ok(cover>=0 && cover<lab && lab<cand, path);
  assert.match(html, /href="laboratorio\.html"/);
  assert.doesNotMatch(html, /Submissão · não feita/);
 }
});

test('marca do atlas é centralizada e mantém identidade própria', () => {
 const css=file('assets/css/refino.css');
 assert.match(css, /--esc:#8f2340/);
 assert.match(css, /--escDeep:#4a1223/);
 assert.doesNotMatch(css, /--esc:#AE1022/);
 assert.match(css, /\.brandmark\s*\{\s*display:grid;\s*place-items:center/);
});

test('barra lateral tem sobrescrita vinho-rubi carregada por último e cache independente', () => {
 const css=file('assets/css/sidebar-vinho-rubi.css');
 assert.match(css, /linear-gradient\(165deg,#821d40 0%,#6c1636 56%,#501026 100%\)/);
 for (const page of ['index.html','laboratorio.html','candidatura.html','src/layout.html']) {
   const html=file(page);
   assert.match(html, /assets\/css\/sidebar-vinho-rubi\.css/);
   assert.ok(html.indexOf('assets/css/refino.css') < html.indexOf('assets/css/sidebar-vinho-rubi.css'));
 }
});
