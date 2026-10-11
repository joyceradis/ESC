# ESC 2027 · Research Atlas

Painel pessoal de retomada da pesquisa para o **ESC Fund – Basic Cardiovascular Science Course 2027**. Hipótese candidata: glicocálix endotelial → NO–cGMP–PKG → titina na ICFEp.

O site é estático. Não edita o Google Drive, não salva nada e não envia dados. O raciocínio continua no Drive; o atlas é só uma porta de entrada.

## Páginas

| Página | Conteúdo |
| --- | --- |
| `index.html` | Visão geral, contagem regressiva, próximo movimento, cronograma |
| `retomar.html` | Onde a escrita parou, ordem de leitura, fichamento, pontos a revisar |
| `pergunta.html` | HYP-006, estado de cada elo, anterioridade e lacuna candidata |
| `candidatura.html` | Regras oficiais, três peças, estrutura do abstract, programa, alertas |
| `protocolo.html` | Estratégia experimental proposta (não executada) |
| `biblioteca.html` | 35 leituras com busca e filtros |
| `hipoteses.html` | 10 linhas de investigação, perguntas dos comentários, física |
| `vocabulario.html` | Analogias da autora → termos controlados |
| `acervo.html` | Documentos, pastas, autoria dos relatórios e decisões (ADR) |

## Estrutura

```
assets/css/style.css   estilos compartilhados
assets/js/data.js      dados do acervo (leituras, hipóteses, vocabulário, decisões)
assets/js/app.js       contagem regressiva, filtros e renderização
src/layout.html        moldura comum (menu, rodapé)
src/pages/*.html       miolo de cada página
build.py               gera os *.html da raiz
```

## Como atualizar

1. Atualize primeiro a planilha mestre no Drive (é a fonte de verdade do status).
2. Edite `assets/js/data.js` ou o miolo em `src/pages/`.
3. Rode `python3 build.py` para regenerar as páginas.
4. Abra `index.html` no navegador (funciona direto do arquivo, sem servidor).

## Privacidade

O conteúdo é um projeto científico não publicado, e os links apontam para um acervo privado no Drive. Mantenha o repositório privado. Se usar GitHub Pages, lembre que o site publicado fica acessível a quem tiver o endereço.
