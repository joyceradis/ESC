# Laboratório: escopo dos cálculos e evidências

Revisão metodológica do PR #10, solicitada por Joyce. Esta nota não promove leituras a estudadas, não altera resultados publicados nem registra dados privados.

## Três níveis
- **Evidência endotelial:** resultados publicados, associados a célula, preparação, método e limitações.
- **Cálculo didático:** resposta de uma equação idealizada aos parâmetros escolhidos. Não ajusta AFM nem é modelo validado do eGCX.
- **Ilustração:** estrutura sem escala; movimento gráfico sem correspondência quantitativa molecular.

Glicocálix é termo geral. eGCX é o glicocálix endotelial; outras células e géis artificiais não fornecem parâmetros endoteliais automaticamente. Culturas de HUVECs não representam todos os leitos vasculares in vivo. PBR, AFM e biomarcadores não são intercambiáveis.

## Proveniência e ressalva histórica
- [Marsh & Waugh 2013, Representative Results](https://pmc.ncbi.nlm.nih.gov/articles/PMC3605807/): preservar os valores transcritos, inclusive 380 ± 50 nm e 0,7 ± 0,5 kPa. A viscosidade do meio é assumida no protocolo; o gradiente exibido é inferido.
- [Delgadillo, Marsh & Waugh 2020, Discussion / EGL mechanics](https://pmc.ncbi.nlm.nih.gov/articles/PMC7136287/): os autores atribuem prováveis erros em módulos maiores anteriormente publicados pelo laboratório a falhas instrumentais corrigidas. O parágrafo não nomeia especificamente o artigo de 2013 nem estabelece invalidade de seus 380 nm. Exibir esse histórico exige a ressalva; não é uma retratação formal inventada pelo atlas.
- Os 110 nm e 0,025 kPa de 2020 são resumo do ajuste de camada elástica. Cerca de 350 nm vem do ajuste de escova no mesmo estudo. Não equivalem a gel puro versus filamentos. Não substituir um pelo outro nem generalizar como normalidade clínica.

## Domínio das contas
| Conta | Hipóteses / limites |
| --- | --- |
| τ = μ du/dy | Fluido newtoniano; μ do fluido; gradiente local prescrito; não converte PA sistólica em cisalhamento. |
| Δp = ρ a L | Densidade constante, equilíbrio hidrostático; L na direção da aceleração; não mede compressão do eGCX. |
| Re = ρ v D / μ | Escala de tubo e viscosidade constante; limiar de turbulência não universal para vasos. |
| Δπ = RTΔC | Solução ideal, solutos impermeantes (σ=1); não substitui filtração endotelial/oncose. |
| Magnitude J = DΔC/Δx | Magnitude, meio homogêneo, unidimensional estacionário; sem convecção/adsorção. |
| v = kΔp/(μL) | Darcy, meio homogêneo; velocidade superficial, k intrínseco em m²; Lp=k/(μL) em m/(Pa·s). Parâmetros arbitrários, sem calibração do eGCX. |

A viscosidade do fluido permeante de Darcy é independente do controle de cisalhamento/Reynolds. A ilustração não inclina filamentos com uma regra arbitrária em função de τ. Testes de aritmética, integridade e navegação não são validação experimental.

## Verificação
Build e testes exclusivamente em GitHub Actions. O workflow de revisão usa contents: read, gera HTML e dados pelo build canônico, testa Chromium/WebKit e captura desktop/iPhone emulado. Não implanta o site. Imagens antigas do PR documentam uma revisão anterior; usar os artefatos do novo SHA para avaliar esta revisão.
