/* ESC Atlas · comportamentos locais do Laboratório. Sem chamadas externas nem persistência. */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    const M = window.ESCLabMath;
    const mu = document.getElementById('lab-mu');
    if (!mu || !M) return;
    const byId = id => document.getElementById(id);
    const number = id => Number(byId(id).value);
    const fmt = (n, maximumFractionDigits = 2) => new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits, minimumFractionDigits: 0
    }).format(n);
    const write = (id, text) => { const e = byId(id); if (e) e.textContent = text; };
    function render() {
      const viscosity = number('lab-mu'), gradient = number('lab-gradient');
      const shear = M.shear(viscosity, gradient);
      const acceleration = number('lab-g');
      const micro = M.hydrostatic(1060, acceleration, 1e-6);
      const macro = M.hydrostatic(1060, acceleration, 1);
      const re = M.reynolds(1060, number('lab-speed'), number('lab-diameter'), viscosity);
      const osm = M.osmoticKpa(number('lab-osm'), number('lab-temp'));
      const fick = M.diffusion(number('lab-diffusivity'), number('lab-conc'), number('lab-thickness'));
      // Os inputs definem faixas experimentais do modelo, não valores medidos in vivo.
      write('lab-mu-label', fmt(viscosity, 1) + ' mPa·s');
      write('lab-gradient-label', fmt(gradient, 0) + ' s⁻¹');
      byId('lab-tau').innerHTML = fmt(shear.pa, 3) + ' <span>Pa</span>';
      byId('lab-tau-dyn').innerHTML = fmt(shear.dynCm2, 2) + ' <span>dyn/cm²</span>';
      write('lab-flow-speed', 'Cisalhamento relativo: ' + (shear.pa < .5 ? 'baixo' : shear.pa < 2 ? 'moderado' : 'elevado'));
      byId('lab-gradient-fill').style.width = Math.max(3, gradient / 1200 * 100).toFixed(0) + '%';
      const scene = document.querySelector('.lab-stream-cells');
      if (scene) scene.style.animationDuration = (8 - gradient / 1200 * 5).toFixed(2) + 's';
      const antennae = document.querySelector('.lab-antennae');
      if (antennae) antennae.style.transform = 'skewX(' + Math.min(5, shear.pa * .7).toFixed(1) + 'deg)';
      write('lab-g-label', fmt(acceleration, 1) + ' g');
      byId('lab-micro-pressure').innerHTML = fmt(micro, 4) + ' <span>Pa</span>';
      byId('lab-macro-pressure').innerHTML = fmt(macro / 1000, 2) + ' <span>kPa</span>';
      byId('lab-bar-micro').style.width = Math.max(1, acceleration / 4 * 8) + '%';
      byId('lab-bar-macro').style.width = Math.max(1, acceleration / 4 * 94) + '%';
      write('lab-speed-label', fmt(number('lab-speed'), 2) + ' m/s');
      write('lab-diameter-label', fmt(number('lab-diameter'), 1) + ' mm');
      write('lab-reynolds', fmt(re, 1));
      write('lab-osm-label', fmt(number('lab-osm'), 1) + ' mOsm/L');
      write('lab-temp-label', fmt(number('lab-temp'), 0) + ' °C');
      write('lab-osm-result', fmt(osm, 2) + ' kPa');
      write('lab-diffusivity-label', fmt(number('lab-diffusivity'), 0) + ' µm²/s');
      write('lab-conc-label', fmt(number('lab-conc'), 1) + ' mmol/L');
      write('lab-thickness-label', fmt(number('lab-thickness'), 0) + ' µm');
      write('lab-fick-result', fmt(fick.fluxUmolM2S, 3) + ' µmol/(m²·s)');
      const arrow = document.querySelector('.lab-osm-arrow');
      if (arrow) { arrow.textContent = Number(byId('lab-osm').value) === 0 ? '⇄' : '→'; }
    }

    const outcomes = {
      water: {
        title: 'Água: transporte regulado',
        description: 'A água passa por vias transcelulares e paracelulares conforme o endotélio e as forças de transporte. A matriz hidratada não é uma membrana impermeável.',
        radius: 4, fill: '#4283ac', count: 11
      },
      ion: {
        title: 'Íons: carga e vias importam',
        description: 'Íons pequenos podem penetrar regiões hidratadas, mas as interações elétricas, canais e junções alteram a distribuição e o fluxo. Carga oposta pode causar atração e adsorção.',
        radius: 6, fill: '#b18c2c', count: 9
      },
      albumin: {
        title: 'Albumina: interação, não só tamanho',
        description: 'Proteínas plasmáticas podem interagir com a ESL, integrar a camada funcional ou ter acesso limitado por propriedades locais; tamanho sozinho não decide o resultado.',
        radius: 13, fill: '#9653a2', count: 6
      },
      rbc: {
        title: 'Hemácias: exclusão relativa',
        description: 'Hemácias tendem a ser afastadas da região superficial do glicocálix/ESL. A penetração observada por PBR não é uma medida direta da espessura molecular.',
        radius: 24, fill: '#a93653', count: 3
      },
      drug: {
        title: 'Molécula carregada: depende da interação',
        description: 'Carga, força iônica, tamanho, afinidade e adsorção podem aumentar ou diminuir o acesso local. A matriz negativa não repele automaticamente moléculas positivas.',
        radius: 10, fill: '#258578', count: 7
      }
    };
    function molecule() {
      const data = outcomes[byId('lab-molecule').value];
      write('lab-filter-name', data.title);
      write('lab-filter-description', data.description);
      const particles = byId('lab-filter-particles');
      if (!particles) return;
      const svgNS = 'http://www.w3.org/2000/svg';
      const group = document.createDocumentFragment();
      for (let i = 0; i < data.count; i++) {
        const n = document.createElementNS(svgNS, data.radius > 16 ? 'ellipse' : 'circle');
        const x = 35 + i * (370 / Math.max(data.count - 1, 1));
        const y = 59 + (i % 3) * 17;
        if (data.radius > 16) { n.setAttribute('cx', x); n.setAttribute('cy', y); n.setAttribute('rx', data.radius); n.setAttribute('ry', data.radius * .64); }
        else { n.setAttribute('cx', x); n.setAttribute('cy', y); n.setAttribute('r', data.radius); }
        n.setAttribute('fill', data.fill);
        n.setAttribute('stroke', '#fff8fa');
        n.setAttribute('stroke-width', '2');
        n.setAttribute('opacity', '.9');
        group.appendChild(n);
      }
      particles.replaceChildren(group);
    }
    document.querySelectorAll('.lab-controls input[type="range"]').forEach(input => {
      input.addEventListener('input', render);
      input.addEventListener('change', render);
    });
    byId('lab-molecule').addEventListener('change', molecule);
    render();
    molecule();
  });
})();
