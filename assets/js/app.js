/* ESC 2027 · Atlas de pesquisa — comportamento compartilhado. Sem dependências, funciona via file:// e GitHub Pages. */
'use strict';
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('pt-BR');
  function link(href, text, cls) { const a = el('a', cls, text); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; }

  /* Contagem regressiva até o prazo da ESC */
  function countdown() {
    if (ESC.project && ESC.project.application && ESC.project.application.status === 'submitted') {
      $('[data-countdown]').forEach(e => e.textContent = 'Enviada');
      $('[data-countdown-label]').forEach(e => e.textContent = 'Resultado previsto · dez/2026');
      $('.nav a, .mobile-nav a').forEach(e => { if (e.textContent.includes('Plano até 23/10')) e.innerHTML = e.innerHTML.replace('Plano até 23/10','Acompanhamento'); });
      const sf = $('.sidefoot'); if (sf && sf.firstChild && sf.firstChild.nodeType === 3) sf.firstChild.textContent = 'Candidatura conferida em 22/10/2026.';
      return;
    }
    /* Diferença em dias do calendário (fuso de Brasília), não em blocos de 24 h: ao meio-dia de 23/10 ainda é “hoje”. */
    const day = function (t) { return Date.parse(new Date(t).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }) + 'T00:00:00Z'); };
    const d = Math.round((day(ESC.meta.deadline) - day(new Date())) / 864e5);
    const P = ESC.project || { deadlineLong: 'sex 23/10/2026' };
    let n, l;
    if (d > 1) { n = d + ' dias'; l = 'até o prazo · ' + P.deadlineLong; }
    else if (d === 1) { n = 'Amanhã'; l = 'prazo · ' + P.deadlineLong; }
    else if (d === 0) { n = 'Hoje'; l = 'último dia da candidatura'; }
    else { n = 'Encerrado'; l = 'prazo era ' + P.deadlineLong.replace(/^\S+ /, ''); }
    $$('[data-countdown]').forEach(e => e.textContent = n);
    $$('[data-countdown-label]').forEach(e => e.textContent = l);
  }

  /* Biblioteca */
  function library() {
    const list = $('#libraryList'); if (!list) return;
    const search = $('#search'), area = $('#category'), meta = $('#resultsMeta');
    let filter = 'all';
    const labels = { estudado: ['Já li', 'done'], novo: ['Por ler · recente', 'new'], pendente: ['Ainda vou ler', ''], verificar: ['Conferir dados', 'verify'] };
    const counts = { all: ESC.readings.length };
    ESC.readings.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; if (/alt[ií]ssima/i.test(r.pri)) counts.top = (counts.top || 0) + 1; });
    $$('[data-filter]').forEach(b => { const k = b.dataset.filter; if (counts[k] != null) b.textContent = b.dataset.label + ' · ' + counts[k]; });
    function draw() {
      const q = norm(search.value.trim()), c = area.value;
      const rows = ESC.readings.filter(r => {
        const okS = filter === 'all' || (filter === 'top' ? /alt[ií]ssima/i.test(r.pri) : r.status === filter);
        return okS && (c === 'all' || r.area === c) && (!q || norm([r.id, r.authors, r.year, r.title, r.eixo, r.area, r.ask, r.ref, r.doi].join(' ')).includes(q));
      });
      meta.textContent = 'Mostrando ' + rows.length + ' de ' + ESC.readings.length + ' artigos e leituras sugeridas.';
      list.replaceChildren();
      if (!rows.length) { list.append(el('div', 'empty', 'Nenhuma leitura corresponde. Limpe a busca ou os filtros.')); return; }
      for (const r of rows) {
        const art = el('article', 'reading');
        art.append(el('div', 'rid', r.id));
        const body = el('div', 'rbody'), top = el('div', 'rtop');
        top.append(el('span', 'authors', r.authors + ' · ' + r.year));
        const [lab, cls] = labels[r.status] || ['', ''];
        top.append(el('span', 'pill ' + cls, lab));
        if (/alt[ií]ssima/i.test(r.pri)) top.append(el('span', 'pill pri', 'Ler primeiro'));
        body.append(top, el('h3', '', r.title));
        body.append(el('div', 'metadata', [r.area, r.type].filter(Boolean).join(' · ')));
        if (r.ask) body.append(el('div', 'ask', 'O que observar: ' + r.ask));
        const technical = el('details', 'reading-details');
        technical.append(el('summary', '', 'Detalhes e códigos do artigo'));
        const techText = [r.eixo ? 'Assunto específico: ' + r.eixo : '', r.doi ? 'DOI: ' + r.doi : ''].filter(Boolean).join(' · ');
        if (techText) technical.append(el('div', 'metadata', techText));
        if (r.note) technical.append(el('div', 'note', r.note));
        body.append(technical);
        art.append(body);
        const links = el('div', 'links');
        const a = link(r.url, 'Abrir artigo ↗', 'out'); a.setAttribute('aria-label', 'Abrir ' + r.id + ': ' + r.title); links.append(a);
        if (r.pdf) { const p = link(r.pdf, 'PDF no Drive ↗', 'out'); p.setAttribute('aria-label', 'PDF de ' + r.id + ' no Drive'); links.append(p); }
        art.append(links); list.append(art);
      }
    }
    search.addEventListener('input', draw); area.addEventListener('change', draw);
    $$('[data-filter]').forEach(b => b.addEventListener('click', () => { filter = b.dataset.filter; $$('[data-filter]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw(); }));
    draw();
  }

  /* Linhas de investigação */
  function hypotheses() {
    const box = $('#hypotheses'); if (!box) return;
    for (const h of ESC.hypotheses) {
      const d = el('details', 'hyp');
      const s = el('summary'), left = el('span', 'left');
      left.append(el('b', '', h.kind), el('strong', '', h.title));
      s.append(left, el('span', 'more', '+'));
      d.append(s, el('p', '', h.q));
      const g = el('div', 'grid2');
      [['Modelo / exposição', h.model], ['Predição testável', h.pred], ['Explicação alternativa', h.alt], ['Situação científica', h.sit], ['Evidência direta', h.ev], ['Como refutar / testar', h.refute], ['Prioridade · estado', h.pri + ' · ' + h.state], ['Origem', h.source === 'draft' ? 'Rascunho RAS-001' : 'Mapa de hipóteses MAP-001']]
        .forEach(([k, v]) => { const c = el('div'); c.append(el('b', '', k), document.createTextNode(v)); g.append(c); });
      d.append(g); box.append(d);
    }
  }

  /* Vocabulário */
  function vocab() {
    const box = $('#vocab'); if (!box) return;
    for (const v of ESC.vocab) {
      const c = el('article', 'vcard');
      const m = el('div', 'meta'); m.append(el('span', '', v.id), el('span', '', v.state));
      c.append(m, el('div', 'an', '“' + v.analogy + '”'), el('h3', '', v.term), el('p', '', v.def), el('p', '', 'Papel: ' + v.role), el('div', 'no', 'Não confundir com: ' + v.not));
      box.append(c);
    }
  }

  /* Decisões */
  function decisions() {
    const tb = $('#decisions tbody'); if (!tb) return;
    for (const [id, dt, sub, dec] of ESC.decisions) {
      const tr = el('tr'); const a = el('td'); a.append(el('b', '', id));
      tr.append(a, el('td', '', dt), el('td', '', sub), el('td', '', dec)); tb.append(tr);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    try { countdown(); } catch (e) {}
    try { const cur = document.querySelector('.mobile-nav [aria-current]'); if (cur) cur.scrollIntoView({ inline: 'center', block: 'nearest' }); } catch (e) {}
    library(); hypotheses(); vocab(); decisions();
  });
})();
