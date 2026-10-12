#!/usr/bin/env python3
"""Importação seletiva. Nunca grava resposta bruta ou notas da planilha."""
import argparse, copy, json, re, sys, unicodedata
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "atlas/sync/catalogue.json"
SPECS = {
 "LEITURAS_SUGERIDAS": {"header": ["ID","PRIORIDADE","EIXO","TÍTULO OFICIAL (SEM TRADUÇÃO)","AUTORIA / ANO","TIPO DE FONTE","DOI","LINK PARA LEITURA"], "range": "A1:H150", "bound":150, "cols": (0,3,4,None,6,7)},
 "FONTES_11OUT": {"header": ["ID LOCAL","ORIGEM NO MATERIAL","AUTORES","ANO","TÍTULO","DOI","URL"], "range":"A1:G300", "bound":300, "cols":(0,4,2,3,5,6)}
}
CORE = ("id","title","authors","year","doi","url")
def require(ok, message):
 if not ok: raise ValueError(message)
def clean(value, limit=1000):
 require(isinstance(value,str) and len(value)<=limit, "Campo inválido ou excedeu limite.")
 require(not re.search(r"[\x00-\x08\x0b\x0c\x0e-\x1f]",value), "Caracteres inválidos.")
 return value.strip()
def normalize_doi(value):
 value=re.sub(r"^https?://(?:dx\.)?doi\.org/","",clean(value),flags=re.I).lower()
 return value if re.fullmatch(r"10\.\d{4,9}/[^\s<>\"{}]+",value) else ""
def safe_url(value):
 value=clean(value)
 return value if re.fullmatch(r"https://(?:doi\.org|pubmed\.ncbi\.nlm\.nih\.gov|pmc\.ncbi\.nlm\.nih\.gov)/[^\s<>\"{}]+",value) else ""
def comparable(value):
 return re.sub(r"[^a-z0-9]","",unicodedata.normalize("NFKD",value).encode("ascii","ignore").decode().lower())
def transform(payload, previous=None, imported_on=None):
 require(set(payload)==set(SPECS), "Abas recebidas diferem do contrato.")
 records=[]; keys={}; counts={}
 previous_by_doi={r['doi']:r for r in (previous or {}).get('records',[]) if r['doi']}
 for sheet,spec in SPECS.items():
  rows=payload[sheet]
  require(isinstance(rows,list) and 1<len(rows)<spec["bound"],"Aba vazia ou limite de leitura atingido.")
  require(rows[0][:len(spec["header"])]==spec["header"],"Cabeçalho mudou; revisar mapeamento.")
  seen=set();counts[sheet]=0
  for raw in rows[1:]:
   if not raw or not raw[0]: continue
   row=list(raw)+[""]*8
   ident=clean(row[0],80)
   require(re.fullmatch(r"[A-Za-z0-9-]+",ident) and ident not in seen,"ID duplicado/inválido na origem.")
   seen.add(ident);counts[sheet]+=1
   _,t,a,y,d,u=spec["cols"]
   title=clean(row[t]);authors=clean(row[a]);require(title,"Referência sem título.")
   year=clean(row[y],60) if y is not None else ((re.search(r"\b(?:19|20)\d{2}\b",authors) or [""])[0])
   doi=normalize_doi(row[d]);url="https://doi.org/"+doi if doi else safe_url(row[u])
   key=doi or sheet+":"+ident
   if key in keys:
    if any(comparable(keys[key][field])!=comparable(value) for field,value in (("title",title),("authors",authors),("year",year))): keys[key]["conflict"]=True
    if ident not in keys[key]["aliases"]: keys[key]["aliases"].append(ident)
    continue
   stable=previous_by_doi.get(doi,{})
   stable_id=stable.get("id",ident)
   aliases=list(dict.fromkeys([ident]+stable.get("aliases",[])))
   record=dict(id=stable_id,title=title,authors=authors,year=year,doi=doi,url=url,aliases=aliases,origin=sheet,absent=False,conflict=False)
   keys[key]=record;records.append(record)
 require(records,"Importação vazia.")
 if previous:
  for sheet,old_count in previous["source_counts"].items():
   require(counts.get(sheet,0)>=old_count*.8,"Redução acima de 20%; atualização interrompida.")
  active_aliases={a for r in records for a in r["aliases"]}
  for old in previous["records"]:
   if not any(a in active_aliases for a in old["aliases"]):
    kept=copy.deepcopy(old);kept["absent"]=True;records.append(kept)
 return dict(schema_version=1,imported_on=imported_on or datetime.now(ZoneInfo("America/Sao_Paulo")).date().isoformat(),mode="connector",source_counts=counts,records=records)
def connector_payload(value):
 require(isinstance(value,dict) and set(value)=={"schema_version","sheets"} and value["schema_version"]==1,"Envelope inválido.")
 require(set(value["sheets"])==set(SPECS),"Abas fora do contrato.")
 payload={}
 for sheet,spec in SPECS.items():
  block=value["sheets"][sheet]
  require(set(block)=={"header","rows"} and block["header"]==["id","title","authors","year","doi","url"],"Campos não autorizados.")
  require(isinstance(block["rows"],list) and 0<len(block["rows"])<spec["bound"]-1,"Contagem inválida.")
  rows=[spec["header"]]
  for row in block["rows"]:
   require(isinstance(row,list) and len(row)==6,"Linha inválida.")
   ident,title,authors,year,doi,url=[clean(v) for v in row]
   if sheet=="LEITURAS_SUGERIDAS":
    expected=(re.search(r"\b(?:19|20)\d{2}\b",authors) or [""])[0]
    require(year==expected,"Ano da autoria diverge.")
    rows.append([ident,"","",title,authors,"",doi,url])
   else: rows.append([ident,"",authors,year,title,doi,url])
  payload[sheet]=rows
 return payload
def save(payload, previous=None):
 result=transform(payload,previous)
 # Sem alteração não muda data nem cria commit vazio.
 if previous and result["records"]==previous["records"] and result["source_counts"]==previous["source_counts"]:
  print("Sem mudança nos campos bibliográficos permitidos.");return
 OUT.parent.mkdir(parents=True,exist_ok=True)
 temp=OUT.with_suffix(".tmp")
 temp.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8");temp.replace(OUT)
 print("Catálogo público atualizado:",len(result["records"]),"registros; conteúdo bruto não gravado.")
def main():
 parser=argparse.ArgumentParser();parser.add_argument("--connector-input",type=Path,required=True,help="Somente os seis campos públicos autorizados por linha; sem resposta bruta.")
 args=parser.parse_args()
 try:
  payload=connector_payload(json.loads(args.connector_input.read_text()))
  previous=json.loads(OUT.read_text()) if OUT.exists() else None
  if previous and previous.get("mode")=="synthetic": previous=None
  save(payload,previous)
 except (ValueError,TypeError,KeyError,OSError):
  print("Importação bloqueada: conferir acesso, contrato de colunas e contagens; dados anteriores preservados.",file=sys.stderr);return 1
 return 0
if __name__=="__main__":sys.exit(main())
