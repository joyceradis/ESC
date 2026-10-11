import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const M = require('../assets/js/lab-math.js');
const source = JSON.parse(readFileSync(new URL('../atlas/estudos-gel.json', import.meta.url), 'utf8'));
const dataScript = readFileSync(new URL('../assets/js/atlas-dados.js', import.meta.url), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(dataScript, sandbox);
const compiled = sandbox.window.ESC_ATLAS_DATA;

test('Estudos publicados carregam valores originais e DOI verificável', () => {
  const marsh = source.studies.find(s => s.id === 'marsh-2013');
  const delgadillo = source.studies.find(s => s.id === 'waugh-2020');
  assert.equal(marsh.thickness_nm, 380);
  assert.equal(marsh.thickness_error_nm, 50);
  assert.equal(marsh.modulus_kpa, 0.7);
  assert.equal(marsh.modulus_error_kpa, 0.5);
  assert.equal(marsh.cell_modulus_kpa, 16);
  assert.equal(marsh.culture_shear_pa, 1);
  assert.equal(marsh.culture_medium_viscosity_mpas, 1);
  assert.equal(marsh.doi, '10.3791/50163');
  assert.equal(delgadillo.thickness_nm, 110);
  assert.equal(delgadillo.modulus_kpa, 0.025);
  assert.equal(delgadillo.doi, '10.1016/j.bpj.2020.02.010');
  assert.equal(delgadillo.cell_modulus_kpa, null);
  assert.equal(compiled.studies.length, source.studies.length);
});

test('Condição experimental de 2013 produz 1 Pa no modelo newtoniano', () => {
  const s = source.studies.find(x => x.id === 'marsh-2013');
  const derivedGradient = s.culture_shear_pa / (s.culture_medium_viscosity_mpas / 1000);
  assert.equal(derivedGradient, 1000);
  assert.equal(M.shear(s.culture_medium_viscosity_mpas, derivedGradient).pa, 1);
});

test('Módulo de indentação não se transforma em permeabilidade de Darcy', () => {
  const s = source.studies.find(x => x.id === 'marsh-2013');
  assert.equal(s.permeability_m2, undefined);
  assert.equal(source.dictionary.permeability.includes('não mediu k'), true);
});

test('Notas geradas só incluem registros públicos e são conteúdo estruturado', () => {
  assert.ok(Array.isArray(compiled.notes));
  assert.ok(compiled.notes.length);
  assert.ok(compiled.notes.every(n => n.status === 'publicado' && n.privacy === 'public-knowledge'));
  assert.ok(compiled.notes.every(n => n.link.endsWith('.html') || n.link.includes('.html#')));
  assert.equal(compiled.studies[1].doi, '10.1016/j.bpj.2020.02.010');
});
