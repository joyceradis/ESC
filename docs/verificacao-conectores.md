# Verificação da sincronização pelos conectores

Data da leitura: 11/10/2026, America/Sao_Paulo.

## Caminho executado
1. Google Drive autorizado: leitura de LEITURAS_SUGERIDAS!A1:H150 e FONTES_11OUT!A1:G300.
2. Projeção apenas dos seis campos bibliográficos autorizados, enviada pelo conector GitHub à branch do PR #23.
3. GitHub Actions reproduziu o catálogo a partir dessa projeção e executou build/validações.
4. O conector GitHub recuperou o log e conferiu o resultado público.

[Execução](https://github.com/joyceradis/ESC/actions/runs/38193464512)
Código executado: `4105e88cf13357eb244c48c6fd5c06cd3d4e285e`.

## Resultado
- 30 + 204 linhas bibliográficas de origem; 226 referências após deduplicação.
- Catálogo reproduzido idêntico, inclusive IDs e indicadores, ao snapshot anterior.
- Nenhuma alteração nova nos campos bibliográficos; a data de importação não foi renovada artificialmente.
- 25 testes Python passaram, incluindo reprodução integral da leitura, rejeição de colunas/abas extras e preservação de autoria ausente.
- Build, integridade do site e conferência de derivados passaram. Nenhuma modificação no HTML/JS gerado resultou desta leitura.
- O bloqueio anterior de autoria vazia foi corrigido; nenhum autor foi inventado.
- Google Cloud/OIDC e o publicador com token de Actions foram retirados da proposta.
- GitHub Actions continua apenas com contents:read neste fluxo.

## Limite operacional
Este é um fluxo assistido pelos conectores durante uma tarefa. Não é um serviço recorrente autônomo, webhook ou tarefa agendada. Os conectores desta sessão não foram configurados para rodar sozinhos. Próximas atualizações seguem o mesmo caminho por solicitação da Joyce, sem novo login ou acesso local enquanto as autorizações dos conectores estiverem válidas.

Sem navegador remoto, senha, acesso ao Mac, edição do RASCUNHO, merge ou publicação nesta execução.
