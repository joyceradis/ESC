# ESC 2027 — mapa de continuidade e evolução científica
**Atualizado em 14/10/2026. Documento de orientação para qualquer chat/agente com acesso de leitura ao repositório.** Não é versão final da candidatura, nem validação independente de todos os estudos.

## Comece aqui (sem reconstruir tudo)
1. `README.md`: finalidade, site e mapa de arquivos.
2. `AGENTS.md`: limites de execução, privacidade, autoria e merge; prevalece sobre qualquer sugestão deste documento.
3. `src/pages/hipoteses.html`, `src/pages/pergunta.html`, `src/pages/protocolo.html`: linhas abertas, hipótese candidata e modelo experimental.
4. `src/pages/retomar.html`, `src/pages/candidatura.html`, `src/pages/acervo.html`: estado de trabalho, candidatura e documentação.
5. `assets/js/data.js`, `atlas/`, `evidence/` (quando presentes): **cópias e derivados públicos**, não substituem as fontes primárias do Drive.
6. Issue [#3](https://github.com/joyceradis/ESC/issues/3): requisitos do laboratório e a decisão de não reduzir o atlas a uma única tese.

**Atenção:** repositório e GitHub Pages são públicos. Não transcrever observações privadas, dados pessoais, notas inéditas ou conteúdo não aprovado do Google Drive para cá.

## Linha evolutiva do problema científico
- **Pergunta de partida**: descarga mecânica/microgravidade e alterações do coração, com interesse na titina e na possível relevância para insuficiência cardíaca com fração de ejeção preservada (ICFEp). A condição de voo não deve ser equiparada sem ressalvas a modelos terrestres de descarga.
- **Expansão mecanística**: organização do glicocálix endotelial (eGCX), heparan sulfato, hialuronano, proteoglicanos, sinalização por cisalhamento e NO; distinção entre camada supramolecular, componentes e matriz hidratada. Analogias como “antenas” ou “gel” não são definições anatômicas.
- **Questões de ponte**: a relação eGCX → sinalização sob fluxo → NO–cGMP–PKG → fosforilação de titina → tensão passiva é **hipótese a testar**, não cadeia causal demonstrada em ICFEp humana.
- **Abordagem clínica/translacional**: heterogeneidade de fenótipos da ICFEp, perfusão/marcadores de shedding, medicamentos, resultados negativos e limites das associações. SDC-1, HA, PBR e outras medidas não são equivalentes nem específicos de eGCX isoladamente.
- **Desenhos candidatos**: testes estruturais por componente, diferenças agudas/crônicas de titina e RBM20, comparação de proteção farmacológica e vias de resgate, uso de material biológico humano em modelo experimental. Esses quatro eixos são **propostas sob avaliação**, não execução confirmada, protocolo aprovado ou prova de originalidade.
- **Estado em 13/10**: o registro de retomada passou a reconhecer progresso de leitura crítica e formulação de perguntas, sem promover automaticamente hipótese ou marcar novos artigos como assimilados.

## Disciplina de evidências
- Distinguir pergunta da autora, hipótese proposta por IA, resultado de publicação, extrapolação, limite metodológico e decisão de candidatura.
- Conferir antecedentes primários (por exemplo, trabalhos sobre descarga e eGCX, resposta de NO ao fluxo e PKG/titina) antes de afirmar novidade. Ausência em busca pontual não comprova ineditismo.
- Não inferir que coorte humana com biomarcadores demonstrou mecanismo endotelial específico, nem que um modelo `heart-on-a-chip` prova benefício clínico.
- Manter alternativas: resposta intrínseca do cardiomiócito, caminhos vasculares e fatores sistêmicos. Nenhuma das hipóteses HYP deve ser descartada por decisão de um agente.

## Fontes de verdade e acesso
- O GitHub **é ponto de entrada público** para a interface e histórico do site; `src/pages/` é fonte dos HTML e `build.py` gera os arquivos de raiz.
- Os comentários, revisões, notas e documentação científica originais permanecem no **Google Drive, em acesso restrito**, especialmente pasta `ESC 2027 | Projeto de pesquisa translacional`, o rascunho RAS-001 e a planilha de referências e figuras. Para lê-los, o outro chat deve ter seu próprio conector Google Drive autorizado pela usuária; o link sozinho não outorga acesso.
- Não solicitar nem transmitir tokens entre chats, IAs ou agentes. Caso não haja conector, identificar precisamente o que ficou sem verificação e trabalhar com fontes públicas ou arquivos fornecidos expressamente.
- Não operar dispositivos pessoais. Não iniciar `sync`, `bundle`, clones, instalações, servidores locais ou acessos ao Obsidian sem autorização específica.
- Não contatar outras IAs ou usar issues como canal de comunicação entre agentes em nome da autora.

## Estado do software — não confundir com ciência
- Site: [Atlas ESC 2027](https://joyceradis.github.io/ESC/).
- Ferramentas didáticas de física/química/filtração são modelos educativos, não medições experimentais ou clínicas.
- CI, revisões visuais e triagem de governança são ferramentas de engenharia; testes verdes não validam hipóteses. No último exame documentado, `main` não tinha proteção obrigatória; reconfirmar antes de afirmar que existe bloqueio.
- PRs [#25](https://github.com/joyceradis/ESC/pull/25), [#26](https://github.com/joyceradis/ESC/pull/26) e [#27](https://github.com/joyceradis/ESC/pull/27) registraram atualização de retomada e políticas de revisão. Conferir estado atual no GitHub.

## O que responder ao abrir nova sessão
1. **O que mudou desde o início?** Resumir a evolução de pergunta sobre descarga/microgravidade para hipóteses concorrentes, incluindo ponte endotelial e componente miocárdico, sem confundir ampliação com substituição.
2. **O que é comprovado?** Mostrar fontes e distinguir observação, associação, mecanismo em modelos e hipóteses ainda não testadas.
3. **O que falta para 23/10?** Verificar edital e data em fonte oficial; delimitar uma pergunta central, comparar viabilidade/alternativas e preparar a candidatura. Não declarar que está pronta só porque o site funciona.
4. **Onde prosseguir?** Começar por `src/pages/retomar.html`, apontar lacunas reais de acesso ao Drive e pedir apenas a autorização adicional indispensável.

## Proveniência desta síntese
Reconstrução temática a partir do acervo público, documentação e commits do repositório, incluindo modificações entre 11 e 14/10. Parte dos insights originais está manuscrita e não é possível afirmar que toda a aprendizagem esteja digitalizada. Este documento é uma **ponte de continuidade**, não substituto das anotações originais.
