/* Bancada da tensão passiva — o que o estudo relatou em biópsias humanas, coorte por coorte.
   Dados: van Heerebeek et al. 2012, Circulation 126(7):830-9, DOI 10.1161/CIRCULATIONAHA.111.076075 (resumo no PubMed).
   Qualitativo e comparativo: o resumo não traz valores. Biópsias humanas de ventrículo esquerdo; é associação, não prova de causa. */
'use strict';
(function () {
  /* Todas as linhas são relativas à ICFEp, que é o contraste que o resumo descreve. */
  const COHORTS = [
    { id: 'icfep', label: 'ICFEp (n=36)', pkg: 'menor', cgmp: 'menor', nitro: 'maior', fp: 'maior',
      note: 'Atividade de PKG menor que na estenose aórtica e na ICFER, junto com cGMP menor, mais estresse nitrosativo/oxidativo e força passiva do cardiomiócito (Fpassive) maior.' },
    { id: 'ae', label: 'Estenose aórtica (n=67)', pkg: 'maior', cgmp: null, nitro: null, fp: null,
      note: 'Só a PKG está comparada com a ICFEp de forma explícita no resumo: maior que na ICFEp. As outras medidas não são detalhadas aqui; conferir no texto completo.' },
    { id: 'icfer', label: 'ICFER (n=43)', pkg: 'maior', cgmp: null, nitro: null, fp: null,
      note: 'Só a PKG está comparada com a ICFEp de forma explícita no resumo: maior que na ICFEp. As outras medidas não são detalhadas aqui; conferir no texto completo.' }
  ];
  const NOT_SAID = [
    'Que a PKG baixa cause a tensão alta: o estudo é de associação em biópsias; a correção in vitro mostra que a Fpassive responde à PKG, não de onde veio a PKG baixa.',
    'Que o glicocálix ou o NO endotelial expliquem a PKG baixa: o estudo não mediu o endotélio nem o glicocálix. A ponte eGCX → NO–cGMP–PKG continua hipótese.',
    'Que a correção valha nas outras coortes: o resumo só descreve a correção na ICFEp.',
    'Efeito em microgravidade ou descarga mecânica: não foi estudado.'
  ];
  function cohort(id) { return COHORTS.filter(function (c) { return c.id === id; })[0] || COHORTS[0]; }
  /* Com PKG adicionada in vitro, só a ICFEp tem desfecho descrito (Fpassive corrigida). */
  function withPkg(c) { return c.id === 'icfep' ? { described: true, fp: 'corrigida' } : { described: false }; }

  const api = { COHORTS: COHORTS, cohort: cohort, withPkg: withPkg };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function start() {
    const root = document.getElementById('tensao-root'); if (!root) return;
    let cur = 'icfep', pkg = false;
    const tabs = el('div', 'lab-stage-tabs'); tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Coorte');
    const add = el('button', '', 'Adicionar PKG in vitro'); add.type = 'button';
    const out = el('div', 'bancada-out'); out.setAttribute('aria-live', 'polite');
    function meter(name, opts, state) {
      const w = el('div', 'bancada-meter'); w.append(el('span', 'bancada-name', name));
      const seg = el('div', 'bancada-seg'); seg.setAttribute('role', 'img'); seg.setAttribute('aria-label', name + ': ' + state);
      opts.forEach(function (k, i) { seg.append(el('span', state === k ? 'is-on ' + (i ? 'is-preservado' : 'is-bloqueado') : '', k)); });
      w.append(seg); return w;
    }
    const buttons = COHORTS.map(function (x) {
      const b = el('button', '', x.label); b.type = 'button';
      b.addEventListener('click', function () { cur = x.id; draw(); });
      tabs.append(b); return b;
    });
    add.addEventListener('click', function () { pkg = !pkg; draw(); });
    function draw() {
      const c = cohort(cur), p = withPkg(c);
      buttons.forEach(function (b, i) { b.setAttribute('aria-pressed', String(COHORTS[i].id === cur)); });
      add.setAttribute('aria-pressed', String(pkg));
      const nd = function (name, opts, st) { return st ? meter(name, opts, st) : el('p', 'bancada-small', name + ': não detalhado no resumo para esta coorte.'); };
      const rows = [meter('Atividade de PKG', ['menor', 'maior'], c.pkg), nd('cGMP', ['menor', 'maior'], c.cgmp),
        nd('Estresse nitrosativo/oxidativo', ['maior', 'menor'], c.nitro)];
      let note = c.note;
      if (pkg && p.described) { rows.push(meter('Força passiva (Fpassive), com PKG in vitro', ['maior', 'corrigida'], p.fp)); note = 'A Fpassive mais alta da ICFEp foi corrigida pela PKG adicionada in vitro.'; }
      else if (pkg) { rows.push(el('p', 'lab-copy', 'O resumo não descreve o efeito da PKG in vitro nesta coorte.')); }
      else rows.push(nd('Força passiva (Fpassive)', ['maior', 'menor'], c.fp));
      out.replaceChildren.apply(out, rows.concat([el('p', 'lab-copy', note), el('small', 'bancada-small', 'Indicador categórico e relativo à ICFEp: o resumo não traz valores numéricos, então não há tamanho de efeito.')]));
    }
    tabs.append(add);
    const nope = el('ul', 'bancada-not'); NOT_SAID.forEach(function (t) { nope.append(el('li', '', t)); });
    root.replaceChildren(tabs, out, el('h4', 'bancada-sub', 'O que este estudo não permite dizer'), nope);
    draw();
  }
  if (document.readyState === 'complete') start(); else document.addEventListener('DOMContentLoaded', start);
})();
