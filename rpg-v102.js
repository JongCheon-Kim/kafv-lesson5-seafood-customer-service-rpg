/* KAFV 제5차시 RPG v1.0.2 - composited scene repair, spatial dialogue and visibly changing inventory.
   Non-destructive patch on v1.0.1; source images and 35 lessons remain unchanged. */
(()=>{'use strict';
const Game=window.KAFV_MarketRPG;
if(!Game)throw Error('v1.0.1 foundation missing');
const P=Game.prototype;
const old={enterStore:P.enterStore,walkTo:P.walkTo,showSmall:P.showSmall,drawProductPanel:P.drawProductPanel,
 updateStockUI:P.updateStockUI,storeItem:P.storeItem,retrieveItem:P.retrieveItem,placeScale:P.placeScale,
 goHarbor:P.goHarbor,harborAction:P.harborAction,returnMarket:P.returnMarket,renderMarket:P.renderMarket};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const bubbleClamp=(g)=>{for(const el of [g.qEl,g.aEl]){
 if(!el||el.hidden)continue; const actor=el.closest('.gv-actor');if(!actor)continue;
 const w=el.offsetWidth||180;const aw=actor.offsetWidth||130;const x=parseFloat(actor.style.left)||840;
 const min=w/2+13-(x-aw/2), max=1672-12-w/2-(x-aw/2);
 el.style.left=clamp(aw/2,min,max)+'px';
 }};
function fly(g,label,start,end){if(g.scene!=='store')return;
 const world=g.world,el=document.createElement('div');el.className='gv-item-flight';el.textContent=label||'수산물';
 el.style.left=start[0]+'px';el.style.top=start[1]+'px';
 el.style.setProperty('--dx',end[0]-start[0]+'px');el.style.setProperty('--dy',end[1]-start[1]+'px');
 world.append(el);requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('moving')));
 setTimeout(()=>{el.remove();const door=end[0]>=880?world.querySelector('#gv-door-'+(end[0]<1054?'cold':'freezer')):null;
  door?.classList.add('gv-storage-flash');setTimeout(()=>door?.classList.remove('gv-storage-flash'),800)},910);
}
function draggable(g){if(g._dragPanelBound)return;g._dragPanelBound=true;
 g.world.addEventListener('pointerdown',e=>{
  const header=e.target.closest('#gv-detail header');
  if(!header||e.target.closest('button')||g.scene!=='store')return;
  const box=g.world.querySelector('#gv-detail');const sc=g.viewport.clientWidth/1672;
  const start={x:e.clientX,y:e.clientY,left:parseFloat(box.style.left)||0,top:parseFloat(box.style.top)||0};
  const move=ev=>{box.style.left=clamp(start.left+(ev.clientX-start.x)/sc,4,1672-box.offsetWidth-4)+'px';
    box.style.top=clamp(start.top+(ev.clientY-start.y)/sc,8,800-box.offsetHeight-5)+'px';g._panelMoved=true;};
  const up=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);document.removeEventListener('pointercancel',up)};
  document.addEventListener('pointermove',move);document.addEventListener('pointerup',up,{once:true});
  document.addEventListener('pointercancel',up,{once:true});e.preventDefault();
 });
}
function positionPanel(g,key){const box=g.world?.querySelector('#gv-detail');if(!box||box.hidden)return;
 if(g._panelMoved&&key===g._panelKey)return;
 g._panelMoved=false;g._panelKey=key;
 let left=1260,top=176;
 const j=Number(String(key).replace('product',''));
 if(String(key).startsWith('product')&&Number.isFinite(j)){left=[250,365,475][j]||350;top=160;}
 else if(key==='scale'){left=725;top=168}
 else if(key==='packing'){left=1235;top=170}
 else if(key==='checkout'){left=1335;top=166}
 else if(key==='cold'||key==='freezer'){left=1262;top=145}
 const W=box.offsetWidth||312,H=box.offsetHeight||280;
 box.style.left=clamp(left,5,1672-W-8)+'px';box.style.top=clamp(top,5,800-H-6)+'px';
}
P.enterStore=function(i=0){old.enterStore.call(this,i);
 const world=this.world,bg=world.querySelector('.gv-shop-bg');if(!bg)return;
 const bay=document.createElement('div');bay.className='gv-storage-bay';bay.innerHTML='<div class="gv-baycaption">저온보관 시설 · 가상</div>';bg.after(bay);
 const oldScale=document.createElement('div');oldScale.className='gv-original-scale-cover';oldScale.setAttribute('aria-hidden','true');bay.after(oldScale);
 const trace=document.createElement('button');trace.type='button';trace.className='gv-traceboard';trace.setAttribute('aria-label','표시·입고이력 확인');
 trace.innerHTML='<b>표시·이력 확인</b><span>✓ 원산지 표시</span><span>✓ 입고 로트</span><span>✓ 보관 기록</span>';world.append(trace);
 trace.addEventListener('click',()=>{const p=this.currentProduct||this.stock[0];
  const rows=[['상품',p?.name||'미선택'],['원산지',p?.origin||'가상 등록정보'],['생산자',p?.producer||'가상 생산자'],
   ['입고 로트',p?.lot||'가상 미등록'],['상태','교육용 데이터 대조 완료']];
  this.showSmall('▤ 표시·이력 확인',rows,[{text:'상품정보 열기',fn:()=>this.openProduct(Math.max(0,this.stock.indexOf(p)),1)},
   {text:'닫기',fn:()=>{this.world.querySelector('#gv-detail').hidden=true}}]);
  positionPanel(this,'trace');
 });
 this.customerEl.dataset.facing='right';this.sellerEl.dataset.facing='left';
 draggable(this);positionPanel(this,'product0');
};
P.walkTo=async function(object){if(this.scene!=='store')return;
 // Coordinate pairs use identical room-space units; both characters move and then face the selected item.
 const dest={
  product0:[480,735,702,710],product1:[515,735,718,710],product2:[557,735,735,710],
  scale:[613,735,784,713],cold:[997,743,846,736],freezer:[1126,745,972,735],
  checkout:[1392,748,1501,733],packing:[1200,746,1362,733],person:[537,735,755,715],door:[235,735,382,714]
 }[object]||[537,735,755,715];
 const start={...this.customerPos},startS={...this.sellerPos};
 const travel=Math.max(Math.hypot(dest[0]-start.x,dest[1]-start.y),Math.hypot(dest[2]-startS.x,dest[3]-startS.y));
 const ms=clamp(440+travel*.48,580,1180);
 this.customerPos={x:dest[0],y:dest[1]};this.sellerPos={x:dest[2],y:dest[3]};
 this.customerEl.dataset.facing=dest[0]<start.x?'left':'right';
 this.sellerEl.dataset.facing=dest[2]>startS.x?'right':'left';
 this.customerEl.style.setProperty('--walk-time',ms+'ms');this.sellerEl.style.setProperty('--walk-time',ms+'ms');
 this.customerEl.classList.add('walking');this.sellerEl.classList.add('walking');this.placeActors();
 await new Promise(resolve=>setTimeout(resolve,ms+30));
 this.customerEl?.classList.remove('walking');this.sellerEl?.classList.remove('walking');
 if(this.scene!=='store')return;
 this.sellerEl.dataset.facing=dest[2]<dest[0]?'right':'left';
 this.customerEl.dataset.facing=dest[0]<dest[2]?'right':'left';
 requestAnimationFrame(()=>bubbleClamp(this));
};
P.showSmall=function(...args){old.showSmall.apply(this,args);positionPanel(this,this._lastInteract||'checkout');};
P.drawProductPanel=function(p,page){old.drawProductPanel.call(this,p,page);positionPanel(this,'product'+this.stock.indexOf(p));};
const previousOpen=P.openProduct;
P.openProduct=function(index,page=0){this._lastInteract='product'+index;this._panelMoved=false;previousOpen.call(this,index,page);};
const oldAction=P.action;
P.action=function(kind){this._lastInteract=kind;this._panelMoved=false;oldAction.call(this,kind)};
const oldSpeak=P.speak;
P.speak=async function(...args){await oldSpeak.apply(this,args);if(this.scene==='store')requestAnimationFrame(()=>bubbleClamp(this));};
P.updateStockUI=function(){old.updateStockUI.call(this);
 for(const type of ['cold','freezer']){
  const st=this[type],door=this.world?.querySelector('#gv-door-'+type),shelf=this.world?.querySelector('#gv-shelf-'+type);
  if(!st||!shelf||!door)continue;
  if(st.door){shelf.innerHTML=st.items.map((p,i)=>`<div class="gv-storedproduct" data-storage="${type}" data-storage-index="${i}"><span class="gv-package-icon">${/미역|톳|다시마/.test(p.name)?'🌿':'🐟'}</span><b>${String(p.name).replace(/</g,'&lt;')}</b><small>${Math.round(p.weight*1000)}g</small></div>`).join('')||'<span class="gv-emptyshelf">빈 선반 · 입고 가능</span>';}
  else shelf.innerHTML='';
 }
};
P.placeScale=function(p){const label=p?.name||this.holding?.name;if(label)fly(this,label,[366,503],[572,554]);old.placeScale.call(this,p);};
P.storeItem=function(type){const p=this.holding||this.scaleItem;const before=this[type]?.items?.length||0;
 old.storeItem.call(this,type);
 if(p&&this[type].items.length===before+1){fly(this,p.name,[565,550],type==='cold'?[947,400]:[1111,400]);this.updateStockUI();}
};
P.retrieveItem=function(type,index=null){const n=this[type]?.items?.length||0;
 old.retrieveItem.call(this,type,index);
 if((this[type]?.items?.length||0)===n-1){const p=this.holding;fly(this,p?.name||'상품',type==='cold'?[950,404]:[1100,404],[570,550]);this.updateStockUI();}
};
P.goHarbor=function(){old.goHarbor.call(this);if(this.scene!=='harbor')return;
 const lot=document.createElement('div');lot.className='gv-harbor-animated-lot';lot.id='gv-cargo-lot';lot.textContent='가상 로트';lot.dataset.harborstage='0';
 const line=document.createElement('div');line.className='gv-mooring-line';
 const note=document.createElement('div');note.className='gv-harbor-stepnote';note.textContent='물품 이동은 클릭한 단계에 맞춰 실제로 표현됩니다.';
 this.world.querySelector('.gv-harbor-bg')?.append(lot,line,note);
};
P.harborAction=function(i){const before=this.harborStep;old.harborAction.call(this,i);
 if(before===this.harborStep||this.scene!=='harbor')return;
 const lot=this.world.querySelector('#gv-cargo-lot');if(lot){lot.dataset.harborstage=String(this.harborStep);}
 const line=this.world.querySelector('.gv-mooring-line');if(line)line.dataset.docked=String(this.harborStep>=2);
 const note=this.world.querySelector('.gv-harbor-stepnote');if(note){const stage=['선박이 접안 지점으로 이동합니다','계류 로프를 연결했습니다','상자가 선박에서 하역지점으로 이동합니다',
 '카트에 상자가 실려 운반됩니다','검수 장소에서 로트 정보를 확인합니다','상자가 보관시설로 입고됩니다'];note.textContent=stage[this.harborStep-1]||'';}
};
window.KAFV_RPG_V102={version:'1.0.2',basis:'v1.0.1',scope:'배경 중복 냉장고 제거·배경/캐릭터 레이어 구분·좌측 제어 분리·말풍선 소형화·상인 동반 이동·입출고 및 하역 시각상태',status:'회귀검수 대상'};
})();
