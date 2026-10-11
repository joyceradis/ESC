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
      // Faixas exploratórias: não são calibração experimental nem valores medidos in vivo.
      write('lab-mu-label', fmt(viscosity, 1) + ' mPa·s');
      write('lab-gradient-label', fmt(gradient, 0) + ' s⁻¹');
      byId('lab-tau').innerHTML = fmt(shear.pa, 3) + ' <span>Pa</span>';
      byId('lab-tau-dyn').innerHTML = fmt(shear.dynCm2, 2) + ' <span>dyn/cm²</span>';
      write('lab-flow-speed', 'Ilustração sem escala de velocidade');
      byId('lab-gradient-fill').style.width = Math.max(3, gradient / 1200 * 100).toFixed(0) + '%';
      // A ilustração não infere velocidade de hemácias ou flexão molecular de tau.
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
      const exponent = number('lab-perm');
      const darcyViscosity = number('lab-darcy-mu');
      const darcy = M.darcy(Math.pow(10, exponent), number('lab-pressure'), number('lab-length'), darcyViscosity);
      write('lab-darcy-mu-label', fmt(darcyViscosity, 1) + ' mPa·s');
      write('lab-perm-label', '10^' + exponent + ' m²');
      write('lab-pressure-label', fmt(number('lab-pressure'), 0) + ' Pa');
      write('lab-length-label', fmt(number('lab-length'), 0) + ' µm');
      write('lab-darcy-result', fmt(darcy.nmPerS, 4) + ' nm/s');
      byId('lab-perm-fill').style.width = (8 + (exponent + 21) / 5 * 90) + '%';
      write('lab-gel-state', exponent <= -20 ? 'Permeabilidade ilustrativa baixa' : exponent >= -17 ? 'Permeabilidade ilustrativa alta' : 'Permeabilidade intermediária');
      const mesh = byId('lab-gel-mesh');
      if (mesh) mesh.setAttribute('opacity', (0.95 - (exponent + 21) / 5 * .4).toFixed(2));
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

    const stages = {
      baseline: {
        badge: '1g', title: 'Referência em 1g',
        desc: 'Estabelecer o estado basal do fluxo, do volume circulante, da resposta vascular e da matriz hidratada, distinguindo territórios vasculares.',
        note: 'Não supor um único “glicocálix normal” universal.'
      },
      launch: {
        badge: '3g', title: 'Lançamento e hipergravidade',
        desc: 'A orientação da aceleração e sua duração alteram gradientes hidrostáticos e cargas. Uma exposição curta não equivale a meses de remodelamento molecular.',
        note: 'Separar aceleração direta, hemodinâmica sistêmica e tempo de exposição.'
      },
      orbit: {
        badge: 'µg', title: 'Meses em microgravidade',
        desc: 'Redistribuição de fluidos, exercício, radiação, metabolismo e inflamação podem mudar respostas endoteliais. A microgravidade não interrompe o cisalhamento gerado pelo coração.',
        note: 'Distinguir microgravidade real/simulada e hipóteses concorrentes.'
      },
      return: {
        badge: '1g', title: 'Retorno e ortostase',
        desc: 'O retorno dos gradientes hidrostáticos demanda adaptação de barorreflexos, volume circulante e tônus vascular. Intolerância pós-voo não é automaticamente POTS.',
        note: 'Hipótese sistêmica clássica versus possível contribuição microvascular: ambas devem ser testadas.'
      }
    };
    document.querySelectorAll('[data-stage]').forEach(button => {
      button.addEventListener('click', () => {
        const stage = stages[button.dataset.stage];
        if (!stage) return;
        document.querySelectorAll('[data-stage]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
        write('lab-stage-art', stage.badge);
        write('lab-stage-title', stage.title);
        write('lab-stage-explanation', stage.desc);
        write('lab-stage-note', stage.note);
      });
    });

    /* Fonte pública gerada a partir do registro científico versionado. */
    const data = window.ESC_ATLAS_DATA;
    const sourcePicker = byId('lab-reference-source');
    if (sourcePicker && Array.isArray(data?.studies)) {
      const papers = new Map(data.studies.map(p => [p.id, p]));
      const refFormat = (mean, error, digits = 1) => {
        const suffix = error == null ? '' : ' ± ' + fmt(error, digits);
        return fmt(mean, digits) + suffix;
      };
      function showStudy() {
        const study = papers.get(sourcePicker.value);
        if (!study) return;
        byId('lab-ref-height').innerHTML = refFormat(study.thickness_nm, study.thickness_error_nm, 0) + ' <small>nm</small>';
        write('lab-ref-height-desc', fmt(study.thickness_nm / 1000, 3) + ' µm · espessura aparente no ajuste de AFM');
        byId('lab-ref-stiffness').innerHTML = refFormat(study.modulus_kpa, study.modulus_error_kpa, 3) + ' <small>kPa</small>';
        write('lab-ref-interpretation', study.explanation);
        write('lab-ref-design', study.design);
        write('lab-ref-method', study.methodological_note);
        byId('lab-ref-method-source').href = study.methodological_source;
        write('lab-ref-method-source', study.methodological_source_label + ' ↗');
        write('lab-ref-culture', study.culture_note);
        const link = byId('lab-ref-paper');
        link.href = study.url;
        link.setAttribute('aria-label', 'Ler ' + study.author + ', ' + study.year + ': artigo publicado');
        link.textContent = 'Artigo ' + study.year + ' · DOI ↗';
        const sameStudy = study.cell_modulus_kpa != null;
        const comparison = byId('lab-relative');
        comparison.hidden = !sameStudy;
        if (sameStudy) {
          const pct = study.modulus_kpa / Math.max(study.modulus_kpa, study.cell_modulus_kpa) * 100;
          byId('lab-ref-soft-bar').style.width = Math.max(2, pct).toFixed(2) + '%';
          write('lab-ref-soft-number', fmt(study.modulus_kpa, 3) + ' kPa');
          byId('lab-ref-cell-bar').style.width = '100%';
          write('lab-ref-cell-number', fmt(study.cell_modulus_kpa, 1) + ' kPa');
        }
        const sourceFlow = byId('lab-apply-published-flow');
        sourceFlow.hidden = !(study.culture_shear_pa != null && study.culture_medium_viscosity_mpas != null);
        // O esquema distingue componentes; não converte a espessura ajustada em altura de filamentos.
      }
      sourcePicker.addEventListener('change', showStudy);
      byId('lab-apply-published-flow').addEventListener('click', () => {
        const study = papers.get(sourcePicker.value);
        if (!study || study.culture_shear_pa == null) return;
        // Gradiente INFERIDO de tau/mu no modelo newtoniano; o paper informa tau e mu, não du/dy medido.
        const grad = study.culture_shear_pa / (study.culture_medium_viscosity_mpas / 1000);
        byId('lab-mu').value = String(study.culture_medium_viscosity_mpas);
        byId('lab-gradient').value = String(Math.min(1200, Math.max(10, Math.round(grad / 10) * 10)));
        render();
        byId('lab-fisica').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      });
      showStudy();
    }

    render();
    molecule();
  });
})();
