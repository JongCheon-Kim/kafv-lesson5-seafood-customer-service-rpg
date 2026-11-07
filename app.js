/* KAFV fifth-session customer-service educational app v0.5.0 development build.
   v0.4.7 MASTER UI inherited. No network/API; only locally verified fifth-session material. */
(()=>{'use strict';
const L=window.KAFV_LECTURES, KB=window.KAFV_KB;
if(!L || !KB){document.body.textContent='교육 데이터 로딩에 실패했습니다. ZIP을 압축 해제한 후 index.html을 실행하세요.';return;}
const slides=[...L.slides];const terms=KB.terms, qa=KB.qa;
const $=id=>document.getElementById(id), $$=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
const norm=t=>String(t||'').normalize('NFKC').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
let n=1,view='theory',chatInitialized=false;
const getSlide=i=>slides.find(x=>x.num===i),termForSlide=i=>terms.filter(x=>x.slide===i), el=(tag,className,text)=>{const x=document.createElement(tag);if(className)x.className=className;if(text!==undefined)x.textContent=text;return x;};
function cutNum(i){return String(i).padStart(2,'0')}
function setView(which){if(!['theory','practice','simulator'].includes(which))which='theory';view=which;for(const section of ['theory','practice','simulator']){$(section+'-screen').hidden=(section!==which)}$('parts-nav').hidden=which!=='theory';$('theory-tab').classList.toggle('selected',which==='theory');$('practice-tab').classList.toggle('selected',which!=='theory');window.KAFV_SIM?.onView(which)}
function setSlide(i){n=Math.min(35,Math.max(1,i));const s=getSlide(n);setView('theory');$('part-name').textContent=`PART ${cutNum(s.part)} · ${L.parts[s.part-1]}`;$('lecture-title').textContent=`${cutNum(n)}컷 · ${s.title}`;$('lecture-text').textContent=s.core;
$('image-guide').textContent=s.image;
$('slide-image').src=s.img;$('slide-image').alt=`${cutNum(n)}컷 · ${s.title}`;$('slide-foot').textContent=`${cutNum(n)}컷`; $('image-title').textContent=s.title;
const chips=$('term-chips');chips.replaceChildren();for(const t of termForSlide(n)){const b=el('button','pill',t.name);b.type='button';b.title='부캉이에게 이 용어 질문하기';b.addEventListener('click',()=>{openChat();sendMessage(t.name+'이란?')});chips.appendChild(b)}
$('slide-select').value=String(n);$('slide-foot-head').textContent=`${cutNum(n)} / 35`;$('prev-slide').disabled=n===1;$('next-slide').disabled=n===35;$$('.part').forEach(x=>x.classList.toggle('active',Number(x.dataset.part)===s.part));renderSuggestions();
$('lecture-scroll').scrollTop=0;window.KAFV_SIM?.onSlide(n);
// Remember only the selected slide, not personal details.
try{localStorage.setItem('kafv_lesson5_slide_050',String(n))}catch{}
}
function createNavigation(){
const container=$('slide-select');for(let i=1;i<=35;i++){const op=el('option','',cutNum(i)+' · '+getSlide(i).title);op.value=String(i);container.appendChild(op)}container.addEventListener('change',()=>setSlide(Number(container.value)));
$$('.part').forEach((b,j)=>{b.dataset.part=String(j+1);b.addEventListener('click',()=>setSlide(slides.find(s=>s.part===j+1).num))});
$('prev-slide').addEventListener('click',()=>setSlide(n-1));$('next-slide').addEventListener('click',()=>setSlide(n+1));
$('theory-tab').addEventListener('click',()=>setView('theory'));
$('practice-tab').addEventListener('click',()=>setView('simulator'));
$('slide-image').addEventListener('click',()=>openZoom());$('zoom-slide').addEventListener('click',openZoom);$('close-zoom').addEventListener('click',()=>{$('zoom-overlay').hidden=true});
$('zoom-overlay').addEventListener('click',e=>{if(e.target===$('zoom-overlay'))$('zoom-overlay').hidden=true});

document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('zoom-overlay').hidden=true}else if(view==='theory'&&!$('chat').classList.contains('open')&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){if(e.key==='ArrowRight')setSlide(n===35?1:n+1);if(e.key==='ArrowLeft')setSlide(n===1?35:n-1)}});
}
function openZoom(){$('zoom-image').src=getSlide(n).img;$('zoom-image').alt=getSlide(n).title;$('zoom-overlay').hidden=false}
/* Q&A resolver. It does not synthesize unsupported facts. */
function ngrams(s,len=2){s=norm(s);return new Set(Array.from({length:Math.max(0,s.length-len+1)},(_,i)=>s.slice(i,i+len)))}
function similarity(a,b){const na=ngrams(a),nb=ngrams(b);if(!na.size||!nb.size)return 0;let k=0;for(const x of na)if(nb.has(x))k++;return 2*k/(na.size+nb.size)}
const aliasList=terms.flatMap((t,ti)=>t.aliases.map(a=>({ti,raw:a,s:norm(a)}))).filter(x=>x.s.length>=2).sort((a,b)=>b.s.length-a.s.length);
function identifyTerms(q){const nq=norm(q),hits=[];
for(const a of aliasList){if(!a.s)continue;
 // Exact alias or a clearly contained term. Avoid single-letter acronym matches.
 if(nq===a.s || (a.s.length>=2 && nq.includes(a.s))){const term=terms[a.ti];let score=(nq===a.s?120:Math.min(80,a.s.length*6))+(term.slide===n?10:0);if(!hits.some(h=>h.term.name===term.name))hits.push({term,score});}}
return hits.sort((a,b)=>b.score-a.score);
}
function shortDef(t){const eng=t.english&&!norm(t.name).includes(norm(t.english))?` (${t.english})`:'';
const d=t.definition.replace(/^\s+/,'').replace(/\s+$/,'');return `${t.name}${eng}: ${d}`;
}
function resolve(q){const nq=norm(q);if(!nq)return {answer:'용어나 질문을 입력해 주세요.',refs:[]};
const hits=identifyTerms(q);
// Verified fifth-session glossary Q&A only. High-confidence matching.
const ranked=qa.map(item=>({item,score:similarity(q,item.question)+(item.slide===n?0.08:0)})).sort((a,b)=>b.score-a.score);
if(ranked[0]?.score>=0.72 && (!hits.length || ranked[0].score>=0.89))return {answer:ranked[0].item.answer,refs:[ranked[0].item.slide]};
if(hits.length){const t=hits[0].term;return {answer:shortDef(t),refs:t.slide?[t.slide]:[]};}
if(ranked[0]?.score>=0.72)return {answer:ranked[0].item.answer,refs:[ranked[0].item.slide]};
return {answer:'현재 제5차시 용어자료에서 확인 가능한 답을 찾지 못했습니다. 정확한 용어를 짧게 입력하거나 강사에게 문의해 주세요.',refs:[]};}
function addMessage(body,type,refs){const msg=el('div',`msg ${type}`,body);if(refs&&refs.length){const refsEl=el('div','msg-ref','관련 강의: '+[...new Set(refs)].map(cutNum).join('·')+'컷');msg.appendChild(refsEl);for(const ref of [...new Set(refs)]){if(ref<1||ref>35)continue;const b=el('button','ref-btn',`${cutNum(ref)}컷 보기`);b.type='button';b.addEventListener('click',()=>setSlide(ref));msg.appendChild(b)}}$('msgs').append(msg);$('msgs').scrollTop=$('msgs').scrollHeight;}

const bukkangiHelpTopics = [["01 이론", "35컷 이미지를 보면서 왼쪽 강의록의 ①핵심 나레이션 ②주요 용어 ③그림 해설을 확인합니다. 정식 제5차시 나레이션은 파일 확인 후 연결됩니다."], ["이 이미지 실습하기", "실습 미션과 연결된 컷에서 녹색 버튼으로 해당 실습으로 이동합니다."], ["02 실습", "7개 공간의 24개 미션과 33·34·35번 실습기록서를 이용할 수 있습니다. 작업이력은 CSV로 보관합니다."], ["부캉이", "확인된 용어를 질문할 수 있습니다. AI 외부 서비스에 연결되지는 않습니다."], ["주의사항", "실제 상품의 안전성과 고객 보상·법적 책임을 자동 판단하는 앱이 아닙니다."]];
function showBukkangiHelp(){
 const msg=el('article','msg bot help-content');
 msg.setAttribute('aria-label','부캉이 사용방법');
 msg.appendChild(el('strong','help-title','📖 부캉이 사용방법 안내'));
 for(const [topic,description] of bukkangiHelpTopics){
  const group=el('section','help-topic');
  group.appendChild(el('strong','',topic));
  group.appendChild(el('p','',description));
  msg.appendChild(group);
 }
 $('msgs').appendChild(msg);
 $('msgs').scrollTop=$('msgs').scrollHeight;
}
function sendMessage(q){const text=String(q||'').trim();if(!text)return;addMessage(text,'user');if(['도움말','사용법','사용방법','help','헬프'].includes(norm(text))){showBukkangiHelp()}else{const reply=resolve(text);addMessage(reply.answer,'bot',reply.refs)}$('ask').value='';}
function renderSuggestions(){const node=$('suggest-chips');if(!node)return;node.replaceChildren();const ts=termForSlide(n).slice(0,4);for(const t of ts){const b=el('button','pill',t.name+'?');b.type='button';b.addEventListener('click',()=>sendMessage(t.name+'이란?'));node.appendChild(b)}const s=getSlide(n);if(s?.question){const b=el('button','pill','현장 질문');b.type='button';b.title=s.question;b.addEventListener('click',()=>sendMessage(s.question));node.appendChild(b)}}
function initChat(){const fab=$('shark-fab'),chat=$('chat'),hdr=$('chat-head'),grip=$('resize-grip');
$('chat-form').addEventListener('submit',e=>{e.preventDefault();sendMessage($('ask').value);$('ask').focus()});
$('bukangi-help').addEventListener('click',()=>{showBukkangiHelp();});
$('close-chat').addEventListener('click',()=>{chat.classList.remove('open');fab.classList.remove('chat-is-open');fab.focus()});
function keepInside(node){const b=node.getBoundingClientRect();const left=Number.isFinite(parseFloat(node.style.left))?parseFloat(node.style.left):b.left,top=Number.isFinite(parseFloat(node.style.top))?parseFloat(node.style.top):b.top;node.style.left=Math.min(Math.max(6,left),Math.max(6,innerWidth-b.width-6))+'px';node.style.top=Math.min(Math.max(6,top),Math.max(6,innerHeight-b.height-6))+'px';node.style.right='auto';node.style.bottom='auto'}
function openChat(){chat.classList.add('open');fab.classList.add('chat-is-open');if(!chatInitialized){const b=fab.getBoundingClientRect(),w=Math.min(350,innerWidth-14),h=Math.min(490,innerHeight-14);chat.style.width=w+'px';chat.style.height=h+'px';chat.style.left=Math.max(6,Math.min(innerWidth-w-6,b.right-w))+'px';chat.style.top=Math.max(6,Math.min(innerHeight-h-6,b.top-h-12))+'px';chatInitialized=true}keepInside(chat);renderSuggestions();$('ask').focus()}
window.KAFV_BUKANGI={resolve,open:openChat,send:sendMessage,terms:terms.length};
// Floating round shark: pointer drag + click if stationary
let drag=null;fab.addEventListener('pointerdown',e=>{if(e.button!==0)return;const r=fab.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,ox:r.left,oy:r.top,moved:false};fab.setPointerCapture(e.pointerId);fab.classList.add('dragging');fab.classList.remove('fab-wave');e.preventDefault()});fab.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)drag.moved=true;if(drag.moved){fab.style.left=Math.max(4,Math.min(innerWidth-fab.offsetWidth-4,drag.ox+dx))+'px';fab.style.top=Math.max(4,Math.min(innerHeight-fab.offsetHeight-4,drag.oy+dy))+'px';fab.style.right='auto';fab.style.bottom='auto'}});fab.addEventListener('pointerup',e=>{if(!drag)return;const moved=drag.moved;drag=null;fab.classList.remove('dragging');if(!moved)openChat()});fab.addEventListener('pointercancel',()=>{drag=null;fab.classList.remove('dragging')});fab.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openChat()}});
// Movable yellow chat header, except control buttons
let paneDrag=null;hdr.addEventListener('pointerdown',e=>{if(e.target.closest('button')||e.button!==0)return;const r=chat.getBoundingClientRect();paneDrag={x:e.clientX,y:e.clientY,left:r.left,top:r.top};hdr.setPointerCapture(e.pointerId);e.preventDefault()});hdr.addEventListener('pointermove',e=>{if(!paneDrag)return;chat.style.left=(paneDrag.left+e.clientX-paneDrag.x)+'px';chat.style.top=(paneDrag.top+e.clientY-paneDrag.y)+'px';chat.style.right='auto';chat.style.bottom='auto';keepInside(chat)});hdr.addEventListener('pointerup',()=>paneDrag=null);hdr.addEventListener('pointercancel',()=>paneDrag=null);
// Optional resize grip (mobile and desktop), with an explicit reset button
let sizing=null;grip.addEventListener('pointerdown',e=>{if(e.button!==0)return;const r=chat.getBoundingClientRect();sizing={x:e.clientX,y:e.clientY,w:r.width,h:r.height};grip.setPointerCapture(e.pointerId);e.preventDefault()});grip.addEventListener('pointermove',e=>{if(!sizing)return;chat.style.width=Math.min(innerWidth-12,Math.max(Math.min(270,innerWidth-12),sizing.w+e.clientX-sizing.x))+'px';chat.style.height=Math.min(innerHeight-12,Math.max(Math.min(330,innerHeight-12),sizing.h+e.clientY-sizing.y))+'px';keepInside(chat)});grip.addEventListener('pointerup',()=>sizing=null);grip.addEventListener('pointercancel',()=>sizing=null);
window.addEventListener('resize',()=>{const b=fab.getBoundingClientRect();if(fab.style.left){fab.style.left=Math.min(innerWidth-b.width-4,Math.max(4,b.left))+'px';fab.style.top=Math.min(innerHeight-b.height-4,Math.max(4,b.top))+'px'}if(chat.classList.contains('open')){chat.style.width=Math.min(chat.offsetWidth,innerWidth-12)+'px';chat.style.height=Math.min(chat.offsetHeight,innerHeight-12)+'px';keepInside(chat)}});
}
/* Three usable field forms. Their images are supplied approved practice images, not fake in-image forms. */
const forms=[{"num":33,"title":"실습 1 · 고객에게 맞는 판매응대 연습서","lead":"소매고객 또는 전문 바이어 사례를 고르고, 확인 질문 2개·설명 2문장·마무리 확인 1개를 작성합니다.","fields":[["case","사례 선택","select","소매 고객|전문 바이어"],["writer","작성자·실습팀","text"],["question1","확인 질문 ①","textarea"],["question2","확인 질문 ②","textarea"],["explanation1","고객에게 맞는 설명 ①","textarea"],["explanation2","고객에게 맞는 설명 ②","textarea"],["closing","마무리 확인·약속 ①","textarea"],["pairreview","짝과 점검·수정할 부분","textarea"]]},{"num":34,"title":"실습 2 · 민원 대응 연습서","lead":"중복 청구 또는 납품 규격 문의를 선택하고, 경청·자료 확인·실행 가능한 해결안·처리 결과를 기록합니다.","fields":[["case","사례 선택","select","중복 청구 문의|납품 규격 문의"],["writer","작성자·실습팀","text"],["first","첫 응대 문장","textarea"],["evidence","확인할 자료","textarea"],["verified","확인된 사실·미확인 사항","textarea"],["resolution","확인 후 가능한 해결안","textarea"],["owner","담당자","text"],["when","처리 시점","text"],["followup","처리 후 확인 방법","textarea"],["pairreview","짝과 점검·수정할 부분","textarea"]]},{"num":35,"title":"실습 3 · 함께 지킬 서비스 개선계획","lead":"한 가지 문제를 골라 실천 행동·담당자·완료기한·확인 방법·공유 대상을 기록합니다.","fields":[["place","점포 또는 공용공간","text"],["issue","개선할 문제","textarea"],["action","실천할 행동","textarea"],["owner","담당자","text"],["deadline","완료 기한","text"],["check","확인 날짜·방법","textarea"],["share","공유할 대상","text"],["checklist","실행 전 확인사항","textarea"]]}]
let activeForm=33;const memoryForms={};let practiceReturn={view:'simulator',slide:1};
function renderForm(num){activeForm=num;const schema=forms.find(f=>f.num===num);$('practice-title').textContent=schema.title;$('practice-lead').textContent=schema.lead;$('practice-image').src=(window.KAFV_IMAGE_MAP&&window.KAFV_IMAGE_MAP[num])||`assets/${num}.webp`;$('practice-image').alt=schema.title+' 교육자료';
$$('[data-practice]').forEach(x=>x.classList.toggle('active',Number(x.dataset.practice)===num));
const host=$('practice-fields');host.replaceChildren();let saved=memoryForms[num]||{};if(!memoryForms[num]){try{saved=JSON.parse(localStorage.getItem('kafv_lesson5_form_050_'+num)||'{}')}catch{}}
for(const [key,label,type,optionStr] of schema.fields){const field=el('label','form-field');const title=el('span','form-label',label);field.appendChild(title);let input;
if(type==='textarea'){input=el('textarea');input.rows=2}else if(type==='select'){input=el('select');const op=el('option','', '선택하세요');op.value='';input.appendChild(op);for(const v of optionStr.split('|')){const o=el('option','',v);o.value=v;input.appendChild(o)}}else{input=el('input');input.type=type;if(type==='number')input.step='any'}
input.name=key;input.value=saved[key]||'';input.id='form-'+key;field.appendChild(input);host.appendChild(field)}
$('practice-notice').textContent='교육용 실습서식입니다. 실제 적용 기준과 점포 운영규정은 별도로 확인하십시오.';
}
function readForm(){const out={};for(const i of $$('#practice-fields input,#practice-fields select,#practice-fields textarea'))out[i.name]=i.value;return out}
function saveForm(){const value=readForm();memoryForms[activeForm]=value;try{localStorage.setItem('kafv_lesson5_form_050_'+activeForm,JSON.stringify(value));$('practice-notice').textContent='이 기기의 브라우저에 저장했습니다. 서버로 전송하지 않습니다.'}catch{$('practice-notice').textContent='현재 창에 임시 저장했습니다. 창을 닫기 전에 CSV로 내보내세요.'}}
function downloadForm(){const schema=forms.find(f=>f.num===activeForm),value=readForm(),escape=v=>{let raw=String(v??'');if(/^[=+@\-\t\r]/.test(raw))raw="'"+raw;return '"'+raw.replaceAll('"','""')+'"'},rows=[['기록항목','기록내용'],...schema.fields.map(f=>[f[1],value[f[0]]||''])];const csv='\ufeff'+rows.map(r=>r.map(escape).join(',')).join('\r\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const u=URL.createObjectURL(blob),a=el('a');a.href=u;a.download='KAFV_실습'+activeForm+'_기록서.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function initForms(){const btns=$('practice-switch');for(const f of forms){const b=el('button','practice-tab',f.title);b.dataset.practice=String(f.num);b.addEventListener('click',()=>renderForm(f.num));btns.appendChild(b)}$('practice-save').addEventListener('click',saveForm);$('practice-download').addEventListener('click',downloadForm);$('practice-reset').addEventListener('click',()=>{if(!confirm('현재 서식을 초기화할까요?'))return;delete memoryForms[activeForm];try{localStorage.removeItem('kafv_lesson5_form_050_'+activeForm)}catch{}renderForm(activeForm)});$('practice-back').addEventListener('click',()=>{if(practiceReturn.view==='theory')setSlide(practiceReturn.slide);else setView('simulator')});renderForm(33)}
window.KAFV_APP={setView,setSlide,getSlide,getSlideNum:()=>n,openChat:()=>window.KAFV_BUKANGI?.open(),openPractice:(num,seed={})=>{if(num>=33&&num<=35){if(view!=='practice')practiceReturn={view,slide:n};$('practice-back').textContent=practiceReturn.view==='theory'?'← 원래 이론 페이지로':'← 공간형 게임으로';if(seed&&Object.keys(seed).length){let prior=memoryForms[num];if(!prior){try{prior=JSON.parse(localStorage.getItem('kafv_lesson5_form_050_'+num)||'{}')}catch{prior={}}}memoryForms[num]={...(prior||{}),...seed}}renderForm(num);setView('practice')}}};createNavigation();initChat();initForms();let remembered=1;try{remembered=Number(localStorage.getItem('kafv_lesson5_slide_050'))||1}catch{};setSlide(remembered);
})();
