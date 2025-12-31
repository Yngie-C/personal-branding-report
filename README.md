# 퍼스널 브랜딩 리포트 생성기

AI가 이력서와 포트폴리오를 분석하여 전문적인 브랜딩 리포트를 자동으로 생성합니다.

## 주요 기능

- **PDF 브랜딩 리포트**: Figma를 통한 전문적인 디자인
- **웹 프로필 페이지**: 공유 가능한 온라인 프로필
- **소셜미디어 에셋**: LinkedIn 배너, 프로필 이미지, 명함 등

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **AI**: Claude Agent SDK (Anthropic)
- **Database**: Supabase (PostgreSQL)
- **Design**: Figma MCP, Canva MCP
- **Deployment**: Vercel

## 시작하기

### 1. 환경변수 설정

`.env.example`을 복사하여 `.env.local` 파일을 생성하고 아래 값을 입력하세요:

```bash
cp .env.example .env.local
```

필요한 환경변수:
- `ANTHROPIC_API_KEY`: Anthropic Claude API 키
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_SUPABASE_PUBLISHABLE_KEY`: Supabase Publishable 키 (기존 Anon 키 대체)
- `NEXT_SUPABASE_SECRET_KEY`: Supabase Secret 키 (기존 Service Role 키 대체)

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 실행
3. Storage에서 다음 버킷 생성:
   - `resumes` (public)
   - `portfolios` (public)
   - `assets` (public)
   - `reports` (public)

### 3. 의존성 설치 및 실행

```bash
npm install
npm run dev
```

개발 서버가 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 프로젝트 구조

```
personal-branding-report/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── start/             # 이메일 입력 페이지
│   ├── upload/            # 파일 업로드
│   ├── questions/         # 질문 응답
│   ├── result/            # 결과물
│   └── p/[slug]/         # 공개 프로필
├── agents/                # Claude Agent SDK 에이전트들
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 및 라이브러리
├── types/                 # TypeScript 타입
└── supabase/             # DB 마이그레이션
```

## Agent 아키텍처

이 프로젝트는 12개의 전문화된 AI 에이전트가 협업하여 브랜딩 리포트를 생성합니다:

1. **Orchestrator**: 전체 워크플로우 조율
2. **Resume Parser**: 이력서 파싱
3. **Portfolio Analyzer**: 포트폴리오 분석
4. **Question Designer**: 맞춤 질문 생성
5. **Brand Strategist**: 브랜드 전략 수립
6. **Content Writer**: 콘텐츠 작성
7. **Visual Designer**: 비주얼 방향 설계
8. **Keyword Extractor**: 키워드 추출
9. **Report Assembler**: 리포트 조립
10. **Figma Designer**: Figma 디자인 생성
11. **Social Asset Generator**: 소셜 에셋 생성
12. **Web Profile Generator**: 웹 프로필 생성

## 개발 로드맵

- [x] Phase 1: 프로젝트 초기 설정
- [x] Phase 2: 데이터베이스 및 인프라
- [x] Phase 3: 사용자 플로우 UI
- [x] Phase 4: Claude Agent SDK 기반 구조
- [x] Phase 5: 데이터 수집 에이전트
- [x] Phase 6: 분석 및 전략 에이전트
- [x] Phase 7: 출력물 생성 에이전트
- [x] Phase 8: MCP 연동 (Figma + Canva) - 기본 구조
- [ ] Phase 9: 테스트 및 배포

## 라이선스

MIT
