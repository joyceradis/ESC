/* ESC 2027 — cópia portátil, manual e local das anotações da autora.
   Nenhum dado é enviado ao GitHub, Drive ou servidor. */
'use strict';
(function () {
  const KEYS = ['esc-mesa-v1', 'esc-plano-v1', 'esc-decisao-v1'];
  const FORMAT = 'esc-atlas-anotacoes';
  const VERSION = 1;
  function validRecord(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  /* Confere o formato de cada seção antes de gravar: as páginas esperam textos e marcações, não números ou listas. */
  function isMap(v, test) { return validRecord(v) && Object.keys(v).every(function (k) { return test(v[k]); }); }
  const isStr = function (v) { return typeof v === 'string'; };
  const SHAPES = {
    'esc-mesa-v1': function (r) { return isMap(r, function (m) { return validRecord(m) && (m.state === undefined || ['', 'explorar', 'duvida', 'depois'].includes(m.state)) && (m.note === undefined || isStr(m.note)); }); },
    'esc-plano-v1': function (r) {
      return (r.plano === undefined || isMap(r.plano, function (v) { return typeof v === 'boolean'; })) && (r.esq === undefined || isMap(r.esq, isStr));
    },
    'esc-decisao-v1': function (r) {
      const dest = ['', 'entra', 'paralelo', 'depois'], abre = ['', 'aberta', 'ler', 'decidida'];
      const oneOf = function (list) { return function (v) { return list.includes(v); }; };
      return (r.escopo === undefined || ['', 'A', 'B', 'C', 'X'].includes(r.escopo)) && (r.pergunta === undefined || isStr(r.pergunta)) &&
        (r.lanes === undefined || isMap(r.lanes, oneOf(dest))) && (r.estr === undefined || isMap(r.estr, oneOf(dest))) &&
        (r.abertas === undefined || isMap(r.abertas, oneOf(abre)));
    }
  };
  function validate(doc) {
    if (!doc || doc.format !== FORMAT || doc.version !== VERSION || !validRecord(doc.records)) {
      throw new Error('Arquivo incompatível com esta versão do Atlas.');
    }
    const names = Object.keys(doc.records);
    if (!names.length || names.some(function (name) { return !KEYS.includes(name) || !validRecord(doc.records[name]); })) {
      throw new Error('A cópia não contém registros válidos do Atlas.');
    }
    if (names.some(function (name) { return !SHAPES[name](doc.records[name]); })) {
      throw new Error('A cópia tem campos em formato inesperado e não foi restaurada.');
    }
    return doc.records;
  }
  function start() {
    const root = document.getElementById('notes-backup-root');
    if (!root) return;
    const exportBtn = document.getElementById('notes-backup-export');
    const importInput = document.getElementById('notes-backup-import');
    const status = document.getElementById('notes-backup-status');
    function announce(message) { status.textContent = message; }
    function readRecords() {
      const records = {};
      KEYS.forEach(function (key) {
        const raw = localStorage.getItem(key);
        if (raw !== null) {
          const value = JSON.parse(raw);
          if (!validRecord(value)) throw new Error('Registro inválido: ' + key);
          records[key] = value;
        }
      });
      return records;
    }
    exportBtn.addEventListener('click', function () {
      try {
        const records = readRecords();
        const n = Object.keys(records).length;
        if (!n) { announce('Ainda não há registros neste navegador para exportar.'); return; }
        const payload = { format: FORMAT, version: VERSION, exportedAt: new Date().toISOString(), records: records };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ESC-anotacoes-' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
        announce('Cópia preparada com ' + n + ' seção(ões). Confira se o arquivo foi salvo antes de limpar este navegador.');
      } catch (e) { announce('Não foi possível gerar a cópia. Confira se o navegador permite armazenamento local.'); }
    });
    importInput.addEventListener('change', async function () {
      const file = importInput.files && importInput.files[0];
      if (!file) return;
      try {
        if (file.size > 256000) throw new Error('Arquivo maior que 256 KB; confira se é uma cópia do Atlas.');
        const records = validate(JSON.parse(await file.text()));
        const names = Object.keys(records);
        const existing = names.filter(function (key) { return localStorage.getItem(key) !== null; });
        if (existing.length && !window.confirm('Restaurar esta cópia substituirá as marcações destas seções neste navegador: ' + existing.length + '. Faça antes uma cópia dos registros atuais. Continuar?')) {
          announce('Restauração cancelada. Seus registros atuais foram preservados.'); return;
        }
        const previous = {};
        names.forEach(function (key) { previous[key] = localStorage.getItem(key); });
        try {
          names.forEach(function (key) { localStorage.setItem(key, JSON.stringify(records[key])); });
        } catch (e) {
          names.forEach(function (key) {
            try { if (previous[key] === null) localStorage.removeItem(key); else localStorage.setItem(key, previous[key]); } catch (_) {}
          });
          throw new Error('Falha ao gravar os registros; o Atlas tentou restaurar os anteriores.');
        }
        announce(names.length + ' seção(ões) restaurada(s) neste navegador. Reabra as páginas de Perguntas, Decisão e Plano para vê-las.');
      } catch (e) { announce('Cópia não restaurada: ' + (e && e.message ? e.message : 'arquivo inválido.')); }
      finally { importInput.value = ''; }
    });
    try {
      const n = Object.keys(readRecords()).length;
      announce(n ? n + ' seção(ões) de anotações encontradas neste navegador.' : 'Ainda não há anotações salvas neste navegador.');
    } catch (e) { announce('Não foi possível ler as anotações locais.'); }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { validate: validate };
  if (typeof document === 'undefined') return;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
