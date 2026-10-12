# Sincronização usando somente os conectores autorizados

## Operação efetiva
O conector Google Drive lê as duas abas selecionadas. O agente retém somente ID, título, autores, ano, DOI e URL pública, gravando essa projeção em atlas/sync/connector-input.json via conector GitHub, numa branch de PR. As colunas de prioridade, eixo, origem privada e anotações não são exportadas.

GitHub Actions não recebe autorização Google. Ele apenas reproduz a transformação dos campos públicos já autorizados, gera catálogo/site, verifica os derivados e executa testes. O conector GitHub pode recuperar os derivados públicos no log da execução e gravá-los na mesma branch usando expected_sha. Se a branch mudar, reler antes de escrever. Nunca atualizar main ou fazer merge.

Essa rota funciona durante uma tarefa com os conectores disponíveis. NÃO existe agendamento autônomo configurado nem atualização em tempo real. Uma nova execução é iniciada por pedido da Joyce; não requer senha, token, navegador, Google Cloud ou acesso ao Mac. A publicação no site continua dependendo de merge pela Joyce.

## Escopo
Planilha selecionada: 1fksFh1OfIFxe6R7A6eebzSoTgnMHBAbgOfUJHjVvEr8.
Leitura: LEITURAS_SUGERIDAS!A1:H150 e FONTES_11OUT!A1:G300. Validar cabeçalhos completos antes de projetar os seis campos permitidos. Não ler outras abas, documentos, comentários ou o RASCUNHO.
Título e autoria são copiados, sem tradução ou invenção. Autoria/ano vazios permanecem vazios e a referência aguarda curadoria. Não promover leitura da Joyce.
Somente campos já autorizados podem ser enviados ao repositório público. Novas notas e interpretações privadas ficam fora; uma atualização do catálogo não autoriza publicar conteúdo científico inédito.

## Passos reproduzíveis pelo agente
1. Ler head do PR e regras atuais; usar somente Google Drive e GitHub.
2. Ler as duas faixas pelos conectores; validar nomes/cabeçalhos/contagens e não imprimir respostas brutas.
3. Projetar cada linha para [id,title,authors,year,doi,url]. Na primeira aba, extrair o primeiro ano de quatro dígitos da autoria. Remover todas as outras colunas. Manter limites e estrutura do arquivo de entrada público.
4. Comparar com entrada vigente. Sem diferença não gerar commit de dados nem atualizar artificialmente a data de importação.
5. Se houver diferença permitida, gravar a entrada na branch pelo conector. CI gera derivados e os disponibiliza com prefixo CONNECTOR_OUTPUT; não interpretar falha por derivados desatualizados como sucesso.
6. Recuperar somente esses três derivados permitidos e gravar por commit com expected_sha. Não copiar logs integrais. Esperar todos os checks do novo head.
7. Entregar PR e resultados. Não fazer merge ou publicar.

## Contrato e proteções
tools/sync_sheet.py --connector-input atlas/sync/connector-input.json
python3 build.py

A entrada rejeita colunas/abas extras e linhas fora do esquema. O transformador preserva IDs, retém referências removidas com aviso e bloqueia quedas acima de 20%, duplicação de IDs ou limites excedidos. DOI normalizado deduplica registros; divergências ficam explícitas. Links derivados ficam restritos a DOI/PubMed/PMC.

Curadoria permanece separada em atlas/sync/curation.json. Alteração dos campos de uma fonte invalida suas fichas/conexões. Mudança de interpretação em colunas não lidas exige revisão editorial própria: esse mecanismo não a detecta.

## Verificação da transição
Nova leitura pelo conector em 11/10/2026 (America/Sao_Paulo): 30 + 204 linhas de origem. O teste de reprodução confere linha a linha o catálogo de 226 referências, sem alterar a planilha.
O caminho Google Cloud/OIDC foi removido desta proposta. Não há credencial ou processo de autenticação a configurar.
