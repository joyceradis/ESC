"""Valida catálogo/curadoria e gera apenas dados públicos para a Biblioteca."""
import json,re
from pathlib import Path
from tools.sync_sheet import CORE, require, safe_url
ROOT=Path(__file__).resolve().parents[1]
KINDS={"evidence","association","hypothesis","pending"}
def compile_data(catalogue,curation):
 require(catalogue.get("schema_version")==1 and curation.get("schema_version")==1,"Schema inválido")
 require(curation.get("decision")=="exploratory","A pergunta continua exploratória")
 records=catalogue["records"];by_id={r["id"]:r for r in records}
 require(len(by_id)==len(records) and 0<len(records)<1000,"Catálogo duplicado/vazio")
 for r in records:
  require(set(r)==set(CORE)|{"aliases","origin","absent","conflict"},"Campo fora do contrato público")
  require(re.fullmatch(r"[A-Za-z0-9-]+",r["id"]),"ID inseguro")
  require(all(isinstance(r[k],str) and len(r[k])<=1000 for k in CORE),"Metadados inválidos")
  require(not r["url"] or safe_url(r["url"])==r["url"],"URL não permitida")
  require(isinstance(r["absent"],bool) and isinstance(r["conflict"],bool) and isinstance(r["aliases"],list),"Estado inválido")
 cards={}
 for card in curation["cards"]:
  require(card["id"] in by_id and card["id"] not in cards,"Ficha sem fonte ou duplicada")
  require(card["kind"] in KINDS and card["kind"]!="hypothesis","Hipótese não é resultado de artigo")
  for key in ("topic","headline","model","exposure","measured","finding","limit","review","reviewed_on"):
   require(isinstance(card.get(key),str) and 0<len(card[key])<=500,"Ficha incompleta")
  require(safe_url(card["source"])==card["source"] and bool(card["source"]),"Fonte pública ausente")
  require(set(card["source_version"])==set(CORE),"Versão da fonte ausente")
  r=by_id[card["id"]]
  stale=r["absent"] or r["conflict"] or card["source_version"]!={k:r[k] for k in CORE}
  cards[card["id"]]={**card,"stale":stale}
 connections=[]
 seen=set()
 for conn in curation["connections"]:
  require(conn["kind"] in KINDS and conn["id"] not in seen,"Conexão inválida");seen.add(conn["id"])
  require(conn["sources"] and all(s in by_id for s in conn["sources"]),"Conexão sem referências válidas")
  for key in ("title","summary","limit"):
   require(isinstance(conn[key],str) and 0<len(conn[key])<=500,"Conexão incompleta")
  require(set(conn.get("source_versions",{}))==set(conn["sources"]),"Versões das fontes da conexão ausentes")
  require(all(set(conn["source_versions"][s])==set(CORE) for s in conn["sources"]),"Versão incompleta")
  stale=any(by_id[s]["absent"] or by_id[s]["conflict"] or conn["source_versions"][s]!={k:by_id[s][k] for k in CORE} for s in conn["sources"])
  connections.append({**conn,"stale":stale})
 return {"imported_on":catalogue["imported_on"],"mode":catalogue["mode"],"records":records,"cards":cards,"connections":connections,"decision":"exploratory"}
def build():
 data=compile_data(json.loads((ROOT/"atlas/sync/catalogue.json").read_text()),json.loads((ROOT/"atlas/sync/curation.json").read_text()))
 text=json.dumps(data,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c").replace(">","\\u003e").replace("&","\\u0026").replace("\u2028","\\u2028").replace("\u2029","\\u2029")
 (ROOT/"assets/js/evidence-data.js").write_text("/* Gerado por build.py; não editar. */\nwindow.ESC_EVIDENCE="+text+";\n")
 print("ok fichas:",len(data["records"]),"referências;",len(data["cards"]),"sínteses com estado explícito")
if __name__=="__main__":build()
