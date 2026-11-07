/* KAFV RPG v0.8.1 — corrected experimental Canvas2D scene layer.
   Original v0.7.0 engine remains available for S03–S24 and all 15 stores.
   No third-party images, fonts, sound recordings, or network dependencies.
   Engineering note: Phaser substitution is not claimed; offline 2D scene kernel is used
   until an audited, locally vendored Phaser build becomes available. */
(()=>{'use strict';
const Legacy=window.KAFV_MarketRPG, oldStores=window.KAFV_RPG_STORES||[];
const W=1200,H=680,COL={deep:'#092e3e',dark:'#103b4a',sea:'#1d6475',aqua:'#43b6b6',gold:'#ffce73',cream:'#fff6d9',ink:'#173946'};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)), lerp=(a,b,k)=>a+(b-a)*k, won=n=>Math.round(n).toLocaleString('ko-KR');
const product=[{name:'광어',kg:1.3,price:18000,kind:'flat'},{name:'우럭',kg:1.1,price:15500,kind:'rock'},{name:'참돔',kg:1.5,price:19000,kind:'sea'}];
const seq={
 S01:[
 {who:'상황',text:'처음 온 고객이 생선을 고르지 못하고 있습니다.',act:'enter'},
 {who:'방문 고객',text:'처음 왔는데 어떤 생선을 사야 할지 모르겠어요.',act:'ask'},
 {who:'중도매인',text:'어서 오세요. 어떤 요리로 드실 예정이세요?',act:'greet'},
 {who:'방문 고객',text:'네 명이 함께 구워 먹을 거예요.',act:'reply'},
 {who:'중도매인',text:'네 분이 드실 구이용이군요. 손질도 필요하신가요?',act:'guide'},
 {who:'행동 1',text:'인사하고 필요한 상품과 용도를 먼저 묻는다.',act:'greet'},
 {who:'행동 2',text:'고객의 말을 정리해 다시 확인한다.',act:'guide'},
 {who:'학습 정리',text:'고객의 필요를 먼저 파악하고 상품 선택을 돕습니다.',act:'finish'}],
 S02:[
 {who:'상황',text:'고객 유형을 단정하지 않고 필요한 도움을 묻는 연습입니다.',act:'enter'},
 {who:'방문 고객',text:'생선은 잘 몰라서요.',act:'ask'},
 {who:'중도매인',text:'어떤 요리로 드실 건가요?',act:'greet'},
 {who:'방문 고객',text:'둘은 왜 가격이 달라요?',act:'reply'},
 {who:'중도매인',text:'크기와 손질 상태를 비교해 드릴게요.',act:'product'},
 {who:'방문 고객',text:'바로 가져갈 수 있나요?',act:'ask'},
 {who:'중도매인',text:'준비된 상품과 대기시간을 알려드릴게요.',act:'guide'},
 {who:'행동 1',text:'용도·인원수를 묻고 선택지를 좁힌다.',act:'product'},
 {who:'행동 2',text:'중량·규격·단위를 동일하게 맞춰 비교한다.',act:'weigh'},
 {who:'학습 정리',text:'먼저 묻고, 끝까지 듣고, 필요한 도움을 확인합니다.',act:'finish'}]
};
function poly(g,pts,fill,stroke=null,line=1){g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=line;g.stroke()}}
function rect(g,x,y,w,h,fill,stroke='',line=1,r=0){g.beginPath();if(r)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=line;g.stroke()}}
function ell(g,x,y,rx,ry,fill,stroke='',line=1){g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=line;g.stroke()}}
function line(g,x,y,a,b,color,width=2){g.beginPath();g.moveTo(x,y);g.lineTo(a,b);g.lineWidth=width;g.strokeStyle=color;g.stroke()}
function txt(g,t,x,y,size=16,color=COL.ink,bold=false,align='left'){g.fillStyle=color;g.font=`${bold?800:500} ${size}px "Noto Sans KR","Malgun Gothic",sans-serif`;g.textAlign=align;g.textBaseline='middle';g.fillText(String(t),x,y)}
function gradient(g,x,y,w,h,a,b){let t=g.createLinearGradient(x,y,x,y+h);t.addColorStop(0,a);t.addColorStop(1,b);return t}
function fish(g,x,y,s=1,kind='flat',color='#a4b8a8',flip=1){g.save();g.translate(x,y);g.scale(flip*s,s);
 ell(g,2,5,40,12,'#0c34444d');poly(g,[[-33,0],[-54,-19],[-55,20]],color,'#587879',1.4);
 poly(g,[[-14,-10],[-8,-20],[12,-15],[22,-6]],'#749f91');
 ell(g,0,0,39,17,color,'#4f7479',1.5);ell(g,1,4,30,8,'#ffffff3b');
 if(kind==='flat'){ell(g,3,0,34,22,color,'#587879',1.3);for(let i=0;i<8;i++)ell(g,-23+i*7,-6+(i%2)*5,2.2,1.9,'#6b877c')}
 if(kind==='rock')for(let i=0;i<6;i++)line(g,-13+i*6,-9,-21+i*7,4,'#3f6975',1);
 if(kind==='sea')line(g,-32,9,28,11,'#e4a4a1',3);
 ell(g,26,-5,3.6,3.6,'#fdf9e4');ell(g,26,-5,2,2,'#193c4a');line(g,34,4,37,7,'#35515a',1.2);g.restore()}
function actor(g,p,t,scale=1){g.save();g.translate(p.x,p.y);g.scale(scale,scale);const swing=p.walk?Math.sin(t*11+(p.seed||0))*5:0;const gest=p.gesture?Math.sin(t*5)*8:0;
 ell(g,0,2,25,7,'#14354755');
 const apron=p.role==='중도매인'||p.role==='하역작업자';const color=p.role==='중도매인'?'#285c7e':p.role==='하역작업자'?'#a87b40':p.color||'#b65c64';
 const dir=p.dir||'down';if(dir==='up'){
 line(g,-11,-17,-13+swing,0,'#1f4d68',7);line(g,11,-17,13-swing,0,'#1f4d68',7);
 rect(g,-23,-72,46,54,color,'#173947',2,13);rect(g,-16,-65,32,42,apron?'#173d54':'#ffffff30','',1,5);
 ell(g,0,-83,19,21,'#b68a69');poly(g,[[-20,-88],[-18,-105],[16,-105],[20,-88]],'#283f42');
 }else{
 line(g,-10,-19,-12+swing,0,'#19475e',8);line(g,11,-19,12-swing,0,'#19475e',8);
 rect(g,-24,-76,48,59,color,'#183b46',2,14);
 if(apron){poly(g,[[-16,-61],[15,-61],[18,-25],[-17,-25]],'#154459');line(g,-8,-62,-15,-75,'#c7d8cf',3);line(g,8,-62,15,-75,'#c7d8cf',3)}
 let sx=dir==='left'?-1:dir==='right'?1:0;
 line(g,-22,-61,-35,-38+gest,'#d4a78a',9);line(g,22,-61,34,-46-gest,'#d4a78a',9);
 ell(g,0,-91,20,24,'#d8ab86','#9f7a62',1.4);poly(g,[[-21,-96],[-19,-116],[-3,-119],[16,-112],[19,-96]],p.role==='중도매인'?'#283a45':'#433e38');
 if(dir==='down'){ell(g,-7,-91,2,2,'#23343b');ell(g,8,-91,2,2,'#23343b');line(g,-5,-80,5,-80,'#a56b61',1.4)}
 if(sx!==0){ell(g,9*sx,-89,2,2,'#26353c');ell(g,-20*sx,-90,4,5,'#d7a78a')}
 }
 if(p.role==='하역작업자'){rect(g,-23,-120,45,10,'#d7b25c');rect(g,-15,-127,30,11,'#f6d27e')}
 g.restore()}
function bubble(g,msg,x,y,maxW=310){g.save();g.font='700 15px "Malgun Gothic",sans-serif';const chars=String(msg).split('');const lines=[];let accum='';chars.forEach(ch=>{if(g.measureText(accum+ch).width>maxW-32&&accum){lines.push(accum);accum=ch}else accum+=ch});if(accum)lines.push(accum);const w=Math.min(maxW,Math.max(145,...lines.map(s=>g.measureText(s).width+33))),h=lines.length*22+28;let bx=clamp(x-w/2,10,W-w-10),by=clamp(y-h-20,65,H-h-68);rect(g,bx,by,w,h,'#fffcef','#0e6471',2,13);poly(g,[[clamp(x,bx+20,bx+w-20)-8,by+h],[clamp(x,bx+20,bx+w-20)+8,by+h],[x,by+h+13]],'#fffcef','#0e6471',1);lines.forEach((s,i)=>txt(g,s,bx+16,by+21+i*22,15,'#17444c',true));g.restore()}
/** Original authored procedural fishing-vessel art, drawn as layers; no external sprites or copied game assets. */
function drawFishingBoat(g,x,y,s,t,opts={}){
 g.save();g.translate(x,y+Math.sin(t*1.4+x*.01)*2*s);g.scale(s,s);
 // soft reflection and waterline foam
 ell(g,0,12,131,9,'#e9fefe2d');
 for(let i=0;i<4;i++){const yy=9+i*5;line(g,-123-i*6,yy,-68+i*13,yy+1,'#daf9f39c',1.4)}
 // Hull: slightly curved stem, transom, waterline stripe, chine and stern
 poly(g,[[-143,-43],[126,-43],[144,-31],[113,9],[-98,9],[-138,-16]],'#e7f1e9','#173d55',3);
 poly(g,[[-138,-17],[134,-18],[115,6],[-102,6]],'#1c6483','#17445b',1.6);
 line(g,-130,-26,130,-27,'#b46243',4);line(g,-96,7,109,7,'#d4e6d9',2);
 poly(g,[[-143,-43],[-129,-53],[113,-53],[126,-43]],'#f9f1d8','#355465',2);
 // Ribbed hull / side fenders
 for(let i=0;i<7;i++)line(g,-93+i*29,-16,-95+i*29,-3,'#285c70',1);
 for(const bx of [-107,108]){ell(g,bx,-35,7,12,'#313c45','#e1d5af',2);line(g,bx,-36,bx,-17,'#4b595b',2)}
 // Cabin and pilot house with glazing, portholes and aft deck
 poly(g,[[-54,-54],[-51,-107],[-2,-125],[59,-121],[71,-57]],'#e9f0e5','#6d8b8d',2.5);
 poly(g,[[-58,-111],[0,-134],[65,-131],[75,-117]],'#d1d7c7','#355a68',2);
 rect(g,-45,-105,45,35,'#3c8197','#daf2e9',2,4);rect(g,7,-108,48,35,'#43899a','#d7f4ed',2,4);
 for(let i=0;i<4;i++)line(g,-36+i*22,-102,-8+i*21,-74,'#e5fdf03e',2);
 rect(g,-41,-63,110,9,'#d09d65','#936e4e',1,2);rect(g,16,-68,18,7,'#c76d51');
 // Radar mast, boom and rigging: winch and net-handling crane
 line(g,19,-132,19,-190,'#254f60',4);line(g,-9,-174,67,-174,'#315e6b',3);
 line(g,60,-132,105,-160,'#335464',4);line(g,105,-160,116,-89,'#476673',2);
 line(g,103,-160,53,-163,'#99a69e',2);line(g,19,-188,-69,-65,'#54747a',1.2);
 rect(g,5,-195,32,6,'#f8f0d4','#4e6265',1.5,2);ell(g,18,-185,7,4,'#fecea5');
 poly(g,[[19,-173],[65,-146],[19,-149]],'#ffdb8b','#ac8c62',1.5);
 // Fishing gear: floats, stacked blue crates, coiled rope, hoops and winch
 for(let i=0;i<4;i++){rect(g,61+i*15,-76,19,19,i%2?'#c5925b':'#ecbc73','#6b6e6c',1.3,2);line(g,67+i*15,-71,75+i*15,-71,'#866a4a',1)}
 ell(g,-105,-62,22,9,'#c7a778','#806c50',2);ell(g,-105,-62,13,4,'#e8d7af');
 ell(g,86,-53,11,11,'#243f4d','#9eb8b2',2);ell(g,86,-53,5,5,'#d2dbd0');
 // registration is deliberately fictional (no real vessel identity)
 // No hull text: avoid glyphs overlapping the real fishing-gear layers.
 // mast light, cockpit antenna and little seabirds
 ell(g,18,-195,3,3,'#ffb963');line(g,-25,-119,-42,-138,'#4e6a70',1.2);
 g.restore();
}
const booths=Array.from({length:15},(_,i)=>({index:i,x:75+(i<8?i:i-8)*244,y:i<8?102:524,w:216,h:154}));
class VerticalScene{
 constructor(host,rooms,missions,handlers){this.host=host;this.rooms=rooms;this.missions=missions;this.handlers=handlers;this.mode='on';this.scene='market';this.active=true;this.player={x:168,y:383,targetX:168,targetY:383,dir:'right',role:'방문 고객',color:'#b86659',walk:false};this.merchant={x:815,y:460,dir:'left',role:'중도매인'};this.customer={x:450,y:472,dir:'right',role:'방문 고객',color:'#b96d68'};
 this.npcs=Array.from({length:11},(_,i)=>({x:200+i*173,y:370+(i%3)*39,base:200+i*173,dir:i%2?'left':'right',role:['방문 고객','관광객','식당 바이어','소매상'][i%4],color:['#b97c68','#698b93','#8d78a6','#bb8b52'][i%4],seed:i}));this.camera=0;this.storeIndex=0;this.selected=null;this.weighed=false;this.cart=[];this.coldOpen=false;this.tradeCount=0;this.currentMission=null;this.demo=null;this.demoToken=0;this.harborState=0;this.harborClock=0;this.harborAuto=false;this.harborLog=[];this.harborPlayer={x:720,y:565,targetX:720,targetY:565,role:'현장 실습자',dir:'down',color:'#587e9d',walk:false};this.logStatus='';this.hotspots=[];this.toastTimeout=0;this.soundOn=false;this.volume=.18;this.noteStep=0;this.musicTimer=0;this.audioCtx=null;this._last=0;
 this.host.innerHTML=`<div class="v80-shell"><canvas class="v80-canvas" aria-label="수산시장 게임 화면: 직접 클릭하여 이동 및 상호작용" role="img"></canvas><div class="v80-top"><div class="v80-location"><strong class="v80-title">장목 교육용 수산컴플렉스</strong><span class="v80-subtitle">실측 도면·실거래 가격 아님 · v0.8.0 시범</span></div><div class="v80-tools"><button type="button" data-tool="market">↶ 시장</button><button type="button" data-tool="harbor">⚓ 항구</button><button type="button" data-tool="demo">▶ 다시보기</button><button type="button" data-tool="pause">⏸ 멈춤</button><button type="button" data-tool="next">⏭ 다음</button><button type="button" data-tool="theory">▤ 이론</button></div></div><div class="v80-alert" hidden></div><div class="v80-log" hidden></div><div class="v80-context" hidden></div><div class="v80-rail"><div class="v80-status" aria-live="polite">시장 구역을 살펴보세요.<small>ON 자동시연 / OFF 캐릭터·수산물·설비 직접 클릭</small></div><div class="v80-legend">15개 가상 점포 · 대표 활어점 신규 게임 구현</div></div></div>`;
 this.shell=host.querySelector('.v80-shell');this.canvas=host.querySelector('canvas');this.g=this.canvas.getContext('2d');this.ctxBox=host.querySelector('.v80-context');this.stat=host.querySelector('.v80-status');this.alertEl=host.querySelector('.v80-alert');this.logEl=host.querySelector('.v80-log');this.initEvents();this.resize();this._raf=requestAnimationFrame(t=>this.frame(t));}
 resize(){const dpr=clamp(window.devicePixelRatio||1,1,2);this.canvas.width=W*dpr;this.canvas.height=H*dpr;this.g.setTransform(dpr,0,0,dpr,0,0)}
 initEvents(){this.canvas.addEventListener('click',e=>this.handleClick(e));this.shell.querySelector('[data-tool="market"]').onclick=()=>this.returnMarket();this.shell.querySelector('[data-tool="harbor"]').onclick=()=>{this.goHarbor();if(this.mode==='on')this.startHarbor()};this.shell.querySelector('[data-tool="demo"]').onclick=()=>this.demo&&this.focusMission(this.currentMission.id,true);this.shell.querySelector('[data-tool="pause"]').onclick=()=>this.pause();this.shell.querySelector('[data-tool="next"]').onclick=()=>this.advance(true);this.shell.querySelector('[data-tool="theory"]').onclick=()=>this.handlers.onTheory?.(this.currentMission?.cut||2);this.keydown=e=>{if(this.mode!=='off')return;if(['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const delta={ArrowRight:[50,0],ArrowLeft:[-50,0],ArrowUp:[0,-44],ArrowDown:[0,44]}[e.key];if(this.scene==='harbor'){this.harborPlayer.targetX=clamp(this.harborPlayer.targetX+delta[0],365,830);this.harborPlayer.targetY=clamp(this.harborPlayer.targetY+delta[1],485,615)}else if(this.scene==='market'){this.player.targetX=clamp(this.player.targetX+delta[0],40,2070);this.player.targetY=clamp(this.player.targetY+delta[1],308,496)}}};document.addEventListener('keydown',this.keydown);
 this.vis=()=>{if(document.hidden)this.stopMusic();else if(this.soundOn)this.startMusic()};document.addEventListener('visibilitychange',this.vis)}
 setTitle(title,detail){this.shell.querySelector('.v80-title').textContent=title;this.shell.querySelector('.v80-subtitle').textContent=detail}
 status(s,detail=''){this.stat.innerHTML='';this.stat.append(document.createTextNode(s));const sm=document.createElement('small');sm.textContent=detail;this.stat.append(sm)}
 toast(s){this.alertEl.hidden=false;this.alertEl.textContent=s;clearTimeout(this.toastTimeout);this.toastTimeout=setTimeout(()=>{this.alertEl.hidden=true},2300)}
 context(title,desc,choices=[],x=770,y=265){this.ctxBox.hidden=false;this.ctxBox.innerHTML='';const close=document.createElement('button');close.textContent='✕';close.className='v80-close';close.onclick=()=>this.closeContext();const h=document.createElement('strong');h.textContent=title;const p=document.createElement('p');p.textContent=desc;const actions=document.createElement('div');actions.className='v80-choices';choices.forEach(ch=>{const b=document.createElement('button');b.type='button';b.textContent=ch.name;b.onclick=()=>ch.fn();actions.append(b)});this.ctxBox.append(close,h,p,actions);const rect=this.shell.getBoundingClientRect();this.ctxBox.style.left=clamp(x/W*rect.width,8,rect.width-300)+'px';this.ctxBox.style.top=clamp(y/H*rect.height,70,rect.height-195)+'px'}
 closeContext(){this.ctxBox.hidden=true}
 addHot(id,x,y,w,h,fn){this.hotspots.push({id,x,y,w,h,fn})}
 handleClick(e){if(this.mode!=='off')return;const b=this.canvas.getBoundingClientRect();const x=(e.clientX-b.left)/b.width*W,y=(e.clientY-b.top)/b.height*H;const hit=[...this.hotspots].reverse().find(p=>x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h);if(hit){hit.fn(x,y);return}if(this.scene==='market'){this.player.targetX=clamp(x+this.camera,50,2080);this.player.targetY=clamp(y,313,490);this.closeContext()}
 else if(this.scene==='harbor'&&this.mode==='off'){
  this.harborPlayer.targetX=clamp(x,365,830);this.harborPlayer.targetY=clamp(y,485,615);
  this.status('이동 지점 지정 · 현장 실습자 보행 중','선박·접안점·어획상자·카트·검수대·입고시설을 클릭하면 단계별 작업을 수행합니다.');this.closeContext();
 }else this.closeContext()}
 setMode(mode){this.mode=mode;this.stopDemo();this.closeContext();if(this.scene==='harbor'){this.harborAuto=false;this.harborState=0;this.harborClock=0;this.status('항구 모드가 전환되었습니다.','ON은 자동시연 / OFF는 단계별 직접 조작')}this.updateTools();this.status(mode==='off'?'OFF 직접 조작: 점포 또는 상품·인물·설비를 클릭하세요.':'ON 자동시연: 왼쪽 미션을 선택하세요.','오른쪽 상단에서 항구 현장과 시장을 오갈 수 있습니다.');}
 updateTools(){for(const key of ['demo','pause','next'])this.shell.querySelector(`[data-tool="${key}"]`).disabled=this.mode!=='on'||!this.currentMission}
 enterRoom(id){this.room=id;this.updateTools()}
 stopDemo(){this.demoToken++;this.demo=null;this.merchant.gesture=false;this.customer.gesture=false}
 returnMarket(){this.stopDemo();this.scene='market';this.currentMission=null;this.storeIndex=0;this.camera=0;this.player.x=160;this.player.targetX=160;this.player.y=394;this.player.targetY=394;this.closeContext();this.setTitle('장목 교육용 수산컴플렉스','8개 상단 점포 · 7개 하단 점포 · 중앙 통로');this.status('시장: OFF 모드에서 점포를 클릭하거나 걸어갈 수 있습니다.','대표 활어점은 새로운 게임 계층 / 다른 14개 점포는 기존 시범기능 유지');this.updateTools()}
 enterStore(){this.scene='store';this.closeContext();this.setTitle('01 · 장목활어수산 (교육용 가상 점포)','활어 수조 · 계량대 · 냉장고 · 계산대 · 출구');this.status('활어점에 들어왔습니다.','OFF: 수산물→저울→장바구니→계산대 / 인물에게 말 걸기');}
 goHarbor(){this.stopDemo();this.scene='harbor';this.closeContext();this.harborState=0;this.harborClock=0;this.harborLog=[];this.harborAuto=false;this.harborPlayer.x=720;this.harborPlayer.y=565;this.harborPlayer.targetX=720;this.harborPlayer.targetY=565;this.setTitle('⚓ 항구·하역 실습','입항 → 접안 → 하역 → 카트 → 검수 → 입고');this.status(this.mode==='off'?'OFF: 마우스로 이동하고 선박 → 접안 → 어획상자 → 카트 → 검수 → 입고를 직접 선택하세요.':'ON: ▶ 자동 하역 시연을 누르면 전체 물류 절차를 볼 수 있습니다.','교육용 물류 시뮬레이션 · 실측 시설 및 운영 절차가 아닙니다');}
 startHarbor(){
  this.harborAuto=this.mode==='on';
  this.harborState=1;this.harborClock=0;this.harborLog=['① 어선 입항'];
  this.status(this.harborAuto?'① 어선 입항 · 자동 시연 중':'① 입항 지시 완료 · 배가 이동합니다. 정박 후 접안 확인 표식을 클릭하세요.',this.harborAuto?'ON 자동시연: 단계별 작업 이벤트가 이어집니다.':'OFF 직접실습: 다음 작업을 누르기 전에는 자동으로 넘어가지 않습니다.');
  this.closeContext();}
 harborManualNext(){
  if(this.mode!=='off'||this.harborAuto)return;
  const durations={1:3.8,2:1.0,3:3.6,4:2.8,5:1.5};
  const st=this.harborState;
  if(st<=0){this.startHarbor();return}
  if(st>=6){this.toast('입고 완료 · 시장으로 돌아가거나 항구 시연을 다시 시작하세요.');return}
  if(this.harborClock<(durations[st]||0)) {this.toast('현재 움직임이 끝난 뒤 다음 작업을 선택하세요.');return}
  const msgs=['','','② 접안 확인 · 계류 안전점검','③ 어획상자 하역 · 로트 인계','④ 카트 운반 · 검수 장소 도착','⑤ 수량·상태·기록 확인','⑥ 보관시설 입고 · 로트 기록 완료'];
  this.harborEvent(st+1,msgs[st+1]);
 }

 harborEvent(s,msg){this.harborState=s;this.harborClock=0;this.harborLog.push(msg);this.status(msg,'현장 동작과 로트 이동 상태가 연결됩니다.');if(s===6)this.toast('입항→하역→카트 운반→검수→입고 완료 (교육용)')}
 focusMission(id,auto=true){if(!seq[id])return;this.currentMission=this.missions.find(m=>m.id===id)||{id,cut:2};this.closeContext();this.stopDemo();if(!auto||this.mode==='off'){this.enterStore();this.status(`${id} 직접 실습 준비`, '아래 상황별 행동을 선택하여 두 단계를 수행하십시오. 자동시연이 아닙니다.');this.updateTools();return}this.scene='market';this.setTitle(`${id} · ${this.currentMission.title}`,'시장 통로에서 대표 활어점으로 이동하는 자동시연');const target=booths[0];this.player.targetX=target.x+108;this.player.targetY=325;this.player.x=Math.min(this.player.x,180);this.camera=0;this.demo={id,phase:'approach',idx:0,due:performance.now()+1800,paused:false,position:0};this.updateTools();this.status(`${id} 점포로 이동 중…`,'입장 뒤 캐릭터·설비 동작과 화자 추적 말풍선이 시작됩니다.');}
 pause(){if(!this.demo)return;this.demo.paused=!this.demo.paused;this.demo.due=performance.now()+1750;this.shell.querySelector('[data-tool="pause"]').textContent=this.demo.paused?'▶ 계속':'⏸ 멈춤';this.status(this.demo.paused?'시연 일시정지':'시연 계속','다음 버튼을 누르면 대사를 한 단계씩 확인할 수 있습니다.')}
 advance(force=false){if(!this.demo||this.demo.paused&&!force)return;const d=this.demo;if(d.phase==='approach'){this.enterStore();d.phase='dialog';d.idx=0;}if(d.idx>=seq[d.id].length){d.phase='complete';d.due=Infinity;this.customer.gesture=false;this.merchant.gesture=false;this.handlers.onDemoEnd?.(d.id);this.status(`${d.id} 자동시연 종료 · 실습 완료와 별도`,'↻ 다시보기 / 이론 이미지 / OFF 실습으로 이어갈 수 있습니다.');return}
 const step=seq[d.id][d.idx++];d.current=step;d.due=performance.now()+(force?3900:2550);this.merchant.gesture=['greet','guide','product','weigh'].includes(step.act);this.customer.gesture=step.act==='ask';this.merchant.dir='left';this.customer.dir='right';if(step.act==='product')this.selected={...product[0]};if(step.act==='weigh'){this.selected={...product[0]};this.weighed=true}
 this.status(`${d.id} ${d.idx}/${seq[d.id].length} · ${step.who}: ${step.text}`,`${this.currentMission.cut}컷 연계 · ${d.id==='S01'?'교육용 대사 재구성':'08컷 상황 대사 활용'} · 본 교육용 시나리오`);
 if(step.act==='finish')this.customer.gesture=false;}
 draw(g,t){g.clearRect(0,0,W,H);this.hotspots=[];if(this.scene==='market')this.drawMarket(g,t);if(this.scene==='store')this.drawStore(g,t);if(this.scene==='harbor')this.drawHarbor(g,t);if(this.scene==='store'&&this.demo?.current){const d=this.demo;const c=d.current;if(['방문 고객','중도매인'].includes(c.who))bubble(g,c.text,c.who==='중도매인'?820:450,c.who==='중도매인'?310:340,320);else bubble(g,c.text,620,300,440)} }
 frame(ms){if(!this.active)return;const dt=Math.min((ms-(this._last||ms))/1000,.065);this._last=ms;this.time=ms/1000;this.update(dt,ms);this.draw(this.g,this.time);this._raf=requestAnimationFrame(t=>this.frame(t))}
 update(dt,ms){const p=this.player;if(this.scene==='market'){const dx=p.targetX-p.x,dy=p.targetY-p.y,dist=Math.hypot(dx,dy);p.walk=dist>3;if(p.walk){p.dir=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';const step=Math.min(dist,210*dt);p.x+=dx/dist*step;p.y+=dy/dist*step;}this.camera=lerp(this.camera,clamp(p.x-560,0,950),.085);this.npcs.forEach((n,i)=>{const speed=17+i%3*9;n.x=n.base+Math.sin(this.time*speed/125+i)*51;n.dir=Math.cos(this.time*speed/125+i)>0?'right':'left';n.walk=true});}
 if(this.demo&&!this.demo.paused&&ms>=this.demo.due){if(this.demo.phase==='approach')this.advance();else if(this.demo.phase==='dialog')this.advance()}
 if(this.scene==='harbor'){
   const hp=this.harborPlayer,dx=hp.targetX-hp.x,dy=hp.targetY-hp.y,dist=Math.hypot(dx,dy);
   hp.walk=this.mode==='off'&&dist>2;
   if(hp.walk){hp.dir=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';const step=Math.min(dist,165*dt);hp.x+=dx/dist*step;hp.y+=dy/dist*step;}
   if(this.harborState>0){this.harborClock=Math.min(16,this.harborClock+dt);}
   if(this.harborAuto&&this.mode==='on'&&this.harborState>0&&this.harborState<6){
    const thresh=[0,3.8,2.8,3.6,3.6,3.2][this.harborState];
    if(this.harborClock>=thresh){const next=this.harborState+1;this.harborEvent(next,['','', '② 접안 완료 · 하역 준비','③ 수산물 로트 하역 완료','④ 카트로 검수 구역에 운반 완료','⑤ 검수 확인 · 보관시설로 이동','⑥ 점포 입고 · 로트 이동 기록 완료'][next]);}
   }
  }}
 setAudio(on,vol){this.soundOn=!!on;this.volume=clamp(Number(vol??.18),0,1);if(on)this.startMusic();else this.stopMusic()}
 startMusic(){if(this.musicTimer||!this.soundOn||document.hidden)return;try{this.audioCtx=this.audioCtx||new (window.AudioContext||window.webkitAudioContext)();this.audioCtx.resume().catch(()=>{});this.musicTimer=setInterval(()=>{const a=[523,659,784,659,587,698,880,698,523,659,784,988,880,784,698,587,523,659,784,659,493,587,698,587,440,523,659,784,659,587,523,440],i=this.noteStep++%32;this.tone(a[i],.32,.07);if(i%4===0)this.tone([261,220,174,196][Math.floor(i/8)],.74,.04)},370)}catch(e){}}
 stopMusic(){clearInterval(this.musicTimer);this.musicTimer=0}
 tone(freq,d=.18,a=.06){if(!this.soundOn||!this.audioCtx)return;const c=this.audioCtx,o=c.createOscillator(),gain=c.createGain(),t=c.currentTime;o.type='sine';o.frequency.value=freq;gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,a*this.volume),t+.015);gain.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(gain);gain.connect(c.destination);o.start(t);o.stop(t+d+.02)}
 playNote(k){this.tone(k==='stamp'?880:587,.12,.05)} musicTest(){this.startMusic();this.tone(659,.32,.1)}
 say(who,msg){this.toast(`${who}: ${msg}`)}
 destroy(){this.active=false;cancelAnimationFrame(this._raf);this.stopMusic();clearTimeout(this.toastTimeout);document.removeEventListener('keydown',this.keydown);document.removeEventListener('visibilitychange',this.vis);this.host.replaceChildren()}
 drawMarket(g,t){
 const sea=gradient(g,0,0,W,H,'#d3f2e9','#78b9b5');rect(g,0,0,W,H,sea);
 g.save();g.translate(-this.camera,0);
 // Sky and back harbor strip; original drawing, not a photograph.
 rect(g,0,0,2150,100,'#bce1d9');for(let i=0;i<33;i++){line(g,i*74,25,i*74,88,'#8daeb1',2);ell(g,i*74,23,6,6,'#fff9cd')}
 rect(g,0,77,2150,36,'#5297a7');for(let i=0;i<30;i++)line(g,i*75,95,i*75+24,95,'#d9ffec',1);
 rect(g,0,270,2150,250,gradient(g,0,270,0,250,'#e8e1c9','#d5d1b8'));
 for(let i=0;i<38;i++){line(g,i*60,270,i*60,520,'#c4bda4',1);if(i%2===0)line(g,0,270+i%5*50,2150,270+i%5*50,'#c6c0a9',1)}
 rect(g,0,306,2150,198,'#dad6c0');rect(g,0,336,2150,3,'#c5bba2');rect(g,0,473,2150,3,'#c5bba2');
 // Main lane arrows and wayfinding.
 for(let i=0;i<14;i++){poly(g,[[70+i*157,418],[88+i*157,408],[88+i*157,415],[107+i*157,415],[107+i*157,423],[88+i*157,423],[88+i*157,430]],'#b4b9a4')}
 txt(g,'중앙 공용통로  ·  보행 고객 우선',95,300,15,'#476d67',true);
 // Fixed booths, 8 top / 7 bottom, 15 total.
 booths.forEach((b,i)=>{
 const top=i<8,store=oldStores[i]||{kind:'활어',fish:['광어'],n:`가상점포 ${i+1}`,main:'#278c94',icon:'🐟'};
 const dx=b.x,dy=b.y;g.save();g.translate(dx,dy);
 rect(g,0,0,b.w,b.h,'#f6f5df','#6e958c',2,10);
 rect(g,5,11,b.w-10,38,store.main,'',1,4);
 rect(g,5,50,b.w-10,top?88:83,'#e8e6d4');
 // roof awning is toward the corridor, not the back.
 const canopy=top?143:1;rect(g,0,canopy,b.w,21,'#f8e8b3','#ac9a73',1,4);
 for(let s=0;s<8;s++){rect(g,s*(b.w/8),canopy, b.w/8,19,s%2?'#f1c38e':'#fbefd0')}
 // shelf and fish tanks as differentiated booths
 const shelfY=top?75:55;
 if(['활어','패류','해산물','갑각류','생선류','선어','낙지','제철어류'].includes(store.kind)){
 rect(g,12,shelfY,b.w-24,52,'#267d90','#134b61',2,5);rect(g,15,shelfY+4,b.w-30,35,'#72b8b4');
 for(let j=0;j<3;j++)fish(g,50+j*57,shelfY+24,.46, j%2?'rock':'flat',['#b3c2aa','#dc9d88','#7ea8a5'][j],j%2?-1:1);
 }else{rect(g,12,shelfY,b.w-24,48,'#d6b890','#8c795e',2,4);for(let j=0;j<4;j++)rect(g,19+j*47,shelfY+7,34,30,j%2?'#acc2b5':'#e4bda0','#9b8e83',1,5)}
 rect(g,12,11,29,38,'#ffffff2d');txt(g,`${String(i+1).padStart(2,'0')}`,14,31,17,'#faffee',true);
 txt(g,store.n,42,31,15,'#fff9e9',true);
 txt(g,store.fish.slice(0,2).join(' · '),13,top?134:124,11,'#335d5c',true);
 if(i===0){rect(g,2,canopy-4,b.w-4,5,'#ffdf78');txt(g,'★ 대표 실습 점포',108,top?119:152,12,'#fff6d2',true,'center')}
 g.restore();
 if(this.mode==='off')this.addHot(`store${i}`,b.x-this.camera,b.y,b.w,b.h,()=>{if(i===0){this.enterStore()}else this.handlers.onLegacyStore?.(i)});
 });
 // Pillars and lights.
 for(let i=0;i<9;i++){const x=i*245+48;rect(g,x,264,9,252,'#5c9694');ell(g,x+4,286,7,5,'#fbf1bc')}
 // Autonomous NPCs remain independent of player/camera.
 this.npcs.forEach(n=>actor(g,{...n,y:n.y+Math.sin(t*4+n.seed)*2,walk:true},t,.77));
 actor(g,{...this.player,x:this.player.x,y:this.player.y},t,.88);
 // Visual corridor to harbor.
 rect(g,1920,280,178,40,'#0d6979','',1,8);txt(g,'⚓ 항구 이동',2010,300,17,'#f4ffea',true,'center');
 if(this.mode==='off')this.addHot('harbor',1920-this.camera,279,178,49,()=>this.goHarbor());
 g.restore();
 rect(g,0,0,W,4,'#113f4d');
 if(this.demo?.phase==='approach')bubble(g,'대표 활어점으로 이동합니다.',clamp(this.player.x-this.camera,85,1100),this.player.y-115,250);
 }
 drawStore(g,t){
 // Warmly lit functional store scene, all props are separately drawn & interactive.
 rect(g,0,0,W,H,gradient(g,0,0,W,H,'#b8dbd4','#e7e5d0'));
 rect(g,0,98,W,320,gradient(g,0,98,W,320,'#e5eadf','#c2d9d0'));
 rect(g,0,415,W,265,gradient(g,0,415,W,265,'#c5b99f','#e4d4b4'));
 for(let i=0;i<17;i++){line(g,0,416+i*26,W,416+i*26,'#b4aa92',1)}for(let i=-15;i<17;i++){line(g,i*110,420,i*110-150,680,'#b9ae91',1)}
 // windows with sea, docks and pier
 rect(g,90,109,680,154,'#4c9297','#fff9e8',13,7);rect(g,100,122,659,132,gradient(g,100,122,659,132,'#9ed9d8','#4f8aa1'));
 rect(g,100,198,659,56,'#42819d');for(let i=0;i<9;i++)line(g,122+i*83,238,171+i*83,238,'#c0eeea',2);
 g.save();g.beginPath();g.rect(101,125,655,126);g.clip();
 // Two fishing boats remain outside the glazing and move independently.
 const farX=570-Math.sin(t*.22)*65;
 drawFishingBoat(g,farX,206,.32,t+3,{distant:true});
 const nearX=245+(Math.sin(t*.30)+1)*106;
 drawFishingBoat(g,nearX,222,.49,t,{window:true});
 for(let i=0;i<8;i++){let wx=110+i*100+Math.sin(t*1.2+i)*14;line(g,wx,234,wx+42,236,'#d8ffff75',1.5)}
 g.restore();
 line(g,182,123,182,254,'#f6eed9',7);line(g,459,123,459,254,'#f6eed9',7);
 // Recessed walls and warehouse elements
 rect(g,20,98,54,474,'#5c8b86');rect(g,781,98,26,340,'#699b93');
 rect(g,0,85,W,18,'#1e5e6b');for(let i=0;i<4;i++){line(g,145+i*280,30,145+i*280,78,'#3a5960',4);ell(g,145+i*280,80,36,10,'#e9d194');ell(g,145+i*280,83,26,5,'#fff4bc')}
 rect(g,340,38,464,51,'#0c5867','#f1d39d',2,9);txt(g,'장목 활어 · 교육용 시범 점포',571,63,24,'#fffaf1',true,'center');
 // Aquarium with glass reflections, full water state and fish.
 rect(g,105,280,347,193,'#3c686f','#1a485a',5,9);rect(g,114,289,329,168,gradient(g,114,289,329,168,'#60bdba','#277a9a'),'#afeee9',3,6);
 for(let i=0;i<7;i++){const bx=132+i*49,yy=432+(Math.sin(t*2+i)*12);ell(g,bx,yy,3,3,'#e8ffff80');ell(g,bx+9,yy-23,2,2,'#e8ffff88');ell(g,bx-4,yy-45,2,2,'#e8ffff6b')}
 fish(g,230+Math.sin(t*.9)*22,350+Math.cos(t*.7)*10,.9,'rock','#a7b5a2',Math.sin(t*.9)>0?-1:1);fish(g,353-Math.sin(t*.8)*17,392+Math.cos(t*.9)*7,.71,'sea','#dba39a',1);
 for(let i=0;i<4;i++)line(g,116+i*89,292,110+i*89,456,'#ddfaff37',2);
 rect(g,105,462,349,32,'#22586b');txt(g,'활어 수조 · 상태와 품목을 확인',129,479,14,'#fff6da',true);
 // Food display counter with separate chilled trays
 rect(g,470,474,367,110,'#385c62','#214b53',3,12);rect(g,472,455,366,62,'#abc8c0','#42727a',3,10);rect(g,486,462,100,46,'#eef2e1','#75918b',2,6);rect(g,592,462,100,46,'#edf3ea','#75918b',2,6);rect(g,699,462,124,46,'#eef2e1','#75918b',2,6);
 fish(g,535,483,.41,'flat','#aaac92');fish(g,641,483,.38,'rock','#7a9b9c',-1);fish(g,763,483,.4,'sea','#d9a49f');
 txt(g,'교육용 단가 / kg',500,564,15,'#ffffec',true);
 // Scales (tangible state with live number)
 rect(g,614,371,150,83,'#3d7780','#285465',3,12);rect(g,631,345,117,37,'#dedfe0','#527d83',2,7);rect(g,636,393,105,45,'#193e48','#8cdcd3',2,6);
 txt(g,this.weighed&&this.selected?this.selected.kg.toFixed(2)+' kg':'0.00 kg',688,414,22,'#8ce8a1',true,'center');
 rect(g,655,437,60,11,'#a9bebd');txt(g,'전자저울',618,365,11,'#335f61',true);
 // Refrigeration: open/close leaves visibly different geometry
 rect(g,937,159,222,291,'#6c9295','#315a66',4,12);rect(g,950,174,190,264,'#d6e8dc','#c4e8dc',3,9);
 if(this.coldOpen){rect(g,960,186,160,234,'#6fb3c5','#285469',3,7);for(let i=0;i<3;i++){line(g,974,233+i*60,1105,233+i*60,'#e8fff4',4);fish(g,1019+i*11,220+i*60,.31,'rock','#bad0c1')};poly(g,[[958,173],[906,191],[906,444],[958,436]],'#dbe9df','#86b5b3',3);txt(g,'열림',1088,194,13,'#edf8df',true)}
 else{rect(g,960,186,167,230,gradient(g,960,186,167,230,'#d9e5dd','#a8bfc3'),'#729999',3,7);rect(g,1091,262,9,81,'#55747a','',1,5);line(g,974,229,1109,229,'#f7fffa',3);txt(g,'닫힘',991,204,14,'#376269',true)}
 rect(g,945,420,200,24,'#1e6570');txt(g,'냉장 보관고',980,432,13,'#fff4d9',true);
 // Counter and POS / checkout
 rect(g,875,487,301,116,gradient(g,875,487,301,116,'#ccaa7e','#8a6c53'),'#665447',3,12);
 rect(g,907,449,138,58,'#446f77','#173f52',3,7);rect(g,916,455,122,39,'#d9eade');txt(g,'거래명세',976,470,13,'#27535b',true,'center');
 txt(g,`장바구니 ${this.cart.length}건`,975,488,12,'#244c51',true,'center');
 rect(g,1062,461,78,36,'#3b5a62','#a1bcac',2,5);for(let i=0;i<3;i++)for(let j=0;j<3;j++)ell(g,1076+j*24,469+i*10,3,3,'#c6dcd2');
 if(this.tradeCount>0){rect(g,914,505,120,60,'#fff9e1','#a7a69a',1,3);txt(g,'영수증 발행',929,519,12,'#3e5951',true);txt(g,`누적 ${this.tradeCount}건`,929,541,12,'#6c7771')}
 // Exit appears explicitly as walkable door
 rect(g,16,509,145,101,'#2b6972','#d5e4c8',3,10);txt(g,'← 시장 출구',88,555,19,'#fffbe8',true,'center');txt(g,'여기를 누르세요',88,580,11,'#d9ecdc',false,'center');
 actor(g,this.customer,t,.91);actor(g,this.merchant,t,1);
 // Item affordances in direct mode, separate object hit targets.
 if(this.mode==='off'){
 this.addHot('tank',105,280,344,208,()=>this.openFish(250,300));
 this.addHot('display',465,461,371,127,()=>this.openFish(610,320));
 this.addHot('scale',615,343,152,111,()=>this.openScale());
 this.addHot('cold',934,157,225,296,()=>this.openCold());
 this.addHot('cash',873,448,305,161,()=>this.openCash());
 this.addHot('merchant',785,348,84,130,()=>this.talk('merchant'));
 this.addHot('customer',410,355,90,126,()=>this.talk('customer'));
 this.addHot('exit',13,505,157,117,()=>this.returnMarket());
 }
 // Price is an explicit educational example, not today's quote.
 rect(g,480,532,325,23,'#f7f4df');txt(g,'예시 단가: 광어 18,000 · 우럭 15,500 · 참돔 19,000원/kg',486,543,11,'#516568');
 }
 drawHarbor(g,t){
 rect(g,0,0,W,H,gradient(g,0,0,W,H,'#bde1d7','#64a6b0'));
 rect(g,0,193,W,263,gradient(g,0,193,W,263,'#4a9db5','#145c80'));
 for(let i=0;i<12;i++){const yy=240+i*18;for(let j=0;j<13;j++)line(g,j*96+Math.sin(t+i)*16,yy,j*96+34+Math.sin(t+i)*16,yy,'#a8dfdf88',2)}
 rect(g,0,454,W,226,gradient(g,0,454,W,226,'#b8b7a6','#e3d5b9'));
 // Quay structure and bollards
 rect(g,0,430,W,31,'#557d80');for(let i=0;i<12;i++){rect(g,14+i*102,419,22,39,'#315763');rect(g,14+i*102,419,22,6,'#b7c3b5')}
 txt(g,'항구 하역 · 현장실습',700,132,25,'#143e51',true);
 txt(g,'실제 시설 도면·확정 작업 절차가 아닙니다',702,164,15,'#5b7880');
 const st=this.harborState,p=Math.min(1,this.harborClock/(st===1?3.8:2.8));let sx=st===0?108:st===1?lerp(108,255,p):255;
 // Independent detailed working fishing vessel. Dock and rope are separate world objects.
 g.save();g.translate(sx,0);
 drawFishingBoat(g,105,390,1.38,t,{harbor:true});
 if(st<3)for(let i=0;i<4;i++){rect(g,25+i*39,306,32,27,i%2?'#d8ba89':'#bd986a','#705943',2,3);line(g,30+i*39,319,51+i*39,319,'#795e45',2)}
 g.restore();
 if(st>=2){line(g,sx+217,390,358,422,'#b7a180',3);ell(g,358,423,6,6,'#e0d4b1')}
 // Ship wake follows movement, not an independent fake boat animation.
 if(st===1&&p<1){for(let k=0;k<3;k++)ell(g,sx+42-k*37,405+Math.sin(t*3+k)*3,18+k*6,2,'#e3ffff8b')}

 // unloading: crates move from ship to dock then into cart
 const crane=st>=2?st===3?Math.min(1,this.harborClock/3.6):1:0;
 rect(g,330,388,12,137,'#65858c');line(g,341,398,490,378,'#70878d',6);
 if(st>=3){for(let i=0;i<3;i++)rect(g,312+crane*114+i*37,430+crane*66,37,28,'#c7aa78','#927455',2,3)}
 // worker receives boxes and operates cart
 const workerX=st===4?lerp(510,775,p):st>=5?775:507;
 actor(g,{x:workerX,y:535,role:'하역작업자',dir:'right',walk:st===4,gesture:st>=3},t,1);
 if(st>=3){g.save();g.translate(st===4?workerX-8:540,0);rect(g,-27,527,117,12,'#486f72');line(g,-3,540,10,592,'#344c53',5);line(g,74,540,75,592,'#344c53',5);ell(g,11,597,13,13,'#2e4751');ell(g,82,597,13,13,'#2e4751');for(let i=0;i<3;i++)rect(g,-5+i*27,485,39,38,'#c4a274','#947653',2,2);g.restore()}
 // delivery check station and warehouse
 rect(g,850,315,303,187,'#e0e4d5','#6b9089',3,8);rect(g,850,305,303,36,'#1a6578');txt(g,'검수 · 입고 지점',878,324,19,'#faffef',true);
 rect(g,886,367,99,127,'#b5c9c2','#52787c',2);rect(g,1014,353,109,132,'#8cafaf','#426975',3,7);
 for(let i=0;i<3;i++){rect(g,900,380+i*32,67,23,st>=5?'#d5ba86':'#c7cec6','#76948e',1,3)}
 if(st>=6){rect(g,892,349,74,24,'#248361');txt(g,'입고 완료',905,362,14,'#f8fff0',true)}
 // A visible actionable next step: direct OFF is a click-driven state machine.
 const steps=[
  {id:'ship',x:104,y:502,w:226,h:50,label:'① 어선 클릭 · 입항',hint:'선박을 선택해 접안 위치로 이동시킵니다.'},
  {id:'dock',x:287,y:423,w:175,h:50,label:'② 접안 확인',hint:'접안 뒤 계류·작업 구역을 확인합니다.'},
  {id:'crate',x:305,y:472,w:184,h:50,label:'③ 어획상자 하역',hint:'상자와 로트 식별을 확인하며 하역합니다.'},
  {id:'cart',x:485,y:532,w:171,h:50,label:'④ 카트로 운반',hint:'카트가 이동해 검수대로 접근합니다.'},
  {id:'inspect',x:812,y:520,w:170,h:50,label:'⑤ 검수 수행',hint:'검수대에서 수량·상태·기록을 확인합니다.'},
  {id:'warehouse',x:961,y:524,w:183,h:50,label:'⑥ 시설 입고',hint:'확인된 로트의 보관시설 입고를 기록합니다.'}
 ];
 if(st<6){const action=steps[st];rect(g,action.x,action.y,action.w,action.h,this.mode==='off'?'#095a69':'#146477','#fee1a0',2,10);txt(g,(this.mode==='off'?'🖱 ':'▶ ')+action.label,action.x+action.w/2,action.y+25,17,'#fff7d9',true,'center');
  if(this.mode==='off')this.addHot('harbor-step-'+st,action.x,action.y,action.w,action.h,()=>st===0?this.startHarbor():this.harborManualNext());
  if(this.mode==='on'&&st===0)this.addHot('harbor-auto',action.x,action.y,action.w,action.h,()=>this.startHarbor());
 }
 if(this.mode==='off'){
  // Ship / physical equipment hotspots mirror the on-screen action, preserving non-button interaction.
  if(st===0)this.addHot('vessel',22,220,325,200,()=>this.startHarbor());
  if(st===1)this.addHot('bollard',343,417,102,51,()=>this.harborManualNext());
  if(st===2)this.addHot('cargo',222,300,204,110,()=>this.harborManualNext());
  if(st===3)this.addHot('worker',448,449,154,85,()=>this.harborManualNext());
  if(st===4)this.addHot('inspection',848,311,130,162,()=>this.harborManualNext());
  if(st===5)this.addHot('storage',1007,330,130,170,()=>this.harborManualNext());
  actor(g,this.harborPlayer,t,.76);
 }
 if(st===6){rect(g,60,503,292,55,'#156e63','#ffe1a1',2,10);txt(g,'✓ 직접 로트 입고 완료',206,529,18,'#f4ffe9',true,'center')}

 // Progress bar and real event logs instead of decorative motion.
 rect(g,52,600,1093,49,'#123e4abd','#8cc3bf',1,10);
 const names=['대기','입항','접안','하역','카트 운반','검수','입고'];names.forEach((n,i)=>{const x=95+i*157;ell(g,x,621,12,12,i<=st?'#f6cb79':'#537e87');txt(g,n,x+18,623,13,i<=st?'#ffffff':'#c3d6d0',true)});
 if(st>0){rect(g,54,586,Math.min(1078,(st-1+p)/6*1078),7,'#eec776')}
 }
 openFish(x=530,y=260){this.context('수산물 선택','수조·진열대의 품목을 확인하고 전자저울로 이동할 상품을 고릅니다. 단가는 교육용 예시입니다.',product.map(p=>({name:`${p.name} ${won(p.price)}원/kg`,fn:()=>{this.selected={...p};this.weighed=false;this.closeContext();this.toast(`${p.name} 선택 · 저울을 클릭해 계량하세요.`);this.status(`${p.name} 선택 완료`,'계량 → 장바구니 → 계산대 순서로 진행하십시오.')}})),x,y)}
 openScale(){if(!this.selected){this.context('전자저울','선택한 수산물이 없습니다. 수조나 진열대를 먼저 클릭하십시오.',[{name:'상품 먼저 고르기',fn:()=>this.openFish(530,290)}],690,260);return}
 const p=this.selected;this.weighed=true;this.context('⚖ 전자저울 · 교육용 계량',`${p.name} ${p.kg.toFixed(2)} kg × ${won(p.price)}원/kg = ${won(p.kg*p.price)}원 (예시)`,[{name:'− 0.1kg',fn:()=>{p.kg=+(Math.max(.1,p.kg-.1)).toFixed(2);this.openScale()}},{name:'+ 0.1kg',fn:()=>{p.kg=+(p.kg+.1).toFixed(2);this.openScale()}},{name:'🧺 장바구니 담기',fn:()=>{this.cart.push({...p});this.closeContext();this.toast(`${p.name} 계량 완료 · 장바구니 ${this.cart.length}건`);this.status('계량 상품을 장바구니에 담았습니다.','계산대를 클릭해 총액과 거래조건을 확인하십시오.')}}],700,290)}
 openCold(){this.coldOpen=!this.coldOpen;this.context('냉장 보관고',`보관고 문이 ${this.coldOpen?'열렸습니다':'닫혔습니다'}. 표시 온도와 입출고 기록은 실제로 확인해야 합니다.`,[{name:this.coldOpen?'문 닫기':'문 열기',fn:()=>this.openCold()},{name:'보관기록 안내',fn:()=>this.context('보관기록 확인','로트·입고일시·온도이력은 실제 자료로 검증해야 합니다. 여기서는 기록 확인 동작만 시연합니다.',[{name:'확인',fn:()=>this.closeContext()}],715,330)}],775,260)}
 openCash(){const total=this.cart.reduce((s,p)=>s+Math.round(p.kg*p.price),0);this.context('거래 확인 · 교육용 가상',this.cart.length?`${this.cart.map(p=>p.name+' '+p.kg.toFixed(2)+'kg').join(' / ')} · 합계 ${won(total)}원. 실제 결제·판매 기록이 아닙니다.`:'장바구니가 비어 있습니다. 먼저 상품을 선택하고 계량하십시오.',[{name:'✓ 가상 거래 확정',fn:()=>{if(!this.cart.length){this.toast('장바구니가 비었습니다.');return}const detail={items:this.cart.map(p=>({name:p.name,qty:p.kg})),total};this.handlers.onTrade?.(detail);this.tradeCount++;this.cart=[];this.selected=null;this.weighed=false;this.closeContext();this.toast(`가상 거래 완료 · 영수증 출력 ${won(total)}원`);this.status('거래 완료: 상품·중량·총액·인계사항 재확인','실제 거래·결제는 실행되지 않습니다.')}} ,{name:'수산물 더 고르기',fn:()=>this.openFish()}],785,325)}
 talk(who){const seller=who==='merchant';this.context(seller?'중도매인':'방문 고객',seller?'어떤 요리와 수량이 필요하신지 확인하겠습니다.':'생선을 잘 몰라서요. 어떤 요리로 먹으면 좋을까요?',[{name:'대화 · 용도 질문',fn:()=>{this.customer.gesture=!seller;this.merchant.gesture=seller;this.context(seller?'중도매인':'방문 고객','어떤 요리로 드실 예정이고, 몇 분이 드십니까?',[{name:'선택기준 설명',fn:()=>this.openFish()}],seller?750:380,300)}},{name:'S01 직접 실습',fn:()=>{this.closeContext();this.handlers.onMission?.('S01')}},{name:'S02 직접 실습',fn:()=>{this.closeContext();this.handlers.onMission?.('S02')}}],seller?750:350,310)}
 }
// Adapter protects 22 older mission scripts from regressions while the single
// v0.8.0 vertical slice can be switched in and out without losing lesson state.
class MarketRPG_v080{
 constructor(root,rooms,missions,handlers){this.root=root;this.rooms=rooms;this.missions=missions;this.handlers={...handlers,onLegacyStore:i=>this.openLegacyStore(i)};this.mode='on';this.soundOn=false;this.volume=.18;this.view=null;this.engine=null;this.room='receiving';this.player={x:160,y:390};this.useModern()}
 useModern(){if(this.engine==='modern')return;this.teardown();this.view=document.createElement('div');this.view.className='v80-host';this.root.replaceChildren(this.view);this.root.classList.add('v80-host');this.modern=new VerticalScene(this.view,this.rooms,this.missions,this.handlers);this.engine='modern';this.modern.setMode(this.mode);this.modern.setAudio(this.soundOn,this.volume);this.player=this.modern.player}
 useLegacy(){if(this.engine==='legacy')return;this.teardown();this.root.classList.remove('v80-host');this.view=document.createElement('div');this.view.className='v80-legacy sim-scene';this.root.replaceChildren(this.view);this.legacy=new Legacy(this.view,this.rooms,this.missions,this.handlers);this.engine='legacy';this.legacy.setMode(this.mode);this.legacy.setAudio(this.soundOn,this.volume);this.legacy.enterRoom(this.room);this.player=this.legacy.player}
 teardown(){if(this.modern){this.modern.destroy();this.modern=null}if(this.legacy){this.legacy.destroy();this.legacy=null}}
 openLegacyStore(i){this.useLegacy();this.legacy.openStore(i)}
 setMode(mode){this.mode=mode;if(this.engine==='modern')this.modern.setMode(mode);else this.legacy.setMode(mode)}
 setAudio(on,volume){this.soundOn=on;this.volume=volume;if(this.engine==='modern')this.modern.setAudio(on,volume);else this.legacy.setAudio(on,volume)}
 enterRoom(id){this.room=id;if(this.engine==='modern')this.modern.enterRoom(id);else this.legacy.enterRoom(id)}
 focusMission(id,auto=true){const m=this.missions.find(m=>m.id===id);if(m)this.room=m.room;
 if(id==='S01'||id==='S02'){this.useModern();this.modern.enterRoom(this.room);this.modern.focusMission(id,auto)}
 else{this.useLegacy();this.legacy.focusMission(id,auto)} }
 returnMarket(){this.useModern();this.modern.returnMarket()}
 say(who,msg){if(this.engine==='modern')this.modern.say(who,msg);else this.legacy.say(who,msg)}
 musicTest(){this.engine==='modern'?this.modern.musicTest():this.legacy.musicTest()}
 playNote(t){this.engine==='modern'?this.modern.playNote(t):this.legacy.playNote(t)}
 destroy(){this.teardown();this.root.replaceChildren()}
}
window.KAFV_RPG_V070_BACKUP=Legacy;
window.KAFV_MarketRPG=MarketRPG_v080;
window.KAFV_RPG_V081={version:'0.8.1-correction',sliceMissions:['S01','S02'],legacyMissions:22,engine:'Canvas2D offline prototype',fullPhaserIntegrated:false};
window.KAFV_RPG_V080=window.KAFV_RPG_V081; // metadata compatibility only
})();
