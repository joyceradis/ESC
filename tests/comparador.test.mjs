import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const c = require('../assets/js/comparador.js');
const ids = c.CRITERIA.map(function (x) { return x[0]; });
const all = function (n) { return Object.fromEntries(ids.map(function (i) { return [i, n]; })); };
const W = function (n) { return all(n); };

test('nota ponderada: tudo 5 vale 100 e tudo 1 vale 20', () => {
  assert.equal(c.score(W(3), all(5)), 100);
  assert.equal(c.score(W(3), all(1)), 20);
});
test('critério sem nota fica de fora, não vira zero', () => {
  const r = { clinica: 5 };
  assert.equal(c.score(W(3), r), 100);
  assert.ok(Math.abs(c.coverage(W(3), r) - 1 / ids.length) < 1e-9);
});
test('peso 0 ignora o critério', () => {
  const w = Object.assign(W(3), { clinica: 0 });
  assert.equal(c.score(w, { clinica: 1, viavel: 5 }), 100);
});
test('sem nenhuma nota com peso, a pontuação é nula', () => {
  assert.equal(c.score(W(3), {}), null);
  assert.equal(c.score(W(0), all(5)), null);
});
test('líder: maior pontuação; empate ou sem notas dá null', () => {
  const by = { A: all(5), B: all(2) };
  assert.equal(c.leader(['A', 'B'], W(3), by), 'A');
  assert.equal(c.leader(['A', 'B'], W(3), { A: all(3), B: all(3) }), null);
  assert.equal(c.leader(['A', 'B'], W(3), {}), null);
});
test('sensibilidade: apontar o critério que troca o líder', () => {
  /* A ganha em "clinica", B ganha em "viavel"; com clinica 3 e viavel 2, A lidera por um fio (17 a 16). */
  const by = { A: { clinica: 5, viavel: 1 }, B: { clinica: 2, viavel: 5 } };
  const w = Object.assign(W(0), { clinica: 3, viavel: 2 });
  assert.equal(c.leader(['A', 'B'], w, by), 'A');
  const s = c.sensitivity(['A', 'B'], w, by);
  assert.ok(s.some(function (x) { return x.id === 'viavel' && x.delta === 1 && x.to === 'B'; }));
  assert.ok(s.some(function (x) { return x.id === 'clinica' && x.delta === -1; }));
});
test('leitura estável: líder folgado não troca com ±1', () => {
  const by = { A: all(5), B: all(1) };
  assert.deepEqual(c.sensitivity(['A', 'B'], W(3), by), []);
});
test('margem entre 1º e 2º; null com menos de dois', () => {
  assert.equal(c.margin(['A', 'B'], W(3), { A: all(5), B: all(3) }), 40);
  assert.equal(c.margin(['A'], W(3), { A: all(5) }), null);
});
test('resumo avisa que é leitura, não decisão', () => {
  const t = c.summary({ A: 'Recorte A', B: 'Recorte B' }, ['A', 'B'], W(3), { A: all(5), B: all(2) });
  assert.match(t, /Recorte A: 100 pontos/);
  assert.match(t, /não uma decisão/);
});

test('nextCustomId nunca reaproveita id de critério removido', () => {
  assert.equal(c.nextCustomId([], {}, {}), 'c1');
  assert.equal(c.nextCustomId([{ id: 'c1' }], {}, {}), 'c2');
  assert.equal(c.nextCustomId([], { c1: 3 }, {}), 'c2');
  assert.equal(c.nextCustomId([], {}, { A: { c1: 4 } }), 'c2');
  assert.equal(c.nextCustomId([{ id: 'c2' }], { c1: 3 }, { A: { c3: 1 } }), 'c4');
});
test('buildCriteria: sem edição devolve os critérios padrão', () => {
  assert.deepEqual(c.buildCriteria().map(function (x) { return x[0]; }), ids);
});
test('buildCriteria: renomeia, remove e acrescenta critérios próprios', () => {
  const r = c.buildCriteria([{ id: 'c1', label: 'Risco ético' }], { clinica: '  Impacto clínico ' }, ['viavel']);
  assert.equal(r.find(function (x) { return x[0] === 'clinica'; })[1], 'Impacto clínico');
  assert.ok(!r.some(function (x) { return x[0] === 'viavel'; }));
  assert.deepEqual(r[r.length - 1].slice(0, 2), ['c1', 'Risco ético']);
});
test('buildCriteria: limita a 4 próprios e descarta rótulo vazio', () => {
  const many = ['a', 'b', 'c', 'd', 'e'].map(function (k) { return { id: k, label: 'x' + k }; });
  assert.equal(c.buildCriteria(many).length, ids.length + c.MAX_CUSTOM);
  assert.equal(c.buildCriteria([{ id: 'z', label: '   ' }]).length, ids.length);
});
test('critério removido não pesa no cálculo; o próprio entra', () => {
  const crit = c.buildCriteria([{ id: 'c1', label: 'Risco' }], {}, ['clinica']);
  assert.equal(c.score({ clinica: 5, c1: 3 }, { clinica: 1, c1: 5 }, crit), 100);
  assert.ok(Math.abs(c.coverage({ c1: 3, viavel: 3 }, { c1: 5 }, crit) - 0.5) < 1e-9);
});
test('resumo inclui “o que me faria mudar de ideia” quando há nota', () => {
  const t = c.summary({ A: 'A' }, ['A'], W(3), { A: all(4) }, undefined, { A: 'Se o dado X falhar' });
  assert.match(t, /O que me faria mudar de ideia: Se o dado X falhar/);
  assert.doesNotMatch(c.summary({ A: 'A' }, ['A'], W(3), { A: all(4) }, undefined, {}), /mudar de ideia/);
});
