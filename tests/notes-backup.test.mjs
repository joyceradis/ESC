import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { validate } = require('../assets/js/notes-backup.js');
const dec = require('../assets/js/decisao.js');
const doc = (records) => ({ format: 'esc-atlas-anotacoes', version: 1, records });
test('cópia válida e opcionais ausentes passam', () => {
  assert.ok(validate(doc({ 'esc-decisao-v1': { escopo: 'A', pergunta: 'x', lanes: { elo: 'entra' }, estr: { e1: '' }, abertas: { pergunta: 'ler' } } })));
  assert.ok(validate(doc({ 'esc-decisao-v1': {} })));
  assert.ok(validate(doc({ 'esc-plano-v1': { plano: { a: true }, esq: { p: 'texto' } }, 'esc-mesa-v1': { h: { state: 'explorar', note: '' } } })));
});
test('estado desconhecido é recusado antes de gravar e o resumo seguiria funcionando', () => {
  assert.throws(() => validate(doc({ 'esc-decisao-v1': { abertas: { pergunta: 'invalido' } } })), /formato inesperado/);
  assert.throws(() => validate(doc({ 'esc-decisao-v1': { lanes: { elo: 'xyz' } } })), /formato inesperado/);
  assert.throws(() => validate(doc({ 'esc-decisao-v1': { estr: { e1: 7 } } })), /formato inesperado/);
  assert.throws(() => validate(doc({ 'esc-decisao-v1': { escopo: 'Z' } })), /formato inesperado/);
  assert.throws(() => validate(doc({ 'esc-mesa-v1': { h: { state: 'foo' } } })), /formato inesperado/);
  assert.throws(() => validate(doc({ 'esc-plano-v1': { esq: { p: 123 } } })), /formato inesperado/);
  assert.doesNotThrow(() => dec.summary({ abertas: { pergunta: 'invalido' } }));
});
