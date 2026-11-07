/* KAFV v1.0.5 · 장목선구점 업종 오류 정정: 수산물이 아닌 선박·어업·포장용품 */
(()=>{'use strict';
const G=window.KAFV_MarketRPG;if(!G)throw Error('v1.0.4 engine unavailable');
const P=G.prototype,STORES=window.KAFV_RPG_STORES||[], INDEX=14;
if(!STORES[INDEX]||STORES[INDEX].n!=='장목선구점')throw Error('Gear store index changed; inspect source before patching');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const won=n=>Math.round(n||0).toLocaleString('ko-KR');
const gear=[
 {name:'고무장갑',price:3200,unit:'켤레',spec:'내유 작업용 · M/L/XL',emoji:'🧤',usage:'어획물 취급·세척·위생 작업',qty:14,origin:'대한민국(가상)'},
 {name:'스티로폼 박스',price:2800,unit:'개',spec:'내부 48×32×24cm',emoji:'📦',usage:'수산물 포장·보냉 운반',qty:20,origin:'대한민국(가상)'},
 {name:'포장용 비닐',price:4500,unit:'롤',spec:'투명 30cm×100m',emoji:'🧻',usage:'소분·수산물 포장',qty:9,origin:'대한민국(가상)'},
 {name:'포장지',price:5200,unit:'묶음',spec:'방수 포장지 50장',emoji:'📜',usage:'상품 포장·완충',qty:15,origin:'대한민국(가상)'},
 {name:'작업용 가위',price:6200,unit:'개',spec:'스테인리스 · 21cm',emoji:'✂️',usage:'포장재·줄 재단',qty:8,origin:'대한민국(가상)'},
 {name:'작업용 칼',price:8900,unit:'개',spec:'작업용 · 칼집 포함',emoji:'🔪',usage:'작업 소재 절단',qty:7,origin:'대한민국(가상)'},
 {name:'로프(줄)',price:12500,unit:'롤',spec:'합성섬유 8mm×30m',emoji:'🪢',usage:'어구 고정·계류 작업',qty:12,origin:'대한민국(가상)'},
 {name:'방수 장화',price:18500,unit:'켤레',spec:'240~285mm',emoji:'🥾',usage:'미끄럼·물기 작업 환경',qty:10,origin:'대한민국(가상)'}
];
Object.assign(STORES[INDEX],{kind:'선박·어업용품',icon:'⚓',fish:gear.map(p=>p.name),role:'선구점 상인'});
const isGear=g=>g?.storeIndex===INDEX&&g?.scene==='store';
const old={resetShopState:P.resetShopState,enterStore:P.enterStore,productSpot:P.productSpot,drawProductPanel:P.drawProductPanel,speak:P.speak,action:P.action,showScalePanel:P.showScalePanel,showCheckout:P.showCheckout,showReceipt:P.showReceipt,stepAction:P.stepAction,updateHud:P.updateHud,updateStockUI:P.updateStockUI,walkTo:P.walkTo,renderMarket:P.renderMarket,openProduct:P.openProduct};
P.resetShopState=function(){old.resetShopState.call(this);if(this.storeIndex!==INDEX)return;
 this.stock=gear.map((p,i)=>({id:'GEAR-'+String(i+1).padStart(2,'0'),...p,weight:1,kind:'선박·어업·포장용품',lot:'GEAR-SIM-26-'+String(i+1).padStart(3,'0'),producer:'KAFV 가상용품 제조사 '+(i+1),processor:'가상 선구용품 공급센터',arrival:'2026-11-07',temperature:'습기·오염 방지, 제품별 표시사항 확인 (예시)',expiry:'제품별 품질·안전 표시 확인',count:1}));
};
P.renderMarket=function(){old.renderMarket.call(this);const c=this.world.querySelector(`[data-shop="${INDEX}"]`)?.closest('.gv-shopcard');if(c){c.classList.add('gv-gear-shopcard');const photo=c.querySelector('.gv-shopphoto');if(photo)photo.classList.add('gv-gear-card-photo')}};
P.productSpot=function(p,j){if(this.storeIndex!==INDEX)return old.productSpot.call(this,p,j);
 return `<button type="button" class="gv-spot gv-product gv-gear-product gv-gear-product-${j}" data-product="${j}" data-drag="${j}" title="${esc(p.name)} · 규격과 단가 보기"><span class="gv-gear-emoji" aria-hidden="true">${p.emoji}</span><span class="gv-producttitle">${esc(p.name)}</span><span class="gv-prodspec">${won(p.price)}원/${esc(p.unit)} · 가상</span><span class="gv-stockbadge" id="gv-stock-${j}">재고 ${p.qty}</span></button>`;
};
P.enterStore=function(i=0){old.enterStore.call(this,i);if(!isGear(this))return;
 this.world.classList.add('gv-gear-shop');
 const bg=this.world.querySelector('.gv-shop-bg');if(bg)bg.className='gv-shop-bg gv-shop-bg-gear';
 const sign=this.world.querySelector('.gv-store-sign small');if(sign)sign.textContent='선박·어업용품 · 포장자재 · 작업도구';
 const photoIcon=this.world.querySelector('.gv-store-sign .gv-sea-icon');if(photoIcon)photoIcon.textContent='⚓';
 // All fish-store cold cabinets and their overlapping invisible targets are removed here.
 this.world.querySelectorAll('.gv-storage-bay,.gv-cold,.gv-freezer,.gv-cabinet-door,.gv-backdrop-hits,.gv-original-scale-cover').forEach(e=>e.remove());
 const scale=this.world.querySelector('.gv-scale');if(scale){scale.querySelector('strong').textContent='▤ 수량·규격 확인대';scale.querySelector('small').textContent='개수·단가 확인';scale.querySelector('em').textContent='0 개';}
 const pack=this.world.querySelector('.gv-packing');if(pack)pack.innerHTML='<b>📦 포장·운반 안내</b>';
 const board=this.world.querySelector('.gv-traceboard');if(board){board.querySelector('b').textContent='제품 표시·입고 확인';}
 const showcase=document.createElement('div');showcase.className='gv-gear-rack-tag';showcase.textContent='선구용품 진열 · 8개 품목 · 클릭해 규격·가격 확인';this.world.append(showcase);
 this._gearReceipt=null;this.updateStockUI();
};
P.drawProductPanel=function(p,page){old.drawProductPanel.call(this,p,page);if(!isGear(this))return;
 const box=this.world.querySelector('#gv-detail'),tab=page%4;if(!box)return;
 const titles=['가격·규격','제조·입고','용도·보관','구매선택'];box.querySelectorAll('nav button').forEach((b,i)=>b.textContent=titles[i]);
 const rows=[
 [['품목',p.name],['판매단가',`${won(p.price)}원 / ${p.unit}`],['제품 규격',p.spec],['현재 재고',`${p.qty} ${p.unit} · 교육용`]],
 [['가상 원산지',p.origin],['제조업체',p.producer],['공급업체',p.processor],['입고일',p.arrival],['로트번호',p.lot],['이력 검증','게임 내 가상 입고대장과 일치']],
 [['사용 용도',p.usage],['제품 분류','선박·어업·포장용품'],['보관·취급',p.temperature],['구매 전 확인','규격·재질·사용목적·재고 확인']],
 [['선택 상품',p.name],['선택 단위',`1 ${p.unit}`],['가상 단가',won(p.price)+'원'],['구매 가능 여부',p.qty?'재고 있음':'재고 없음']]
 ];
 const panel=box.querySelector('.gv-panellines');if(panel)panel.innerHTML=rows[tab].map(([k,v])=>`<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');
 const icon=box.querySelector('.gv-producticon');if(icon)icon.textContent=p.emoji;
 const action=box.querySelector('[data-panel="scale"]');if(action)action.textContent='↗ 수량·단가 확인';
 box.querySelector('.gv-provenance-hint')?.remove();
};
P.walkTo=function(target){
 if(!isGear(this)||!/^product[0-7]$/.test(target))return old.walkTo.call(this,target);
 const j=Number(target.slice(7)),item=this.world.querySelector(`[data-product="${j}"]`);
 if(!item)return old.walkTo.call(this,'person');
 const center=item.offsetLeft+item.offsetWidth/2;
 const goal={cx:Math.min(720,Math.max(290,center+105)),cy:741};
 goal.sx=Math.min(965,Math.max(755,goal.cx+165));goal.sy=720;
 if(this._actorMove){this._actorMove.cancelled=true;this._actorMove.finish?.()}
 const a={...this.customerPos},b={...this.sellerPos};let finish;
 const completed=new Promise(r=>finish=r),job={cancelled:false,finish};this._actorMove=job;
 const dx=Math.max(Math.hypot(goal.cx-a.x,goal.cy-a.y),Math.hypot(goal.sx-b.x,goal.sy-b.y));
 const duration=Math.max(380,Math.min(950,dx*1.2)),begin=performance.now();
 this.customerEl.dataset.facing=goal.cx<a.x?'left':'right';this.sellerEl.dataset.facing=goal.sx<b.x?'left':'right';
 this.customerEl.classList.add('gv-in-motion');this.sellerEl.classList.add('gv-in-motion');
 const frame=now=>{if(job.cancelled||this.scene!=='store'){finish();return}
  const t=Math.min(1,(now-begin)/duration),v=t*t*(3-2*t);
  this.customerPos={x:a.x+(goal.cx-a.x)*v,y:a.y+(goal.cy-a.y)*v};
  this.sellerPos={x:b.x+(goal.sx-b.x)*v,y:b.y+(goal.sy-b.y)*v};this.placeActors();
  if(t<1){requestAnimationFrame(frame);return}
  this.customerEl.classList.remove('gv-in-motion');this.sellerEl.classList.remove('gv-in-motion');
  this.customerEl.dataset.facing='right';this.sellerEl.dataset.facing='left';finish();
 };requestAnimationFrame(frame);return completed;
};
P.speak=async function(target,p,page=0){if(!isGear(this))return old.speak.call(this,target,p,page);
 const token=++this.moveToken;if(!this.qEl||!this.aEl)return;this.qEl.hidden=true;this.aEl.hidden=true;
 await this.walkTo(target);
 if(token!==this.moveToken||this.scene!=='store')return;
 const obj=p||this.currentProduct||this.selected;let q='',ans='';
 if(target.startsWith('product')&&obj){
  const pairs=[
   [`이 ${obj.name}은 얼마인가요?`,`${obj.name}은 ${won(obj.price)}원/${obj.unit}입니다. 규격은 ${obj.spec}입니다.`],
   [`${obj.name}은 어디서 공급되었나요?`,`가상 제조사는 ${obj.producer}, 입고 로트는 ${obj.lot}입니다.`],
   [`이 물건은 어디에 사용하나요?`,`${obj.usage}에 사용합니다. 구매 전에 규격과 재질을 확인해 주세요.`],
   [`${obj.name}을 구매하려면 어떻게 하나요?`,`필요한 수량을 선택하면 총액을 계산하고 가상 영수증을 발행해 드립니다.`]
  ];[q,ans]=pairs[page%4];
 }else if(target==='scale'){q='물품은 무게를 재야 하나요?';ans='선구용품은 품목에 따라 개·켤레·롤 등 수량과 규격으로 계산합니다. 필요한 수량을 선택해 주세요.';}
 else if(target==='packing'){q='보관·포장 방법도 알려주시나요?';ans='물품의 재질과 규격에 맞는 보관·포장 방법을 안내합니다.';}
 else if(target==='checkout'){q='선구용품도 여기서 계산하나요?';ans='네, 고른 물품의 종류와 수량을 확인한 후 가상 계산과 영수증을 발행합니다.';}
 else if(target==='door'){q='다른 점포도 둘러볼 수 있나요?';ans='네, 이곳은 선박·어업용품 전문점입니다. 시장 통로로 나가 다른 점포를 이용하실 수 있습니다.';}
 else {q='선박 작업에 필요한 용품을 찾고 있어요.';ans='고무장갑·비닐·스티로폼 박스·포장지·가위·칼·로프 등 필요한 용품을 안내하겠습니다.';}
 this.qEl.textContent=q;this.qEl.hidden=false;await new Promise(r=>setTimeout(r,620));if(token!==this.moveToken||this.scene!=='store')return;this.aEl.textContent=ans;this.aEl.hidden=false;
};
P.updateStockUI=function(){old.updateStockUI.call(this);if(!isGear(this))return;
 this.stock.forEach((p,j)=>{const b=this.world.querySelector('#gv-stock-'+j);if(b)b.textContent='재고 '+p.qty;});
 const scale=this.world.querySelector('#gv-scale-value');if(scale)scale.textContent=this.holding?`${this.holding.count||1} ${this.holding.unit}`:'0 개';
};
P.action=function(kind){if(!isGear(this))return old.action.call(this,kind);
 if(kind==='scale'){this.speak('scale',this.holding);this.showQuantityPanel();return;}
 if(kind==='cold'||kind==='freezer'){this.note('선구용품점에서는 냉장·냉동 보관고 실습이 아니라 규격·수량·보관안내를 확인합니다.');return;}
 if(kind==='packing'){this.speak('packing');this.showSmall('📦 선구용품 포장·보관 안내',[['판매 물품','어구·작업용품·포장재'],['취급 주의','제품별 표시와 사용법 확인'],['운반','크기·수량·포장재질 확인']],[{text:'계산대로 이동',primary:true,fn:()=>this.action('checkout')}]);return;}
 return old.action.call(this,kind);
};
P.showQuantityPanel=function(){if(!isGear(this))return old.showScalePanel.call(this);const p=this.holding||this.selected;
 this.showSmall('▤ 수량·규격·단가 확인',p?[
 ['선택 용품',p.name],['규격',p.spec],['구매 수량',`${p.count||1} ${p.unit}`],['단가',won(p.price)+'원/'+p.unit],['가상 상품금액',won(p.price*(p.count||1))+'원']
 ]:[['선택 용품','없음'],['안내','먼저 진열대의 선구용품을 선택하세요.']],[
 {text:'− 1',fn:()=>{if(p){p.count=Math.max(1,(p.count||1)-1);this.showQuantityPanel();}}},
 {text:'+ 1',fn:()=>{if(p){p.count=Math.min(p.ref?.qty+1||99,(p.count||1)+1);this.showQuantityPanel();}}},
 {text:'장바구니에 담기',primary:true,fn:()=>{if(!p){this.note('선택한 물품이 없습니다.');return;}
  const extra=(p.count||1)-1;if(extra>0){if((p.ref?.qty||0)<extra){this.note('선택 수량보다 재고가 적습니다.');return;}p.ref.qty-=extra;}
  this.cart.push({...p});this.holding=null;this.selected=null;this.mark('weigh');this.updateStockUI();this.showQuantityPanel();this.note(p.name+' '+(p.count||1)+p.unit+' 장바구니 담기 완료');}}
 ]);
};
P.showScalePanel=function(){return isGear(this)?this.showQuantityPanel():old.showScalePanel.call(this)};
P.showCheckout=function(){if(!isGear(this))return old.showCheckout.call(this);
 const total=this.cart.reduce((s,p)=>s+p.price*(p.count||1),0);
 const rows=[['구매 물품',this.cart.map(p=>p.name+' '+(p.count||1)+p.unit).join(' / ')||'없음'],['장바구니',this.cart.length+'건'],['가상 총액',won(total)+'원'],['거래 구분','교육용 가상 거래']];
 const actions=[];
 if(this.holding)actions.push({text:'선택 물품의 수량 확인·담기',primary:true,fn:()=>this.showQuantityPanel()});
 actions.push({text:'✓ 금액 확인·가상 거래',primary:!this.holding,fn:()=>{if(!this.cart.length){this.note('장바구니가 비어 있습니다.');return;}
 this.lastReceipt={items:this.cart.map(p=>({...p})),total,ticket:'GEAR-SIM-RCPT-'+String(this.tradeCount+1).padStart(3,'0')};
 try{this.handlers.onTrade?.({items:this.lastReceipt.items.map(p=>({name:p.name,qty:p.count||1})),total});}catch(e){}
 this.tradeCount++;this.cart=[];this.mark('checkout');this.updateStockUI();this.showReceipt();}});
 this.showSmall('▣ 선구용품 계산대',rows,actions);
};
P.showReceipt=function(){if(!isGear(this))return old.showReceipt.call(this);if(!this.lastReceipt){this.showCheckout();return;}
 const r=this.lastReceipt;
 this.showSmall('🧾 선구용품 가상 영수증',[['영수증 번호',r.ticket],['구매 품목',r.items.map(p=>p.name+' '+(p.count||1)+p.unit).join(' / ')],['가상 결제금액',won(r.total)+'원'],['구분','교육용 가상 거래 · 실제 결제 없음']],[{text:'거래 마무리',primary:true,fn:()=>{this.mark('finish');this.world.querySelector('#gv-detail').hidden=true;}},{text:'시장으로 나가기',fn:()=>this.returnMarket()}]);
};
P.stepAction=function(step){if(!isGear(this))return old.stepAction.call(this,step);
 if(step===0){this.speak('person');return;}
 if(step===1){this.openProduct(0,0);return;}
 if(step===2){this.openProduct(0,1);this.mark('info');return;}
 if(step===3){if(!this.holding&&!this.cart.length){this.note('먼저 필요한 선구용품을 선택해 주세요.');this.openProduct(0,0);return;}this.showQuantityPanel();return;}
 if(step===4){this.action('packing');this.mark('store');return;}
 if(step===5){this.action('checkout');return;}
 if(step===6){this.lastReceipt?this.showReceipt():this.note('선구용품 계산을 완료한 뒤 마무리하세요.');}
};
P.updateHud=function(){old.updateHud.call(this);if(!this.app||this.scene!=='store'||this.storeIndex!==INDEX)return;
 const labels=['입장·인사','용품 탐색','규격·정보','수량·금액','보관·취급','거래·포장','마무리'];
 this.app.querySelectorAll('#gv-steps .gv-step b').forEach((el,i)=>{if(labels[i])el.textContent=labels[i]});
 const hint=this.app.querySelector('#gv-hint');if(hint)hint.textContent='어업·선박용품을 선택해 규격·수량·단가를 확인하고 구매합니다.';
};
window.KAFV_RPG_V105={version:'1.0.5',scope:'장목선구점 업종·상품·화면·판매절차 정정',status:'특정 점포 수정 시범본 / MASTER 보류'};
})();
