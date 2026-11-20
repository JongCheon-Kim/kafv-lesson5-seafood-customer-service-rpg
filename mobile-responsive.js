/* KAFV lesson 5 mobile-only optional RPG zoom. Leaves game and mission JS unchanged. */
(()=>{'use strict';
 const scene=document.getElementById('sim-scene');if(!scene)return;
 let button=null,app=null;
 function update(){
   if(!button||!app)return;
   if(window.matchMedia('(min-width:701px)').matches){app.classList.remove('gv-mobile-zoom');}
   const zoom=app.classList.contains('gv-mobile-zoom');
   button.textContent=zoom?'↙ 전체 보기':'🔍 확대 탐색';
   button.setAttribute('aria-pressed',String(zoom));
   button.title=zoom?'수산시장 전체 장면으로 돌아가기':'게임 장면을 확대하여 좌우로 탐색하기';
 }
 function attach(){
   const nextApp=scene.querySelector('.gv-app');
   const bar=nextApp?.querySelector('.gv-actions');
   if(!bar)return;
   if(nextApp===app&&button?.isConnected)return;
   app=nextApp;
   button=document.createElement('button');
   button.type='button';button.className='gv-mobile-view-toggle';
   button.setAttribute('aria-label','모바일 RPG 화면 확대 및 전체 보기 전환');
   button.addEventListener('click',()=>{
     if(window.matchMedia('(min-width:701px)').matches)return;
     const zoom=!app.classList.contains('gv-mobile-zoom');
     app.classList.toggle('gv-mobile-zoom',zoom);
     if(!zoom)app.querySelector('.gv-viewport')?.scrollTo({left:0,behavior:'instant'});
     update();
   });
   bar.appendChild(button);update();
 }
 const obs=new MutationObserver(attach);
 obs.observe(scene,{childList:true,subtree:true});
 window.addEventListener('resize',update,{passive:true});
 attach();
})();
