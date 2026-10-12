/* ESC 2027 · Barreira visual de acesso no navegador.
   NÃO é autenticação: arquivos HTML/JS continuam públicos no GitHub Pages.
   Não coleta nem transmite a senha; guarda apenas uma preferência de entrada com prazo, nunca a senha. */
'use strict';
(function () {
  var KEY = 'esc-atlas-access-v2';
  var EXPECTED_SHA256 = 'd8c3478284cbb46033065aba10d8146851ae8cea876a4b26ecedd672bfc2d485';
  var REMEMBER_KEY = 'esc-atlas-remember-v1';
  var FORGET_KEY = 'esc-atlas-forget-v1';
  // Incrementar ao alterar a senha para invalidar lembranças anteriores.
  var REVISION = 'access-2026-10-v1';
  var DURATION = 30 * 24 * 60 * 60 * 1000;

  function sessionAllowed() {
    try { return sessionStorage.getItem(KEY) === 'yes'; } catch (_) { return false; }
  }
  function clearSession() {
    try { sessionStorage.removeItem(KEY); } catch (_) {}
  }
  function remembered() {
    var raw;
    try { raw = localStorage.getItem(REMEMBER_KEY); } catch (_) { return false; }
    if (raw === null) return false;
    try {
      var saved = JSON.parse(raw);
      if (saved && saved.revision === REVISION &&
          Number.isFinite(saved.expiresAt) &&
          saved.expiresAt > Date.now() &&
          saved.expiresAt <= Date.now() + DURATION) return true;
    } catch (_) {}
    // Um registro inválido não pode ser contornado por uma sessão antiga.
    clearSession();
    try { localStorage.removeItem(REMEMBER_KEY); } catch (_) {}
    return false;
  }
  function rememberEntry(enabled) {
    clearSession();
    if (enabled) {
      try {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({
          revision: REVISION, expiresAt: Date.now() + DURATION
        }));
        return;
      } catch (_) { /* Sem persistência, continuar somente nesta sessão. */ }
    } else {
      try { localStorage.removeItem(REMEMBER_KEY); } catch (_) {}
    }
    try { sessionStorage.setItem(KEY, 'yes'); } catch (_) {}
  }
  function forget() {
    clearSession();
    try {
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.setItem(FORGET_KEY, String(Date.now()) + '-' + Math.random());
    } catch (_) {}
    window.location.reload();
  }
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else { fn(); }
  }
  function addForgetControl() {
    var footer = document.querySelector('.footer');
    if (!footer || document.getElementById('esc-access-forget')) return;
    var control = document.createElement('button');
    control.id = 'esc-access-forget';
    control.type = 'button';
    control.textContent = 'Esquecer este navegador';
    control.style.cssText = 'font:inherit;color:inherit;background:transparent;border:1px solid currentColor;border-radius:8px;padding:10px 12px;cursor:pointer;min-height:44px';
    control.addEventListener('click', forget);
    footer.appendChild(control);
  }
  window.addEventListener('storage', function (event) {
    if (event.key === FORGET_KEY ||
        event.key === null ||
        (event.key === REMEMBER_KEY && event.newValue === null)) {
      clearSession();
      window.location.reload();
    }
  });

  // Persistência verificada ao abrir/recarregar; visitas não renovam o prazo.
  if (remembered() || sessionAllowed()) {
    ready(addForgetControl);
    return;
  }
  document.documentElement.classList.add('esc-access-locked');
  var style = document.createElement('style');
  style.textContent = [
    'html.esc-access-locked{background:#501426}',
    'html.esc-access-locked body{overflow:hidden;background:#501426}',
    'html.esc-access-locked body>:not(#esc-access-gate){display:none!important}',
    '#esc-access-gate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;overflow-y:auto;padding:28px 18px;background:radial-gradient(circle at 85% 12%,rgba(235,161,178,.16) 0,transparent 38%),radial-gradient(circle at 8% 88%,rgba(255,230,233,.08) 0,transparent 43%),#501426;color:#fff1f3;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
    '#esc-access-gate *{box-sizing:border-box}',
    '#esc-access-gate .esc-card{width:min(100%,420px);background:#661d35;border:1px solid rgba(245,191,204,.27);border-radius:24px;box-shadow:0 22px 75px rgba(22,3,11,.26);padding:clamp(28px,7vw,47px)}',
    '#esc-access-gate .esc-mark{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:#852a47;color:#ffe8ee;border:1px solid rgba(255,224,232,.35);font:italic 29px Georgia,serif;margin-bottom:25px}',
    '#esc-access-gate .esc-eyebrow{color:#f0b5c3;font-size:11px;font-weight:750;letter-spacing:.19em;text-transform:uppercase}',
    '#esc-access-gate h1{font:normal clamp(35px,9vw,45px)/1.1 Georgia,"Times New Roman",serif;letter-spacing:-.04em;margin:13px 0;color:#fff4f5}',
    '#esc-access-gate h1 em{color:#f1b6c5;font-weight:normal}',
    '#esc-access-gate .esc-desc{font-size:14px;line-height:1.7;color:#f0c6d0;margin:0 0 27px}',
    '#esc-access-gate label{display:block;font-weight:700;font-size:12px;color:#ffe2e9;margin:0 0 9px}',
    '#esc-access-gate .esc-inputline{display:flex;align-items:center;gap:4px;border:1px solid #dba9b7;border-radius:13px;background:#fff9f9;overflow:hidden}',
    '#esc-access-gate .esc-inputline:focus-within{outline:2px solid #ffd3dd;outline-offset:2px}',
    '#esc-access-gate input{min-width:0;flex:1;border:0;outline:0;padding:15px 14px;color:#302328;font-size:15px;background:transparent}',
    '#esc-access-gate .esc-remember{display:flex;align-items:center;gap:10px;margin:15px 0 0;font-size:12px;line-height:1.5;min-height:44px;cursor:pointer}',
    '#esc-access-gate .esc-remember input{flex:none;width:18px;height:18px;padding:0;accent-color:#b93555}',
    '#esc-access-gate .esc-toggle{border:0;background:transparent;padding:13px;color:#7d203d;font-size:12px;font-weight:650;cursor:pointer}',
    '#esc-access-gate .esc-enter{width:100%;margin-top:15px;border:0;border-radius:99px;background:#b93555;color:#fff;font:700 14px system-ui,sans-serif;cursor:pointer;padding:15px 18px;transition:background .15s}',
    '#esc-access-gate .esc-enter:hover{background:#cd4767}',
    '#esc-access-gate .esc-enter:disabled{opacity:.6;cursor:wait}',
    '#esc-access-gate .esc-error{min-height:22px;margin:12px 0 0;color:#ffd0da;font-size:12px;line-height:1.5}',
    '#esc-access-gate .esc-foot{border-top:1px solid rgba(255,225,234,.2);margin-top:25px;padding-top:18px;font-size:11px;line-height:1.6;color:#eeb5c3}',
    '#esc-access-gate button:focus-visible,#esc-access-gate input:focus-visible{outline:2px solid #ffe2e9;outline-offset:3px}'
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
      '<h1>Seu atlas, <em>seu espaço.</em></h1>',
      '<p class="esc-desc">Uma senha e você continua de onde parou.</p>',
      '<form id="esc-access-form" autocomplete="off">',
      '<label for="esc-access-password">Senha de acesso</label>',
      '<div class="esc-inputline"><input id="esc-access-password" type="password" inputmode="text" autocapitalize="off" autocomplete="off" spellcheck="false" required placeholder="Sua senha">',
      '<button class="esc-toggle" id="esc-access-toggle" type="button" aria-label="Mostrar senha">Mostrar</button></div>',
      '<label class="esc-remember"><input id="esc-access-remember" type="checkbox" checked> Lembrar neste navegador por 30 dias</label>',
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
        rememberEntry(document.getElementById('esc-access-remember').checked);
        input.value = '';
        document.documentElement.classList.remove('esc-access-locked');
        gate.remove();
        addForgetControl();
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