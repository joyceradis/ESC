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
  function score(weights, ratings, criteria) {
    let num = 0, den = 0;
    for (const [id] of (criteria || CRITERIA)) {
      const w = weights[id] == null ? 0 : weights[id];
      const r = ratings ? ratings[id] : null;
      if (w > 0 && r != null) { num += w * r; den += w; }
    }
    return den ? (num / (MAX_W * den)) * 100 : null;
  }

  /* Parcela do peso total que já tem nota (0–1). */
  function coverage(weights, ratings, criteria) {
    let rated = 0, total = 0;
    for (const [id] of (criteria || CRITERIA)) {
      const w = weights[id] == null ? 0 : weights[id];
      total += w;
      if (w > 0 && ratings && ratings[id] != null) rated += w;
    }
    return total ? rated / total : 0;
  }

  /* Quem lidera com estes pesos. Empate (diferença < 0,05 ponto) ou nenhum caminho com nota → null. */
  function leader(ids, weights, ratingsBy, criteria) {
    const rows = ids.map(function (id) { return { id: id, s: score(weights, ratingsBy[id], criteria) }; })
      .filter(function (r) { return r.s != null; })
      .sort(function (a, b) { return b.s - a.s; });
    if (!rows.length) return null;
    if (rows.length > 1 && rows[0].s - rows[1].s < 0.05) return null;
    return rows[0].id;
  }

  /* Critérios em que subir ou descer um ponto de peso troca quem lidera. Lista vazia = leitura estável. */
  function sensitivity(ids, weights, ratingsBy, criteria) {
    const base = leader(ids, weights, ratingsBy, criteria);
    const out = [];
    for (const [cid, label] of (criteria || CRITERIA)) {
      for (const delta of [-1, 1]) {
        const w0 = weights[cid] == null ? 0 : weights[cid];
        const w1 = Math.min(MAX_W, Math.max(0, w0 + delta));
        if (w1 === w0) continue;
        const alt = leader(ids, Object.assign({}, weights, { [cid]: w1 }), ratingsBy, criteria);
        if (alt !== base) out.push({ id: cid, label: label, delta: delta, to: alt });
      }
    }
    return out;
  }

  /* Diferença em pontos entre o 1º e o 2º, ou null se houver menos de dois caminhos com nota. */
  function margin(ids, weights, ratingsBy, criteria) {
    const s = ids.map(function (id) { return score(weights, ratingsBy[id], criteria); })
      .filter(function (v) { return v != null; }).sort(function (a, b) { return b - a; });
    return s.length > 1 ? s[0] - s[1] : null;
  }

  /* Tudo que a leitura mostra, num só lugar (usado pelo painel fixo e pelo bloco "Leitura"). Não recomenda: só descreve pesos e notas. */
  function reading(names, ids, weights, ratingsBy, criteria) {
    const rows = ids.map(function (id) {
      const s = score(weights, ratingsBy[id], criteria);
      return { id: id, name: names[id] || id, score: s, coverage: coverage(weights, ratingsBy[id], criteria) };
    });
    const lead = leader(ids, weights, ratingsBy, criteria), m = margin(ids, weights, ratingsBy, criteria);
    const unstable = ids.length > 1 && lead
      ? Array.from(new Set(sensitivity(ids, weights, ratingsBy, criteria).map(function (x) { return x.label; }))) : [];
    let message;
    if (ids.length < 2) message = 'Marque ao menos dois caminhos para comparar.';
    else if (!lead) message = 'Sem líder claro com estes pesos e notas (empate ou notas faltando).';
    else message = 'Com os seus pesos, "' + (names[lead] || lead) + '" pontua mais' + (m != null && m < 5 ? ', mas por pouco (' + m.toFixed(1).replace('.', ',') + ' pontos).' : '.');
    return { rows: rows, lead: lead, margin: m, tight: m != null && m < 5, unstable: unstable, stable: ids.length > 1 && !!lead && !unstable.length, message: message };
  }

  /* Critérios em uso: os 6 padrão (com os nomes que você trocou, sem os que você tirou) + os que você criou. */
  const MAX_CUSTOM = 4, MAX_LABEL = 60, MAX_NOTE = 400;
  function cleanText(v, max) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max); }
  function buildCriteria(custom, renamed, removed) {
    const gone = removed || [], ren = renamed || {};
    const base = CRITERIA.filter(function (c) { return gone.indexOf(c[0]) < 0; })
      .map(function (c) { return [c[0], cleanText(ren[c[0]], MAX_LABEL) || c[1], c[2]]; });
    const mine = (custom || []).filter(function (c) { return c && c.id && cleanText(c.label, MAX_LABEL); })
      .slice(0, MAX_CUSTOM).map(function (c) { return [c.id, cleanText(c.label, MAX_LABEL), 'Critério seu. Diga o que significa nota alta.']; });
    return base.concat(mine);
  }

  /* Id novo que nunca reaproveita um critério removido: pesos e notas antigos ficam guardados e não podem ser herdados. */
  function nextCustomId(custom, weights, ratingsBy) {
    const used = {};
    (custom || []).forEach(function (c) { if (c && c.id) used[c.id] = true; });
    Object.keys(weights || {}).forEach(function (k) { used[k] = true; });
    Object.keys(ratingsBy || {}).forEach(function (p) { Object.keys(ratingsBy[p] || {}).forEach(function (k) { used[k] = true; }); });
    let n = 1; while (used['c' + n]) n++;
    return 'c' + n;
  }

  function summary(names, ids, weights, ratingsBy, criteria, notes) {
    const crit = criteria || CRITERIA;
    const lines = ['Pesos: ' + crit.map(function (c) { return c[1] + ' ' + (weights[c[0]] == null ? 0 : weights[c[0]]); }).join('; ')];
    for (const id of ids) {
      const s = score(weights, ratingsBy[id], crit);
      lines.push('- ' + (names[id] || id) + ': ' + (s == null ? 'sem notas' : Math.round(s) + ' pontos (' + Math.round(coverage(weights, ratingsBy[id], crit) * 100) + '% dos pesos com nota)'));
      const n = notes && cleanText(notes[id], MAX_NOTE);
      if (n) lines.push('  O que me faria mudar de ideia: ' + n);
    }
    const sens = sensitivity(ids, weights, ratingsBy, crit);
    lines.push(sens.length ? 'A leitura muda ao mexer em: ' + Array.from(new Set(sens.map(function (x) { return x.label; }))).join(', ') + '.' : 'A leitura não muda com ±1 em nenhum peso.');
    lines.push('Leitura dos meus pesos e notas, não uma decisão.');
    return lines.join('\n');
  }

  const api = { CRITERIA: CRITERIA, MAX_PATHS: MAX_PATHS, score: score, coverage: coverage, leader: leader, sensitivity: sensitivity, margin: margin, reading: reading, summary: summary, buildCriteria: buildCriteria, nextCustomId: nextCustomId, cleanText: cleanText, MAX_CUSTOM: MAX_CUSTOM, MAX_LABEL: MAX_LABEL, MAX_NOTE: MAX_NOTE };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  window.ESCComparador = api;

  /* Nome curto para o painel fixo: "Recorte A" ou o título da linha. */
  function shortName(n) { const p = String(n).split(' · '); return p[0] === 'Linha' ? p.slice(1).join(' · ') : p[0]; }
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
      chosen: (saved.chosen || ['A', 'B', 'C']).filter(function (id) { return names[id]; }).slice(0, MAX_PATHS),
      custom: Array.isArray(saved.custom) ? saved.custom.slice(0, MAX_CUSTOM) : [],
      renamed: Object.assign({}, saved.renamed),
      removed: Array.isArray(saved.removed) ? saved.removed : [],
      notes: Object.assign({}, saved.notes)
    };
    let criteria = [];
    function rebuild() {
      criteria = buildCriteria(state.custom, state.renamed, state.removed);
      criteria.forEach(function (c) { if (state.weights[c[0]] == null) state.weights[c[0]] = 3; });
    }
    rebuild();
    const persist = function () { save(state); };
    const refutes = {}; (((window.ESC && ESC.hypotheses) || [])).forEach(function (h) { if (h.refute) refutes[h.id] = h.refute; });

    const status = el('p', 'mesa-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const pick = el('fieldset', 'cmp-pick'); pick.appendChild(el('legend', null, 'Caminhos a comparar (até ' + MAX_PATHS + ')'));
    const pickList = el('div', 'mesa-chips');
    const weightsBox = el('div', 'cmp-weights');
    const grid = el('div', 'cmp-grid');
    const out = el('div', 'cmp-out');
    const live = el('div', 'cmp-live'); live.setAttribute('role', 'group'); live.setAttribute('aria-label', 'Leitura ao vivo dos seus pesos e notas'); live.hidden = true;
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
        status.textContent = ''; persist(); drawGrid(); drawNotes(); drawOut();
      });
      lab.appendChild(cb); lab.appendChild(document.createTextNode(' ' + p.title));
      pickList.appendChild(lab);
    });
    pick.appendChild(pickList);

    function drawWeights() {
      weightsBox.textContent = '';
      if (!criteria.length) { weightsBox.appendChild(el('p', 'mesa-empty', 'Sem critérios. Restaure o padrão ou adicione um critério seu.')); return; }
      criteria.forEach(function (c) {
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
    }

    /* Editor de critérios: renomear, remover (reversível), restaurar e criar. Notas já dadas ficam guardadas. */
    const editor = el('details', 'cmp-editor');
    editor.appendChild(el('summary', null, 'Editar critérios (renomear, remover, criar o seu)'));
    const edList = el('div', 'cmp-ed-list');
    const edAdd = el('form', 'cmp-ed-add');
    const addIn = el('input'); addIn.type = 'text'; addIn.maxLength = MAX_LABEL; addIn.id = 'cmp-add'; addIn.placeholder = 'ex.: risco ético';
    const addLab = el('label', null, 'Novo critério'); addLab.htmlFor = 'cmp-add';
    const addBtn = el('button', 'mesa-btn', 'Adicionar'); addBtn.type = 'submit';
    edAdd.appendChild(addLab); edAdd.appendChild(addIn); edAdd.appendChild(addBtn);
    const edStatus = el('p', 'cmp-note'); edStatus.setAttribute('role', 'status'); edStatus.setAttribute('aria-live', 'polite');
    editor.appendChild(edList); editor.appendChild(edAdd); editor.appendChild(edStatus);

    function refreshAll() { rebuild(); persist(); drawEditor(); drawWeights(); drawGrid(); drawOut(); }
    function drawEditor() {
      edList.textContent = '';
      criteria.forEach(function (c) {
        const row = el('div', 'cmp-ed-row');
        const inp = el('input'); inp.type = 'text'; inp.maxLength = MAX_LABEL; inp.value = c[1]; inp.setAttribute('aria-label', 'Nome do critério ' + c[1]);
        inp.addEventListener('change', function () {
          const v = cleanText(inp.value, MAX_LABEL);
          const mine = state.custom.filter(function (x) { return x.id === c[0]; })[0];
          if (!v) { inp.value = c[1]; edStatus.textContent = 'O nome não pode ficar vazio.'; return; }
          if (mine) mine.label = v; else state.renamed[c[0]] = v;
          edStatus.textContent = 'Critério renomeado.'; refreshAll();
        });
        const del = el('button', 'cmp-ed-del', 'Remover'); del.type = 'button'; del.setAttribute('aria-label', 'Remover o critério ' + c[1]);
        del.addEventListener('click', function () {
          if (criteria.length <= 1) { edStatus.textContent = 'Mantenha ao menos um critério.'; return; }
          const at = criteria.indexOf(c);
          if (state.custom.some(function (x) { return x.id === c[0]; })) state.custom = state.custom.filter(function (x) { return x.id !== c[0]; });
          else state.removed = state.removed.concat([c[0]]);
          edStatus.textContent = 'Critério "' + c[1] + '" removido. Suas notas ficam guardadas.'; refreshAll();
          /* a lista é redesenhada: devolver o foco ao vizinho para o teclado não voltar ao topo da página */
          const dels = edList.querySelectorAll('.cmp-ed-del');
          (dels.length ? dels[Math.min(at, dels.length - 1)] : addIn).focus();
        });
        row.appendChild(inp); row.appendChild(del); edList.appendChild(row);
      });
      const gone = CRITERIA.filter(function (c) { return state.removed.indexOf(c[0]) >= 0; });
      if (gone.length) {
        const back = el('button', 'mesa-btn', 'Restaurar padrão (' + gone.length + ')'); back.type = 'button';
        back.addEventListener('click', function () { state.removed = []; edStatus.textContent = 'Critérios padrão restaurados.'; refreshAll(); });
        edList.appendChild(back);
      }
      addBtn.disabled = state.custom.length >= MAX_CUSTOM;
    }
    edAdd.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const v = cleanText(addIn.value, MAX_LABEL);
      if (!v) { edStatus.textContent = 'Escreva o nome do critério.'; return; }
      if (state.custom.length >= MAX_CUSTOM) { edStatus.textContent = 'No máximo ' + MAX_CUSTOM + ' critérios seus.'; return; }
      state.custom.push({ id: nextCustomId(state.custom, state.weights, state.ratings), label: v }); addIn.value = '';
      edStatus.textContent = 'Critério "' + v + '" adicionado com peso 3. Dê notas na seção abaixo.'; refreshAll();
    });

    /* "O que me faria mudar de ideia": nota livre por caminho, só neste navegador. */
    const changeBox = el('div', 'cmp-change');
    function drawNotes() {
      changeBox.textContent = '';
      state.chosen.forEach(function (pid) {
        const wrap = el('div', 'cmp-change-item');
        const id = 'cmp-n-' + String(pid).replace(/[^A-Za-z0-9]/g, '');
        const lab = el('label', null, names[pid]); lab.htmlFor = id;
        const ta = el('textarea'); ta.id = id; ta.rows = 3; ta.maxLength = MAX_NOTE; ta.value = state.notes[pid] || '';
        ta.placeholder = 'Que resultado, dado ou limite me faria abandonar este caminho?';
        const cnt = el('small', 'cmp-note', ta.value.length + '/' + MAX_NOTE);
        ta.addEventListener('input', function () { state.notes[pid] = ta.value; cnt.textContent = ta.value.length + '/' + MAX_NOTE; persist(); });
        wrap.appendChild(lab);
        if (refutes[pid]) wrap.appendChild(el('small', 'cmp-hint', 'Teste de refutação já registrado no mapa: ' + refutes[pid]));
        wrap.appendChild(ta); wrap.appendChild(cnt); changeBox.appendChild(wrap);
      });
      if (!state.chosen.length) changeBox.appendChild(el('p', 'mesa-empty', 'Marque um caminho para registrar o que o faria mudar de ideia.'));
    }

    function drawGrid() {
      grid.textContent = '';
      if (!state.chosen.length) { grid.appendChild(el('p', 'mesa-empty', 'Marque ao menos um caminho acima.')); return; }
      criteria.forEach(function (c) {
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
      if (!ids.length) { drawLive(); return; }
      ids.forEach(function (pid) {
        const s = score(state.weights, state.ratings[pid], criteria);
        const cov = Math.round(coverage(state.weights, state.ratings[pid], criteria) * 100);
        const row = el('div', 'cmp-bar-row');
        row.appendChild(el('span', 'cmp-bar-name', names[pid]));
        const track = el('div', 'cmp-track'); track.setAttribute('role', 'img');
        track.setAttribute('aria-label', names[pid] + ': ' + (s == null ? 'sem notas' : Math.round(s) + ' pontos de 100'));
        const fill = el('div', 'cmp-fill'); fill.style.width = (s == null ? 0 : Math.round(s)) + '%'; track.appendChild(fill);
        row.appendChild(track);
        row.appendChild(el('span', 'cmp-bar-val', s == null ? 'sem notas' : Math.round(s) + ' pts · ' + cov + '% dos pesos com nota'));
        out.appendChild(row);
      });
      const r = reading(names, ids, state.weights, state.ratings, criteria);
      out.appendChild(el('p', 'cmp-lead', r.message));
      if (ids.length > 1 && r.lead) {
        out.appendChild(el('p', 'cmp-note', r.unstable.length
          ? 'Atenção: a leitura troca se você mexer um ponto no peso de: ' + r.unstable.join('; ') + '. Vale decidir esses pesos com cuidado.'
          : 'A leitura não muda com ±1 em nenhum peso.'));
      }
      out.appendChild(el('p', 'cmp-note', 'É uma leitura dos seus critérios, não uma recomendação nem um dado científico. Notas são suas, de 1 (pouco) a 5 (muito); você escolhe a pergunta.'));
      drawLive();
    }


    /* Painel fixo: mostra o efeito de cada peso ou nota sem precisar rolar até a "Leitura". */
    function drawLive() {
      live.textContent = '';
      const ids = state.chosen;
      if (!ids.length) { live.hidden = true; return; }
      live.hidden = false;
      const r = reading(names, ids, state.weights, state.ratings, criteria);
      live.appendChild(el('span', 'cmp-live-k', 'Leitura ao vivo'));
      const list = el('div', 'cmp-live-rows');
      r.rows.forEach(function (x) {
        const it = el('span', 'cmp-live-item' + (x.id === r.lead ? ' is-lead' : ''));
        it.appendChild(el('span', 'cmp-live-name', shortName(x.name)));
        it.appendChild(el('strong', 'cmp-live-val', x.score == null ? 'sem notas' : Math.round(x.score) + ' pts'));
        list.appendChild(it);
      });
      live.appendChild(list);
      live.appendChild(el('span', 'cmp-live-msg', r.stable ? 'Estável com ±1 nos pesos.' : r.unstable.length ? 'Troca se mexer em: ' + r.unstable.join('; ') + '.' : r.message));
    }

    copy.addEventListener('click', function () {
      text.textContent = summary(names, state.chosen, state.weights, state.ratings, criteria, state.notes); text.hidden = false;
      try { navigator.clipboard.writeText(text.textContent).then(function () { status.textContent = 'Leitura copiada.'; }, function () { status.textContent = 'Copie o texto abaixo.'; }); } catch (e) { status.textContent = 'Copie o texto abaixo.'; }
    });

    root.appendChild(pick); root.appendChild(live); root.appendChild(el('h3', 'cmp-h', 'Quanto pesa cada critério para você')); root.appendChild(weightsBox); root.appendChild(editor);
    root.appendChild(el('h3', 'cmp-h', 'Notas por caminho')); root.appendChild(grid);
    root.appendChild(el('h3', 'cmp-h', 'O que me faria mudar de ideia')); root.appendChild(changeBox);
    root.appendChild(el('h3', 'cmp-h', 'Leitura')); root.appendChild(out);
    root.appendChild(copy); root.appendChild(text); root.appendChild(status);
    drawEditor(); drawWeights(); drawGrid(); drawNotes(); drawOut();
  }

  /* Scripts com defer rodam antes de DOMContentLoaded; aguardar garante que data.js já carregou (mesmo padrão do mesa.js). */
  if (document.readyState === 'complete') start(); else document.addEventListener('DOMContentLoaded', start);
})();
