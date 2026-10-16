import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const rota = createRequire(import.meta.url)('../assets/js/rota.js');
const DL = '2026-10-23T23:59:00-03:00';
const ev = (dec, cmp, man) => Object.fromEntries(rota.evaluate(rota.plan(DL), dec, cmp, man).map(s => [s.id, s.done]));

test('daysLeft conta dias de calendário de Brasília, em qualquer fuso do navegador', () => {
  assert.equal(rota.daysLeft(DL, new Date('2026-10-16T22:00:00-03:00')), 7);
  assert.equal(rota.daysLeft(DL, new Date('2026-10-23T01:00:00-03:00')), 0);
  assert.equal(rota.daysLeft(DL, new Date('2026-10-24T09:00:00-03:00')), -1);
  /* 01:00Z de 23/10 ainda é 22:00 de 22/10 em Brasília */
  assert.equal(rota.daysLeft(DL, new Date('2026-10-23T01:00:00Z')), 1);
  assert.equal(rota.daysLeft(DL, new Date('2026-10-23T12:00:00Z')), 0);
  assert.equal(rota.daysLeft(DL, new Date('2026-10-24T05:00:00Z')), -1);
});
test('plan distribui sugestões de data antes do prazo', () => {
  const p = rota.plan(DL);
  assert.equal(p.length, 7);
  assert.equal(p[p.length - 1].date.getDate(), 23);
  assert.equal(p[0].date.getDate(), 17);
  assert.ok(p.every((s, i) => i === 0 || s.date >= p[i - 1].date));
});
test('sem estado salvo nada está feito', () => {
  assert.ok(Object.values(ev(null, null, null)).every(v => v === false));
});
test('comparar exige notas em pelo menos dois caminhos escolhidos', () => {
  assert.equal(ev({}, { chosen: ['A', 'B'], ratings: { A: { x: 3 }, B: {} } }).comp, false);
  assert.equal(ev({}, { chosen: ['A', 'B'], ratings: { A: { x: 3 }, B: { x: 1 } } }).comp, true);
  assert.equal(ev({}, { chosen: ['A'], ratings: { A: { x: 3 } } }).comp, false);
  /* "sem nota" é gravado como null e não conta como avaliação */
  assert.equal(ev({}, { chosen: ['A', 'B'], ratings: { A: { x: null }, B: { x: null } } }).comp, false);
  assert.equal(ev({}, { chosen: ['A', 'B'], ratings: { A: { x: null, y: 3 }, B: { x: 1 } } }).comp, true);
});
test('mudar de ideia exige nota não vazia em todo caminho escolhido', () => {
  const base = { chosen: ['A', 'B'], notes: { A: 'se X', B: '   ' } };
  assert.equal(ev({}, base).mudar, false);
  assert.equal(ev({}, { ...base, notes: { A: 'se X', B: 'se Y' } }).mudar, true);
});
test('escopo, trilhas e pendências leem a Decisão', () => {
  const lanes = Object.fromEntries('abcdefg'.split('').map(k => [k, 'dest']));
  const ab = Object.fromEntries(['pergunta', 'estrategias', 'paralelas', 'textos', 'leituras'].map(k => [k, 'decidida']));
  const r = ev({ escopo: 'e1', lanes, abertas: ab }, {});
  assert.deepEqual([r.escopo, r.trilhas, r.pend], [true, true, true]);
  ab.textos = 'ler';
  assert.equal(ev({ abertas: ab }, {}).pend, false);
  assert.equal(ev({ lanes: { a: 'x' } }, {}).trilhas, false);
});
test('passos manuais só contam se marcados', () => {
  const r = ev({}, {}, { texto: true });
  assert.deepEqual([r.texto, r.enviar], [true, false]);
});
test('next lista os pendentes e late compara com hoje', () => {
  const list = rota.evaluate(rota.plan(DL), {}, {}, { texto: true });
  assert.equal(rota.next(list).length, 6);
  assert.equal(rota.late(list[0], new Date('2026-10-18T15:00:00Z')), true);
  assert.equal(rota.late(list[0], new Date('2026-10-17T15:00:00Z')), false);
});
