# 문서 경로 해석 규칙

> 이 파일은 스킬/에이전트에서 문서 경로를 결정할 때 참조하는 공통 규칙이다.

## 규칙

문서 경로(plan, archive, DONE, history 등)를 사용할 때는 **현재 프로젝트의 AGENTS.md/CLAUDE.md `문서 위치 규칙` 테이블**을 참조하라.

테이블이 없으면 아래 기본 경로를 사용:

| 용도 | 기본 경로 |
|------|----------|
| 계획 문서 | `docs/plan/` |
| 아카이브 | `docs/archive/` |
| 완료 이력 | `docs/DONE.md` |
| 변경 이력 | `docs/history/` |
| TODO | `TODO.md` |

plans 워크트리(`.worktrees/plans/`)가 존재하면 **plan/archive/TODO/DONE 조회와 문서 커밋은 그 cwd를 우선 사용**한다. plans 워크트리가 없거나 bootstrap 전이면 동일 규칙을 원본 repo root에 적용한다.

## wtools 예외

wtools(`common/tools/` 존재)에서는 CLAUDE.md에 `common/docs/plan/`, `common/docs/archive/` 등이 명시되어 있으므로 자연스럽게 해당 경로를 사용하게 된다. 별도 분기 로직 불필요.

### plans 워크트리 커밋 헬퍼

`Get-PlanRoot()`는 별도 공통 함수가 있으면 그것을 재사용하고, 없으면 아래 계약을 인라인으로 구현한다.
- 반환값은 `docs/plan`, `docs/archive`, `TODO.md`, `docs/DONE.md`를 읽고 쓸 **문서 작업 cwd**다.
- `.worktrees/plans/docs/plan`이 존재하면 `"$RepoRoot\\.worktrees\\plans"`를 반환한다.
- 그렇지 않으면 `$RepoRoot`를 반환한다.

```powershell
function Get-PlanRoot {
    param($RepoRoot)

    if (Test-Path "$RepoRoot\.worktrees\plans\docs\plan") {
        return "$RepoRoot\.worktrees\plans"
    }
    return $RepoRoot
}

function Resolve-DocsCommitRoot {
    param($RepoRoot)

    return (Get-PlanRoot $RepoRoot)
}

function Resolve-DocsCommitCandidates {
    param($RepoRoot, $EditedPaths)

    $commitRoot = Resolve-DocsCommitRoot $RepoRoot
    if (-not (Test-Path $commitRoot)) { return @() }

    $allowedRoots = @(
        "docs/plan/",
        "docs/archive/",
        "TODO.md",
        "docs/DONE.md"
    )

    $candidates = foreach ($editedPath in $EditedPaths) {
        $relativePath = $editedPath
        $prefix = "$commitRoot\"
        if ($relativePath.StartsWith($prefix)) { $relativePath = $relativePath.Substring($prefix.Length) }

        foreach ($allowedRoot in $allowedRoots) {
            if ($relativePath -like "$allowedRoot*") {
                $relativePath
                break
            }
        }
    }

    return @($candidates | Sort-Object -Unique)
}

function Test-PlansDirty {
    param($RepoRoot)

    if (-not (Test-Path "$RepoRoot\.worktrees\plans")) { return $false }
    $dirty = git -C "$RepoRoot\.worktrees\plans" status --porcelain
    return [bool]$dirty
}
```

- `Resolve-DocsCommitRoot`는 문서 커밋이 실제로 일어날 cwd를 반환한다. plans worktree bootstrap이 끝나기 전에는 repo root가 반환된다.
- `Resolve-DocsCommitCandidates`는 `docs/plan/`, `docs/archive/`, `TODO.md`, `docs/DONE.md` 네 경로만 add 대상으로 남긴다.
- `Test-PlansDirty`가 `false`라고 해서 항상 clean이라는 뜻은 아니다. `.worktrees/plans`가 아직 없을 수도 있으므로 bootstrap 완료 여부를 함께 확인한다.
- `git add -A` / `git add .` / `git add docs/`는 plans 워크트리에서도 금지한다.
