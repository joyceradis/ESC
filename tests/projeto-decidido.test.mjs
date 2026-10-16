import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
globalThis.ESC = { project: { deadlineShort: '23/10', deadlineLong: 'sex 23/10/2026', decision: { status: 'decidido', by: 'Joyce', date: '16/10/2026', title: 'Título', doc: 'https://example.org' } } };
const dec = require('../assets/js/decisao.js');
const rota = require('../assets/js/rota.js');
const { summarize } = require('../assets/js/home-estado.js');

test('projeto decidido: a pergunta de partida deixa de ser pendência', () => {
  assert.equal(dec.open({}), dec.OPEN.length - 1);
  assert.match(dec.summary({}), /Recorte: decidido por Joyce/);
  assert.doesNotMatch(dec.summary({}), /Pergunta:/);
});
test('projeto decidido: a rota marca o recorte como feito e ignora a pergunta', () => {
  const steps = rota.evaluate(rota.plan('2026-10-23'), {}, {}, {});
  const escopo = steps.find(s => s.id === 'escopo');
  assert.ok(escopo && escopo.done);
});
test('projeto decidido: a home conta uma pendência a menos', () => {
  const s = summarize(rota, {}, {}, {}, new Date('2026-10-16T12:00:00'), '2026-10-23');
  assert.ok(s.decidido);
  assert.equal(s.pendTotal, dec.OPEN.length - 1);
});
test('sem decision, o fluxo de escolha volta ao normal', () => {
  globalThis.ESC = { project: {} };
  assert.equal(dec.open({}), dec.OPEN.length);
  assert.match(dec.summary({}), /Recorte: não escolhido/);
});
