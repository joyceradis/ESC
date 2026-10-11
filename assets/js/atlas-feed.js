/* ESC: renderizador de notas curadas; dados estáticos gerados da fonte atlas/*.json */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const containers = Array.from(document.querySelectorAll('[data-atlas-notes]'));
    if (!containers.length) return;
    const notes = Array.isArray(window.ESC_ATLAS_DATA?.notes) ? window.ESC_ATLAS_DATA.notes : [];
    const labels = { pergunta: 'Pergunta aberta', metodo: 'Como estudar', evidencia: 'Evidência publicada', decisao: 'Decisão de organização' };
    const element = (tag, cls, value) => {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (value !== undefined) e.textContent = value;
      return e;
    };
    containers.forEach(root => {
      root.replaceChildren();
      if (!notes.length) {
        root.append(element('p', 'atlas-notes-empty', 'Nenhuma nota pública curada foi publicada ainda.'));
        return;
      }
      notes.slice(0, 4).forEach(note => {
        const card = element('article', 'atlas-note-item');
        const top = element('div', 'atlas-note-heading');
        top.append(element('span', 'atlas-note-kind', labels[note.category] || 'Conexão'), element('time', 'atlas-note-date', note.date.split('-').reverse().join('/')));
        card.append(top, element('h3', '', note.title), element('p', '', note.summary));
        const expanded = element('details', 'atlas-note-details');
        expanded.append(element('summary', '', 'Ver pergunta e proveniência'));
        expanded.append(element('p', '', note.question));
        const why = element('p', 'atlas-note-source', 'Base: ' + note.evidence + ' · Origem: ' + note.provenance);
        expanded.append(why);
        const a = element('a', 'atlas-note-cta', 'Explorar no atlas ↗');
        a.href = note.link;
        card.append(expanded, a);
        root.append(card);
      });
    });
  });
})();
