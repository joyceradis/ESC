# CLAUDE.md · Atlas ESC 2027

> **Claude: regras vigentes antes de qualquer tarefa.** Leia [AGENTS.md](AGENTS.md). Duas regras valem sempre:
> 1. **JOYCE_OS · dispositivos pessoais:** desenvolvimento **somente remoto**. Não usar RAM/CPU/disco do Mac/iPhone, não criar pastas/clones/caches nem iniciar processos locais. Se uma operação exigir execução em máquina pessoal, pare e peça a Joyce.
> 2. **Executor único (desde 11/10/2026):** você é o único agente deste repositório e só segue instruções da Joyce na sessão. Não há colaboração com Codex, ChatGPT, Gemini ou outros agentes nesta base.

## Skills do projeto
- [Fichamento crítico](.claude/skills/esc-fichamento/SKILL.md) — leitura, análise ou fichamento de artigo.
- [Revisão de candidatura](.claude/skills/esc-revisar-abstract/SKILL.md) — revisão de abstract, CV, carta ou checagem de conformidade científica.
- [Atualização do atlas](.claude/skills/esc-atualizar-atlas/SKILL.md) — atualização de textos, biblioteca, hipóteses e painéis a partir da planilha mestre.

Se uma skill precisar mudar, proponha a mudança à Joyce e preserve o histórico.

## Revisão visual remota

A [documentação de revisão visual](docs/revisao-visual.md) aponta para workflow e testes integrados pelo [PR #17](https://github.com/joyceradis/ESC/pull/17) em 12/10/2026. A rotina está na `main` e sua execução é manual (`workflow_dispatch`). Conferir resultados e capturas do SHA aplicável; presença do workflow não comprova execução nem concede autorização de merge, deploy, troca de executor ou alteração do design.

## Interface
- Fluxo do produto em [README.md](README.md).
- Mantenha a identidade vinho/off-white do desktop e refine também o iPhone. Desenhos e interações **didáticas e funcionais**, não controles sem efeito.
- **Objetivo prioritário: conquistar a vaga no ESC Fund 2027.** **Recorte decidido pela Joyce em 16/10/2026** (título e link do abstract em `ESC.project`, `assets/js/data.js`). O mapa científico continua com perguntas exploratórias, mas o recorte da candidatura não se reabre sem ela. HYP-006 permanece hipótese. A sequência microgravidade → titina → ICFEp não pode ser apresentada automaticamente como origem autoral.
- **Joyce quer decidir na página existente `Decisão`.** Quando solicitado apoio à escolha, prepare ali uma comparação sustentada pelas fontes e uma recomendação justificada, com alternativas, limites e consequência para a candidatura. Não espere a escolha para entregar a análise. Aprovação é da Joyce; recomendação do agente não muda o status para decidido (o status atual veio da decisão explícita dela).
- Antes de pedir dados, procure nos documentos existentes do Drive, inclusive CV e carta. Não pedir novamente ORCID/Lattes já registrados. Não publicar conteúdo privado desses documentos no repositório público.
- Não criar outra planilha, relatório ou arquitetura para substituir essa experiência. Preserve o visual aprovado e concilie branches/PRs existentes antes de alterar a interface.
- Os documentos originais no Drive são a fonte de verdade; o site não os modifica. O repositório e o GitHub Pages **são públicos**, e a tela de senha é só barreira visual, não controle real.
- Gere HTML da raiz por `python3 build.py`; valide com `python3 tools/check_site.py` e `node --test tests/*.test.mjs`.
- Trabalhe em branch e PR; siga a [exceção de interface de 15/10 em AGENTS.md](AGENTS.md#autonomia-do-executor-e-segurança-vigente-desde-15102026-decisão-da-joyce). Ela não autoriza merge genérico por dois checks verdes: respeite os checks exigidos, o relatório da triagem, threads bloqueantes, arquivos científicos/críticos e restrições posteriores de Joyce.
- **Replicar para outra pesquisa:** siga "Como replicar" no [README.md](README.md); o conteúdo específico do projeto fica em `ESC.project` e nos registros de `assets/js/data.js`.
