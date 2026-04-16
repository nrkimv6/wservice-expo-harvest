# expo-harvest

전시회/박람회 현장에서 부스 이벤트를 빠르게 훑고, 시간 제한 이벤트를 놓치지 않도록 돕는 모바일 우선 웹앱입니다.

현재 상태는 MVP 부트스트랩 단계입니다. 핵심 기술 스택과 문서 구조를 먼저 정리했고, 실제 지도/리스트/메모/실시간 이벤트 기능은 다음 단계에서 구현합니다.

## 문서

- PRD: `docs/PRD.md`
- 진행 TODO: `TODO.md`
- 완료 이력: `docs/DONE.md`

## 기술 스택

- SvelteKit 2
- Svelte 5
- Supabase
- Tailwind CSS
- Cloudflare Workers

## 현재 포함 범위

- 앱 기본 브랜딩과 랜딩 페이지
- Supabase 클라이언트 및 auth-worker 연동용 기본 설정
- 프로젝트별 `.env.example`, `wrangler.toml`, `package.json` 정리

## 의도적으로 제외한 템플릿 잔여물

- Capacitor 설정
- Firebase/알림 샘플 코드
- 샘플 CRUD store 및 데모 컴포넌트
- 템플릿용 마이그레이션 예시

## 개발 시작

```powershell
cd "D:\work\project\service\wtools\expo-harvest"
Copy-Item ".env.example" ".env"
npm install
npm run dev
```

## 환경 변수

`.env.example` 기준:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `PUBLIC_AUTH_WORKER_URL`
- `PUBLIC_APP_ID`

현재는 템플릿 Supabase/auth-worker 값을 유지하고 있고, `PUBLIC_APP_ID`만 `expo-harvest`로 고정했습니다.

## 후속 작업 메모

- `auth-worker`에 `expo-harvest` 앱 등록
- 전시장 지도 이미지/부스 이벤트 스키마 설계
- 로컬 메모/북마크/완료 상태 저장 구조 구현
- 오프라인 캐시 전략 추가
