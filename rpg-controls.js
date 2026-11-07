/* KAFV Lesson 5 v0.7.0 · interactive indoor fish market, authored 2026-11-07.
   A distinct game artwork and DOM/SVG object engine. Educational virtual facility, not surveyed floor plan.
   Mode ON: scripted lecturer demonstration. Mode OFF: object manipulation, NPC dialogue, transactions.
   Legacy 7 rooms, 24 missions, 48 steps are controlled by simulator.js. */
(()=>{'use strict';
const svgNS='http://www.w3.org/2000/svg';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KL=n=>Number(n).toLocaleString('ko-KR');
const STORES=[
 {n:'장목활어수산',kind:'활어',icon:'🐠',fish:['광어','우럭','참돔'],main:'#168ba9',merchant:'',role:'중도매인'},
 {n:'남해선어수산',kind:'선어',icon:'🐟',fish:['고등어','갈치','삼치'],main:'#2371be',merchant:'',role:'중도매인'},
 {n:'바다패류수산',kind:'패류',icon:'🦪',fish:['굴','바지락','가리비'],main:'#8d77b9',merchant:'',role:'소매상'},
 {n:'동백해산물',kind:'해산물',icon:'🐙',fish:['낙지','전복','문어'],main:'#d27869',merchant:'',role:'소매상'},
 {n:'청정어류수산',kind:'생선류',icon:'🐟',fish:['참돔','전어','민어'],main:'#178f87',merchant:'',role:'중도매인'},
 {n:'장목낙지수산',kind:'낙지',icon:'🐙',fish:['낙지','문어','주꾸미'],main:'#bb755c',merchant:'',role:'소매상'},
 {n:'거제갑각수산',kind:'갑각류',icon:'🦀',fish:['꽃게','새우','대게'],main:'#be6a87',merchant:'',role:'중도매인'},
 {n:'풍어제철수산',kind:'제철어류',icon:'🐟',fish:['고등어','방어','전어'],main:'#7d92b5',merchant:'',role:'소매상'},
 {n:'청해냉동수산',kind:'냉동',icon:'❄',fish:['냉동새우','냉동오징어','냉동고등어'],main:'#5a98c4',merchant:'',role:'중도매인'},
 {n:'장목건어물',kind:'건어물',icon:'🌿',fish:['멸치','건오징어','황태'],main:'#b48c50',merchant:'',role:'소매상'},
 {n:'동백해조수산',kind:'해조류',icon:'🌿',fish:['미역','다시마','톳'],main:'#408f72',merchant:'',role:'소매상'},
 {n:'대양고등어수산',kind:'선어',icon:'🐟',fish:['고등어','삼치','갈치'],main:'#4765a0',merchant:'',role:'중도매인'},
 {n:'바다유통수산',kind:'납품·도매',icon:'📦',fish:['고등어','참돔','냉동새우'],main:'#7f88a8',merchant:'',role:'중도매인'},
 {n:'해풍수산가공',kind:'손질·포장',icon:'📦',fish:['손질고등어','포장전복','손질오징어'],main:'#b57b82',merchant:'',role:'소매상'},
 {n:'장목선구점',kind:'어구·장비',icon:'⚓',fish:['어구','포장재','보냉상자'],main:'#688e92',merchant:'',role:'선구점 상인'}
];
const PRODUCT={
 '광어':['활어','#c4a283',1.3,18000],'우럭':['활어','#758b76',1.1,15500],'참돔':['활어','#e68880',1.5,19000],
 '고등어':['선어','#6095ae',1.2,9000],'갈치':['선어','#afb7ca',1.0,17500],'삼치':['선어','#89acb6',1.4,11000],
 '굴':['패류','#e0c2ac',1.0,8500],'바지락':['패류','#cfb695',1.0,7000],'가리비':['패류','#ddaa84',1.0,15000],
 '낙지':['해산물','#a45e57',0.75,22000],'전복':['해산물','#756e5b',0.85,28000],'문어':['해산물','#bb7a6f',1.8,26000],
 '주꾸미':['해산물','#c28c76',0.8,14000],'전어':['선어','#7fa3ac',1.2,7500],'민어':['선어','#b8a4a8',1.6,24000],
 '꽃게':['갑각류','#df7b70',1.0,21000],'새우':['갑각류','#e19b8b',1.0,17000],'대게':['갑각류','#ca5e57',1.0,46000],
 '방어':['선어','#8aa3af',1.4,16000],'냉동새우':['냉동','#df9f9a',1.0,15000],
 '냉동오징어':['냉동','#b9a4a1',1.0,12000],'냉동고등어':['냉동','#80acbc',1.0,8000],
 '멸치':['건어물','#c7b599',0.5,9000],'건오징어':['건어물','#bc997a',0.5,18000],
 '황태':['건어물','#c3a475',0.6,17500],'미역':['해조류','#426b53',0.5,6000],
 '다시마':['해조류','#61755c',0.5,6500],'톳':['해조류','#6c7352',0.5,7000],
 '손질고등어':['가공','#80a4b2',1.0,12000],'포장전복':['가공','#988d7d',0.5,19500],
 '손질오징어':['가공','#c4a5a0',1.0,14000], '어구':['장비','#6f8499',1,8500], '포장재':['장비','#c0ad86',1,3000], '보냉상자':['장비','#b3c7d1',1,7000]
};
const NPCS=[
 ['일반 손님','일반 손님','visitor',140,407,1],['관광객','관광객','visitor',255,452,-1],['식당 바이어','식당 바이어','buyer',390,370,1],
 ['소매상','소매상','retailer',515,474,-1],['검사원','검사원','inspector',640,405,1],['일반 손님','일반 손님','visitor',750,451,-1],
 ['식당 바이어','식당 바이어','buyer',910,370,-1],['관광객','관광객','visitor',1060,442,1],['소매상','소매상','retailer',1190,389,-1],
 ['일반 손님','일반 손님','visitor',1330,476,1],['하역작업자','하역작업자','worker',1442,404,-1]
];
const MAP_ROOM_STORE={receiving:3,lab:4,cold:8,display:1,dispatch:12,outdoor:10,office:13};
const MISSION_STORE={S01:3,S02:7,S03:2,S04:7,S05:2,S06:4,S07:3,S08:8,S09:13,S10:9,S11:1,S12:10,S13:7,S14:9,S15:12,S16:12,S17:13,S18:7,S19:10,S20:13,S21:13,S22:12,S23:13,S24:12};
function partnerFor(m){if(!m)return {role:'방문 고객',kind:'visitor'};if(['S06','S11','S15','S16'].includes(m.id))return {role:'식당 바이어',kind:'buyer'};if(['S22','S24'].includes(m.id))return {role:'운영 담당자',kind:'inspector'};if(['S18','S19'].includes(m.id))return {role:'관광객',kind:'visitor'};return {role:'방문 고객',kind:'visitor'}};
const SPEECH={
 S01:['처음 왔는데 어떤 생선을 사야 할지 모르겠어요.','어서 오세요. 어떤 요리로 드실 예정이세요?','네 명이 함께 구워 먹을 거예요.','인원과 손질 필요 여부를 확인한 뒤 안내하겠습니다.'],
 S02:['어떤 생선이 저희 가족에게 적합할까요?','몇 분이 드시고 어떤 요리를 하실 예정인가요?','구이용으로 간편한 걸 찾고 있어요.','그 조건에 맞는 상품 두 가지부터 비교해 드리겠습니다.'],
 S03:['세 종류가 비슷해 보이는데 어떻게 고르죠?','조리방법과 예산, 필요한 양을 먼저 여쭤볼게요.','예산이 정해져 있어요.','비교 기준을 정해서 선택을 도와드리겠습니다.'],
 S04:['이 생선이 우리 집 식탁에 어떤 장점이 있나요?','어떤 요리로 드실지에 따라 적합한 특징을 설명드릴게요.','구이로 먹을 거예요.','크기·손질·조리 편의성 중심으로 알려드리겠습니다.'],
 S05:['왜 이쪽 생선이 더 비싸죠?','먼저 중량·규격·단위가 같은지 확인해 보겠습니다.','가격표만 보고 비교했어요.','같은 조건에서 가격과 품질 정보를 비교하겠습니다.'],
 S06:['원산지와 규격을 확인할 수 있을까요?','표시와 실물, 거래기록을 함께 대조하겠습니다.','기록을 보여주실 수 있나요?','확인 가능한 자료로 설명드리겠습니다.'],
 S07:['구입해도 괜찮을지 망설여집니다.','어떤 점이 걱정되시는지 먼저 여쭤봐도 될까요?','상태가 조금 걱정돼요.','확인 가능한 정보와 비교 기준을 보여드리겠습니다.'],
 S08:['이 상품은 어떤 상태이고 어떻게 보관됐나요?','표시와 보관기록에서 확인되는 내용을 설명드리겠습니다.','겉모습만 보고는 모르겠네요.','확인되지 않은 안전성까지 단정하지 않겠습니다.'],
 S09:['산 수산물에서 이상한 냄새가 나요.','말씀해 주셔서 감사합니다. 우선 관련 상품의 판매를 보류하고 확인하겠습니다.','어떤 조치를 하나요?','관련 범위와 기록을 확인하고 필요한 절차를 안내하겠습니다.'],
 S10:['집에서 어떻게 보관하면 좋을까요?','구입하신 상품 상태와 드실 시점을 먼저 확인하겠습니다.','내일 조리할 예정이에요.','품목에 맞는 보관 방법과 주의사항을 설명드리겠습니다.'],
 S11:['저녁 반찬용으로 찾고 있어요.','용도와 필요한 수량을 확인하고 추천드릴게요.','식당에도 납품할 수 있나요?','소매 구매와 대량 납품의 조건을 구분해 안내하겠습니다.'],
 S12:['단가를 들었는데 총 얼마를 내면 되나요?','수량과 포장비, 배송비가 포함되는지 함께 확인하겠습니다.','추가 비용이 있나요?','합계와 적용 조건을 명확히 안내드리겠습니다.'],
 S13:['예약 상품을 받는 시간을 바꾸고 싶어요.','품목·수량·금액·포장·수령시간을 다시 확인하겠습니다.','오후로 바꿔 주세요.','수정된 주문을 서로 확인해 착오를 막겠습니다.'],
 S14:['사람이 많아서 제대로 안내받을 수 있을까요?','순서대로 안내드리고, 확인이 필요한 사항은 정확히 말씀드리겠습니다.','기다릴게요.','모든 고객에게 같은 기본 예절을 지키겠습니다.'],
 S15:['오늘 오후에 식당 납품이 가능할까요?','재고와 출고·배송 가능 시간을 확인한 후 약속드리겠습니다.','시간이 촉박합니다.','실제 가능한 납기만 안내하겠습니다.'],
 S16:['주문한 수산물을 찾으러 왔어요.','주문명세와 실제 상품, 포장 상태와 수량을 확인하겠습니다.','받을 때 무엇을 확인하나요?','인계사항과 보관 안내까지 확인해 드리겠습니다.'],
 S17:['전에 문의드린 건 해결됐을까요?','이전 처리 결과와 불편이 해소됐는지 확인하겠습니다.','아직 궁금한 부분이 있어요.','남은 문제를 확인하여 다시 안내드리겠습니다.'],
 S18:['장목에서 어떤 수산물을 사면 좋을까요?','확인된 상품정보와 이용방법을 안내하겠습니다.','처음 방문했어요.','좋은 방문 경험이 되도록 정확하게 도와드리겠습니다.'],
 S19:['화장실과 안내 시설은 어디에 있나요?','현재 확인된 동선과 시설 위치를 안내하겠습니다.','이동이 편한 길이 있을까요?','실제 이용 가능한 경로로 안내하겠습니다.'],
 S20:['환불을 요청하고 싶습니다.','어떤 부분이 불편하셨는지 먼저 확인하겠습니다.','상품 상태가 걱정돼요.','품질·거래·납기·응대 중 문제 유형을 구분하겠습니다.'],
 S21:['제가 겪은 일이 너무 불편했습니다.','말씀을 끝까지 듣고 내용을 정확히 적겠습니다.','그래서 이렇게 연락드린 거예요.','확인한 내용을 다시 읽어 드리겠습니다.'],
 S22:['받은 물건 상태가 설명과 다른 것 같습니다.','상품·거래내역·사진·로트 정보를 대조하겠습니다.','기록도 확인해 주실 수 있나요?','사실관계를 확인한 뒤 처리하겠습니다.'],
 S23:['확인된 문제는 어떻게 해결해 주나요?','확인된 사실과 가능한 해결안, 처리 시점을 함께 안내하겠습니다.','언제 연락받을 수 있나요?','담당자와 후속 확인 시점을 분명히 하겠습니다.'],
 S24:['비슷한 불만이 또 생긴 것 같아요.','발생 유형과 원인을 기록해 반복되는 문제인지 확인하겠습니다.','다음에는 개선되겠지요?','기록을 점포와 운영주체가 함께 검토하겠습니다.']
};
// Transcribed utterances from verified theory slide artworks for representative missions.
// Other mission dialogue is explicitly a teaching adaptation of the approved scenario/actions.
const SOURCE_DIALOGUES={
 S02:[{who:'고객',text:'생선은 잘 몰라서요.'},{who:'판매자',text:'어떤 요리로 드실 건가요?'},{who:'고객',text:'둘은 왜 가격이 달라요?'},{who:'판매자',text:'크기와 손질 상태를 비교해 드릴게요.'},{who:'고객',text:'바로 가져갈 수 있나요?'},{who:'판매자',text:'준비된 상품과 대기시간을 알려드릴게요.'}],
 S03:[{who:'고객',text:'뭘 골라야 할지 모르겠어요.'},{who:'판매자',text:'구이로 드실 건가요, 조림으로 드실 건가요?'},{who:'판매자',text:'구이용으로 이 두 가지부터 비교해 보세요.'},{who:'고객',text:'두 가지로 보니 고르기 쉽네요.'},{who:'판매자',text:'천천히 보시고 편한 쪽으로 고르세요.'},{who:'고객',text:'조금 더 보고 결정할게요.'}],
 S04:[{who:'소매상',text:'내장과 비늘을 제거해, 집에서 손질할 일을 줄일 수 있습니다.'},{who:'고객',text:'저녁 준비가 한결 편하겠네요.'},{who:'중도매인',text:'규격을 맞춰 공급하면, 분량을 나누고 준비하기 수월합니다.'},{who:'식당 바이어',text:'샘플로 메뉴에 맞는지 확인해 보겠습니다.'}],
 S05:[{who:'고객',text:'왜 이쪽이 더 비싸요?'},{who:'소매상',text:'어떤 차이가 있는지 함께 보실까요?'},{who:'고객',text:'한 팩 가격만 보면 안 되겠네요.'},{who:'소매상',text:'중량과 손질 상태가 같은지 먼저 볼게요.'},{who:'소매상',text:'예산에 맞는 상품과 총액을 안내해 드릴게요.'},{who:'고객',text:'그럼 작은 포장으로 할게요.'}],
 S11:[{who:'고객',text:'손질된 생선이면 가시도 없나요?'},{who:'소매상',text:'내장과 비늘은 제거했지만, 가시는 남아 있습니다.'},{who:'식당 바이어',text:'이번 물량도 합의한 규격과 손질 기준에 맞습니까?'},{who:'중도매인',text:'해당 물량의 검품 기록을 규격서와 대조해 보여드리겠습니다.'}],
 S12:[{who:'고객',text:'포장까지 하면 모두 얼마인가요?'},{who:'소매상',text:'상품값과 포장비를 구분해 총액을 알려드리겠습니다.'},{who:'중도매인',text:'포함 비용과 유효기간, 결제조건을 구분해 명시하겠습니다.'},{who:'식당 바이어',text:'이 견적은 운송비 포함이고, 언제까지 유효합니까?'}],
 S21:[{who:'고객',text:'손질을 부탁했는데, 집에서 다시 해야 했어요.'},{who:'중도매인',text:'번거로우셨겠습니다. 어떤 부분인지 말씀해 주세요.'},{who:'식당 바이어',text:'물건이 안 와서 점심 준비를 못하고 있어요.'},{who:'판매자',text:'예정 시각까지 도착하지 않아 영업 준비에 차질이 생기셨다는 말씀이시죠?'}]
};
const roleTone={visitor:'#f0a25e',buyer:'#7d83cf',inspector:'#2d9e8b',retailer:'#c6805c',worker:'#729db7',merchant:''};
function personSVG(x,y,role,name,small=false,flag=false){
 const c=roleTone[role]||roleTone.merchant,sw=small?0.94:1;
 return `<g class="npc-person" transform="translate(${x} ${y}) scale(${sw})">
 <ellipse cy="14" rx="23" ry="8" fill="#102d43" opacity=".18"/>
 <g class="npc-body"><path d="M-14,-33 Q0,-43 14,-33 L18,1 L-18,1 Z" fill="${c}" stroke="#25485e" stroke-width="2"/><path d="M-8,0 L-8,11 M8,0 L8,11" stroke="#263c51" stroke-width="7" stroke-linecap="round"/><path d="M-15,-24 L-22,-6 M15,-24 L22,-6" stroke="${c}" stroke-width="7" stroke-linecap="round"/><ellipse cx="0" cy="-51" rx="14" ry="16" fill="#eec59e" stroke="#865b45" stroke-width="1.5"/><path d="M-14,-54 Q-13,-73 1,-70 Q15,-67 15,-54 L10,-63 Q0,-58 -11,-60 Z" fill="#263d50"/>${role==='inspector'?'<path d="M-13,-37 H13 V-31 H-13 Z" fill="#fff" opacity=".92"/>':''}${role==='buyer'?'<path d="M10,-8 l16,6 v-14 l-16,-6 Z" fill="#465c75"/>':''}${role==='worker'?'<path d="M-16,-65 Q0,-77 16,-65 L16,-60 H-16 Z" fill="#e9b947"/>':''}<circle cx="-5" cy="-51" r="1.3"/><circle cx="5" cy="-51" r="1.3"/><path d="M-4,-44 Q0,-41 4,-44" fill="none" stroke="#885744" stroke-width="1.2"/></g>
 <g transform="translate(0 32)"><rect x="-45" y="-14" width="90" height="29" rx="9" fill="#fff" stroke="#b9d6db" stroke-width="1.2"/><text text-anchor="middle" y="-2" font-size="11.4" font-weight="800" fill="#2a576b">${E(name)}</text><text text-anchor="middle" y="9" font-size="10.0" fill="#51738a">${E(({visitor:'손님',buyer:'식당 바이어',inspector:'검사원',retailer:'소매상',worker:'하역작업자',merchant:''})[role]||role)}</text></g>
 ${flag?'<g class="mission-mark" transform="translate(19,-80)"><circle r="14" fill="#ffc83d" stroke="#fff" stroke-width="3"/><text text-anchor="middle" y="6" font-size="21" font-weight="900" fill="#553b04">?</text></g>':''}
 </g>`
}
function fishSVG(x,y,c='#77a6b4',sc=1){return `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M-29,-3 L-47,-15 Q-43,0 -47,15 L-28,4" fill="${c}" stroke="#476c7a" stroke-width="2"/><path d="M-30,1 Q-8,-20 25,-7 Q41,2 25,10 Q-9,21 -30,1" fill="${c}" stroke="#345d72" stroke-width="1.8"/><path d="M-5,-13 L7,-23 L14,-9" fill="${c}" stroke="#476c7a" stroke-width="2"/><path d="M-7,12 L3,21 L13,10" fill="${c}" stroke="#476c7a" stroke-width="2"/><path d="M-18,-5 Q-9,-3 -18,7" fill="none" stroke="#e2f5f2" stroke-width="2" opacity=".8"/><circle cx="22" cy="-2" r="3.3" fill="#fff"/><circle cx="23" cy="-2" r="1.7" fill="#183b52"/><path d="M-22,3 L11,6" stroke="#efffff" stroke-width="1.6" opacity=".6"/></g>`}
function seaIcon(x,y,type,c){if(/문어|낙지|주꾸미/.test(type))return `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="-5" rx="24" ry="18" fill="${c}" stroke="#82514b" stroke-width="2"/>${[-22,-12,-2,8,18].map(i=>`<path d="M${i},4 q${i%2?13:-9},22 8,23" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`).join('')}<circle cx="-8" cy="-5" r="3" fill="#fff"/><circle cx="8" cy="-5" r="3" fill="#fff"/></g>`;
 if(/굴|바지락|가리비|전복/.test(type))return `<g transform="translate(${x} ${y})"><path d="M-26,8 Q-29,-16 0,-20 Q31,-16 26,8 Q0,25 -26,8" fill="${c}" stroke="#846c58" stroke-width="2"/>${[-17,-8,0,8,17].map(a=>`<path d="M0,-19 L${a},12" stroke="#ffebcb" opacity=".8"/>`).join('')}</g>`;
 if(/멸치|미역|다시마|톳|황태|건오징어/.test(type))return `<g transform="translate(${x} ${y})"><path d="M-10,21 Q-35,-3 -20,-17 Q-13,-26 0,-9 Q11,-28 22,-15 Q36,5 11,22 Z" fill="${c}" stroke="#64806a" stroke-width="2"/><path d="M0,-12 L0,18" stroke="#d1e0bb" stroke-width="2"/></g>`;
 return fishSVG(x,y,c,0.75)}
function palette(n){return PRODUCT[n]?.[1]||'#7ca7bc'}
function defs(){return `<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#e8f8ff"/><stop offset="1" stop-color="#c4e5ec"/></linearGradient><linearGradient id="floor" x2="0" y2="1"><stop stop-color="#e3ded2"/><stop offset="1" stop-color="#f5e8d4"/></linearGradient><linearGradient id="glass" x2="0" y2="1"><stop stop-color="#b5faff" stop-opacity=".55"/><stop offset="1" stop-color="#1174a7" stop-opacity=".78"/></linearGradient><linearGradient id="wood" x2="0" y2="1"><stop stop-color="#e5b480"/><stop offset="1" stop-color="#a87755"/></linearGradient><linearGradient id="ice" x2="0" y2="1"><stop stop-color="#fafcff"/><stop offset="1" stop-color="#bcd5dd"/></linearGradient><pattern id="tile" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#b9b7ae" stroke-width="1" opacity=".48"/></pattern><pattern id="roof" width="35" height="20" patternUnits="userSpaceOnUse"><path d="M0 0L35 20M35 0L0 20" stroke="#ffffff" opacity=".26"/></pattern><filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#143f56" flood-opacity=".25"/></filter></defs>`}
function boothSVG(s,i,upper){const x=22+(upper?i:i-8)*188+(upper?0:70),y=upper?105:535,w=176,h=187;
 const goods=s.fish.map((f,k)=>seaIcon(x+31+k*54,y+(upper?114:118),f,palette(f))).join('');
 return `<g class="market-booth" data-shop="${i}" role="button" tabindex="0" aria-label="${E(s.n)} 점포에 들어가기" style="cursor:pointer" filter="url(#shadow)">
 <path d="M${x-5},${y+19} L${x+w/2},${y-11} L${x+w+5},${y+19} Z" fill="#eafaff" stroke="${s.main}" stroke-width="3"/>
 <path d="M${x-4},${y+19} L${x+w/2},${y-11} L${x+w+4},${y+19}" fill="none" stroke="#fff" stroke-width="4" opacity=".72"/>
 <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="#fafcfa" stroke="#759db2" stroke-width="2"/>
 <rect x="${x+8}" y="${y+39}" width="${w-16}" height="${h-61}" fill="#e5f3ef" stroke="#bcd6da"/>
 <g class="booth-staff"><ellipse cx="${x+w/2}" cy="${y+87}" rx="19" ry="13" fill="${s.main}"/><circle cx="${x+w/2}" cy="${y+61}" r="11" fill="#eac39e" stroke="#987058"/><path d="M${x+w/2-12},${y+58}q10,-20 24,0" fill="#2e4b56"/></g>
 <rect x="${x+8}" y="${y+80}" width="${w-16}" height="50" rx="5" fill="url(#glass)" stroke="#78b4c4" stroke-width="2"/>
 <path d="M${x+8},${y+80}h${w-16}" stroke="#fff" stroke-width="4" opacity=".8"/>
 <rect x="${x+4}" y="${y+12}" width="${w-8}" height="39" rx="6" fill="${s.main}"/><text x="${x+w/2}" y="${y+37}" font-size="17" font-weight="900" fill="white" text-anchor="middle">${E(s.n)}</text>
 <path d="M${x+8},${y+52}h${w-16} l-7,18 h${-(w-2)}Z" fill="#e7f4ff" stroke="#a7d2df" stroke-width="2"/><path d="M${x+9},${y+64}h${w-17}" stroke="${s.main}" stroke-width="6" stroke-dasharray="25 14"/>
 <rect x="${x+10}" y="${y+136}" width="${w-20}" height="32" rx="4" fill="#e8edf0" stroke="#a2bec9"/>${goods}
 <text x="${x+w/2}" y="${y+162}" text-anchor="middle" font-size="11" font-weight="800" fill="#234e68">${E(s.kind)} · ${E(s.fish.slice(0,2).join(' · '))}</text>
 <rect x="${x+33}" y="${y+172}" width="${w-66}" height="14" rx="7" fill="#0d3853"/><text x="${x+w/2}" y="${y+183}" text-anchor="middle" fill="#fff" font-size="11">${E(s.role)} ${E(s.merchant)}</text>
 </g>`}
function backgroundSVG(){let s=`<svg id="kafv-world-svg" viewBox="0 0 1540 775" preserveAspectRatio="xMidYMid meet" role="img" aria-label="가로 두 줄로 배열한 15개 수산점포와 중앙 고객통로, 움직이는 고객과 항구 연결 장면">${defs()}
 <rect width="1540" height="775" fill="#b6d7e1"/><rect x="0" y="0" width="1540" height="90" fill="url(#sky)"/>
 <rect x="0" y="0" width="1540" height="60" fill="#174c6a"/><path d="M0,62 H1540" stroke="#ffe4a4" stroke-width="8"/><text x="40" y="42" font-size="30" font-weight="900" fill="#fff">장목 수산컴플렉스</text><text x="375" y="40" font-size="15" fill="#d8f3ff">교육용 가상시장 · 활어 · 선어 · 패류 · 건어물 · 냉동 · 유통</text>
 <g transform="translate(1145 4)"><rect x="0" y="4" width="355" height="51" rx="7" fill="#87cde5"/><path d="M0 33 Q55 23 118 34 T243 31 T355 34V55H0Z" fill="#228db5"/><path d="M0 47 Q60 38 130 48 T355 45" fill="none" stroke="#e9faff" stroke-width="2"/><g class="boat-sail"><path d="M41 30h88l-19 11H59Z" fill="#fff"/><path d="M77 28V12h26v16" fill="#f9d796"/><path d="M90 9v-8" stroke="#37586d" stroke-width="3"/></g><text x="190" y="20" fill="#0a4c72" font-size="13" font-weight="900">항구·하역장 연결</text></g>
 <rect y="90" width="1540" height="685" fill="#e4e6df"/><rect y="100" width="1540" height="230" fill="#eaf3f4"/><rect y="527" width="1540" height="248" fill="#eaf3f4"/>
 <rect y="333" width="1540" height="194" fill="url(#floor)"/><rect y="333" width="1540" height="194" fill="url(#tile)"/><rect y="347" width="1540" height="5" fill="#b7afb0" opacity=".6"/><rect y="507" width="1540" height="5" fill="#b7afb0" opacity=".6"/>
 ${[380,440,500].map(y=>`<path d="M0 ${y}H1540" stroke="#fff" opacity=".45" stroke-width="2"/>`).join('')}
 <path d="M6 344H1534 M6 520H1534" stroke="#7b9a9e" stroke-width="7" opacity=".25"/>
 <rect x="0" y="65" width="1540" height="28" fill="#d3e2e8"/>${Array.from({length:12},(_,i)=>`<path d="M${i*145} 60 L${i*145+115} 91" stroke="#7ca4b8" stroke-width="4"/><ellipse cx="${i*145+70}" cy="84" rx="21" ry="7" fill="#fff8c1"/>`).join('')}
 <g opacity=".13">${Array.from({length:17},(_,i)=>`<ellipse cx="${i*90+30}" cy="${365+(i%4)*35}" rx="32" ry="4" fill="#fff"/>`).join('')}</g>
 <text x="750" y="366" text-anchor="middle" font-size="18" font-weight="850" fill="#7b9793" opacity=".6">중앙 공용통로 · 고객 쇼핑 동선 ↔</text>
 ${STORES.map((o,i)=>boothSVG(o,i,i<8)).join('')}
 <g id="market-npc-layer"></g><g id="market-player-layer"></g>
 <g transform="translate(1480 354)"><rect width="45" height="92" rx="9" fill="#e6edf0" stroke="#64859a"/><text text-anchor="middle" x="22" y="24" font-size="21">📦</text><text text-anchor="middle" x="22" y="48" font-size="11">하역</text><text text-anchor="middle" x="22" y="62" font-size="11">연결</text></g>
 </svg>`;return s}
function dialogLayout(){return `<div class="rpg-toolbar"><div class="rpg-toolbar-title"><b id="rpg-location">1층 수산시장 전체</b><span id="rpg-subtitle">2열 부스 · 중앙 고객통로 · 15개 점포</span></div><div class="rpg-tools"><button type="button" id="rpg-back" hidden>← 시장으로</button><span class="rpg-mode-badge" id="rpg-mode-badge">ON · 교재 자동시연</span></div></div>
 <div class="rpg-stage-body" id="rpg-stage-body"><div class="rpg-map" id="rpg-map">${backgroundSVG()}</div><div class="rpg-interior" id="rpg-interior" hidden></div><div class="rpg-help" id="rpg-help">점포를 선택해 내부로 이동할 수 있습니다.</div><div class="rpg-speaker-bubble" id="rpg-speaker-bubble" hidden><b id="rpg-speaker-name"></b><span id="rpg-speaker-line"></span></div><div class="rpg-action-hint" id="rpg-action-hint" hidden></div></div>
 <div class="rpg-dialog" id="rpg-dialog" hidden><div class="rpg-dialog-head"><span class="rpg-dialog-cap" id="rpg-dialog-cap">대화</span><button type="button" id="rpg-dialog-close" aria-label="대화창 닫기">×</button></div><p id="rpg-dialog-text"></p><div class="rpg-dialog-buttons" id="rpg-dialog-buttons"></div></div>
 <div class="rpg-object-panel" id="rpg-object-panel" hidden><header><strong id="rpg-object-title">객체 정보</strong><button id="rpg-object-close" type="button">×</button></header><p id="rpg-object-details"></p><div id="rpg-object-buttons"></div></div>
 <div class="rpg-toast" id="rpg-toast" hidden></div>
 <div class="rpg-status"><div><b>🧭 수산시장 경영 RPG</b><span id="rpg-hint">왼쪽 컨트롤은 자동 시연, 게임 속 객체는 자유조작 모드에서 선택</span></div><div id="rpg-cart-mini">🧺 상품 0건</div></div>`}
function interiorSVG(store,mission=null){const partner=partnerFor(mission);const isDried=['건어물','해조류','어구·장비','손질·포장'].includes(store.kind),isCold=store.kind==='냉동',isWet=['활어','패류','해산물','낙지','갑각류'].includes(store.kind);const f=store.fish;
 return `<svg id="kafv-interior-svg" viewBox="0 0 1420 745" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${E(store.n)} 점포 내부: 수조, 진열대, 전자저울, 저온시설, 계산대와 사람">${defs()}
 <rect width="1420" height="745" fill="#eef8f6"/><rect width="1420" height="410" fill="#f2f9f7"/><path d="M0,410 L1420,410 1420,745 0,745Z" fill="#e2d6c4"/><path d="M0,410 L1420,410 1420,745 0,745Z" fill="url(#tile)"/>
 <rect x="50" y="36" width="1320" height="65" rx="14" fill="${store.main}" stroke="#2f6576" stroke-width="4"/><text x="710" y="78" text-anchor="middle" fill="#fff" font-size="38" font-weight="900">${E(store.n)}</text><text x="710" y="125" text-anchor="middle" fill="#3b6776" font-size="18" font-weight="800">${E(store.kind)} 전문점 · 교육용 점포 내부</text>
 <g data-item="tank" class="interact-item" style="cursor:pointer"><rect x="63" y="209" width="380" height="278" rx="16" fill="#1b799e" filter="url(#shadow)"/><rect x="78" y="227" width="350" height="199" rx="8" fill="${isDried?'#e3d0aa':isCold?'#cde1ed':isWet?'url(#glass)':'url(#ice)'}" stroke="${isDried?'#a98b68':'#e7ffff'}" stroke-width="7"/>
 ${isWet?Array.from({length:10},(_,i)=>`<circle class="tank-bubble b${i%3}" cx="${99+i*29}" cy="${389-(i%4)*18}" r="${3+i%4}" fill="#fff" opacity=".7"/>`).join(''):Array.from({length:3},(_,i)=>`<path d="M85 ${282+i*46}h340" stroke="${isDried?'#9b7b55':'#a8c3ce'}" stroke-width="8"/>`).join('')}
 ${f.slice(0,3).map((a,i)=>`<g class="${isWet?'aquatic-swim sw'+i:'static-goods'}" transform="translate(${160+i*74} ${289+i*24})">${seaIcon(0,0,a,palette(a))}</g>`).join('')}
 <rect x="78" y="431" width="350" height="33" rx="6" fill="#255771"/><text x="254" y="454" text-anchor="middle" font-size="18" font-weight="850" fill="white">${isDried?'건어물·상품 선반':isCold?'냉동상품 보관함':isWet?'활어·패류 수조':'얼음 진열대'} · 클릭</text>
 </g>
 <g data-item="shelf" class="interact-item" style="cursor:pointer"><rect x="478" y="159" width="475" height="206" rx="12" fill="#c0d5d9" stroke="#789ca8" stroke-width="5"/>
 ${[0,1,2].map(row=>`<rect x="492" y="${185+row*57}" width="445" height="10" rx="3" fill="#658fa2"/><rect x="492" y="${206+row*57}" width="445" height="34" rx="4" fill="#edf5f2"/>`).join('')}
 ${f.map((a,i)=>`<g transform="translate(${540+i*147},${228})"><rect x="-53" y="-12" width="106" height="117" rx="8" fill="#fff9ea" stroke="${store.main}" stroke-width="3"/>${seaIcon(0,33,a,palette(a))}<text text-anchor="middle" y="76" font-size="16" font-weight="900" fill="#35536b">${E(a)}</text></g>`).join('')}
 <text x="716" y="388" text-anchor="middle" font-size="20" fill="#225b75" font-weight="900">상품·포장 진열대 · 클릭</text></g>
 <g data-item="cold" class="interact-item" style="cursor:pointer"><rect x="1042" y="150" width="312" height="306" rx="15" fill="#b1cad2" stroke="#779bac" stroke-width="5" filter="url(#shadow)"/><rect x="1061" y="170" width="129" height="260" rx="6" fill="#e2eef2" stroke="#a1bcca" stroke-width="4"/><rect x="1202" y="170" width="133" height="260" rx="6" fill="#d2e6ed" stroke="#92adbc" stroke-width="4"/><rect x="1178" y="250" width="8" height="50" rx="4" fill="#7a9aa8"/><rect x="1209" y="250" width="8" height="50" rx="4" fill="#7a9aa8"/><rect x="1240" y="189" width="73" height="47" rx="6" fill="#173f58"/><text x="1276" y="219" font-size="17" text-anchor="middle" fill="#b5f2fc">2℃*</text><text x="1198" y="479" text-anchor="middle" font-size="19" font-weight="900" fill="#2c617a">냉장·냉동 보관 · 클릭</text></g>
 <g data-item="fish" class="interact-item" style="cursor:pointer"><path d="M447,486 L988,486 L1018,655 L408,655Z" fill="#6a95a8" stroke="#41697f" stroke-width="7" filter="url(#shadow)"/><path d="M468,496 L969,496 L987,602 L445,602Z" fill="url(#ice)"/>
 ${f.map((a,i)=>seaIcon(558+i*170,552,a,palette(a))).join('')}<rect x="458" y="610" width="541" height="37" rx="6" fill="${store.main}"/><text x="729" y="637" text-anchor="middle" font-size="22" font-weight="900" fill="white">수산물 진열대 · 클릭</text></g>
 <g data-item="scale" class="interact-item" style="cursor:pointer"><rect x="1071" y="550" width="295" height="100" rx="12" fill="#b7cbd2" stroke="#426a7f" stroke-width="5"/><rect x="1092" y="569" width="133" height="56" rx="6" fill="#23485d"/><text x="1158" y="605" text-anchor="middle" font-size="27" fill="#a8f5d2" id="rpg-scale-reading">0.00 kg</text><rect x="1250" y="573" width="92" height="46" rx="5" fill="#e0eff1" stroke="#97b6ba"/><text x="1295" y="590" text-anchor="middle" font-size="13" fill="#3b7482">전자저울</text><text x="1295" y="609" text-anchor="middle" font-size="15" font-weight="900" fill="#25546b">계량</text></g>
 <g data-item="merchant" class="interact-item" style="cursor:pointer">${personSVG(670,468,'merchant',store.merchant,false,false)}<rect x="594" y="370" width="156" height="31" rx="12" fill="#23668b"/><text x="672" y="391" text-anchor="middle" fill="#fff" font-size="16" font-weight="900">${E(store.role)}</text></g>
 <g data-item="customer" class="interact-item" style="cursor:pointer">${personSVG(894,469,partner.kind,partner.role,false,true)}</g>
 <g data-item="register" class="interact-item" style="cursor:pointer"><rect x="53" y="551" width="318" height="103" rx="10" fill="#b48a62" stroke="#875e43" stroke-width="4"/><rect x="91" y="572" width="157" height="43" rx="7" fill="#244c59"/><text x="169" y="599" text-anchor="middle" font-size="20" fill="#d4f1e1">계산 · 결제</text><rect x="263" y="575" width="78" height="45" rx="5" fill="#d7ddd6"/><text x="304" y="602" text-anchor="middle" fill="#315971" font-size="15" font-weight="800">거래</text></g>
 <text x="700" y="714" text-anchor="middle" font-size="16" font-weight="800" fill="#597488">*온도·수량·가격은 교육용 예시이며 실제 판매·안전판정 기준이 아닙니다.</text>
 </svg>`}
class MarketRPG{
 constructor(root,rooms,missions,handlers){this.root=root;this.rooms=rooms;this.missions=missions;this.handlers=handlers;this.mode='on';this.audioOn=false;this.volume=.18;this.cart=[];this.selectedProduct=null;this.currentStore=null;this.currentMission=null;this.demoToken=0;this.demoTimer=null;this.musicTimer=null;this.audioCtx=null;this.loopCount=0;this.scene='map';this.player={x:104,y:468,targetX:104,targetY:468};this.npcs=NPCS.map(a=>({name:a[0],role:a[1],kind:a[2],x:a[3],y:a[4],dir:a[5],base:a[3]}));this.lastTime=0;this.speechIndex=0;
 root.innerHTML=dialogLayout();root.classList.add('rpg-scene');this.map=root.querySelector('#rpg-map');this.interior=root.querySelector('#rpg-interior');this.dialog=root.querySelector('#rpg-dialog');this.panel=root.querySelector('#rpg-object-panel');this.toastEl=root.querySelector('#rpg-toast');this.help=root.querySelector('#rpg-help');this.speakerBubble=root.querySelector('#rpg-speaker-bubble');this.actionHint=root.querySelector('#rpg-action-hint');this.attach();this.renderWalkers();this.updateMode();this.raf=requestAnimationFrame(t=>this.tick(t));}
 attach(){this.root.querySelector('#rpg-back').onclick=()=>this.returnMarket();this.root.querySelector('#rpg-dialog-close').onclick=()=>this.closeDialog();this.root.querySelector('#rpg-object-close').onclick=()=>this.closePanel();this.map.addEventListener('click',e=>this.mapClick(e));this.interior.addEventListener('click',e=>this.interiorClick(e));this.root.addEventListener('pointermove',e=>this.hover(e));this.root.addEventListener('pointerleave',()=>this.help.textContent='');this.root.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-shop]')){e.preventDefault();this.openStore(Number(e.target.getAttribute('data-shop')))}});}
 tick(t){let dt=Math.min((t-(this.lastTime||t))/1000,.06);this.lastTime=t;this.animClock=(this.animClock||0)+dt;
 if(this.scene==='map'){
  for(let i=0;i<this.npcs.length;i++){let n=this.npcs[i];n.x+=n.dir*dt*(18+i%5*2);if(n.x>1458||n.x<85)n.dir*=-1;const el=this.root.querySelector(`[data-walker="${i}"]`);if(el)el.setAttribute('transform',`translate(${n.x.toFixed(1)} ${(n.y+Math.sin(this.animClock*6+i)*2).toFixed(1)})`)}
  const p=this.player,d=Math.hypot(p.targetX-p.x,p.targetY-p.y);if(d>2){let speed=Math.min(d,dt*175);p.x+=(p.targetX-p.x)/d*speed;p.y+=(p.targetY-p.y)/d*speed;const el=this.root.querySelector('#rpg-player');if(el)el.setAttribute('transform',`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`)}
 }
 this.raf=requestAnimationFrame(t2=>this.tick(t2))}
 renderWalkers(){const svg=this.map.querySelector('svg');const npcLayer=svg.querySelector('#market-npc-layer');npcLayer.innerHTML=this.npcs.map((n,i)=>`<g tabindex="0" role="button" aria-label="${E(n.role)} ${E(n.name)} 선택" data-walker="${i}" transform="translate(${n.x} ${n.y})" style="cursor:pointer">${personSVG(0,0,n.kind,n.name,true,false)}</g>`).join('');svg.querySelector('#market-player-layer').innerHTML=`<g id="rpg-player" transform="translate(${this.player.x} ${this.player.y})">${personSVG(0,0,'merchant','교육생 아바타',true,false)}</g>`;}
 hover(e){const ob=e.target.closest('[data-shop],[data-walker],[data-item]');if(!ob){this.help.textContent=this.mode==='on'?'ON: 왼쪽 버튼으로 교재 자동시연':'OFF: 점포·인물·상품을 클릭해 기능 선택';return}let type=ob.hasAttribute('data-shop')?'store':ob.hasAttribute('data-item')?'item':'npc';if(type==='store'){const s=STORES[Number(ob.getAttribute('data-shop'))];this.help.textContent=`${s.n} · ${s.kind} | 클릭: 점포 안으로 이동`}
 else if(type==='npc'){const n=this.npcs[Number(ob.getAttribute('data-walker'))];this.help.textContent=`${n.role} ${n.name} | 클릭: 대화·정보`}
 else{const lab={tank:'수조: 수산물 확인',fish:'수산물: 종류·계량·거래',scale:'저울: 무게 측정',shelf:'진열 선반: 취급품목 보기',cold:'냉장·냉동시설: 상태 확인',merchant:'',customer:'고객: 요구 파악',register:'계산대: 거래 내역'};this.help.textContent=lab[ob.getAttribute('data-item')]||'선택 가능한 객체'} }
 mapClick(e){if(this.mode!=='off'){this.toast('ON에서는 왼쪽 공간·미션 버튼으로 자동 시연합니다.');return}
 const b=e.target.closest('[data-shop],[data-walker]');if(b){if(b.hasAttribute('data-shop')){this.openStore(Number(b.getAttribute('data-shop')));return}const n=this.npcs[Number(b.getAttribute('data-walker'))];this.startNpcTalk(n);return}
 const r=this.map.querySelector('svg').getBoundingClientRect();if(!r.width)return;const ar=1540/775;const actual=Math.min(r.width,r.height*ar),actualH=actual/ar;const ox=(r.width-actual)/2,oy=(r.height-actualH)/2;let x=(e.clientX-r.left-ox)*1540/actual,y=(e.clientY-r.top-oy)*775/actualH;
 this.player.targetX=Math.max(65,Math.min(1465,x));this.player.targetY=Math.max(358,Math.min(505,y));this.toast('아바타 이동 중 · 점포를 클릭하면 내부로 들어갑니다.');}
 interiorClick(e){if(this.mode!=='off'){this.toast('ON에서는 왼쪽 컨트롤로 자동 시연합니다.');return}let el=e.target.closest('[data-item]');if(!el)return;this.openItem(el.getAttribute('data-item'))}
 updateMode(){this.root.querySelector('#rpg-mode-badge').textContent=this.mode==='on'?'ON · 교재 자동시연':'OFF · 직접 조작';this.root.classList.toggle('rpg-auto',this.mode==='on');this.root.classList.toggle('rpg-free',this.mode==='off');this.root.querySelector('#rpg-hint').textContent=this.mode==='on'?'왼쪽 1~7번·서브 미션 → 점포 진입·자동 대화·행동':'점포·고객·수산물·수조·저울 클릭 → 선택·거래';}
 setMode(mode){const next=mode==='off'?'off':'on';if(next!==this.mode){this.cancelDemo();this.closePanel();this.closeDialog();this.clearDemoVisuals();this.currentMission=null;}this.mode=next;this.updateMode();this.toast(next==='on'?'ON: 왼쪽 컨트롤로 이론 연계 자동 시연':'OFF: 오른쪽 게임 화면 직접 클릭·조작');}
 setAudio(on,volume){this.audioOn=!!on;this.volume=Math.max(0,Math.min(1,Number(volume??.2)));if(!on){this.stopMusic();return}this.startMusic()}
 startMusic(){if(!this.audioOn||this.musicTimer||document.hidden)return;try{this.audioCtx=this.audioCtx||new (window.AudioContext||window.webkitAudioContext)();this.audioCtx.resume().catch(()=>{});this.noteStep=0;this.musicTimer=setInterval(()=>this.musicStep(),370)}catch{}}
 stopMusic(){if(this.musicTimer){clearInterval(this.musicTimer);this.musicTimer=null}}
 synth(freq,seconds=.22,vol=.028){if(!this.audioCtx||!this.audioOn)return;const c=this.audioCtx,os=c.createOscillator(),g=c.createGain(),now=c.currentTime;os.type='sine';os.frequency.value=freq;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(Math.max(.0001,vol*this.volume),now+.015);g.gain.exponentialRampToValueAtTime(.0001,now+seconds);os.connect(g);g.connect(c.destination);os.start(now);os.stop(now+seconds+.02)}
 musicStep(){if(!this.audioOn)return;const mel=[523,659,784,659,587,698,880,698,523,659,784,988,880,784,698,587,523,659,784,659,493,587,698,587,440,523,659,784,659,587,523,440],idx=this.noteStep++%32;this.synth(mel[idx],.32,.07);if(idx%4===0){this.synth([261,220,174,196][Math.floor(idx/8)],.74,.04)} }
 musicTest(){this.startMusic();this.synth(659,.35,.13)}
 playNote(type){if(!this.audioOn)return;this.startMusic();const freq=type==='stamp'?880:type==='paper_flip'?587:493;this.synth(freq,.13,.045)}
 enterRoom(id){this.room=id;this.root.querySelector('#rpg-location').textContent=this.rooms.find(r=>r.id===id)?.name||'수산시장';if(this.mode==='off')this.returnMarket();}
 focusMission(id,auto=true){const m=this.missions.find(o=>o.id===id);if(!m)return;this.room=m.room;this.currentMission=m;this.cancelDemo();this.openStore(MISSION_STORE[id]??MAP_ROOM_STORE[m.room]??0,{silent:true});if(auto&&this.mode==='on')this.runDemo(m);else{this.toast(`${m.id} ${m.title} · 게임 화면에서 직접 대화·행동을 선택하세요.`);this.markCustomer(true)}}
 openStore(index,opts={}){if(!STORES[index])return;this.currentStore=index;this.scene='interior';this.map.hidden=true;this.interior.hidden=false;this.interior.innerHTML=interiorSVG(STORES[index],this.currentMission);this.root.querySelector('#rpg-back').hidden=false;this.root.querySelector('#rpg-location').textContent=STORES[index].n;this.root.querySelector('#rpg-subtitle').textContent=`${STORES[index].kind} · ${STORES[index].fish.join(' · ')}`;this.closePanel();this.closeDialog();this.clearDemoVisuals();this.refreshScale();if(!opts.silent)this.toast(`${STORES[index].n}에 들어왔습니다. 물체를 직접 선택해 보세요.`)}
 returnMarket(){this.cancelDemo();this.scene='map';this.map.hidden=false;this.interior.hidden=true;this.currentStore=null;this.currentMission=null;this.root.querySelector('#rpg-back').hidden=true;this.root.querySelector('#rpg-location').textContent='장목수산컴플렉스 · 1층 시장';this.root.querySelector('#rpg-subtitle').textContent='15개 독립 부스 · 두 줄 점포 · 중앙 공용통로';this.closePanel();this.closeDialog();this.clearDemoVisuals()}
 cancelDemo(){this.demoToken++;clearTimeout(this.demoTimer);this.demoTimer=null;this.speechIndex=0;this.clearDemoVisuals();this.root.classList.remove('rpg-demo-running')}
 markCustomer(yes){this.root.classList.toggle('rpg-mission-customer',!!yes)}
 runDemo(m){this.cancelDemo();this.markCustomer(true);const token=this.demoToken;this.root.classList.add('rpg-demo-running');const lines=SOURCE_DIALOGUES[m.id]||SPEECH[m.id]||[m.lead,m.steps[0].ok];const partner=partnerFor(m);const seller=STORES[this.currentStore]?.role||'판매자';const series=[{who:'상황',t:m.lead},...lines.map((v,i)=>typeof v==='string'?{who:i%2===0?partner.role:seller,t:v}:{who:v.who,t:v.text}),...m.steps.map((st,i)=>({who:'자동 행동 '+(i+1),t:st.ok})),{who:'학습 정리',t:m.steps.map(s=>s.result).join(' ')}];let k=0;
 const next=()=>{if(token!==this.demoToken||this.mode!=='on')return;if(k>=series.length){this.root.classList.remove('rpg-demo-running');this.handlers.onDemoEnd?.(m.id);this.showDialog('자동 시연 완료',`${m.id} 미션을 교재 내용에 맞춰 시연했습니다. 직접 실습은 OFF 모드에서 수행합니다.`,[{t:'↻ 다시 보기',fn:()=>this.runDemo(m)},{t:'📖 관련 이론 보기',fn:()=>this.handlers.onTheory?.(m.cut)},{t:'닫기',fn:()=>this.closeDialog()}]);return}const line=series[k++];this.showDialog(`${line.who} · ${m.id} / ${m.cut}컷 연계`,line.t,[{t:'⏸ 일시정지',fn:()=>{clearTimeout(this.demoTimer);this.showDialog('시연 일시정지',line.t,[{t:'▶ 계속',fn:next},{t:'↻ 처음부터',fn:()=>this.runDemo(m)}])}},{t:'⏭ 다음 대사',fn:()=>{clearTimeout(this.demoTimer);next()}}]);this.demoVisual(m,line);this.demoTimer=setTimeout(next,k===1?1500:2350)};next()}
 clearDemoVisuals(){if(this.speakerBubble)this.speakerBubble.hidden=true;if(this.actionHint)this.actionHint.hidden=true;this.root.classList.remove('rpg-speaking-seller','rpg-speaking-customer');this.interior.querySelectorAll('.rpg-focus-object').forEach(x=>x.classList.remove('rpg-focus-object'))}
 demoVisual(m,line){this.clearDemoVisuals();const who=line.who;
  if(who==='상황'||who==='학습 정리'){this.actionHint.textContent=line.t;this.actionHint.hidden=false;return}
  if(who.startsWith('자동 행동')){this.actionHint.textContent='▶ '+line.t;this.actionHint.hidden=false;let item=/저울|중량|규격|단가|금액|총액|계량/.test(m.title+' '+line.t)?'scale':/보관|냉동|온도/.test(m.title+' '+line.t)?'cold':/기록|확인|대조|인계/.test(m.title+' '+line.t)?'register':/판매보류|안전/.test(m.title+' '+line.t)?'tank':'fish';this.interior.querySelector(`[data-item="${item}"]`)?.classList.add('rpg-focus-object');if(item==='scale'){const s=this.interior.querySelector('#rpg-scale-reading');if(s)s.textContent='1.20 kg'}return}
  const customer=['식당 바이어','식당 바이어','관광객','고객','운영 담당자'].includes(who);this.speakerBubble.hidden=false;this.speakerBubble.classList.toggle('is-customer',customer);this.speakerBubble.classList.toggle('is-seller',!customer);this.root.classList.add(customer?'rpg-speaking-customer':'rpg-speaking-seller');this.root.querySelector('#rpg-speaker-name').textContent=who;this.root.querySelector('#rpg-speaker-line').textContent=line.t;
 }
 showDialog(cap,msg,buttons=[]){this.dialog.hidden=false;this.root.querySelector('#rpg-dialog-cap').textContent=cap;this.root.querySelector('#rpg-dialog-text').textContent=msg;const c=this.root.querySelector('#rpg-dialog-buttons');c.replaceChildren();buttons.forEach(b=>{const el=document.createElement('button');el.type='button';el.textContent=b.t;el.onclick=b.fn;c.append(el)});}
 closeDialog(){this.dialog.hidden=true;this.clearDemoVisuals()}
 toast(text){this.toastEl.textContent=text;this.toastEl.hidden=false;clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>{this.toastEl.hidden=true},2200)}
 closePanel(){this.panel.hidden=true}
 showPanel(title,desc,buttons){this.panel.hidden=false;this.root.querySelector('#rpg-object-title').textContent=title;this.root.querySelector('#rpg-object-details').textContent=desc;let host=this.root.querySelector('#rpg-object-buttons');host.replaceChildren();buttons.forEach(b=>{let el=document.createElement('button');el.textContent=b.t;el.type='button';el.onclick=b.fn;host.append(el)})}
 startNpcTalk(n){this.showPanel(`${n.role} · ${n.name}`,'직업에 따라 요구하는 상품과 거래 조건이 다릅니다.',[{t:'💬 대화 시작',fn:()=>this.showDialog(n.name,({buyer:'식당 납품용 규격과 납기를 확인하고 싶습니다.',inspector:'표시와 위생관리 내용을 확인하겠습니다.',retailer:'소량 판매용 수산물 가격이 궁금합니다.',visitor:'오늘 먹기 좋은 생선을 찾고 있어요.',worker:'수산물 상자 하역과 운반을 진행하고 있습니다.'})[n.kind]||'무엇을 도와드릴까요?',[{t:'정보 확인하고 응답',fn:()=>this.showDialog('판매자','요청 내용을 확인하고 필요한 사항을 정확히 안내하겠습니다.',[{t:'대화 종료',fn:()=>this.closeDialog()}])}])},{t:'📖 관련 미션 보기',fn:()=>this.handlers.onMission?.(this.missions.find(m=>m.room===this.room)?.id||'S01')}])}
 openItem(item){if(this.currentStore===null)return;const s=STORES[this.currentStore];const names=s.fish;
 if(item==='fish'||item==='tank'||item==='shelf'){this.showPanel(item==='tank'?(['건어물','해조류','어구·장비'].includes(s.kind)?'건어물·상품 선반':s.kind==='냉동'?'냉동상품 보관함':'수산물 수조·진열대'):item==='shelf'?'상품 진열·포장 선반':'수산물 진열대',`취급상품: ${names.join(' · ')}. 실제 가격이 아닌 교육용 가상 상품 데이터입니다.`,names.map(n=>({t:`${n} · 상품정보/선택`,fn:()=>this.productMenu(n)})));return}
 if(item==='scale'){this.showPanel('전자저울',this.selectedProduct?`${this.selectedProduct.n} · 현재 ${this.selectedProduct.kg.toFixed(2)}kg · ${(this.selectedProduct.kg*this.selectedProduct.price).toLocaleString()}원 (예시)`:'먼저 수산물을 선택한 뒤 계량할 수 있습니다.',[{t:'⚖ 선택 상품 무게 재기',fn:()=>this.weigh()},{t:'🧺 장바구니',fn:()=>this.openCart()}]);return}
 if(item==='cold'){this.showPanel('냉장·냉동 보관시설','문을 열어 예시 재고와 온도 표시를 확인합니다. 표시온도만으로 식품 안전을 확정할 수 없습니다.',[{t:'🚪 보관고 열기',fn:()=>this.showPanel('보관시설 내부',`${s.fish.join(' / ')} · 교육용 보관 사례. 온도 예시 2℃ (상품별 적용기준 별도 확인).`,[{t:'보관기록 확인',fn:()=>this.showDialog('기록 확인','입·출고 시간, 로트, 보관온도 이력을 함께 살펴봅니다.',[{t:'확인',fn:()=>this.closeDialog()}])}])}]);return}
 if(item==='merchant'||item==='customer'){this.showPanel(item==='merchant'?`${s.role} ${s.merchant}`:'방문 고객',item==='merchant'?'해당 점포에서 상품과 거래조건을 설명하는 판매자입니다.':'구매 목적과 예산·수량 등 필요한 도움을 질문합니다.',[{t:'💬 대화 시작',fn:()=>this.showDialog(item==='merchant'?s.merchant:'',item==='merchant'?'어떤 상품이 필요하신가요? 규격과 수량을 확인하겠습니다.':'요리용 생선을 사려고 하는데 가격과 손질이 궁금해요.',[{t:'구매 목적·수량 확인',fn:()=>this.showDialog(s.merchant,'몇 분이 드시고, 어떤 조리를 하실 예정인가요?',[])},{t:'상품 보기',fn:()=>this.openItem('fish')}])},{t:'📖 연결 미션 확인',fn:()=>this.handlers.onMission?.(this.missions.find(m=>m.room===this.room)?.id||'S01')}]);return}
 if(item==='register')this.openCart();}
 productMenu(n){const dat=PRODUCT[n]||['상품','#668899',1,10000];const [type,c,kg,price]=dat;this.selectedProduct={n,kg,price,type};this.showPanel(`${n} · ${type}`,`규격: 교육용 예시 / 계량 기준 ${kg.toFixed(2)}kg / 가상 단가 ${KL(price)}원/kg. 실제 시세가 아닙니다.`,[{t:'⚖ 전자저울에 올리기',fn:()=>this.weigh()},{t:'🧺 상품 담기',fn:()=>{this.cart.push({...this.selectedProduct});this.updateCart();this.toast(`${n} ${kg.toFixed(2)}kg 담기 완료 (교육용)`)}},{t:'다른 수산물 선택',fn:()=>this.openItem('fish')}]);this.refreshScale()}
 weigh(){if(!this.selectedProduct){this.toast('먼저 수산물을 선택해 주십시오.');return}const p=this.selectedProduct;this.refreshScale();this.showPanel('전자저울 · 계량 결과',`${p.n} ${p.kg.toFixed(2)}kg × ${KL(p.price)}원/kg = ${KL(Math.round(p.kg*p.price))}원 (교육용 가상값)`,[{t:'− 0.1 kg',fn:()=>{p.kg=Math.max(.1,Math.round((p.kg-.1)*10)/10);this.weigh()}},{t:'+ 0.1 kg',fn:()=>{p.kg=Math.round((p.kg+.1)*10)/10;this.weigh()}},{t:'🧺 계량상품 담기',fn:()=>{this.cart.push({...p});this.updateCart();this.toast('상품이 장바구니에 담겼습니다.')}}])}
 refreshScale(){const s=this.interior.querySelector('#rpg-scale-reading');if(s)s.textContent=(this.selectedProduct?.kg??0).toFixed(2)+' kg'}
 updateCart(){this.root.querySelector('#rpg-cart-mini').textContent=`🧺 상품 ${this.cart.length}건`}
 openCart(){let total=this.cart.reduce((sum,p)=>sum+Math.round(p.kg*p.price),0);this.showPanel('교육용 거래 장바구니',this.cart.length?this.cart.map(p=>`${p.n} ${p.kg.toFixed(2)}kg — ${KL(Math.round(p.kg*p.price))}원`).join(' / ')+`\n총액 ${KL(total)}원 (가상)`:'상품이 없습니다. 수산물을 클릭하고 저울에서 계량해 담아 보세요.',[{t:'✓ 가상 거래 완료',fn:()=>{if(!this.cart.length){this.toast('먼저 수산물을 담아주세요.');return}let d={items:this.cart.map(p=>({name:p.n,qty:p.kg})),total};this.handlers.onTrade?.(d);this.cart=[];this.updateCart();this.closePanel();this.showDialog('가상 거래 완료',`총액 ${KL(total)}원 · 거래명세를 확인하고 인계합니다. 실제 결제는 이루어지지 않습니다.`,[{t:'닫기',fn:()=>this.closeDialog()}])}},{t:'장바구니 비우기',fn:()=>{this.cart=[];this.updateCart();this.openCart()}}])}
 say(speaker,msg){this.showDialog(speaker,msg,[])}
 dismissContext(){this.closeDialog();this.closePanel()}
 destroy(){this.cancelDemo();this.stopMusic();clearTimeout(this.toastTimer);cancelAnimationFrame(this.raf)}
}
window.KAFV_MarketRPG=MarketRPG;window.KAFV_RPG_STORES=STORES;
})();
