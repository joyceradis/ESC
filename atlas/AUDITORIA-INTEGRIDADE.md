# Integridade do Atlas — acompanhamento técnico

Revisão técnica em 11/10/2026, a partir do estado `db72fbd5fba7ae08c7451940f492c3b54fe07477`.
Origem pública: [auditoria cruzada #13](https://github.com/joyceradis/ESC/issues/13), incluindo o confronto científico registrado nos comentários. Este registro não encerra a auditoria científica nem substitui os originais.

## Controles implementados nesta alteração

- O gerador de `atlas/estudos-gel.json` rejeita DOI sem formato válido e duplicação de DOI entre estudos, ignorando diferenças de maiúsculas/minúsculas. Também confere o formato do DOI do modelo explicativo.
- Datas das notas são validadas pelo calendário, inclusive anos bissextos; datas impossíveis não podem determinar a nota mais recente.
- A CI executa regressões do gerador e verifica divergência do arquivo derivado `assets/js/atlas-dados.js`, além do HTML.
- Os valores científicos, fontes, status de leitura e interpretações existentes não foram alterados.

**Limite:** formato válido de DOI não comprova existência, correspondência com título/ano, leitura integral, ausência de retratação ou independência científica. O catálogo AFM tem dois estudos e é distinto das 35 leituras de `data.js` e do inventário de 204 registros discutido em #13. Este controle não reconcilia esses conjuntos.

## Pendências da auditoria #13

| Item | Estado nesta alteração | Evidência necessária para concluir |
| --- | --- | --- |
| Reconciliação 204/163 | Pendente | Confronto registro a registro: DOI normalizado, título, ano, origem e duplicidade |
| Lote 01 integral | Não verificado nesta alteração | Confirmar a forma original de recebimento; não reconstruir texto e apresentá-lo como original |
| Tomita / F11-085 | Não corrigido | Conferir metadados na fonte primária e registrar a decisão no acervo canônico |
| Figuras e captura OpenEvidence | Pendente | Origem, licença e classificação como figura científica ou gênese da pergunta |
| Escolha da pergunta primária | Decisão da autora | Anterioridade específica e infraestrutura confirmada |
| Cadeia eGCX–NO–titina e tradução clínica | Hipótese, não resultado do projeto | Evidência por elo e desenho capaz de distinguir mecanismos concorrentes |

A aprovação dos testes valida controles de software. Não valida causalidade, originalidade da proposta ou viabilidade do experimento.

## Verificação reproduzível

```sh
python3 -m unittest discover -s tests -p 'test_*.py'
python3 build.py
python3 tools/check_site.py
node --test tests/*.test.mjs
```

Os testes usam cópias temporárias dos dados e não editam o acervo. Não há novas dependências, chamadas ao Drive ou mudanças visuais. Revisão e merge permanecem com Joyce.
