# Governança leve de branches e agentes — ESC

**Objetivo:** entregar mudanças rastreáveis sem fila burocrática, sem ramos duplicados e sem ignorar riscos reais. **Este documento não altera permissões nem substitui a decisão da autora.**

## Branches
- **Uma necessidade → uma issue ou PR ativo → uma branch de trabalho.** Consultar PRs e branches existentes antes de criar outra. Reutilizar branch ativa do mesmo escopo e executor; não misturar projetos.
- Nomes curtos: `fix/`, `feat/`, `docs/`, `research/` ou `governanca/`, seguidos do assunto. Não criar branch só para observar, discutir ou emitir relatório.
- Toda branch com PR deve ter objetivo, responsável funcional, próximo passo e critério de conclusão. PR Draft aceita trabalho parcial e pedidos de ajuda, sem obrigação de parecer pronto.
- Branches sem PR ou sem atividade devem entrar em **revisão**, nunca em exclusão automática. Verificar commits exclusivos, PRs, autor, histórico e dependências. Excluir somente mediante decisão específica, depois do merge ou descarte confirmado.
- Evitar que várias IAs editem o mesmo arquivo em paralelo. Quem inicia declara escopo e informa conflito no PR; não sequestrar entregas de outro agente.

## Revisão proporcional
- **Rotineira:** ortografia, organização de links e navegação sem risco — CI técnico e explicação breve, sem formulário longo.
- **Científica/editorial:** distinguir afirmação, fonte primária, inferência, lacuna e hipótese; registrar incerteza, comparação e possível refutação. Divergência gera questão para análise, não reprovação automática por palavras isoladas.
- **Crítica:** segredos, dados privados, scripts de execução, permissões, publicação e mudanças em metodologia científica — parar alterações sensíveis e pedir decisão expressa da autora.

## Resposta mínima útil do agente em PR
**O que mudou / por quê; evidência ou teste realmente executado; problema pendente; quem decide e qual o próximo passo.** Se não tiver resposta, marcar `Draft / aguardando informação` com pergunta específica. Não inventar sucesso, evidência ou parecer de outro agente.

## Sem cerco cego
- Alertas heurísticos são **avisos**, não prova de falha. Um aviso gera explicação e revisão, e não um exit code 1 por si só.
- Erro técnico reprodutível de build, testes, exposição de segredo ou integridade crítica é falha real. Aplicar checks obrigatórios somente após estabilização e verificação de que não criam bloqueios artificiais.
- Automatização sem acesso aos dispositivos; não executar sync, bundles, clones, acesso a arquivos locais, conversas entre agentes ou publicação automática.
- Sem merges na `main` por agentes. Decisão final da Joyce, inclusive quando checks estão verdes. Relatórios automáticos não são revisão por IA.
- Acompanhar periodicidade sem criar um novo agente permanente: auditar **metadados** de branches/PRs sob demanda; limitar tentativas repetidas e tempo dos workflows.

Esta regra complementa `AGENTS.md` e não altera a governança de execução designada ali.
