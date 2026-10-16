# CLAUDE.md · Atlas ESC 2027

> **Claude: regras vigentes antes de qualquer tarefa.** Leia [AGENTS.md](AGENTS.md). Duas regras valem sempre:
> 1. **JOYCE_OS · dispositivos pessoais:** desenvolvimento **somente remoto**. Não usar RAM/CPU/disco do Mac/iPhone, não criar pastas/clones/caches nem iniciar processos locais. Se uma operação exigir execução em máquina pessoal, pare e peça a Joyce.
> 2. **Executor único (desde 11/10/2026):** você é o único agente deste repositório e só segue instruções da Joyce na sessão. Não há colaboração com Codex, ChatGPT, Gemini ou outros agentes nesta base.

## Skills do projeto
- [Fichamento crítico](.claude/skills/esc-fichamento/SKILL.md) — leitura, análise ou fichamento de artigo.
- [Revisão de candidatura](.claude/skills/esc-revisar-abstract/SKILL.md) — revisão de abstract, CV, carta ou checagem de conformidade científica.
- [Atualização do atlas](.claude/skills/esc-atualizar-atlas/SKILL.md) — atualização de textos, biblioteca, hipóteses e painéis a partir da planilha mestre.

Se uma skill precisar mudar, proponha a mudança à Joyce e preserve o histórico.

## Revisão visual remota proposta

A [documentação de revisão visual](docs/revisao-visual.md) aponta para o workflow e os testes de desktop/celular em proposta na branch/PR #17. Conferir resultados e capturas quando disponíveis; preservar a curadoria estética existente. O PR não concede autorização de merge, deploy, troca de executor ou alteração do design. Enquanto não integrado, a rotina não está disponível na `main`.

## Interface
- Fluxo do produto em [README.md](README.md).
- Mantenha a identidade vinho/off-white do desktop e refine também o iPhone. Desenhos e interações **didáticas e funcionais**, não controles sem efeito.
- **Objetivo prioritário: conquistar a vaga no ESC Fund 2027.** O mapa científico contém várias perguntas exploratórias; nenhum recorte está aprovado. HYP-006 permanece hipótese. A sequência microgravidade → titina → ICFEp não pode ser apresentada automaticamente como origem autoral.
- **Joyce quer decidir na página existente `Decisão`.** Quando solicitado apoio à escolha, prepare ali uma comparação sustentada pelas fontes e uma recomendação justificada, com alternativas, limites e consequência para a candidatura. Não espere a escolha para entregar a análise. Aprovação é da Joyce; recomendação do agente não muda o status para decidido.
- Antes de pedir dados, procure nos documentos existentes do Drive, inclusive CV e carta. Não pedir novamente ORCID/Lattes já registrados. Não publicar conteúdo privado desses documentos no repositório público.
- Não criar outra planilha, relatório ou arquitetura para substituir essa experiência. Preserve o visual aprovado e concilie branches/PRs existentes antes de alterar a interface.
- Os documentos originais no Drive são a fonte de verdade; o site não os modifica. O repositório e o GitHub Pages **são públicos**, e a tela de senha é só barreira visual, não controle real.
- Gere HTML da raiz por `python3 build.py`; valide com `python3 tools/check_site.py` e `node --test tests/*.test.mjs`.
- Trabalhe em branch e PR; o merge na `main` é da Joyce.
