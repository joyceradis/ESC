# Secretária de Pull Requests — ESC

Proposta de workflow complementar à secretária de Issues já presente na `main`.

## Comportamento
- Acionamento quando um PR muda e em dias úteis, às 12:00 UTC (09:00 em Brasília). Também permite execução manual.
- Cria **uma única issue de checkpoint** com os PRs abertos, status de checks, revisões, conflitos, presença de arquivos sensíveis e próxima ação sugerida.
- Atualiza a mesma issue sem duplicatas; não reabre se a Joyce a tiver encerrado.
- Não edita PRs nem publica comentários em cada alteração, para evitar ruído.
- Não executa código de PRs. Pull requests de forks são lidos no agendamento, não ganham token de escrita por evento.
- Estado de testes verdes **não equivale** a pronto para merge, aprovação científica, revisão independente nem autorização humana.
- Mudanças de workflows, credenciais, governança, permissões e dados clínicos exigem revisão humana.

## Permissões
`contents: read`, `pull-requests: read`, `checks: read`, `issues: write` somente para manter **o painel de checkpoint**. Nenhum segredo extra.

## Integração com a secretária de Issues
A secretária existente continua organizando as issues de trabalho. Esta observa os PRs; não vincula/fecha automaticamente issues nem altera status de conclusão.

## Ativação e validação
Apenas após revisão e integração deste PR na `main`. Confirmar que:
1. `workflow_dispatch` cria um painel único com os PRs existentes.
2. Um segundo disparo com dados iguais não cria novas issues nem modifica PRs.
3. Falhas, revisões pendentes, conflitos e alterações sensíveis aparecem distintamente.
4. Forks, PRs em rascunho e checks ausentes não são tratados como aprovados.

Implantação em outros repositórios requer ajuste individual de governança, sem editar `Quem-Votar` ou expandir permissões sem autorização.
