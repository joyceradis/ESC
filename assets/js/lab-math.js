/* ESC Research Atlas · modelos de ensino com hipóteses explícitas.
   Os resultados são equações idealizadas, não medições de glicocálix ou recomendações clínicas. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ESCLabMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const G = 9.80665;
  const R = 8.314462618;
  function value(n, name, minimum) {
    if (typeof n !== 'number' || !Number.isFinite(n) || n < minimum)
      throw new RangeError(name + ': use um valor numérico maior ou igual a ' + minimum);
    return n;
  }
  // mu: mPa.s; du/dy: s^-1; tau = mu*gradiente, válido apenas para aproximação newtoniana.
  function shear(muMpas, gradientPerS) {
    const pa = value(muMpas, 'viscosidade', 0) / 1000 * value(gradientPerS, 'gradiente', 0);
    return { pa, dynCm2: pa * 10 };
  }
  // Delta p = rho * g * L. g múltiplo de 9.80665 m/s², comprimento em metros.
  function hydrostatic(densityKgM3, gMultiple, lengthM) {
    return value(densityKgM3, 'densidade', 0) * value(gMultiple, 'aceleração', 0) * G * value(lengthM, 'comprimento', 0);
  }
  // Re = rho*v*D/mu; D mm, mu mPa.s, aproximação de tubo e viscosidade constante.
  function reynolds(densityKgM3, speedMs, diameterMm, muMpas) {
    const mu = value(muMpas, 'viscosidade', 0.000001) / 1000;
    return value(densityKgM3, 'densidade', 0) * value(speedMs, 'velocidade', 0) * value(diameterMm, 'diâmetro', 0) / 1000 / mu;
  }
  // van't Hoff ideal: delta osmoles em mOsm/L = osmoles/m³; sigma=1 apenas ideal.
  function osmoticKpa(deltaMosmL, temperatureC) {
    const kelvin = value(temperatureC, 'temperatura', -273.14) + 273.15;
    return value(deltaMosmL, 'diferença de osmolaridade', 0) * R * kelvin / 1000;
  }
  // Fick: fluxo em µmol/(m².s); D µm²/s, gradiente mMol/L, distância µm.
  // Nota: 1 mmol/L = 1 mol/m³ e 1 µm²/s = 10^-12 m²/s.
  function diffusion(Dum2S, deltaMmolL, distanceUm) {
    const distance = value(distanceUm, 'distância', 0.000001);
    const fluxUmolM2S = value(Dum2S, 'difusividade', 0) * value(deltaMmolL, 'gradiente de concentração', 0) / distance;
    return { fluxUmolM2S, fluxMolM2S: fluxUmolM2S / 1e6 };
  }
  return Object.freeze({ G, R, shear, hydrostatic, reynolds, osmoticKpa, diffusion });
});
