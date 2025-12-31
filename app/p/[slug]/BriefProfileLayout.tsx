'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';

export default function BriefProfileLayout({ profileData }: { profileData: any }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-navy-900 via-slate-800 to-slate-900">
      {/* Hero Section - Persona Card */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-purple-100 text-sm mb-6">
            <span>PSA 강점 분석 프로필</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {profileData?.hero?.headline || '페르소나'}
          </h1>

          <p className="text-xl md:text-2xl text-purple-100 mb-8 font-light">
            {profileData?.hero?.tagline || ''}
          </p>

          {/* Branding Keywords */}
          {profileData?.hero?.keywords && Array.isArray(profileData.hero.keywords) && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {profileData.hero.keywords.map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Radar Chart */}
          {profileData?.radarData && Array.isArray(profileData.radarData) && (
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                5차원 강점 프로필
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={profileData.radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="점수"
                    dataKey="score"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Persona Description */}
          {profileData?.persona && (
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                페르소나 특성
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                {profileData.persona.description}
              </p>

              {/* Core Strengths */}
              {profileData.persona.strengths && Array.isArray(profileData.persona.strengths) && profileData.persona.strengths.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">핵심 강점</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.persona.strengths.map((strength: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Shadow Sides */}
              {profileData.persona.shadowSides && Array.isArray(profileData.persona.shadowSides) && profileData.persona.shadowSides.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">성장 포인트</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.persona.shadowSides.map((shadowSide: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium"
                      >
                        {shadowSide}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Category Scores */}
          {profileData?.categoryScores && Array.isArray(profileData.categoryScores) && (
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                카테고리별 점수
              </h2>
              <div className="space-y-4">
                {profileData.categoryScores.map((cat: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {cat.rank}
                      </span>
                      <span className="font-medium text-gray-900">{cat.category}</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">{cat.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">
              나만의 브랜딩 리포트 만들기
            </h2>
            <p className="text-purple-100 mb-6 text-lg">
              PSA 분석을 바탕으로 전문적인 브랜딩 리포트와 소셜 에셋을 생성하세요
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg font-semibold"
            >
              <a href="/">시작하기</a>
            </Button>
          </div>

          {/* Contact */}
          {profileData?.contact?.email && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <p className="text-purple-100 text-sm">Contact</p>
              <p className="text-white font-medium mt-2">{profileData.contact.email}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
