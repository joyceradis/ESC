/* Rota até 23/10 — onde estamos e para onde vamos.
   Só lê o que a autora já marcou neste navegador (Decisão e Comparador) e o que ela marcar aqui.
   Não escolhe recorte, não recomenda caminho e não decide nada. As datas são sugestão de ritmo. */
'use strict';
(function () {
  const KEY = 'esc-rota-v1';
  /* id, rótulo, dias antes do prazo (sugestão), âncora, texto do botão, automático? */
  const STEPS = [
    ['comp', 'Comparar pelo menos dois caminhos com notas', 6, '#comparar', 'Abrir o comparador', true],
    ['mudar', 'Escrever “o que me faria mudar de ideia” em cada caminho', 6, '#comparar', 'Escrever as notas', true],
    ['escopo', 'Escolher o recorte', 5, '#recorte', 'Escolher o recorte', true],
    ['trilhas', 'Dar um destino a cada trilha', 4, '#trilhas', 'Dar destino às trilhas', true],
    ['pend', 'Fechar as cinco pendências', 3, '#pendencias', 'Ver as pendências', true],
    ['texto', 'Revisar abstract, CV e carta no Drive', 2, 'plano.html', 'Abrir o plano', false],
    ['enviar', 'Enviar a candidatura', 0, 'plano.html', 'Abrir o plano', false]
  ];

  /* O prazo é horário de Brasília; "hoje" também, para a contagem não depender do fuso do navegador. */
  const TZ = 'America/Sao_Paulo';
  function today(now) {
    const iso = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now || new Date());
    return dateOf(iso);
  }
  function dateOf(iso) { const p = String(iso).slice(0, 10).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function daysLeft(deadlineISO, now) {
    return Math.round((dateOf(deadlineISO) - today(now)) / 864e5);
  }
  function plan(deadlineISO) {
    const d = dateOf(deadlineISO);
    return STEPS.map(function (s) {
      const when = new Date(d.getFullYear(), d.getMonth(), d.getDate() - s[2]);
      return { id: s[0], label: s[1], offset: s[2], date: when, href: s[3], cta: s[4], auto: s[5] };
    });
  }
  /* "Sem nota" fica gravado como null: só conta quem tem ao menos uma nota de verdade. */
  function has(o) { return !!o && typeof o === 'object' && Object.keys(o).some(function (k) { return o[k] != null; }); }
  /* Estado de cada passo a partir do que está salvo. Passos manuais só contam se a autora marcou. */
  function evaluate(steps, dec, cmp, manual) {
    dec = dec || {}; cmp = cmp || {}; manual = manual || {};
    const chosen = Array.isArray(cmp.chosen) ? cmp.chosen : [];
    const rated = chosen.filter(function (id) { return cmp.ratings && has(cmp.ratings[id]); });
    const notes = cmp.notes || {};
    const lanes = dec.lanes || {}; const ab = dec.abertas || {};
    const done = {
      comp: rated.length >= 2,
      mudar: chosen.length >= 2 && chosen.every(function (id) { return String(notes[id] || '').trim().length > 0; }),
      escopo: !!dec.escopo,
      trilhas: Object.keys(lanes).filter(function (k) { return lanes[k]; }).length >= 7,
      pend: ['pergunta', 'estrategias', 'paralelas', 'textos', 'leituras'].every(function (k) { return ab[k] === 'decidida'; }),
      texto: !!manual.texto, enviar: !!manual.enviar
    };
    return steps.map(function (s) { return Object.assign({}, s, { done: !!done[s.id] }); });
  }
  function next(list) { return list.filter(function (s) { return !s.done; }); }
  function late(step, now) {
    return step.date < today(now);
  }

  const api = { STEPS: STEPS, today: today, daysLeft: daysLeft, plan: plan, evaluate: evaluate, next: next, late: late };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  window.ESCRota = api;

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function read(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  const fmt = function (d) { return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'); };

  function start() {
    const root = document.getElementById('rota-root'); if (!root || typeof ESC === 'undefined') return;
    root.textContent = '';
    const manual = read(KEY);
    let filter = 'todos'; let day = null;
    const steps = plan(ESC.meta.deadline);

    const head = el('div', 'rota-head');
    const count = el('div', 'rota-count'); const num = el('strong'); const lab = el('span');
    count.append(num, lab);
    const sent = el('div', 'rota-sent'); const where = el('p', 'rota-where'); const going = el('p', 'rota-going');
    sent.append(where, going); head.append(count, sent);

    const bar = el('div', 'rota-bar'); bar.setAttribute('role', 'progressbar'); bar.setAttribute('aria-label', 'Passos concluídos'); bar.setAttribute('aria-valuemin', '0'); bar.setAttribute('aria-valuemax', String(steps.length));
    const fill = el('i'); bar.append(fill);

    const strip = el('div', 'rota-strip'); strip.setAttribute('role', 'group'); strip.setAttribute('aria-label', 'Dias até o prazo; escolha um para filtrar os passos');
    const dots = [];
    for (let k = 6; k >= 0; k--) {
      const b = el('button', 'rota-dot'); b.type = 'button'; b.dataset.off = String(k);
      b.addEventListener('click', function () { day = day === k ? null : k; draw(); });
      strip.append(b); dots.push(b);
    }

    const chips = el('div', 'rota-chips'); chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Filtrar passos');
    [['todos', 'Todos'], ['falta', 'Falta'], ['feito', 'Feitos']].forEach(function (f) {
      const b = el('button', 'mesa-chip', f[1]); b.type = 'button'; b.dataset.f = f[0];
      b.addEventListener('click', function () { filter = f[0]; draw(); });
      chips.append(b);
    });

    const nextCard = el('div', 'rota-next'); const list = el('ol', 'rota-list');
    const empty = el('p', 'cmp-note'); empty.hidden = true;
    const note = el('p', 'cmp-note', 'Este painel só reflete o que você marcou neste navegador e não decide nada. As datas são sugestão de ritmo; ajuste como quiser. Passos sem selo “automático” só você marca, porque o atlas não edita o Drive.');
    root.append(head, bar, strip, chips, nextCard, list, empty, note);

    function items() {
      return evaluate(steps, read('esc-decisao-v1'), read('esc-comparador-v1'), manual);
    }
    function draw() {
      const all = items(); const now = new Date(); const dl = daysLeft(ESC.meta.deadline, now);
      const todo = next(all); const nDone = all.length - todo.length;
      num.textContent = dl > 0 ? String(dl) : (dl === 0 ? 'Hoje' : '—');
      lab.textContent = dl > 1 ? 'dias até 23/10' : (dl === 1 ? 'dia até 23/10' : (dl === 0 ? 'é o último dia' : 'prazo passou'));
      where.textContent = 'Onde estamos: ' + nDone + ' de ' + all.length + ' passos feitos.';
      going.textContent = todo.length ? 'Para onde vamos: ' + todo.slice(0, 2).map(function (s) { return s.label.charAt(0).toLowerCase() + s.label.slice(1); }).join(', depois ') + '.' : 'Para onde vamos: tudo marcado. Confira o edital oficial antes de enviar.';
      fill.style.width = Math.round(100 * nDone / all.length) + '%';
      bar.setAttribute('aria-valuenow', String(nDone)); bar.setAttribute('aria-valuetext', nDone + ' de ' + all.length);

      dots.forEach(function (b) {
        const k = Number(b.dataset.off); const sub = all.filter(function (s) { return s.offset === k || (k === 6 && s.offset > 6); });
        const open = sub.filter(function (s) { return !s.done; }).length;
        const d = new Date(dateOf(ESC.meta.deadline).getFullYear(), dateOf(ESC.meta.deadline).getMonth(), dateOf(ESC.meta.deadline).getDate() - k);
        b.textContent = fmt(d);
        const small = el('small', '', sub.length ? (open ? open + ' falta' + (open > 1 ? 'm' : '') : 'ok') : '·'); b.append(small);
        b.setAttribute('aria-pressed', String(day === k));
        b.setAttribute('aria-label', fmt(d) + ': ' + (sub.length ? open + ' de ' + sub.length + ' passos faltando' : 'sem passo sugerido'));
        b.dataset.state = k === dl ? 'hoje' : (k > dl ? 'passou' : 'futuro');
      });
      chips.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.f === filter)); });

      nextCard.textContent = '';
      if (todo.length) {
        const s = todo[0];
        nextCard.append(el('small', '', 'Próximo passo'), el('strong', '', s.label));
        if (late(s, now)) nextCard.append(el('span', 'rota-late', 'Sugerido para ' + fmt(s.date) + '. Dá para recuperar o ritmo; veja o que pode esperar.'));
        const a = el('a', 'mesa-btn', s.cta); a.href = s.href; nextCard.append(a);
      } else nextCard.append(el('strong', '', 'Todos os passos marcados.'));

      list.textContent = '';
      const vis = all.filter(function (s) {
        if (filter === 'falta' && s.done) return false;
        if (filter === 'feito' && !s.done) return false;
        if (day != null && !(s.offset === day || (day === 6 && s.offset > 6))) return false;
        return true;
      });
      vis.forEach(function (s) {
        const li = el('li', 'rota-item'); li.dataset.done = String(s.done);
        const txt = el('div', 'rota-txt'); txt.append(el('b', '', s.label), el('small', '', 'Sugestão: até ' + fmt(s.date)));
        const tag = el('span', 'rota-tag', s.auto ? 'automático' : 'você marca'); txt.append(tag);
        li.append(txt);
        if (s.auto) li.append(el('span', 'rota-state', s.done ? 'feito' : 'falta'));
        else {
          const b = el('button', 'mesa-btn', s.done ? 'Desmarcar' : 'Marcar como feito'); b.type = 'button'; b.dataset.step = s.id; b.setAttribute('aria-pressed', String(s.done));
          b.addEventListener('click', function () { manual[s.id] = !s.done; try { localStorage.setItem(KEY, JSON.stringify(manual)); } catch (e) { /* segue só na tela */ } draw(); const again = list.querySelector('button[data-step="' + s.id + '"]'); if (again) again.focus(); });
          li.append(b);
        }
        list.append(li);
      });
      empty.hidden = vis.length > 0; empty.textContent = 'Nenhum passo neste filtro.';
    }

    draw();
    /* As outras seções gravam em localStorage sem avisar; reler depois de interagir ou voltar à aba. */
    let t; const soon = function () { clearTimeout(t); t = setTimeout(draw, 250); };
    ['pointerup', 'keyup', 'change', 'input'].forEach(function (ev) { document.addEventListener(ev, function (e) { if (!root.contains(e.target)) soon(); }); });
    window.addEventListener('focus', soon);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) soon(); });
  }
  if (document.readyState === 'complete') start(); else document.addEventListener('DOMContentLoaded', start);
})();
