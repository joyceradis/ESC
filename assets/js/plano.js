/* Plano até 23/10 e esqueleto da candidatura — para a página "De onde parei".
   Só estrutura e perguntas do método. O que a autora escreve fica neste navegador (localStorage); nada é enviado nem publicado. */
'use strict';
(function () {
  const KEY = 'esc-plano-v1';
  const PLANO = [
    ['15–16/10', [['p1', 'Escolher a pergunta da candidatura'], ['p2', 'Escrever a pergunta e a hipótese falseável'], ['p3', 'Fichar Pahakis e van Heerebeek']]],
    ['17–18/10', [['p4', 'Fazer a busca de anterioridade e registrar o que já existe'], ['p5', 'Definir desfecho principal, controles e o que refutaria'], ['p6', 'Ler Rocha-Oliveira e Packer']]],
    ['19–20/10', [['p7', 'Fechar o abstract em português'], ['p8', 'Atualizar o CV e escrever a carta de motivação'], ['p9', 'Traduzir as três peças para o inglês']]],
    ['21–22/10', [['p10', 'Conferir regras do edital e limites de texto'], ['p11', 'Revisar integridade: nada de resultado inventado nem leitura não feita'], ['p12', 'Enviar com folga e guardar o comprovante']]],
    ['23/10', [['p13', 'Prazo oficial. O horário-limite não está confirmado: conferir na página da ESC']]]
  ];
  const ESQ = [
    ['p', 'Pergunta em uma frase', 'Sem ligar dois fenômenos com “e”. O que o trabalho tenta responder.'],
    ['h', 'Hipótese falseável', 'A previsão: se X, então Y mudaria em tal direção.'],
    ['alt', 'Explicação concorrente', 'O que mais explicaria o mesmo resultado?'],
    ['modelo', 'Modelo e exposição', 'Célula ou tecido, fluxo, tempo. Voo real não é microgravidade simulada.'],
    ['desfecho', 'Desfecho principal e como mede', 'Compartimento, método, unidade. Desfecho clínico não prova mediador.'],
    ['controles', 'Controles', 'Negativos, positivos e do dispositivo.'],
    ['refuta', 'O que refutaria a hipótese', 'Que resultado faria você abandonar a ideia?'],
    ['limites', 'Limites', 'O que o experimento não pode afirmar.'],
    ['novo', 'O que ainda não existe', 'Só afirme depois da busca de anterioridade.'],
    ['recursos', 'Recursos realistas', 'O que já existe ou estará disponível no curso.']
  ];

  function progress(plano) {
    const ids = PLANO.flatMap(function (d) { return d[1].map(function (i) { return i[0]; }); });
    return Math.round(100 * ids.filter(function (id) { return plano[id]; }).length / ids.length);
  }
  function filled(esq) { return ESQ.filter(function (f) { return (esq[f[0]] || '').trim(); }).length; }
  function summary(esq) {
    return ESQ.map(function (f) { return f[1] + ':\n' + ((esq[f[0]] || '').trim() || '(em branco)'); }).join('\n\n');
  }

  const api = { progress: progress, filled: filled, summary: summary, PLANO: PLANO, ESQ: ESQ };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; } }

  function start() {
    const root = document.getElementById('plano-root'); if (!root) return;
    const S = load(); S.plano = S.plano || {}; S.esq = S.esq || {};
    const status = el('p', 'mesa-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const pct = el('p', 'mesa-sub'); const bar = el('div', 'plano-bar'); const fill = el('i'); bar.append(fill);
    /* Salva em silêncio ao digitar; só anuncia depois de uma pausa, para o leitor de tela não repetir a mensagem a cada tecla. */
    let anuncio; let salvou = true;
    const persist = function () { salvou = save(S); clearTimeout(anuncio); anuncio = setTimeout(function () { status.textContent = salvou ? 'Salvo só neste navegador. Nada é enviado.' : 'Não foi possível salvar neste navegador.'; }, 1200); };
    const upd = function () { const p = progress(S.plano); pct.textContent = 'Plano: ' + p + '% · faltam ' + Math.max(0, Math.ceil((new Date('2026-10-23T23:59:00-03:00') - new Date()) / 86400000)) + ' dias'; fill.style.width = p + '%'; };

    const days = el('div', 'plano-days');
    PLANO.forEach(function (d) {
      const box = el('div', 'plano-day'); box.append(el('h3', '', d[0]));
      d[1].forEach(function (i) {
        const lab = el('label', 'plano-row'); const c = el('input'); c.type = 'checkbox'; c.checked = !!S.plano[i[0]];
        c.addEventListener('change', function () { S.plano[i[0]] = c.checked; persist(); upd(); });
        lab.append(c, el('span', '', i[1])); box.append(lab);
      });
      days.append(box);
    });

    const meter = el('p', 'mesa-status'); const updE = function () { meter.textContent = filled(S.esq) + ' de ' + ESQ.length + ' campos preenchidos.'; };
    const form = el('div', 'plano-form');
    ESQ.forEach(function (f) {
      const lab = el('label', 'plano-field'); lab.append(el('span', '', f[1]), el('small', '', f[2]));
      const t = el('textarea'); t.rows = 3; t.value = S.esq[f[0]] || '';
      t.addEventListener('input', function () { S.esq[f[0]] = t.value; persist(); updE(); });
      lab.append(t); form.append(lab);
    });
    const copy = el('button', 'mesa-btn', 'Copiar o esqueleto'); copy.type = 'button';
    const out = el('pre', 'mesa-text'); out.hidden = true;
    copy.addEventListener('click', function () {
      const t = summary(S.esq); out.textContent = t; out.hidden = false;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { status.textContent = 'Copiado.'; }, function () { status.textContent = 'Selecione o texto abaixo e copie.'; });
      else status.textContent = 'Selecione o texto abaixo e copie.';
    });

    root.replaceChildren(pct, bar, days, el('h3', 'mesa-sub', 'Esqueleto da candidatura'), meter, form, copy, out, status);
    upd(); updE();
  }
  if (document.readyState === 'complete') start(); else document.addEventListener('DOMContentLoaded', start);
})();
