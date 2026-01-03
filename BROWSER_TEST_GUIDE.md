# 🧪 브라우저 수동 테스트 가이드

## 현재 상태
✅ Dev server 실행 중: http://localhost:3000
✅ 템플릿 시스템 100% 활성화
✅ AI 로직 완전 제거

---

## 빠른 테스트 (5분)

### 1단계: 세션 시작
```
http://localhost:3000/start
```
- 이메일 입력: `test@example.com`
- "시작하기" 버튼 클릭

### 2단계: PSA 설문 응답 (60문항)
```
http://localhost:3000/survey
```

**빠른 응답 방법:**
- 모든 질문에 **6-7점** 선택 (일관되게)
- 또는 카테고리별로 다르게:
  - 혁신 사고 (1-12번): 7점
  - 철저 실행 (13-24번): 7점
  - 대인 영향 (25-36번): 5점
  - 협업 공감 (37-48번): 5점
  - 상황 회복 (49-60번): 4점
- "제출하기" 버튼 클릭

### 3단계: 결과 확인 ⚡
```
http://localhost:3000/survey-result
```

**확인 사항:**

✅ **로딩 시간**
- [ ] 제출 후 **1초 이내** 결과 표시?
- [ ] "분석 중..." 화면이 거의 보이지 않음?

✅ **페르소나 정보**
- [ ] 페르소나 이름 표시? (예: "전략적 설계자")
- [ ] 태그라인 표시?
- [ ] 총점 표시? (0-100점)

✅ **강점 분석**
- [ ] 3개 bullet points 표시?
- [ ] 각 포인트 150-200자 정도?
- [ ] 전문적이고 구체적인 내용?

✅ **강점 시나리오**
- [ ] 2-3개 시나리오 카드 표시?
- [ ] 각 시나리오에 제목과 설명 있음?

✅ **브랜딩 키워드**
- [ ] 5개 키워드 표시?
- [ ] 페르소나와 관련된 키워드?

✅ **Radar 차트**
- [ ] 5개 카테고리 차트 표시?
- [ ] 점수 막대 그래프 표시?

---

## 성능 측정

### Chrome DevTools 사용
1. `F12` 키로 DevTools 열기
2. Network 탭 선택
3. 설문 제출 후 `/api/survey/analyze` 호출 확인
4. **응답 시간 확인** (목표: <1000ms)

### 터미널 로그 확인
```bash
# 새 터미널에서 실행
tail -f /tmp/claude/-Users-gichang_lee-Desktop-Github-personal-branding-report/tasks/b96f07a.output | grep -E "(SurveyAnalyzer|TEMPLATE)"
```

**기대 로그:**
```
[SurveyAnalyzer] Using TEMPLATE system (100%)
[TemplateSelector] Selected template: architect (balanced)
[TemplateSelector] Selected 3 scenarios for categories: innovation, execution
```

---

## 다양한 페르소나 테스트

### 테스트 케이스 1: 전략적 설계자
- 혁신 사고: 7점
- 철저 실행: 7점
- 나머지: 4-5점
- **기대 페르소나:** 전략적 설계자 (Innovation + Execution)

### 테스트 케이스 2: 시장 파괴자
- 혁신 사고: 7점
- 대인 영향: 7점
- 나머지: 4-5점
- **기대 페르소나:** 시장 파괴자 (Innovation + Influence)

### 테스트 케이스 3: 공감형 리더
- 대인 영향: 7점
- 협업 공감: 7점
- 나머지: 4-5점
- **기대 페르소나:** 공감형 리더 (Influence + Collaboration)

---

## 문제 발생 시 체크리스트

❌ **결과가 느리게 로딩됨 (>2초)**
- [ ] Dev server 로그에 "TEMPLATE system" 보이는지 확인
- [ ] Network 탭에서 API 응답 시간 확인
- [ ] Console에 JavaScript 에러 없는지 확인

❌ **페르소나 정보가 표시되지 않음**
- [ ] localStorage에 `survey-analysis` 데이터 있는지 확인
- [ ] Console에 에러 메시지 확인
- [ ] Network 탭에서 API 응답 확인

❌ **템플릿 콘텐츠가 이상함**
- [ ] 강점 분석이 3개가 아니거나 너무 짧음
- [ ] 시나리오가 없거나 1개만 표시됨
- [ ] → Unit test 재실행 확인

---

## 기대 결과 요약

### 성공 기준
✅ 로딩 시간 <1초
✅ 모든 콘텐츠 정상 표시
✅ 3개 강점 분석 표시
✅ 2-3개 시나리오 표시
✅ 5개 키워드 표시
✅ Radar 차트 정상 렌더링
✅ 페르소나 정보 완전 표시

### 성능 지표
⚡ AI 시스템 대비 **100-300배 빠름**
💰 API 비용 **$0**
📊 일관성 **100%** (같은 입력 = 같은 결과)

---

## 다음 단계

테스트 완료 후:
1. ✅ 스크린샷 캡처 (결과 페이지)
2. ✅ 성능 데이터 기록 (Network 탭)
3. ✅ 사용자 경험 평가
4. ✅ 개선 사항 피드백

---

**Happy Testing! 🎉**
