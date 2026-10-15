/* Cadeia da pergunta — onde há estudo registrado neste atlas e onde ainda não há.
   Só usa as duas fontes já conferidas no PubMed (Pahakis 2007; van Heerebeek 2012). Nada aqui afirma causa entre os elos. */
'use strict';
(function () {
  const LEVEL = { celula: 'Modelo celular', tecido: 'Tecido humano (associação)', nada: 'Sem estudo registrado aqui' };
  const LINKS = [
    { id: 'desc', label: 'Descarga mecânica → eGCX', level: 'nada', where: null,
      text: 'Nenhuma leitura registrada neste atlas liga a descarga mecânica (microgravidade) ao eGCX do coração. É o início da pergunta de partida e ainda está em aberto.' },
    { id: 'egcx', label: 'eGCX → NO sob fluxo', level: 'celula', where: '#lab-bancada',
      text: 'Células aórticas bovinas: a depleção enzimática de heparan sulfato, hialuronano ou ácido siálico bloqueou o NO induzido por cisalhamento; a de condroitina sulfato, não (Pahakis et al., 2007).' },
    { id: 'pkg', label: 'NO → cGMP → PKG', level: 'tecido', where: '#lab-tensao',
      text: 'Em biópsias humanas, a ICFEp teve PKG e cGMP menores que as comparações do estudo, com mais estresse nitrosativo/oxidativo (van Heerebeek et al., 2012). É associação; o estudo não mediu o endotélio.' },
    { id: 'fp', label: 'PKG → tensão passiva', level: 'tecido', where: '#lab-tensao',
      text: 'A força passiva do cardiomiócito (Fpassive) mais alta na ICFEp foi corrigida pela PKG adicionada in vitro (van Heerebeek et al., 2012).' },
    { id: 'tit', label: 'Tensão passiva ↔ titina', level: 'nada', where: null,
      text: 'A fosforilação da titina como mediador não está coberta pelas duas fontes conferidas aqui. Ler o texto completo e buscar a literatura antes de afirmar.' }
  ];
  function link(id) { return LINKS.filter(function (l) { return l.id === id; })[0] || LINKS[0]; }
  function gaps() { return LINKS.filter(function (l) { return l.level === 'nada'; }); }

  const api = { LINKS: LINKS, LEVEL: LEVEL, link: link, gaps: gaps };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function start() {
    const root = document.getElementById('cadeia-root'); if (!root) return;
    let cur = 'egcx';
    const list = el('ol', 'cadeia-list'); const out = el('div', 'bancada-out'); out.setAttribute('aria-live', 'polite');
    const buttons = LINKS.map(function (x) {
      const li = el('li'); const b = el('button', 'cadeia-' + x.level, x.label); b.type = 'button';
      b.append(el('small', '', LEVEL[x.level]));
      b.addEventListener('click', function () { cur = x.id; draw(); });
      li.append(b); list.append(li); return b;
    });
    function draw() {
      const l = link(cur);
      buttons.forEach(function (b, i) { b.setAttribute('aria-pressed', String(LINKS[i].id === cur)); });
      const items = [el('h4', 'bancada-sub', l.label), el('p', 'lab-copy', l.text)];
      if (l.where) { const a = el('a', 'inline', 'Abrir a bancada ↓'); a.href = l.where; items.push(a); }
      out.replaceChildren.apply(out, items);
    }
    root.replaceChildren(list, out, el('small', 'bancada-small', 'Mostra onde há estudo registrado, não a força da evidência nem a direção da causa.'));
    draw();
  }
  if (document.readyState === 'complete') start(); else document.addEventListener('DOMContentLoaded', start);
})();
