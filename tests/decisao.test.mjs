import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const m = createRequire(import.meta.url)('../assets/js/decisao.js');
test('resumo mostra recorte, pergunta e destinos das trilhas', () => {
  const s = m.summary({ escopo: 'A', pergunta: 'Minha pergunta', lanes: { elo: 'entra', orto: 'paralelo', micro: 'depois' } });
  assert.match(s, /Recorte: A · Piloto endotelial/);
  assert.match(s, /Pergunta: Minha pergunta/);
  assert.match(s, /Entra na candidatura:\n- Do endotélio ao cardiomiócito/);
  assert.match(s, /Fica em paralelo:\n- Ortostase e pós-voo/);
});
test('sem escolha, o resumo diz isso e conta trilhas sem destino', () => {
  assert.match(m.summary({}), /Recorte: não escolhido/);
  assert.equal(m.pending({}), m.LANES.length);
  assert.equal(m.pending({ lanes: { elo: 'entra' } }), m.LANES.length - 1);
});
