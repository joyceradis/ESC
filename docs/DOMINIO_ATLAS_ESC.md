# Domínio personalizado · Atlas ESC 2027

**Endereço proposto:** `esc.drajoyceradis.com`.

## Por que funciona

O subdomínio pode apontar apenas para o GitHub Pages do repositório `joyceradis/ESC` sem alterar a hospedagem do site médico principal. A configuração não exige migrar o conteúdo do atlas para outro provedor.

## Ações necessárias (não executadas)

1. Identificar o provedor DNS autoritativo e conferir se existe registro para `esc.drajoyceradis.com`. Esta verificação ainda não foi concluída.
2. Criar um CNAME para o **host** `esc` com destino `joyceradis.github.io` (sem protocolo e sem `/ESC`), caso não haja conflito.
3. Em Settings → Pages de `joyceradis/ESC`, configurar o domínio personalizado `esc.drajoyceradis.com`; seguir instruções do GitHub quanto ao arquivo CNAME, verificação de domínio e certificado.
4. Validar HTTPS, links relativos, navegação e dispositivo móvel antes de divulgar o endereço.

**Não mexer:** raiz `drajoyceradis.com`, `www` ou instalações existentes na Vercel. Nenhuma alteração de DNS/Pages foi realizada neste PR. Uma tela de senha JavaScript não torna conteúdo público privado.
