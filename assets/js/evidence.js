/* Biblioteca: dados tratados como texto, sem HTML vindo da planilha. */
'use strict';
(() => {
 const root=document.querySelector('#evidence-library');if(!root)return;
 const data=window.ESC_EVIDENCE;if(!data)return;
 const q=s=>root.querySelector(s), labels={evidence:'Evidência no modelo',association:'Associação observada',hypothesis:'Hipótese em aberto',pending:'Conferência pendente'};
 let mode='cards', filter='selected', axis='', page=0;const size=6;
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function el(tag,text,cls){const e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e;}
 function link(url,text){const a=el('a',text);a.href=url;a.rel='noopener noreferrer';return a;}
 function tag(kind,stale){return el('span',stale?'Fonte mudou · revisar síntese':labels[kind],'ev-tag ev-'+(stale?'pending':kind));}
 function detail(label,text){const p=el('p');p.append(el('strong',label+' '),document.createTextNode(text));return p;}
 function source(r){return r.url?link(r.url,r.authors+' · '+r.year+' ↗'):el('p',r.authors+' · Referência a conferir');}
 function card(r){
  const c=data.cards[r.id],node=el('article',null,'ev-card');node.id='ficha-'+r.id;
  node.append(tag(c?c.kind:'pending',!!(r.absent||r.conflict||(c&&c.stale))));
  node.append(el('h3',c&&!c.stale?c.headline:r.title));
  if(c&&!c.stale){
   node.append(el('p',c.model,'ev-model'),el('p',c.finding),detail('Limite:',c.limit));
   const d=el('details');d.append(el('summary','O que foi medido e conferido?'),detail('Exposição:',c.exposure),detail('Medida:',c.measured),detail('Revisão:',c.review),detail('Conferida em:',c.reviewed_on),source(r));node.append(d);
  }else{
   node.append(el('p',r.conflict?'Metadados divergentes entre registros da planilha. Conferir a referência antes de interpretar.':r.absent?'Não localizado na última leitura da origem. Registro preservado para revisão.':c?'Os metadados mudaram. A síntese anterior aguarda nova conferência.':'Referência importada. Modelo, resultados e limitações ainda precisam de fichamento. Não é evidência avaliada.'));
   node.append(source(r));
  }
  const trace=el('details',null,'ev-trace');trace.append(el('summary','Referência e rastreabilidade'),el('p',r.title),el('p','Identificadores: '+r.aliases.join(', ')),el('p','DOI: '+(r.doi||'a conferir')));if(r.axis)trace.append(el('p','Eixo sugerido (a validar): '+r.axis));if(c)trace.append(source(r));node.append(trace);
  return node;
 }
 function connection(c){
  const node=el('article',null,'ev-card');node.append(tag(c.kind,c.stale),el('h3',c.stale?'Conexão aguardando revisão':c.title),el('p',c.stale?'Uma fonte mudou. Esta conexão precisa ser revista antes de reutilizar a síntese.':c.summary),detail('Limite:',c.limit));
  const details=el('details');details.append(el('summary','Estudos relacionados'));
  c.sources.forEach(id=>{const r=data.records.find(x=>x.id===id);const p=el('p');p.append(source(r));details.append(p);});node.append(details);return node;
 }
 function render(){
  const term=normalize(q('#ev-search').value);
  let items=mode==='connections'?data.connections:data.records;
  items=items.filter(x=>{
   const c=mode==='cards'?data.cards[x.id]:null;const kind=(x.absent||x.conflict||(c&&c.stale)||x.stale)?'pending':c?c.kind:mode==='connections'?x.kind:'pending';
   if(filter==='selected'&&mode==='cards'&&!c)return false;
   if(axis&&mode==='cards'&&x.axis!==axis)return false;
   if(filter!=='all'&&filter!=='selected'&&filter!==kind)return false;
   return normalize(JSON.stringify([x.title,x.authors,x.axis,c&&c.topic,c&&c.headline,x.summary])).includes(term);
  });
  const pages=Math.max(1,Math.ceil(items.length/size));page=Math.min(page,pages-1);
  q('#ev-results').replaceChildren(...items.slice(page*size,(page+1)*size).map(x=>mode==='cards'?card(x):connection(x)));
  if(!items.length)q('#ev-results').append(el('p','Nenhum resultado. Tente outro assunto ou filtro.','ev-empty'));
  q('#ev-count').textContent=items.length+' '+(mode==='cards'?'fichas':'conexões')+' · página '+(page+1)+' de '+pages;
  q('#ev-prev').disabled=page===0;q('#ev-next').disabled=page===pages-1;
  q('#ev-scope').textContent=mode==='cards'?'Uma ficha ajuda a decidir o que ler. Não substitui o artigo nem registra leitura sua.':'Relações de estudos não formam automaticamente uma cadeia causal. Nenhuma hipótese foi escolhida por você aqui.';
 }
 q('#ev-date').textContent=(data.mode==='synthetic'?'DEMONSTRAÇÃO · dados sintéticos, sem importação publicada. ':'')+'Referências importadas em '+data.imported_on.split('-').reverse().join('/')+' · '+data.records.length+' registros únicos';
 root.querySelectorAll('[data-ev-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.evMode;page=0;filter='selected';q('#ev-filter').value=filter;root.querySelectorAll('[data-ev-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();}));
 const axes=[...new Set(data.records.map(r=>r.axis).filter(Boolean))].sort();
 if(axes.length){const label=el('label','Eixo sugerido (a validar)'),sel=el('select');sel.id='ev-axis';sel.append(el('option','Todos os eixos'));sel.firstChild.value='';axes.forEach(a=>{const o=el('option',a);o.value=a;sel.append(o);});sel.addEventListener('change',e=>{axis=e.target.value;page=0;if(axis&&filter==='selected'){filter='all';q('#ev-filter').value=filter;}render();});label.append(sel);q('.ev-controls').append(label);}
 q('#ev-search').addEventListener('input',()=>{page=0;render();});
 q('#ev-filter').addEventListener('change',e=>{filter=e.target.value;page=0;render();});
 for(const [id,delta] of [['#ev-prev',-1],['#ev-next',1]])q(id).addEventListener('click',()=>{page+=delta;render();q('#ev-count').focus();});
 render();
})();
