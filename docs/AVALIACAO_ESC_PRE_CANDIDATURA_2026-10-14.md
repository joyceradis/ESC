# ESC 2027 — avaliação pré-candidatura e pendências verificáveis
**Data:** 14/10/2026 · **Estado:** parecer técnico de triagem, não decisão científica da autora, não revisão sistemática.

## 1. Estado comprovado dos artefatos
- `src/pages/protocolo.html` documenta **dois percursos candidatos**: piloto condicionado à infraestrutura já disponível (duas semanas), com leitura de p-eNOS/eNOS, e investigação principal (aproximadamente 12 semanas), com desfecho funcional de NO e controles adicionais.
- O desenho central atualmente representado no site é **2 exposições × 2 tratamentos × 2 desafios**: 1 g versus microgravidade simulada; veículo versus intervenção sobre HS; sem fluxo versus com fluxo. São oito condições por bloco, antes dos controles adicionais. **Não há dados experimentais próprios registrados nesse documento.**
- O site registra os limites do modelo: clinorrotação não isola a gravidade, p-eNOS não quantifica NO, heparinase pode ter efeitos adicionais, campos não são réplicas biológicas, e um piloto não demonstra mediação endotelial nem eficácia clínica.
- O rascunho e a pendência no Drive também contêm **quatro estratégias de acoplamento eGCX–titina em heart-on-a-chip**. Essas estratégias representam exploração prévia/alternativa e não podem ser declaradas selecionadas, implementadas ou descartadas somente porque o site descreve outro recorte.
- A história da pergunta original e alternativas estão preservadas em [mapa de continuidade](CONTINUIDADE_CIENTIFICA_ESC_2026-10-14.md).

## 2. Comparação honesta antes do prazo
| Proposta | Pergunta | Força para candidatura | Limite decisivo | Status |
|---|---|---|---|---|
| A: reatividade endotelial pós-exposição | Exposição a microgravidade simulada altera a resposta a cisalhamento posterior e há dependência funcional de HS? | Recorte relativamente delimitado; controles e contraste de interação explícitos | Necessidade de plataforma com células, equipamento, controle hidrodinâmico e ensaio validado; não demonstra titina/ICFEp diretamente | Candidata documentada no site; **não aprovada** |
| B: eGCX–NO–cGMP–PKG–titina | Perturbação endotelial produz mudança mecânica no cardiomiócito adjacente? | Forte ponte com ICFEp e potencial de causalidade experimental | Co-cultura, maturação, controles de efeitos diretos, interpretação de sinalização e medida de tensão passiva complexas | Em avaliação no rascunho/pendência do Drive |
| C: resposta intrínseca do cardiomiócito à descarga | O que muda na titina independentemente de mediação vascular? | Preserva pergunta inicial e testa mecanismo concorrente | Exige controle de carga, maturação e atribuição limitada ao modelo usado | Comparador ainda aberto |

**Síntese:** A parece mais delimitada para um piloto *se* houver infraestrutura; B é mais integrada, porém exigente; C protege a comparação contra interpretação exclusivamente endotelial. Nenhuma pode ser promovida automaticamente como tema oficial.

## 3. Matriz de evidência e de refutação
1. **Microgravidade e alterações cardiovasculares:** evidência heterogênea por voo real, HU, HDTBR e modelos de rotação. Não equivaler condições de exposição; documentar forças parasitas.
2. **HS/eGCX e resposta ao fluxo:** evidências mecanísticas em modelos experimentais sustentam testar a contribuição de HS; não provar que é o único mecanossensor.
3. **NO versus eNOS:** p-eNOS/eNOS é leitura de sinalização; NO funcional requer ensaio validado, controles NOS e interferência redox.
4. **PKG/titina na ICFEp:** mecanismos miocárdicos têm antecedentes experimentais; mediação completa pelo eGCX continua candidata.
5. **Marcadores clínicos:** SDC-1, HA e PBR não são equivalentes nem atribuem origem endotelial específica. Associação com ICFEp não prova direção causal.
6. **Anterioridade:** o site já cita antecedentes de combinações microgravidade/fluxo e de HS/fluxo. **Originalidade da combinação específica permanece por confirmar**, confrontando textos integrais e protocolos comparáveis.

**Resultado desfavorável informativo:** resposta de eNOS sem mudança funcional de NO, resposta de NO independente de HS ou efeitos explicados por rotação/viabilidade reduzem a interpretação mecanística. Não tratar diferença de significância entre grupos como teste de interação.

## 4. Pendências bibliográficas existentes — Issue #13
A [issue #13](https://github.com/joyceradis/ESC/issues/13) documenta, entre outras:
- Divergência de metadados Tomita et al. (ano incorreto em registro legado): validar original e conciliar planilha.
- `FONTES_11OUT` com 204 registros, **não 204 artigos primários distintos**; cruzar DOI/título/versão com catálogo anterior.
- Lote 01 e arquivo de gênese de pergunta ainda sem localização confirmada na pasta consultada; ausência de localização não é perda comprovada.
- Figuras, links e ano de alguns itens ainda a conciliar; registrar **item, origem, divergência, evidência, status**.
- Não alterar planilha/figuras originais nesta rodada. Priorizar fontes diretamente relevantes ao abstract em vez de auditar todo o acervo antes de 23/10.

## 5. Pendências do laboratório — Issue #3
A [issue #3](https://github.com/joyceradis/ESC/issues/3) permanece aberta e requer avaliação de aceite funcional: verificar calculadoras existentes, interações de controle, unidades, acessibilidade, mobile, limites científicos e links. **Site publicado e CI verde não demonstram por si que cada interação requisitada foi validada.** Não redesenhar a interface ou reconstruir módulos sem falha reproduzível.

## 6. Plano enxuto até 23/10 — sem impor escolha
1. **Primeiro:** conferir edital oficial, formulário, data e horário final de submissão; não tomar horários citados por IA como oficiais.
2. **Depois:** comparar A/B/C com a pergunta original; registrar decisão científica da autora sobre o recorte, não fazê-la por ela. Se o objetivo é uma candidatura ao treinamento, manter o protocolo condicional à infraestrutura e tempo do laboratório anfitrião.
3. **Em seguida:** estruturar `background → working hypothesis → objective → strategy → expected results → outlook`, sem inventar resultados preliminares. Articular a oportunidade de treinamento separadamente da exequibilidade de investigação longa.
4. **Por fim:** revisar CV e carta em inglês com fatos documentados; verificar se as três peças foram efetivamente enviadas.

## 7. Integridade e execução
- Este relatório é uma **avaliação documental**, não parecer externo de originalidade, validação de protocolos ou revisão total de todas as referências.
- **Nenhum artigo marcado como lido pela autora por inferência;** material disponível não significa assimilado.
- Trabalho somente no GitHub remoto em branch/PR; sem sync, clone, bundle, captura de dispositivos, compartilhamento de segredos, alteração de Drive, contato com agentes ou publicações automáticas.
- A `main` segue sem proteção obrigatória no último estado consultado; correção dessa configuração é decisão separada de segurança, não feita neste PR.
