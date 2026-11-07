/* v1.0.10 · PASS-preserving object-anchored shop controls.
   Only move the existing working logistics button and exit hotspots.
   01..14 seafood shops: buy action above actual cold/freezer doors.
   15 gear shop: buy action beside the traceability board, near dry inventory.
   Exit: only at the actual left door, never in a duplicated top toolbar.
*/
(()=>{'use strict';
 const P=window.KAFV_MarketRPG?.prototype;
 if(!P||!window.KAFV_RPG_V109)throw Error('v1.0.9 baseline required');
 const oldEnter=P.enterStore;
 P.enterStore=function(...args){
   oldEnter.apply(this,args);
   if(this.scene!=='store'||!this.world)return;
   const gear=this.store()?.n==='장목선구점';
   const w=this.world, bar=this.app?.querySelector('.gv109-routebar');
   // Preserve the EXACT original button element and its click handler. Reparent
   // it before deleting the v1.0.9 navigation row to avoid event loss.
   const buy=bar?.querySelector('.gv108-store-supply')||w.querySelector('.gv108-store-supply');
   if(buy){
     w.appendChild(buy);
     buy.classList.add('gv110-supply');
     buy.textContent=gear?'📦 항구·창고 매입':'⚓ 항구·창고 매입';
     buy.setAttribute('aria-label',gear?'선구용품 재고: 항구·창고에서 매입':'냉장·냉동 보관고: 항구·창고에서 매입');
     buy.title=gear?'선구용품 재고 옆 · 항구와 창고의 어구·포장자재 매입':'냉장·냉동 보관고 위 · 항구·창고에서 수산물 매입';
   }
   bar?.remove();
   // The inherited image may contain an exit SIGN; do not draw a second large
   // floating EXIT button over it. Keep the click zone restricted to glass door.
   const door=w.querySelector('.gv109-door-click');
   if(door){
     door.classList.add('gv110-door');door.textContent='';
     const label=document.createElement('span');label.className='gv110-exit-label';
     label.textContent=gear?'시장 나가기':'시장으로 나가기';
     door.append(label);
     door.setAttribute('aria-label','왼쪽 점포 출입문 클릭: 시장으로 나가기');
     door.title='출입문으로 시장에 나가기';
   }
   // The previous scene already has the verified back-rack, cash desk, scale,
   // stocking and cold/freezer handlers. Do not move or re-create any of them.
   w.classList.toggle('gv110-gear',gear);
   w.classList.toggle('gv110-fish',!gear);
   // Equipment stock is REAL, shared store inventory—not separate decorative counts.
   // Fill only the visible empty cubbies at the RIGHT of the accepted gear shop;
   // never draw over the lot/label inspection board or shop actors.
   if(gear){
     const stockroom=document.createElement('section');stockroom.className='gv110-gear-stockroom';
     stockroom.setAttribute('aria-label','선구용품 재고 보관함');
     const cap=document.createElement('div');cap.className='gv110-gear-stockroom-label';
     cap.textContent='📦 선구용품 재고 · 8품목';stockroom.append(cap);
     const coords=[[968,244],[1108,244],[968,362],[1108,362],[1248,362],[1388,362],[968,480],[1108,480]];
     this.stock.slice(0,8).forEach((p,j)=>{
       const b=document.createElement('button');b.type='button';b.className='gv110-stockcard';
       b.dataset.stockIndex=String(j);b.style.left=coords[j][0]+'px';b.style.top=coords[j][1]+'px';
       b.setAttribute('aria-label',p.name+' · 선구용품 재고 보관함에서 상품정보 선택');
       b.title=p.name+' · 재고 '+p.qty+'개';
       b.innerHTML='<span class="gv110-stockicon"></span><strong class="gv110-stockname"></strong><small class="gv110-stockqty"></small>';
       b.querySelector('.gv110-stockicon').textContent=p.emoji||'📦';
       b.querySelector('.gv110-stockname').textContent=p.name;
       b.querySelector('.gv110-stockqty').textContent='재고 '+p.qty;
       b.addEventListener('click',e=>{e.stopPropagation();this.playFx?.('select');this.openProduct(j)});
       stockroom.append(b);
     });
     w.append(stockroom);
   }
 };
 // Keep the eight rear storage cubbies synchronized with every purchase/sale.
 const oldUpdate=P.updateStockUI;
 P.updateStockUI=function(...a){
   const val=oldUpdate.apply(this,a);
   if(this.scene==='store'&&this.world?.classList.contains('gv110-gear')){
     this.world.querySelectorAll('.gv110-stockcard').forEach(b=>{
       const p=this.stock?.[Number(b.dataset.stockIndex)];if(!p)return;
       b.querySelector('.gv110-stockqty').textContent='재고 '+p.qty;
       b.title=p.name+' · 재고 '+p.qty+'개';
     });
   }
   return val;
 };
 window.KAFV_RPG_V110={version:'1.0.10',baseline:'1.0.9',approvedHarbor:'1.0.6',goal:'door and store-specific supply location'};
})();
