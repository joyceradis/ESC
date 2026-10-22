#!/usr/bin/env python3
"""Verificações do Atlas ESC 2027 (rodadas no GitHub Actions e localmente).

1. Toda página listada em build.py existe na raiz.
2. Links internos (*.html) e âncoras (#id) apontam para algo que existe.
3. Arquivos de assets referenciados pelas páginas existem.
4. data.js: IDs únicos e campos obrigatórios em leituras, hipóteses e termos.

Uso:  python3 tools/check_site.py      (sai com código 1 se houver problema)
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from build import PAGES  # noqa: E402

errors: list[str] = []

# 1 e 2 e 3 — páginas, links, âncoras e assets
ids_by_page = {}
html_by_page = {}
for slug, *_ in PAGES:
    f = ROOT / f"{slug}.html"
    if not f.exists():
        errors.append(f"página ausente: {f.name} (rode python3 build.py)")
        continue
    html = f.read_text(encoding="utf-8")
    html_by_page[f.name] = html
    ids_by_page[f.name] = set(re.findall(r'\sid="([^"]+)"', html))

for name, html in html_by_page.items():
    for href in re.findall(r'href="([^"]+)"', html):
        if href.startswith(("http://", "https://", "mailto:", "data:")):
            continue
        target, _, anchor = href.partition("#")
        page = target or name
        if target and not (ROOT / target).exists():
            errors.append(f"{name}: link quebrado → {href}")
            continue
        if anchor and page.endswith(".html") and anchor not in ids_by_page.get(page, set()):
            errors.append(f"{name}: âncora inexistente → {href}")
    for src in re.findall(r'(?:src|href)="(assets/[^"]+)"', html):
        if not (ROOT / src).exists():
            errors.append(f"{name}: asset ausente → {src}")

# 4 — dados (avaliados com Node para ler o JS como o navegador lê)
script = """
const vm = require('vm'), fs = require('fs');
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('assets/js/data.js', 'utf8'), ctx);
const E = ctx.ESC;
console.log(JSON.stringify({r: E.readings, h: E.hypotheses, v: E.vocab, d: E.decisions}));
"""
try:
    out = subprocess.run(["node", "-e", script], cwd=ROOT, capture_output=True, text=True, check=True).stdout
    data = json.loads(out)
except Exception as exc:  # noqa: BLE001
    errors.append(f"data.js não pôde ser lido: {exc}")
    data = None

if data:
    for key, label, required in (
        ("r", "leitura", ("id", "title", "url", "status", "area", "pri")),
        ("h", "hipótese", ("id", "title", "q", "refute")),
        ("v", "termo", ("id", "term", "def")),
    ):
        seen = set()
        for item in data[key]:
            iid = item.get("id", "?")
            if iid in seen:
                errors.append(f"{label} duplicada: {iid}")
            seen.add(iid)
            for field in required:
                if not item.get(field):
                    errors.append(f"{label} {iid}: campo vazio '{field}'")
        print(f"ok  {len(data[key])} {label}s")
    statuses = {"estudado", "novo", "pendente", "verificar"}
    for item in data["r"]:
        if item.get("status") not in statuses:
            errors.append(f"leitura {item.get('id')}: status inválido '{item.get('status')}'")
        if not str(item.get("url", "")).startswith("https://"):
            errors.append(f"leitura {item.get('id')}: url deve começar com https://")

print(f"ok  {len(html_by_page)} páginas verificadas")
if errors:
    print("\nProblemas encontrados:")
    for e in errors:
        print("  ✗", e)
    sys.exit(1)
print("Tudo certo.")
