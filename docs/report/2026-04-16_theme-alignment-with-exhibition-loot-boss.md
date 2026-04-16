# 수정 보고서: exhibition-loot-boss 기준 테마 정렬

> 작성일: 2026-04-16
> 대상: expo-harvest
> 범위: 프론트엔드 색상 테마 및 공통 화면 스타일 정렬

## 변경 배경

- 현재 `expo-harvest`는 이전 작업에서 `Pitch Black + Orange` 방향으로 재매핑되어 있었고,
  사용자가 제공한 원본 디자인 ZIP `C:\Users\Narang\Downloads\exhibition-loot-boss-main.zip`과는 색감이 달랐습니다.
- 구조는 대체로 유지하되, 사용자가 원하는 기준은 "원본과 직접 비교한 뒤 같은 색상 테마로 맞추는 것"이었습니다.

## 비교 기준

직접 확인한 원본 파일:

- `src/index.css`
- `tailwind.config.ts`
- `src/components/AlertBanner.tsx`
- `src/components/ExhibitionMap.tsx`
- `src/components/LootCard.tsx`
- `src/components/LootFeed.tsx`
- `src/components/BoothDetailSheet.tsx`
- `src/pages/Index.tsx`

원본 토큰 요약:

1. `navy-deep / navy-surface / navy-elevated`
2. `gold / gold-dim / gold-glow`
3. `mint / mint-dim`

## 변경 내용

### 1. 디자인 토큰 재정의

- `tailwind.config.js`의 `orange` 토큰을 제거하고 `gold` 토큰으로 교체
- `navy`, `mint`, `border`, `foreground`, `muted-foreground` 값을 원본 ZIP 기준 HSL 값으로 재정의
- `src/app.css`의 전역 배경/전경색을 `Deep Navy + Warm Foreground` 기준으로 수정
- `glow-orange`를 `glow-gold`로 교체하고 `ticker-gradient` 유틸을 추가

### 2. 공통 레이아웃 정렬

- `src/routes/+layout.svelte`의 오렌지 방사형 배경을 제거하고 단일 `bg-navy-deep` 배경으로 정리
- 워터마크 색도 `muted-foreground` 계열로 조정

### 3. `/app` 화면 색상 정렬

- `AlertBanner.svelte`: gold ticker gradient 적용
- `ExhibitionMap.svelte`: bookmark 핀과 강조 상태를 gold 계열로 변경
- `FilterChips.svelte`: 활성 칩 색을 gold 계열로 변경
- `LootCard.svelte`: 시간 뱃지, 경품 텍스트, 북마크 인디케이터를 gold 기준으로 정렬
- `LootFeed.svelte`: 완료 카운터 배지 색을 원본 패턴에 맞게 수정
- `BoothDetailSheet.svelte`: 시간 뱃지, Prize 박스, 액션 버튼의 색상 분기 재정렬
- `src/routes/app/+page.svelte`: 상단 hero 카드와 보조 카드의 배경/강조색을 navy/gold 기준으로 변경

### 4. 랜딩/에러 화면 정렬

- `src/routes/+page.svelte`의 하드코딩 오렌지 계열 색상을 gold 계열로 교체
- `src/routes/+error.svelte`도 같은 팔레트로 맞춤
- `docs/PRD.md`의 디자인 가이드 문구를 현재 테마와 맞게 `Deep Navy + Gold`로 수정

## 의도적으로 유지한 차이

원본과 완전히 동일하게 만들지는 않았습니다.

유지한 차이:

1. 한글 UI 문구
2. `localStorage` 상태 저장
3. Realtime 상단 배너 연결
4. PWA / service worker 지원
5. 랜딩과 `/app`에 이미 들어간 제품 소개/운영용 문맥

즉, 이번 수정은 "원본 구조 위에 붙인 앱 기능은 유지하고, 색상 테마만 원본 기준으로 되돌리는 정렬"에 가깝습니다.

## 검증

실행:

```powershell
cd "D:\work\project\service\wtools\expo-harvest"
npm run check
npm run build
```

결과:

- `npm run check` 통과
- `npm run build` 통과

## 후속 후보

색상은 원본 기준에 맞췄고, 남은 차이는 레이아웃 밀도와 정보 배치입니다.

후속 정렬 후보:

1. `/app` 상단 hero 구성을 원본 `Index.tsx` 밀도에 더 가깝게 축소
2. 랜딩 `/`의 카드 레이아웃을 원본 톤에 더 가깝게 단순화
3. 아이콘/폰트 weight/spacing까지 원본 기준으로 미세 조정

## 연관 메모

- `2026-04-16_fix-build-lock-while-dev-server-running.md`는 테마 정렬과 별개인 Windows build 잠금 충돌 대응이다.
- build-lock 대응은 `package.json`의 build wrapper, `scripts/run-build.mjs`, `README.md`의 로컬 충돌 안내를 다루며, 이 보고서의 색상 정렬 범위에는 포함하지 않는다.
