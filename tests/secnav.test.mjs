import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { current } = createRequire(import.meta.url)('../assets/js/secnav.js');

const tops = (a, b, c) => [{ id: 'rota', top: a }, { id: 'projeto', top: b }, { id: 'lacunas', top: c }];

test('secnav: antes de rolar, a primeira seção é a atual', () => {
  assert.equal(current(tops(120, 900, 1800), 60), 'rota');
});
test('secnav: a última seção que já passou da linha é a atual', () => {
  assert.equal(current(tops(-1200, -300, 400), 100), 'projeto');
  assert.equal(current(tops(-2000, -1000, 40), 100), 'lacunas');
});
test('secnav: sem seções não há atual', () => {
  assert.equal(current([], 100), null);
});
