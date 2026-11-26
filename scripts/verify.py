from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re
from PIL import Image
root=Path(__file__).resolve().parents[1]
entries=json.loads((root/'content/journals.json').read_text(encoding='utf-8-sig'))
class Audit(HTMLParser):
 def __init__(self):
  super().__init__();self.article=False;self.p=False;self.prose=[];self.refs=[];self.h1=0;self.photos=[];self.has_gallery=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='article' and a.get('class')=='article-body': self.article=True
  if tag=='p' and self.article:self.p=True;self.prose.append('')
  if tag=='h1':self.h1+=1
  if 'data-photo' in a:self.photos.append(a['data-photo'])
  if 'gallery' in a.get('class','').split():self.has_gallery=True
  for key in ('src','href'):
   if key in a:self.refs.append(a[key])
 def handle_endtag(self,tag):
  if tag=='article':self.article=False
  if tag=='p':self.p=False
 def handle_data(self,data):
  if self.p:self.prose[-1]+=data
for j in entries:
 text=(root/'content'/j['slug']/'journal.txt').read_text(encoding='utf-8-sig')
 expected=text.split('\n',1)[1].strip()
 file=root/'dist/journals'/f'{j["slug"]}.html'
 a=Audit();a.feed(file.read_text(encoding='utf-8'))
 assert re.sub(r'\s','',expected)==re.sub(r'\s','',''.join(a.prose)),f'Body mismatch: {j["slug"]}'
 assert not a.has_gallery,f'Unexpected standalone gallery: {j["slug"]}'
 assert sorted(a.photos)==sorted('../assets/'+p['file'] for p in j['photos']),f'Photos missing or duplicated: {j["slug"]}'
 for photo in j['photos']:
  im=Image.open(root/'dist/assets'/photo['file']);assert not im.getexif(),photo['file']
for file in (root/'dist').rglob('*.html'):
 a=Audit();a.feed(file.read_text(encoding='utf-8'));assert a.h1==1,str(file)
 for ref in a.refs:
  parts=urlsplit(ref)
  if parts.scheme or parts.netloc or not parts.path:continue
  target=(file.parent/unquote(parts.path)).resolve()
  assert target.is_file(),f'Broken local reference: {file.name}: {ref}'
assert len(entries)==10
assert sum(len(j['photos']) for j in entries)==55
assert [j['rank'] for j in entries]==[0,1,2,3,4,5,None,None,None,None]
print('PASS: 10 unabridged journal texts; 55 metadata-free images; all local page/asset links; rank ordering; one H1 per page; all photos appear exactly once inline; no standalone galleries.')

