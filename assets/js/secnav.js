/* Menu fixo da Decisão: marca a seção em que você está. Os links funcionam sem JavaScript;
   aqui só se destaca a seção atual e se mantém o chip visível no celular. Não guarda nada. */
'use strict';
(function () {
  /* Dada a posição (px) da linha de leitura e o topo de cada seção, devolve a seção atual. */
  function current(tops, line) {
    let id = tops.length ? tops[0].id : null;
    for (let i = 0; i < tops.length; i++) if (tops[i].top <= line) id = tops[i].id;
    return id;
  }
  const api = { current: current };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;

  const nav = document.getElementById('dec-nav');
  if (!nav) return;
  const links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  const secs = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  let last = null, ticking = false;

  /* Mede as duas barras: inclui área segura, zoom e mudança de orientação. */
  const mobileBar = document.querySelector('.mobile-bar');
  function measureStack() {
    const mobileHeight = mobileBar ? mobileBar.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--cmp-live-top', Math.ceil(mobileHeight + 8) + 'px');
    const top = parseFloat(getComputedStyle(nav).top) || 0;
    document.documentElement.style.setProperty('--dec-anchor-offset', Math.ceil(top + nav.getBoundingClientRect().height + 16) + 'px');
  }
  measureStack();
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(measureStack);
    observer.observe(nav);
    if (mobileBar) observer.observe(mobileBar);
  }
  window.addEventListener('resize', measureStack);

  function update() {
    ticking = false;
    const line = nav.getBoundingClientRect().bottom + 24;
    const tops = [];
    secs.forEach(function (s, i) { if (s) tops.push({ id: links[i].getAttribute('href').slice(1), top: s.getBoundingClientRect().top }); });
    const id = current(tops, line);
    if (id === last) return;
    last = id;
    links.forEach(function (a) {
      const on = a.getAttribute('href') === '#' + id;
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      if (on && nav.scrollWidth > nav.clientWidth) {
        const l = a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2;
        nav.scrollTo({ left: Math.max(0, l), behavior: 'auto' });
      }
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
