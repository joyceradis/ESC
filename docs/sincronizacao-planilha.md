# Sincronização seletiva da planilha com o Atlas
Implementação: importador, catálogo público, fichas/conexões e workflow que propõe PR. Não é espelhamento integral nem revisão científica automática.

## Estado desta entrega
O PR inicial contém somente DADOS SINTÉTICOS para testar código/interface. O catálogo real aguarda autorização específica de publicação. Diagnóstico em memória, sem exportar registros: 30 linhas de LEITURAS_SUGERIDAS + 204 de FONTES_11OUT, unificadas em 226 referências por DOI normalizado. Cinco sínteses iniciais e quatro conexões têm revisão/limites explícitos. Três sínteses são extrações preliminares da planilha, não nova leitura integral. A decisão permanece exploratória.
O conector da conversa não autoriza automaticamente GitHub Actions. Atualização recorrente só funciona após configuração própria abaixo. Nenhum agendamento está ativo; execução futura é manual em Actions após merge. Esta configuração não foi provisionada nesta entrega.

## O que sincroniza
tools/sync_sheet.py lê somente LEITURAS_SUGERIDAS!A1:H150 e FONTES_11OUT!A1:G300, com validação dos cabeçalhos. Exporta ID, título, autores, ano, DOI e URL pública permitida. Prioridade/origem privada são descartadas. Não lê RASCUNHO, notas de leitura, comentários, figuras ou hipóteses pessoais.
Curadoria fica em atlas/sync/curation.json, separada do catálogo. Importação não inventa modelo, achado, causalidade nem “lido pela Joyce”. A ficha sem curadoria é pendente. Mudança nos metadados invalida a síntese e as conexões dependentes até nova revisão. Alterações de interpretação nas colunas não importadas exigem revisão editorial própria; não são detectadas por este sync.
Remoções preservam o registro com aviso; queda acima de 20%, aba vazia, cabeçalho alterado ou teto de linhas bloqueiam a atualização. IDs/aliases históricos são preservados quando o DOI permanece. URLs privadas, javascript/data e links fora de DOI/PubMed/PMC não entram. Campos são renderizados como texto.

## Configuração necessária, sem senha/chave no repositório
Responsável com acesso ao Google Cloud configura Workload Identity Federation para uma conta de serviço exclusiva. A conta recebe somente visualização da planilha selecionada, sem acesso à pasta ou ao RASCUNHO. Não criar chave JSON.
A confiança OIDC deve restringir repository_id/owner_id aos IDs numéricos do repo/conta, ref main e job_workflow_ref ao arquivo .github/workflows/sincronizar-planilha.yml na main. Não usar condição apenas por nome de organização. Requer Google Sheets API e IAM Credentials API no projeto autorizado; não criar projeto, faturamento ou permissões sem decisão da Joyce.
Variáveis do repo: ESC_GOOGLE_WIF_PROVIDER, ESC_GOOGLE_SERVICE_ACCOUNT e ESC_SHEET_ID. São identificadores de configuração, nunca tokens. O workflow solicita credencial temporária com escopo spreadsheets.readonly, não cria arquivo de credencial e não exibe respostas brutas.
GitHub precisa permitir criação de PR pelo GITHUB_TOKEN. Permissões de escrita ficam apenas no job manual de sincronização, que só roda na main. CI de PR tem contents:read e não recebe identidade Google.
Fontes oficiais: https://github.com/google-github-actions/auth e https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow

## Operação na nuvem
1. Joyce revisa e faz merge desta implementação.
2. Após identidade configurada, Actions → Sincronizar planilha — propor PR → Run workflow na main.
3. Importador lê só as colunas permitidas, atualiza catálogo e build.py regenera Biblioteca/dados. Sem mudanças não abre PR.
4. Testes passam antes de propor atualização. Script publica somente três caminhos permitidos em branch nova e abre PR rascunho. Main nunca é alterada pelo script.
5. Como eventos gerados por GITHUB_TOKEN não disparam normalmente outros workflows, o script despacha explicitamente revisao-sync.yml na branch criada. Ela valida dados, site e navegadores. A configuração precisa estar na main para workflow_dispatch.
6. Joyce revisa os diffs e decide merge/publicação. Falha de identidade preserva o snapshot anterior e falha a execução: nunca apresenta “sincronizado” sem leitura.
Primeiro teste real OIDC→Sheets→PR continua pendente de configuração. Testes sintéticos não substituem esse teste.

## Atualizar fichas/conexões
Ficha: modelo, exposição, desfecho medido, achado, limite, estado de leitura, referência pública e cópia dos metadados conferidos. result kind: evidence/association/pending. Hipótese é conexão, nunca resultado do artigo. Conexão tem fontes resolvíveis, tipo e limite. Não promover fonte ou leitura da autora automaticamente.
python3 build.py gera assets/js/evidence-data.js. Não editar derivados manualmente. CI verifica o catálogo e dados derivados. A lista anterior de leituras permanece acessível para não perder status histórico.
