import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const l = require('../assets/js/lacunas.js');
const hyps = [{ id: 'HYP-003', title: 'eGCX e resposta ortostática' }];
const reads = [
  { id: 'L-005', status: 'pendente' }, { id: 'L-006', status: 'estudado' }, { id: 'L-013', status: 'novo' }
];
const h = function (ev, extra) { return Object.assign({ id: 'HYP-X', title: 'T', ev: ev, refute: 'r', alt: '' }, extra); };

test('liga leituras só por código e conta por status', () => {
  const r = l.gapRow(h('L-005, L-006, L-013.'), reads, hyps);
  assert.deepEqual(r.linked.map(x => x.id), ['L-005', 'L-006', 'L-013']);
  assert.equal(r.counts.estudado, 1);
  assert.equal(r.counts.pendente, 1);
  assert.equal(r.signal, 'ligadas');
});
test('leituras ligadas sem nenhuma estudada dá sinal próprio', () => {
  assert.equal(l.gapRow(h('L-005, L-013.'), reads, hyps).signal, 'nao-estudadas');
});
test('código inexistente aparece como faltante, sem inventar leitura', () => {
  const r = l.gapRow(h('L-006 e L-999'), reads, hyps);
  assert.deepEqual(r.missing, ['L-999']);
  assert.equal(r.linked.length, 1);
});
test('lacuna declarada no texto tem prioridade sobre o resto', () => {
  assert.equal(l.gapRow(h('Nenhum estudo causal catalogado.'), reads, hyps).signal, 'declarada');
  assert.equal(l.gapRow(h('Pergunta de comentário autoral; sem evidência anexada.'), reads, hyps).signal, 'declarada');
  assert.equal(l.gapRow(h('Fontes NASA a revisar.'), reads, hyps).signal, 'declarada');
});
test('texto livre sem código não é cruzado: pede conferência', () => {
  const r = l.gapRow(h('Pahakis 2007, van Heerebeek 2012.'), reads, hyps);
  assert.equal(r.signal, 'texto');
  assert.equal(r.linked.length, 0);
});
test('explicação concorrente mostra o título, não o código', () => {
  assert.equal(l.gapRow(h('x', { alt: 'HYP-003' }), reads, hyps).alt, 'eGCX e resposta ortostática');
});
test('um código repetido conta uma vez', () => {
  assert.equal(l.gapRow(h('L-005 e L-005'), reads, hyps).linked.length, 1);
});
