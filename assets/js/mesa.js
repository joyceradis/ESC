/* Mesa de decisão — explorar as linhas de investigação e registrar a sua escolha.
   Os dados vêm de ESC.hypotheses (data.js). Nada é enviado: as marcações ficam só neste navegador.
   A mesa não ranqueia nem escolhe; a decisão é da autora. */
'use strict';
(function () {
  const KEY = 'esc-mesa-v1';
  const STATES = [
    ['explorar', 'Exploro'],
    ['duvida', 'Tenho dúvida'],
    ['depois', 'Deixo de lado por ora']
  ];
  const LABEL = Object.fromEntries(STATES.concat([['', 'Sem decisão']]));
  const MAX_COMPARE = 3;

  function titleOf(list, ref) {
    const hit = list.find(function (h) { return h.id === ref; });
    return hit ? hit.title : ref;
  }

  /* Mostra títulos legíveis, nunca códigos internos (HYP-000). */
  function readable(list, text) {
    return String(text || '').replace(/HYP-\d{3}/g, function (m) { return titleOf(list, m); });
  }

  function summary(list, marks) {
    const out = [];
    for (const [key, name] of STATES) {
      const rows = list.filter(function (h) { return (marks[h.id] || {}).state === key; });
      if (!rows.length) continue;
      out.push(name + ':');
      for (const h of rows) {
        const note = ((marks[h.id] || {}).note || '').trim();
        out.push('- ' + h.title + (note ? ' — ' + note : ''));
      }
      out.push('');
    }
    return out.length ? out.join('\n').trim() : 'Nenhuma linha marcada ainda.';
  }

  const api = { readable: readable, summary: summary, titleOf: titleOf, STATES: STATES };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  window.ESCMesa = api;

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(m) { try { localStorage.setItem(KEY, JSON.stringify(m)); return true; } catch (e) { return false; } }

  function start() {
    const root = document.getElementById('mesa-root');
    if (!root || !window.ESC || !ESC.hypotheses) return;
    const list = ESC.hypotheses;
    const marks = load();
    const compare = [];
    let filter = 'all', query = '';

    const status = el('p', 'mesa-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const bar = el('div', 'mesa-bar');
    const search = el('input'); search.type = 'search'; search.placeholder = 'Buscar por tema ou palavra…'; search.setAttribute('aria-label', 'Buscar linhas');
    const chips = el('div', 'mesa-chips'); chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Filtrar por sua marcação');
    const grid = el('div', 'mesa-grid');
    const cmp = el('div', 'mesa-compare'); cmp.setAttribute('aria-live', 'polite');
    const out = el('div', 'mesa-out');
    const copy = el('button', 'mesa-btn', 'Copiar minhas escolhas'); copy.type = 'button';
    const result = el('pre', 'mesa-text'); result.hidden = true;

    function persist() {
      status.textContent = save(marks) ? 'Salvo só neste navegador. Nada é enviado.' : 'Não foi possível salvar neste navegador; suas marcações valem só nesta visita.';
    }

    function drawChips() {
      chips.replaceChildren();
      [['all', 'Todas']].concat(STATES, [['none', 'Sem decisão']]).forEach(function (s) {
        const b = el('button', 'mesa-chip', s[1]); b.type = 'button'; b.setAttribute('aria-pressed', String(filter === s[0]));
        b.addEventListener('click', function () { filter = s[0]; drawChips(); drawGrid(); });
        chips.append(b);
      });
    }

    function visible(h) {
      const st = (marks[h.id] || {}).state || '';
      if (filter === 'none' && st) return false;
      if (filter !== 'all' && filter !== 'none' && st !== filter) return false;
      const hay = (h.title + ' ' + h.q + ' ' + h.kind).toLowerCase();
      return !query || hay.indexOf(query) !== -1;
    }

    function drawGrid() {
      grid.replaceChildren();
      const rows = list.filter(visible);
      if (!rows.length) grid.append(el('p', 'mesa-empty', 'Nenhuma linha com esse filtro.'));
      rows.forEach(function (h) {
        const m = marks[h.id] || {};
        const card = el('article', 'mesa-card' + (m.state ? ' is-' + m.state : ''));
        card.append(el('span', 'mesa-kind', h.kind), el('h3', '', h.title), el('p', 'mesa-q', h.q));
        const det = el('details'); det.append(el('summary', '', 'O que ainda não está demonstrado'), el('p', '', readable(list, h.sit)));
        card.append(det);
        const row = el('div', 'mesa-states'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', 'Sua marcação: ' + h.title);
        STATES.forEach(function (s) {
          const b = el('button', 'mesa-btn', s[1]); b.type = 'button'; b.setAttribute('aria-pressed', String(m.state === s[0]));
          b.addEventListener('click', function () {
            const cur = marks[h.id] || {};
            marks[h.id] = { state: cur.state === s[0] ? '' : s[0], note: cur.note || '' };
            persist(); drawGrid();
          });
          row.append(b);
        });
        card.append(row);
        const note = el('textarea'); note.rows = 2; note.value = m.note || ''; note.placeholder = 'Sua nota (opcional)'; note.setAttribute('aria-label', 'Nota sobre ' + h.title);
        note.addEventListener('change', function () { marks[h.id] = { state: (marks[h.id] || {}).state || '', note: note.value }; persist(); });
        card.append(note);
        const on = compare.indexOf(h.id) !== -1;
        const c = el('button', 'mesa-btn mesa-cmp', on ? 'Tirar da comparação' : 'Comparar'); c.type = 'button'; c.setAttribute('aria-pressed', String(on));
        c.addEventListener('click', function () {
          const i = compare.indexOf(h.id);
          if (i !== -1) compare.splice(i, 1);
          else if (compare.length < MAX_COMPARE) compare.push(h.id);
          else status.textContent = 'Compare até ' + MAX_COMPARE + ' linhas por vez.';
          drawGrid(); drawCompare();
        });
        card.append(c);
        grid.append(card);
      });
    }

    function drawCompare() {
      cmp.replaceChildren();
      if (!compare.length) { cmp.append(el('p', 'mesa-empty', 'Escolha até três linhas em “Comparar” para vê-las lado a lado.')); return; }
      const wrap = el('div', 'mesa-cols');
      compare.forEach(function (id) {
        const h = list.find(function (x) { return x.id === id; });
        const col = el('div', 'mesa-col'); col.append(el('h3', '', h.title));
        [['O que perguntamos', h.q], ['Em que modelo', h.model], ['O que preveria', h.pred], ['Explicação concorrente', readable(list, h.alt)], ['Ainda não demonstrado', readable(list, h.sit)], ['O que refutaria', h.refute]]
          .forEach(function (kv) { const d = el('div', 'mesa-row'); d.append(el('b', '', kv[0]), el('span', '', kv[1])); col.append(d); });
        wrap.append(col);
      });
      cmp.append(wrap);
    }

    search.addEventListener('input', function () { query = search.value.trim().toLowerCase(); drawGrid(); });
    copy.addEventListener('click', function () {
      const text = summary(list, marks);
      result.textContent = text; result.hidden = false;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { status.textContent = 'Copiado. Cole onde quiser registrar.'; }, function () { status.textContent = 'Selecione o texto abaixo e copie.'; });
      else status.textContent = 'Selecione o texto abaixo e copie.';
    });

    bar.append(search, chips);
    out.append(copy, result);
    root.replaceChildren(
      el('p', 'mesa-intro', 'Marque o que quiser explorar. Estas marcações são suas: a mesa não ordena nem escolhe por você, e nada aqui é resultado experimental.'),
      bar, status, grid, el('h3', 'mesa-sub', 'Comparar lado a lado'), cmp, out
    );
    drawChips(); drawGrid(); drawCompare();
  }

  /* Scripts com defer rodam antes de DOMContentLoaded; aguardar garante que data.js já carregou. */
  if (document.readyState === 'complete') start(); else document.addEventListener('DOMContentLoaded', start);
})();
