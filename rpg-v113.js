/* KAFV v1.0.13 — 33/34/35 live exercise buttons and event-accurate clean SFX.
   Isolated additive patch: preserve 35 lecture cuts, all gameplay and logistics.
   Do not auto-play sound: each effect respects the existing SFX toggle.
*/
(()=>{'use strict';
const app=window.KAFV_APP,sim=window.KAFV_SIM;
const P=window.KAFV_MarketRPG?.prototype;
if(!app||!sim||!P||!window.KAFV_RPG_V112)throw Error('v1.0.12 base required');
const oldSlide=sim.onSlide,oldOpenFromSlide=sim.openFromSlide;
const practiceNames={33:'판매응대 연습서',34:'민원 대응서',35:'서비스 개선계획서'};
function syncExerciseButton(n){
 const btn=document.getElementById('lecture-sim-link');
 const note=document.getElementById('no-practice-note');
 if(!btn||!note)return false;
 const num=Number(n);
 if(!Object.hasOwn(practiceNames,num))return false;
 btn.hidden=false;
 btn.textContent='📝 이 이미지 실습하기 ▶';
 btn.setAttribute('aria-label',`${num}컷 ${practiceNames[num]} 열기`);
 btn.title=`${num}컷 ${practiceNames[num]}를 작성·저장합니다`;
 btn.onclick=()=>app.openPractice(num);
 note.hidden=true;
 return true;
}
sim.onSlide=function(num){
 if(syncExerciseButton(num))return;
 const btn=document.getElementById('lecture-sim-link');
 if(btn){btn.textContent='🎮 이 이미지 실습하기 ▶';btn.removeAttribute('title');btn.removeAttribute('aria-label');}
 return oldSlide.call(this,num);
};
sim.openFromSlide=function(num){
 const n=Number(num);
 if(Object.hasOwn(practiceNames,n))return app.openPractice(n);
 return oldOpenFromSlide.call(this,num);
};
// app.js initially chooses the saved slide before simulator.js has loaded.
// Re-synchronize on refresh, not only after the next manual page change.
sim.onSlide(app.getSlideNum());
// All sound for weigh and packing-panel opening remains linked to existing v1.0.6.
// Only the new completion cues are added here. Checkout completion is NOT a
// click on the cash desk: it is a successful issued receipt with real cart state.
const oldReceipt=P.showReceipt;
P.showReceipt=function(...args){
 const before=this.lastReceipt;
 const alreadyNotified=this._v113LastReceiptNotified===before;
 const result=oldReceipt.apply(this,args);
 if(before && !alreadyNotified && (before.items?.length||0)>0 && Number.isFinite(before.total)){
  this._v113LastReceiptNotified=before;
  this.playFx?.('sale');
 }
 return result;
};
// A packing acknowledgement is different from simply opening the packing desk.
const oldPacking=P.showPackingPanel;
P.showPackingPanel=function(...args){
 const result=oldPacking.apply(this,args);
 const panel=this.world?.querySelector('#gv-detail');
 const ack=Array.from(panel?.querySelectorAll('button')||[]).find(b=>b.textContent.trim()==='포장방법 안내 확인');
 if(ack){ack.addEventListener('click',()=>{
  if(this.scaleItem||this.holding||this.cart?.length)this.playFx?.('pack_done');
 },{once:true});}
 return result;
};
window.KAFV_RPG_V113={version:'1.0.13',baseline:'1.0.12',practiceCuts:[33,34,35],effects:['scale','pack','pack_done','checkout','sale'],masterLock:false};
})();
