import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
const entries=JSON.parse((await fs.readFile(path.join(root,'content/journals.json'),'utf8')).replace(/^\uFEFF/,''));
entries.sort((a,b)=>(a.rank??Infinity)-(b.rank??Infinity));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
await fs.mkdir(path.join(out,'assets'),{recursive:true});
for(const f of ['style.css','app.js']) await fs.copyFile(path.join(root,'src',f),path.join(out,'assets',f));
const cssVersion=createHash('sha256').update(await fs.readFile(path.join(root,'src/style.css'))).digest('hex').slice(0,12);
const jsVersion=createHash('sha256').update(await fs.readFile(path.join(root,'src/app.js'))).digest('hex').slice(0,12);
for(const j of entries){const text=await fs.readFile(path.join(root,'content',j.slug,'journal.txt'),'utf8');j.body=text.replace(/^\uFEFF/,'').replace(/^[^\n]*\n/,'').trim();j.paragraphs=j.body.split(/\r?\n\s*\r?\n/).filter(Boolean);j.reading=Math.max(1,Math.ceil(j.body.length/400));for(const photo of j.photos){await fs.mkdir(path.dirname(path.join(out,'assets',photo.file)),{recursive:true});await fs.copyFile(path.join(root,'content',photo.file),path.join(out,'assets',photo.file));}}
function header(base,home=false){return `<a class="skip" href="#main">跳到正文</a><header class="wrap">${home?'<h1>':''}<a class="brand" href="${base}index.html">子钰流水账</a>${home?'</h1>':''}<nav aria-label="主导航">${home?'':`<a href="${base}index.html">全部游记</a>`}<button class="season" type="button" aria-label="切换到夏季墨绿色" title="切换到夏季">☀️</button></nav></header>`;}
function footer(){return '<footer class="wrap">子钰流水账</footer>';}
function page(title,description,body,base=''){return `<!doctype html><html lang="zh-CN" data-season="winter"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f6eaf3"><meta name="description" content="${esc(description)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="${base?'article':'website'}"><title>${esc(title)}</title><link rel="icon" href="${base}assets/favicon.svg?v=2" type="image/svg+xml"><script>try{const s=localStorage.getItem('journal-season');if(s==='summer'||s==='winter')document.documentElement.dataset.season=s;}catch{}</script><link rel="stylesheet" href="${base}assets/style.css?v=${cssVersion}"><script src="${base}assets/app.js?v=${jsVersion}" defer></script></head><body>${body}</body></html>`;}
// for(const j of entries){if(!j.homeQuote||!j.body.includes(j.homeQuote))throw new Error(`Homepage sentence must be an exact quotation: ${j.slug}`);}
const homeIntro=(await fs.readFile(path.join(root,'content/home-intro.txt'),'utf8')).trim();
const cards=entries.map(j=>`<article class="card" data-search="${esc((j.title+' '+j.place+' '+j.english+' '+j.body).toLocaleLowerCase())}"><a href="journals/${j.slug}.html"><div class="card-image">${j.cover?`<img src="assets/${j.cover}" alt="${esc(j.title)}的照片" loading="lazy" decoding="async">`:''}</div><div class="card-copy"><h2>${esc(j.title)}</h2><p class="card-quote">${esc(j.homeQuote)}</p></div></a></article>`).join('');
const home=`${header('',true)}<main id="main" class="wrap"><div class="home-intro"><p>${esc(homeIntro)}</p></div><section class="archive" id="journals" aria-label="全部游记"><div class="tools"><span id="result-count" role="status" aria-live="polite">${entries.length} 篇游记</span><label class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input id="journal-search" type="search" placeholder="搜索游记" aria-label="搜索游记全文"></label></div><div class="grid">${cards}</div><p class="empty" hidden>没有找到匹配的游记。</p></section></main>${footer()}`;
await fs.writeFile(path.join(out,'index.html'),page('子钰流水账','子钰流水账',home));
await fs.mkdir(path.join(out,'journals'),{recursive:true});
function photoButton(j,p,index){return `<button type="button" class="photo-button" data-photo-number="${index+1}" data-photo="../assets/${p.file}" aria-label="放大照片 ${index+1}"><img src="../assets/${p.file}" alt="${esc(j.title)} · 照片 ${index+1}" width="${p.width}" height="${p.height}" loading="lazy" decoding="async"></button>`;}
for(const [index,j] of entries.entries()){
 const media=spec=>{
  const images=spec.photos.map(n=>{const photo=j.photos[n-1];if(!photo)throw new Error(`Missing photo ${j.slug}/${n}`);return photoButton(j,photo,n-1);}).join('');
  return `<figure class="media media--${spec.layout||'right'}${spec.photos.length>1?' media--group':''}">${images}</figure>`;
 };
 const placed=[];
 const prose=j.paragraphs.map((text,i)=>{
  const events=(j.photoLayout||[]).filter(x=>x.paragraph===i+1).map(spec=>{
   const offset=spec.end?text.length:spec.anchor?text.indexOf(spec.anchor):0;
   if(offset<0)throw new Error(`Photo anchor not found: ${j.slug}: ${spec.anchor}`);
   return {spec,offset};
  }).sort((a,b)=>a.offset-b.offset);
  let html='',cursor=0;
  for(const {spec,offset} of events){if(offset>cursor)html+=`<p>${esc(text.slice(cursor,offset))}</p>`;html+=media(spec);placed.push(...spec.photos);cursor=offset;}
  if(cursor<text.length)html+=`<p>${esc(text.slice(cursor))}</p>`;
  return `<div class="passage">${html}</div>`;
 }).join('');
 if(placed.length!==j.photos.length||new Set(placed).size!==j.photos.length)throw new Error(`Every photo must appear exactly once: ${j.slug}`);
 const prev=entries[index-1],next=entries[index+1];
 const article=`<div class="progress" aria-hidden="true"></div>${header('../')}<main id="main" class="wrap"><a class="back" href="../index.html">← 全部游记</a><div class="article-heading"><h1>${esc(j.title)}</h1><div class="reading">约 ${j.reading} 分钟 · ${j.photos.length} 张照片</div></div><article class="article-body" aria-label="${esc(j.title)}正文">${prose}</article><nav class="article-nav" aria-label="继续阅读">${prev?`<a href="${prev.slug}.html"><small>← 上一篇</small><span>${esc(prev.title)}</span></a>`:'<span></span>'}${next?`<a href="${next.slug}.html"><small>下一篇 →</small><span>${esc(next.title)}</span></a>`:'<a href="../index.html"><small>全部游记 →</small></a>'}</nav></main>${footer()}<a class="to-top" href="#main" aria-label="回到文章顶部">↑</a>${j.photos.length?`<dialog class="lightbox" aria-label="照片查看器"><button type="button" class="lightbox-close" aria-label="关闭照片">×</button><button type="button" class="lightbox-prev" aria-label="上一张照片">‹</button><img src="../assets/${j.photos[0].file}" alt="照片"><div class="lightbox-caption" aria-live="polite"></div><button type="button" class="lightbox-next" aria-label="下一张照片">›</button></dialog>`:''}`;
 await fs.writeFile(path.join(out,'journals',j.slug+'.html'),page(j.title+' · 子钰流水账',j.title,article,'../'));
}
await fs.writeFile(path.join(out,'assets','favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="16" fill="#f6eaf3"/><text x="40" y="56" font-size="48" font-family="sans-serif" text-anchor="middle" fill="#493b45">钰</text></svg>');
await fs.writeFile(path.join(out,'.nojekyll'),'');
await fs.writeFile(path.join(out,'404.html'),page('页面不存在 · 子钰流水账','子钰流水账',`${header('')}<main id="main" class="wrap error"><h1>页面不存在</h1><a href="index.html">返回首页</a></main>${footer()}`));
console.log(`Built ${entries.length} complete journals, ${entries.reduce((n,j)=>n+j.photos.length,0)} photos, homepage and 404 page.`);
