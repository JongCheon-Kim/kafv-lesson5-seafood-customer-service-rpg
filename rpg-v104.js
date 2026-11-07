/* KAFV v1.0.4 | Regression patch from verified v1.0.3. */
(()=>{'use strict';
const Game=window.KAFV_MarketRPG;if(!Game)throw Error('Missing v1.0.3 engine');const P=Game.prototype;
const original={renderShell:P.renderShell,enterStore:P.enterStore,renderMarket:P.renderMarket,drawProductPanel:P.drawProductPanel,setAudio:P.setAudio,destroy:P.destroy};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const refreshMusic=g=>{const b=g.app?.querySelector('[data-ui="bgm"]');if(b){b.textContent=g.soundOn?'♫ 음악 끄기':'♫ 음악 켜기';b.setAttribute('aria-pressed',String(!!g.soundOn));}const sb=document.getElementById('sim-audio-toggle');if(sb)sb.textContent=g.soundOn?'♫ 배경음악 끄기':'♫ 배경음악 켜기';};
P.renderShell=function(){original.renderShell.call(this);
  const aside=document.querySelector('#simulator-screen .gv-output-report');aside?.remove();this.outputPanel=null;
  const acts=this.app?.querySelector('.gv-actions');if(acts&&!acts.querySelector('[data-ui="bgm"]')){
    const b=document.createElement('button');b.type='button';b.className='gv-bgm-button';b.dataset.ui='bgm';b.textContent='♫ 음악 켜기';b.setAttribute('aria-pressed','false');
    acts.prepend(b);
    b.addEventListener('click',ev=>{ev.stopImmediatePropagation();this.setAudio(!this.soundOn,this.volume||.25)},true);
  }
  refreshMusic(this);
};
P.renderMarket=function(){original.renderMarket.call(this);const shopper=this.world.querySelector('.gv-tinyshopper');if(shopper){shopper.setAttribute('draggable','false');shopper.style.transform='translate3d(0,0,0)'}};
P.enterStore=function(i=0){original.enterStore.call(this,i);
  if(this.scene!=='store')return;
  const image=this.sellerEl?.querySelector('img');if(image){image.src='game-art/seller_full_v104.png';image.alt='전신 판매자 캐릭터';}
  this.sellerPos={x:791,y:724};this.placeActors();
  const prev=this.world.querySelector('.gv-original-scale-cover');if(prev)prev.setAttribute('aria-label','배경과 분리된 위생 작업대');
};
P.drawProductPanel=function(p,page){original.drawProductPanel.call(this,p,page);
  const el=this.world?.querySelector('#gv-detail');if(!el||el.hidden)return;
  const lines=el.querySelector('.gv-panelproduct .gv-panellines');if(!lines)return;
  if(page%4===1){
    const rows=[['원산지',p.origin||'가상 원산지'],['생산자',p.producer||'KAFV 가상생산조합'],['가공업체',p.processor||'KAFV 가상 가공업체'],['입고일',p.arrival||'2026-11-07'],['로트번호',p.lot||'SIM-LOT-001'],['상품 상태',p.kind||'가상 상품'],['이력 검증','게임 내 가상 입고대장과 일치'],['자료 구분','교육용 시뮬레이션 값']];
    lines.innerHTML=rows.map(([k,v])=>`<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');
    let hint=el.querySelector('.gv-provenance-hint');if(!hint){hint=document.createElement('div');hint.className='gv-provenance-hint';el.querySelector('nav')?.after(hint)}hint.textContent='↕ 아래 내용을 마우스 휠·터치로 스크롤해 확인하세요';
  }else el.querySelector('.gv-provenance-hint')?.remove();
  const inner=el.querySelector('.gv-panelproduct');if(inner){inner.scrollTop=0;inner.setAttribute('tabindex','0');inner.setAttribute('aria-label','상품 상세정보, 위아래로 스크롤 가능');}
};
P.setAudio=function(on,vol){
  // Suppress previous oscillator test BGM; use one packaged original ambient loop.
  original.setAudio.call(this,false,vol);
  this.soundOn=!!on;this.volume=Math.max(0,Math.min(1,Number(vol??this.volume??.25)));
  if(!this._v104audio){this._v104audio=new Audio('game-art/kafv_original_ambient.wav');this._v104audio.loop=true;this._v104audio.preload='auto';}
  const a=this._v104audio;a.volume=this.volume*.62;
  if(this.soundOn){const p=a.play();if(p?.catch)p.catch(()=>{this.soundOn=false;refreshMusic(this);this.note?.('브라우저의 음향 권한을 확인하고 ♫ 음악 켜기를 다시 누르세요.');});}
  else a.pause();refreshMusic(this);
};
P.destroy=function(){this._v104audio?.pause();this._v104audio=null;original.destroy.call(this)};
window.KAFV_RPG_V104={version:'1.0.4',status:'사용자 현장 재검수 전 시범본',rightReport:false,provenanceScroll:true,sellerFullBody:true,originalBgm:true};
})();
