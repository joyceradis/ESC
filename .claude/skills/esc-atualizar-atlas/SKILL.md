---
name: esc-atualizar-atlas
description: Atualizar o site Atlas ESC 2027 deste repositório (leituras, hipóteses, vocabulário, decisões, textos das páginas) a partir do acervo no Google Drive. Use quando a autora pedir para atualizar o atlas, o painel, o site da ESC ou sincronizar com a planilha mestre.
---

# Atualizar o Atlas ESC 2027

## Fonte de verdade

A planilha mestre no Drive manda: "ESC2027 | Registro mestre — Referências e Figuras"
(`1fksFh1OfIFxe6R7A6eebzSoTgnMHBAbgOfUJHjVvEr8`). Abas usadas: LEITURAS_SUGERIDAS, HIPOTESES, VOCABULARIO, DECISOES.
O site nunca escreve no Drive. Se a autora quiser mudar um status, mude primeiro na planilha (com o "sim" dela) e depois aqui.

## Onde mexer

| Quero mudar | Arquivo |
| --- | --- |
| Leituras, hipóteses, termos, decisões, prazo | `assets/js/data.js` |
| Texto de uma página | `src/pages/<página>.html` |
| Menu, rodapé, cabeçalho | `src/layout.html` |
| Lista e ordem das páginas | `PAGES` em `build.py` |
| Estilo | `assets/css/style.css` |

Nunca edite os `*.html` da raiz à mão: eles são gerados.

## Passos

1. Leia as abas da planilha e compare com `assets/js/data.js`. Liste as diferenças para a autora antes de aplicar.
2. Aplique as mudanças. Status válidos de leitura: `estudado`, `novo`, `pendente`, `verificar`. Só use `estudado` quando a planilha disser que a autora leu.
3. Rode:
   ```bash
   python3 build.py
   python3 tools/check_site.py
   ```
   Os dois precisam passar. O workflow "Verificar site" repete isso no GitHub.
4. Se mudou números que aparecem em texto fixo (ex.: "1 / 30 leituras estudadas" em `src/pages/index.html`, "Trinta leituras" em `biblioteca.html`), atualize o texto também.
5. Commit em português descrevendo o que mudou e por quê.

## Cuidados

- O repositório deve continuar privado: há hipótese não publicada e links do acervo.
- Não copiar texto de artigos para o site; usar paráfrases curtas no campo "o que investigar".
- Relatórios de IA (ChatGPT, Gemini, "Estruturação de Proposta") são fontes secundárias. Registrar autoria e data original na página `acervo.html`.
