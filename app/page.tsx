/**
 * app/page.tsx
 * 고급스러운 Dark & Glassmorphism 테마가 적용된 랜딩 페이지
 */
'use client'; // 클라이언트 사이드 인터랙션(FAQ 등)을 위해 필요

import Link from "next/link";
import { useState } from "react";
import { Sparkles, ClipboardList, Award, Globe, FileText, Check, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-slate-900 text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden">

      {/* ========================================
        Main Content
        ========================================
      */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">

        {/* --- Hero Section --- */}
        <div className="text-center mb-16 sm:mb-32 pt-8 sm:pt-12 md:pt-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium backdrop-blur-md">
            AI 기반 퍼스널 브랜딩 솔루션
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              나의 강점 프로필 발견하기
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 mb-4 sm:mb-6 max-w-2xl mx-auto font-light leading-relaxed">
            60개 질문으로 당신의 강점을 발견해보세요. <br className="hidden md:block"/>
          </p>
          {/* <p className="text-base sm:text-lg text-indigo-400 font-medium mb-8 sm:mb-12 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            60개 질문 6-12분 + AI 분석 &lt;1분
          </p> */}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/survey"
              className="group relative px-8 sm:px-10 py-3 sm:py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-base sm:text-lg font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 backdrop-blur-sm border border-white/10"
            >
              무료로 강점 진단 받기
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {/* --- Process Flow --- */}
        <div className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">
            <span className="text-indigo-400">4단계</span>로 시작하는 퍼스널 브랜딩 리포트
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: 'PSA 강점 진단',
                desc: '5가지 직업적 강점(혁신 사고, 철저 실행, 대인 영향, 협업 공감, 상황 회복)에 대한 60개 질문에 답변합니다.',
                time: '5-8분',
                icon: ClipboardList
              },
              {
                step: '2',
                title: '무료 리포트 생성',
                desc: 'PSA 답변을 분석하여 10가지 페르소나 중 하나를 부여하고, 강점 프로필을 생성합니다.',
                time: '즉시 생성',
                icon: Award
              },
              {
                step: '3',
                title: '이력서 & 커스텀 질문',
                desc: 'PSA 결과 및 제출한 이력서를 바탕으로 심층 질문을 드립니다.',
                time: '출시 예정',
                icon: Award
              },
              {
                step: '4',
                title: '퍼스널 브랜딩 최종 리포트',
                desc: '답변을 바탕으로 당신만의 퍼스널 브랜딩 리포트를 생성합니다.',
                time: '출시 예정',
                icon: Award
              }
            ].map((item, i) => {
              return (
                <div key={item.step} className="relative group">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl group-hover:bg-indigo-500/30 transition-all opacity-0 group-hover:opacity-100"></div>
                  <div className="relative h-full bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-300 font-bold text-xl mb-6 border border-indigo-500/30">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-white text-xl mb-3">{item.title}</h3>
                    <p className="text-sm text-slate-300 mb-4 leading-relaxed">{item.desc}</p>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium bg-indigo-950/50 py-1 px-3 rounded-full inline-block border border-indigo-500/20">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Waitlist CTA */}
          <div className="mt-12 text-center">
            <p className="text-slate-300 mb-4">
              이력서 기반의 정식 브랜딩 리포트는 곧 출시 예정입니다.
            </p>
            <a
              href="#waitlist"
              className="inline-block px-6 py-2.5 rounded-full bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium backdrop-blur-sm"
            >
              대기자 명단 등록하기 →
            </a>
          </div>
        </div>

        {/* --- Results Preview --- */}
        <div className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">
            무료로 받는 <span className="text-indigo-400">강점 분석 결과</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <ResultCard
              icon={Globe}
              title="공개 웹 프로필"
              desc="고유 URL로 공유 가능한 나만의 강점 프로필 페이지. 페르소나, 레이더 차트, 핵심 강점, 브랜딩 키워드를 포함합니다. SEO 최적화로 검색도 가능해요."
              items={["고유 URL 제공 (예: yourname.com/p/abc123)", "SEO 최적화 프로필", "즉시 공유 가능한 QR 코드"]}
              badge="무료 제공"
              featured={true}
            />
            <ResultCard
              icon={FileText}
              title="퍼스널 브랜딩 리포트"
              desc="이력서와 포트폴리오 기반 심층 분석으로 브랜드 전략, 타겟 오디언스, 가치 제안, 비전 스토리를 담은 전문 리포트. 곧 출시 예정입니다."
              items={["브랜드 전략 및 핵심 메시지", "강점 분석 및 성과 하이라이트", "비주얼 아이덴티티 가이드"]}
              badge="Coming Soon"
              comingSoon={true}
            />
          </div>
        </div>

        {/* --- Waitlist Section --- */}
        <div id="waitlist" className="mb-32 max-w-4xl mx-auto">
          <div className="relative p-12 rounded-3xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 opacity-90"></div>
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>

            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-400/20 border border-indigo-400/30 text-indigo-200 text-sm font-medium">
                Coming Soon
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                정식 브랜딩 리포트 출시 알림 받기
              </h2>
              <p className="text-slate-200 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
                이력서 기반 심층 분석, 12페이지 PDF 리포트, 브랜드 전략 가이드를 포함한 <br className="hidden md:block"/>
                정식 서비스가 곧 출시됩니다. 출시 소식을 가장 먼저 받아보세요.
              </p>

              {/* Email form */}
              <form
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const email = formData.get('email') as string;
                  // TODO: Implement waitlist API call
                  alert(`대기자 명단에 등록되었습니다: ${email}`);
                  e.currentTarget.reset();
                }}
              >
                <input
                  type="email"
                  name="email"
                  placeholder="이메일 주소 입력"
                  required
                  className="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-sm"
                />
                <button
                  type="submit"
                  className="px-8 py-3 rounded-full bg-white text-indigo-900 font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
                >
                  대기자 등록
                </button>
              </form>

              <p className="mt-6 text-sm text-slate-300 flex items-center justify-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-indigo-400" />
                  스팸 없음
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-indigo-400" />
                  출시 알림만 전송
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-indigo-400" />
                  언제든지 구독 해지 가능
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* --- FAQ Section --- */}
        <div className="mb-32 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            <FaqItem
              q="무료로 어디까지 이용할 수 있나요?"
              a="PSA 60문항 강점 진단 통한 10가지 페르소나 분석은 완전 무료입니다. 이력서와 심층 질문 기반의 퍼스널 브랜딩 리포트는 곧 출시될 유료 서비스입니다."
            />
            <FaqItem
              q="PSA 설문은 왜 60개나 되나요?"
              a="5가지 직업적 성향(혁신 사고, 철저 실행, 대인 영향, 협업 공감, 상황 회복)을 정확히 측정하기 위해 각 차원당 12개 질문을 사용합니다. 이를 통해 10가지 페르소나로 분류됩니다."
            />
            <FaqItem
              q="이력서가 없으면 사용할 수 없나요?"
              a="현재 무료 버전은 이력서 없이 PSA 설문만으로 강점 분석이 가능합니다. 이력서 기반 정식 리포트는 곧 출시 예정입니다."
            />
          </div>
        </div>

        {/* --- Bottom CTA --- */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl -z-10"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">무료로 나만의 강점 프로필 만들기</h2>
          <p className="text-slate-300 mb-10 text-lg">
            PSA 강점 진단으로 회원가입 없이 10분이면 완성
          </p>
          <Link
            href="/survey"
            className="inline-block bg-white text-indigo-900 px-12 py-5 rounded-full text-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-indigo-500/20"
          >
            무료로 강점 진단 받기 →
          </Link>
        </div>

      </div>
    </main>
  );
}

// --- Sub Components ---

function ResultCard({ icon: Icon, title, desc, items, featured = false, badge, comingSoon = false }: { icon: any, title: string, desc: string, items: string[], featured?: boolean, badge?: string, comingSoon?: boolean }) {
  return (
    <div className={`p-8 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:-translate-y-1 relative ${featured ? 'bg-indigo-900/40 border-indigo-500/50 shadow-xl shadow-indigo-500/10' : comingSoon ? 'bg-white/5 border-white/10 hover:border-white/20 opacity-75' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
      {badge && (
        <div className="absolute -top-3 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-500/30 text-xs font-medium text-indigo-300 backdrop-blur-sm">
          {featured && <Check className="w-3 h-3" />}
          {badge}
        </div>
      )}
      <div className="mb-4">
        <Icon className="w-12 h-12 text-indigo-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-300 mb-6 text-sm leading-relaxed">
        {desc}
      </p>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
            <Check className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm transition-colors hover:bg-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex justify-between items-center focus:outline-none"
      >
        <span className="font-semibold text-white text-lg">{q}</span>
        <span className={`text-indigo-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="px-6 py-6 text-slate-300 leading-relaxed border-t border-white/5">
          {a}
        </p>
      </div>
    </div>
  );
}
