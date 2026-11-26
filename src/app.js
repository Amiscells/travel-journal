(() => {
 const root=document.documentElement;
 const seasonButton=document.querySelector('.season');
 function setSeason(season){root.dataset.season=season;const summer=season==='summer';seasonButton.textContent=summer?'❄️':'☀️';seasonButton.setAttribute('aria-label',summer?'切换到冬季粉色':'切换到夏季墨绿色');seasonButton.title=summer?'切换到冬季粉色':'切换到夏季墨绿色';document.querySelector('meta[name="theme-color"]').content=summer?'#153f35':'#f6eaf3';}
 setSeason(root.dataset.season||'winter');
 seasonButton.addEventListener('click',()=>{const s=root.dataset.season==='summer'?'winter':'summer';setSeason(s);try{localStorage.setItem('journal-season',s);}catch{}});
 const search=document.querySelector('#journal-search');
 let category='全部';
 const cards=[...document.querySelectorAll('.card')];
 const empty=document.querySelector('.empty');
 const resultCount=document.querySelector('#result-count');
 function filter(){const query=(search?.value||'').trim().toLocaleLowerCase();let count=0;for(const card of cards){const match=(category==='全部'||card.dataset.category===category)&&card.dataset.search.includes(query);card.hidden=!match;if(match)count++;}if(empty)empty.hidden=count!==0;if(resultCount)resultCount.textContent=String(count).padStart(2,'0')+' 篇游记';}
 document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{category=button.textContent;document.querySelectorAll('.filter').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filter();}));
 search?.addEventListener('input',filter);
 const progress=document.querySelector('.progress');
 if(progress){const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%';};addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();}
 const dialog=document.querySelector('.lightbox');
 if(dialog){const photos=[...document.querySelectorAll('[data-photo]')];const unique=[...new Map(photos.map(p=>[p.dataset.photo,p])).values()];let current=0;const picture=dialog.querySelector('img');const caption=dialog.querySelector('.lightbox-caption');function show(i){current=(i+unique.length)%unique.length;picture.src=unique[current].dataset.photo;picture.alt=unique[current].querySelector('img').alt;caption.textContent=`${current+1} / ${unique.length} · ${picture.alt}`;}for(const button of photos)button.addEventListener('click',()=>{show(unique.findIndex(p=>p.dataset.photo===button.dataset.photo));dialog.showModal();});dialog.querySelector('.lightbox-close').addEventListener('click',()=>dialog.close());dialog.querySelector('.lightbox-next').addEventListener('click',()=>show(current+1));dialog.querySelector('.lightbox-prev').addEventListener('click',()=>show(current-1));dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();show(current+1);}if(e.key==='ArrowLeft'){e.preventDefault();show(current-1);}});}
})();
