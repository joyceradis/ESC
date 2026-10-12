#!/usr/bin/env python3
"""Gera as páginas estáticas do Atlas ESC 2027.

Cada página tem o miolo em src/pages/<slug>.html; o layout comum (barra lateral,
navegação móvel, rodapé e paginação) está em src/layout.html.

Uso:  python3 build.py
Saída: <slug>.html na raiz do repositório (pronto para GitHub Pages).
"""
from tools.build_evidence import build as build_evidence
from pathlib import Path
from html import escape
from tools.build_atlas_data import build as build_atlas_data, build_data

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

# (slug, título da aba, rótulo do menu, rótulo curto no celular)
PAGES = [
    ("index", "Visão geral", "Visão geral", "Início"),
    ("retomar", "De onde parei", "De onde parei", "Retomar"),
    ("pergunta", "Pergunta científica", "Pergunta científica", "Pergunta"),
    ("candidatura", "Candidatura ESC", "Candidatura ESC", "ESC"),
    ("protocolo", "Protocolo proposto", "Protocolo proposto", "Protocolo"),
    ("biblioteca", "Biblioteca", "Biblioteca", "Leituras"),
    ("hipoteses", "Linhas de investigação", "Linhas de investigação", "Hipóteses"),
    ("laboratorio", "Laboratório interativo", "Laboratório interativo", "Laboratório"),
    ("vocabulario", "Vocabulário", "Vocabulário", "Termos"),
    ("acervo", "Acervo e autoria", "Acervo e autoria", "Acervo"),
]


def nav(active: str) -> str:
    items = []
    for i, (slug, _t, label, _s) in enumerate(PAGES):
        cur = ' aria-current="page"' if slug == active else ""
        items.append(f'<a href="{slug}.html"{cur}><span class="n">{i + 1:02d}</span>{label}</a>')
    return "\n ".join(items)


def mobile_nav(active: str) -> str:
    return "".join(
        f'<a href="{slug}.html"{" aria-current=page" if slug == active else ""}>{short}</a>'
        for slug, _t, _l, short in PAGES
    )


def pager(i: int) -> str:
    parts = []
    if i > 0:
        s, _t, l, _ = PAGES[i - 1]
        parts.append(f'<a class="prev" href="{s}.html"><small>← Anterior</small><strong>{l}</strong></a>')
    if i < len(PAGES) - 1:
        s, _t, l, _ = PAGES[i + 1]
        parts.append(f'<a class="next" href="{s}.html"><small>Próxima →</small><strong>{l}</strong></a>')
    return f'<nav class="pager" aria-label="Paginação">{"".join(parts)}</nav>'


def home_latest_note(notes: list) -> str:
    """Render only the latest curated note; full provenance stays in the lab."""
    if not notes:
        return '<p class="home-eyebrow">Atlas vivo</p><p>A próxima nota curada aparece aqui.</p>'
    latest = max(notes, key=lambda note: (note["date"], note["id"]))
    date = escape(latest["date"], quote=True)
    label = escape("/".join(reversed(latest["date"].split("-"))))
    title = escape(latest["title"])
    return (f'<p class="home-eyebrow">Última nota curada · <time datetime="{date}">{label}</time></p>'
            f'<p class="home-note-title">{title}</p>')


def main() -> None:
    build_evidence()
    build_atlas_data()  # notas e estudos versionados -> asset derivado
    layout = (SRC / "layout.html").read_text(encoding="utf-8")
    for i, (slug, title, _l, _s) in enumerate(PAGES):
        body = (SRC / "pages" / f"{slug}.html").read_text(encoding="utf-8")
        if slug == "index":
            body = body.replace("{{home_latest_note}}", home_latest_note(build_data()["notes"]))
        html = (
            layout.replace("{{title}}", title)
            .replace("{{nav}}", nav(slug))
            .replace("{{mobile_nav}}", mobile_nav(slug))
            .replace("{{page_assets}}", (
                '<link rel="stylesheet" href="assets/css/home.css" />\n'
                if slug == "index" else ""
            ) + (
                '<link rel="stylesheet" href="assets/css/protocolo.css" />\n'
                if slug == "protocolo" else ""
            ) + (
                ('<script src="assets/js/atlas-dados.js" defer></script>\n'
                 '<script src="assets/js/atlas-feed.js" defer></script>\n')
                if slug == "laboratorio" else ""
            ) + (
                '<link rel="stylesheet" href="assets/css/laboratorio.css" />\n'
                '<script src="assets/js/lab-math.js" defer></script>\n'
                '<script src="assets/js/laboratorio.js" defer></script>'
                if slug == "laboratorio" else ""
            ))
            .replace("{{body}}", body.strip())
            .replace("{{pager}}", pager(i))
        )
        if slug == "biblioteca":
            html = html.replace("</head>", '<link rel="stylesheet" href="assets/css/evidence.css" />\n<script src="assets/js/evidence-data.js" defer></script>\n<script src="assets/js/evidence.js" defer></script>\n</head>')
        (ROOT / f"{slug}.html").write_text(html, encoding="utf-8")
        print(f"ok  {slug}.html")


if __name__ == "__main__":
    main()
