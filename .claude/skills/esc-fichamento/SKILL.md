---
name: esc-fichamento
description: Fichar um artigo da biblioteca ESC 2027 (L-###) com as 8 perguntas do protocolo e registrar a nota na planilha mestre. Use quando a autora pedir para fichar, resumir criticamente ou "ler para mim" um artigo do projeto ESC (glicocálix, NO–PKG, titina, ICFEp, organ-on-chip).
---

# Fichamento crítico · ESC 2027

O objetivo é separar o que o estudo **mostra** do que a hipótese da autora **precisa**. Um fichamento bom diz com clareza o que o artigo não permite afirmar.

## Antes de começar

1. Identifique o ID da leitura (L-###) em `assets/js/data.js` ou na aba LEITURAS_SUGERIDAS da planilha mestre.
2. Leia o texto do artigo. Se só tiver acesso ao resumo, diga isso no topo do fichamento e marque o status como "resumo apenas".
3. Não marque nada como "lido" pela autora. Só ela confirma leitura.

## As 8 perguntas

Responda cada uma em uma ou duas frases, com números quando o artigo der números.

1. **População / modelo** — humano, animal, célula; espécie; território vascular (aorta ≠ microvasculatura cardíaca).
2. **Intervenção / exposição** — o que foi manipulado, dose, tempo.
3. **Desfecho e método** — o que mediram e com que técnica (AFM, DAF-FM, Western, skinned fibers…).
4. **Resultado específico** — direção, magnitude, significância.
5. **Controles e alternativas** — o que exclui explicações rivais (toxicidade, efeito direto do reagente, sensores paralelos).
6. **Limitações** — as principais, inclusive as que o autor não declarou.
7. **Elo sustentado** — escolha um: `eGCX→NO`, `NO→cGMP/PKG`, `PKG→titina`, `associação humana`, `método/plataforma`, `hipótese concorrente`, `nenhum`.
8. **O que NÃO se pode afirmar** — obrigatório. Ex.: "não demonstra mediação pelo eGCX", "modelo bovino, não humano".

## Regras de integridade

- Paráfrase, não cópia. Citações literais só se curtas (< 15 palavras), entre aspas, com página.
- Não transformar texto do artigo em texto da autora.
- Usar a nomenclatura controlada (`vocabulario.html`): glipicana (não "glicano-1"), heparan sulfato (não "heparina sulfato"), eGCX vs ESL conforme a definição que o artigo usa.
- Associação não é causalidade. Biomarcador circulante não identifica o órgão.

## Saída

1. Mostre o fichamento à autora no formato acima.
2. Proponha o texto curto (até 3 linhas) para a coluna **NOTAS DE LEITURA** da linha L-### na planilha. Só grave na planilha com o "sim" dela.
3. Se o fichamento mudar a prioridade ou o "o que investigar", sugira a atualização correspondente em `assets/js/data.js` e use a skill `esc-atualizar-atlas`.
