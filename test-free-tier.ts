import { chromium } from 'playwright';

/**
 * 무료 티어 플로우 간단 테스트
 * Start → Survey → Survey Result
 */

async function testFreeTier() {
  console.log('🚀 무료 리포트 발행 플로우 테스트 시작\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // 각 동작을 0.5초씩 천천히 실행하여 시각적으로 확인
  });
  const page = await browser.newPage();

  try {
    // ========== 1. Survey 페이지 ==========
    console.log('📝 Step 1: PSA 설문 시작');
    await page.goto('http://localhost:3000/survey');
    await page.waitForTimeout(2000); // 질문 로딩 대기

    console.log('   페이지 로드 완료');

    // 실제 질문 ID 가져오기
    const questionsData = await page.evaluate(async () => {
      const res = await fetch('/api/survey/questions');
      const data = await res.json();
      return data.data.questions;
    });

    console.log(`   총 ${questionsData.length}개 질문 로드됨`);

    // 모든 질문에 중간 값(5) 답변
    const answers: Record<string, number> = {};
    questionsData.forEach((q: any) => {
      answers[q.id] = 5;
    });

    // localStorage에 답변 주입 (빠른 테스트를 위해)
    await page.evaluate((answersData) => {
      localStorage.setItem('survey-answers', JSON.stringify(answersData));
    }, answers);

    // 페이지 리로드하여 답변 적용
    await page.reload();
    await page.waitForTimeout(1000);

    console.log('   모든 질문에 답변 완료 (점수: 5/7)');

    // 마지막 페이지(10페이지)로 이동
    console.log('   마지막 페이지로 이동...');
    const page10Button = page.locator('button[data-page-number="10"]');
    await page10Button.click();
    await page.waitForTimeout(500);

    // 제출 버튼 클릭 (마지막 페이지에서만 표시됨)
    console.log('   제출 버튼 클릭...');
    const submitButton = page.locator('button:has-text("결과 확인하기")');
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    await submitButton.click();
    console.log('   "결과 확인하기" 버튼 클릭');
    console.log('   AI 분석 중... (10-30초 소요)');

    // survey-result로 리다이렉트 대기 (LLM 분석 시간 필요)
    await page.waitForURL('**/survey-result', { timeout: 90000 });
    console.log('✅ Step 1 완료: 설문 제출 및 AI 분석 성공\n');

    // ========== 2. Survey Result 페이지 ==========
    console.log('📊 Step 2: 무료 분석 리포트 확인 및 이메일 입력');

    // 페르소나 타이틀 확인
    await page.waitForSelector('h1, h2', { timeout: 5000 });
    const personaTitle = await page.locator('h1, h2').first().textContent();
    console.log(`   페르소나: ${personaTitle}`);

    // 레이더 차트 확인
    const radarChart = page.locator('svg.recharts-surface');
    await radarChart.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   레이더 차트 표시됨');

    // 강점 요약 확인
    const strengthsSection = page.locator('text=/강점|특징/i').first();
    if (await strengthsSection.isVisible()) {
      console.log('   강점 요약 표시됨');
    }

    // 페이지 하단으로 스크롤하여 "무료 리포트 받기" 버튼 찾기
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    console.log('   "무료 리포트 받기" 버튼 클릭...');
    const freeReportButton = page.locator('button:has-text("무료 리포트")').first();
    await freeReportButton.click();
    await page.waitForTimeout(2000);

    // 이메일 입력 필드가 모달이나 폼으로 나타날 것으로 예상
    console.log('   이메일 입력 진행...');
    const testEmail = `test-${Date.now()}@example.com`;

    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(testEmail);
    console.log(`   이메일: ${testEmail}`);

    // 제출 버튼 찾기 (버튼 텍스트는 다양할 수 있음: "제출", "확인", "받기" 등)
    const submitEmailButton = page.locator('button[type="submit"]').first();
    await submitEmailButton.click();
    console.log('   이메일 제출 완료');

    // 제출 성공 확인 (몇 초 대기)
    await page.waitForTimeout(3000);

    console.log('✅ Step 2 완료: 이메일 제출 및 무료 리포트 생성 완료\n');

    console.log('🎉 무료 티어 플로우 테스트 완료!');
    console.log('\n브라우저를 10초 후 자동 종료합니다 (결과 확인 시간)...');

    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ 테스트 실패:', error);

    // 에러 발생 시 스크린샷 캡처
    await page.screenshot({ path: 'test-error.png', fullPage: true });
    console.log('   에러 스크린샷 저장: test-error.png');

    throw error;
  } finally {
    await browser.close();
    console.log('\n브라우저 종료');
  }
}

// 테스트 실행
testFreeTier().catch(console.error);
