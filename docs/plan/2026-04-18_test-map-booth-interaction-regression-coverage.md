# test: map booth interaction regression coverage

> 작성일시: 2026-04-18 00:15
> 기준커밋: f613e3f
> 대상 프로젝트: expo-harvest
> 상태: 검토완료
> 진행률: 0/8 (0%)
> 출처: /review에서 자동 생성
> 요약: 맵 부스 탭 회귀는 이번에 복구됐지만, 현재 검증은 `npm run check`, `npm run build`, 수동 확인에 치우쳐 있다. `ExhibitionMap`의 `pointerdown`/drag 계약이 다시 바뀌면 데스크톱 클릭 손실이나 오탭 재발을 자동으로 잡지 못하므로, preview 기반 브라우저 회귀 테스트와 안정적인 selector를 추가해 첫 탭 상세 시트 오픈 계약을 고정해야 한다.
> 재검토일시: 2026-04-18
> 재검토 결론: 적용한다. 다만 현재 repo에는 `tests/`와 Playwright 설정이 아예 없으므로, 이번 문서는 "기존 테스트 보강"이 아니라 "새 러너/설정/selector/문서 경로를 처음부터 추가"하는 순서로 더 분명하게 써야 한다.

---

## 개요

이번 세션에서 맵 부스 상세 시트 회귀는 코드 수정으로 복구했지만, 근거가 되는 자동 검증은 아직 없다. 특히 `ExhibitionMap.svelte`는 확대/드래그/overview 분기와 SVG 인터랙션을 함께 다루고 있어, 클릭 이벤트 시점이 `click`에서 `pointerdown`으로 바뀌거나 부모 viewport가 입력을 먼저 잡는 구조가 다시 흔들리면 같은 유형의 회귀가 재발하기 쉽다.

현재 프로젝트는 `svelte-check`와 `vite build`만 기본 검증으로 사용하고 있으며, 브라우저 상호작용을 직접 잡는 테스트 러너가 없다. 단순 컴포넌트 테스트보다 실제 SVG hit target, pointer move, 상세 시트 오픈을 함께 확인해야 하므로, built preview를 띄운 뒤 Playwright로 맵 상호작용을 검증하는 방향이 가장 현실적이다.

## 기술적 고려사항

- [`package.json`](D:/work/project/service/wtools/expo-harvest/package.json): 현재 `check/build/preview`만 있고 브라우저 테스트 스크립트가 없다.
- 현재 repo에는 `tests/` 디렉터리와 `playwright.config.ts`가 없으므로, spec 작성 전에 테스트 디렉터리와 config 파일을 새로 만드는 단계가 필요하다.
- [`docs/archive/2026-04-16_port-react-ui-to-svelte.md`](D:/work/project/service/wtools/expo-harvest/docs/archive/2026-04-16_port-react-ui-to-svelte.md): 초기 이식 시점에는 `vitest/testing-library`가 미설치라 컴포넌트 단위 테스트를 제외했다. 이번 후속은 그 공백 중 "실제 맵 상호작용 회귀"만 최소 범위로 메우는 작업이다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte): SVG `<g>` 타깃, viewport drag, overview/section 분기가 한 파일에 모여 있어 시각적 selector 대신 명시적 `data-*` 계약이 필요하다.
- [`src/lib/components/BoothDetailSheet.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/BoothDetailSheet.svelte): 상세 시트 root `<div role="dialog">`와 `<h2 id={\`sheet-title-\${item.id}\`}>`가 이미 selector 삽입 지점으로 분명하므로, 새 `data-*`는 여기 두 곳에만 얹어도 열린 상태를 안정적으로 판정할 수 있다.
- [`scripts/run-build.mjs`](D:/work/project/service/wtools/expo-harvest/scripts/run-build.mjs), [`scripts/run-dev.mjs`](D:/work/project/service/wtools/expo-harvest/scripts/run-dev.mjs): live dev 서버와 build wrapper는 별도 guard가 있으므로, E2E는 `npm run build` 후 `npm run preview -- --host 127.0.0.1 --port 4173` 같은 built-preview 경로로 고정하는 편이 충돌 위험이 낮다.

---

## TODO

### Phase 1: 브라우저 회귀 테스트 경로를 고정한다

1. - [ ] **브라우저 테스트 러너와 실행 경로를 확정한다** — dev 서버 의존 flake를 줄이는 방향으로 결정
   - [ ] `package.json`: 현재 스크립트와 devDependencies를 기준으로 브라우저 테스트 러너 부재 상태를 다시 확인하고, preview 기반 실행을 기본 계약으로 문서화한다.
   - [ ] `docs/archive/2026-04-16_port-react-ui-to-svelte.md`: 과거 `vitest/testing-library` 제외 근거를 다시 읽고, 이번 후속이 "맵 상호작용 회귀 최소 커버" 범위라는 판단을 계획서 본문에 고정한다.

2. - [ ] **Playwright 실행 뼈대를 추가한다** — 로컬과 CI에서 같은 명령으로 돌 수 있게 만든다
   - [ ] `package.json`: `@playwright/test` devDependency를 추가하고 `test:e2e` 스크립트가 `npm run build` 후 Playwright를 실행하도록 명령을 고정한다.
   - [ ] `playwright.config.ts`: `testDir`를 `tests/e2e`로 두고 `npm run preview -- --host 127.0.0.1 --port 4173`를 `webServer.command`로 사용하는 기본 설정 파일을 새로 만든다.
   - [ ] `playwright.config.ts`: `baseURL`, timeout, `reuseExistingServer`, CI/로컬 분기만 넣고 스크린샷·trace 정책은 실패 시 수집 위주로 최소 설정한다.

### Phase 2: 테스트가 붙을 안정적인 selector를 노출한다

3. - [ ] **맵 부스와 viewport에 자동화 selector를 노출한다** — 텍스트/레이아웃 변경에 덜 깨지게 유지
   - [ ] `src/lib/components/ExhibitionMap.svelte`: overview와 section booth `<g role="button">` 두 경로에 같은 `data-map-booth-id="{item.id}"` selector를 추가한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: overview viewport `<div role="group">`와 section viewport 래퍼에 같은 `data-map-viewport` 속성을 추가하고, 현재 section 식별값은 별도 `data-map-section`으로 노출한다.

4. - [ ] **상세 시트 단정 지점을 selector로 고정한다** — 브라우저 테스트가 열린 상태를 명확히 판정하게 만든다
   - [ ] `src/lib/components/BoothDetailSheet.svelte`: 상세 시트 root `<div role="dialog">`에 `data-booth-detail-sheet` selector를 추가한다.
   - [ ] `src/lib/components/BoothDetailSheet.svelte`: 제목 `<h2>`에 `data-booth-detail-title`을 추가하고, 필요하면 root 또는 제목에 현재 `item.id`를 읽을 수 있는 `data-booth-id`를 함께 노출한다.

### Phase 3: 현재 회귀를 잡는 브라우저 테스트를 작성한다

5. - [ ] **첫 탭 즉시 상세 시트 오픈 회귀를 고정한다** — 데스크톱 클릭 손실 재발 방지
   - [ ] `tests/e2e/map-booth-detail.spec.ts`: 새 파일을 만들고 앱 진입 후 `지도` 탭으로 이동하는 공통 helper 또는 `test.step` 흐름을 먼저 고정한다.
   - [ ] `tests/e2e/map-booth-detail.spec.ts`: 대표 부스를 한 번 클릭하면 `data-booth-detail-sheet`가 바로 나타나는 케이스를 추가한다.
   - [ ] `tests/e2e/map-booth-detail.spec.ts`: 열린 상세 시트의 `data-booth-detail-title` 또는 `data-booth-id`가 클릭한 부스와 일치하는지 assertion을 추가한다.

6. - [ ] **drag 이후 오탭 방지 회귀를 고정한다** — viewport 제스처와 상세 시트가 다시 섞이지 않게 만든다
   - [ ] `tests/e2e/map-booth-detail.spec.ts`: `data-map-viewport`를 대상으로 pointer drag만 수행했을 때 상세 시트가 열리지 않는 케이스를 추가한다.
   - [ ] `tests/e2e/map-booth-detail.spec.ts`: drag 직후에는 `data-booth-detail-sheet`가 없는 상태를 assertion으로 고정한다.
   - [ ] `tests/e2e/map-booth-detail.spec.ts`: 같은 부스를 다시 명시적으로 누를 때만 상세 시트가 열리는지 후속 assertion을 추가한다.

7. - [ ] **overview/section 계약 차이를 명시적으로 고정한다** — 탭 계약이 다시 암묵적으로 바뀌지 않게 만든다
   - [ ] `tests/e2e/map-booth-detail.spec.ts`: overview에서 부스를 눌렀을 때 상세 시트가 열리고 현재 section override가 유지되는 계약을 별도 케이스로 검증한다.
   - [ ] `tests/e2e/map-booth-detail.spec.ts`: section 모드로 전환한 뒤 같은 selector와 상세 시트 assertion이 유지되는지 별도 케이스로 검증한다.

### Phase 4: 실행 문서와 검증 루틴을 정리한다

8. - [ ] **새 브라우저 회귀 테스트를 운영 흐름에 연결한다** — 다음 회귀 때 사람이 떠올리지 않아도 되게 만든다
   - [ ] `README.md` 또는 테스트 안내 문서: `npm run check`, `npm run build`, `npm run test:e2e` 순서와 preview 기반 실행 이유를 짧게 추가한다.
   - [ ] 검증 로그: 새 테스트를 실제 실행해 통과 여부, 첫 실행 시 browser install 필요 여부, 남는 flake가 있는지 계획서 또는 DONE 문구에 남긴다.

---

*상태: 검토완료 | 진행률: 0/8 (0%)*
