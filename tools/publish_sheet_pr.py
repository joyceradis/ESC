"""Publica somente os arquivos derivados permitidos em PR rascunho; nunca main."""
import json,os,re,sys
from pathlib import Path
from urllib.request import Request,urlopen
ROOT=Path(__file__).resolve().parents[1]
ALLOWED=["atlas/sync/catalogue.json","assets/js/evidence-data.js","biblioteca.html"]
def main():
 if os.environ.get("GITHUB_EVENT_NAME")!="workflow_dispatch" or os.environ.get("GITHUB_REF")!="refs/heads/main":raise ValueError("Somente execução manual da main.")
 repo=os.environ["GITHUB_REPOSITORY"]
 if repo!="joyceradis/ESC":raise ValueError("Repositório inesperado.")
 def api(path,data=None):
  request=Request("https://api.github.com/repos/"+repo+"/"+path,data=json.dumps(data).encode() if data is not None else None,headers={"Authorization":"Bearer "+os.environ["GH_TOKEN"],"Accept":"application/vnd.github+json","Content-Type":"application/json"})
  with urlopen(request,timeout=40) as response:
   body=response.read();return json.loads(body) if body else None
 base=api("commits/main")
 if base["sha"]!=os.environ["GITHUB_SHA"]:raise ValueError("Main mudou; execute novamente para não sobrescrever trabalho.")
 # Comparar apenas arquivos permitidos. Sem git add amplo.
 import subprocess
 changed=subprocess.check_output(["git","diff","--name-only","--",*ALLOWED],cwd=ROOT,text=True).splitlines()
 if not changed:print("Sem atualização pública para propor.");return
 entries=[{"path":p,"mode":"100644","type":"blob","content":(ROOT/p).read_text()} for p in changed]
 tree=api("git/trees",{"base_tree":base["commit"]["tree"]["sha"],"tree":entries})
 commit=api("git/commits",{"message":"Sincronizar metadados permitidos da planilha","tree":tree["sha"],"parents":[base["sha"]]})
 run=os.environ["GITHUB_RUN_ID"];require_id=re.fullmatch(r"\d+",run)
 if not require_id:raise ValueError("ID de execução inválido")
 branch="sync/planilha-"+run
 api("git/refs",{"ref":"refs/heads/"+branch,"sha":commit["sha"]})
 pr=api("pulls",{"title":"Atualizar fichas a partir da planilha","head":branch,"base":"main","draft":True,"body":"Atualização seletiva de metadados bibliográficos. Não altera notas privadas, RASCUNHO, status de leitura nem curadoria de resultados. Sínteses com metadados alterados ficam pendentes de revisão. Geração e testes no workflow; merge pela Joyce. Validação visual será despachada nesta branch."})
 # workflow_dispatch explícito é permitido para eventos criados por GITHUB_TOKEN.
 api("actions/workflows/revisao-sync.yml/dispatches",{"ref":branch})
 print("PR criado:",pr["html_url"])
if __name__=="__main__":
 try:main()
 except Exception:print("Publicação interrompida; conferir permissões/estado no GitHub. Main não foi alterada.",file=sys.stderr);sys.exit(1)
