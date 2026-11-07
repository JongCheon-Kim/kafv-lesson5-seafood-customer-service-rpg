/* KAFV Lesson 5 RPG v1.0.6 | approved isolated fishing vessel, harbor visual actions,
 * original upbeat BGM and event-driven effects. Previous source and education assets preserved.
 * The six harbor work steps advance on completed on-screen animations, never by timers alone.
 */
(()=>{'use strict';
const Game=window.KAFV_MarketRPG;
if(!Game)throw Error('KAFV v1.0.5 foundation not loaded');
const P=Game.prototype;
const old={renderShell:P.renderShell,goHarbor:P.goHarbor,renderMarket:P.renderMarket,
 enterStore:P.enterStore,openProduct:P.openProduct,walkTo:P.walkTo,placeScale:P.placeScale,
 storeItem:P.storeItem,retrieveItem:P.retrieveItem,toggleCold:P.toggleCold,
 intoCart:P.intoCart,showPackingPanel:P.showPackingPanel,
 showCheckout:P.showCheckout,showReceipt:P.showReceipt,
 action:P.action,setAudio:P.setAudio,startMusic:P.startMusic,stopMusic:P.stopMusic,
 musicTest:P.musicTest,playNote:P.playNote,destroy:P.destroy};
const names=['어선 입항','접안·계류','어획상자 하역','카트 운반','검수·기록','시설 입고'];
const notes=[
 '어선이 항만 안쪽으로 천천히 들어옵니다.',
 '접안 위치를 확인하고 계류줄을 연결합니다.',
 '선상 어획상자를 들어 올려 부두 하역 구역에 내려놓습니다.',
 '카트에 어획상자를 싣고 검수대까지 운반합니다.',
 '검수인이 수량과 로트 표시를 대조하고 검수표를 확인합니다.',
 '검수된 상자를 보관시설에 넣고 입고를 완료합니다.'
];
const symbols=['🚢','⚓','📦','🛒','📋','🏭'];
const assets='game-art/';
const safe=a=>String(a).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function setSoundButtons(g){
 const bgm=g.app?.querySelector('[data-ui="bgm"]');
 if(bgm){bgm.textContent=g.soundOn?'♫ 활기찬 음악 끄기':'♫ 활기찬 음악 켜기';bgm.setAttribute('aria-pressed',String(!!g.soundOn));}
 const sfx=g.app?.querySelector('[data-ui="sfx"]');
 if(sfx){sfx.textContent=g.sfxOn===false?'🔇 효과음 켜기':'🔊 효과음 끄기';sfx.setAttribute('aria-pressed',String(g.sfxOn!==false));}
 const ext=document.querySelector('#sim-audio-toggle');
 if(ext)ext.textContent=g.soundOn?'♫ 배경음악 끄기':'♫ 배경음악 켜기';
}
function fx(g,id){
 if(g.sfxOn===false||document.hidden)return;
 const file=assets+'sfx_'+id+'.wav';
 try{
  g._v106fx=g._v106fx||{};
  let a=g._v106fx[id];if(!a){a=new Audio(file);a.preload='auto';g._v106fx[id]=a;}
  // Clone a short clip to preserve fast consecutive interactions without truncating.
  const now=a.paused?a:a.cloneNode(true);now.volume=Math.max(0,Math.min(.46,(g.volume||.32)*.65));
  const p=now.play();p?.catch?.(()=>{});
 }catch(_){/* Audio must never block the game. */}
}
P.playFx=function(name){fx(this,name)};
P.renderShell=function(){old.renderShell.call(this);
 this.sfxOn=true;
 const actions=this.app?.querySelector('.gv-actions');
 if(actions&&!actions.querySelector('[data-ui="sfx"]')){
  const s=document.createElement('button');s.type='button';s.dataset.ui='sfx';s.className='gv-sfx-button';s.setAttribute('aria-pressed','true');
  actions.insertBefore(s,actions.querySelector('[data-ui="bgm"]')?.nextSibling||actions.firstChild);
  s.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();this.sfxOn=!this.sfxOn;setSoundButtons(this);if(this.sfxOn)fx(this,'select')},true);
 }
 setSoundButtons(this);
 // Browsers block sound before the first gesture. Begin music when the learner
 // first interacts with the game; never re-enable it after an explicit toggle.
 this.app?.addEventListener('pointerdown',e=>{
  if(this._v106musicGesture||e.target.closest('[data-ui="bgm"],[data-ui="sfx"]'))return;
  this._v106musicGesture=true;
  if(!this.soundOn)this.setAudio(true,this.volume||.3);
 },true);
};
P.setAudio=function(on,vol){
 // The previous ambient loop and oscillator BGM are explicitly stopped.
 old.stopMusic.call(this);this._v104audio?.pause();
 this.soundOn=!!on;this.volume=Math.max(0,Math.min(1,Number(vol??this.volume??.34)));
 if(this.soundOn)this._v106musicGesture=true;
 if(this.soundOn)this.startMusic();else this.stopMusic();
 setSoundButtons(this);
};
P.startMusic=function(){
 if(!this.soundOn||document.hidden)return;
 try{
  if(!this._v106bgm){this._v106bgm=new Audio(assets+'kafv_upbeat_original.mp3');this._v106bgm.loop=true;this._v106bgm.preload='auto';}
  this._v106bgm.volume=Math.max(0,Math.min(.34,this.volume*.50));
  if(this._v106bgm.paused){const p=this._v106bgm.play();p?.catch?.(()=>{this.soundOn=false;setSoundButtons(this);this.note?.('음악 버튼을 다시 누르면 재생됩니다.');});}
 }catch(err){this.soundOn=false;setSoundButtons(this)}
};
P.stopMusic=function(){this._v106bgm?.pause();old.stopMusic.call(this)};
P.musicTest=function(){this.soundOn=true;this.startMusic();fx(this,'select');setSoundButtons(this)};
P.playNote=function(key){fx(this,{stamp:'stamp',select:'select',move:'walk',checkout:'checkout',scale:'scale',pack:'pack'}[key]||'select')};
P.destroy=function(){this._v106bgm?.pause();this._v106bgm=null;
 if(this._v106timer)clearTimeout(this._v106timer);
 old.destroy.call(this);
};
P.goHarbor=function(){
 this.moveToken++;this.scene='harbor';this.harborStep=0;this._v106busy=false;
 if(this._v106timer)clearTimeout(this._v106timer);
 this.flags=new Set();
 const buttons=names.map((t,i)=>`<button type="button" class="gv106-step" data-hstep="${i}" data-stage="${i}" aria-label="${safe(t)} 수행" ${i>0?'disabled':''}><span class="gv106-icon">${symbols[i]}</span><b>${i+1}. ${safe(t)}</b></button>`).join('');
 this.world.innerHTML=`<section class="gv106-harbor" aria-label="항구 입항·접안·하역 실습">
   <div class="gv106-sea" aria-hidden="true"></div><div class="gv106-wake" aria-hidden="true"></div>
   <div class="gv106-top"><div><h2>⚓ 장목항 · 입항과 하역</h2><p>어선·접안지점·어획상자·카트·검수대·입고시설을 순서대로 직접 클릭하세요.</p></div>
     <button type="button" class="gv106-reset" data-reset>↻ 하역 다시하기</button></div>
   <button class="gv106-vessel" data-hstep="0" type="button" title="어선을 클릭하여 입항" aria-label="어선 클릭: 입항 시작">
     <img src="${assets}kafv_fishing_boat_approved.webp" alt="갑판 크레인과 어구가 있는 연안 어선" draggable="false">
     <span class="gv106-vesselname">① 어선 클릭 · 입항</span>
   </button>
   <div class="gv106-rope" aria-hidden="true"></div>
   <button type="button" data-hstep="1" class="gv106-dock gv106-object" title="접안 후 클릭" disabled>⚓ 접안·계류 확인</button>
   <div class="gv106-lift" id="gv106-cargo-motion" aria-hidden="true"><span class="gv106-hook"></span><div class="gv106-liftbox"><i></i><i></i><i></i><small>LOT-26-011</small></div></div>
   <button type="button" data-hstep="2" class="gv106-unload gv106-object" title="어획상자를 하역합니다" disabled>📦 어획상자 하역</button>
   <div class="gv106-cartSprite" aria-hidden="true"><div class="gv106-cargoStack"><i></i><i></i></div><span class="gv106-cartDeck"></span><span class="gv106-wheel a"></span><span class="gv106-wheel b"></span></div>
   <button type="button" data-hstep="3" class="gv106-cartBtn gv106-object" disabled>🛒 카트로 운반</button>
   <div class="gv106-worker" aria-hidden="true">🦺</div>
   <div class="gv106-inspectionBooth" aria-hidden="true"><span>검수대</span><div class="gv106-record">□ 수량&nbsp;&nbsp;□ 로트<br>□ 상태&nbsp;&nbsp;□ 기록</div></div>
   <button type="button" data-hstep="4" class="gv106-inspect gv106-object" disabled>📋 검수·기록 확인</button>
   <div class="gv106-storage" aria-hidden="true"><span>입고 창고</span><div class="gv106-storageDoor"></div><div class="gv106-storedBoxes"><i></i><i></i><i></i></div></div>
   <button type="button" data-hstep="5" class="gv106-warehouseBtn gv106-object" disabled>🏭 시설 입고</button>
   <div class="gv106-transportCrate" aria-hidden="true">어획물 로트</div>
   <div class="gv106-dockline" aria-hidden="true"></div>
   <div class="gv106-bottom"><div class="gv106-progressLabel" id="gv106-progress">0 / 6 · 입항 대기</div><div class="gv106-stagebar" id="gv106-stagebar">${buttons}</div>
     <div class="gv106-stageinfo" id="gv106-stageinfo" role="status" aria-live="polite">먼저 바다 위 어선을 클릭하세요. 다음 단계는 실제 동작이 끝난 뒤 열립니다.</div></div>
 </section>`;
 this.world.querySelectorAll('[data-hstep]').forEach(b=>b.addEventListener('click',()=>this.harborAction(Number(b.dataset.hstep))));
 this.world.querySelector('[data-reset]').onclick=()=>this.goHarbor();
 this.mapArea();this.updateHud();
 const host=this.world.querySelector('.gv106-harbor');host.dataset.stage='0';
 setSoundButtons(this);
};
P.harborAction=function(i){
 if(this.scene!=='harbor')return;
 if(this._v106busy){this.note('현재 작업 동작이 끝난 뒤 다음 단계를 선택하세요.');return;}
 if(i!==this.harborStep){this.note(`현재는 ${this.harborStep+1}단계 · ${names[this.harborStep]||'완료'}를 수행해야 합니다.`);return;}
 const h=this.world.querySelector('.gv106-harbor');if(!h)return;
 this._v106busy=true;
 h.dataset.animating=String(i+1);
 h.querySelectorAll(`[data-hstep="${i}"]`).forEach(el=>el.disabled=true);
 const effects=['harbor','open','unload','cart','stamp','close'];
 fx(this,effects[i]);
 const progress=h.querySelector('#gv106-progress'),info=h.querySelector('#gv106-stageinfo');
 if(info)info.textContent='진행 중 · '+notes[i];
 if(progress)progress.textContent=`${i+1}/6 · ${names[i]} 실행 중`;
 const times=[2200,950,1700,1750,1000,1450];
 this._v106timer=setTimeout(()=>{
  if(this.scene!=='harbor'||!h.isConnected)return;
  this.harborStep=i+1;h.dataset.stage=String(this.harborStep);h.dataset.animating='0';this._v106busy=false;
  h.querySelectorAll(`[data-hstep="${i}"]`).forEach(el=>{el.classList.add('done');el.disabled=true;});
  h.querySelectorAll(`[data-hstep="${i+1}"]`).forEach(el=>el.disabled=false);
  const stages=h.querySelectorAll('.gv106-step');stages.forEach((b,j)=>{b.classList.toggle('done',j<this.harborStep);b.classList.toggle('current',j===this.harborStep)});
  if(info)info.textContent=notes[i]+(i===5?' 모든 하역 작업이 완료되었습니다.':' 다음 작업을 직접 선택하세요.');
  if(progress)progress.textContent=`${this.harborStep}/6 · ${i===5?'시설 입고 완료':names[i]+' 완료'}`;
  if(i===5){fx(this,'stamp');this.completeHarborCargo?.();}
  this.updateHud();this.note(`${names[i]} 완료 (${this.harborStep}/6)`);
 },times[i]);
};
// Preserve v1.0.5's full fish/gear shop logic while giving sound to each visible interaction.
P.walkTo=function(...args){if(this.scene==='store'&&!this._v106busy)fx(this,'walk');return old.walkTo.apply(this,args)};
P.openProduct=function(...args){const v=old.openProduct.apply(this,args);fx(this,'select');return v};
P.placeScale=function(...args){const v=old.placeScale.apply(this,args);fx(this,'scale');return v};
P.storeItem=function(...args){const type=args[0],before=this[type]?.items?.length||0;
 const v=old.storeItem.apply(this,args);if((this[type]?.items?.length||0)>before)fx(this,'open');return v};
P.retrieveItem=function(...args){const type=args[0],before=this[type]?.items?.length||0;
 const v=old.retrieveItem.apply(this,args);if((this[type]?.items?.length||0)<before)fx(this,'close');return v};
if(old.toggleCold)P.toggleCold=function(...args){const v=old.toggleCold.apply(this,args);fx(this,this[args[0]]?.door?'open':'close');return v};
P.intoCart=function(...args){const v=old.intoCart.apply(this,args);fx(this,'select');return v};
P.showPackingPanel=function(...args){const v=old.showPackingPanel.apply(this,args);fx(this,'pack');return v};
P.showCheckout=function(...args){const v=old.showCheckout.apply(this,args);fx(this,'checkout');return v};
P.showReceipt=function(...args){const v=old.showReceipt.apply(this,args);fx(this,'stamp');return v};
// Traceable audio state stays separate from the music toggle.
window.KAFV_RPG_V106={version:'1.0.6',source:'user uploaded v1.0.5',scope:'approved harbor art + six visual cargo actions + original BGM and effects',audio:'original synthesized 126 BPM',status:'test candidate - not MASTER/LOCK'};
})();
