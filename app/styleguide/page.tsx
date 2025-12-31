import { DesignTokens } from "@/lib/design-tokens";
import { CardV2, CardHeaderV2, CardTitleV2, CardContentV2 } from "@/components/ui/card-v2";

export default function StyleGuidePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-foreground tracking-tight mb-4">
            Design System
          </h1>
          <p className="text-xl text-muted-foreground">
            Personal Branding Report 디자인 시스템 가이드
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Navy + Slate + Amber 색상 시스템 | Inter + Pretendard 타이포그래피
          </p>
        </div>

        {/* Colors Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-foreground mb-8">색상 팔레트</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Navy */}
            <CardV2 variant="elevated">
              <CardHeaderV2>
                <CardTitleV2>Navy (Primary)</CardTitleV2>
              </CardHeaderV2>
              <CardContentV2>
                <div className="space-y-2 mt-4">
                  {Object.entries(DesignTokens.colors.navy).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border border-slate-200"
                        style={{ backgroundColor: value }}
                      />
                      <div>
                        <p className="text-sm font-medium">navy-{key}</p>
                        <p className="text-xs text-muted-foreground font-mono">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContentV2>
            </CardV2>

            {/* Slate */}
            <CardV2 variant="elevated">
              <CardHeaderV2>
                <CardTitleV2>Slate (Neutral)</CardTitleV2>
              </CardHeaderV2>
              <CardContentV2>
                <div className="space-y-2 mt-4">
                  {Object.entries(DesignTokens.colors.slate).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border border-slate-200"
                        style={{ backgroundColor: value }}
                      />
                      <div>
                        <p className="text-sm font-medium">slate-{key}</p>
                        <p className="text-xs text-muted-foreground font-mono">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContentV2>
            </CardV2>

            {/* Amber */}
            <CardV2 variant="elevated">
              <CardHeaderV2>
                <CardTitleV2>Amber (Accent)</CardTitleV2>
              </CardHeaderV2>
              <CardContentV2>
                <div className="space-y-2 mt-4">
                  {Object.entries(DesignTokens.colors.amber).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border border-slate-200"
                        style={{ backgroundColor: value }}
                      />
                      <div>
                        <p className="text-sm font-medium">amber-{key}</p>
                        <p className="text-xs text-muted-foreground font-mono">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContentV2>
            </CardV2>
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-foreground mb-8">타이포그래피</h2>

          <CardV2 variant="elevated" size="lg">
            <CardHeaderV2>
              <CardTitleV2>Font Family</CardTitleV2>
            </CardHeaderV2>
            <CardContentV2>
              <div className="space-y-4 mt-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Sans (Default)</p>
                  <p className="text-2xl font-sans">
                    Inter + Pretendard Variable
                  </p>
                  <p className="text-sm font-mono text-muted-foreground mt-1">
                    {DesignTokens.typography.fontFamily.sans.join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Display</p>
                  <p className="text-2xl font-display">
                    Inter for Headlines
                  </p>
                  <p className="text-sm font-mono text-muted-foreground mt-1">
                    {DesignTokens.typography.fontFamily.display.join(', ')}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Font Sizes</h3>
                <div className="space-y-4">
                  {Object.entries(DesignTokens.typography.fontSize).map(([key, value]) => (
                    <div key={key} className="flex items-baseline gap-4">
                      <span className="text-sm text-muted-foreground w-16">{key}</span>
                      <span style={{ fontSize: value }} className="font-semibold">
                        The quick brown fox
                      </span>
                      <span className="text-xs text-muted-foreground font-mono ml-auto">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContentV2>
          </CardV2>
        </section>

        {/* Card Components Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-foreground mb-8">Card 컴포넌트</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardV2 variant="elevated" size="md">
              <CardHeaderV2>
                <CardTitleV2>Elevated</CardTitleV2>
              </CardHeaderV2>
              <CardContentV2>
                <p className="text-sm text-muted-foreground mt-2">
                  기본 카드 스타일. 그림자 + 테두리로 입체감 표현.
                </p>
              </CardContentV2>
            </CardV2>

            <CardV2 variant="outlined" size="md">
              <CardHeaderV2>
                <CardTitleV2>Outlined</CardTitleV2>
              </CardHeaderV2>
              <CardContentV2>
                <p className="text-sm text-muted-foreground mt-2">
                  테두리만 있는 카드. 깔끔하고 미니멀한 스타일.
                </p>
              </CardContentV2>
            </CardV2>

            <CardV2 variant="glass" size="md">
              <CardHeaderV2>
                <CardTitleV2>Glass</CardTitleV2>
              </CardHeaderV2>
              <CardContentV2>
                <p className="text-sm text-muted-foreground mt-2">
                  Glassmorphism 효과. Hero 섹션에 적합.
                </p>
              </CardContentV2>
            </CardV2>

            <CardV2 variant="flat" size="md">
              <CardHeaderV2>
                <CardTitleV2>Flat</CardTitleV2>
              </CardHeaderV2>
              <CardContentV2>
                <p className="text-sm text-muted-foreground mt-2">
                  그림자 없는 카드. 심플한 레이아웃에 사용.
                </p>
              </CardContentV2>
            </CardV2>

            <CardV2 variant="accent" size="md">
              <CardHeaderV2>
                <CardTitleV2>Accent</CardTitleV2>
              </CardHeaderV2>
              <CardContentV2>
                <p className="text-sm mt-2">
                  Navy 배경의 강조 카드. CTA나 중요 정보 표시.
                </p>
              </CardContentV2>
            </CardV2>

            <CardV2 variant="dark" size="md" className="bg-navy-900">
              <CardHeaderV2>
                <CardTitleV2>Dark</CardTitleV2>
              </CardHeaderV2>
              <CardContentV2>
                <p className="text-sm mt-2">
                  어두운 배경용 카드. Hero 섹션에 사용.
                </p>
              </CardContentV2>
            </CardV2>
          </div>
        </section>

        {/* Spacing Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-foreground mb-8">간격 (Spacing)</h2>

          <CardV2 variant="elevated" size="lg">
            <CardContentV2>
              <div className="space-y-4 mt-4">
                {Object.entries(DesignTokens.spacing).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-16">{key}</span>
                    <div
                      className="bg-navy-600 h-8"
                      style={{ width: value }}
                    />
                    <span className="text-xs text-muted-foreground font-mono ml-auto">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContentV2>
          </CardV2>
        </section>

        {/* Shadows Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-foreground mb-8">그림자 (Shadows)</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Object.entries(DesignTokens.shadows).map(([key, value]) => (
              <div key={key} className="text-center">
                <div
                  className="w-full h-24 bg-white rounded-lg mb-3"
                  style={{ boxShadow: value }}
                />
                <p className="text-sm font-medium">{key}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Border Radius Section */}
        <section>
          <h2 className="text-3xl font-semibold text-foreground mb-8">Border Radius</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Object.entries(DesignTokens.borderRadius).map(([key, value]) => (
              <div key={key} className="text-center">
                <div
                  className="w-full h-24 bg-navy-600 mb-3"
                  style={{ borderRadius: value }}
                />
                <p className="text-sm font-medium">{key}</p>
                <p className="text-xs text-muted-foreground font-mono">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-20 text-center border-t border-slate-200 pt-8">
          <p className="text-sm text-muted-foreground">
            🎨 Design System v1.0 | Navy + Slate + Amber
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Figma Community 템플릿 기반 | Trust through Simplicity
          </p>
        </div>
      </div>
    </main>
  );
}
