# Bloco AFM — estruturas, matriz hidratada e endotélio

Correção visual e conceitual limitada a `#lab-estudos`. O resto do HTML fonte do Laboratório permanece idêntico. Estudos canônicos, valores, fórmulas, home, navegação e skills do Claude não foram alterados.

## Antes/depois

Capturas de elemento em **WebKit no runner Linux do GitHub Actions**, desktop 1440 × 1000 e iPhone 13 **emulado** a 390 px, DPR 1. Não houve uso do Mac nem teste em aparelho físico. O cabeçalho móvel externo ao bloco foi ocultado somente durante a captura para não sobrepor o recorte longo; o produto mantém a navegação original.

| Desktop antes | Desktop depois |
| --- | --- |
| ![Antes](webkit-desktop-before.jpg) | ![Depois](webkit-desktop-after.jpg) |

| iPhone emulado antes | iPhone emulado depois |
| --- | --- |
| ![Antes](webkit-iphone-before.jpg) | ![Depois](webkit-iphone-after.jpg) |

## O que mudou

- Título: “O que exatamente foi medido nesses estudos?”.
- Estruturas ancoradas em vinho, matriz hidratada translúcida ao redor/entre elas e corpo celular abaixo, com três marcadores, legenda e descrição acessível.
- A espessura é apresentada como estimativa do ajuste da resposta conjunta de força/deformação. As cores são distinções didáticas, não compartimentos medidos separadamente.
- Removida a transformação que encurtava apenas os filamentos quando se selecionava o artigo de 2020. O esquema permanece conceitual e sem escala; os dados continuam mudando.
- “Altura aparente” no indicador foi substituída por “espessura aparente no modelo”. O texto explica que não se trata de gel puro nem simplesmente da altura dos “cabelos”.
- A explicação expandida distingue o modelo de brush do modelo de camada elástica; preserva os números já exibidos para o ajuste elástico.

## Fontes

[Marsh & Waugh, 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3605807/) descreve o ajuste da indentação por um modelo de filme macio sobre corpo celular mais rígido. [Delgadillo, Marsh & Waugh, 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7136287/) compara modelos de brush e camada elástica, ilustrando a dependência das estimativas em relação ao modelo. A distinção visual proposta aqui não é uma medição separada da composição molecular.

## Validação remota

[Execução das evidências](https://github.com/joyceradis/ESC/actions/runs/38110067301) no commit `905541e529c6fa7900e1d42713fe581da4dcfabc`:

- Build canônico, verificação de links/dados, sintaxe JS e 11 testes passaram.
- Chrome e WebKit, perfis desktop e iPhone, cinco larguras (320, 390, 768, 1024, 1440): sem overflow no bloco.
- Artigos 2013 e 2020 conservam espessura e módulo; visibilidade da comparação e do botão de fluxo responde corretamente.
- O SVG permanece idêntico ao trocar artigo, evitando converter espessura ajustada em altura dos filamentos.
- Botão de reproduzir fluxo continua produzindo 1 Pa.
- Nenhum erro JavaScript nas verificações.
- Capturas em movimento reduzido, inspecionadas; revisão estática independente sem achados acionáveis.
- O HTML publicado no PR foi obtido da execução de `python3 build.py` no runner e incorporado pelo conector GitHub, sem geração manual/local.

[Resultados estruturados](validation.json). As imagens deste diretório são permanentes no histórico da branch; as capturas adicionais para o estudo de 2020 estão no artefato da execução (retenção de 30 dias).

PR para revisão da Joyce. Sem merge, auto-merge ou deploy.
