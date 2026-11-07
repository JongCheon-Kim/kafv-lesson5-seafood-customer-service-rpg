/* KAFV v1.0.1 additive functional patch.
   Keep v1.0.0 source unchanged; extend game engine with bottom step controls,
   contextual/visible-prop hotspots, contextual fictional traceability,
   reliable checkout calculation and compact head-tracking speech bubbles.
*/
(()=>{'use strict';
const Game=window.KAFV_MarketRPG;
if(!Game){throw new Error('KAFV v1.0.0 game engine was not loaded');}
const P=Game.prototype;
const save={renderShell:P.renderShell,enterStore:P.enterStore,resetShopState:P.resetShopState,updateHud:P.updateHud,showCheckout:P.showCheckout,showReceipt:P.showReceipt,showScalePanel:P.showScalePanel,intoCart:P.intoCart,harborAction:P.harborAction,renderMarket:P.renderMarket};
const phases=['enter','inspect','info','weigh','store','checkout','finish'];
const names=['입장·인사','상품 탐색','정보 확인','계량 안내','보관·품질','거래·포장','마무리'];
const harborNames=['어선 입항','접안·계류','어획상자 하역','카트 운반','검수·기록','시설 입고'];
const safe=(x)=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const won=n=>Math.round(n||0).toLocaleString('ko-KR');
const money=p=>Math.round((p.price||0)*(p.unit==='kg'?(p.weight||0):1));
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const srcOrigins=['경남 거제','전남 완도','전남 고흥','경남 통영','부산 기장'];
const stepUI=(g)=>{const isHarbor=g.scene==='harbor',ids=isHarbor?harborNames:names;const ix=isHarbor?g.harborStep:phases.filter(k=>g.flags.has(k)).length;
 return ids.map((label,i)=>`<button type="button" class="gv-step ${isHarbor?(i<ix?'done':''):(g.flags.has(phases[i])?'done':'')} ${i===Math.min(ids.length-1,ix)?'now':''}" data-gv-step="${i}" title="${safe(label)} 단계 실행" aria-label="${safe(label)} 실행"><span>${isHarbor?(i<ix?'✓':i+1):(g.flags.has(phases[i])?'✓':i+1)}</span><b>${safe(label)}</b></button>`).join('');};
function injectClickableBackdrop(g){if(g.scene!=='store'||!g.world.querySelector('.gv-shop-bg'))return;
  // These are invisible hit areas aligned to visual assets; they never block product UI buttons.
  const positions=[
    ['exit','시장으로 나가는 유리 출입문',57,286,159,361],
    ['product0','첫 번째 진열 수산물',110,389,126,112],
    ['product1','두 번째 진열 수산물',251,389,126,112],
    ['product2','세 번째 진열 수산물',380,389,126,112],
    ['scale','전자저울의 계량 접시',685,414,209,108],
    ['cold','배경 냉장고 전면',913,359,140,275],
    ['freezer','배경 냉동고 전면',1068,359,140,275],
    ['packing','배경 포장·손질대',1191,510,183,107],
    ['checkout','배경 결제 단말기',1406,443,211,174]
  ];
  const layer=document.createElement('div');layer.className='gv-backdrop-hits';layer.setAttribute('aria-label','점포 안의 실제 설비 클릭 영역');
  layer.innerHTML=positions.map(([id,title,x,y,w,h])=>`<button type="button" class="gv-backdrop-hit" data-backdrop="${id}" aria-label="${title}" title="${title}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;"></button>`).join('');
  g.world.append(layer);
  layer.addEventListener('click',e=>{const hit=e.target.closest('[data-backdrop]');if(!hit)return;const id=hit.dataset.backdrop;if(id.startsWith('product'))g.openProduct(+id.slice(-1));else g.action(id);});
}
function fakeTrace(g){g.stock.forEach((p,i)=>{
  const org=srcOrigins[(g.storeIndex+i)%srcOrigins.length];
  p.origin=org; p.producer=`${org.split(' ').slice(-1)[0]} 가상생산조합`;
  p.processor=`KAFV 가상 수산가공센터 ${((g.storeIndex+i)%3)+1}호`;
  p.arrival='2026-11-07';p.lot=`SIM-26${String(g.storeIndex+1).padStart(2,'0')}-${String(i+1).padStart(3,'0')}`;
  p.temperature=/냉동/.test(p.name)?'-18℃ 이하 (예시)':/미역|다시마|톳|멸치/.test(p.name)?'건조·서늘한 곳 (예시)':'0~5℃ (예시)';
  p.kind=/미역|다시마|톳|멸치/.test(p.name)?'건조 수산물(가상)':/냉동/.test(p.name)?'냉동 수산물(가상)':'수산물(가상)';
  p.expiry='2027-05-07 (교육용)';
 });}
P.resetShopState=function(){save.resetShopState.call(this);fakeTrace(this);this.activeStep=0;this.lastReceipt=null;};
P.renderShell=function(){save.renderShell.call(this);this.app.addEventListener('click',e=>{
  const button=e.target.closest('button[data-gv-step]');if(!button)return;
  this.stepAction(Number(button.dataset.gvStep));
 });};
P.enterStore=function(i=0){save.enterStore.call(this,i);injectClickableBackdrop(this);};
P.updateHud=function(){save.updateHud.call(this);if(!this.app)return;
 const step=this.app.querySelector('#gv-steps');if(step)step.innerHTML=stepUI(this);
 if(this.scene==='harbor'){
  this.app.querySelector('#gv-progresslabel').textContent=`${this.harborStep} / 6 단계`;
  this.app.querySelector('#gv-barfill').style.width=`${this.harborStep/6*100}%`;
 }
};
P.harborAction=function(i){const last=this.harborStep;save.harborAction.call(this,i);if(this.harborStep!==last)this.updateHud();};
P.stepAction=function(step){
 if(this.scene==='harbor'){
  if(step<this.harborStep){this.note(`${harborNames[step]}은 이미 완료했습니다.`);return;}
  this.harborAction(step);return;
 }
 if(this.scene==='market'){
  if(step===0){this.walkIntoShop(this.storeIndex||0);return;}
  this.note('먼저 시장에서 원하는 점포 출입문을 선택하세요.');return;
 }
 if(this.scene!=='store')return;
 this.activeStep=step;
 if(step===0){this.speak('person');return;}
 const p=this.currentProduct||this.stock.find(s=>s.qty>0)||this.stock[0];
 if(step===1){this.openProduct(Math.max(0,this.stock.indexOf(p)),0);return;}
 if(step===2){this.openProduct(Math.max(0,this.stock.indexOf(p)),1);this.mark('info');return;}
 if(step===3){
   if(!this.scaleItem&&!this.holding){if(!p||p.qty<1){this.note('진열 재고가 없습니다.');return;}
    this.currentProduct=p;this.choose(p);
   }
   if(this.holding)this.placeScale(this.holding);
   this.speak('scale',this.scaleItem);this.showScalePanel();return;
 }
 if(step===4){this.speak('cold',this.holding||this.scaleItem||p);if(!this.cold.door)this.toggleCold('cold');else this.showColdPanel('cold');this.mark('store');return;}
 if(step===5){this.action('checkout');return;}
 if(step===6){if(this.lastReceipt){this.showReceipt();return;}if(this.cart.length||this.holding||this.scaleItem){this.note('선택·계량된 상품이 있습니다. 계산과 거래조건을 확인해 주세요.');this.action('checkout');return;}this.mark('finish');this.speak('door');this.note('구경만 하신 경우에도 문을 통해 자유롭게 퇴장할 수 있습니다.');return;}
};
P.drawProductPanel=(function(orig){return function(p,page){orig.call(this,p,page);const box=this.world?.querySelector('#gv-detail');if(!box)return;
 const cells=box.querySelectorAll('.gv-panellines > div');const tab=page%4;
 if(tab===1){const values=[p.origin,p.producer+' / '+p.processor,p.arrival+' / '+p.lot,'가상 입고대장·표시정보 일치'];cells.forEach((r,i)=>{const b=r.querySelector('b');if(b)b.textContent=values[i]||'';});}
 if(tab===2){const values=[p.kind,p.temperature,p.temperature,p.expiry];cells.forEach((r,i)=>{const b=r.querySelector('b');if(b)b.textContent=values[i]||'';});}
 };})(P.drawProductPanel);
P.speak=async function(target,p,page=0){
 const token=++this.moveToken;if(!this.qEl||!this.aEl)return;
 this.qEl.hidden=true;this.aEl.hidden=true;
 await this.walkTo(target);if(token!==this.moveToken||this.scene!=='store')return;
 const obj=p||this.currentProduct||this.selected;
 let question='',answer='';const n=obj?.name||'상품';
 if(target.startsWith('product')&&obj){
  const qs=[`이 ${n}은 얼마예요?`,`이 ${n}은 어디서 생산했나요?`,`보관과 품질 관리는 어떻게 하나요?`,`이 ${n}을 고르면 어떻게 진행되나요?`];
  const as=[`${n}은 ${won(obj.price)}원/${obj.unit}입니다. 포장 중량은 ${Math.round(obj.weight*1000)}g입니다.`,
  `가상 원산지는 ${obj.origin||'자료없음'}이고, 로트는 ${obj.lot||'미입력'}입니다. 생산자와 입고기록도 확인해 드릴게요.`,
  `품목별 보관조건은 ${obj.temperature||'가상 등록정보'}입니다. 이 게임에서는 입고이력과 품질 점검을 연습합니다.`,
  `선택하신 뒤 저울에서 중량과 가격을 확인하고, 포장 또는 계산대로 이동할 수 있습니다.`];question=qs[page%4];answer=as[page%4];
 }else if(target==='scale'){
  if(this.scaleItem){question=`지금 저울에 올린 ${this.scaleItem.name}의 금액은 얼마예요?`;answer=`현재 계량은 ${this.scaleItem.weight.toFixed(2)}kg이고 예상금액은 ${won(money(this.scaleItem))}원입니다.`;}
  else if(this.holding){question=`고른 ${this.holding.name}은 여기서 계량하나요?`;answer='네. 저울에 올려 중량을 확인하면 정확한 금액이 계산됩니다.';}
  else{question='이 저울은 어떻게 사용하나요?';answer='상품을 선택하면 여기에서 중량과 단가를 확인합니다.';}
 }else if(target==='cold'||target==='freezer'){
  const st=this[target];question=`이 ${target==='cold'?'냉장':'냉동'} 보관고에는 어떤 수산물이 있나요?`;
  answer=`현재 ${st?.items?.length||0}건이 저장되어 있습니다. 문을 열면 상품을 넣고 꺼낼 수 있고 입출고 기록이 갱신됩니다.`;
 }else if(target==='checkout'){
  const total=this.cart.reduce((s,p)=>s+money(p),0);
  question='제가 고른 상품은 얼마인가요?';answer=this.cart.length?`장바구니 ${this.cart.length}건, 가상 합계는 ${won(total)}원입니다. 거래를 확정하면 영수증이 발행됩니다.`:this.scaleItem?'저울에 계량한 상품을 장바구니로 옮기면 금액을 계산할 수 있습니다.':'상품을 고르고 계량하면 여기서 총액과 거래조건을 확인합니다.';
 }else if(target==='packing'){question='손질과 포장은 어떻게 해 주시나요?';answer='선택하신 상품의 상태와 수량, 고객 요청에 맞는 포장방식을 설명하겠습니다.';
 }else if(target==='door'){question='다른 가게도 방문할 수 있나요?';answer='네. 시장 통로를 통해 다른 점포도 살펴보실 수 있습니다.';
 }else {question=this.mission?.lead||'어떤 상품부터 살펴보면 좋을까요?';answer=this.mission?.steps?.[0]?.ok||'원하시는 요리와 인원수, 예산을 알려주시면 비교해 드리겠습니다.';}
 this.qEl.textContent=question;this.qEl.hidden=false;this.sellerEl?.classList.add('gesturing');
 await delay(700);if(token!==this.moveToken||this.scene!=='store')return;
 this.aEl.textContent=answer;this.aEl.hidden=false;this.sellerEl?.classList.remove('gesturing');
 if(target!=='person'&&target!=='door')this.mark('inspect');
};
P.showScalePanel=(function(orig){return function(){orig.call(this);const box=this.world?.querySelector('#gv-detail');if(!box)return;
 const rows=box.querySelectorAll('.gv-panellines > div');if(this.scaleItem&&rows.length>0){let label=rows[0].querySelector('b');if(label)label.textContent=this.scaleItem.unit==='봉'?(this.scaleItem.weight*1000).toFixed(0)+' g':this.scaleItem.weight.toFixed(2)+' kg';}
 };})(P.showScalePanel);
P.showCheckout=function(){
 const pending=this.scaleItem||this.holding||null;
 const total=this.cart.reduce((s,p)=>s+money(p),0);
 const products=this.cart.map(p=>`${p.name}(${p.unit==='봉'?Math.round(p.weight*1000)+'g':p.weight.toFixed(2)+'kg'})`).join(' · ');
 const rows=[['장바구니',products||'비어 있음'],['계량 완료 상품',this.scaleItem?this.scaleItem.name+' '+this.scaleItem.weight.toFixed(2)+'kg': '없음'],['미계량 선택 상품',this.holding?.name||'없음'],['장바구니 상품 수',this.cart.length+'건'],['상품 합계',won(total)+'원 (교육용)'],['거래 상태',this.cart.length?'금액 확인 후 확정 가능':'상품을 먼저 계량·담기']];
 const actions=[];
 if(pending){actions.push({text:this.holding?'① 선택상품 계량 후 담기':'① 계량상품 장바구니 담기',primary:true,fn:()=>{
   if(this.holding)this.placeScale(this.holding);
   if(this.scaleItem)this.cart.push({...this.scaleItem});this.scaleItem=null;this.holding=null;this.selected=null;
   this.updateStockUI();this.showCheckout();this.note('계량 상품을 장바구니에 담았습니다. 금액을 확인하고 거래를 확정하세요.');
 }});}
 actions.push({text:'✓ 금액 확인·가상 거래 확정',primary:!pending,fn:()=>{
  if(!this.cart.length){this.note('장바구니가 비어 있습니다. 상품을 선택하고 계량하세요.');return;}
  const t=this.cart.reduce((s,p)=>s+money(p),0);
  const issued={items:this.cart.map(p=>({...p})),total:t,date:'2026-11-07 (가상)',ticket:'SIM-RCPT-'+String(this.tradeCount+1).padStart(4,'0')};
  try{this.handlers.onTrade?.({items:issued.items.map(p=>({name:p.name,qty:p.weight})),total:t});}catch(e){this.note('교육 이력 연결은 실패했으나 게임 내 가상 거래는 저장됩니다.');}
  this.lastReceipt=issued;this.cart=[];this.tradeCount++;this.mark('checkout');this.updateStockUI();this.showReceipt();
 }});
 actions.push({text:'상품 계속 살펴보기',fn:()=>this.world.querySelector('#gv-detail').hidden=true});
 this.showSmall('▣ 계산대 · 금액 계산',rows,actions);
};
P.showReceipt=function(){if(!this.lastReceipt){this.note('아직 확정된 가상 거래가 없습니다.');this.showCheckout();return;}
 const receipt=this.lastReceipt;const rows=[['영수증번호',receipt.ticket||'SIM-RCPT'],['상품',receipt.items.map(p=>`${p.name} × ${p.unit==='봉'?'1봉':p.weight.toFixed(2)+'kg'}`).join(' / ')],['계산금액',won(receipt.total)+'원'],['상품건수',receipt.items.length+'건'],['거래방식','교육용 가상 거래 · 실제 결제 없음']];
 this.showSmall('🧾 가상 거래 영수증',rows,[{text:'✓ 거래 마무리',primary:true,fn:()=>{this.mark('finish');this.world.querySelector('#gv-detail').hidden=true;this.note('계산·거래·마무리를 완료했습니다.');}},{text:'시장으로 나가기',fn:()=>this.returnMarket()}]);
};
window.KAFV_RPG_V101={version:'1.0.1',scope:'계산대 계산/영수증·하단 단계클릭·배경 객체 핫스팟·작은 말풍선·교육용 가상 이력',status:'검증 전 시범본',basedOn:'v1.0.0'};
})();
