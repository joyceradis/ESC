/* Bancada da pergunta — o que o antecedente direto relatou, condição por condição.
   Dados: Pahakis et al. 2007, Biochem Biophys Res Commun 355(1):228-33, DOI 10.1016/j.bbrc.2007.01.137 (resumo no PubMed).
   Qualitativo: o resumo não traz valores. Células aórticas bovinas; não é endotélio microvascular cardíaco humano. */
'use strict';
(function () {
  const CONDITIONS = [
    { id: 'ctrl', label: 'Sem tratamento enzimático', no: 'preservado', pgi2: 'preservado', note: 'Referência: o cisalhamento induz NO e PGI₂. As depleções abaixo são enzimáticas e parciais.' },
    { id: 'hs', label: 'Depleção de heparan sulfato', no: 'bloqueado', pgi2: 'preservado', note: 'Heparan sulfato é cadeia de GAG de proteoglicanos ancorados. A depleção enzimática bloqueou o NO induzido por cisalhamento.' },
    { id: 'ha', label: 'Depleção de hialuronano', no: 'bloqueado', pgi2: 'preservado', note: 'Hialuronano é polímero associado à superfície, não cadeia de proteoglicano. A depleção enzimática bloqueou o NO induzido por cisalhamento.' },
    { id: 'sa', label: 'Depleção de ácido siálico', no: 'bloqueado', pgi2: 'preservado', note: 'Ácido siálico é terminal de glicoproteínas, não de GAG. A depleção enzimática bloqueou o NO induzido por cisalhamento.' },
    { id: 'cs', label: 'Depleção de condroitina sulfato', no: 'preservado', pgi2: 'preservado', note: 'Condroitina sulfato é cadeia de GAG. A depleção enzimática não bloqueou o NO.' }
  ];
  const NOT_SAID = [
    'Que o mesmo valha em endotélio microvascular cardíaco humano: o estudo usou células aórticas bovinas.',
    'Que o NO reduzido chegue ao cardiomiócito ou mude a titina: o estudo não mediu cardiomiócitos.',
    'Que o mecanismo seja “glipicana–cavéolas–eNOS”: é a interpretação dos autores, não uma prova. Os autores usam o termo “glicocálix” de forma geral; pela hierarquia de Tomita (2026), o que se estuda aqui é o eGCX.'
  ];
  function outcome(id) { return CONDITIONS.filter(function (c) { return c.id === id; })[0] || CONDITIONS[0]; }
  function blocked(c) { return c.no === 'bloqueado'; }

  const api = { CONDITIONS: CONDITIONS, outcome: outcome, blocked: blocked };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function start() {
    const root = document.getElementById('bancada-root'); if (!root) return;
    let cur = 'ctrl';
    const tabs = el('div', 'lab-stage-tabs'); tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Componente do eGCX depletado');
    const out = el('div', 'bancada-out'); out.setAttribute('aria-live', 'polite');
    function meter(name, state) {
      const w = el('div', 'bancada-meter'); const top = el('div', 'bancada-meter-top'); top.append(el('span', '', name), el('b', state === 'bloqueado' ? 'is-blocked' : 'is-ok', state));
      const bar = el('div', 'bancada-bar'); const i = el('i'); i.style.width = state === 'bloqueado' ? '6%' : '100%'; i.className = state === 'bloqueado' ? 'is-blocked' : 'is-ok'; bar.append(i);
      w.append(top, bar); return w;
    }
    /* Os botões são criados uma vez; só o estado muda, para o foco do teclado não se perder. */
    const buttons = CONDITIONS.map(function (x) {
      const b = el('button', '', x.label); b.type = 'button';
      b.addEventListener('click', function () { cur = x.id; draw(); });
      tabs.append(b); return b;
    });
    function draw() {
      const c = outcome(cur);
      buttons.forEach(function (b, i) { b.setAttribute('aria-pressed', String(CONDITIONS[i].id === cur)); });
      out.replaceChildren(meter('NO induzido por cisalhamento', c.no), meter('PGI₂ induzida por cisalhamento', c.pgi2), el('p', 'lab-copy', c.note),
        el('small', 'bancada-small', 'Barras qualitativas: o resumo não traz valores numéricos.'));
    }
    const nope = el('ul', 'bancada-not'); NOT_SAID.forEach(function (t) { nope.append(el('li', '', t)); });
    root.replaceChildren(tabs, out, el('h4', 'bancada-sub', 'O que este estudo não permite dizer'), nope);
    draw();
  }
  if (document.readyState === 'complete') start(); else document.addEventListener('DOMContentLoaded', start);
})();
