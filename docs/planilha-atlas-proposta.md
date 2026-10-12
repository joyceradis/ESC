# Planilha → fichas de evidência → Atlas
Estado: desenho de integração; conector contínuo NÃO implementado nem ativado neste PR.

## Diagnóstico verificado
O README instrui atualização manual da planilha seguida de data.js. build.py só lê fontes versionadas; não lê o Drive.
A aba LEITURAS_SUGERIDAS da planilha mestre contém identificação, prioridade, eixo, título oficial, autoria/ano, tipo, DOI, link, origem, status de verificação, o que investigar, REF global e notas. Conferência limitada ao cabeçalho e uma linha; não é auditoria das demais abas ou estudos.

## Contrato para a próxima integração
- Entrada privada, somente leitura: planilha mestre por conector autorizado. Nunca tornar a planilha pública para facilitar importação; nunca ler o RASCUNHO.
- Distinguir atualização bibliográfica de síntese científica. Novos títulos não geram conclusões automaticamente.
- Saída de cada artigo: pergunta; modelo/população e tecido; exposição/intervenção e comparador; desfecho realmente medido; resultado com incerteza; limite; relação com a pergunta da Joyce.
- Cada afirmação deve guardar DOI/URL, localização no artigo, tipo de acesso (resumo/texto completo/suplemento), data da conferência e estado da revisão.
- Relações entre estudos têm estado explícito: evidência direta no mesmo modelo, apoio parcial, associação ou hipótese. Não construir causalidade por concatenação.
- Status de leitura da autora permanece separado de verificação bibliográfica e revisão metodológica. Importador não promove “pendente” a “lido”.
- Preservar no ambiente privado notas pessoais, links internos, ideias inéditas e comentários. Allowlist de campos públicos; nenhum dump da planilha no repositório.
- Chave estável + DOI normalizado para deduplicar. Detectar alterações, não sobrescrever autoria/curadoria silenciosamente. Remoções exigem diff explícito.
- Sincronização propõe diff e PR com data da fonte e contagem de itens; valida schema, links, integridade e interface. Merge pela Joyce.
- CI não inventa fichamentos e não acessa arquivos locais. Integração autenticada do Drive é pré-requisito de execução, não substituída por token em código.

## Critério de entrega futura
Mostrar no Atlas “atualizado em”, “mudou desde a última revisão” e fichas curtas, mantendo proveniência acessível. Testar duplicatas, mudança de status, campo ausente, DOI inválido, falha de acesso e ausência de material privado na saída. Esta etapa não é um workflow de sincronização funcionando.
