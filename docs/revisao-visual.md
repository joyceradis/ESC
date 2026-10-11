# Revisão visual automatizada — desktop e celular

Workflow: `.github/workflows/revisao-visual.yml`.

Em cada PR e na execução manual, gera o Atlas e abre **todas as dez páginas** em Chromium com dois perfis: **desktop 1440 × 900** e **celular 390 × 844**. Salva 20 capturas de tela completas e um relatório JSON como artefato da execução por 14 dias. Falha se houver página indisponível, erro JavaScript não tratado, imagem quebrada, título vazio ou rolagem horizontal inesperada.

Também verifica navegação visível, busca da biblioteca, expansão de hipóteses e presença de controles no laboratório, em desktop e celular.\n\n**Limites:** emulação de viewport/touch em Chromium não equivale a testar um iPhone físico nem Safari/WebKit; também não atesta qualidade estética, contraste, acessibilidade ou todos os fluxos de clique. As capturas precisam de revisão visual por um agente; o Claude pode continuar conduzindo a curadoria estética. Os testes de interação são básicos e não substituem a revisão manual de todos os controles nem comparação visual com uma versão aprovada.

Tudo roda no GitHub Actions. Não instala nada no Mac/iPhone de Joyce, não usa dados clínicos, credenciais ou Google Drive. Não faz deploy e não altera o conteúdo das páginas.
