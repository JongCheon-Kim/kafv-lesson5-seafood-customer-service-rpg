/* KAFV 제5차시 수산컴플렉스 RPG v1.0.0
   User-approved illustration-based environment; authored isolated DOM interaction engine.
   The price/species/stock quantities are DEMONSTRATION only. Real origin/lot never invented.
   Preserves the original 35 lecture images and 7-room/24-mission/48-action curriculum.
*/
(()=>{'use strict';
const BASE=window.KAFV_MarketRPG,RAW=window.KAFV_RPG_STORES||[],D=window.KAFV_SIM_DATA||{rooms:[],missions:[]};
const esc=(x)=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const comma=n=>Math.round(n).toLocaleString('ko-KR');
const storeToRoom={receiving:0,lab:2,cold:8,display:3,dispatch:12,outdoor:10,office:14};
const samples={
 '미역':[3500,.25,'봉'],'다시마':[4500,.3,'봉'],'톳':[3800,.2,'봉'],'멸치':[6000,.25,'봉'],
 '광어':[18000,1.3,'kg'],'우럭':[15500,1.1,'kg'],'참돔':[19000,1.5,'kg'],
 '고등어':[8500,1,'kg'],'갈치':[17000,1.1,'kg'],'삼치':[12500,1.2,'kg'],
 '굴':[9000,.5,'kg'],'바지락':[6000,.5,'kg'],'가리비':[11000,.5,'kg'],
 '전복':[26000,.5,'kg'],'낙지':[22000,.5,'kg'],'문어':[19000,1,'kg'],
 '꽃게':[18000,1,'kg'],'새우':[15000,.5,'kg'],'대게':[42000,1,'kg']
};
function item(name,i){const v=samples[name]||[6500+i*2500,.5,'kg'];return {id:name+'-'+i,name,price:v[0],weight:v[1],unit:v[2],origin:null,lot:null,kind:'교육용 예시',qty:5-i};}
const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
function button(txt,attr='',c=''){return `<button type="button" ${attr} class="${c}">${txt}</button>`}
const labels=['입장·인사','상품 탐색','정보 확인','계량 안내','보관·품질','거래·포장','마무리'];
function sellRole(s){return s?.role==='소매상'?'소매인':s?.role==='선구점 상인'?'판매자':'중도매인'}
function sayFor(g,area,p,page){const a=p||g.currentProduct;let name=a?.name||'수산물';const seller=sellRole(g.store());const unit=a?.unit||'kg';let q='',ans='';
 if(area==='product'){
  const qa=[
   [`이 ${name}은 얼마예요?`,`${name}의 교육용 표시가격은 ${comma(a.price)}원/${unit}입니다. ${unit==='봉'?'포장 중량은 '+(a.weight*1000)+'g입니다.':'중량에 따라 금액이 달라집니다.'}`],
   [`${name}의 품질은 어떻게 확인하나요?`,'상품 상태와 표시사항, 입고·보관기록을 확인해 설명하겠습니다. 겉모습만으로 안전을 보장하지는 않습니다.'],
   [`이 ${name}은 어디서 생산했나요?`,'원산지와 생산·유통이력은 실제 상품 표시와 로트 기록을 확인해야 합니다. 여기에는 확인된 실제 기록이 없습니다.'],
   [`${name}을 어떻게 활용하면 좋나요?`,'요리 목적과 인원수, 손질 여부를 알려주시면 확인된 범위에서 활용 방법을 안내하겠습니다.']
  ];[q,ans]=qa[page%4];
 }else if(area==='scale'){
  [q,ans]=a?[`고른 ${name}의 무게는 이 저울에서 재나요?`,'네. 수산물을 올려 중량과 단가를 확인한 뒤 금액을 안내합니다. 지금은 교육용 계량 예시입니다.']:[`이 저울은 무엇을 하는 건가요?`,'상품을 선택하시면 이곳에서 중량을 확인합니다. 구매하지 않으셔도 저울의 사용법을 구경할 수 있습니다.'];
 }else if(area==='cold'||area==='freezer'){
  [q,ans]=a?[`제가 고른 ${name}은 여기 보관하나요?`,'상품의 냉장·냉동 적합성과 표기된 보관조건을 먼저 확인해야 합니다. 문을 열어 입출고 상태를 보시겠어요?']:[`냉장고에는 어떤 상품들이 들어 있나요?`,'문을 열고 현재 보관 중인 상품을 확인해 보겠습니다. 온도·보관기준은 실제 시설기록과 제품 표시를 확인해야 합니다.'];
 }else if(area==='checkout'){
  [q,ans]=g.cart.length?['제가 고른 상품의 총액이 얼마인가요?','품목·수량·중량·포장비와 배송비를 구분해 확인하겠습니다. 이 거래는 가상 결제입니다.']:['여기서 결제하나요?','네. 상품을 선택하시면 중량과 단가, 포장·결제조건을 확인한 뒤 결제합니다. 먼저 둘러보셔도 됩니다.'];
 }else if(area==='packing'){
  [q,ans]=['손질과 포장은 어떻게 해 주시나요?','상품 상태와 고객 요청을 확인하여 가능한 손질·포장 방법과 추가 비용 여부를 안내하겠습니다.'];
 }else if(area==='person'){
  [q,ans]=g.mission?[g.mission.lead,g.mission.steps[0]?.ok||'필요한 정보를 먼저 확인하겠습니다.']:['어떤 생선부터 살펴보면 좋을까요?','어떤 요리로 드실지, 몇 분이 드시는지 알려주시면 적절한 상품을 비교해 드리겠습니다.'];
 }else if(area==='door'){
  [q,ans]=['다른 점포도 구경할 수 있나요?','물론입니다. 시장 통로로 나가시면 다른 수산물 전문점도 방문하실 수 있습니다.'];
 }else{[q,ans]=['이것은 어떤 시설인가요?','이곳에서 상품과 거래조건을 확인하실 수 있습니다.'];}
 return {q,ans,seller};}
class ImmersiveRPG{
 constructor(root,rooms,missions,handlers){
  this.root=root;this.rooms=rooms;this.missions=missions;this.handlers=handlers||{};this.scene='market';this.storeIndex=0;this.room='receiving';this.mission=null;this.selected=null;this.currentProduct=null;this.holding=null;this.scaleItem=null;this.cart=[];this.cold={door:false,items:[]};this.freezer={door:false,items:[]};this.stock=[];this.messages=[];this.flags=new Set();this.page=0;this.panel='';this.progress=0;this.moveToken=0;this.soundOn=false;this.volume=.25;this.audio=null;this.musicTimer=null;this.noteStep=0;this.vis=()=>{if(document.hidden)this.stopMusic();else if(this.soundOn)this.startMusic()};document.addEventListener('visibilitychange',this.vis);this.harborStep=0;this.shipX=130;this.harborItems=0;this.tradeCount=0;this.drag=null;this.activeRole='손님';this.sellerPos={x:788,y:562};this.customerPos={x:525,y:752};
  this.firstRoomCall=true;this.dragBound=false;this.renderShell();this.renderMarket();this.bindGlobal();this.updateHud();
  this.setMode('off');
 }
 store(){return RAW[this.storeIndex]||{n:'수산물 점포',kind:'활어',role:'중도매인',fish:['광어','우럭','참돔']}}
 resetShopState(){this.selected=null;this.currentProduct=null;this.holding=null;this.scaleItem=null;this.cart=[];this.cold={door:false,items:[]};this.freezer={door:false,items:[]};this.stock=(this.store().fish||['광어','우럭','참돔']).slice(0,3).map(item);this.page=0;this.panel='';this.flags=new Set();this.updateHud()}
 renderShell(){
  this.root.classList.add('gv-root');this.root.innerHTML=`<section class="gv-app" aria-label="KAFV 수산시장 체험형 RPG">
    <header class="gv-topbar"><div class="gv-brand"><span class="gv-logo">🐟</span><div><b>KAFV 수산시장 경영 RPG</b><small>제5차시 · 고객응대와 판매서비스 · 교육용 가상시장</small></div></div>
    <div class="gv-pagetitle"><span id="gv-area">전체 시장</span><span class="gv-breadcrumb" id="gv-where">15개 가상 점포</span></div>
    <div class="gv-actions"><button type="button" data-ui="fullscreen">⛶ 전체화면</button><button type="button" data-ui="missions" title="7개 공간·24개 교육미션">☷ 학습미션</button><button type="button" data-ui="harbor">⚓ 항구·하역</button><button type="button" data-ui="market">↶ 시장</button><button type="button" data-ui="help">ⓘ 도움말</button></div></header>
    <main class="gv-viewport"><div class="gv-world" id="gv-world"></div><div class="gv-toast" id="gv-toast" role="status" aria-live="polite"></div></main>
    <footer class="gv-bottom"><div class="gv-missionname"><b id="gv-missionhead">시장 자유탐색</b><small id="gv-hint">점포 입구를 선택하세요</small></div><div class="gv-steps" id="gv-steps"></div><div class="gv-percent"><strong id="gv-progresslabel">0 / 7</strong><div class="gv-bar"><span id="gv-barfill"></span></div></div></footer>
    <div class="gv-disclaimer">※ 본 게임의 점포·가격·중량·상품 이력·거래는 교육용 시뮬레이션입니다. 실제 거래나 품질·안전판정이 아닙니다.</div></section>`;
  this.app=this.root.querySelector('.gv-app');this.world=this.root.querySelector('#gv-world');this.viewport=this.root.querySelector('.gv-viewport');this.toastEl=this.root.querySelector('#gv-toast');
  this.resize=()=>{const w=this.viewport.clientWidth;this.world.style.transform=`scale(${w/1672})`;this.viewport.style.height=`${w/1672*800}px`};
  this.ro=new ResizeObserver(this.resize);this.ro.observe(this.viewport);document.addEventListener('fullscreenchange',this.resize);requestAnimationFrame(this.resize);
  this.app.addEventListener('click',e=>{const b=e.target.closest('[data-ui]');if(!b)return;const act=b.dataset.ui;if(act==='fullscreen'){if(!document.fullscreenElement)this.app.requestFullscreen?.().catch(()=>this.note('브라우저에서 전체화면을 허용해 주세요.'));else document.exitFullscreen?.();}if(act==='market')this.returnMarket();if(act==='harbor')this.goHarbor();if(act==='missions'){const panel=document.querySelector('#simulator-screen');panel?.classList.toggle('gv-drawer-open');b.setAttribute('aria-expanded',String(!!panel?.classList.contains('gv-drawer-open')))}if(act==='help')this.help()});
 }
 updateHud(){if(!this.app)return;const map=['enter','inspect','info','weigh','store','checkout','finish'];
  this.progress=map.filter(k=>this.flags.has(k)).length;const stepEl=this.app.querySelector('#gv-steps');stepEl.innerHTML=labels.map((s,i)=>`<div class="gv-step ${this.flags.has(map[i])?'done':''} ${i===Math.min(6,this.progress)?'now':''}"><span>${this.flags.has(map[i])?'✓':i+1}</span><b>${s}</b></div>`).join('');
  this.app.querySelector('#gv-progresslabel').textContent=`${this.progress} / 7 단계`;
  this.app.querySelector('#gv-barfill').style.width=(this.progress/7*100)+'%';
  this.app.querySelector('#gv-missionhead').textContent=this.mission?`${this.mission.id} · ${this.mission.title}`:this.scene==='market'?'시장 자유탐색':this.scene==='harbor'?'항구 하역 직접 실습':'고객 요구 파악과 맞춤 응대';
  const hints={market:'점포 출입문을 클릭하면 손님이 이동해 입장합니다.',store:'상품·사람·저울·보관고를 클릭해 보세요.',harbor:'어선→접안→상자→카트→검수→입고를 실제로 선택하세요.'};
  this.app.querySelector('#gv-hint').textContent=hints[this.scene]||'';
 }
 mark(k){if(!this.flags.has(k)){this.flags.add(k);this.updateHud();this.note('행동 완료 · '+(labels[['enter','inspect','info','weigh','store','checkout','finish'].indexOf(k)]||k))}}
 note(text){this.toastEl.textContent=text;this.toastEl.classList.add('shown');clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>this.toastEl?.classList.remove('shown'),3300)}
 mapArea(){this.app.querySelector('#gv-area').textContent=this.scene==='harbor'?'항구·하역 현장':this.scene==='market'?'수산컴플렉스 시장':this.store().n;this.app.querySelector('#gv-where').textContent=this.scene==='store'?`${this.store().kind} 전문점 · ${sellRole(this.store())}`:this.scene==='harbor'?'6단계 직접 조작':'상단 8점포 · 하단 7점포 · 중앙 통로'}
 renderMarket(){this.moveToken++;this.scene='market';this.world.innerHTML=`<div class="gv-market-bg"><div class="gv-market-hdr"><b>장목수산컴플렉스 · 교육용 가상시장</b><small>가로형 시장 · 위쪽 8개 점포 / 아래쪽 7개 점포</small></div><div class="gv-market-grid gv-market-upper">${RAW.slice(0,8).map((s,i)=>this.shopCard(s,i)).join('')}</div><div class="gv-market-aisle"><span class="gv-walkstripe"></span><div class="gv-aisle-copy">🚶 중앙 고객 통로 · 원하는 점포의 출입문을 누르세요</div><img src="game-art/customer.png" class="gv-tinyshopper" alt="이동하는 손님"><button type="button" class="gv-harborlink" data-harbor>⚓ 항구 하역장 연결 →</button><span class="gv-walkstripe"></span></div><div class="gv-market-grid gv-market-lower">${RAW.slice(8,15).map((s,i)=>this.shopCard(s,i+8)).join('')}</div></div>`;
  this.world.querySelectorAll('[data-shop]').forEach(btn=>btn.addEventListener('click',()=>this.walkIntoShop(+btn.dataset.shop)));
  this.world.querySelector('[data-harbor]').onclick=()=>this.goHarbor();
  this.mapArea();this.updateHud();
 }
 shopCard(s,i){return `<article class="gv-shopcard" style="--shop-tint:${s.main||'#2a697b'}"><div class="gv-shopphoto ${/(활어|선어|생선류|제철어류)/.test(s.kind)?'fish':/(패류|갑각류|낙지|해산물)/.test(s.kind)?'shell':''}"></div><div class="gv-shopcap"><b>${String(i+1).padStart(2,'0')} · ${esc(s.n)}</b><small>${esc(s.fish.slice(0,2).join(' · '))}</small></div><button type="button" data-shop="${i}" class="gv-shopdoor" aria-label="${esc(s.n)} 점포에 들어가기"><span class="gv-doorglass"><i></i></span><strong>↗ 입장</strong></button></article>`}
 walkIntoShop(i){if(this.entering)return;this.entering=true;const btn=this.world.querySelector(`[data-shop="${i}"]`);btn?.classList.add('opening');this.note('손님이 '+RAW[i].n+' 점포 입구로 이동합니다.');setTimeout(()=>{this.entering=false;this.enterStore(i)},540)}
 enterRoom(id){this.room=id;if(this.firstRoomCall){this.firstRoomCall=false;this.renderMarket();return}this.enterStore(storeToRoom[id]??0)}
 enterStore(i=0){this.moveToken++;this.mission=null;this.storeIndex=i;this.resetShopState();this.scene='store';this.mapArea();const s=this.store();const role=sellRole(s);
  const bgtype=/(활어|선어|생선류|제철어류)/.test(s.kind)?'fish':/(패류|갑각류|낙지|해산물)/.test(s.kind)?'shell':/(냉동|도매|손질·포장)/.test(s.kind)?'mixed':'seaweed';
  this.world.innerHTML=`<div class="gv-shop-bg gv-shop-bg-${bgtype}"></div><div class="gv-store-sign"><span class="gv-sea-icon">🌊</span><div><b>${esc(s.n)}</b><small>${esc(s.kind)} 전문 · ${esc(s.fish.join(' · '))}</small></div><span class="gv-sea-icon">🐟</span></div>
   <button type="button" class="gv-exit" data-action="exit" aria-label="출입문을 통하여 시장으로 나가기">↶ 시장으로 나가기<span class="gv-door-panel">▥</span></button>
   <div class="gv-productzones">${this.stock.map((p,j)=>this.productSpot(p,j)).join('')}</div>
   <button type="button" class="gv-spot gv-scale" data-action="scale"><strong>⚖ 저울</strong><small>계량·가격 확인</small><em id="gv-scale-value">0.00 kg</em><span class="gv-scale-item" id="gv-scale-item"></span></button>
   <button type="button" class="gv-spot gv-cold" data-action="cold"><strong>❄ 냉장보관고</strong><small id="gv-cold-caption">문 열기 · 입출고</small></button>
   <button type="button" class="gv-spot gv-freezer" data-action="freezer"><strong>❄ 냉동보관고</strong><small id="gv-freezer-caption">문 열기 · 입출고</small></button>
   <div class="gv-cabinet-door gv-cabinet-cold" id="gv-door-cold" data-action="cold" role="button" tabindex="0" aria-label="냉장고 문 열기·닫기"><div class="gv-inner-shelf" id="gv-shelf-cold"></div><div class="gv-glassdoor">냉장</div></div>
   <div class="gv-cabinet-door gv-cabinet-freezer" id="gv-door-freezer" data-action="freezer" role="button" tabindex="0" aria-label="냉동고 문 열기·닫기"><div class="gv-inner-shelf" id="gv-shelf-freezer"></div><div class="gv-glassdoor">냉동</div></div>
   <button type="button" class="gv-spot gv-packing" data-action="packing"><b>📦 손질·포장대</b></button>
   <button type="button" class="gv-spot gv-checkout" data-action="checkout"><strong>▣ 계산대</strong><small>결제 · 영수증</small><span class="gv-cart-count" id="gv-cart-count">장바구니 0건</span></button>
   <div class="gv-actor gv-customer" id="gv-customer" tabindex="0" role="button" aria-label="손님에게 질문"><div class="gv-bubble" id="gv-q" hidden></div><img src="game-art/customer.png" alt="손님 캐릭터"><button type="button" class="gv-npc-hit" aria-label="손님 질문"></button><span class="gv-role">손님</span></div>
   <div class="gv-actor gv-seller" id="gv-seller" tabindex="0" role="button" aria-label="판매자에게 질문"><div class="gv-bubble" id="gv-a" hidden></div><img src="game-art/seller.png" alt="${role} 캐릭터"><button type="button" class="gv-npc-hit" aria-label="상인 대답"></button><span class="gv-role">${role}</span></div>
   <div class="gv-focuspanel" id="gv-detail" hidden></div>
   <div class="gv-floorcaption">상품과 사람을 클릭하면 손님이 이동하고 질문합니다. 판매자는 현재 상황에 맞게 자동으로 답변합니다.</div>`;
  this.customerEl=this.world.querySelector('#gv-customer');this.sellerEl=this.world.querySelector('#gv-seller');this.qEl=this.world.querySelector('#gv-q');this.aEl=this.world.querySelector('#gv-a');
  this.customerPos={x:520,y:744};this.sellerPos={x:793,y:560};this.placeActors();this.world.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',e=>this.action(b.dataset.action)));
  this.world.querySelectorAll('[data-product]').forEach(b=>b.addEventListener('click',()=>this.openProduct(+b.dataset.product)));
  this.customerEl.onclick=()=>this.talk('person');this.sellerEl.onclick=()=>this.talk('person');this.world.querySelectorAll('[role=button][data-action]').forEach(b=>b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.action(b.dataset.action)}}));
  this.attachDrag();this.mapArea();this.mark('enter');this.updateStockUI();
  this.talk('person',false);
 }
 productSpot(p,j){return `<button type="button" class="gv-spot gv-product gv-product-${j}" data-product="${j}" data-drag="${j}" title="${esc(p.name)} 확인 또는 드래그 이동"><span class="gv-producttitle">${esc(p.name)}</span><span class="gv-prodspec">${p.weight*1000}g · ${comma(p.price)}원/${p.unit} <small>예시</small></span><span class="gv-stockbadge" id="gv-stock-${j}">진열 ${p.qty}</span></button>`}
 placeActors(){if(!this.customerEl||!this.sellerEl)return;for(const [el,p] of [[this.customerEl,this.customerPos],[this.sellerEl,this.sellerPos]]){el.style.left=p.x+'px';el.style.top=p.y+'px'}}
 async walkTo(object){const targets={product0:[507,749,756,556],product1:[572,743,770,558],product2:[652,744,809,561],scale:[757,739,913,559],cold:[1029,743,852,559],freezer:[1130,745,906,558],checkout:[1117,742,932,557],packing:[1190,746,1053,558],person:[545,744,793,558],door:[220,746,393,558]};const v=targets[object]||targets.person;
  this.customerPos={x:v[0],y:v[1]};this.sellerPos={x:v[2],y:v[3]};this.placeActors();this.customerEl.classList.add('walking');this.sellerEl.classList.add('walking');await wait(760);this.customerEl?.classList.remove('walking');this.sellerEl?.classList.remove('walking')}
 async speak(target,p,page=0){const token=++this.moveToken;this.qEl.hidden=true;this.aEl.hidden=true;await this.walkTo(target);if(token!==this.moveToken||this.scene!=='store')return;
  const {q,ans}=sayFor(this,target.startsWith('product')?'product':target,p,page);
  this.qEl.textContent=q;this.qEl.hidden=false;this.sellerEl.classList.add('gesturing');await wait(980);if(token!==this.moveToken||this.scene!=='store')return;
  this.aEl.textContent=ans;this.aEl.hidden=false;this.sellerEl.classList.remove('gesturing');if(target!=='person'&&target!=='door')this.mark('inspect');
  // both bubbles remain, until the next interaction; product panel remains separately clickable
 }
 openProduct(j,page=0){const p=this.stock[j];if(!p)return;this.currentProduct=p;this.page=page;this.panel='product';this.speak('product'+j,p,page);this.drawProductPanel(p,page);this.note(`${p.name}을 살펴보고 있습니다. 선택과 구매는 별도의 행동입니다.`)}
 drawProductPanel(p,page){const els=this.world.querySelector('#gv-detail');if(!els)return;els.hidden=false;const tabnames=['가격·규격','생산·이력','품질·보관','구매선택'];const tab=page%4;
 const pricePerKg=p.unit==='봉'?p.price/p.weight:p.price;
 const rows=[
  [['판매가격',comma(p.price)+'원 / '+p.unit],['규격(중량)',`${Math.round(p.weight*1000)}g`],['단가환산',`${comma(pricePerKg)}원 / kg`],['진열 수량',`${p.qty}개 (교육용)`]],
  [['원산지','실제 표시 확인'],['생산자·가공업체','자료 미연결'],['입고일·로트번호','확인 가능한 자료 없음'],['이력 검증','실제 상품별 확인 필요']],
  [['상품 상태',p.kind],['보관 방법','실제 제품 표시 확인'],['보관온도','품목별 조건 확인'],['소비기한','실제 포장 표시 확인']],
  [['선택상품',p.name],['선택 수량','1'+(p.unit==='봉'?'봉':'건')],['예상 중량',p.weight.toFixed(2)+'kg'],['거래상태',p.qty>0?'선택 가능':'진열 재고 없음']]
 ];
 els.innerHTML=`<header><strong>${esc(p.name)} · 상품정보 <small>교육용 예시</small></strong><button type="button" data-panel="close" aria-label="상품 상세정보 닫기">×</button></header><nav>${tabnames.map((x,i)=>`<button type="button" class="${i===tab?'chosen':''}" data-panel="tab-${i}">${x}</button>`).join('')}</nav><div class="gv-panelproduct"><div class="gv-producticon">${/미역|다시마|톳|멸치/.test(p.name)?'🌿':/굴|바지락|가리비|전복/.test(p.name)?'🐚':'🐟'}</div><div class="gv-panellines">${rows[tab].map(a=>`<div><span>${esc(a[0])}</span><b>${esc(a[1])}</b></div>`).join('')}</div></div><footer>${button('‹ 이전','data-panel="prev"') }<b>${tab+1} / 4</b>${button('다음 ›','data-panel="next"')}</footer><div class="gv-panelactions">${button('✓ 상품 고르기','data-panel="choose" '+(p.qty>0?'':'disabled'),'gv-primary')}${button('↗ 저울로 이동','data-panel="scale"')}</div>`;
 els.querySelectorAll('[data-panel]').forEach(btn=>btn.onclick=()=>{let v=btn.dataset.panel;if(v==='close'){els.hidden=true;return}if(v==='choose'){this.choose(p);return}if(v==='scale'){this.action('scale');return}if(v==='prev'||v==='next'||v.startsWith('tab-')){let n=v==='prev'?(tab+3)%4:v==='next'?(tab+1)%4:Number(v.split('-')[1]);this.mark('info');this.page=n;this.drawProductPanel(p,n);this.speak('product'+this.stock.indexOf(p),p,n)}})
 }
 choose(p){if(p.qty<1){this.note('재고가 없습니다.');return}if(this.holding&&this.holding!==p){this.note('현재 들고 있는 상품을 먼저 저울이나 보관고로 옮기세요.');return}p.qty--;this.holding={...p,ref:p};this.selected=this.holding;this.currentProduct=p;this.drawProductPanel(p,this.page);this.updateStockUI();this.note(`${p.name}을 실제로 선택했습니다. 저울이나 보관고로 옮기세요.`)}
 action(kind){if(this.scene!=='store')return;switch(kind){
  case'exit': this.world.querySelector('.gv-exit')?.classList.add('open');this.speak('door');setTimeout(()=>this.returnMarket(),1000);return;
  case'scale':this.speak('scale',this.holding||this.selected);this.showScalePanel();return;
  case'cold':case'freezer':this.speak(kind,this.holding||this.selected);this.toggleCold(kind);return;
  case'packing':this.speak('packing',this.selected);this.showPackingPanel();return;
  case'checkout':this.speak('checkout',this.selected);this.showCheckout();return;
 }}
 talk(){this.speak('person',null);this.note('손님이 현재 필요한 상품과 용도를 질문합니다.')}
 showSmall(title,rows,actions,where='right'){const box=this.world.querySelector('#gv-detail');box.hidden=false;box.innerHTML=`<header><strong>${esc(title)}</strong><button type="button" data-small="close">×</button></header><div class="gv-panellines gv-fullpanellines">${rows.map(([k,v])=>`<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div><div class="gv-smallactions">${actions.map((a,i)=>button(esc(a.text),`data-small="${i}"`,a.primary?'gv-primary':'')).join('')}</div>`;
 box.querySelectorAll('[data-small]').forEach(btn=>btn.onclick=()=>{const key=btn.dataset.small;if(key==='close'){box.hidden=true;return}actions[+key]?.fn()})}
 showScalePanel(){const p=this.scaleItem||this.holding||this.selected;const on=this.scaleItem;
  const rows=[['전자저울 표시',on?on.weight.toFixed(2)+' kg':'0.00 kg'],['상품',on?on.name:'미계량'],['단가',on?`${comma(on.price)}원/${on.unit}`:'상품 선택 전'],['예상금액',on?comma(on.price*(on.unit==='kg'?on.weight:1))+'원':'—']];
  this.showSmall('⚖ 전자저울 · 직접 계량',rows,[
   {text:p&&!on?'상품을 저울에 올리기':'상품 고르기',primary:true,fn:()=>p&&!on?this.placeScale(p):this.note('진열대에서 상품을 선택하세요.')},
   {text:'− 0.1kg',fn:()=>this.adjustWeight(-.1)},{text:'+ 0.1kg',fn:()=>this.adjustWeight(.1)},
   {text:'계량상품 장바구니 담기',fn:()=>this.intoCart()}
  ]);
 }
 placeScale(p){if(!p)return;this.scaleItem={...p};this.holding=null;this.selected=this.scaleItem;this.updateStockUI();this.mark('weigh');this.note(`${p.name}을 저울에 올렸습니다. 표시 중량을 확인하세요.`);this.showScalePanel()}
 adjustWeight(delta){if(!this.scaleItem){this.note('상품을 먼저 저울에 올리세요.');return}this.scaleItem.weight=Math.max(.1,Math.round((this.scaleItem.weight+delta)*100)/100);this.showScalePanel();this.updateStockUI()}
 intoCart(){if(!this.scaleItem){this.note('먼저 상품을 계량하세요.');return}this.cart.push({...this.scaleItem});this.scaleItem=null;this.updateStockUI();this.note('상품을 장바구니에 담았습니다. 계산대로 이동할 수 있습니다.');this.showScalePanel()}
 toggleCold(type){let st=this[type];st.door=!st.door;this.updateStockUI();this.showColdPanel(type)}
 showColdPanel(type){const st=this[type];this.showSmall((type==='cold'?'냉장':'냉동')+' 보관고 · 입출고',[['문 상태',st.door?'열림':'닫힘'],['수납 상품',st.items.map(p=>p.name).join(', ')||'없음'],['보관기준','품목별 실제 기준 확인'],['입출고','교육용 상태 저장']],[
  {text:st.door?'문 닫기':'문 열기',primary:true,fn:()=>this.toggleCold(type)},
  {text:'선택상품 넣기',fn:()=>this.storeItem(type)},
  {text:'상품 한 개 꺼내기',fn:()=>this.retrieveItem(type)}
 ])}
 storeItem(type){let st=this[type];if(!st.door){this.note('문을 먼저 열어야 합니다.');return}let p=this.holding||this.scaleItem;if(!p){this.note('먼저 상품을 선택하거나 저울에서 가져오세요.');return}st.items.push({...p});this.holding=null;this.scaleItem=null;this.mark('store');this.updateStockUI();this.showColdPanel(type);this.note(p.name+'이(가) 보관고 선반에 실제로 적재되었습니다.')} 
 retrieveItem(type,index=null){let st=this[type];if(!st.door){this.note('문을 먼저 열어야 합니다.');return}if(this.holding){this.note('들고 있는 상품을 먼저 처리하세요.');return}let p=index===null?st.items.pop():st.items.splice(index,1)[0];if(!p){this.note('꺼낼 상품이 없습니다.');return}this.holding={...p};this.selected=this.holding;this.updateStockUI();this.showColdPanel(type);this.note(`${p.name}을 보관고에서 꺼냈습니다.`)}
 showPackingPanel(){this.showSmall('📦 손질·포장대',[['포장상품',this.scaleItem?.name||this.holding?.name||this.cart.at(-1)?.name||'미선택'],['손질·포장','고객 요청과 조건 확인'],['추가비용','실제 조건 확인 필요']],[{text:'포장방법 안내 확인',primary:true,fn:()=>this.note('고객 요청·포장방식·추가비용 여부를 확인했습니다.')},{text:'계산대로 이동',fn:()=>this.action('checkout')}])}
 showCheckout(){const total=this.cart.reduce((s,p)=>s+p.price*(p.unit==='kg'?p.weight:1),0);this.showSmall('▣ 계산대 · 가상 거래',[['상품',this.cart.map(p=>p.name).join(', ')||'장바구니 비어 있음'],['상품 수',this.cart.length+'건'],['상품 합계',comma(total)+'원 (예시)'],['포장·배송비','별도 실제 조건 확인']],[{text:'✓ 가상 거래 확정',primary:true,fn:()=>{if(!this.cart.length){this.note('장바구니에 물품이 없습니다.');return}this.handlers.onTrade?.({items:this.cart.map(p=>({name:p.name,qty:p.weight})),total});this.lastReceipt={items:this.cart.map(p=>({...p})),total};this.cart=[];this.tradeCount++;this.mark('checkout');this.updateStockUI();this.showReceipt();}},{text:'계속 구경하기',fn:()=>this.world.querySelector('#gv-detail').hidden=true}]);}
 showReceipt(){this.showSmall('🧾 가상 거래 영수증',[['구매 상품',this.lastReceipt.items.map(p=>p.name).join(', ')],['상품 합계',comma(this.lastReceipt.total)+'원'],['거래 구분','교육용 가상거래'],['결제 실행','실제 결제되지 않음']],[{text:'거래 마무리',primary:true,fn:()=>{this.mark('finish');this.world.querySelector('#gv-detail').hidden=true;this.note('가상 거래의 안내와 마무리가 완료됐습니다.') }},{text:'시장으로 나가기',fn:()=>this.returnMarket()}])}
 updateStockUI(){if(this.scene!=='store')return;for(let j=0;j<3;j++){const sp=this.world.querySelector('#gv-stock-'+j);if(sp&&this.stock[j])sp.textContent='진열 '+this.stock[j].qty}
  const val=this.world.querySelector('#gv-scale-value');if(val)val.textContent=this.scaleItem?this.scaleItem.weight.toFixed(2)+' kg':'0.00 kg';const item=this.world.querySelector('#gv-scale-item');if(item)item.textContent=this.scaleItem?this.scaleItem.name:'';
  const cart=this.world.querySelector('#gv-cart-count');if(cart)cart.textContent='장바구니 '+this.cart.length+'건';
  for(const type of ['cold','freezer']){const st=this[type];const door=this.world.querySelector('#gv-door-'+type);door?.classList.toggle('open',st.door);const shelf=this.world.querySelector('#gv-shelf-'+type);if(shelf)shelf.innerHTML=st.items.map((p,i)=>`<div class="gv-storedproduct" data-storage="${type}" data-storage-index="${i}" title="드래그하여 다른 설비로 이동">${esc(p.name)} <small>${(p.weight*1000).toFixed(0)}g</small></div>`).join('')||'<span class="gv-emptyshelf">보관 상품 없음</span>';
   const caption=this.world.querySelector('#gv-'+type+'-caption');if(caption)caption.textContent=st.door?'문 열림 · '+st.items.length+'건':'문 닫힘 · '+st.items.length+'건'}
 }
 attachDrag(){if(this.dragBound)return;this.dragBound=true;let down=null,ghost=null;const world=this.world;
  world.addEventListener('pointerdown',e=>{if(this.scene!=='store')return;const el=e.target.closest('[data-drag],[data-storage]');if(!el)return;down={el,index:el.hasAttribute('data-drag')?+el.dataset.drag:+el.dataset.storageIndex,type:el.dataset.storage||null,x:e.clientX,y:e.clientY};});
  const move=e=>{if(!down||this.scene!=='store')return;if(!ghost&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>11){ghost=document.createElement('div');ghost.className='gv-dragghost';ghost.textContent=down.type?this[down.type].items[down.index]?.name:(this.stock[down.index]?.name||'상품');document.body.append(ghost)}if(ghost){ghost.style.left=(e.clientX+13)+'px';ghost.style.top=(e.clientY+9)+'px'}};
  const up=e=>{if(!down)return;const d=down;down=null;if(!ghost)return;ghost.remove();ghost=null;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-action]');const p=d.type?this[d.type].items[d.index]:this.stock[d.index];if(!p)return;if(!target){this.note('저울 또는 보관고에 떨어뜨리세요.');return}
   const action=target.dataset.action;if(!['scale','cold','freezer','checkout'].includes(action)){this.note('이동할 설비를 선택하십시오.');return}
   if(d.type){if(!this[d.type].door){this.note('보관고 문을 먼저 열어야 합니다.');return}this.retrieveItem(d.type,d.index)}else if(!this.holding)this.choose(p);
   if(action==='scale')this.placeScale(this.holding||p);else if(action==='cold'||action==='freezer'){if(!this[action].door)this[action].door=true;this.storeItem(action)}else if(action==='checkout'){this.placeScale(this.holding||p);this.intoCart()}this.speak(action,p);
  };
  this.world.addEventListener('pointermove',move);this.world.addEventListener('pointerup',up);this.world.addEventListener('pointercancel',()=>{down=null;ghost?.remove();ghost=null});
 }
 returnMarket(){this.moveToken++;if(this.scene==='store')this.mark('finish');this.mission=null;this.renderMarket()}
 goHarbor(){this.moveToken++;this.scene='harbor';this.harborStep=0;this.flags=new Set();this.world.innerHTML=`<div class="gv-harbor-bg"><div class="gv-harbor-title">⚓ 수산물 입항 · 하역 · 운반 실습 <small>교육용 가상 작업 · 클릭할 때만 진행됩니다</small></div><div class="gv-water"></div>
  <button type="button" class="gv-vessel" data-hstep="0"><svg viewBox="0 0 480 220" aria-label="어선" xmlns="http://www.w3.org/2000/svg"><path d="M40 148 L448 148 408 193 100 193Z" fill="#0a5e80" stroke="#083b51" stroke-width="9"/><path d="M50 150L438 150 414 169 74 169Z" fill="#f9f9e3"/><rect x="175" y="67" width="185" height="77" rx="6" fill="#e6e9d7" stroke="#275063" stroke-width="6"/><rect x="192" y="80" width="70" height="41" fill="#4ca3c7"/><rect x="280" y="80" width="62" height="41" fill="#4ca3c7"/><path d="M270 67L270 15M252 16H289M298 16V2M359 66L411 90" stroke="#1e4e61" stroke-width="7"/><circle cx="274" cy="8" r="8" fill="#ffdb85"/><g fill="#e0bc6c" stroke="#7b624b"><rect x="79" y="124" width="66" height="28"/><rect x="103" y="101" width="59" height="21"/><rect x="366" y="123" width="52" height="26"/></g><circle cx="132" cy="165" r="13" fill="#132f3a" stroke="#d1d8cf" stroke-width="5"/><circle cx="391" cy="165" r="13" fill="#132f3a" stroke="#d1d8cf" stroke-width="5"/></svg><span>① 어선 클릭 · 입항</span></button>
  <button type="button" class="gv-dock" data-hstep="1">② 접안 지점 · 계류 확인</button>
  <button type="button" class="gv-crates" data-hstep="2"><span>▣ ▣ ▣</span><b>③ 어획상자 하역</b></button>
  <button type="button" class="gv-cart" data-hstep="3"><span>🛒</span><b>④ 카트 운반</b></button>
  <button type="button" class="gv-inspection" data-hstep="4"><span>📋</span><b>⑤ 검수</b></button>
  <button type="button" class="gv-warehouse" data-hstep="5"><span>🏭</span><b>⑥ 입고</b></button><div class="gv-harbor-log" id="gv-harbor-log">입항할 어선을 선택하십시오.</div>
  <img src="game-art/customer.png" id="gv-harbor-player" alt="실습 참가자"></div>`;
  this.world.querySelectorAll('[data-hstep]').forEach(b=>b.onclick=()=>this.harborAction(+b.dataset.hstep));this.mapArea();this.updateHud()}
 harborAction(i){if(this.scene!=='harbor')return;if(i!==this.harborStep){this.note(`현재는 ${this.harborStep+1}단계를 수행해야 합니다.`);return}const names=['어선 입항','접안·계류 확인','어획상자 하역','카트 운반','검수·기록 확인','시설 입고'];
  const el=this.world.querySelector(`[data-hstep="${i}"]`);el?.classList.add('completed');if(i===0)el?.classList.add('arriving');
  if(i===2)this.world.querySelector('.gv-crates')?.classList.add('unloaded');if(i===3)this.world.querySelector('.gv-cart')?.classList.add('moved');
  const walker=this.world.querySelector('#gv-harbor-player');if(walker){walker.style.left=(180+i*260)+'px'}
  this.harborStep++;this.world.querySelector('#gv-harbor-log').textContent=`완료: ${names[i]} (${this.harborStep}/6) · ${this.harborStep<6?'다음 작업을 직접 클릭하세요.':'입고까지 완료했습니다.'}`;
  this.app.querySelector('#gv-progresslabel').textContent=`${this.harborStep} / 6 단계`;this.app.querySelector('#gv-barfill').style.width=(this.harborStep/6*100)+'%';this.note(`${names[i]} 완료 · 자동으로 다음 단계로 넘어가지 않습니다.`);
 }
 help(){this.note('점포 선택 → 상품 클릭 → 손님 이동·대화 → 상품 고르기 → 저울·보관고 → 계산대. 미션은 상단 학습미션에서 고릅니다.')}
 focusMission(id){const m=this.missions.find(x=>x.id===id);if(!m)return;this.room=m.room;this.enterStore(storeToRoom[m.room]??0);this.mission=m;this.updateHud();this.note(`${m.id} · ${m.title}: ${m.lead}`)}
 setMode(){}
 setAudio(on,vol){this.soundOn=!!on;this.volume=Math.max(0,Math.min(1,Number(vol??.25)));if(this.soundOn)this.startMusic();else this.stopMusic()}
 startMusic(){if(this.musicTimer||!this.soundOn||document.hidden)return;try{if(!this.audio)this.audio=new (window.AudioContext||window.webkitAudioContext)();this.audio.resume().catch(()=>{});const notes=[523,659,784,659,587,698,880,698,523,659,784,988,880,784,698,587,523,659,784,659,493,587,698,587,440,523,659,784,659,587,523,440];this.musicTimer=setInterval(()=>{const i=this.noteStep++%notes.length;this.tone(notes[i],.32,.07);if(i%4===0)this.tone([261,220,174,196][Math.floor(i/8)],.74,.04)},370)}catch(err){this.stopMusic()}}
 stopMusic(){if(this.musicTimer){clearInterval(this.musicTimer);this.musicTimer=null}}
 tone(freq,d=.18,g=.06){if(!this.soundOn||!this.audio)return;try{const c=this.audio,o=c.createOscillator(),amp=c.createGain(),t=c.currentTime;o.type='sine';o.frequency.value=freq;amp.gain.setValueAtTime(.0001,t);amp.gain.exponentialRampToValueAtTime(Math.max(.0001,g*this.volume),t+.015);amp.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(amp).connect(c.destination);o.start(t);o.stop(t+d+.02)}catch{}}
 playNote(k){this.tone(k==='stamp'?880:587,.12,.05)}
 musicTest(){this.startMusic();this.tone(659,.32,.1)};say(who,message){this.note(`${who}: ${message}`)};destroy(){this.moveToken++;clearTimeout(this.toastTimer);document.removeEventListener('fullscreenchange',this.resize);document.removeEventListener('visibilitychange',this.vis);this.stopMusic();this.ro.disconnect();this.audio?.close().catch(()=>{});this.root.replaceChildren()}
 bindGlobal(){};
}
window.KAFV_MarketRPG=ImmersiveRPG;
window.KAFV_RPG_V100={version:'1.0.0',basis:'승인된 시각 시안 + 제5차시 35컷, 7공간·24미션·48행동',status:'독립 실행 시범본 / 사용자 PASS 보류',singlePlay:true,shops:15,missions:24,engine:'DOM/SVG interactive with layered illustration'};
window.KAFV_RPG_PREVIOUS=BASE;
})();
// Mount the drawer and full-width layout once the simulator document has rendered.
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>document.getElementById('simulator-screen')?.classList.add('gv-v100-ready'),{once:true});
else document.getElementById('simulator-screen')?.classList.add('gv-v100-ready');
