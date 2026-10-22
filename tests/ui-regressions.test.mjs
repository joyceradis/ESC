import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root = new URL('../', import.meta.url);
const file = path => readFileSync(new URL(path, root),'utf8');

test('contador submetido atualiza todos os indicadores sem erro de seletor', () => {
 const js=file('assets/js/app.js');
 assert.match(js, /\$\$\('\[data-countdown\]'\)\.forEach/);
 assert.match(js, /\$\$\('\[data-countdown-label\]'\)\.forEach/);
 assert.doesNotMatch(js, /\$\('\[data-countdown\]'\)\.forEach/);
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
 assert.match(css, /--esc:#AE1022/);
 assert.match(css, /\.brandmark\s*\{\s*display:grid;\s*place-items:center/);
});
