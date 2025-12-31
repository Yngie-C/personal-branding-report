export default function FullProfileLayout({ profileData, seoData }: { profileData: any; seoData: any }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {profileData?.hero?.headline || '퍼스널 브랜딩 프로필'}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {profileData?.hero?.subheadline || ''}
          </p>
          {profileData?.hero?.cta && (
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              {profileData.hero.cta}
            </button>
          )}
        </div>
      </section>

      {/* Sections */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {profileData?.sections?.map((section: any, index: number) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {section.title}
              </h2>
              <div className="prose prose-lg max-w-none">
                {typeof section.content === 'string' ? (
                  <p className="text-gray-700">{section.content}</p>
                ) : Array.isArray(section.content) ? (
                  <ul className="space-y-2">
                    {section.content.map((item: any, idx: number) => (
                      <li key={idx} className="text-gray-700">
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
        <section className="pb-20 px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">연락하기</h2>
            <p className="text-lg text-gray-700">
              {profileData.contactInfo.email}
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
