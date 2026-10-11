/* ESC 2027 · Barreira visual de acesso no navegador.
   NÃO é autenticação: arquivos HTML/JS continuam públicos no GitHub Pages.
   Não coleta nem transmite a senha; guarda apenas a liberação temporária na sessão. */
'use strict';
(function () {
  var KEY = 'esc-atlas-access-v1';
  var EXPECTED_SHA256 = '9814d14a56595a2e2d7557d8e23cfd1a822634dd4725179d07e18ee30c6f9609';
  try {
    if (sessionStorage.getItem(KEY) === 'yes') return;
  } catch (_) { /* Sessão restrita pelo navegador: a tela ainda funciona. */ }
  document.documentElement.classList.add('esc-access-locked');
  var style = document.createElement('style');
  style.textContent = [
    'html.esc-access-locked{background:#f9f5f3}',
    'html.esc-access-locked body{overflow:hidden}',
    'html.esc-access-locked body>:not(#esc-access-gate){display:none!important}',
    '#esc-access-gate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;overflow-y:auto;padding:28px 18px;background:radial-gradient(circle at 12% 10%,#f0dadd 0,transparent 36%),radial-gradient(circle at 90% 90%,#f5e7e5 0,transparent 30%),#f9f5f3;color:#302328;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
    '#esc-access-gate *{box-sizing:border-box}',
    '#esc-access-gate .esc-card{width:min(100%,420px);background:#fffdfb;border:1px solid #e9dcde;border-radius:24px;box-shadow:0 22px 75px rgba(80,20,38,.12);padding:clamp(28px,7vw,47px)}',
    '#esc-access-gate .esc-mark{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:#501426;color:#f5d1d9;font:italic 29px Georgia,serif;margin-bottom:25px}',
    '#esc-access-gate .esc-eyebrow{color:#92233d;font-size:11px;font-weight:750;letter-spacing:.19em;text-transform:uppercase}',
    '#esc-access-gate h1{font:normal clamp(35px,9vw,45px)/1.1 Georgia,"Times New Roman",serif;letter-spacing:-.04em;margin:13px 0}',
    '#esc-access-gate h1 em{color:#92233d;font-weight:normal}',
    '#esc-access-gate .esc-desc{font-size:14px;line-height:1.7;color:#73666a;margin:0 0 27px}',
    '#esc-access-gate label{display:block;font-weight:700;font-size:12px;color:#501426;margin:0 0 9px}',
    '#esc-access-gate .esc-inputline{display:flex;align-items:center;gap:4px;border:1px solid #d9c7cb;border-radius:13px;background:#fff;overflow:hidden}',
    '#esc-access-gate .esc-inputline:focus-within{outline:2px solid #aa3850;outline-offset:2px}',
    '#esc-access-gate input{min-width:0;flex:1;border:0;outline:0;padding:15px 14px;color:#302328;font-size:15px;background:transparent}',
    '#esc-access-gate .esc-toggle{border:0;background:transparent;padding:13px;color:#92233d;font-size:12px;font-weight:650;cursor:pointer}',
    '#esc-access-gate .esc-enter{width:100%;margin-top:15px;border:0;border-radius:99px;background:#92233d;color:#fff;font:700 14px system-ui,sans-serif;cursor:pointer;padding:15px 18px;transition:background .15s}',
    '#esc-access-gate .esc-enter:hover{background:#6f1b31}',
    '#esc-access-gate .esc-enter:disabled{opacity:.6;cursor:wait}',
    '#esc-access-gate .esc-error{min-height:22px;margin:12px 0 0;color:#a72b43;font-size:12px;line-height:1.5}',
    '#esc-access-gate .esc-foot{border-top:1px solid #eee4e5;margin-top:25px;padding-top:18px;font-size:11px;line-height:1.6;color:#8b777d}',
    '#esc-access-gate button:focus-visible,#esc-access-gate input:focus-visible{outline:2px solid #92233d;outline-offset:3px}'
  ].join('');
  document.head.appendChild(style);

  function show() {
    var gate = document.createElement('section');
    gate.id = 'esc-access-gate';
    gate.setAttribute('aria-label', 'Acesso ao Atlas ESC');
    gate.innerHTML = [
      '<div class="esc-card">',
      '<div class="esc-mark" aria-hidden="true">E</div>',
      '<div class="esc-eyebrow">ESC 2027 · Research Atlas</div>',
      '<h1>Um espaço <em>reservado.</em></h1>',
      '<p class="esc-desc">Digite a senha para entrar no seu atlas de pesquisa.</p>',
      '<form id="esc-access-form" autocomplete="off">',
      '<label for="esc-access-password">Senha de acesso</label>',
      '<div class="esc-inputline"><input id="esc-access-password" type="password" inputmode="text" autocapitalize="off" autocomplete="off" spellcheck="false" required placeholder="Sua senha">',
      '<button class="esc-toggle" id="esc-access-toggle" type="button" aria-label="Mostrar senha">Mostrar</button></div>',
      '<button class="esc-enter" id="esc-access-enter" type="submit">Entrar no atlas &rarr;</button>',
      '<p class="esc-error" id="esc-access-error" role="status" aria-live="polite"></p>',
      '</form>',
      '<div class="esc-foot">Atelier científico · Joyce Radis<br>Entrada pessoal de conveniência.</div>',
      '</div>'
    ].join('');
    document.body.appendChild(gate);
    var form = document.getElementById('esc-access-form');
    var input = document.getElementById('esc-access-password');
    var toggle = document.getElementById('esc-access-toggle');
    var button = document.getElementById('esc-access-enter');
    var error = document.getElementById('esc-access-error');
    toggle.addEventListener('click', function () {
      var reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      toggle.textContent = reveal ? 'Ocultar' : 'Mostrar';
      toggle.setAttribute('aria-label', reveal ? 'Ocultar senha' : 'Mostrar senha');
    });
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      error.textContent = '';
      button.disabled = true;
      try {
        if (!window.crypto || !window.crypto.subtle) {
          throw new Error('A validação requer uma conexão HTTPS.');
        }
        var data = new TextEncoder().encode(input.value.trim());
        var digest = await window.crypto.subtle.digest('SHA-256', data);
        var hex = Array.from(new Uint8Array(digest)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
        if (hex !== EXPECTED_SHA256) {
          error.textContent = 'Senha incorreta. Tente novamente.';
          input.select();
          return;
        }
        try { sessionStorage.setItem(KEY, 'yes'); } catch (_) {}
        document.documentElement.classList.remove('esc-access-locked');
        gate.remove();
      } catch (e) {
        error.textContent = e.message || 'Não foi possível validar a senha.';
      } finally {
        button.disabled = false;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', show, { once: true });
  } else {
    show();
  }
})();