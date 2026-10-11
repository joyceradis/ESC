# Atlas ESC · como a conversa vira uma atualização

**A mesma lógica da Constelação, aplicada ao ESC:**
conversa ou leitura → agente autorizado seleciona um insight público → salva nota com proveniência em `atlas/notas/` → GitHub valida e regenera `assets/js/atlas-dados.js` durante o build → GitHub Pages publica → cartões aparecem na home e no laboratório.

## O que é automático (e o que não é)
- **Automático:** regenerar os cartões e dados **após um commit** nas fontes. Os pipelines `.github/workflows/verificar-site.yml` e `.github/workflows/jekyll-gh-pages.yml` executam `python3 build.py`, que chama `tools/build_atlas_data.py`.
- **Não automático:** ler esta conversa, outras conversas ou documentos privados. O Claude, a pedido da Joyce, precisa **registrar intencionalmente** a nota em GitHub após a discussão. Outros agentes não registram notas (regra de executor único em `AGENTS.md`). Não há vigilância contínua nem acesso silencioso a dados sensíveis.
- A página do GitHub Pages é **pública**. A senha atual apenas dificulta acesso casual e **não** protege o conteúdo do repositório.

## Para o executor (fluxo enxuto)
1. Ler `atlas/estudos-gel.json` (medidas publicadas) e `atlas/notas/` (notas já existentes); **buscar duplicatas** antes de criar arquivos.
2. Selecionar apenas uma pergunta, evidência bibliográfica ou decisão de método que Joyce pediu para registrar. **Nunca** salvar transcrições, ideias confidenciais ainda inéditas, dados de pacientes, mensagens privadas, API keys ou trechos de documentos clínicos.
3. Uma nota por arquivo `atlas/notas/AAAA-MM-DD-slug.json`. Usar campos: `schema_version:1`, `id`, `date`, `title`, `category` (`pergunta`, `metodo`, `evidencia`, `decisao`), `summary`, `question`, `link` relativo, `evidence`, `provenance`, `status` (`publicado` ou `rascunho`) e `privacy:"public-knowledge"`. **Mesmo rascunhos no GitHub público são visíveis no código.**
4. Uma nova fonte científica vai em `atlas/estudos-gel.json` com DOI, método, espécie/células, unidade, incerteza quando publicada, limitações. Não fabricar medidas ausentes nem tratar AFM/PBR/permeabilidade como equivalentes.
5. Se encontrar nota existente, modificar com histórico no lugar de duplicar. Registrar o que mudou e por quê.
6. **Não editar** `assets/js/atlas-dados.js` nem HTML gerado: são derivados. Rodar `python3 build.py && python3 tools/check_site.py && node --test tests/*.test.mjs`. Push ou PR gera CI e publicação automaticamente.
7. Toda hipótese deve permanecer identificada como `pergunta` ou `proposta` até haver evidência direta. Registro no Atlas **não implica assimilação na Constelação**.

## Diferenças científicas importantes
- **Marsh & Waugh (2013):** AFM em HUVEC sob fluxo; camada luminal de **380 ± 50 nm**, módulo **0,7 ± 0,5 kPa**, corpo celular **16 ± 6 kPa**; cultura sob **1 Pa**, viscosidade do meio **1 mPa·s**. DOI `10.3791/50163`.
- **Delgadillo, Marsh & Waugh (2020):** outro ajuste AFM, **110 nm** e **0,025 kPa**. DOI `10.1016/j.bpj.2020.02.010`.
- Não são valores normais populacionais, nem calibram a permeabilidade hidráulica `k` usada na analogia de Darcy. Na interface, distinguir **dado publicado**, **resultado de fórmula** e **pergunta da autora**.

**Escopo e autoria:** a autoria científica permanece de Joyce. Desde 11/10/2026 a execução técnica é só do Claude; o histórico de contribuições anteriores fica no README. Preservar `.claude/skills/`, a planilha mestre e a pasta do Drive originais.
