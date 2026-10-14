# Governança da ESC — aprovação proporcional ao risco

Esta automação analisa alterações em PRs, mas **não aprova revisões de código, não faz merge e não publica**. Trabalha exclusivamente em runners do GitHub, com permissões somente de leitura; não usa dispositivos pessoais, Google Drive, tokens de IA ou sincronização.

## Três camadas
1. **Mecânica verificável:** workflow existente `Verificar site`, validação visual e testes especializados. A falha bloqueia a prontidão técnica.
2. **Triagem científica e de segurança:** `Governança — triagem segura de alterações`, que diferencia arquivos de governança/execução, conteúdo de hipóteses/candidatura e edição de interface. Marcadores textuais são alertas, **nunca conclusões de veracidade**.
3. **Revisão de IA e decisão editorial:** serviço de IA não está configurado. Uma integração futura requer aprovação explícita do provedor, política de retenção, avaliação de privacidade e definição de escopo. Não enviar automaticamente rascunhos privados para modelos externos. IA pode emitir parecer com citações, divergências e incertezas, **não decidir a verdade científica**.

## Classificação
- **Alto risco:** workflows, políticas, código de execução, estrutura de dados científicos e hipóteses. A triagem falha de propósito para solicitar revisão humana.
- **Risco ordinário:** texto de apresentação e visual. Passar na triagem indica apenas ausência dos sinalizadores testados; não aprova conteúdo nem permite merge.
- **Segurança:** varredura superficial de chaves e linguagem categórica. Falsos negativos são possíveis; complementar com scanners de secrets, revisão de permissões e GitHub CodeQL conforme habilitação e escopo.

## Regras de publicação
- A autora decide o merge na `main`. A interface publicada não muda com esta proposta enquanto o PR não for mesclado.
- Configurar proteção de branch e status checks obrigatórios, se disponíveis. Um workflow **não bloqueia merge por si só** quando as proteções não estão configuradas.
- Não habilitar `pull_request_target`, auto-merge, escrita no repositório, execução local, acesso a secrets ou delegação de agentes neste fluxo.
- O executor designado no `AGENTS.md` não é alterado.
- Para revisões científicas, retornar: afirmação, fonte primária, tipo de evidência, alternativa, incerteza, estado e sugestão sem sobrepor as notas da autora.

## Limites
A triagem **não é** um segundo revisor de IA; ela disponibiliza relatório JSON/Markdown e status de CI. Aprovação técnica automatizada completa e bloqueio obrigatório dependem de proteção de branch e verificações complementares. 
