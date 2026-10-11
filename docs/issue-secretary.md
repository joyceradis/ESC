# Secretária de issues — ESC

Reaproveita o padrão do workflow [Quem-Votar/issue-secretary.yml](https://github.com/joyceradis/Quem-Votar/blob/main/.github/workflows/issue-secretary.yml), adaptado para o Atlas.

- **Escopo:** issues (não PRs), etiquetas de tipo/área/status, cartão único de acompanhamento, comandos exclusivos de Joyce: `/ready`, `/start`, `/blocked`, `/done`, `/reopen`.
- **Permissões:** `contents: read`, `issues: write`. Sem `contents: write`, `pull-requests: write`, secrets ou tokens externos. Não modifica arquivos, branches, PRs, Actions, ambientes nem publicação.
- **Autonomia:** os agentes continuam livres para pesquisar, desenvolver e testar remotamente em branches autorizadas. O cartão é informativo e não inicia nem autoriza execução de agentes.
- **Limites:** não acessa Drive, Mac, iPhone, dados clínicos, assinador digital ou certificados; não faz triagem semântica automática da ciência. Status e rótulos não substituem decisões da autora.
- **Ativação:** somente após merge deste PR na `main`. Testes do workflow precisam ser observados após ativação; esta proposta não está em execução na `main`.
