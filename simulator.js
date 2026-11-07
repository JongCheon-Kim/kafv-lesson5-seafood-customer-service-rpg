/* KAFV Lesson 5 v0.6.0 · 2.5D living market RPG controller.
   Preserves 7 original room ids, all 24 missions, 48 action steps, theory & practice assets.
   Direct click on characters/objects opens contextual actions; no dotted photo selection. */
(()=>{'use strict';
const $=id=>document.getElementById(id),q=(sel,root=document)=>[...root.querySelectorAll(sel)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const cfg=window.KAFV_SIM_DATA;if(!cfg){console.error('Missing fifth-session simulator data');return}
const rooms=cfg.rooms,missions=cfg.missions,R=id=>rooms.find(r=>r.id===id),M=id=>missions.find(m=>m.id===id);
const STORE='kafv_lesson5_sim_060';const SETTINGS='kafv_lesson5_sound_051';
function storageGet(k){try{return localStorage.getItem(k)}catch{return null}}
function storagePut(k,v){try{localStorage.setItem(k,v)}catch{}}
let saved={};try{saved=JSON.parse(storageGet(STORE)||'{}')||{}}catch{}
let done=new Set(Array.isArray(saved.done)?saved.done.filter(id=>!!M(id)):[]);
let logs=Array.isArray(saved.logs)?saved.logs:[];
const state={room:'receiving',active:null,step:0,feedback:null,mode:'off'};
let game=null;let gameTransactions=[];
let soundOn=false,volume=.25,audioCtx=null;let lastSound='';
function save(){storagePut(STORE,JSON.stringify({done:[...done],logs:logs.slice(-2000)}))}
function addLog(m,action,status){logs.push({time:new Date().toLocaleString('sv-SE'),space:R(m.room).name,mission:m.id,task:m.title,action,status});save()}
function snd(name){if(game&&soundOn)game.playNote(name)}
function countRoom(id){return missions.filter(m=>m.room===id&&done.has(m.id)).length}
function countAll(){return done.size}
function renderRooms(){const box=$('sim-rooms');box.replaceChildren();rooms.forEach((r,i)=>{let b=document.createElement('button');b.className='sim-room'+(r.id===state.room?' selected':'');b.type='button';b.setAttribute('aria-pressed',String(r.id===state.room));const ms=missions.filter(m=>m.room===r.id);b.innerHTML=`<span class="rpg-room-icon">${esc(r.icon)}</span><span class="r-label"><b><span class="sim-room-ordinal">${pad(i+1)}</span> ${esc(r.name)}</b><small>${esc(r.subtitle)}</small></span><span class="meter">${countRoom(r.id)}/${ms.length}</span>`;b.disabled=false;b.title='해당 공간으로 이동 · 점포 출입문 클릭';b.onclick=()=>setRoom(r.id);box.append(b)})}
function renderCommands(){const box=$('sim-commands');box.replaceChildren();missions.filter(m=>m.room===state.room).forEach((m,i)=>{const b=document.createElement('button');b.type='button';b.className='sim-cmd'+(state.active===m.id?' active':'')+(done.has(m.id)?' done':'');b.innerHTML=`<span><small><span class="sim-mission-ordinal">${pad(i+1)}</span> ${esc(m.id)} · ${pad(m.cut)}컷 연계</small><b>${esc(m.title)}</b></span><span class="cmd-state">${done.has(m.id)?'✓':'›'}</span>`;b.disabled=false;b.title='교육 상황 선택 후 점포·사람·객체 직접 조작';b.onclick=()=>selectMission(m.id);box.append(b)})}
function note(speaker,msg){if(game)game.say(speaker,msg,game.player,3200)}
function renderScene(){
 const room=R(state.room);if(!game){game=new window.KAFV_MarketRPG($('sim-scene'),rooms,missions,{
   onRoom:id=>setRoom(id),onMission:id=>selectMission(id,true),onTheory:cut=>showPIP(cut),onDemoEnd:id=>{$('sim-scene-status').textContent=id+' 자동 시연 완료 · 직접 실습 완료와 구분합니다.'},isDone:id=>done.has(id),onSound:name=>snd(name),
   onTrade:d=>{gameTransactions.push(d);const m=missions.find(m=>m.room===state.room&&/총액|거래|판매/.test(m.title));if(m)addLog(m,`가상 거래 ${d.items.map(x=>x.name+' '+x.qty+'kg').join(' / ')} · ${d.total}원`,'게임 거래');
    $('sim-scene-status').textContent='최근 거래: '+d.total.toLocaleString('ko-KR')+'원 (교육용 가상 금액)'}
  });game.setMode(state.mode);game.setAudio(soundOn,volume);game.enterRoom(state.room)}
 $('sim-room-title').textContent=room.name;
 $('sim-scene-caption').textContent=room.subtitle+' · 점포 배치는 교육용 가상 시설';
 if(!gameTransactions.length)$('sim-scene-status').textContent='객체 클릭 → 손님 이동 → 질문·자동 답변 → 직접 조작';
}
function renderCase(){const host=$('sim-case-body'),m=M(state.active);host.replaceChildren();if(state.mode==='on'){
  if(!m){host.innerHTML='<div class="sim-auto-info"><h3>▶ 왼쪽 1~7번 또는 서브 미션을 클릭하세요</h3><p>해당 점포로 진입하여 고객과 판매자가 교재 내용에 따라 자동 대화·행동합니다. 오른쪽 직접 조작은 OFF에서 가능합니다.</p></div>';return}
  const h=document.createElement('div');h.className='sim-auto-info';h.innerHTML=`<span class="auto-tag">${esc(m.id)} · ${pad(m.cut)}컷 연계 · ON 자동 시연</span><h3>${esc(m.title)}</h3><p>${esc(m.lead)}</p><p><b>교재에서 확인한 바른 행동:</b> ${esc(m.steps.map(s=>s.ok).join(' → '))}</p><p>※ 자동 시연은 교육용 대화 재구성이며, 실습 완료로 평가하지 않습니다.</p>`;
  const actions=document.createElement('div');actions.className='sim-auto-actions';const replay=document.createElement('button');replay.textContent='↻ 이 미션 다시 시연';replay.onclick=()=>game?.focusMission(m.id,true);const original=document.createElement('button');original.textContent='🖼 연계 이론 이미지';original.onclick=()=>showPIP(m.cut);actions.append(replay,original);h.append(actions);host.append(h);return;
 }
if(!m){host.innerHTML='<div class="story-placeholder"><span>🎮</span><b>현장을 탐색하세요</b><p>왼쪽 미션을 선택하거나 게임 속 캐릭터·상품·점포를 클릭하세요. 객체별 기능 메뉴가 열립니다.</p></div>';return}
 const complete=state.step>=m.steps.length;
 const top=document.createElement('div');top.innerHTML=`<div class="sim-tag">${esc(m.id)} · ${pad(m.cut)}컷 연계 ${done.has(m.id)?' · 수행기록 있음':''}</div><h3>${esc(m.title)}</h3><div class="story-lead"><span class="story-mark">“</span><p>${esc(m.lead)}</p></div>`;host.append(top);
 if(complete){const e=document.createElement('div');e.className='sim-feedback good';e.innerHTML='<strong>✅ 현장 절차 수행 완료</strong><p>수행한 행동이 작업이력에 저장되었습니다. 이는 실습 완료 표시이며 성적이나 등급 평가가 아닙니다.</p>';host.append(e)}
 else{const s=m.steps[state.step],title=document.createElement('div');title.className='lesson5-step';title.textContent='실행 '+(state.step+1)+' / '+m.steps.length+'  · '+s.prompt;host.append(title);
 const actions=document.createElement('div');actions.className='sim-choices';const actionPairs=[{good:true,label:s.ok},{good:false,label:s.bad}];if((m.id.charCodeAt(1)+m.id.charCodeAt(2)+state.step)%2)actionPairs.reverse();
 actionPairs.forEach((a,i)=>{const btn=document.createElement('button');btn.className='sim-choice lesson5-action';btn.type='button';btn.innerHTML='<span class="choice-num">'+(i+1)+'</span><span>'+esc(a.label)+'</span>';btn.addEventListener('click',()=>takeAction(a.good,a.label));actions.append(btn)});host.append(actions)}
 if(state.feedback){const f=document.createElement('div');f.className='sim-feedback '+(state.feedback.ok?'good':'bad');f.innerHTML='<strong>'+(state.feedback.ok?'✔ 조치 반영':'⚠ 다시 확인할 부분')+'</strong><p>'+esc(state.feedback.msg)+'</p>';host.append(f)}
 const buttons=document.createElement('div');buttons.className='sim-case-buttons';function btn(t,fn){const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=fn;buttons.append(b)}
 btn('📖 교육 해설',()=>showExplanation(m));btn('🖼 관련 이론',()=>showPIP(m.cut));if(complete)btn('↺ 같은 상황 다시 연습',()=>{state.step=0;state.feedback=null;renderCase()});host.append(buttons);
}
function takeAction(good,label){if(state.mode!=='off')return;const m=M(state.active);if(!m||state.step>=m.steps.length)return;const s=m.steps[state.step];if(good){addLog(m,label,'실행');state.feedback={ok:true,msg:s.result};state.step++;snd(state.step===m.steps.length?'stamp':'paper_flip');if(state.step===m.steps.length){done.add(m.id);save();note('판매자',m.title+'의 응대 절차를 마쳤습니다.');}else{note('판매자',s.result)}}else{addLog(m,label,'재확인');state.feedback={ok:false,msg:'해당 방법은 고객에게 필요한 사실을 확인하거나 책임 있게 처리하기에 부족합니다. 다른 행동을 선택해 주세요.'};snd('tap');note('판매자','다시 확인한 뒤 응대하겠습니다.')}
 renderRooms();renderCommands();renderCase();refreshCount();}
function refreshCount(){const total=missions.length;$('sim-count').textContent=`${countAll()} / ${total}`;$('sim-progress-fill').style.width=(countAll()/total*100)+'%'}
function selectMission(id,fromGame=false){const m=M(id);if(!m)return;storyOverride=true;document.querySelector("#simulator-screen")?.classList.remove("gv-drawer-open");document.querySelector("[data-ui=missions]")?.setAttribute("aria-expanded","false");
 state.room=m.room;state.active=id;state.step=0;state.feedback=null;
 render();if(game){game.focusMission(id,state.mode==='on');}
}
function setRoom(id){if(!R(id))return;
 
 state.room=id;state.active=null;state.step=0;state.feedback=null;
 if(game)game.enterRoom(id);render();
}
function setMode(mode){mode='off';if(state.mode===mode)return;storyOverride=null;
 state.mode=mode;state.active=null;state.step=0;state.feedback=null;
 if(game){game.setMode(mode);game.returnMarket();}render();drawModeButtons();
}
function drawModeButtons(){const bOn=$('sim-mode-on'),bOff=$('sim-mode-off');if(!bOn||!bOff)return;
 bOn.classList.toggle('active',state.mode==='on');bOff.classList.toggle('active',state.mode==='off');bOn.setAttribute('aria-pressed',String(state.mode==='on'));bOff.setAttribute('aria-pressed',String(state.mode==='off'));
 $('sim-mode-description').textContent='단일 플레이 · 방문할 공간 또는 교육 상황을 선택하십시오';
}

// Compact by default; OFF mission choices expand automatically. The learner can override.
let storyOverride=null;
function syncStoryPanel(){
 const box=$('sim-story-section'),btn=$('sim-story-toggle'),body=$('sim-case-body');
 if(!box||!btn||!body)return;
 const expand=storyOverride===null?false:storyOverride;
 box.classList.toggle('collapsed',!expand);
 btn.textContent=expand?'▴ 카드 접기':'▾ 카드 펼치기';
 btn.setAttribute('aria-expanded',String(expand));
 body.setAttribute('aria-hidden',String(!expand));
}
function render(){renderRooms();renderCommands();renderScene();renderCase();refreshCount();syncStoryPanel()}
function showExplanation(m){$('sim-explain-overlay').hidden=false;$('sim-explain-title').textContent=m.title+' · 교육 해설';$('sim-explain-scene').textContent=m.lead;$('sim-explain-judge').textContent='고객의 요청과 확인 가능한 정보를 구분하고, 약속할 수 있는 내용만 답합니다.';$('sim-explain-action').textContent=m.steps.map((s,i)=>`${i+1}. ${s.ok}`).join(' → ');$('sim-explain-point').textContent=pad(m.cut)+'컷을 참고하세요. 평가 점수는 산정하지 않습니다.';snd('paper_flip')}
function showPIP(cut){$('sim-pip').hidden=false;$('sim-pip-cap').textContent='제5차시 '+pad(cut)+'컷 연계';$('sim-pip-img').src=window.KAFV_IMAGE_MAP?.[cut]||`assets/${pad(cut)}.webp`;snd('paper_flip')}
function csvCell(v){let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}
function csvExport(){const rows=[['수행시각','공간','미션','실습과제','선택한 행동','기록상태'],...logs.map(x=>[x.time,x.space,x.mission,x.task,x.action,x.status])];const csv='\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='KAFV_제5차시_작업이력.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function init(){const j=$('sim-audio-vol');if(j)j.value=Math.round(volume*100);
 $('sim-audio-toggle').textContent='♫ 배경음악 켜기';
 $('sim-audio-toggle').onclick=()=>{soundOn=!soundOn;$('sim-audio-toggle').textContent=soundOn?'♫ 배경음악 끄기':'♫ 배경음악 켜기';if(game)game.setAudio(soundOn,volume)};
 $('sim-audio-vol').oninput=e=>{volume=Number(e.target.value)/100;if(game)game.setAudio(soundOn,volume)};
 $('sim-audio-test').textContent='♪ 음악 미리듣기';$('sim-audio-test').onclick=()=>{if(!soundOn){soundOn=true;$('sim-audio-toggle').textContent='♫ 배경음악 끄기'}if(game){game.setAudio(true,volume);game.musicTest()}};
 $('sim-to-theory').onclick=()=>window.KAFV_APP?.setView('theory');$('sim-sub-theory').onclick=()=>window.KAFV_APP?.setView('theory');$('sim-sub-game').onclick=()=>window.KAFV_APP?.setView('simulator');$('sim-csv').onclick=csvExport;
 $('sim-reset').onclick=()=>{if(!confirm('제5차시의 체험 기록만 초기화할까요? 33~35번 기록서는 유지됩니다.'))return;logs=[];done.clear();save();state.active=null;state.step=0;state.feedback=null;if(game)game.returnMarket();render()};
 $('sim-explain-close').onclick=()=>$('sim-explain-overlay').hidden=true;$('sim-pip-close').onclick=()=>$('sim-pip').hidden=true;
 ['33','34','35'].forEach(n=>{$('open-form'+n).onclick=()=>window.KAFV_APP?.openPractice(Number(n))});
 $('sim-mode-on').onclick=()=>setMode('on');$('sim-mode-off').onclick=()=>setMode('off');$('sim-story-toggle').onclick=()=>{storyOverride=$('sim-story-section').classList.contains('collapsed');syncStoryPanel()};render();drawModeButtons();
}

window.KAFV_SIM={onView:(which)=>{if(game)game.setAudio(which==='simulator'&&soundOn,volume)},onSlide(n){const m=missions.find(m=>m.cut===n);const btn=$('lecture-sim-link'),off=$('no-practice-note');if(btn){btn.hidden=!m;if(m){btn.onclick=()=>{window.KAFV_APP?.setView('simulator');selectMission(m.id)}}}if(off)off.hidden=!!m},openFromSlide(n){const m=missions.find(m=>m.cut===n);if(m){window.KAFV_APP?.setView('simulator');selectMission(m.id)}},setRoom,selectMission,setMode,stats:()=>({done:[...done],actions:logs.length,rooms:rooms.length,missions:missions.length}),debug:{rooms,missions},getGame:()=>game};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
