# 수정 보고서: 해시태그 코드블럭 하드코딩 기준 재정렬

> 작성일: 2026-04-17
> 대상: expo-harvest
> 범위: `쿠팡메가뷰티쇼 2026` 해시태그 코드블럭, 계정 체크박스 상태, 기준 문서 정리

## 1. 문제 확인

- 기존 구현은 `Hashtag Block` 기준값을 데이터 곳곳에 흩어서 들고 있었고, 일부 브랜드는 사용자 제공 목록에 없는 `@계정`이 섞여 있었습니다.
- UI는 `고정 @계정`이 있는 경우와 `SNS 링크로만 계정을 추가할 수 있는 경우`를 구분하지 못해, 체크박스 상태가 요구사항과 어긋났습니다.
- 기준 문서에도 포렌코즈 계정과 해시태그 대상 외 브랜드 빈 행이 남아 있어, "없는 건 표시하지 않는다"는 원칙과 어긋났습니다.

## 2. 수정 내용

### 데이터 기준 고정

- [src/lib/data/lootItems.ts](/D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts)에 `COUPANG_MEGA_BEAUTY_HASHTAG_BLOCKS` 상수를 추가했습니다.
- 사용자 제공 11개 브랜드만 해시태그 코드블럭 기준값으로 등록했고, 그 외 브랜드는 코드블럭에서 비워지도록 정리했습니다.
- 포렌코즈의 `@forencos_official`은 기준 목록에 없으므로 제거했습니다.

### UI 동작 수정

- [src/lib/components/BoothDetailSheet.svelte](/D:/work/project/service/wtools/expo-harvest/src/lib/components/BoothDetailSheet.svelte)에서 코드블럭 조합을 `hashtags + 고정 account tags + (체크 시 SNS 링크 account tags)` 구조로 정리했습니다.
- `@계정` 기준값이 있는 브랜드는 체크박스를 `checked + disabled`로 고정해 항상 포함되도록 했습니다.
- `@계정` 기준값이 없는 브랜드는 체크박스를 `unchecked + enabled`로 유지하고, 사용자가 체크하면 아래 SNS 링크의 인스타그램 계정을 코드블럭에 추가할 수 있게 했습니다.
- 코드블럭에는 기준표에 없는 계정/해시태그가 섞여 나오지 않도록 데이터 소스만 사용하게 제한했습니다.

### 문서 정리

- [docs/report/2026-04-17_coupang-mega-beauty-brand-reference.md](/D:/work/project/service/wtools/expo-harvest/docs/report/2026-04-17_coupang-mega-beauty-brand-reference.md)를 사용자 기준 그대로 정리했습니다.
- 해시태그 대상 외 브랜드 빈 행을 제거했고, 포렌코즈 계정도 비웠습니다.

## 3. 결과

- 해시태그 코드블럭은 이제 사용자 제공 목록만 하드코딩 기준으로 사용합니다.
- 없는 계정은 코드블럭에 나오지 않습니다.
- 체크박스 상태는 아래처럼 고정됩니다.

| 조건 | 체크박스 |
| --- | --- |
| `@계정` 존재 | `checked + disabled` |
| `@계정` 없음 | `unchecked + enabled` |
