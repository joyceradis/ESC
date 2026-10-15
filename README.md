## Secretária de repositório (proposta)

A [secretária de issues](docs/issue-secretary.md) e seu [workflow](.github/workflows/issue-secretary.yml) organizam etiquetas e status sem alterar código, fazer merge ou publicar. O fluxo é **proposto, não substitui a decisão da Joyce**.

# ESC 2027 · Research Atlas

Painel pessoal de retomada da pesquisa para o **ESC Fund – Basic Cardiovascular Science Course 2027**. Hipótese candidata: glicocálix endotelial → NO–cGMP–PKG → titina na ICFEp.

O site é estático. Não edita o Google Drive, não salva nada e não envia dados. O raciocínio continua no Drive; o atlas é só uma porta de entrada.

## Páginas

| Página | Conteúdo |
| --- | --- |
| `index.html` | Visão geral, contagem regressiva, próximo movimento, cronograma |
| `retomar.html` | Onde a escrita parou, ordem de leitura, fichamento, pontos a revisar |
| `pergunta.html` | HYP-006, estado de cada elo, anterioridade e lacuna candidata |
| `candidatura.html` | Regras oficiais, três peças, estrutura do abstract, programa, alertas |
| `protocolo.html` | Estratégia experimental proposta (não executada) |
| `biblioteca.html` | 35 leituras com busca e filtros |
| `hipoteses.html` | 10 linhas de investigação, perguntas dos comentários, física |
| `laboratorio.html` | Bancada didática interativa: cisalhamento, hidrostática, Reynolds, osmose, difusão, Darcy, filtragem visual e gravidade |
| `vocabulario.html` | Analogias da autora → termos controlados |
| `acervo.html` | Documentos, pastas, autoria dos relatórios e decisões (ADR) |

## Estrutura

```
assets/css/style.css   estilos compartilhados
assets/js/data.js      dados do acervo (leituras, hipóteses, vocabulário, decisões)
assets/js/app.js       contagem regressiva, filtros e renderização
assets/js/lab-math.js  equações idealizadas com testes unitários
assets/js/laboratorio.js controles dos simuladores e desenhos dinâmicos
assets/css/laboratorio.css estilos exclusivos do laboratório
src/layout.html        moldura comum (menu, rodapé)
src/pages/*.html      miolo de cada página
build.py              gera os *.html da raiz
```

## Como atualizar

1. Atualize primeiro a planilha mestre no Drive (é a fonte de verdade do status).
2. Edite `assets/js/data.js` ou o miolo em `src/pages/`.
3. Rode `python3 build.py` para regenerar as páginas.
4. Abra `index.html` no navegador (funciona direto do arquivo, sem servidor).

## Skills do projeto

Em `.claude/skills/`, no formato do repositório oficial de skills da Anthropic (`anthropics/skills`, cópia em `joyceradis/demo-repository-skills-antropic`). O Claude Code as carrega ao abrir este repositório.

| Skill | Quando usar |
| --- | --- |
| `esc-fichamento` | Fichar um artigo L-### com as 8 perguntas e propor a nota para a planilha |
| `esc-revisar-abstract` | Revisar abstract, CV ou carta antes do envio (estrutura ESC, integridade, originalidade) |
| `esc-atualizar-atlas` | Sincronizar o site com a planilha mestre e regenerar as páginas |

## Revisão visual antes de entregar mudanças de interface

**Proposta em desenvolvimento na branch/PR #17:** [Revisão visual desktop/celular](docs/revisao-visual.md) e [workflow](.github/workflows/revisao-visual.yml). Esta rotina **não substitui** a revisão humana, nem a aprovação da Joyce, nem a regra de merge na `main`.

Para mudanças de CSS, layout, navegação, laboratório ou interações, conferir **desktop e celular** nas dez páginas; preservar a identidade editorial vinho/marfim aprovada, incluindo ilustrações científicas. Anexar capturas, resultados de testes e observações de interação ao PR. Refinamentos de sombras, profundidade e animação são propostas estéticas separadas e não autorizam alteração implícita da interface.

## Verificações automáticas

- **Verificar site** (`.github/workflows/verificar-site.yml`): a cada envio, confere a sintaxe do JavaScript, se as páginas da raiz batem com `src/`, os links internos e a consistência de `data.js`. Rode localmente com `python3 tools/check_site.py`; os simuladores também possuem testes em `tests/lab-math.test.mjs` executados por `node --test`.
- **Links externos** (`.github/workflows/links-externos.yml`): toda segunda-feira testa os links de DOI, PubMed, PMC e ESC e abre uma issue se algum quebrar. Links do Drive ficam de fora porque são privados e exigiriam login.

## Atlas vivo: atualização por notas

**Fonte canônica:** [`atlas/README.md`](atlas/README.md) descreve como estudos, perguntas e decisões públicas entram em `atlas/estudos-gel.json` e `atlas/notas/*.json`. O build gera `assets/js/atlas-dados.js` por commit e por execução do workflow.

## Laboratório interativo e limites

O laboratório contém modelos simplificados para **ensino e formulação de perguntas**: cisalhamento newtoniano, hidrostática, Reynolds de tubo, osmose ideal de van't Hoff, difusão de Fick e permeabilidade análoga de Darcy.

**Não são medidas do glicocálix, previsões clínicas nem confirmação de causalidade.** As unidades, pressupostos e limitações são mostrados na tela. Os valores de permeabilidade da analogia e as variáveis do sistema são didáticos.

Os números são calculados exclusivamente no navegador. Não há envio de valores ou alterações no Drive. Cálculos têm testes de referência, unidades e entradas inválidas.

## Autoria e colaboração

**Autoria científica:** Joyce Radis. **Colaboradores no desenvolvimento do Atlas:** ChatGPT (OpenAI) e Claude (Anthropic), em etapas complementares. **Análises secundárias:** Gemini (Google). O conteúdo científico é da autora; os agentes organizaram, conferiram e deram forma; nenhum deles produziu dados experimentais.

| Quem | O que fez | Quando |
| --- | --- | --- |
| **Joyce Radis** (autora) | Pergunta científica, hipóteses, analogias das “antenas” e do “gel”, rascunho RAS-001 com grifos e 13 comentários, leitura de Tomita (L-001) e decisões de escopo | 2026 |
| **ChatGPT** (OpenAI) | Auditoria e reorganização do Drive, planilha mestre estruturada, mapa de hipóteses v0.2 a partir das perguntas da autora, adendo de anterioridade e atlas edição 01 | 2026 |
| **Claude** (Anthropic) | Atlas edições 02 e 03: conferência das regras na página oficial da ESC, alertas de integridade, separação em 9 páginas, dados da planilha no site, `build.py` e pipeline de checagem | 2026 |
| **Gemini** (Google) | Dois relatórios secundários: análise estratégica e elegibilidade | 08/10/2026 |
| **Claude** (Anthropic) | Edição 04: regra de executor único, pergunta de partida (microgravidade → titina → ICFEp) com hipóteses concorrentes e desenho fatorial 2 × 2 | 11/10/2026 |

## Privacidade

O conteúdo é um projeto científico não publicado, e os links apontam para um acervo privado no Drive. Mantenha o repositório privado. Se usar GitHub Pages, lembre que o site publicado fica acessível ao público.

## Acesso por senha (barreira visual)

A tela de senha é executada pelo JavaScript `assets/js/access-gate.js` em todas as páginas. O código contém somente um SHA-256 de uma senha aleatória, não a senha em texto puro. A sessão na interface é local ao navegador.

**Aviso importante:** este mecanismo reduz acesso casual pela interface, mas **não é autenticação** e **não torna arquivos do GitHub Pages privados**. HTML, JS e dados continuam recuperáveis publicamente.
