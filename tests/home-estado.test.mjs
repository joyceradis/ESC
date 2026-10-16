import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Rota = require('../assets/js/rota.js');
const { summarize } = require('../assets/js/home-estado.js');
const NOW = new Date('2026-10-16T12:00:00');

test('estado vazio: 0 de 7, pergunta não escrita, cinco pendências em aberto', () => {
  const s = summarize(Rota, {}, {}, {}, NOW, '2026-10-23');
  assert.equal(s.done, 0); assert.equal(s.total, 7);
  assert.equal(s.pergunta, false);
  assert.equal(s.open, 5); assert.equal(s.pendTotal, 5);
});
test('próximo passo vindo de #hash aponta para decisao.html', () => {
  const s = summarize(Rota, {}, {}, {}, NOW, '2026-10-23');
  assert.ok(s.next); assert.ok(!s.next.href.startsWith('#'));
});
test('pendências decididas reduzem o contador de abertas', () => {
  const dec = { abertas: { pergunta: 'decidida', textos: 'decidida' } };
  const s = summarize(Rota, dec, {}, {}, NOW, '2026-10-23');
  assert.equal(s.open, 3);
});
