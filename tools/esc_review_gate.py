#!/usr/bin/env python3
"""Classificador conservador de risco para PRs do Atlas ESC; sem escrita externa."""
import json
import os
import re
import subprocess
from pathlib import Path

def git(*args):
    return subprocess.check_output(["git", *args], text=True).strip()

def changed(base):
    return [p for p in git("diff", "--name-only", "--diff-filter=ACMRT", f"{base}...HEAD").splitlines() if p]

def assess(paths):
    critical = []
    scientific = []
    visual = []
    routine = []
    for path in paths:
        if path.startswith((".github/", ".claude/", ".mcp/")) or path in ("AGENTS.md", "CLAUDE.md", "build.py") or path.startswith("tools/"):
            critical.append(path)
        elif path.startswith(("atlas/", "src/pages/pergunta", "src/pages/protocolo", "src/pages/hipoteses", "assets/js/data", "assets/js/atlas", "src/pages/candidatura")):
            scientific.append(path)
        elif path.endswith((".css", ".js", ".html", ".svg")) or path.startswith("src/pages/"):
            visual.append(path)
        else:
            routine.append(path)
    return critical, scientific, visual, routine

def main():
    base = os.getenv("ESC_BASE_SHA", "").strip()
    if not re.fullmatch(r"[0-9a-f]{40}", base):
        raise SystemExit("ESC_BASE_SHA ausente ou inválido; sem aprovação por omissão")
    paths = changed(base)
    critical, scientific, visual, routine = assess(paths)
    findings = []
    if not paths: findings.append("Nenhum arquivo alterado ou diff indisponível")
    if critical: findings.append("Infraestrutura, política ou execução: revisão humana obrigatória")
    if scientific: findings.append("Hipóteses, fontes ou candidatura: revisão científica humana obrigatória")
    if visual: findings.append("Interface: validar responsividade, interação e acessibilidade")
    patch = git("diff", "--no-ext-diff", "--unified=0", f"{base}...HEAD", "--", "*.html", "*.md", "*.json", "*.js", "*.py", "*.yml")
    added = "\n".join(line[1:] for line in patch.splitlines() if line.startswith("+") and not line.startswith("+++"))
    patterns = {
        "Possível dado sensível ou credencial": r"(?i)(-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|ghp_[A-Za-z0-9]{20,}|sk-proj-[A-Za-z0-9_-]{20,}|password\s*[:=]\s*['\"][^'\"]+)",
        "Afirmação científica absoluta — verificar contexto": r"(?i)\b(?:comprova(?:do)?|100% eficaz|cura garantida|nunca foi estudado|ineditismo comprovado)\b",
    }
    for label, regex in patterns.items():
        if re.search(regex, added):
            findings.append(label)
    blocked = bool(critical or scientific or any("sensível" in x for x in findings) or not paths)
    status = "REQUER REVISÃO HUMANA" if blocked else "TRIAGEM AUTOMÁTICA CONCLUÍDA — revisão de PR ainda necessária"
    data = {"status":status, "changed_files":paths, "critical":critical, "scientific":scientific, "visual":visual, "routine":routine, "findings":findings, "auto_merge":False, "ai_review_executed":False}
    Path("esc-review.json").write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n")
    report=["# Triagem de governança ESC", "", f"**Resultado:** {status}", "", "Não é validação científica, parecer de IA, aprovação de PR nem autorização de publicação.", "", "## Arquivos", *[f"- {p}" for p in paths], "", "## Alertas", *[f"- {f}" for f in (findings or ["Nenhum sinalizador adicional identificado"])], "", "## Revisões necessárias", "- CI do site, visual e testes especializados pertinentes", "- Conferir referências, inferências e status das hipóteses quando houver mudança científica", "- Decisão final da Joyce para mesclar ou publicar", "", "A IA externa não foi acionada. Nenhum segredo é necessário para esta triagem."]
    Path("esc-review.md").write_text("\n".join(report)+"\n")
    print("\n".join(report))
    if blocked:
        print("::warning::Revisão humana recomendada para esta alteração; o alerta não é reprovação técnica automática.")

if __name__ == "__main__":
    main()
