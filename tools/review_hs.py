import requests,re,pathlib,zipfile,io,xml.etree.ElementTree as ET,json
from pypdf import PdfReader
out=pathlib.Path("evidence");out.mkdir(exist_ok=True)
for name,doi,stem in [("pipis","10.1038/s41526-026-00627-8","41526_2026_627"),("du","10.1038/s41526-024-00456-7","41526_2024_456")]:
    page=requests.get("https://www.nature.com/articles/"+doi.split("/")[1],timeout=60)
    links=re.findall(r'href=["\']([^"\']+(?:ESM|MOESM)[^"\']*)',page.text)
    urls=["https://media.springernature.com/original/springer-static/esm/art%3A"+doi.replace("/","%2F")+"/MediaObjects/"+stem+"_MOESM1_ESM."+ext for ext in ["docx","pdf"]]
    urls=links+urls
    found=False
    for url in dict.fromkeys(urls):
        if url.startswith("//"):url="https:"+url
        try:
            r=requests.get(url,timeout=60)
            if r.status_code!=200:continue
            if r.content.startswith(b"%PDF"):
                text="\n".join(p.extract_text() or "" for p in PdfReader(io.BytesIO(r.content)).pages)
            elif r.content.startswith(b"PK"):
                z=zipfile.ZipFile(io.BytesIO(r.content));root=ET.fromstring(z.read("word/document.xml"))
                text="\n".join("".join(p.itertext()) for p in root.findall(".//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"))
            else:continue
            print("SUPPLEMENT",name,url,"TEXT_BEGIN",text,"TEXT_END")
            (out/(name+".txt")).write_text(url+"\n"+text)
            found=True;break
        except Exception as e: print(name,type(e).__name__,str(e)[:180])
    if not found: print("SUPPLEMENT_UNAVAILABLE",name,page.status_code)
