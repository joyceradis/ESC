import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const m = createRequire(import.meta.url)('../assets/js/bancada.js');
test('heparan sulfato, hialuronano e ácido siálico bloqueiam o NO; condroitina não', () => {
  for (const id of ['hs', 'ha', 'sa']) assert.equal(m.blocked(m.outcome(id)), true);
  for (const id of ['ctrl', 'cs']) assert.equal(m.blocked(m.outcome(id)), false);
});
test('a PGI2 não muda em nenhuma condição, como relatado', () => {
  assert.ok(m.CONDITIONS.every(c => c.pgi2 === 'preservado'));
});
