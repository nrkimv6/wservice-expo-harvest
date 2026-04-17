# fix: align coupang mega beauty hardcoded review data

> 작성일시: 2026-04-17 17:05
> 기준커밋: 5853e1d
> 대상 프로젝트: expo-harvest
> branch: impl/fix-coupang-mega-beauty-hardcoded-review-data
> worktree: .worktrees/impl-fix-coupang-mega-beauty-hardcoded-review-data
> worktree-owner: D:\work\project\service\wtools\expo-harvest\docs\plan\2026-04-17_fix-coupang-mega-beauty-hardcoded-review-data.md
> 상태: 머지대기
> 진행률: 50/50 (100%)
> 요약: 실제 후기 원문과 `쿠팡메가뷰티쇼 2026` 하드코딩 데이터를 대조한 결과, 일부 부스의 해시태그 오탈자와 미션 설명 불일치, 잘못된 선착순 강조, preset 누락/미연결이 확인됐다. 이 계획의 목표는 후기 기준으로 명백한 오류(해시태그 오탈자, 존재하지 않는 선착순 강조, 프리셋 미연결, 오탈자 accountId)를 먼저 바로잡고, 후기 원문에 미션/경품이 명시된 19개 부스 전부를 동일 턴에 반영하는 것이다. 1차 검토에서 계획이 놓친 항목(더페이스샵 `#페이스샵` 오탈자, AHC `#SKINGAME_T_SHOT` 누락, 메디힐/아벤느 preset 부재, 토니모리 `accountId: tonymory` 오탈자, 더페이스샵 kakao URL 언더스코어 의심)과 2차 검토 요구사항(피드/스토리/피드 또는 스토리 업로드 구분, 추첨 후기 이벤트 분리 표기)을 함께 반영한다.

---

## 개요

사용자가 제공한 실제 후기 원문(`C:\Users\Narang\Downloads\2026-04-17_16-47-40_untitled.md`)을 기준으로 앱의 `쿠팡메가뷰티쇼 2026` 하드코딩 데이터를 검토한 결과, 현재 데이터는 일부 브랜드만 부분 반영된 상태이며 몇몇 항목은 원문과 직접 충돌한다. 특히 AHC는 해시태그 프리셋 정의가 있어도 실제 아이템에 연결되지 않아 UI에 노출되지 않고, 에뛰드는 이미 반영된 설명이 후기와 다른 이벤트 내용으로 남아 있으며, 토니모리/에스쁘아는 계정 또는 해시태그 표기에 오탈자가 있다. 아리얼은 선착순 부스로 강조되지만 원문상 핵심은 캡처 이벤트와 랜덤 증정, 부직포 백 안내에 가깝다.

이번 계획은 먼저 "명백한 오류"를 수정하는 P0 범위와, 같은 후기 기준으로 아직 비어 있는 `mission`/`prize`/`firstComeEvent` 필드를 어떤 원칙으로 채울지 정하는 P1 범위를 분리한다. 구현 시에는 후기 원문에 없는 내용은 억지로 추정하지 않고, 제공된 문구만 옮기는 방식으로 데이터 신뢰도를 유지한다.

## 기술적 고려사항

- `src/lib/data/lootItems.ts`는 해시태그 프리셋과 실제 부스 아이템 데이터가 분리돼 있어, 프리셋이 정의돼 있어도 아이템에서 `hashtags: []`를 직접 넣으면 UI에는 반영되지 않는다.
- `firstComeEvent`는 지도 hover, 리스트, 상세 시트에서 별도 강조 문구로 노출되므로, 근거가 약한 선착순 표시는 과장된 사용자 인상을 만들 수 있다.
- `BoothDetailSheet.svelte`는 `prize`, `mission`, `category`, `hashtags`가 비어 있지 않으면 그대로 노출하므로, 후기 기준 문구 정합성이 중요하다.
- 업로드 방식은 현재 `mission` 문자열 안에 묻혀 있어 `Hashtag Block`과 시각적으로 분리된다. `피드`, `스토리`, `피드 또는 스토리`는 별도 구조화 필드와 별도 라벨/칩으로 노출하는 편이 사용성이 낫다.
- 에스트라처럼 현장 즉시 수령이 아닌 "추첨 후기 이벤트"는 `Prize`와 의미가 다르다. 즉시 보상과 추첨형 후속 이벤트를 같은 필드에 섞으면 현장 기대치가 왜곡될 수 있다.
- 이번 계획은 코드 구현뿐 아니라, 후기 기준과 앱 반영 범위를 다시 설명하는 보고 문서 또는 변경 로그 갱신까지 포함해야 이후 재검토 시 기준이 흔들리지 않는다.

---

## TODO

### Phase R: 재발 경로 분석

0. [x] **하드코딩 후기 데이터가 반복적으로 어긋난 원인을 고정한다** — 임시 문구 덮어쓰기 대신 데이터 구조 문제를 먼저 정리
   - [x] `src/lib/data/lootItems.ts`: 해시태그 preset과 item 본문 필드가 따로 관리되면서 일부 브랜드는 preset만 있고 item 연결이 빠진 경로(AHC, 메디힐, 아벤느 등)를 원인으로 문서화한다.
   - [x] `src/lib/data/lootItems.ts`, `src/lib/components/BoothDetailSheet.svelte`: 업로드 타입과 추첨형 이벤트를 `mission`/`prize` 자유문자열에만 넣어 둔 현재 구조가 왜 후기 정합성 저하를 반복시키는지 정리하고, 구조화 필드 추가를 재발방지책으로 명시한다.

### Phase 1: 후기 기준과 현재 데이터의 충돌 지점을 고정한다

1. [x] **명백한 오류 후보를 후기 원문 기준으로 확정한다** — 수정 대상과 미반영 대상을 섞지 않게 분리
   - [x] `src/lib/data/lootItems.ts`: AHC, 에뛰드, 토니모리, 에스쁘아, 아리얼의 현재 `hashtags`, `hashtagAccountTags`, `mission`, `prize`, `firstComeEvent` 값을 후기 원문과 1:1로 대조해 충돌 항목 목록을 정리한다.
   - [x] `C:\Users\Narang\Downloads\2026-04-17_16-47-40_untitled.md`: 충돌 항목마다 근거 문구를 다시 확인해 "오탈자", "설명 불일치", "강조 과장", "단순 미반영"으로 분류한다.

2. [x] **후기 원문으로 채울 수 있는 정보 범위를 확정한다** — 추정 반영을 방지
   - [x] `src/lib/data/lootItems.ts`: 19개 부스 중 현재 `mission`/`prize`/`firstComeEvent`가 비어 있는 항목을 추려, 이번 수정에서 채울 수 있는 부스와 그대로 둘 부스를 나눈다.
   - [x] `docs/report/2026-04-17_coupang-mega-beauty-brand-reference.md`: 기존 기준 문서가 해시태그/계정 중심이라 미션/경품 기준을 담지 못하는 한계를 메모하고, 구현 후 보강이 필요한지 판단 근거를 남긴다.

### Phase 2: 명백한 하드코딩 오류를 후기 기준으로 수정한다

3. [x] **AHC 데이터를 프리셋과 후기 설명이 모두 보이도록 바로잡는다** — 현재 빈 데이터 때문에 UI에 정보가 사라진 상태 해소
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-ahc` 아이템에 `getCoupangMegaBeautyHashtagBlock('cmbs-2026-ahc')`를 연결해 해시태그와 고정 계정 태그가 실제 UI에 노출되게 수정한다.
   - [x] `src/lib/data/lootItems.ts`: 후기 기준으로 `category`, `mission`, `prize`를 `카플친/인스타 팔로우 + 슈팅게임 + 본품 뽑기` 흐름이 드러나도록 문구화한다.

4. [x] **에뛰드 이벤트 설명을 후기 기준으로 교체한다** — 현재 다른 현장안으로 보이는 설명 제거
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-etude`의 `mission`을 `인스타 팔로우/업로드 + 뽑기` 구조로 바꾸고, 후기 원문에 없는 `쿠션 TEST`, `품평지 작성` 문구를 제거한다.
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-etude`의 `prize`를 `최소 틴트 본품, 쿠션 본품` 요지가 드러나도록 수정하고, 필요 시 연결된 `detailImage` 캡션도 새 설명과 충돌하지 않게 정리한다.

5. [x] **오탈자와 잘못된 계정 태그를 후기 기준으로 수정한다** — 복사/공유 시 잘못된 값이 퍼지는 문제 방지
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-tonymoly`의 `hashtagAccountTags` `@tonymory` → `@tonymoly`로 정정한다.
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-tonymoly`의 `socialLinks` `accountId: 'tonymory'`(478줄) → `'tonymoly'`로 정정한다.
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-espoir`의 해시태그 `#에스뿌아`를 후기 원문 기준 `#에스쁘아`로 정정한다.
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-thefaceshop` preset `#페이스샵` → 후기 기준 `#더페이스샵`으로 정정한다.
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-thefaceshop` kakao URL `https://pf.kakao.com/_xisxdGR`을 후기 기준 `https://pf.kakao.com/xisxdGR`(언더스코어 제거)로 재확인 후 정정한다.

6. [x] **아리얼의 강조 방식을 후기 기준으로 재조정한다** — 선착순 강조 대신 실제 핵심 정보 노출
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-ariul`의 `firstComeEvent`를 제거하거나 후기 근거가 있는 표현으로 낮추고, 현재의 과도한 선착순 강조를 없앤다.
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-ariul`의 `mission`/`prize`를 `인스타/카플친 + 사다리타기 + 캡처 이벤트 + 부직포 백 안내`가 드러나도록 보강한다.

6-1. [x] **누락된 해시태그 preset을 후기 기준으로 신설/보강한다** — preset 미정의로 UI에 비어 노출되던 부스 해소

- [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_HASHTAG_BLOCKS`에 `cmbs-2026-mediheal`(`#메디힐 #메디힐마스크팩 #쿠팡뷰티 #메가뷰티쇼`) 추가 후 아이템에 연결한다.
- [x] `src/lib/data/lootItems.ts`: `cmbs-2026-avene`(`#쿠팡뷰티 #메가뷰티쇼 #아벤느 #시칼파트`), `cmbs-2026-physiogel`(`#쿠팡뷰티 #메가뷰티쇼 #피지오겔`), `cmbs-2026-aestura`(`#에스트라 #쿠팡뷰티 #메가뷰티쇼`) preset 신설 후 연결한다.
- [x] `src/lib/data/lootItems.ts`: `cmbs-2026-ahc` preset에 후기(176줄) 기준 `#SKINGAME_T_SHOT`을 추가한다.
- [x] `src/lib/data/lootItems.ts`: `cmbs-2026-banilaco` preset `#쿠팡메가뷰티쇼`를 후기(214줄) 기준 `#메가뷰티쇼`로 정정한다.

### Phase 3: 미반영 부스 데이터 보강 원칙과 사용자 노출을 정리한다

7. [x] **후기 원문에 미션/경품이 명시된 19개 부스 전부를 동일 턴에 반영한다** — 후기 원문 기반이라 분할 근거가 약함, 일괄 처리로 정합성 유지
   - [x] `src/lib/data/lootItems.ts`: 닥터지, 이니스프리, 에스트라, 피지오겔, AHC, 더페이스샵, 바닐라코, 에이지투웨니스, 메디힐, 토니모리, 롬앤, 네이처리퍼블릭, 에스쁘아, 아벤느, 이지듀, 듀이트리, 포렌코즈의 `mission`/`prize`/`category`를 후기 원문 문구만 옮겨 채운다(추정 금지).
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-easydew`의 `firstComeEvent: '선착순 이벤트 있음'`은 후기(412줄) "일 500명 선착순" 근거 있어 **유지**하고, 가능하면 "일 500명 선착순(3시 이후 소진 주의)"으로 구체화한다.

8. [x] **기준 문서와 변경 기록을 후기 기준으로 갱신한다** — 다음 검토 시 출처 혼선을 줄이기
   - [x] `docs/report/2026-04-17_coupang-mega-beauty-brand-reference.md`: 해시태그/계정 기준에 더해, 이번에 실제로 수정한 부스의 미션/경품/강조 기준을 짧게 보강하거나 별도 후속 문서 필요 여부를 명시한다.
   - [x] `CHANGELOG.md`: 후기 기준 하드코딩 정합성 수정 사항(AHC, 에뛰드, 토니모리, 에스쁘아, 아리얼)을 사용자 관점으로 요약해 기록한다.

### Phase 4: 화면 노출과 검색 영향 범위를 검증한다

9. [x] **인스타 업로드 타입을 별도 데이터로 구조화한다** — 해시태그와 분리된 업로드 조건을 명시적으로 표현
   - [x] `src/lib/data/lootItems.ts`: `LootItem`에 `instagramUploadType?: 'feed' | 'story' | 'feed_or_story'` 또는 동등 의미의 필드를 추가한다.
   - [x] `src/lib/data/lootItems.ts`: 후기 원문 기준으로 각 부스의 인스타 업로드 요구사항을 `피드`, `스토리`, `피드 또는 스토리`로 채우고, 업로드 요구가 없거나 불명확하면 비운다.

10. [x] **추첨 후기 이벤트를 즉시 보상과 분리해 구조화한다** — 현장 수령형과 추첨형을 혼동하지 않게 구분

- [x] `src/lib/data/lootItems.ts`: `LootItem`에 `raffleEvent` 또는 동등 의미의 필드를 추가해 에스트라 같은 "업로드 후 추첨" 이벤트를 `prize`와 분리 저장한다.
- [x] `src/lib/data/lootItems.ts`: 에스트라를 포함해 후기 원문에 추첨형 후속 이벤트가 있는 부스를 찾아 `raffleEvent`에 문구를 옮기고, 즉시 수령형 `prize`와 겹치지 않게 정리한다.

11. [x] **상세 시트에서 업로드 타입과 추첨 이벤트를 분리 노출한다** — 사용자에게 바로 행동 지침이 보이게 정리

- [x] `src/lib/components/BoothDetailSheet.svelte`: `Hashtag Block` 상단에 단순 `피드` 한 단어 대신 `업로드 조건` 라벨과 `피드`, `스토리`, `피드 또는 스토리` 칩을 보여주고, 복사 텍스트에는 포함하지 않게 한다.
- [x] `src/lib/components/BoothDetailSheet.svelte`: `Prize`와 별도로 `추첨 이벤트` 섹션을 추가해 "업로드 시 매일 3명 추첨" 같은 후기 이벤트를 분리 표기한다.

12. [x] **상세 시트와 리스트에서 바뀐 데이터가 의도대로 보이는지 확인한다** — 텍스트 수정이 실제 노출과 일치하는지 검증

- [x] `src/lib/components/BoothDetailSheet.svelte`: `firstComeEvent`, `prize`, `mission`, `hashtags`가 새 값으로 표시될 때 섹션 순서와 문구 흐름이 자연스러운지 확인 포인트를 정리한다.
- [x] `src/lib/components/LootFeed.svelte`, `src/lib/components/ExhibitionMap.svelte`: 검색/정렬/hover 강조가 수정된 `firstComeEvent`, `instagramUploadType`, `raffleEvent`에 맞게 달라지는지 검증 항목을 적는다.

13. [x] **기본 검증 절차를 문서화한다** — 구현 직후 빠르게 회귀 확인 가능하게 유지

- [x] `package.json`: 현재 사용 가능한 검증 명령(`npm run check`, 필요 시 `npm run build`)을 기준으로 문서형 검증 절차를 계획서에 반영한다.
- [x] `docs/plan/2026-04-17_fix-coupang-mega-beauty-hardcoded-review-data.md`: 구현 완료 후 확인할 항목을 `해시태그 복사`, `업로드 타입 칩`, `추첨 이벤트 섹션`, `SNS 핸들`, `선착순 강조`, `상세 시트 텍스트` 중심으로 요약한다.

## 검증 메모

- 워크트리 구현 범위에서 확인한 코드 영향:
  - `BoothDetailSheet.svelte`는 `업로드 조건` 칩을 `Hashtag Block` 상단에 추가했고, 복사 텍스트에는 포함하지 않는다.
  - `BoothDetailSheet.svelte`는 `Prize`와 별도 `추첨 이벤트` 섹션을 추가해 에스트라 같은 후속 추첨형 이벤트를 분리 노출한다.
  - `LootFeed.svelte`는 검색 문자열에 `raffleEvent`와 `instagramUploadType` 라벨을 추가해 검색 누락을 줄인다.
  - `ExhibitionMap.svelte`는 여전히 `firstComeEvent`만 강조에 사용하므로, 아리얼 과장 강조 제거와 이지듀 선착순 유지가 그대로 hover/맵 배지에 반영된다.
- 수동 확인 포인트:
  - AHC, 메디힐, 아벤느, 에스트라, 피지오겔이 더 이상 빈 해시태그 블록으로 보이지 않는지
  - 에뛰드가 `쿠션 TEST`가 아니라 `인스타 팔로우/업로드 + 뽑기`로 보이는지
  - 토니모리 `@tonymoly`, 에스쁘아 `#에스쁘아`, 더페이스샵 `#더페이스샵`이 복사 텍스트와 링크에 일치하는지
  - 이니스프리는 `피드 또는 스토리`, 에스쁘아/이지듀는 `스토리`, 닥터지/토니모리/롬앤/네이처리퍼블릭은 `피드`, 모호한 항목은 `업로드`로 표시되는지
  - 에스트라의 `추첨 이벤트`가 `Prize`와 분리되어 보이는지
  - 아리얼은 선착순 경고가 사라지고 캡처 이벤트/부직포 백 안내 중심으로 보이는지
- 사용 가능한 검증 명령:
  - `npm run check`
  - `npm run build`
- 구현 스킬 제약상 위 명령은 워크트리에서 실행하지 않았고, `/merge-test` 단계에서 main 병합 후 실행 대상으로 남긴다.

---

_상태: 머지대기 | 진행률: 50/50 (100%)_
