# 테마 시스템

## 테마 프리셋

5가지 프리셋이 구현되어 있다. `index.css`의 `[data-theme="..."]` 속성 선택자로 CSS 변수를 정의한다.

| ID | 이름 | 배경 | 특징 |
|----|------|------|------|
| `minimal-dark` | Minimal Dark | `#000000` | iOS 다크 모드 감성, 기본값 |
| `minimal-light` | Minimal Light | `#ffffff` | 깔끔한 흰 배경 |
| `github` | GitHub | `#ffffff` | GitHub README 스타일 |
| `notion` | Notion | `#ffffff` | Notion 문서 스타일 |
| `sepia` | Sepia | `#f9f3e8` | 종이 느낌, 눈 편안 |

## CSS 변수 목록

각 테마가 정의하는 변수:

| 변수 | 역할 |
|------|------|
| `--bg-app` | 앱 배경 |
| `--bg-panel` | 사이드바/패널 배경 |
| `--bg-hover` | 호버 배경 |
| `--bg-elevated` | 카드/엘리베이션 배경 |
| `--bg-active` | 선택/활성 배경 |
| `--border` | 구분선 색상 |
| `--text-primary` | 기본 텍스트 |
| `--text-secondary` | 보조 텍스트 |
| `--text-muted` | 흐린 텍스트 |
| `--text-placeholder` | 플레이스홀더 |
| `--accent` | 강조 색상 |
| `--accent-rgb` | 강조 색상 RGB (rgba() 조합용) |
| `--accent-text` | 강조 배경 위 텍스트 |
| `--code-bg` | 인라인 코드 배경 |
| `--code-fg` | 인라인 코드 텍스트 |
| `--quote-border` | 인용문 왼쪽 보더 |
| `--scrollbar` | 스크롤바 색상 |
| `--scrollbar-hover` | 스크롤바 호버 |
| `--tab-active-bg` | 활성 탭 배경 |
| `--prose-heading` | 제목 색상 |
| `--prose-body` | 본문 텍스트 |
| `--prose-link` | 링크 / 기울임 색상 |
| `--prose-bold` | 굵은 텍스트 |
| `--prose-hr` | 수평선 색상 |
| `--prose-quote` | 인용문 텍스트 |
| `--prose-table-border` | 표 보더 |
| `--prose-th-bg` | 표 헤더 배경 |

## 폰트 패밀리

| ID | 이름 | 폰트 스택 |
|----|------|-----------|
| `system` | System UI | `-apple-system, BlinkMacSystemFont, Segoe UI, system-ui` |
| `pretendard` | Pretendard | `Pretendard Variable, Pretendard` |
| `serif` | Serif | `Georgia, Noto Serif, Times New Roman` |
| `mono` | Monospace | `Consolas, D2Coding, Fira Code` |

`[data-font="..."]` 속성 선택자로 `--font-body` 변수를 정의. `.prose` 클래스가 이를 참조한다.

## 동적 CSS 변수

사용자 설정 슬라이더에 따라 `useThemeApply` 훅이 직접 `<html>` 스타일에 설정:

```css
--font-size-body: 15px;      /* 글자 크기 */
--content-width: 720px;      /* 본문 최대 너비 */
--line-height-body: 1.7;     /* 줄간격 */
```

## 코드 테마 (Shiki)

| ID | 이름 | 밝기 |
|----|------|------|
| `github-dark` | GitHub Dark | 어두움 |
| `github-light` | GitHub Light | 밝음 |
| `one-dark-pro` | One Dark Pro | 어두움 |
| `dracula` | Dracula | 어두움 |
| `nord` | Nord | 어두움 |
| `tokyo-night` | Tokyo Night | 어두움 |

## ProseStyles (마크다운 요소별 스타일)

각 요소는 `'default'` 또는 커스텀 스타일을 선택할 수 있다. 기본값은 모두 `'default'`이며, 표(`table`)만 `'custom'`이 기본.

| 요소 | 옵션 |
|------|------|
| h1 | `default` / `hash` (#프리픽스) |
| h2 | `default` / `border-left` (왼쪽 보더) |
| h3 | `default` / `diamond` (◆) / `arrow` (▸) / `dot` (●) |
| h4 | `default` / `arrow` (▸) |
| h5 | `default` / `custom` (대문자 트래킹) |
| h6 | `default` / `custom` (뮤트 스타일) |
| blockquote | `default` / `custom` (콜아웃 감지) |
| hr | `default` / `decorative` (✦ ✦ ✦) |
| list | `default` / `custom` (깊이별 불릿) |
| table | `default` / `custom` (그라디언트 헤더 + 라운딩) |
| a | `default` / `icon` (외부 ↗ 아이콘) |
| img | `default` / `custom` (그림자 + 캡션) |
| strong | `default` / `highlight` (배경 강조) / `color` (색상만) |
| em | `default` / `custom` (색상 적용) |
| del | `default` / `custom` (색상 적용) |

## Tailwind Typography 충돌 방지

`@tailwindcss/typography` 플러그인이 일부 요소에 light-mode용 어두운 색상 변수를 주입한다. 이를 방지하기 위해 `tailwind.config.js`에서 비활성화하고 `index.css`에서 직접 오버라이드한다.

```js
// tailwind.config.js
css: {
  strong: false,
  em: false,
}
```

```css
/* index.css */
.prose strong    { color: var(--prose-bold); font-weight: 700; }
.prose blockquote { color: var(--prose-quote); font-style: normal; }
.prose blockquote * { color: inherit; }
```
