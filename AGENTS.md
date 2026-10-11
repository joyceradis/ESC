# AGENTS.md · ESC 2027 Research 

> **REGRA CANÔNICA JOYCE_OS · DISPOSITIVOS PESSOAIS (VIGENTE, 11/10/2026)** — [Política transversal](https://docs.google.com/document/d/16wZiKPW85UShS18exc7I1-1TuOZeiigcB1gcDSpCgBY/edit) (documento privado; **este resumo é obrigatório mesmo sem acesso ao Drive**). Mac e iPhone de Joyce **não são infraestrutura dos agentes**. Desenvolvimento apenas na nuvem/GitHub/CI. Não executar agentes, servidores, builds, testes, automações, indexadores, nem criar clones, worktrees, pastas, caches ou downloads nos aparelhos; não consumir deliberadamente RAM/CPU/disco nem acessar telas, clipboard ou arquivos locais. **Exceção só com autorização expressa, prévia e específica da Joyce**, em palavras inequívocas, depois de explicar em português simples motivo, ações, caminhos, recursos, duração e encerramento. Pedido genérico, silêncio, emoji, acesso técnico e consentimento antigo não autorizam. Sem autorização: **parar e pedir**, não usar o Mac como alternativa. Não inventariar ou apagar pastas preexistentes sem autorização separada. Esta regra prevalece sobre “preferir nuvem”; documento não encerra processos locais nem muda permissões do macOS.


> **Autoria científica:** Joyce Radis. **Engenharia colaborativa:** Claude + Codex + ChatGPT. Este arquivo orienta o Codex e qualquer agente de desenvolvimento sem substituir as instruções individuais dos demais.

## Onde começar (leitura curta)
1. `README.md` explica o produto e as fontes. A visão da autora inclui **múltiplas perguntas em aberto**, não apenas HYP-006.
2. `src/layout.html`, `src/pages/` e `assets/css/style.css` contêm a interface; `assets/js/app.js` e `assets/js/data.js` contêm comportamento e espelho de dados. `build.py` gera os HTML da raiz.
3. `.claude/skills/` contém as **skills do Claude**; conservar, consultar e convidar o Claude para alterações nesse escopo.
4. **Issue #3:** https://github.com/joyceradis/ESC/issues/3 — backlog atual de interface, diagramas e simuladores. ONDE PRECISAMOS MELHORAR ISSO 

## Autonomia com BOM SENSO E POLITICA DE BOAS PRATICAS
- implementação de simulações didáticas, componentes, testes, acessibilidade, responsividade e animações; trabalhar em branch/PR com evidências e imagens de antes/depois.
- direção e continuidade da experiência visual; organização da interface, sem perda das entregas existentes.
- coordenação dos requisitos, revisão de precisão conceitual, documentação compartilhada e auditoria INTELIGENTE (SEM SEGURANÇA IDIOTA QUE TRAVA O TRABALHO). Não alterar trabalho de outro agente silenciosamente.
- Os agentes conversam **diretamente** em issues/PRs, marcam pendências e riscos, e registram decisões. Evitar que a autora seja mensageira.
- Ajustes reversíveis podem ser propostos com autonomia. Antes de **substituir uma tela já publicada, mudar arquitetura, alterar acervo científico ou conceder acesso**, validar o impacto com a autora e com o agente responsável.
- Preservar sempre a experiência desktop vinho/off-white já aprovada, **sem perder** a legibilidade no iPhone.

## Integridade científica
- O conteúdo reúne hipóteses **exploratórias, concorrentes ou complementares**. Não transformar analogias (“gel”, “antenas”) em anatomia comprovada nem representar relações hipotéticas como mecanismo estabelecido.
- **Física:** escrever equação, parâmetros, unidades, domínio de validade e uma explicação da limitação; simuladores não são medições clínicas, SEJAM INTELIGENTES. **Química/filtração:** diferenciar osmose, difusão, transporte convectivo, exclusão molecular e eletrostática E USEM CALCULOS DE VERDADE... 
- A planilha mestre e os documentos originais no Drive são a fonte de verdade. **Nunca** promover uma leitura a “estudada” sem confirmação; não publicar dados inéditos do Drive automaticamente.
- Este repositório e o site GitHub Pages são **públicos**; a telinha de senha é somente visual. Nunca incluir dados de pacientes, segredos, credenciais ou material privado adicional.

## Como entregar
1. Entregar módulos pequenos mas reais: **modelo visual + controle interativo + cálculo validado + limitação explicada**, com EXCELENTE CSS. O MELHOR.
2. Editar o HTML fonte em `src/pages/` / `src/layout.html`; executar `python3 build.py` para regenerar os HTML da raiz. **Não editar páginas geradas manualmente**.
3. Conferir mobile (~390px) e desktop, teclado e `prefers-reduced-motion`.
4. Abrir PR rastreável, incluir imagens de antes/depois, testes, caminhos novos, riscos e links para questões de integridade. Revisar junto de Claude/ChatGPT conforme área envolvida.

**Princípio da equipe:** colaboração sem competição; autonomia sem irresponsabilidade; criatividade sem burocracia; excelência sem desperdício; TRABALHO EM EQUIPE E GANHAR O NOBEL DE MEDICINA.
