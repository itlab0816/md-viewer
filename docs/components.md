# 컴포넌트 문서

## TitleBar

커스텀 타이틀바. Electron `titleBarStyle: 'hidden'`에서 드래그 영역과 컨트롤을 직접 구현.

**기능**
- 사이드바 토글 (☰)
- 현재 파일명 + 수정 여부(`*`) 표시
- 뷰 모드 전환 버튼 (Preview / Split / Editor)
- 목차 패널 토글
- 설정 패널 토글
- 창 최소화 / 최대화 / 닫기

---

## TabBar

열린 파일 탭 목록.

**기능**
- 파일별 탭 표시 (파일명)
- 탭 클릭으로 전환
- 탭 × 버튼으로 닫기
- 미저장 파일 표시 (`•`)

---

## Sidebar

IntelliJ 스타일 파일 탐색기.

**기능**
- 파일 / 폴더 열기 버튼
- 루트 폴더를 최상위 노드로 표시
- 폴더 클릭으로 펼치기/닫기
- 모두 펼치기 / 모두 닫기
- 모든 파일 보기 토글 (⊞) — 비-마크다운 파일 표시/숨김
- 드래그로 너비 조절 (160px ~ 480px)
- 확장자별 파일 아이콘

**파일 아이콘 매핑**

| 확장자 | 아이콘 |
|--------|--------|
| md, markdown, mdx | 📝 |
| png, jpg, gif, svg | 🖼️ |
| mp4, mov, avi | 🎬 |
| mp3, wav, flac | 🎵 |
| pdf | 📕 |
| zip, tar, gz | 📦 |
| js, ts, py, go ... | 💻 |
| json, yaml, toml | ⚙️ |

---

## MarkdownEditor

CodeMirror 6 기반 텍스트 에디터.

**기능**
- 마크다운 문법 하이라이팅
- 줄 번호 표시
- Ctrl+S 저장
- 에디터 내용 변경 시 탭에 미저장 표시

---

## MarkdownRenderer

`react-markdown` 기반 렌더러. `components` prop으로 각 마크다운 요소를 커스텀 컴포넌트로 교체.

**지원 플러그인**
- `remark-gfm` — 테이블, 체크박스, 취소선
- `remark-math` + `rehype-katex` — 수식 렌더링
- `rehype-slug` — 헤딩에 id 자동 부여

**특수 처리**
- `language-mermaid` 코드 블록 → `MermaidBlock` 컴포넌트 (SVG 렌더링)
- 그 외 코드 블록 → Shiki 하이라이팅 (`dangerouslySetInnerHTML`)
- 인라인 코드 → `--code-bg` / `--code-fg` 변수 적용
- 이미지 → 상대 경로를 `local-file://` 프로토콜로 변환

**ProseStyles 연동**  
`userSettings.proseStyles` 값에 따라 각 요소에 다른 컴포넌트를 동적으로 매핑한다. 예: `h3: 'diamond'` → `Prose.H3`, `h3: 'arrow'` → `Prose.H3Arrow`.

---

## ProseComponents

마크다운 요소별 커스텀 React 컴포넌트 모음. 모두 CSS 변수(`--prose-heading`, `--accent` 등)를 인라인 스타일로 사용해 테마 전환에 반응한다.

| 컴포넌트 | 설명 |
|----------|------|
| `H1` | `#` 프리픽스 + 하단선 |
| `H2` | 왼쪽 `--accent` 컬러 보더 |
| `H3` | ◆ 프리픽스 (diamond) |
| `H3Arrow` | ▸ 프리픽스 |
| `H3Dot` | ● 프리픽스 |
| `H4` | ▸ 프리픽스 (작은 크기) |
| `H5` | 대문자 트래킹 스타일 |
| `H6` | 뮤트 색상 소형 제목 |
| `P` | `--prose-body` 색상, 줄간격 CSS 변수 적용 |
| `Blockquote` | 콜아웃 감지 (`[!NOTE]`, `[!TIP]` ...) + 일반 인용문 |
| `Hr` | `✦ ✦ ✦` 장식 구분선 |
| `Ul` / `Ol` / `Li` | 깊이별 불릿 기호 (●, ◦, ▸, –) |
| `Table` / `Thead` / `Tbody` / `Tr` / `Th` / `Td` | 그라디언트 헤더 + 둥근 모서리 스타일 표 |
| `A` | 외부 링크 ↗ 아이콘 자동 추가 |
| `Img` | 둥근 모서리 + 그림자 + alt 캡션 |
| `Strong` | 하이라이트 배경 (accent 30% 그라디언트) |
| `Em` | `--prose-link` 색상 기울임 |
| `Del` | `--text-muted` 색상 취소선 |
| `Input` | 읽기 전용 체크박스 (GFM task list) |

**콜아웃 타입**

| 키워드 | 아이콘 | 색상 |
|--------|--------|------|
| `[!NOTE]` | ℹ️ | `--accent` (파랑) |
| `[!TIP]` | 💡 | 초록 |
| `[!WARNING]` | ⚠️ | 노랑 |
| `[!DANGER]` | 🚨 | 빨강 |
| `[!INFO]` | 📌 | 보라 |
| `[!CAUTION]` | 🔥 | 주황 |

---

## SearchBar

Ctrl+F 인라인 검색.

**기능**
- 텍스트 하이라이팅 (`mark.search-highlight`)
- 현재 매치 강조 (`mark.search-highlight-active`)
- 이전 / 다음 이동
- 매치 카운트 표시 (`n / total`)
- ESC로 닫기

---

## TableOfContents

우측 목차 패널. 마크다운 `#` 헤딩을 파싱해 계층 구조로 표시.

**기능**
- H1 ~ H6 계층 들여쓰기
- IntersectionObserver로 현재 섹션 하이라이트
- 클릭으로 해당 섹션 스크롤 이동

---

## SettingsPanel

우측 슬라이드 설정 패널.

**설정 항목**
- 테마 프리셋 선택 (5가지 — 색상 미리보기 포함)
- 폰트 패밀리 선택 (4가지)
- 코드 테마 선택 (6가지)
- 글자 크기 슬라이더 (10 ~ 28px)
- 본문 너비 슬라이더 (480 ~ 1200px)
- 줄간격 슬라이더 (1.0 ~ 3.0)
- 마크다운 요소별 ProseStyle 드롭다운

---

## WelcomeScreen

파일이 열려있지 않을 때 표시되는 초기 화면.

**기능**
- 파일 열기 / 폴더 열기 버튼
- 단축키 안내

---

## useThemeApply (Hook)

`userSettings`가 변경될 때 `<html>` 요소에 테마 관련 속성과 CSS 변수를 동기화한다.

```typescript
// 적용되는 항목
data-theme="minimal-dark"           // 테마 프리셋
data-font="pretendard"              // 폰트 패밀리
--font-size-body: 15px
--content-width: 720px
--line-height-body: 1.7
```

---

## useMarkdownHighlight (Hook)

Shiki 하이라이터 싱글톤 관리. 초기화 비용이 크므로 모듈 레벨에서 Promise를 캐싱. 코드 테마가 변경되면 새 하이라이터 인스턴스를 생성한다.

```typescript
const { highlight } = useHighlighter(codeTheme)
const html = highlight(code, 'typescript')
// → Shiki HTML 문자열 (dangerouslySetInnerHTML로 주입)
```
