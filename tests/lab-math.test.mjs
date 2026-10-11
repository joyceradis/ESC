import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const M = require('../assets/js/lab-math.js');

const near = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, 'esperado ' + expected + ', recebido ' + actual);

test('cisalhamento com conversão mPa.s → Pa.s e Pa → dyn/cm²', () => {
  const result = M.shear(3.5, 350);
  near(result.pa, 1.225);
  near(result.dynCm2, 12.25);
  near(M.shear(1, 0).pa, 0);
});
test('hidrostática: 3g em um micrômetro versus um metro', () => {
  near(M.hydrostatic(1060, 3, 1e-6), 0.031185147, 1e-7);
  near(M.hydrostatic(1060, 3, 1), 31185.147, .001);
  near(M.hydrostatic(1060, 0, 1), 0);
});
test('Reynolds idealizado usa D em mm e viscosidade em mPa.s', () => {
  near(M.reynolds(1060, .15, 1, 3.5), 45.42857142857, 1e-8);
});
test('osmose ideal usa mOsm/L = osmol/m³', () => {
  near(M.osmoticKpa(5, 37), 5 * M.R * 310.15 / 1000, 1e-8);
  near(M.osmoticKpa(0, 37), 0);
});
test('difusão Fick: unidades e magnitude de fluxo', () => {
  const r = M.diffusion(150, 2, 20);
  near(r.fluxUmolM2S, 15);
  near(r.fluxMolM2S, 15e-6);
});
test('entradas inválidas não geram respostas físicas', () => {
  assert.throws(() => M.shear(-1, 200), RangeError);
  assert.throws(() => M.reynolds(1060, .15, 1, 0), RangeError);
  assert.throws(() => M.diffusion(150, 2, 0), RangeError);
  assert.throws(() => M.osmoticKpa(5, -300), RangeError);
  assert.throws(() => M.hydrostatic(1060, -1, 1), RangeError);
});


test('Darcy: permeabilidade e conversão de metros para nanômetros', () => {
  const x = M.darcy(1e-18, 10, 5, 3.5);
  near(x.nmPerS, 1e-18 * 10 / (.0035 * 5e-6) * 1e9, 1e-10);
  near(x.umPerS, x.nmPerS / 1000);
  near(M.darcy(1e-18, 0, 5, 3.5).nmPerS, 0);
  assert.throws(() => M.darcy(1e-18, 10, 0, 3.5), RangeError);
  assert.throws(() => M.darcy(-1, 10, 5, 3.5), RangeError);
});
