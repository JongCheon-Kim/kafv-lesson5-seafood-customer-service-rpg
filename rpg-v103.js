/* KAFV RPG v1.0.3 | independent output panel, stable rAF character movement,
   object-aware dialogue, feedback ledger and visible storage/harbor actions.
   Based on v1.0.2. All lesson source data is kept unchanged. */
(()=>{'use strict';
const Game=window.KAFV_MarketRPG;
if(!Game)throw Error('v1.0.2 foundation missing');
const P=Game.prototype;
const old={renderShell:P.renderShell,enterStore:P.enterStore,walkTo:P.walkTo,speak:P.speak,
 updateHud:P.updateHud,updateStockUI:P.updateStockUI,showCheckout:P.showCheckout,showReceipt:P.showReceipt,
 placeScale:P.placeScale,storeItem:P.storeItem,retrieveItem:P.retrieveItem,intoCart:P.intoCart,
 goHarbor:P.goHarbor,harborAction:P.harborAction,returnMarket:P.returnMarket,renderMarket:P.renderMarket,
 action:P.action,openProduct:P.openProduct,stepAction:P.stepAction,mark:P.mark};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n||0).toLocaleString('ko-KR');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const modeLabel={store:'점포 실습',market:'시장 탐색',harbor:'항구 하역'};
const phaseLabels=['입장·인사','상품 탐색','정보 확인','계량·중량','보관·품질','거래·포장','마무리'];
function output(g){
 const sim=document.querySelector('#simulator-screen'),grid=sim?.querySelector('.sim-grid');
 if(!grid)return;
 grid._gvGame=g;let aside=grid.querySelector('#gv-output-report');
 if(!aside){aside=document.createElement('aside');aside.id='gv-output-report';aside.className='gv-output-report';
  aside.innerHTML=`<header><b>▥ 결과 · 기록 창</b><small>교육용 가상 실습</small></header>
  <div class="gv-output-content"><div class="gv-report-status" id="gv-out-stage">시장 탐색</div>
   <div class="gv-report-row"><span>선택 상품</span><strong id="gv-out-product">—</strong></div>
   <div class="gv-report-row"><span>계량 중량</span><strong id="gv-out-weight">0.00 kg</strong></div>
   <div class="gv-report-row"><span>냉장 · 냉동</span><strong id="gv-out-cold">0 · 0건</strong></div>
   <div class="gv-report-row"><span>장바구니</span><strong id="gv-out-cart">0건</strong></div>
   <div class="gv-report-row"><span>계산 금액</span><strong id="gv-out-total">0원</strong></div>
   <div class="gv-report-row"><span>영수증</span><strong id="gv-out-receipt">미발행</strong></div>
   <div class="gv-report-head">현장 행동 기록</div><ol class="gv-report-log" id="gv-out-log"></ol>
   <button type="button" class="gv-output-action" id="gv-out-checkout">계산대로 이동</button>
   <button type="button" class="gv-output-action ghost" id="gv-out-trace">상품 이력 확인</button>
   <p class="gv-output-warning">모든 제품·가격·생산·유통 이력은 교육용 가상값입니다.</p>
  </div>`;
  grid.append(aside);
  aside.querySelector('#gv-out-checkout').addEventListener('click',()=>{const live=grid._gvGame;if(!live)return;if(live.scene!=='store'){live.note('점포에 입장한 후 사용할 수 있습니다.');return}live.action('checkout')});
  aside.querySelector('#gv-out-trace').addEventListener('click',()=>{const live=grid._gvGame;if(!live)return;if(live.scene!=='store'){live.note('점포에 입장한 후 사용할 수 있습니다.');return}live.world.querySelector('.gv-traceboard')?.click()});
 }
 g.outputPanel=aside;
 updateOutput(g);
}
function updateOutput(g,event){
 if(!g.outputPanel||!g.outputPanel.isConnected)return;
 const a=g.outputPanel.querySelector.bind(g.outputPanel);
 const cart=Array.isArray(g.cart)?g.cart:[];
 const total=cart.reduce((s,p)=>s+Number(p.price||0)*(p.unit==='kg'?Number(p.weight||0):1),0);
 const p=g.currentProduct||g.selected||g.holding||g.scaleItem||null;
 const vals={
 'stage':g.scene==='harbor'?`항구 작업 ${g.harborStep}/6단계`:(modeLabel[g.scene]||'시장 탐색')+(g.scene==='store'?` · ${g.store()?.n||''}`:''),
 'product':p?.name||'—','weight':g.scaleItem?Number(g.scaleItem.weight).toFixed(2)+' kg':'0.00 kg',
 'cold':`${g.cold?.items?.length||0} · ${g.freezer?.items?.length||0}건`,
 'cart':`${cart.length}건`,'total':money(cart.length?total:(g.lastReceipt?.total||0))+'원',
 'receipt':g.lastReceipt?.ticket||'미발행'};
 for(const [k,v] of Object.entries(vals)){const el=a('#gv-out-'+k);if(el)el.textContent=v}
 if(event){g._actionLog=g._actionLog||[];if(g._actionLog[g._actionLog.length-1]!==event)g._actionLog.push(event);g._actionLog=g._actionLog.slice(-6)}
 a('#gv-out-log').innerHTML=(g._actionLog||['점포에 입장하면 실습 내용이 기록됩니다.']).slice().reverse().map(x=>`<li>${esc(x)}</li>`).join('');
 a('#gv-out-checkout').disabled=g.scene!=='store';a('#gv-out-trace').disabled=g.scene!=='store';
}
function locateBubbles(g){
 if(g.scene!=='store')return;
 const W=1672;
 for(const el of [g.qEl,g.aEl]){
  if(!el||el.hidden)continue;
  const actor=el.closest('.gv-actor');if(!actor)continue;
  const actorX=parseFloat(actor.style.left)||0,aw=actor.offsetWidth||125,bw=el.offsetWidth||170;
  const center=clamp(actorX,bw/2+20,W-bw/2-20);
  el.style.left=(aw/2 + center-actorX)+'px';
 }
 const q=g.qEl,a=g.aEl;
 if(q&&!q.hidden&&a&&!a.hidden){
   // Distinguish the speaker even when the two characters stand side-by-side.
   const c=g.customerPos?.x||0,s=g.sellerPos?.x||0;
   a.style.marginBottom=Math.abs(c-s)<235?'30px':'0';
 }
}
function animateActors(g,target){
 const dest={
  product0:[453,739,673,710],product1:[490,739,697,710],product2:[536,739,730,710],
  scale:[626,738,762,713],cold:[977,740,843,729],freezer:[1094,740,973,729],
  checkout:[1421,743,1572,721],packing:[1211,743,1364,725],person:[555,739,729,709],door:[235,741,379,716]
 }[target]||[555,739,729,709];
 if(g.scene!=='store')return Promise.resolve();
 if(g._actorMove){g._actorMove.cancelled=true;g._actorMove.finish?.();}
 const fromC={...g.customerPos},fromS={...g.sellerPos};
 const length=Math.max(Math.hypot(dest[0]-fromC.x,dest[1]-fromC.y),Math.hypot(dest[2]-fromS.x,dest[3]-fromS.y));
 const duration=clamp(length*1.25,400,950);
 let resolveFn;const done=new Promise(r=>resolveFn=r);
 const job={cancelled:false,finish:resolveFn};g._actorMove=job;
 const stepTime=performance.now();
 const look=(el,startX,endX)=>{if(!el)return;el.dataset.facing=endX<startX?'left':'right';};
 look(g.customerEl,fromC.x,dest[0]);look(g.sellerEl,fromS.x,dest[2]);
 for(const el of [g.customerEl,g.sellerEl]){el?.classList.add('gv-in-motion');el?.classList.remove('gesturing')}
 const tick=(time)=>{
  if(job.cancelled||g.scene!=='store'){resolveFn();return}
  const t=clamp((time-stepTime)/duration,0,1),v=t*t*(3-2*t);
  g.customerPos={x:fromC.x+(dest[0]-fromC.x)*v,y:fromC.y+(dest[1]-fromC.y)*v};
  g.sellerPos={x:fromS.x+(dest[2]-fromS.x)*v,y:fromS.y+(dest[3]-fromS.y)*v};
  g.placeActors();locateBubbles(g);
  if(t<1){requestAnimationFrame(tick);return}
  g.customerEl?.classList.remove('gv-in-motion');g.sellerEl?.classList.remove('gv-in-motion');
  g.customerEl.dataset.facing=g.customerPos.x<g.sellerPos.x?'right':'left';
  g.sellerEl.dataset.facing=g.sellerPos.x<g.customerPos.x?'right':'left';
  locateBubbles(g);resolveFn();
 };
 requestAnimationFrame(tick);
 return done;
}
P.renderShell=function(){old.renderShell.call(this);output(this);
  // Fullscreen must preserve the control pane and the output report, not just the game viewport.
  this.app.addEventListener('click',ev=>{
    const control=ev.target.closest('[data-ui="fullscreen"]');if(!control)return;
    ev.preventDefault();ev.stopImmediatePropagation();
    const grid=document.querySelector('#simulator-screen .sim-grid');
    if(document.fullscreenElement){document.exitFullscreen?.();return;}
    if(grid?.requestFullscreen)grid.requestFullscreen().catch(()=>this.note('전체화면 전환을 허용해 주세요.'));
  },true);
};
P.enterStore=function(i=0){old.enterStore.call(this,i);this._actionLog=['점포 입장 · '+this.store().n];
  // Keep the character's motion layer independent from the static shop background.
  this.customerEl.dataset.facing='right';this.sellerEl.dataset.facing='left';updateOutput(this);
};
P.walkTo=function(target){return animateActors(this,target)};
P.speak=async function(...args){await old.speak.apply(this,args);locateBubbles(this)};
P.openProduct=function(index,page=0){old.openProduct.call(this,index,page);updateOutput(this,`${this.stock[index]?.name||'상품'} 탐색`)};
P.action=function(action){old.action.call(this,action);updateOutput(this,({scale:'저울 확인',cold:'냉장고 확인',freezer:'냉동고 확인',packing:'포장대 확인',checkout:'계산대 확인'}[action]||null))};
P.updateHud=function(){old.updateHud.call(this);updateOutput(this)};
P.updateStockUI=function(){old.updateStockUI.call(this);updateOutput(this)};
P.placeScale=function(p){old.placeScale.call(this,p);updateOutput(this,p?.name?'계량 · '+p.name:null)};
P.intoCart=function(){old.intoCart.call(this);updateOutput(this,'계량상품 장바구니 등록')};
P.storeItem=function(type){const n=this[type]?.items?.length||0;old.storeItem.call(this,type);updateOutput(this,this[type]?.items?.length>n?`${type==='cold'?'냉장':'냉동'} 입고 완료`:null)};
P.retrieveItem=function(type,index){const n=this[type]?.items?.length||0;old.retrieveItem.call(this,type,index);updateOutput(this,this[type]?.items?.length<n?`${type==='cold'?'냉장':'냉동'} 출고 완료`:null)};
P.showCheckout=function(){old.showCheckout.call(this);updateOutput(this)};
P.showReceipt=function(){old.showReceipt.call(this);updateOutput(this,'가상 영수증 발급')};
P.goHarbor=function(){old.goHarbor.call(this);updateOutput(this,'항구 도착 · 직접조작 대기')};
P.harborAction=function(index){const before=this.harborStep;old.harborAction.call(this,index);
 if(this.scene!=='harbor'||before===this.harborStep)return;
 const harbor=this.world.querySelector('.gv-harbor-bg');
 if(harbor){harbor.dataset.step=String(this.harborStep);let activity=harbor.querySelector('.gv-harbor-action');
  if(!activity){activity=document.createElement('div');activity.className='gv-harbor-action';harbor.append(activity)}
  const text=['어선 입항 중','계류줄 연결','상자 하역','카트 운반 중','검수 진행','입고 완료'][index]||'현장 작업';
  activity.textContent='● '+text;
  activity.classList.remove('active');void activity.offsetWidth;activity.classList.add('active');
 }
 updateOutput(this,['어선 입항','접안 확인','어획상자 하역','카트 운반','로트 검수','시설 입고'][index]);
};
P.renderMarket=function(){old.renderMarket.call(this);updateOutput(this)};
P.returnMarket=function(){old.returnMarket.call(this);updateOutput(this,'시장으로 복귀')};
P.stepAction=function(step){old.stepAction.call(this,step);updateOutput(this,`단계 선택 · ${phaseLabels[step]||('하역 '+(step+1))}`)};
window.KAFV_RPG_V103={version:'1.0.3',status:'수정 시범본 / 사용자 PASS 보류',layout:'3-pane responsive',singlePlay:true,source:'v1.0.2 maintained'};
})();
