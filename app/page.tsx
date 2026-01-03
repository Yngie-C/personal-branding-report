/**
 * app/page.tsx
 * 고급스러운 Dark & Glassmorphism 테마가 적용된 랜딩 페이지
 * Unicorn Studio 배경 스크립트 통합
 */
'use client'; // 클라이언트 사이드 인터랙션(FAQ 등)을 위해 필요

import Link from "next/link";
import Script from "next/script";
import { useState } from "react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-slate-900 text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden">

      {/* ========================================
        1. Unicorn Studio Background Layer
        ========================================
      */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* data-us-project 속성이 있는 div가 배경으로 작동합니다. */}
        <div
          data-us-project="0ozZJwlFna9IxldZQ4eK"
          style={{ width: '100%', height: '100%' }}
        ></div>
        {/* 배경이 너무 밝거나 복잡할 경우를 대비한 오버레이 */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Unicorn Studio 스크립트 로드 */}
      <Script
        src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.0/dist/unicornStudio.umd.js"
        strategy="lazyOnload"
        onLoad={() => {
           // 스크립트 로드 후 초기화 실행
           // @ts-ignore
           if (window.UnicornStudio) {
             // @ts-ignore
             window.UnicornStudio.init();
           }
        }}
      />

      {/* ========================================
        2. Main Content Layer (z-index: 10)
        ========================================
      */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">

        {/* --- Hero Section --- */}
        <div className="text-center mb-32 pt-10">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium backdrop-blur-md">
            ✨ AI 기반 퍼스널 브랜딩 솔루션
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              3단계로 완성하는
            </span>
            당신만의 브랜드 리포트
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-6 max-w-2xl mx-auto font-light leading-relaxed">
            AI가 이력서와 포트폴리오를 심층 분석하여<br className="hidden md:block"/>
            전문적인 브랜딩 전략과 디자인 가이드를 제안합니다.
          </p>
          <p className="text-lg text-indigo-400 font-medium mb-12 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            설문 10분 + 질문 5분 + 생성 2분 = 총 17분
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/survey"
              className="group relative px-10 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 backdrop-blur-sm border border-white/10"
            >
              무료로 시작하기
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/start"
              className="px-10 py-4 rounded-full bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors text-lg font-medium backdrop-blur-sm"
            >
              더 알아보기
            </Link>
          </div>
        </div>

        {/* --- Process Flow --- */}
        <div className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">
            간단한 <span className="text-indigo-400">5단계 프로세스</span>
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: '1', title: '이력서 업로드', desc: '파일 또는 폼 입력', time: '2분', emoji: '📄' },
              { step: '2', title: 'PSA 설문', desc: '60개 질문 응답', time: '10분', emoji: '📝' },
              { step: '3', title: '맞춤 질문', desc: '심화 질문 응답', time: '5분', emoji: '💬' },
              { step: '4', title: 'AI 분석', desc: '자동 리포트 생성', time: '2분', emoji: '🤖' },
              { step: '5', title: '결과 다운로드', desc: 'PDF·웹·에셋', time: '1분', emoji: '✨' }
            ].map((item, i) => (
              <div key={item.step} className="relative group">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl group-hover:bg-indigo-500/30 transition-all opacity-0 group-hover:opacity-100"></div>
                <div className="relative h-full bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md text-center hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-300 font-bold text-lg mx-auto mb-4 border border-indigo-500/30">
                    {item.step}
                  </div>
                  <div className="text-4xl mb-4 transition-transform group-hover:scale-110 duration-300">{item.emoji}</div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{item.desc}</p>
                  <p className="text-xs text-indigo-400 font-medium bg-indigo-950/50 py-1 px-2 rounded-full inline-block border border-indigo-500/20">
                    ⏱️ {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Results Preview --- */}
        <div className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">
            제공되는 <span className="text-indigo-400">브랜딩 패키지</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <ResultCard
              icon="📄"
              title="PDF 브랜딩 리포트"
              desc="전문 디자인 템플릿으로 제작된 12페이지 리포트. 이력서와 함께 제출하거나 포트폴리오에 첨부하세요."
              items={["브랜드 전략 및 핵심 메시지", "강점 분석 및 성과 하이라이트", "비주얼 아이덴티티 가이드"]}
            />
            <ResultCard
              icon="🌐"
              title="공개 웹 프로필"
              desc="이메일 서명, 명함, SNS 프로필에 추가할 수 있는 공유 가능한 웹 페이지가 생성됩니다."
              items={["고유 URL 제공", "SEO 최적화 프로필", "즉시 공유 가능한 QR 코드"]}
              featured={true}
            />
            <ResultCard
              icon="🎨"
              title="소셜 미디어 에셋"
              desc="브랜드 컬러와 메시지가 반영된 5가지 디자인 에셋을 즉시 다운로드하세요."
              items={["LinkedIn 배너 & 프로필", "디지털 명함 디자인", "SNS용 브랜드 이미지"]}
            />
          </div>
        </div>

        {/* --- FAQ Section --- */}
        <div className="mb-32 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            <FaqItem
              q="PSA 설문은 왜 60개나 되나요?"
              a="전문가 강점 분석(PSA)은 5가지 직업적 성향을 정확히 측정하기 위해 각 카테고리당 12개 질문을 사용합니다. 이를 통해 10가지 페르소나 중 당신에게 가장 적합한 유형을 찾아냅니다."
            />
            <FaqItem
              q="이력서가 없으면 사용할 수 없나요?"
              a="아니요! 파일 업로드가 어려우시면 폼에 직접 입력하실 수 있습니다. 경력, 학력, 스킬 등을 간단히 입력하면 동일한 분석이 가능합니다."
            />
            <FaqItem
              q="생성된 리포트는 수정할 수 있나요?"
              a="현재 버전에서는 자동 생성된 결과를 제공합니다. 다만, 질문 답변 단계에서 구체적으로 작성할수록 더 정확한 리포트를 받으실 수 있습니다."
            />
            <FaqItem
              q="결과물은 어떻게 활용하나요?"
              a="PDF는 이력서와 함께 제출하거나 포트폴리오에 첨부하세요. 웹 프로필은 이메일 서명이나 명함에 링크를 추가하고, 소셜 에셋은 LinkedIn/Twitter 프로필을 업데이트하는 데 사용하세요."
            />
          </div>
        </div>

        {/* --- Bottom CTA --- */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl -z-10"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">지금 바로 시작하세요</h2>
          <p className="text-slate-300 mb-10 text-lg">
            회원가입 없이 100% 무료로 당신만의 브랜드 가치를 발견할 수 있습니다.
          </p>
          <Link
            href="/start"
            className="inline-block bg-white text-indigo-900 px-12 py-5 rounded-full text-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-indigo-500/20"
          >
            무료로 분석 시작하기 →
          </Link>
        </div>

      </div>
    </main>
  );
}

// --- Sub Components ---

function ResultCard({ icon, title, desc, items, featured = false }: { icon: string, title: string, desc: string, items: string[], featured?: boolean }) {
  return (
    <div className={`p-8 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:-translate-y-1 ${featured ? 'bg-indigo-900/40 border-indigo-500/50 shadow-xl shadow-indigo-500/10' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-300 mb-6 text-sm leading-relaxed">
        {desc}
      </p>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-slate-300 flex items-start">
            <span className="text-indigo-400 mr-2 font-bold">✓</span>
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
        <p className="p-6 pt-0 text-slate-300 leading-relaxed border-t border-white/5">
          {a}
        </p>
      </div>
    </div>
  );
}
