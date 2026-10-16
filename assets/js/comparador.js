/* Comparador de caminhos — pesar seus critérios e ver se a leitura é estável.
   Conta: nota ponderada = Σ(peso × nota) / (5 × Σ pesos dos critérios com nota), em %. Critério sem nota fica de fora, não vira zero.
   Limite: é uma leitura dos SEUS pesos e notas, não uma recomendação nem uma medida científica. Quem escolhe a pergunta é a autora.
   Nada é enviado: pesos e notas ficam só neste navegador (localStorage). */
'use strict';
(function () {
  const KEY = 'esc-comparador-v1';
  const MAX_PATHS = 4;
  const MAX_W = 5;
  const CRITERIA = [
    ['clinica', 'Relevância para a ICFEp', 'Se der certo, muda algo que importa para quem tem ICFEp?'],
    ['viavel', 'Cabe até a candidatura', 'Dá para formular e defender como piloto curto, sem depender de tudo ao mesmo tempo?'],
    ['evidencia', 'Evidência já no acervo', 'Há leituras confiáveis sustentando cada elo do caminho?'],
    ['lacuna', 'Lacuna não testada', 'O elo, ou a combinação deles, ainda não foi testado junto nas fontes?'],
    ['plataforma', 'Plataforma e parceria acessíveis', 'Existe modelo, laboratório ou grupo ao alcance para testar?'],
    ['alternativa', 'Resistência a explicações alternativas', 'Quanto mais difícil de explicar por mecanismos mais simples, maior a nota.']
  ];

  /* Pontos 0–100 de um caminho; null quando nenhum critério com peso recebeu nota. */
  function score(weights, ratings) {
    let num = 0, den = 0;
    for (const [id] of CRITERIA) {
      const w = weights[id] == null ? 0 : weights[id];
      const r = ratings ? ratings[id] : null;
      if (w > 0 && r != null) { num += w * r; den += w; }
    }
    return den ? (num / (MAX_W * den)) * 100 : null;
  }

  /* Parcela do peso total que já tem nota (0–1). */
  function coverage(weights, ratings) {
    let rated = 0, total = 0;
    for (const [id] of CRITERIA) {
      const w = weights[id] == null ? 0 : weights[id];
      total += w;
      if (w > 0 && ratings && ratings[id] != null) rated += w;
    }
    return total ? rated / total : 0;
  }

  /* Quem lidera com estes pesos. Empate (diferença < 0,05 ponto) ou nenhum caminho com nota → null. */
  function leader(ids, weights, ratingsBy) {
    const rows = ids.map(function (id) { return { id: id, s: score(weights, ratingsBy[id]) }; })
      .filter(function (r) { return r.s != null; })
      .sort(function (a, b) { return b.s - a.s; });
    if (!rows.length) return null;
    if (rows.length > 1 && rows[0].s - rows[1].s < 0.05) return null;
    return rows[0].id;
  }

  /* Critérios em que subir ou descer um ponto de peso troca quem lidera. Lista vazia = leitura estável. */
  function sensitivity(ids, weights, ratingsBy) {
    const base = leader(ids, weights, ratingsBy);
    const out = [];
    for (const [cid, label] of CRITERIA) {
      for (const delta of [-1, 1]) {
        const w0 = weights[cid] == null ? 0 : weights[cid];
        const w1 = Math.min(MAX_W, Math.max(0, w0 + delta));
        if (w1 === w0) continue;
        const alt = leader(ids, Object.assign({}, weights, { [cid]: w1 }), ratingsBy);
        if (alt !== base) out.push({ id: cid, label: label, delta: delta, to: alt });
      }
    }
    return out;
  }

  /* Diferença em pontos entre o 1º e o 2º, ou null se houver menos de dois caminhos com nota. */
  function margin(ids, weights, ratingsBy) {
    const s = ids.map(function (id) { return score(weights, ratingsBy[id]); })
      .filter(function (v) { return v != null; }).sort(function (a, b) { return b - a; });
    return s.length > 1 ? s[0] - s[1] : null;
  }

  function summary(names, ids, weights, ratingsBy) {
    const lines = ['Pesos: ' + CRITERIA.map(function (c) { return c[1] + ' ' + (weights[c[0]] == null ? 0 : weights[c[0]]); }).join('; ')];
    for (const id of ids) {
      const s = score(weights, ratingsBy[id]);
      lines.push('- ' + (names[id] || id) + ': ' + (s == null ? 'sem notas' : Math.round(s) + ' pontos (' + Math.round(coverage(weights, ratingsBy[id]) * 100) + '% dos pesos com nota)'));
    }
    const sens = sensitivity(ids, weights, ratingsBy);
    lines.push(sens.length ? 'A leitura muda ao mexer em: ' + Array.from(new Set(sens.map(function (x) { return x.label; }))).join(', ') + '.' : 'A leitura não muda com ±1 em nenhum peso.');
    lines.push('Leitura dos meus pesos e notas, não uma decisão.');
    return lines.join('\n');
  }

  const api = { CRITERIA: CRITERIA, MAX_PATHS: MAX_PATHS, score: score, coverage: coverage, leader: leader, sensitivity: sensitivity, margin: margin, summary: summary };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  window.ESCComparador = api;

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* sem armazenamento: segue só na tela */ } }

  function start() {
    const root = document.getElementById('comparador-root');
    if (!root) return;
    const paths = [
      { id: 'A', title: 'Recorte A · Piloto endotelial' },
      { id: 'B', title: 'Recorte B · Ponte completa' },
      { id: 'C', title: 'Recorte C · Descarga mecânica → titina' }
    ].concat(((window.ESC && ESC.hypotheses) || []).map(function (h) { return { id: h.id, title: 'Linha · ' + h.title }; }));
    const names = {}; paths.forEach(function (p) { names[p.id] = p.title; });

    const saved = load();
    const state = {
      weights: Object.assign({}, saved.weights),
      ratings: saved.ratings || {},
      chosen: (saved.chosen || ['A', 'B', 'C']).filter(function (id) { return names[id]; }).slice(0, MAX_PATHS)
    };
    CRITERIA.forEach(function (c) { if (state.weights[c[0]] == null) state.weights[c[0]] = 3; });
    const persist = function () { save(state); };

    const status = el('p', 'mesa-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const pick = el('fieldset', 'cmp-pick'); pick.appendChild(el('legend', null, 'Caminhos a comparar (até ' + MAX_PATHS + ')'));
    const pickList = el('div', 'mesa-chips');
    const weightsBox = el('div', 'cmp-weights');
    const grid = el('div', 'cmp-grid');
    const out = el('div', 'cmp-out');
    const copy = el('button', 'mesa-btn', 'Copiar leitura'); copy.type = 'button';
    const text = el('pre', 'mesa-text'); text.hidden = true;

    paths.forEach(function (p) {
      const lab = el('label', 'mesa-chip');
      const cb = el('input'); cb.type = 'checkbox'; cb.checked = state.chosen.indexOf(p.id) >= 0;
      cb.addEventListener('change', function () {
        if (cb.checked) {
          if (state.chosen.length >= MAX_PATHS) { cb.checked = false; status.textContent = 'No máximo ' + MAX_PATHS + ' caminhos de cada vez. Desmarque um para incluir outro.'; return; }
          state.chosen.push(p.id);
        } else state.chosen = state.chosen.filter(function (id) { return id !== p.id; });
        status.textContent = ''; persist(); drawGrid(); drawOut();
      });
      lab.appendChild(cb); lab.appendChild(document.createTextNode(' ' + p.title));
      pickList.appendChild(lab);
    });
    pick.appendChild(pickList);

    CRITERIA.forEach(function (c) {
      const row = el('div', 'cmp-weight');
      const lab = el('label', null, c[1]); lab.htmlFor = 'cmp-w-' + c[0];
      const rng = el('input'); rng.type = 'range'; rng.min = 0; rng.max = MAX_W; rng.step = 1; rng.id = 'cmp-w-' + c[0]; rng.value = state.weights[c[0]];
      const val = el('output', 'cmp-val', String(rng.value)); val.htmlFor = rng.id;
      rng.setAttribute('aria-describedby', 'cmp-h-' + c[0]);
      const hint = el('small', 'cmp-note', c[2] + ' Peso 0 = ignorar este critério.'); hint.id = 'cmp-h-' + c[0];
      rng.addEventListener('input', function () { state.weights[c[0]] = Number(rng.value); val.textContent = rng.value; persist(); drawOut(); });
      row.appendChild(lab); row.appendChild(rng); row.appendChild(val); row.appendChild(hint);
      weightsBox.appendChild(row);
    });

    function drawGrid() {
      grid.textContent = '';
      if (!state.chosen.length) { grid.appendChild(el('p', 'mesa-empty', 'Marque ao menos um caminho acima.')); return; }
      CRITERIA.forEach(function (c) {
        const block = el('div', 'cmp-crit');
        block.appendChild(el('h4', null, c[1]));
        const sels = el('div', 'cmp-sels');
        state.chosen.forEach(function (pid) {
          const lab = el('label', 'cmp-sel'); lab.appendChild(el('span', null, names[pid]));
          const sel = el('select'); sel.setAttribute('aria-label', 'Nota de ' + c[1] + ' para ' + names[pid]);
          const none = el('option', null, 'sem nota'); none.value = ''; sel.appendChild(none);
          for (let n = 1; n <= MAX_W; n++) { const o = el('option', null, String(n)); o.value = String(n); sel.appendChild(o); }
          const cur = (state.ratings[pid] || {})[c[0]];
          sel.value = cur == null ? '' : String(cur);
          sel.addEventListener('change', function () {
            state.ratings[pid] = state.ratings[pid] || {};
            state.ratings[pid][c[0]] = sel.value === '' ? null : Number(sel.value);
            persist(); drawOut();
          });
          lab.appendChild(sel); sels.appendChild(lab);
        });
        block.appendChild(sels); grid.appendChild(block);
      });
    }

    function drawOut() {
      out.textContent = '';
      const ids = state.chosen;
      if (!ids.length) return;
      ids.forEach(function (pid) {
        const s = score(state.weights, state.ratings[pid]);
        const cov = Math.round(coverage(state.weights, state.ratings[pid]) * 100);
        const row = el('div', 'cmp-bar-row');
        row.appendChild(el('span', 'cmp-bar-name', names[pid]));
        const track = el('div', 'cmp-track'); track.setAttribute('role', 'img');
        track.setAttribute('aria-label', names[pid] + ': ' + (s == null ? 'sem notas' : Math.round(s) + ' pontos de 100'));
        const fill = el('div', 'cmp-fill'); fill.style.width = (s == null ? 0 : Math.round(s)) + '%'; track.appendChild(fill);
        row.appendChild(track);
        row.appendChild(el('span', 'cmp-bar-val', s == null ? 'sem notas' : Math.round(s) + ' pts · ' + cov + '% dos pesos com nota'));
        out.appendChild(row);
      });
      const lead = leader(ids, state.weights, state.ratings), m = margin(ids, state.weights, state.ratings);
      const sens = sensitivity(ids, state.weights, state.ratings);
      let msg;
      if (ids.length < 2) msg = 'Marque ao menos dois caminhos para comparar.';
      else if (!lead) msg = 'Sem líder claro com estes pesos e notas (empate ou notas faltando).';
      else msg = 'Com os seus pesos, "' + names[lead] + '" pontua mais' + (m != null && m < 5 ? ', mas por pouco (' + m.toFixed(1).replace('.', ',') + ' pontos).' : '.');
      out.appendChild(el('p', 'cmp-lead', msg));
      if (ids.length > 1 && lead) {
        const labels = Array.from(new Set(sens.map(function (x) { return x.label; })));
        out.appendChild(el('p', 'cmp-note', labels.length
          ? 'Atenção: a leitura troca se você mexer um ponto no peso de: ' + labels.join('; ') + '. Vale decidir esses pesos com cuidado.'
          : 'A leitura não muda com ±1 em nenhum peso.'));
      }
      out.appendChild(el('p', 'cmp-note', 'É uma leitura dos seus critérios, não uma recomendação nem um dado científico. Notas são suas, de 1 (pouco) a 5 (muito); você escolhe a pergunta.'));
    }

    copy.addEventListener('click', function () {
      text.textContent = summary(names, state.chosen, state.weights, state.ratings); text.hidden = false;
      try { navigator.clipboard.writeText(text.textContent).then(function () { status.textContent = 'Leitura copiada.'; }, function () { status.textContent = 'Copie o texto abaixo.'; }); } catch (e) { status.textContent = 'Copie o texto abaixo.'; }
    });

    root.appendChild(pick); root.appendChild(el('h3', 'cmp-h', 'Quanto pesa cada critério para você')); root.appendChild(weightsBox);
    root.appendChild(el('h3', 'cmp-h', 'Notas por caminho')); root.appendChild(grid);
    root.appendChild(el('h3', 'cmp-h', 'Leitura')); root.appendChild(out);
    root.appendChild(copy); root.appendChild(text); root.appendChild(status);
    drawGrid(); drawOut();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
