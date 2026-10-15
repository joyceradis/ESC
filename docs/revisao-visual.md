# Revisão automatizada — todas as páginas

Workflow: `.github/workflows/revisao-visual.yml`. Executa em pull requests e também pode ser iniciado manualmente.

O workflow gera as dez páginas do Atlas no runner do GitHub e verifica cada uma em Chromium e WebKit, em quatro larguras: 1440, 768, 390 e 320 px (80 combinações). Registra capturas e relatório JSON/Markdown como artefatos por 14 dias.

As verificações incluem carregamento do conteúdo principal, erros JavaScript e de console, recursos locais com falha e transbordamento horizontal. Na página inicial testa a navegação para o protocolo; no protocolo verifica seções, tabelas e teclado nos elementos expansíveis.

**Limites:** emulação no Linux não substitui Safari/iPhone físico nem revisão estética humana. O workflow não atesta contraste, acessibilidade completa, qualidade visual ou todos os fluxos de interação. Revise as capturas e o relatório no PR antes de aceitar alterações de interface.

Tudo roda no GitHub Actions, sem acesso ao Drive, ao Mac/iPhone ou a dados clínicos. Não faz deploy nem altera conteúdo científico.
