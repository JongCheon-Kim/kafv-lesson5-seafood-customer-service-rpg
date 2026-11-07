/* KAFV v1.0.12 | isolated photo/actor cleanup + spatial hit registration.
   Curriculum, mission logic, logistics controller, existing real buttons unchanged.
*/
(()=>{'use strict';
const P=window.KAFV_MarketRPG?.prototype;
if(!P||!window.KAFV_RPG_V110)throw Error('v1.0.11 base with v1.0.10 controls required');
const previousEnter=P.enterStore,previousMap=P.mapArea,previousWalk=P.walkTo;
const coords={
 r0:[220,314,73,52],r1:[307,314,86,52],r2:[220,373,75,62],r3:[307,373,86,62],
 scale:[750,470,144,103],pack:[1211,500,174,126],pay:[1432,406,200,148]
};
function registerTargets(g){
 const w=g.world;if(!w||g.scene!=='store')return;
 w.classList.add('gv112-registered');
 if(w.classList.contains('gv-gear-shop')){w.classList.add('gv112-gear');return;}
 for(const [id,quad] of Object.entries(coords)){
   const hit=w.querySelector('.gv109-precision-hit[data-object="'+id+'"]');
   if(!hit)continue;
   Object.assign(hit.style,{left:quad[0]+'px',top:quad[1]+'px',width:quad[2]+'px',height:quad[3]+'px'});
   hit.dataset.qaHit=id;
 }
 const sceneTags=[['scale','저울 · 계량 접시'],['pack','손질·포장대'],['pay','계산대 · 결제단말기']];
 for(const [id,label] of sceneTags){
   const hit=w.querySelector('.gv109-precision-hit[data-object="'+id+'"]');
   if(hit){hit.setAttribute('aria-label',label+' · 실제 사진 연결');hit.title=label+' 클릭';}
 }
 // Canonical object bounds shared by click targets and visual furniture.
 const label=w.querySelector('.gv-scale');if(label)label.title='실제 계량 접시/표시창 선택';
 const pack=w.querySelector('.gv-packing');if(pack)pack.title='실제 손질·포장대 선택';
 const pay=w.querySelector('.gv-checkout');if(pay)pay.title='실제 계산대 선택';
}
P.walkTo=async function(target){
 const pending=previousWalk.call(this,target);
 if(this.scene==='store'&&this.sellerEl){
   const x=({product0:689,product1:704,product2:724,scale:706,cold:888,freezer:1167,
     checkout:1368,packing:1154,person:689,door:359})[target]||689;
   this.sellerPos={x,y:780};this.placeActors();
 }
 return await pending;
};
P.mapArea=function(...args){const x=previousMap.apply(this,args);
 const b=this.app?.querySelector('#gv-where');
 if(this.scene==='store'&&b)b.textContent=b.textContent.replace(/중도매인|소매인|판매자/g,'상인');
 return x;
};
P.enterStore=function(...args){
 const x=previousEnter.apply(this,args);
 if(this.scene!=='store')return x;
 const role=this.world.querySelector('.gv-seller .gv-role');if(role)role.textContent='상인';
 const img=this.world.querySelector('.gv-seller img');if(img)img.alt='상인 캐릭터';
 const actor=this.world.querySelector('.gv-seller');if(actor)actor.setAttribute('aria-label','상인에게 질문');
 this.sellerPos={x:689,y:780};this.placeActors();
 this.mapArea();registerTargets(this);
 return x;
};
window.KAFV_RPG_V112={version:'1.0.12',baseline:'1.0.11',approvedHarbor:'1.0.6',masterLock:false};
})();
