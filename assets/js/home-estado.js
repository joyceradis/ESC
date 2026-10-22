/* Painel "Seu estado" da home — resume, a partir do que a autora já salvou neste navegador,
   quantos passos da rota foram dados, qual é o próximo, se a pergunta foi escrita e quantas pendências restam.
   Só reflete o que foi marcado: não escolhe pergunta, não recomenda caminho e não marca nada como decidido. */
'use strict';
(function () {
  const PEND = ['pergunta', 'estrategias', 'paralelas', 'textos', 'leituras'];

  /* Recorte decidido pela autora, lido de ESC.project (data.js). Sem ESC (testes em node) segue como não decidido. */
  function decided() {
    const P = (typeof ESC !== 'undefined' && ESC.project) || null;
    return P && P.decision && P.decision.status === 'decidido' ? P.decision : null;
  }

  function pageHref(h) { return String(h || '').charAt(0) === '#' ? 'decisao.html' + h : String(h || 'decisao.html'); }

  /* Resumo puro: Rota é injetada para o teste rodar fora do navegador. */
  function summarize(Rota, dec, cmp, manual, now, deadline) {
    dec = dec || {};
    const steps = Rota.plan(deadline);
    const all = Rota.evaluate(steps, dec, cmp || {}, manual || {});
    const todo = Rota.next(all);
    const ab = dec.abertas || {};
    const D = decided();
    const keys = D ? PEND.filter(function (k) { return k !== 'pergunta'; }) : PEND;
    const open = keys.filter(function (k) { return ab[k] !== 'decidida'; }).length;
    const first = todo[0] || null;
    return {
      done: all.length - todo.length, total: all.length,
      next: first ? { label: first.label, href: pageHref(first.href), cta: first.cta, late: Rota.late(first, now) } : null,
      pergunta: String(dec.pergunta || '').trim().length > 0,
      decidido: D ? { by: D.by, date: D.date } : null,
      open: open, pendTotal: keys.length,
      daysLeft: Rota.daysLeft(deadline, now)
    };
  }

  const api = { summarize: summarize, PEND: PEND };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  window.ESCHomeEstado = api;

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function read(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }

  function start() {
    const root = document.getElementById('home-estado');
    if (!root || !window.ESC || !window.ESCRota) return;
    if (ESC.project && ESC.project.application && ESC.project.application.status === 'submitted') {
      const h = el('div','he-head'); h.append(el('div','section-kicker','Status confirmado · 19/10/2026'),el('h2',null,'Submissão validada pela ESC'));
      const g = el('div','he-grid');
      const a=el('div','he-card'); a.append(el('span','he-k','Inscrição 10123'),el('p',null,'Candidatura corrigida submetida em 16/10.'));
      const b=el('div','he-card'); b.append(el('span','he-k','Retirada 10122'),el('p',null,'Duplicidade solucionada por resposta da ESC em 19/10.'));
      const c=el('div','he-card'); c.append(el('span','he-k','Próximo marco'),el('p',null,'Resultados previstos para dezembro de 2026.'));
      const link=el('a','inline','Ver acompanhamento →'); link.href='candidatura.html'; c.append(link);
      g.append(a,b,c); root.replaceChildren(h,g);root.hidden=false;return;
    }
    let s;
    try { s = summarize(window.ESCRota, read('esc-decisao-v1'), read('esc-comparador-v1'), read('esc-rota-v1'), new Date(), ESC.meta.deadline); } catch (e) { return; }

    const head = el('div', 'he-head');
    head.append(el('div', 'section-kicker', 'Seu estado · o que você já fez'), el('h2', null, s.done + ' de ' + s.total + ' passos'));
    head.firstChild.nextSibling.id = 'home-estado-title';
    const bar = el('div', 'he-bar'); bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-labelledby', 'home-estado-title'); bar.setAttribute('aria-valuemin', '0'); bar.setAttribute('aria-valuemax', String(s.total)); bar.setAttribute('aria-valuenow', String(s.done));
    const fill = el('i'); fill.style.width = Math.round(100 * s.done / s.total) + '%'; bar.append(fill);

    const grid = el('div', 'he-grid');
    const next = el('div', 'he-card he-next');
    next.append(el('span', 'he-k', s.next ? (s.next.late ? 'Próximo passo · atrasado no ritmo sugerido' : 'Próximo passo') : 'Rota'));
    if (s.next) {
      next.append(el('p', null, s.next.label));
      const a = el('a', 'mesa-btn', s.next.cta); a.href = s.next.href; next.append(a);
    } else next.append(el('p', null, 'Todos os passos estão marcados.'));

    const q = el('div', 'he-card');
    if (s.decidido) {
      q.append(el('span', 'he-k', 'Recorte'), el('p', null, 'Decidido por ' + s.decidido.by + ' em ' + s.decidido.date + '.'));
      const a2 = el('a', 'inline', 'Ver o recorte →'); a2.href = 'decisao.html#recorte'; q.append(a2);
    } else {
      q.append(el('span', 'he-k', 'Pergunta de partida'), el('p', null, s.pergunta ? 'Você já escreveu uma versão.' : 'Ainda não escrita.'));
      const a2 = el('a', 'inline', s.pergunta ? 'Reler ou ajustar →' : 'Escrever em Decisão →'); a2.href = 'decisao.html#pergunta-campo'; q.append(a2);
    }

    const p = el('div', 'he-card');
    p.append(el('span', 'he-k', 'Pendências'), el('p', null, s.open === 0 ? (s.pendTotal === 5 ? 'As cinco estão decididas.' : 'As ' + s.pendTotal + ' restantes estão decididas.') : s.open + ' de ' + s.pendTotal + ' em aberto.'));
    const a3 = el('a', 'inline', 'Ver pendências →'); a3.href = 'decisao.html#pendencias'; p.append(a3);

    grid.append(next, q, p);
    const note = el('p', 'cmp-note');
    note.append('Reflete só o que você marcou neste navegador; não escolhe pergunta nem caminho. ');
    const l = el('a', 'inline', 'Cópia de segurança →'); l.href = 'retomar.html#minhas-anotacoes'; note.append(l);
    root.replaceChildren(head, bar, grid, note);
    root.hidden = false;
  }

  window.addEventListener('pageshow', function (e) { if (e.persisted) start(); });
  window.addEventListener('storage', start);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
  if (document.readyState === 'complete') start(); else document.addEventListener('DOMContentLoaded', start);
})();
