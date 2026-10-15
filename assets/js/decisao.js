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
  /* O que só a autora decide até 23/10. Fonte: ESTADO_ATUAL e [PENDENCIA] 01 do Drive (15/10/2026). Nada aqui é decisão tomada. */
  const OPEN = [
    ['pergunta', 'Qual é a pergunta que carrega a candidatura?',
      'É a escolha que organiza todo o resto. Hoje há duas candidatas que coexistem: a pergunta de partida (descarga mecânica → titina) e a ponte endotélio → cardiomiócito. A cadeia glicocálix–NO–PKG–titina é candidata, não eleita.',
      'A inflamação endotelial após degradar heparan sulfato sob fluxo já foi demonstrada in vitro (McDonald 2016); isso não serve como novidade. Já existe revisão sobre eGCX na ICFEp (Lagrange 2025).',
      '#recorte', 'Escolher o recorte'],
    ['estrategias', 'Qual das quatro estratégias entra, se alguma?',
      'São propostas do documento [PENDENCIA] 01, em avaliação, não protocolo aprovado. Nenhum laboratório está confirmado e todas supõem uma plataforma de chip.',
      'Cada uma tem um ponto fraco próprio, listado abaixo. Nenhuma foi executada.',
      '#estrategias', 'Avaliar as quatro estratégias'],
    ['paralelas', 'O que fazer com as linhas paralelas?',
      'Ortostase e pós-voo, fármacos, congestão e rim, a matriz como amortecedor. Cada uma pode entrar, ficar em paralelo ou esperar.',
      'Disautonomia e POTS têm explicações sistêmicas consolidadas; a ligação com o glicocálix continua sem demonstração causal.',
      '#trilhas', 'Dar destino às trilhas'],
    ['textos', 'Fechar abstract, CV e carta',
      'Os três estão como rascunho e não há submissão registrada. O texto só pode afirmar o que a pergunta escolhida sustenta.',
      'Prazo: sexta, 23/10/2026. O horário-limite precisa ser conferido no edital oficial.',
      'plano.html', 'Abrir o plano e o esqueleto'],
    ['leituras', 'Registrar o que você já leu',
      'Só Tomita (2026) está marcado como lido e discutido. Só você marca “lido”; ter o artigo catalogado não conta.',
      'A biblioteca tem dezenas de itens; os de prioridade altíssima aparecem em “Começar por aqui”.',
      'biblioteca.html', 'Abrir a biblioteca']
  ];
  const OPEN_STATE = [['aberta', 'Em aberto'], ['ler', 'Preciso ler mais'], ['decidida', 'Decidi']];
  const STRATS = [
    ['e1', 'Estrutura: âncoras ou matriz?',
      'Remover separadamente hialuronano, heparan sulfato e ácido siálico sob fluxo e medir espessura, rigidez e NO.',
      'Ponto fraco: separar os componentes não é novidade. Pahakis 2007 já depletou heparan sulfato, hialuronano, ácido siálico e condroitina sulfato em células aórticas bovinas: HS, HA e ácido siálico bloquearam o NO induzido por fluxo, a condroitina não. McDonald 2016 já mostrou a resposta inflamatória após degradar heparan sulfato sob fluxo. Falta definir o diferencial. Candidatos a discutir: endotélio microvascular cardíaco humano em vez de aorta bovina; um desfecho no cardiomiócito (titina, tensão passiva), que esses estudos não medem; propriedades físicas medidas, como rigidez e hidratação.'],
    ['e2', 'Tempo: fosforilação aguda ou splicing crônico?',
      'Comparar a fosforilação da titina nas primeiras horas com a troca de isoformas (RBM20) após 7 a 14 dias.',
      'Ponto fraco: exige cardiomiócitos maduros e cultura longa; é a mais cara em tempo.'],
    ['e3', 'Fármaco: escudo do glicocálix ou resgate a jusante?',
      'Empagliflozina antes do insulto inflamatório contra um estimulador de sGC depois.',
      'Ponto fraco: a empagliflozina atenua o dano por TNF, mas não impede a heparinase direta; o efeito sobre NHE1 é discordante entre estudos.'],
    ['e4', 'Pessoas: plasma de pacientes no chip',
      'Perfundir plasma de pacientes com e sem sinais de eGCX alterado e medir a rigidez do microtecido.',
      'Ponto fraco: precisa de coorte caracterizada, amostras e aprovação ética; é o horizonte, não o primeiro passo.']
  ];

  function summary(S) {
    const sc = SCOPES.filter(function (s) { return s[0] === S.escopo; })[0];
    const out = ['Recorte: ' + (sc ? sc[0] + ' · ' + sc[1] : 'não escolhido')];
    out.push('Pergunta: ' + ((S.pergunta || '').trim() || '(em branco)'));
    DEST.forEach(function (d) {
      const rows = LANES.filter(function (l) { return (S.lanes || {})[l[0]] === d[0]; });
      if (rows.length) out.push('', d[1] + ':', rows.map(function (l) { return '- ' + l[1]; }).join('\n'));
    });
    const st = STRATS.filter(function (x) { return (S.estr || {})[x[0]]; });
    if (st.length) {
      out.push('', 'Estratégias:');
      st.forEach(function (x) { const d = DEST.filter(function (y) { return y[0] === S.estr[x[0]]; })[0]; out.push('- ' + x[1] + ': ' + (d ? d[1] : '')); });
    }
    const op = OPEN.map(function (x) { const d = OPEN_STATE.filter(function (y) { return y[0] === ((S.abertas || {})[x[0]] || 'aberta'); })[0]; return '- ' + x[1] + ' ' + d[1]; });
    out.push('', 'Pendências:', op.join('\n'));
    return out.join('\n');
  }
  function open(S) { return OPEN.filter(function (x) { return ((S.abertas || {})[x[0]] || 'aberta') !== 'decidida'; }).length; }
  function pending(S) { return LANES.filter(function (l) { return !(S.lanes || {})[l[0]]; }).length; }

  const api = { summary: summary, pending: pending, open: open, SCOPES: SCOPES, LANES: LANES, OPEN: OPEN, STRATS: STRATS };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; } }

  function start() {
    const root = document.getElementById('decisao-root'); if (!root) return;
    const S = load(); S.lanes = S.lanes || {}; S.estr = S.estr || {}; S.abertas = S.abertas || {};
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


    /* Pendências: o que falta decidir, na ordem em que destrava o resto. */
    const resumo = el('p', 'dec-resumo'); resumo.setAttribute('role', 'status');
    const updOpen = function () { const n = open(S); resumo.textContent = n ? 'Faltam ' + n + ' de ' + OPEN.length + ' decisões. Prazo: 23/10.' : 'As ' + OPEN.length + ' decisões estão marcadas como decididas.'; };
    const openList = el('div', 'dec-list');
    OPEN.forEach(function (x, i) {
      const card = el('article', 'mesa-card dec-card');
      const num = el('span', 'dec-num', String(i + 1)); num.setAttribute('aria-hidden', 'true');
      const h = el('h3', '', x[1]);
      const why = el('p', 'mesa-q', x[2]);
      const ev = el('p', 'dec-ev'); ev.append(el('b', '', 'O que a evidência diz: '), document.createTextNode(x[3]));
      const g = el('div', 'mesa-states'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Situação: ' + x[1]);
      OPEN_STATE.forEach(function (d) {
        const b = el('button', 'mesa-btn', d[1]); b.type = 'button';
        b.addEventListener('click', function () { S.abertas[x[0]] = d[0]; persist(); updOpen(); mark(); });
        g.append(b);
      });
      const mark = function () {
        const cur = S.abertas[x[0]] || 'aberta';
        g.querySelectorAll('button').forEach(function (b, k) { b.setAttribute('aria-pressed', String(OPEN_STATE[k][0] === cur)); });
        card.classList.toggle('is-feita', cur === 'decidida');
      };
      const go = el('a', 'inline', x[5] + ' →'); go.href = x[4];
      card.append(num, h, why, ev, g, go); openList.append(card); mark();
    });
    updOpen();

    /* Estratégias do documento de pendência. */
    const strats = el('div', 'decisao-lanes');
    STRATS.forEach(function (x) {
      const row = el('div', 'decisao-lane'); row.append(el('b', '', x[1]), el('p', 'mesa-q', x[2]), el('p', 'dec-ev', x[3]));
      const g = el('div', 'mesa-states'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Destino: ' + x[1]);
      DEST.forEach(function (d) {
        const b = el('button', 'mesa-btn', d[1]); b.type = 'button'; b.setAttribute('aria-pressed', String(S.estr[x[0]] === d[0]));
        b.addEventListener('click', function () {
          S.estr[x[0]] = S.estr[x[0]] === d[0] ? '' : d[0]; persist();
          g.querySelectorAll('button').forEach(function (y, k) { y.setAttribute('aria-pressed', String(S.estr[x[0]] === DEST[k][0])); });
        });
        g.append(b);
      });
      row.append(g); strats.append(row);
    });

    const copy = el('button', 'mesa-btn', 'Copiar a minha decisão'); copy.type = 'button';
    const out = el('pre', 'mesa-text'); out.hidden = true;
    copy.addEventListener('click', function () {
      const t = summary(S); out.textContent = t; out.hidden = false;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { status.textContent = 'Copiado.'; }, function () { status.textContent = 'Selecione o texto abaixo e copie.'; });
      else status.textContent = 'Selecione o texto abaixo e copie.';
    });
    const h2 = el('h3', 'mesa-sub', '2. Que destino tem cada estratégia?'); h2.id = 'estrategias';
    const h3 = el('h3', 'mesa-sub', '3. Que destino tem cada trilha?'); h3.id = 'trilhas';
    const h0 = el('h3', 'mesa-sub', '1. Qual é o recorte?'); h0.id = 'recorte';
    const hp = el('h3', 'mesa-sub', 'O que falta decidir');
    const pendRoot = document.getElementById('decisao-pend');
    if (pendRoot) { pendRoot.replaceChildren(resumo, openList); root.replaceChildren(h0, scopes, q, h2, strats, h3, meter, lanes, copy, out, status); }
    else root.replaceChildren(hp, resumo, openList, h0, scopes, q, h2, strats, h3, meter, lanes, copy, out, status);
    drawScopes(); upd();
  }
  if (document.readyState === 'complete') start(); else document.addEventListener('DOMContentLoaded', start);
})();
