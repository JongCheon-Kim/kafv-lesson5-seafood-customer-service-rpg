# 제5차시 v1.0.14 공통 이론 UI — 제작·검수보고서

## 1. 기준 및 변경 경계
- 원본: kafv-lesson5-seafood-customer-service-rpg-main.zip
- 원본 SHA-256: `7ced8703b118d15e7b0eacc66535543da84102e7e7455d601758a8c24b7431eb`
- UI MASTER: 제4차시 v0.4.9 공통 UI 코드 직접 이식; 제3차시 v0.7.20 및 v3 매뉴얼 참조.
- 기존 제5차시 이론 35컷·6 PART·강의록·부캉이 DB(용어 70개, 원본 QA 배열 0개) 그대로 유지. 기존 부캉이는 용어 버튼의 함수 참조 오류만 수정, 사용법 안내의 오래된 문구 정정. 새 지식·답변의 외부 검증이나 신설 없음.
- 실행 로직 변경: index.html, app.js, theory-splitter.js. 신규 theory-ui.js, theory-qr.js, theory-thumbs.js.
- 실습 및 데이터/미디어 관련 112개 파일(rpg*, simulator*, data/, game-art/, assets/) SHA-256 원본과 일치.
- RPG 배경음악과 효과음은 독립 기능이므로 이론의 효과음 버튼을 기존 RPG의 SFX 스위치와 연결. 배경음악 동작은 기존 엔진 유지.
- PART 6개를 6열/3열/2열 반응형으로 표시. 원본 강의 해상도 보존.
- 썸네일 35장 전용 WebP 내장 JS: 317,964 bytes, 강의 원본 35장 합계 8,838,114 bytes. 체감 속도 개선은 측정·검증하지 않음.

## 2. 검수 방법과 범위
- ZIP CRC 검사, 원본 배포 manifest의 115개 해시 일치 검사.
- 자바스크립트 구문 검사와 참조된 .js/.css 파일의 존재 검사.
- Chromium 실제 브라우저 시험: 배포 폴더에서 HTML에 연결된 JS/CSS를 읽어 메모리 테스트 HTML을 만들고, 상대 미디어 URL을 동일 원본 바이트 data URL로 치환하는 시험 어댑터 사용. 원래 파일 실행 내용은 보존되지만 직접 배포본과 동일한 로딩 방식은 아님.
- `file://` 및 https 테스트 URL 브라우저 탐색은 환경 정책 ERR_BLOCKED_BY_ADMINISTRATOR로 직접 검사하지 못함. 실제 Windows/온라인/실기기, 장시간 음향 청취, 모든 미션·거래·하역 단계 전수 수행은 미검증.
- QR 렌더링 및 OpenCV 해독: `https://jongcheon-kim.github.io/kafv-lesson5-seafood-customer-service-rpg/` 일치.
- 102개 자동 검사 항목 모두 통과. PASS/LOCK은 사용자 승인 및 실배포 검수 후 확정.
- 로딩 오류를 막기 위해 변경 파일 PATCH 대신 모든 의존 파일을 넣은 FULL ZIP을 제공합니다. 단일 HTML 통합은 기존 복잡한 RPG 경로와 음향 관리에 불필요한 영향을 피하기 위해 이번 범위에서 제외.

## 3. 자동 검사 상세
1. PASS — initialization
2. PASS — 6 parts
3. PASS — initial thumbnails hidden
4. PASS — cut 1
5. PASS — cut 2
6. PASS — cut 3
7. PASS — cut 4
8. PASS — cut 5
9. PASS — cut 6
10. PASS — cut 7
11. PASS — cut 8
12. PASS — cut 9
13. PASS — cut 10
14. PASS — cut 11
15. PASS — cut 12
16. PASS — cut 13
17. PASS — cut 14
18. PASS — cut 15
19. PASS — cut 16
20. PASS — cut 17
21. PASS — cut 18
22. PASS — cut 19
23. PASS — cut 20
24. PASS — cut 21
25. PASS — cut 22
26. PASS — cut 23
27. PASS — cut 24
28. PASS — cut 25
29. PASS — cut 26
30. PASS — cut 27
31. PASS — cut 28
32. PASS — cut 29
33. PASS — cut 30
34. PASS — cut 31
35. PASS — cut 32
36. PASS — cut 33
37. PASS — cut 34
38. PASS — cut 35
39. PASS — thumbs visible
40. PASS — thumbs hidden
41. PASS — panel hidden
42. PASS — panel restored
43. PASS — splitter drag
44. PASS — fullscreen part 1
45. PASS — fullscreen thumb part 1
46. PASS — fullscreen click restore part 1
47. PASS — fullscreen part 2
48. PASS — fullscreen thumb part 2
49. PASS — fullscreen click restore part 2
50. PASS — fullscreen part 3
51. PASS — fullscreen thumb part 3
52. PASS — fullscreen click restore part 3
53. PASS — fullscreen part 4
54. PASS — fullscreen thumb part 4
55. PASS — fullscreen click restore part 4
56. PASS — fullscreen part 5
57. PASS — fullscreen thumb part 5
58. PASS — fullscreen click restore part 5
59. PASS — fullscreen part 6
60. PASS — fullscreen thumb part 6
61. PASS — fullscreen click restore part 6
62. PASS — PIP open
63. PASS — PIP move
64. PASS — PIP resize
65. PASS — PIP max
66. PASS — PIP restore
67. PASS — PIP fullscreen image docks
68. PASS — PIP dock
69. PASS — Escape restore
70. PASS — QR SVG and correct URL
71. PASS — term opens chat
72. PASS — term answer
73. PASS — form link 33
74. PASS — form 33
75. PASS — form save 33
76. PASS — form CSV 33
77. PASS — return form 33
78. PASS — form link 34
79. PASS — form 34
80. PASS — form save 34
81. PASS — form CSV 34
82. PASS — return form 34
83. PASS — form link 35
84. PASS — form 35
85. PASS — form save 35
86. PASS — form CSV 35
87. PASS — return form 35
88. PASS — game entry and PIP closed
89. PASS — 7 rooms 24 missions
90. PASS — 15 shop doors
91. PASS — store entry
92. PASS — object hotspots
93. PASS — return theory from store
94. PASS — header SFX control
95. PASS — harbor entry
96. PASS — harbor step buttons
97. PASS — return theory from harbor
98. PASS — header CSV
99. PASS — return theory
100. PASS — viewport 1024
101. PASS — viewport 390
102. PASS — JS errors 0

## 4. 원본 보존
원본 ZIP은 수정하지 않았습니다. `DEPLOY_MANIFEST.json`은 이번 배포본 해시 목록으로 갱신했습니다. 최종 성공본 승인 후 새 Git 커밋과 ZIP을 함께 보존하십시오.
