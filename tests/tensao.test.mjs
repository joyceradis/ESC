import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const m = createRequire(import.meta.url)('../assets/js/tensao.js');
test('na ICFEp: PKG e cGMP menores, estresse e Fpassive maiores', () => {
  const c = m.cohort('icfep');
  assert.deepEqual([c.pkg, c.cgmp, c.nitro, c.fp], ['menor', 'menor', 'maior', 'maior']);
});
test('PKG in vitro só tem desfecho descrito na ICFEp', () => {
  assert.equal(m.withPkg(m.cohort('icfep')).fp, 'corrigida');
  assert.equal(m.withPkg(m.cohort('ae')).described, false);
  assert.equal(m.withPkg(m.cohort('icfer')).described, false);
});
test('coorte desconhecida cai na ICFEp', () => { assert.equal(m.cohort('x').id, 'icfep'); });
test('fora da ICFEp só a PKG está comparada', () => { for (const id of ['ae','icfer']) { const c = m.cohort(id); assert.equal(c.pkg, 'maior'); assert.equal(c.fp, null); } });
