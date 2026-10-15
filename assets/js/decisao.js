/* Decisão da candidatura — escolher o recorte e dar um destino a cada trilha.
   Só estrutura. O que a autora marca fica neste navegador (localStorage); nada é enviado nem publicado. */
'use strict';
(function () {
  const KEY = 'esc-decisao-v1';
  const SCOPES = [
    ['A', 'Piloto endotelial', 'Perturbar o eGCX de endotélio microvascular cardíaco sob fluxo controlado e medir a resposta de NO.'],
    ['B', 'Ponte completa', 'Do endotélio ao cardiomiócito: NO–cGMP–PKG, fosforilação da titina e tensão passiva.'],
    ['C', 'Descarga mecânica → titina', 'A pergunta de partida: o cardiomiócito descarregado muda a titina, sem mediação endotelial.'],
    ['X', 'Outro recorte', 'Escreva abaixo.']
  ];
  const LANES = [
    ['elo', 'Do endotélio ao cardiomiócito'],
    ['sensor', 'Como o endotélio sente o fluxo'],
    ['matriz', 'A matriz como amortecedor ou transmissor'],
    ['micro', 'Microgravidade e descarga'],
    ['orto', 'Ortostase e pós-voo'],
    ['farmaco', 'Fármacos e eGCX'],
    ['congestao', 'Congestão, barreira e rim']
  ];
  const DEST = [['entra', 'Entra na candidatura'], ['paralelo', 'Fica em paralelo'], ['depois', 'Deixo de lado por ora']];

  function summary(S) {
    const sc = SCOPES.filter(function (s) { return s[0] === S.escopo; })[0];
    const out = ['Recorte: ' + (sc ? sc[0] + ' · ' + sc[1] : 'não escolhido')];
    out.push('Pergunta: ' + ((S.pergunta || '').trim() || '(em branco)'));
    DEST.forEach(function (d) {
      const rows = LANES.filter(function (l) { return (S.lanes || {})[l[0]] === d[0]; });
      if (rows.length) out.push('', d[1] + ':', rows.map(function (l) { return '- ' + l[1]; }).join('\n'));
    });
    return out.join('\n');
  }
  function pending(S) { return LANES.filter(function (l) { return !(S.lanes || {})[l[0]]; }).length; }

  const api = { summary: summary, pending: pending, SCOPES: SCOPES, LANES: LANES };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; } }

  function start() {
    const root = document.getElementById('decisao-root'); if (!root) return;
    const S = load(); S.lanes = S.lanes || {};
    const status = el('p', 'mesa-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    /* Salva em silêncio ao digitar; só anuncia depois de uma pausa, para o leitor de tela não repetir a mensagem a cada tecla. */
    let anuncio; let salvou = true;
    const persist = function () { salvou = save(S); clearTimeout(anuncio); anuncio = setTimeout(function () { status.textContent = salvou ? 'Salvo só neste navegador. Nada é enviado.' : 'Não foi possível salvar neste navegador.'; }, 1200); };

    /* Botões criados uma vez; só o estado muda, para o foco do teclado não se perder. */
    const scopes = el('div', 'mesa-grid');
    const scopeBtns = SCOPES.map(function (s) {
      const b = el('button', 'mesa-btn decisao-scope'); b.type = 'button';
      b.append(el('strong', '', s[0] + ' · ' + s[1]), el('small', '', s[2]));
      b.addEventListener('click', function () { S.escopo = S.escopo === s[0] ? '' : s[0]; persist(); drawScopes(); });
      scopes.append(b); return b;
    });
    function drawScopes() { scopeBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(S.escopo === SCOPES[i][0])); }); }
    const q = el('label', 'plano-field'); q.append(el('span', '', 'A pergunta da candidatura, em uma frase'), el('small', '', 'Sem ligar dois fenômenos com “e”.'));
    const qt = el('textarea'); qt.rows = 3; qt.value = S.pergunta || ''; qt.addEventListener('input', function () { S.pergunta = qt.value; persist(); }); q.append(qt);

    const lanes = el('div', 'decisao-lanes'); const meter = el('p', 'mesa-status');
    const upd = function () { meter.textContent = pending(S) ? 'Faltam ' + pending(S) + ' trilhas sem destino.' : 'Todas as trilhas têm destino.'; };
    LANES.forEach(function (l) {
      const row = el('div', 'decisao-lane'); row.append(el('b', '', l[1]));
      const g = el('div', 'mesa-states'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Destino: ' + l[1]);
      DEST.forEach(function (d) {
        const b = el('button', 'mesa-btn', d[1]); b.type = 'button'; b.setAttribute('aria-pressed', String(S.lanes[l[0]] === d[0]));
        b.addEventListener('click', function () {
          S.lanes[l[0]] = S.lanes[l[0]] === d[0] ? '' : d[0]; persist(); upd();
          g.querySelectorAll('button').forEach(function (x, i) { x.setAttribute('aria-pressed', String(S.lanes[l[0]] === DEST[i][0])); });
        });
        g.append(b);
      });
      row.append(g); lanes.append(row);
    });

    const copy = el('button', 'mesa-btn', 'Copiar a minha decisão'); copy.type = 'button';
    const out = el('pre', 'mesa-text'); out.hidden = true;
    copy.addEventListener('click', function () {
      const t = summary(S); out.textContent = t; out.hidden = false;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { status.textContent = 'Copiado.'; }, function () { status.textContent = 'Selecione o texto abaixo e copie.'; });
      else status.textContent = 'Selecione o texto abaixo e copie.';
    });
    root.replaceChildren(el('h3', 'mesa-sub', '1. Qual é o recorte?'), scopes, q, el('h3', 'mesa-sub', '2. Que destino tem cada trilha?'), meter, lanes, copy, out, status);
    drawScopes(); upd();
  }
  if (document.readyState === 'complete') start(); else document.addEventListener('DOMContentLoaded', start);
})();
