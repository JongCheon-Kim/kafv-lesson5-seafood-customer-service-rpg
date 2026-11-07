/* KAFV v1.0.9: fixed non-overlapping shop routing, shared door action,
   actual inbound stock to cold/frozen storage and 3-of-3 physical harbor cargo.
   v1.0.8 media, shop images, missions, approved v1.0.6 harbor are untouched.
*/
(()=>{'use strict';
const Game=window.KAFV_MarketRPG,P=Game?.prototype,STORES=window.KAFV_RPG_STORES||[];
if(!P||!window.KAFV_RPG_V108)throw Error('v1.0.8 required');
const previous={enterStore:P.enterStore,returnMarket:P.returnMarket,renderMarket:P.renderMarket,goHarbor:P.goHarbor,updateStockUI:P.updateStockUI,transferStock:P.transferStock};
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function isGear(store){return store?.n==='장목선구점'}
function destination(store,product){
 if(isGear(store))return 'rack';
 const n=product?.name||'',kind=store?.kind||'';
 // Category precedence: cold/frozen seafood is never accidentally stocked as
 // dry goods merely because the label includes '포장' (e.g. 포장전복).
 if(/냉동|동태|냉동새우|냉동오징어|냉동수산/.test(n)||/냉동/.test(kind))return 'freezer';
 if(/건어물/.test(kind)||/건미역|건다시마|건톳|건오징어|황태|멸치|말린|건조|조미김/.test(n))return 'rack';
 return 'cold';
}
function restorePending(g,i){
 const pending=g.supply?.pending?.[i];
 if(!pending)return {};
 // Remove before v1.0.8 enters: its restore() would otherwise add every unit
 // straight to display inventory, bypassing the cold/frozen storage.
 delete g.supply.pending[i];return pending;
}
function placeIn(g,storeIndex,name,n,target){
 const store=STORES[storeIndex];if(!store)return 'none';
 const isActive=g.scene==='store'&&g.storeIndex===storeIndex;
 const cache=isActive?g:(g.shopCache?.[storeIndex]||null);
 if(!cache){
  const p=g.supply.pending[storeIndex]||(g.supply.pending[storeIndex]={});
  p[name]=(p[name]||0)+n;return destination(store,{name});
 }
 const p=cache.stock?.find(x=>x.name===name);
 if(!p)return 'none';
 const which=target||destination(store,p);
 if(which==='rack'){p.qty+=n;}
 else{
  const box=which==='freezer'?'freezer':'cold';
  if(!cache[box])cache[box]={door:false,items:[]};
  const items=cache[box].items|| (cache[box].items=[]);
  for(let k=0;k<n;k++)items.push({...p,qty:1,weight:p.weight||.5,lot:'JM-'+String(name).replace(/\s/g,'').slice(0,5)+'-261107',prestock:false});
 }
 if(isActive)g.updateStockUI();
 return which;
}
// v1.0.9 shop-specific pixel-registered hit areas (world art: 1672 x 800).
// No generic rectangular hit areas over blank photographs or the characters.
function alignVisualTargets(g){
 if(g.scene!=='store')return;
 const w=g.world,gear=isGear(STORES[g.storeIndex]);
 w.querySelector('.gv-backdrop-hits')?.remove();
 w.querySelector('.gv109-precision-hits')?.remove();
 w.querySelector('.gv109-pointer-tip')?.remove();
 if(gear){
  // The equipment shop has eight visible product cards mapped 1:1 to its rack art.
  w.querySelectorAll('.gv-gear-product').forEach((node,i)=>{
   node.title=`${g.stock[i]?.name||'선구용품'} · 규격·수량·단가 확인`;
   node.setAttribute('aria-label',`${g.stock[i]?.name||'용품'} 선택 · 진열물`);
  });
  return;
 }
 // Exact visible objects in the inherited PASS photograph. The back rack packs
 // occupy x=220..410 and y=312..439. Their 2-by-2 layout is visually grounded.
 const hits=[
  {id:'r0',kind:'product',idx:0,name:'후면 진열장 윗칸 왼쪽',x:222,y:313,w:71,h:51},
  {id:'r1',kind:'product',idx:1,name:'후면 진열장 윗칸 오른쪽',x:308,y:313,w:83,h:51},
  {id:'r2',kind:'product',idx:2,name:'후면 진열장 아래칸 왼쪽',x:221,y:373,w:74,h:61},
  {id:'r3',kind:'product',idx:0,name:'후면 진열장 아래칸 오른쪽',x:307,y:374,w:83,h:60},
  // Physical scale's visible stainless tray and front display.
  {id:'scale',kind:'action',action:'scale',name:'저울 · 계량 접시',x:758,y:473,w:135,h:87},
  // The actual packing bench and receipt terminal in the approved backdrop.
  {id:'pack',kind:'action',action:'packing',name:'손질·포장대',x:1210,y:508,w:167,h:119},
  {id:'pay',kind:'action',action:'checkout',name:'계산대 · 결제단말기',x:1440,y:407,w:193,h:137}
 ];
 const layer=document.createElement('div');layer.className='gv109-precision-hits';layer.setAttribute('aria-label','실제 진열장과 작업설비 선택 영역');
 const tip=document.createElement('div');tip.className='gv109-pointer-tip';tip.setAttribute('role','status');tip.hidden=true;
 for(const h of hits){
  const b=document.createElement('button');b.type='button';b.className='gv109-precision-hit '+(h.kind==='product'?'gv109-rear-stock':'gv109-workstation');
  Object.assign(b.style,{left:h.x+'px',top:h.y+'px',width:h.w+'px',height:h.h+'px'});
  const name=h.kind==='product'?g.stock[h.idx]?.name:h.name;
  b.setAttribute('aria-label',`${h.name} · ${name||'상품'} 선택`);b.title=`${h.name} · ${name||'상품'} 확인`;
  b.dataset.object=h.id;
  b.addEventListener('click',e=>{e.stopPropagation();if(h.kind==='product')g.openProduct(h.idx);else g.action(h.action)});
  const show=()=>{
   tip.textContent=h.kind==='product'?`📦 ${name||'상품'} · 후면 진열`:h.name;
   tip.style.left=Math.max(6,Math.min(1495,h.x+(h.w/2)-80))+'px';
   tip.style.top=(h.y>80?h.y-34:h.y+h.h+5)+'px';tip.hidden=false;
  };
  b.addEventListener('pointerenter',show);b.addEventListener('focus',show);
  b.addEventListener('pointerleave',()=>{tip.hidden=true});b.addEventListener('blur',()=>{tip.hidden=true});
  layer.append(b);
 }
 w.append(layer,tip);
 // Foreground cards remain exactly over the foreground fish counter, not the rear rack.
 w.querySelectorAll('.gv-product').forEach((b,i)=>{
  b.title=`${g.stock[i]?.name||'상품'} · 앞쪽 진열대에서 선택`;
  b.setAttribute('aria-label',`${g.stock[i]?.name||'상품'} · 앞쪽 진열 상품 확인`);
 });
 for(const [cls,label] of [['.gv-scale','계량기'],['.gv-packing','손질·포장대'],['.gv-checkout','계산대']]){
  const b=w.querySelector(cls);if(b){b.title=`${label} 선택 · 사진 속 설비와 연결`;b.setAttribute('aria-label',`${label} 동작`)}
 }
}
function showCounts(g){
 const root=g.app?.querySelector('.gv109-routebar');if(!root)return;
 const label=root.querySelector('.gv109-route-status');if(!label)return;
 const c=g.cold?.items?.length||0,f=g.freezer?.items?.length||0;
 label.textContent=isGear(STORES[g.storeIndex])?'📦 용품·자재는 진열·자재 재고로 입고':'❄ 냉장 '+c+'개 · 냉동 '+f+'개 · 보관고에서 선택 출고';
}
function removeRoute(g){g.app?.querySelector('.gv109-routebar')?.remove();}
P.enterStore=function(i=0){
 removeRoute(this);
 // Regression fix: the equipment shop adds a class to the persistent world node;
 // clear it before entering any other shop or all rear-rack hit areas disappear.
 if(!isGear(STORES[i]))this.world?.classList.remove('gv-gear-shop');
 const keep=restorePending(this,i);
 previous.enterStore.call(this,i);
 if(this.scene!=='store')return;
 for(const [name,num] of Object.entries(keep))placeIn(this,i,name,Number(num));
 // Move the ORIGINAL, already tested supply button out of the scene into
 // a dedicated row: no photo prop, product, refrigerator, person or dialog is covered.
 const supply=this.world.querySelector('.gv108-store-supply');
 const toolbar=document.createElement('nav');toolbar.className='gv109-routebar';
 toolbar.setAttribute('aria-label','점포 출입 및 매입');
 toolbar.innerHTML='<button type="button" class="gv109-exit" aria-label="출입문으로 이동하여 시장으로 나가기">🚪 시장으로 나가기</button><span class="gv109-route-status" role="status"></span>';
 const viewport=this.app.querySelector('.gv-viewport');viewport?.before(toolbar);
 toolbar.querySelector('.gv109-exit').onclick=()=>this.action('exit');
 if(supply){supply.textContent=isGear(STORES[i])?'⚓ 창고·선구용품 매입':'⚓ 항구·창고 매입';toolbar.append(supply);}
 // The actual exit is a doorway: both the entrance door's clickable zone
 // and toolbar '시장으로 나가기' invoke the same built-in door animation.
 const door=this.world.querySelector('.gv-exit');
 if(door){door.textContent='↶ 시장으로 나가기';door.setAttribute('title','가게 출입문을 통해 시장으로 나가기');}
 {
  // A single physical left-side exit is sufficient; the original large overlay
  // remains in the DOM for the old action contract but is no longer rendered.
  const doorHit=document.createElement('button');doorHit.type='button';doorHit.className='gv109-door-click'+(isGear(STORES[i])?' gv109-gear-door':'');
  doorHit.setAttribute('aria-label','왼쪽 점포 출입문: 시장으로 나가기');
  doorHit.title='점포 출입문 클릭 · 시장으로 나가기';doorHit.onclick=()=>this.action('exit');this.world.append(doorHit);
 }
 showCounts(this);
 alignVisualTargets(this);
};
P.updateStockUI=function(){previous.updateStockUI.call(this);if(this.scene==='store')showCounts(this);};
P.returnMarket=function(){removeRoute(this);return previous.returnMarket.call(this)};
P.renderMarket=function(){removeRoute(this);return previous.renderMarket.call(this)};
P.goHarbor=function(){removeRoute(this);previous.goHarbor.call(this);
 if(this.scene==='harbor'){
  const stack=this.world.querySelector('.gv106-cargoStack');
  if(stack&&stack.children.length===2){stack.append(document.createElement('i'))}
  const status=this.world.querySelector('#gv106-stageinfo');if(status)status.setAttribute('aria-live','polite');
 }
};
P.transferStock=function(source,name,target,count=1){
 const n=Number(count),t=Number(target),st=STORES[t];
 if(!['warehouse','harbor'].includes(source)||!st||!Number.isInteger(n)||n<1||!st.fish.includes(name))return false;
 const rec=this.supply?.[source]?.find(x=>x.name===name);
 if(!rec||rec.qty<n){this.note('출고 가능 재고가 부족합니다.');return false;}
 rec.qty-=n;
 const place=placeIn(this,t,name,n);
 const loc=place==='cold'?'냉장보관고':place==='freezer'?'냉동보관고':'진열·자재 재고';
 this.supply.journal.unshift({time:new Date().toISOString(),desc:`${source==='harbor'?'항구 하역장':'항구 창고'} → ${st.n} ${loc}: ${name} ${n}개`});
 this.supply.journal.length=Math.min(this.supply.journal.length,60);
 this.note(`${st.n} · ${name} ${n}개 → ${loc} 입고 (출고처 잔량 ${rec.qty}개)`);
 this.playFx?.('cart');
 if(this.scene==='store'&&this.storeIndex===t)this.updateStockUI();
 return true;
};
window.KAFV_RPG_V109={version:'1.0.9',base:'1.0.8',approvedHarbor:'1.0.6',masterLock:false};
})();
