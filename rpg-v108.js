/* v1.0.8 — additive logistics on v1.0.6 approved harbor + v1.0.5 shops.
   Invariants: do NOT replace the approved harbor background or fishing boat; no extra BGM player.
   No floating 'virtual lot' sprite: lot is an inventory data property, not a physical object.
*/
(()=>{'use strict';
const Game=window.KAFV_MarketRPG, P=Game?.prototype, STORES=window.KAFV_RPG_STORES||[];
if(!P||!window.KAFV_RPG_V106||!window.KAFV_RPG_V105)throw Error('Requires v1.0.5 store and v1.0.6 approved harbor');
const previous={renderShell:P.renderShell,goHarbor:P.goHarbor,enterStore:P.enterStore,resetShopState:P.resetShopState,
 renderMarket:P.renderMarket,returnMarket:P.returnMarket,updateStockUI:P.updateStockUI,
 showColdPanel:P.showColdPanel,retrieveItem:P.retrieveItem,storeItem:P.storeItem,toggleCold:P.toggleCold};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const qty=x=>Number(x||0).toLocaleString('ko-KR');
const groupFor=(store,name)=>store?.n==='장목선구점'?(/박스|비닐|포장/.test(name)?'포장·보냉자재':/장갑|장화/.test(name)?'작업·안전용품':'어구·작업도구'):(store?.kind||'수산물');
const groups=[...new Set(STORES.map(x=>x.kind))];
function makeLot(name,q=0){return {name,qty:q,lot:'JM-'+name.replace(/[^가-힣a-zA-Z0-9]/g,'').slice(0,4)+'-261107',origin:'게임 가상재고'}}
function seed(){
 const names=[...new Set(STORES.flatMap(s=>s.fish))];
 const warehouse=names.map((n,i)=>makeLot(n,4+(i%4)));
 return {harbor:[],warehouse, pending:{},journal:[],shipments:0};
}
function addLots(items,name,n){let rec=items.find(x=>x.name===name);if(!rec){rec=makeLot(name);items.push(rec)}rec.qty+=n;return rec.qty}
function journal(g,msg){g.supply.journal.unshift({time:new Date().toISOString(),desc:msg});g.supply.journal.length= Math.min(60,g.supply.journal.length)}
function save(g){if(g.scene!=='store')return;g.shopCache[g.storeIndex]={stock:g.stock,cold:g.cold,freezer:g.freezer,cart:g.cart,holding:g.holding,scaleItem:g.scaleItem}}
function restore(g){const c=g.shopCache[g.storeIndex];if(c){Object.assign(g,{stock:c.stock,cold:c.cold,freezer:c.freezer,cart:c.cart,holding:c.holding,scaleItem:c.scaleItem})}
 else if(g.storeIndex!==14){let a=g.stock[0],b=g.stock[1]||a;
  g.cold={door:false,items:[{...a,weight:a.weight,lot:'COLD-'+g.storeIndex+'-01',prestock:true}]};
  g.freezer={door:false,items:[{...b,weight:b.weight,lot:'FROZEN-'+g.storeIndex+'-01',prestock:true}]};
 }
 const pen=g.supply.pending[g.storeIndex]||{};
 for(const [n,k] of Object.entries(pen)){let p=g.stock.find(x=>x.name===n);if(p)p.qty+=k}
 delete g.supply.pending[g.storeIndex];g.updateStockUI();
}
function sprite(g,label,kind){if(!g.world||!['store','harbor'].includes(g.scene))return;
 const e=document.createElement('div');e.className='gv108-transfer gv108-transfer-'+kind;e.textContent='📦 '+label;g.world.append(e);
 requestAnimationFrame(()=>requestAnimationFrame(()=>e.classList.add('travelling')));setTimeout(()=>e.remove(),1400);
}
function ping(g,name){g.playFx?.(name)}
P.renderShell=function(){this.supply=this.supply||seed();this.shopCache=this.shopCache||{};previous.renderShell.call(this);
 const subtitle=this.app?.querySelector('.gv-brand small');if(subtitle)subtitle.textContent='제5차시 · 고객응대와 판매서비스 · 현장실습';
 const legal=this.app?.querySelector('.gv-disclaimer');if(legal)legal.textContent='※ 가격·원산지·상품이력·거래는 게임 시뮬레이션 값이며 실제 거래나 품질·안전판정이 아닙니다.';
};
P.resetShopState=function(){previous.resetShopState.call(this);restore(this)};
P.enterStore=function(i=0){save(this);previous.enterStore.call(this,i);if(this.scene!=='store')return;
 const link=document.createElement('button');link.type='button';link.className='gv108-store-supply';link.textContent=this.storeIndex===14?'⚓ 창고·선구용품 매입':'⚓ 항구·창고 매입';
 link.setAttribute('aria-label','항구와 창고에서 상품 매입');link.addEventListener('click',()=>{ping(this,'select');this.openSupplyPanel('store')});this.world.append(link);
 this.updateStockUI();
};
P.returnMarket=function(){save(this);previous.returnMarket.call(this)};
P.renderMarket=function(){save(this);previous.renderMarket.call(this);
 const title=this.world?.querySelector('.gv-market-hdr b');if(title)title.textContent='장목수산컴플렉스 · 수산시장 실습';
};
P.goHarbor=function(){save(this);previous.goHarbor.call(this);if(this.scene!=='harbor')return;
 this._v108shipped=false;
 const h=this.world.querySelector('.gv106-harbor');if(!h)return;
 // Static dock-mounted lifting structure; the moving cable and cargo are separate objects.
 const crane=document.createElement('div');crane.className='gv108-quay-crane';
 crane.setAttribute('aria-hidden','true');
 crane.innerHTML='<span class="gv108-crane-pillar"></span><span class="gv108-crane-boom"></span><span class="gv108-crane-carriage"></span><span class="gv108-crane-base"></span>';
 h.append(crane);
 const b=document.createElement('button');b.type='button';b.className='gv108-port-supply';b.textContent='📦 창고·점포 물류 연결';b.onclick=()=>this.openSupplyPanel('harbor');h.append(b);
};
P.completeHarborCargo=function(){if(this._v108shipped)return;
 this._v108shipped=true;this.supply.shipments++;
 addLots(this.supply.harbor,'광어',6);addLots(this.supply.harbor,'우럭',4);addLots(this.supply.harbor,'고등어',5);
 journal(this,'접안·검수 완료: 광어 6, 우럭 4, 고등어 5 입고대기');
 const h=this.world.querySelector('.gv106-harbor');h?.querySelector('.gv108-port-supply')?.classList.add('ready');
 this.note('하역이 완료되었습니다. 창고·점포 물류 연결에서 입고처를 선택하세요.');
};
P.transferStock=function(source,name,target,count=1){
 const n=Number(count),t=Number(target),st=STORES[t];
 if(!['warehouse','harbor'].includes(source)||!st||!Number.isInteger(n)||n<1||!st.fish.includes(name))return false;
 const rec=this.supply[source].find(x=>x.name===name);if(!rec||rec.qty<n){this.note('출고 재고가 부족합니다.');return false;}
 rec.qty-=n;
 if(this.scene==='store'&&this.storeIndex===t){let p=this.stock.find(p=>p.name===name);if(p)p.qty+=n;}
 else if(this.shopCache[t]){let p=this.shopCache[t].stock.find(p=>p.name===name);if(p)p.qty+=n;}
 else{const pen=this.supply.pending[t]||(this.supply.pending[t]={});pen[name]=(pen[name]||0)+n;}
 journal(this,`${source==='harbor'?'항구 하역장':'항구 창고'} → ${st.n} · ${name} ${n}개`);
 this.note(`${st.n}에 ${name} ${n}개 입고 · 출고처 재고 ${rec.qty}개`);ping(this,'cart');sprite(this,name,'store');this.updateStockUI();return true;
};
P.transferWarehouse=function(name,count=1){let n=Number(count),rec=this.supply.harbor.find(x=>x.name===name);
 if(!Number.isInteger(n)||n<1||!rec||rec.qty<n){this.note('항구 하역장에 상품이 부족합니다.');return false;}
 rec.qty-=n;const target=addLots(this.supply.warehouse,name,n);
 journal(this,`하역장 → 항구 창고 · ${name} ${n}개`);ping(this,'stamp');sprite(this,name,'warehouse');
 this.note(`창고 입고 ${n}개 · ${name} 창고 재고 ${target}개`);return true;
};
function supplyPanel(g,title){g.world.querySelector('.gv108-supply-panel')?.remove();let panel=document.createElement('section');panel.className='gv108-supply-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label',title);
 panel.innerHTML=`<header><strong>${esc(title)}</strong><button type="button" class="gv108-close" aria-label="창 닫기">×</button></header><div class="gv108-body"></div>`;
 g.world.append(panel);panel.querySelector('.gv108-close').onclick=()=>panel.remove();return panel;
}
P.openSupplyPanel=function(mode='store',selection={}){
 const g=this;if(!this.supply)this.supply=seed();const isStore=mode==='store';
 let from=selection.from||(isStore?'warehouse':'harbor');if(!['warehouse','harbor'].includes(from))from='warehouse';
 const dest=isStore?String(this.storeIndex):(selection.dest??'warehouse');
 const d=dest==='warehouse'?'warehouse':Number(dest);
 const store=dest==='warehouse'?null:STORES[d];
 const all=store?store.fish:[...new Set(this.supply[from].map(x=>x.name))];
 const kindEntries=store?all.map(n=>[n,groupFor(store,n)]):all.map(n=>[n,STORES.find(s=>s.fish.includes(n))?.kind||'수산물']);
 const cats=[...new Set(kindEntries.map(x=>x[1]))];
 let cat=selection.cat&&cats.includes(selection.cat)?selection.cat:(cats[0]||'전체 품목');
 const filtered=kindEntries.filter(([,k])=>k===cat).map(([n])=>n);
 let name=selection.name&&filtered.includes(selection.name)?selection.name:(filtered[0]||'');
 const item=this.supply[from].find(x=>x.name===name),have=item?.qty||0;
 const max=Math.min(99,have),count=Math.max(1,Math.min(max||1,Number(selection.count)||1));
 const title=isStore?this.store().n+' · 항구·창고 매입':'항구·창고 물류 연결';
 const panel=supplyPanel(this,title);
 const shopOptions=STORES.map((x,i)=>`<option value="${i}" ${Number(d)===i&&dest!=='warehouse'?'selected':''}>${String(i+1).padStart(2,'0')} · ${esc(x.n)} (${esc(x.kind)})</option>`).join('');
 const sourceOps=['harbor','warehouse'].map(k=>`<option value="${k}" ${k===from?'selected':''}>${k==='harbor'?'🚢 항구 하역장':'🏭 항구 창고'}</option>`).join('');
 const destOpts=isStore?`<strong class="gv108-destination">${esc(this.store().n)}</strong>`:`<select id="gv108-dest" aria-label="입고처 점포 선택"><option value="warehouse" ${dest==='warehouse'?'selected':''}>🏭 항구 창고</option>${shopOptions}</select>`;
 panel.querySelector('.gv108-body').innerHTML=`<p class="gv108-help">출고처와 입고처를 정하면 품목군·상품이 자동으로 정리됩니다. 아래 화살표를 눌러 선택하세요.</p>
 <div class="gv108-form">
  <label>① 출고처 <select id="gv108-from">${sourceOps}</select></label>
  <label>② 입고처 ${destOpts}</label>
  <label>③ ${store?.n==='장목선구점'?'장비·자재군':'품목군'} <select id="gv108-cat" ${cats.length?'':'disabled'}>${cats.map(k=>`<option ${k===cat?'selected':''}>${esc(k)}</option>`).join('')}</select></label>
  <label>④ 품목·장비 <select id="gv108-item" ${filtered.length?'':'disabled'}>${filtered.map(x=>`<option ${x===name?'selected':''}>${esc(x)}</option>`).join('')}</select></label>
  <label>⑤ 수량 <input id="gv108-qty" type="number" min="1" max="${max||1}" step="1" value="${count}" ${have?'':'disabled'}></label>
 </div>
 <div class="gv108-stock"><div><span>출고처 재고</span><strong>${qty(have)}개</strong></div><div><span>이동 상품</span><strong>${esc(name||'없음')}</strong></div><div><span>도착지</span><strong>${esc(store?.n||'항구 창고')}</strong></div></div>
 <button type="button" class="gv108-execute" id="gv108-apply" ${!have||from===dest?'disabled':''}>${dest==='warehouse'?'🏭 창고에 입고':'📦 선택 상품을 점포로 이동'} · ${count}개</button>
 ${!filtered.length?'<p class="gv108-warning">해당 출고처·점포의 선택 가능한 품목이 없습니다.</p>':!have?'<p class="gv108-warning">현재 출고처 재고가 없습니다. 다른 품목이나 공급처를 선택하세요.</p>':''}
 <div class="gv108-ledger"><strong>최근 이동기록</strong><div>${this.supply.journal.slice(0,4).map(x=>`<p>${esc(x.desc)}</p>`).join('')||'<p>아직 이동기록이 없습니다.</p>'}</div></div>`;
 const get=()=>({from:panel.querySelector('#gv108-from').value,dest:isStore?String(g.storeIndex):panel.querySelector('#gv108-dest').value,cat:panel.querySelector('#gv108-cat')?.value||'',name:panel.querySelector('#gv108-item')?.value||'',count:Number(panel.querySelector('#gv108-qty')?.value)||1});
 const reset=(override={})=>g.openSupplyPanel(mode,{...get(),...override});
 panel.querySelector('#gv108-from').onchange=()=>reset({cat:null,name:null});
 panel.querySelector('#gv108-dest')?.addEventListener('change',()=>reset({cat:null,name:null}));
 panel.querySelector('#gv108-cat')?.addEventListener('change',()=>reset({name:null}));
 panel.querySelector('#gv108-item')?.addEventListener('change',()=>reset());
 panel.querySelector('#gv108-qty')?.addEventListener('input',()=>{
   const q=panel.querySelector('#gv108-qty'),bt=panel.querySelector('#gv108-apply');
   const value=Math.max(1,Math.min(Number(q.max)||1,Number(q.value)||1));
   bt.textContent=(dest==='warehouse'?'🏭 창고에 입고':'📦 선택 상품을 점포로 이동')+' · '+value+'개';
  });
 panel.querySelector('#gv108-apply').onclick=()=>{
  const t=get();let ok=false;
  if(t.dest==='warehouse'&&t.from==='harbor')ok=g.transferWarehouse(t.name,t.count);
  else if(t.dest!=='warehouse')ok=g.transferStock(t.from,t.name,Number(t.dest),t.count);
  else g.note('출고처와 입고처를 서로 다르게 선택하세요.');
  if(ok)g.openSupplyPanel(mode,t);
 };
 return panel;
};
// Individual cold/frozen shelf items and cart-to-storage actions; preserve the v1.0.5 shop image.
P.showColdPanel=function(type){if(this.storeIndex===14)return previous.showColdPanel.call(this,type);
 const st=this[type],label=type==='cold'?'냉장':'냉동';
 const rows=[['문 상태',st.door?'열림':'닫힘'],['보관 수량',st.items.length+'개'],['보관 상품',st.items.map((p,i)=>`${i+1}. ${p.name}`).join(' / ')||'없음'],['장바구니',this.cart.length+'건']];
 const actions=[{text:st.door?'🚪 문 닫기':'🚪 문 열기',primary:true,fn:()=>this.toggleCold(type)}];
 if(st.door){
  if(this.holding||this.scaleItem)actions.push({text:'선택 상품을 보관고에 넣기',fn:()=>this.storeItem(type)});
  this.cart.forEach((p,i)=>actions.push({text:`🧺 장바구니 ${i+1}. ${p.name} 넣기`,fn:()=>this.storeCartItem(type,i)}));
  st.items.forEach((p,i)=>actions.push({text:`↗ ${p.name} (${i+1}번) 꺼내기`,fn:()=>this.retrieveItem(type,i)}));
 }
 this.showSmall(label+' 보관고 · 자유 입출고',rows,actions);
};
P.storeCartItem=function(type,index){const st=this[type];if(!st?.door)return this.note('보관고 문을 먼저 여세요.');
 const p=this.cart[index];if(!p)return this.note('장바구니에 선택 상품이 없습니다.');
 st.items.push({...p});this.cart.splice(index,1);journal(this,`장바구니 → ${type==='cold'?'냉장':'냉동'}: ${p.name}`);
 this.mark('store');this.updateStockUI();this.showColdPanel(type);ping(this,'open');sprite(this,p.name,type);
};
P.storeItem=function(type){const n=this[type]?.items.length||0,ret=previous.storeItem.call(this,type);
 if(this[type]?.items.length>n){journal(this,`선택 상품 → ${type==='cold'?'냉장':'냉동'}`)}return ret;
};
P.retrieveItem=function(type,index=null){const n=this[type]?.items.length||0,ret=previous.retrieveItem.call(this,type,index);
 if(this[type]?.items.length<n)journal(this,`${type==='cold'?'냉장':'냉동'} → 손님이 상품 꺼냄`);return ret;
};
P.toggleCold=function(type){const r=previous.toggleCold.call(this,type);return r;};
// Clicking an OPEN shelf takes exactly the chosen item. The existing transparent door should not intercept it.
P.updateStockUI=function(){previous.updateStockUI.call(this);if(this.scene!=='store')return;
 this.world.querySelectorAll('[data-storage-index]').forEach(x=>x.setAttribute('title','클릭하여 이 상품 한 개 꺼내기'));
};
P.enterStore.__v108=true;
// Delegate on the game stage, not on the door, so it survives stock UI repaint.
const wrapEnter=P.enterStore;
P.enterStore=function(...args){wrapEnter.apply(this,args);if(this.scene!=='store')return;
 this.world.addEventListener('click',e=>{const b=e.target.closest('[data-storage-index]');if(!b)return;
  const type=b.dataset.storage,index=Number(b.dataset.storageIndex);if(!this[type]?.door)return;
  e.preventDefault();e.stopImmediatePropagation();this.retrieveItem(type,index);ping(this,'select');
 },true);
};
window.KAFV_RPG_V108={version:'1.0.8',baseline:{store:'1.0.5',harbor:'1.0.6',logistics:'1.0.7'},masterLock:false};
})();
