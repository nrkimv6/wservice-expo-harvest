# expo-harvest

전시회/박람회 현장에서 부스 이벤트를 빠르게 훑고, 시간 제한 이벤트를 놓치지 않도록 돕는 모바일 우선 웹앱입니다.

현재 상태는 MVP UI 골격 단계입니다. `/app` 라우트에 지도/리스트/상세/메모 흐름을 붙였고, 상단 배너는 일정 기반 fallback 위에 Supabase Realtime broadcast 메시지를 우선 노출하도록 연결했습니다.

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
- `/app` 실제 파밍 화면 라우트와 모바일 우선 UI
- Supabase Realtime broadcast 기반 상단 알림 배너 연결
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
- 오프라인 캐시 전략 추가

## Realtime 배너 규약

클라이언트는 Supabase Realtime channel `expo-harvest-alerts`의 broadcast event `alert`를 구독합니다.

지원 payload 예시:

```json
{
	"message": "10분 뒤 A-12 룰렛 시작!",
	"expiresAt": "2026-04-16T06:45:00.000Z"
}
```

또는 구조화 payload:

```json
{
	"boothName": "NVIDIA Roulette",
	"minutesLeft": 12,
	"location": "Hall A-12",
	"expiresAt": "2026-04-16T06:45:00.000Z"
}
```

`expiresAt`이 없으면 3분 뒤 fallback 일정 배너로 자동 복귀합니다.
