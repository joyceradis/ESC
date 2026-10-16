/* Mapa de lacunas — o que o registro do atlas já sustenta em cada linha de pesquisa e o que ainda não.
   Fonte: só ESC.hypotheses e ESC.readings (data.js), como estão. Nada é inferido além do que está escrito:
   leituras só são ligadas a uma linha quando o campo "evidência" cita o código (L-000); o resto aparece como texto.
   O sinal é uma regra simples e visível, não um julgamento científico. Não ordena nem escolhe linhas; a decisão é da autora. */
'use strict';
(function () {
  const DECLARED = /sem evid|nenhum estudo|a revisar|pergunta de coment/i;
  const STATUS = ['estudado', 'verificar', 'pendente', 'novo'];

  function readable(hyps, text) {
    return String(text || '').replace(/HYP-\d{3}/g, function (m) {
      const h = hyps.find(function (x) { return x.id === m; });
      return h ? h.title : m;
    });
  }

  /* Uma linha do mapa. `signal` ∈ declarada | nao-estudadas | ligadas | texto. */
  function gapRow(h, readings, hyps) {
    const ids = Array.from(new Set(String(h.ev || '').match(/L-\d{3}/g) || []));
    const linked = [], missing = [];
    ids.forEach(function (id) {
      const r = readings.find(function (x) { return x.id === id; });
      if (r) linked.push(r); else missing.push(id);
    });
    const counts = {};
    STATUS.forEach(function (s) { counts[s] = linked.filter(function (r) { return r.status === s; }).length; });
    let signal;
    if (DECLARED.test(h.ev || '')) signal = 'declarada';
    else if (linked.length && counts.estudado === 0) signal = 'nao-estudadas';
    else if (linked.length) signal = 'ligadas';
    else signal = 'texto';
    return { id: h.id, title: h.title, ev: h.ev || '', linked: linked, missing: missing, counts: counts, signal: signal,
      refute: h.refute || '', alt: readable(hyps || [], h.alt || '') };
  }

  const LABEL = {
    declarada: 'Lacuna declarada no registro',
    'nao-estudadas': 'Leituras ligadas, nenhuma marcada como estudada',
    ligadas: 'Há leitura ligada já estudada',
    texto: 'Evidência só em texto: confira a fonte'
  };
  const GAPS = ['declarada', 'nao-estudadas'];

  function rows(hyps, readings) { return hyps.map(function (h) { return gapRow(h, readings, hyps); }); }

  const api = { gapRow: gapRow, rows: rows, readable: readable, LABEL: LABEL, GAPS: GAPS, STATUS: STATUS };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  window.ESCLacunas = api;

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function start() {
    const root = document.getElementById('lacunas-root');
    if (!root || !window.ESC || !ESC.hypotheses || !ESC.readings) return;
    const all = rows(ESC.hypotheses, ESC.readings);
    const status = el('p', 'mesa-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const lab = el('label', 'mesa-chip'); const cb = el('input'); cb.type = 'checkbox';
    lab.appendChild(cb); lab.appendChild(document.createTextNode(' Mostrar só onde há lacuna declarada ou leituras ainda não estudadas'));
    const list = el('div', 'lac-list');

    function draw() {
      list.textContent = '';
      const shown = all.filter(function (r) { return !cb.checked || GAPS.indexOf(r.signal) >= 0; });
      status.textContent = shown.length + ' de ' + all.length + ' linhas.';
      shown.forEach(function (r) {
        const card = el('article', 'cmp-crit lac-card'); card.dataset.signal = r.signal;
        card.appendChild(el('h4', null, r.title));
        card.appendChild(el('p', 'lac-signal', LABEL[r.signal]));
        const dl = el('dl', 'lac-dl');
        function add(k, v) { dl.appendChild(el('dt', null, k)); dl.appendChild(el('dd', null, v)); }
        add('Evidência registrada', r.ev || 'nada registrado');
        if (r.linked.length) add('Leituras ligadas por código', r.linked.map(function (x) { return x.id + ' (' + x.status + ')'; }).join('; '));
        if (r.missing.length) add('Códigos sem leitura no acervo', r.missing.join(', '));
        if (r.refute) add('O que refutaria', r.refute);
        if (r.alt) add('Explicação concorrente', r.alt);
        card.appendChild(dl); list.appendChild(card);
      });
    }
    cb.addEventListener('change', draw);
    root.appendChild(lab); root.appendChild(status); root.appendChild(list);
    root.appendChild(el('p', 'cmp-note', 'Leitura do registro do atlas, como está na planilha. Leituras só são ligadas por código; o que está em texto livre não foi cruzado. Não é medida de qualidade científica, e a escolha da pergunta é sua.'));
    draw();
  }

  /* Scripts com defer rodam antes de DOMContentLoaded; aguardar garante que data.js já carregou (mesmo padrão do mesa.js). */
  if (document.readyState === 'complete') start(); else document.addEventListener('DOMContentLoaded', start);
})();
