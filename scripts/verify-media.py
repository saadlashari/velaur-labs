from pathlib import Path
import json,hashlib
from PIL import Image
root=Path(__file__).resolve().parents[1]
catalog=json.loads((root/'data/portfolio.json').read_text(encoding='utf-8-sig'))
assets=[]
for project in catalog:
 for entry in project['content'].get('gallery',[]):
  file=(root/'public'/entry['url'].lstrip('/')).resolve()
  assert file.is_relative_to(root/'public') and file.is_file(),entry['url']
  with Image.open(file) as image:
   image.verify()
  digest=hashlib.sha256(file.read_bytes()).hexdigest()
  sources=[source for source in project.get('media_sources',[]) if source['file']==file.name]
  assert sources and sources[0]['sha256']==digest,file.name
  assets.append({'project':project['slug'],'file':entry['url'],'sha256':digest})
 assert (root/'public'/project['content']['artwork'].lstrip('/')).is_file()
result={'projects':len(catalog),'galleryAssets':len(assets),'projectsWithScreenshots':sum(bool(p['content'].get('gallery')) for p in catalog),'artworkOnly':[p['title'] for p in catalog if not p['content'].get('gallery')],'passed':True,'assets':assets}
(root/'verification/media-integrity.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k!='assets'}))
