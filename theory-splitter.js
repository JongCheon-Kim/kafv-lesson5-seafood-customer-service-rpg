(()=>{'use strict';
const area=document.getElementById('theory-screen'),bar=document.getElementById('theory-splitter');if(!area||!bar)return;
const key='kafv_q4_theory_left_share_v042',defaultShare=27;
const clamp=v=>Math.max(18,Math.min(57,v));
let stored=defaultShare;try{const n=Number(localStorage.getItem(key));if(Number.isFinite(n)&&n>=18&&n<=57)stored=n;}catch{}
function apply(value,persist=false){const share=clamp(value);area.style.setProperty('--theory-left',share.toFixed(1)+'%');bar.setAttribute('aria-valuenow',String(Math.round(share)));bar.setAttribute('aria-valuetext',`강의록 ${Math.round(share)}퍼센트, 슬라이드 ${Math.round(100-share)}퍼센트`);if(persist)try{localStorage.setItem(key,String(share))}catch{};return share;}
function fromPointer(e){const r=area.getBoundingClientRect();if(!r.width)return stored;const percent=100*(e.clientX-r.left-6)/r.width;const leftMin=260, rightMin=360;const safeMin=Math.max(18,100*leftMin/r.width);const safeMax=Math.min(57,100*(r.width-rightMin)/r.width);if(safeMax>=safeMin)return apply(Math.max(safeMin,Math.min(safeMax,percent)));return apply(percent);}
apply(stored);let dragging=false;
let pointerStartX=0, moved=false;
bar.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;moved=false;pointerStartX=e.clientX;bar.classList.add('dragging');document.body.classList.add('theory-resizing');bar.setPointerCapture(e.pointerId);e.preventDefault()});
bar.addEventListener('pointermove',e=>{if(dragging&&Math.abs(e.clientX-pointerStartX)>3){moved=true;fromPointer(e)}});
function end(e){if(!dragging)return;dragging=false;bar.classList.remove('dragging');document.body.classList.remove('theory-resizing');const val=parseFloat(area.style.getPropertyValue('--theory-left'))||defaultShare;apply(val,true);if(e&&bar.hasPointerCapture?.(e.pointerId))bar.releasePointerCapture(e.pointerId)}
bar.addEventListener('pointerup',end);bar.addEventListener('pointercancel',end);
bar.addEventListener('dblclick',()=>apply(defaultShare,true));
bar.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='Home'||e.key==='End'){e.preventDefault();e.stopPropagation();const old=parseFloat(area.style.getPropertyValue('--theory-left'))||defaultShare;let next=e.key==='Home'?18:e.key==='End'?57:old+(e.key==='ArrowRight'?2:-2);apply(next,true);}});
})();
