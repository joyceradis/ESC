import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const m = require('../assets/js/mesa.js');
const list = [
  { id: 'HYP-000', title: 'Controle sistêmico da ortostase' },
  { id: 'HYP-003', title: 'eGCX e resposta ortostática' }
];
test('troca códigos internos por títulos legíveis', () => {
  assert.equal(m.readable(list, 'HYP-003'), 'eGCX e resposta ortostática');
  assert.ok(!/HYP-\d/.test(m.readable(list, 'ver HYP-000 e HYP-003')));
});
test('resumo lista só o que foi marcado, com título e nota', () => {
  const s = m.summary(list, { 'HYP-000': { state: 'explorar', note: 'ler primeiro' } });
  assert.match(s, /Exploro:\n- Controle sistêmico da ortostase — ler primeiro/);
  assert.ok(!/HYP-/.test(s));
  assert.equal(m.summary(list, {}), 'Nenhuma linha marcada ainda.');
});
