#!/usr/bin/env python3
"""Transforma fontes e notas públicas em dados da interface ESC.

Fonte canônica: atlas/estudos-gel.json + atlas/notas/*.json.
Artefato derivado: assets/js/atlas-dados.js; nunca editar à mão.
Não lê chats, Drive, clínica ou dados privados. Não roda IA em CI.
"""
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STUDIES = ROOT / "atlas" / "estudos-gel.json"
NOTES = ROOT / "atlas" / "notas"
OUT = ROOT / "assets" / "js" / "atlas-dados.js"
ID = re.compile(r"^[a-z0-9][a-z0-9-]{2,79}$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
DOI = re.compile(r"10\.\d{4,9}/[^\s]+", re.ASCII)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def text_field(obj, key, limit=480):
    value = obj.get(key)
    require(isinstance(value, str) and 1 <= len(value.strip()) <= limit, f"campo {key} inválido")
    return value.strip()


def number(obj, key, allow_none=False):
    val = obj.get(key)
    if allow_none and val is None:
        return
    require(type(val) in (float, int) and 0 < val < 1000000, f"número {key} inválido")


def build_data():
    root = json.loads(STUDIES.read_text(encoding="utf-8"))
    require(root.get("schema_version") == 1, "versão de fontes incompatível")
    studies = root.get("studies")
    require(isinstance(studies, list) and 1 <= len(studies) <= 25, "estudos inválidos")
    seen = set()
    seen_dois = set()
    for study in studies:
        key = text_field(study, "id", 80)
        require(ID.fullmatch(key) and key not in seen, "ID de estudo duplicado/inválido")
        seen.add(key)
        for name in ("author", "title", "design", "explanation", "doi", "url", "methodological_note", "methodological_source", "methodological_source_label", "culture_note"):
            text_field(study, name, 700)
        # Validação estrutural; não certifica existência nem leitura do artigo.
        doi = study["doi"].strip().casefold()
        require(DOI.fullmatch(doi), f"{key}: DOI inválido")
        require(doi not in seen_dois, f"{key}: DOI duplicado no catálogo de estudos")
        seen_dois.add(doi)
        require(study["url"].startswith("https://"), "URL de fonte não HTTPS")
        require(study["methodological_source"].startswith("https://"), "URL metodológica não HTTPS")
        for name in ("thickness_nm", "modulus_kpa"):
            number(study, name)
        for name in ("thickness_error_nm", "modulus_error_kpa", "cell_modulus_kpa", "cell_modulus_error_kpa", "culture_shear_pa", "culture_medium_viscosity_mpas"):
            number(study, name, allow_none=True)
        require(type(study.get("year")) is int and 1950 <= study["year"] <= 2100, "ano de fonte inválido")
    model = root.get("explanatory_model")
    require(isinstance(model, dict), "modelo ausente")
    for key in ("id", "author", "url", "doi", "interpretation"):
        text_field(model, key, 550)
    require(DOI.fullmatch(model["doi"].strip()), "modelo: DOI inválido")
    dictionary = root.get("dictionary")
    require(isinstance(dictionary, dict), "glossário ausente")
    for key in ("thickness", "modulus", "shear", "permeability", "no_reference"):
        text_field(dictionary, key, 1000)

    notes = []
    known = set()
    for path in sorted(NOTES.glob("*.json")):
        note = json.loads(path.read_text(encoding="utf-8"))
        require(note.get("schema_version") == 1, f"{path.name}: schema")
        require(note.get("privacy") == "public-knowledge", f"{path.name}: somente conhecimento público")
        title = text_field(note, "title", 130)
        nid = text_field(note, "id", 80)
        require(ID.fullmatch(nid) and nid not in known, f"{path.name}: id inválido/duplicado")
        known.add(nid)
        require(DATE.fullmatch(text_field(note, "date", 10)), f"{path.name}: data inválida")
        try:
            date.fromisoformat(note["date"])
        except ValueError as exc:
            raise ValueError(f"{path.name}: data inválida") from exc
        require(note.get("category") in ("pergunta", "metodo", "evidencia", "decisao"), f"{path.name}: tipo inválido")
        require(note.get("status") in ("publicado", "rascunho"), f"{path.name}: status inválido")
        for key in ("summary", "question", "evidence", "provenance"):
            text_field(note, key, 900)
        link = text_field(note, "link", 210)
        require(re.fullmatch(r"[a-z-]+\.html(?:#[a-z0-9-]+)?", link), f"{path.name}: link externo")
        if note["status"] == "publicado":
            notes.append(note)
    notes.sort(key=lambda n: (n["date"], n["id"]), reverse=True)
    return {"studies": studies, "explanatory_model": model, "dictionary": dictionary, "notes": notes[:16]}


def build():
    payload = json.dumps(build_data(), ensure_ascii=False, separators=(",", ":"))
    # Não deixar texto de notas encerrar um <script> ou injetar HTML/JS.
    safe = payload.replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")
    safe = safe.replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("/* Gerado de atlas/ pela compilação; não editar diretamente. */\nwindow.ESC_ATLAS_DATA = " + safe + ";\n", encoding="utf-8")
    print(f"ok atlas: {len(build_data()['studies'])} estudos, {len(build_data()['notes'])} notas públicas")


if __name__ == "__main__":
    build()

