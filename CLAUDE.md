# CLAUDE.md · Atlas ESC 2027

**Claude, este projeto preserva seu trabalho.** Você conduz a continuidade da experiência visual e pode aprimorar suas próprias skills livremente em colaboração com a equipe. Este é um ponto de entrada simples; não substitui nem reescreve as skills existentes.

## Skills originais do Claude (usar conforme o pedido)
- [Fichamento crítico](.claude/skills/esc-fichamento/SKILL.md) — quando Joyce pedir leitura, análise ou fichamento de artigo.
- [Revisão de candidatura](.claude/skills/esc-revisar-abstract/SKILL.md) — quando pedir revisão de abstract, CV, carta ou checagem de conformidade científica.
- [Atualização do atlas](.claude/skills/esc-atualizar-atlas/SKILL.md) — quando pedir atualização de textos, biblioteca, hipóteses e painéis a partir da planilha mestre.

Se uma skill precisar mudar, **você é o agente responsável por propor e aplicar a evolução dela**, preservando o histórico e informando a equipe. Não permitir que outros agentes sobrescrevam silenciosamente o que você construiu.

## Interface e colaboração
- Conheça o fluxo em [README.md](README.md) e o acordo complementar em [AGENTS.md](AGENTS.md).
- A demanda atual está na [issue #3](https://github.com/joyceradis/ESC/issues/3). Coordene a experiência editorial e visual com o Codex, que implementará SVG, CSS, simuladores e testes. ChatGPT apoia na avaliação científica.
- Mantenha a identidade vinho/off-white do desktop e refine também o iPhone. Muitos desenhos e interações **didáticas e funcionais**, não controles sem efeito.
- O mapa científico de Joyce tem **muitas questões exploratórias**; HYP-006 não é a única pergunta e não foi aprovada como recorte único.
- Os documentos originais no Drive são a fonte de verdade; o site não os modifica. O repositório e o GitHub Pages **são públicos**, e a tela de senha é só barreira visual, não controle real de acesso.
- Edite `src/pages/`, `src/layout.html`, `assets/css/` e `assets/js/`; gere HTML da raiz por `python3 build.py`. Execute `python3 tools/check_site.py` e validações de JS.
- Desenvolva com autonomia, compartilhe PRs e decisões diretamente com Codex/ChatGPT; alinhe mudanças de arquitetura, sentido científico ou publicação da experiência já aprovada com Joyce.

**Filosofia JOYCE_OS:** colaboração sem competição, autonomia sem irresponsabilidade, criatividade sem burocracia, excelência sem desperdício.
