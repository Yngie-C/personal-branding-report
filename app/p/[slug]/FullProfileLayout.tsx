export default function FullProfileLayout({ profileData, seoData }: { profileData: any; seoData: any }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            {profileData?.hero?.headline || '퍼스널 브랜딩 프로필'}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
            {profileData?.hero?.subheadline || ''}
          </p>
          {profileData?.hero?.cta && (
            <button className="bg-blue-600 text-white px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-700 transition-colors">
              {profileData.hero.cta}
            </button>
          )}
        </div>
      </section>

      {/* Sections */}
      <section className="pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
          {profileData?.sections?.map((section: any, index: number) => (
            <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 md:p-7 lg:p-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">
                {section.title}
              </h2>
              <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
                {typeof section.content === 'string' ? (
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{section.content}</p>
                ) : Array.isArray(section.content) ? (
                  <ul className="space-y-2">
                    {section.content.map((item: any, idx: number) => (
                      <li key={idx} className="text-sm sm:text-base text-gray-700">
                        {typeof item === 'string' ? item : item.company || item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      {profileData?.contactInfo && (
        <section className="pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-7 md:p-8 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">연락하기</h2>
            <p className="text-base sm:text-lg text-gray-700">
              {profileData.contactInfo.email}
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
