from pathlib import Path
from PIL import Image, ImageOps
import json,re
root=Path(__file__).resolve().parents[1]
source=root.parent
settings=[
 ('0', 'taiwan-autumn', '台北 · 台南 · 高雄','城市漫步','TAIWAN','a6b8cd6e39c61bf4999919a4903a46d.jpg','又见台北，不同的季节，不同的温度。'),
 ('1','taipei','台北 · 七星山','山海之间','TAIPEI','ff37423abab217a7bf204e0cc3d072e.jpg','城市与自然，新与旧，在台北如此自然而有趣地呈现在我面前。'),
 ('2','guangzhou','广州','城市漫步','GUANGZHOU','273ba287d642ab2c4f861cbaaa9aa60.jpg','人的生死悲欢，就在这同时发生着。'),
 ('3','europe','巴黎 · 图恩 · 昂蒂布 · 罗马','远行','EUROPE','WhatsApp Image 2026-11-26 at 8.24.26 PM.jpeg','闭上眼，是天空的淡蓝色，蓝宝石一样的深蓝色，绚丽的橙色是晚霞的映照。'),
 ('4','gansu','兰州 · 敦煌','山海之间','GANSU','6f5f7c63b1f091746dc29a1b9d46327.jpg','大漠孤烟，长河落日！'),
 ('5','zhejiang','杭州 · 金华 · 东阳 · 义乌','城市漫步','ZHEJIANG','0f40e8369be8eb91994bbfecfe7189c.jpg','不要被条条框框束缚，让自己和思绪自由伸展吧！'),
 ('北上','nanchang','南昌','城市漫步','NANCHANG','a2972cfd72a459183790613b2cabb17.jpg','一切都很新鲜！'),
 ('福州','fujian','福州 · 平潭','山海之间','FUJIAN','94c051692dde834231d29f85e240fe5.jpg','风慢慢吹。'),
 ('济州','jeju','济州岛 · 牛岛','山海之间','JEJU','181833c9a6a1324c3bc67a4b2ca0f79.jpg','看照片的时候，再体味，感觉真是美妙的景色！'),
 ('越南','vietnam','河内 · 沙坝 · 下龙湾','远行','VIETNAM','75078b80624ce0cb5bb6777a511d851.jpg','在沙坝进行了两天的小徒步，从县城出发，穿过了六个山村。')]
entries=[]
for prefix,slug,place,category,english,cover,excerpt in settings:
 folder=next(p for p in source.iterdir() if p.is_dir() and p.name.startswith(prefix))
 text=next(folder.glob('*.txt')).read_text(encoding='utf-8-sig').strip()
 title,body=text.split('\n',1)
 photos=[]
 target=root/'content'/slug
 target.mkdir(parents=True,exist_ok=True)
 (target/'journal.txt').write_text(text,encoding='utf-8')
 for i,p in enumerate(sorted(p for p in folder.iterdir() if p.suffix.lower() in ('.jpg','.jpeg','.png','.webp'))):
  filename=f'{slug}/{i+1:02}.webp'
  im=ImageOps.exif_transpose(Image.open(p)).convert('RGB')
  im.thumbnail((1800,1800))
  im.save(root/'content'/filename,'WEBP',quality=87,exif=b'')
  photos.append({'file':filename,'width':im.width,'height':im.height,'original':p.name})
 rank=int(prefix) if prefix.isdigit() else None
 entries.append({'slug':slug,'title':title.strip(),'place':place,'category':category,'english':english,'rank':rank,'excerpt':excerpt,'cover':next((x['file'] for x in photos if x['original']==cover),None),'photos':photos})
(root/'content'/'journals.json').write_text(json.dumps(entries,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Imported {len(entries)} journals and {sum(len(x["photos"]) for x in entries)} photographs; originals unchanged.')

