import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            3단계로 완성하는
            <br />
            당신만의 브랜드 리포트
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            AI가 이력서와 포트폴리오를 분석하여 전문적인 브랜딩 리포트를 생성합니다
          </p>
          <p className="text-lg text-indigo-600 font-semibold mb-8">
            ⏱️ 설문 10분 + 질문 5분 + 생성 2분 = 총 17분
          </p>

          <Link
            href="/survey"
            className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-lg text-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
          >
            무료로 시작하기 →
          </Link>
        </div>

        {/* Process Flow */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            간단한 5단계 프로세스
          </h2>
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { step: '1', title: '이력서 업로드', desc: '파일 또는 폼 입력', time: '2분', emoji: '📄' },
              { step: '2', title: 'PSA 설문', desc: '100개 질문 응답', time: '10분', emoji: '📝' },
              { step: '3', title: '맞춤 질문', desc: '7-10개 심화 질문', time: '5분', emoji: '💬' },
              { step: '4', title: 'AI 분석', desc: '자동 리포트 생성', time: '2분', emoji: '🤖' },
              { step: '5', title: '결과 다운로드', desc: 'PDF·웹·에셋', time: '1분', emoji: '✨' }
            ].map((item) => (
              <div key={item.step} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl mx-auto mb-3">
                  {item.step}
                </div>
                <div className="text-3xl mb-2">{item.emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.desc}</p>
                <p className="text-xs text-indigo-600 font-medium">{item.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Results Preview */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            받게 될 결과물
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-xl font-bold mb-3">PDF 브랜딩 리포트</h3>
              <p className="text-gray-600 mb-4">
                전문 디자인 템플릿으로 제작된 12페이지 리포트. 이력서와 함께 제출하거나 포트폴리오에 첨부하세요.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ 브랜드 전략 및 핵심 메시지</li>
                <li>✓ 강점 분석 및 성과 하이라이트</li>
                <li>✓ 비주얼 아이덴티티 가이드</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-bold mb-3">공개 웹 프로필</h3>
              <p className="text-gray-600 mb-4">
                이메일 서명, 명함, SNS 프로필에 추가할 수 있는 공유 가능한 웹 페이지가 생성됩니다.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ 고유 URL (yourdomain.com/p/your-name)</li>
                <li>✓ SEO 최적화 프로필</li>
                <li>✓ QR 코드 생성 가능</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-3">소셜 미디어 에셋</h3>
              <p className="text-gray-600 mb-4">
                브랜드 컬러와 메시지가 반영된 5가지 디자인 에셋을 즉시 다운로드하세요.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ LinkedIn 배너 & 프로필 이미지</li>
                <li>✓ 디지털 명함 디자인</li>
                <li>✓ Twitter & Instagram 에셋</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            자주 묻는 질문
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'PSA 설문은 왜 100개나 되나요?',
                a: '전문가 강점 분석(PSA)은 5가지 직업적 성향을 정확히 측정하기 위해 각 카테고리당 20개 질문을 사용합니다. 이를 통해 10가지 페르소나 중 당신에게 가장 적합한 유형을 찾아냅니다.'
              },
              {
                q: '이력서가 없으면 사용할 수 없나요?',
                a: '아니요! 파일 업로드가 어려우시면 폼에 직접 입력하실 수 있습니다. 경력, 학력, 스킬 등을 간단히 입력하면 동일한 분석이 가능합니다.'
              },
              {
                q: '생성된 리포트는 수정할 수 있나요?',
                a: '현재 버전에서는 자동 생성된 결과를 제공합니다. 다만, 질문 답변 단계에서 구체적으로 작성할수록 더 정확한 리포트를 받으실 수 있습니다.'
              },
              {
                q: '결과물은 어떻게 활용하나요?',
                a: 'PDF는 이력서와 함께 제출하거나 포트폴리오에 첨부하세요. 웹 프로필은 이메일 서명이나 명함에 링크를 추가하고, 소셜 에셋은 LinkedIn/Twitter 프로필을 업데이트하는 데 사용하세요.'
              }
            ].map((faq, idx) => (
              <details key={idx} className="bg-white p-6 rounded-lg shadow-md group">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  <span>{faq.q}</span>
                  <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/start"
            className="inline-block bg-indigo-600 text-white px-12 py-5 rounded-lg text-xl font-bold hover:bg-indigo-700 transition-colors shadow-xl hover:shadow-2xl"
          >
            지금 무료로 시작하기 →
          </Link>
          <p className="mt-4 text-gray-500">
            100% 무료 • 회원가입 불필요 • AI 기반 분석
          </p>
        </div>
      </div>
    </main>
  );
}
