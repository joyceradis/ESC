import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const m = createRequire(import.meta.url)('../assets/js/cadeia.js');
test('as lacunas são o início e o fim da cadeia', () => { assert.deepEqual(m.gaps().map(l => l.id), ['desc', 'tit']); });
test('cada elo com estudo aponta para uma bancada', () => { for (const l of m.LINKS) assert.equal(l.level === 'nada', l.where === null); });
test('elo desconhecido cai no primeiro', () => { assert.equal(m.link('x').id, 'desc'); });
