import copy,json,unittest
from pathlib import Path
from unittest.mock import patch
from tools.sync_sheet import transform,SPECS,connector_payload
from tools.build_evidence import compile_data
ROOT=Path(__file__).resolve().parents[1]
def fixture():
 return {
 "LEITURAS_SUGERIDAS":[SPECS["LEITURAS_SUGERIDAS"]["header"],["L-1","ALTA","Fluxo","Title","Author (2020)","Review","10.1234/demo","https://doi.org/10.1234/demo","PRIVATE NOTES"]],
 "FONTES_11OUT":[SPECS["FONTES_11OUT"]["header"],["F-1","PRIVATE ORIGIN","Author","2020","Title","10.1234/demo","https://doi.org/10.1234/demo"]]}
class SyncTests(unittest.TestCase):
 def test_dedup_privacy(self):
  out=transform(fixture());self.assertEqual(len(out["records"]),1)
  self.assertEqual(out["records"][0]["aliases"],["L-1","F-1"])
  self.assertNotIn("PRIVATE",json.dumps(out));self.assertNotIn("estudado",json.dumps(out))
 def test_idempotent_with_previous(self):
  first=transform(fixture());second=transform(fixture(),first)
  self.assertEqual(first['records'],second['records'])
 def test_conflicting_duplicate(self):
  p=fixture();p["FONTES_11OUT"][1][4]="Different title"
  self.assertTrue(transform(p)["records"][0]["conflict"])
 def test_connection_without_card_stales(self):
  cat=json.loads((ROOT/"atlas/sync/catalogue.json").read_text());cur=json.loads((ROOT/"atlas/sync/curation.json").read_text())
  first=cur["connections"][0]["sources"][0]
  cur["cards"]=[c for c in cur["cards"] if c["id"]!=first]
  next(r for r in cat["records"] if r["id"]==first)["title"]="Changed"
  out=compile_data(cat,cur)
  self.assertTrue(next(c for c in out["connections"] if first in c["sources"])["stale"])
 def test_header_change(self):
  p=fixture();p["FONTES_11OUT"][0]=["renamed"]
  with self.assertRaises(ValueError):transform(p)
 def test_missing_sheet(self):
  with self.assertRaises(ValueError):transform({})
 def test_duplicate_id(self):
  p=fixture();p["FONTES_11OUT"].append(p["FONTES_11OUT"][1])
  with self.assertRaises(ValueError):transform(p)
 def test_truncated_read(self):
  p=fixture();p["FONTES_11OUT"]=[p["FONTES_11OUT"][0]]+[p["FONTES_11OUT"][1]]*299
  with self.assertRaises(ValueError):transform(p)
 def test_large_drop(self):
  old=transform(fixture());old["source_counts"]["FONTES_11OUT"]=10
  with self.assertRaises(ValueError):transform(fixture(),old)
 def test_missing_record_preserved(self):
  old=transform(fixture());old["records"].append({**old["records"][0],"id":"lost","aliases":["lost"],"doi":"10.9999/missing","url":"https://doi.org/10.9999/missing"})
  out=transform(fixture(),old);self.assertTrue(out["records"][-1]["absent"])
 def test_unsafe_link_not_exported(self):
  p=fixture();p["LEITURAS_SUGERIDAS"][1][6]="";p["LEITURAS_SUGERIDAS"][1][7]="javascript:alert(1)"
  out=transform(p);self.assertEqual(out["records"][0]["url"],"")
 def test_source_change_invalidates_connection(self):
  cat=json.loads((ROOT/"atlas/sync/catalogue.json").read_text());cur=json.loads((ROOT/"atlas/sync/curation.json").read_text())
  first=cur["cards"][0]["id"]
  next(r for r in cat["records"] if r["id"]==first)["title"]="Changed"
  out=compile_data(cat,cur);self.assertTrue(out["cards"][first]["stale"])
  self.assertTrue(any(c["stale"] for c in out["connections"] if first in c["sources"]))
 def test_missing_citation_rejected(self):
  cat=json.loads((ROOT/"atlas/sync/catalogue.json").read_text());cur=json.loads((ROOT/"atlas/sync/curation.json").read_text())
  cur["connections"][0]["sources"]=["missing"]
  with self.assertRaises(ValueError):compile_data(cat,cur)
 def test_hypothesis_not_result(self):
  cat=json.loads((ROOT/"atlas/sync/catalogue.json").read_text());cur=json.loads((ROOT/"atlas/sync/curation.json").read_text())
  cur["cards"][0]["kind"]="hypothesis"
  with self.assertRaises(ValueError):compile_data(cat,cur)
 def test_connector_replay_matches_catalogue(self):
  saved=json.loads((ROOT/"atlas/sync/catalogue.json").read_text())
  exported=json.loads((ROOT/"atlas/sync/connector-input.json").read_text())
  replay=transform(connector_payload(exported),saved,imported_on=saved["imported_on"])
  self.assertEqual(replay["records"],saved["records"])
  self.assertEqual(replay["source_counts"],saved["source_counts"])
 def test_connector_rejects_private_column(self):
  exported=json.loads((ROOT/"atlas/sync/connector-input.json").read_text())
  exported["sheets"]["FONTES_11OUT"]["header"].append("notes")
  with self.assertRaises(ValueError):connector_payload(exported)
 def test_connector_rejects_extra_sheet(self):
  exported=json.loads((ROOT/"atlas/sync/connector-input.json").read_text())
  exported["sheets"]["PRIVATE"]={"header":[],"rows":[]}
  with self.assertRaises(ValueError):connector_payload(exported)
 def test_missing_authorship_preserved_without_invention(self):
  p=fixture();p["LEITURAS_SUGERIDAS"][1][4]=""
  result=transform(p)
  self.assertEqual(result["records"][0]["authors"],"")
  self.assertEqual(result["records"][0]["year"],"")
if __name__=="__main__":unittest.main()
