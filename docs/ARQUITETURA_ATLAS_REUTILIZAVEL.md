# Atlas de pesquisa reutilizável · proposta incremental

O **Atlas ESC 2027** é a instância inicial, não o produto genérico. Não migrar ou renomear o repositório no mesmo PR de correção de regressões.

## Módulos existentes a preservar
- Pergunta e decisão: `decisao.html`, `pergunta.html`, comparador e retomada.
- Biblioteca e proveniência: `biblioteca.html`, `atlas/`, `assets/js/evidence-data.js`.
- Método: `protocolo.html` e laboratório interativo, com unidades, suposições e limitações.
- Operação da candidatura: `candidatura.html` e `plano.html` (estado específico da pesquisa atual).

## Arquitetura-alvo por etapas
1. **Correção visual e funcional:** recuperar indicador de estágio sem inventar percentual de aceitação; posicionar laboratório antes do histórico de candidatura; corrigir seletor JavaScript e alinhamento da marca.
2. **Tokens e componentes:** concentrar cores, marca tipográfica, navegação, espaçamento e cartões; não usar imagens oficiais sem autorização da ESC. Este passo começou no CSS e exige revisão visual.
3. **Definição de estudo:** separar metadados de cada pesquisa (título, hipótese, marcos, fontes, links, estado e módulos habilitados) do mecanismo de interface. Não transformar `ESC.project` em configuração genérica só por renomeação.
4. **Templates e instâncias:** criar um template reutilizável separado, com testes automatizados, dados demonstrativos e esquema de validação para evitar vazamento de informações de projetos anteriores.
5. **Laboratório modular:** separar simuladores gerais (hidrodinâmica, difusão, osmose, gravidade) de exemplos experimentais específicos do glicocálix; documentar restrições de validade e unidade em cada simulação.

## Regras de regressão
- Fonte em `src/pages/`, não editar HTML de saída sem sincronizar `build.py`.
- Não substituir o trabalho experimental por cartões administrativos nem exibir etapas históricas como pendentes.
- Testes JS, `tools/check_site.py`, verificação visual mobile 390 px e desktop 1440 px antes de mesclar.
- Sem dados de pacientes, resultados fictícios, novas permissões, tokens ou ações no domínio principal.
- Merge e mudanças estruturais do projeto só com revisão/autorização da autora.
