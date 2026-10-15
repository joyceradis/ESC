import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const m = createRequire(import.meta.url)('../assets/js/plano.js');
test('progresso do plano em porcentagem', () => {
  assert.equal(m.progress({}), 0);
  const all = Object.fromEntries(m.PLANO.flatMap(d => d[1].map(i => [i[0], true])));
  assert.equal(m.progress(all), 100);
});
test('resumo do esqueleto lista todos os campos e marca os vazios', () => {
  const s = m.summary({ p: 'Minha pergunta' });
  assert.match(s, /Pergunta em uma frase:\nMinha pergunta/);
  assert.match(s, /Limites:\n\(em branco\)/);
  assert.equal(m.filled({ p: 'x', h: ' ' }), 1);
});
