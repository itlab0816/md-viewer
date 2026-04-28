# 아키텍처

## 프로젝트 구조

```
md-viewer/
├── src/
│   ├── main/
│   │   └── index.ts              # Electron 메인 프로세스 (IPC 핸들러, 창 관리)
│   ├── preload/
│   │   ├── index.ts              # contextBridge API 노출
│   │   └── index.d.ts            # window.api 타입 정의
│   └── renderer/
│       ├── index.html
│       └── src/
│           ├── main.tsx           # React 진입점
│           ├── App.tsx            # 루트 컴포넌트 (레이아웃, 이벤트 핸들러)
│           ├── assets/
│           │   └── index.css      # Tailwind + 전역 스타일 + 테마 CSS 변수
│           ├── components/
│           │   ├── TitleBar.tsx         # 커스텀 타이틀바 (드래그 영역, 창 컨트롤)
│           │   ├── TabBar.tsx           # 탭 관리 바
│           │   ├── Sidebar.tsx          # 파일 트리 탐색기
│           │   ├── MarkdownEditor.tsx   # CodeMirror 에디터
│           │   ├── MarkdownRenderer.tsx # react-markdown 렌더러
│           │   ├── ProseComponents.tsx  # 마크다운 요소별 커스텀 컴포넌트
│           │   ├── SearchBar.tsx        # Ctrl+F 검색 바
│           │   ├── TableOfContents.tsx  # 우측 목차 패널
│           │   ├── SettingsPanel.tsx    # 우측 설정 슬라이드 패널
│           │   └── WelcomeScreen.tsx    # 파일 미선택 초기 화면
│           ├── hooks/
│           │   ├── useThemeApply.ts     # DOM에 테마 CSS 변수 적용
│           │   └── useMarkdownHighlight.ts  # Shiki 하이라이터 싱글톤
│           ├── store/
│           │   └── useStore.ts          # Zustand 전역 상태
│           └── themes/
│               └── types.ts             # 테마 / 사용자 설정 타입 + 상수
├── docs/                          # 프로젝트 문서
├── resources/                     # 앱 아이콘
├── electron.vite.config.ts
├── tailwind.config.js
└── package.json
```

## 프로세스 통신 (IPC)

메인 프로세스와 렌더러는 `contextBridge`를 통해 통신한다.

### Renderer → Main (invoke)

| API | 설명 |
|-----|------|
| `api.openFile()` | 파일 열기 다이얼로그 → 경로 반환 |
| `api.openFolder()` | 폴더 열기 다이얼로그 → 경로 반환 |
| `api.readDir(path, allFiles?)` | 디렉토리 트리 읽기 |
| `api.readFile(path)` | 파일 내용 읽기 |
| `api.saveFile(path, content)` | 파일 저장 |
| `api.watchFile(path)` | 파일 변경 감시 등록 |
| `api.unwatchFile(path)` | 파일 감시 해제 |

### Main → Renderer (on)

| 이벤트 | 설명 |
|--------|------|
| `menu:open-file` | 메뉴에서 파일 열기 |
| `menu:open-folder` | 메뉴에서 폴더 열기 |
| `file:changed` | 외부 파일 변경 감지 알림 |

## 전역 상태 (Zustand — useStore)

### 파일 / 탭

| 상태 | 타입 | 설명 |
|------|------|------|
| `tabs` | Tab[] | 열린 탭 목록 |
| `activeTabId` | string \| null | 현재 활성 탭 ID |
| `folderPath` | string \| null | 열린 폴더 루트 경로 |
| `fileTree` | FileNode[] | 파일 트리 데이터 |
| `showAllFiles` | boolean | 비-마크다운 파일 표시 여부 |

### UI 상태

| 상태 | 타입 | 설명 |
|------|------|------|
| `sidebarOpen` | boolean | 사이드바 표시 여부 |
| `sidebarWidth` | number | 사이드바 너비 (px) |
| `rightPanel` | `'none' \| 'toc' \| 'settings'` | 우측 패널 상태 |
| `viewMode` | `'preview' \| 'editor' \| 'split'` | 현재 뷰 모드 |

### 사용자 설정 (UserSettings)

| 설정 | 타입 | 기본값 |
|------|------|--------|
| `activePreset` | ThemePresetId | `'minimal-dark'` |
| `fontFamily` | FontFamily | `'system'` |
| `fontSize` | number (10–28) | `15` |
| `contentWidth` | number (480–1200) | `720` |
| `lineHeight` | number (1.0–3.0) | `1.7` |
| `codeTheme` | CodeThemeId | `'github-dark'` |
| `proseStyles` | ProseStyles | 요소별 기본값 |

## 테마 시스템

테마는 CSS 커스텀 변수로 구현. `<html>` 요소에 `data-theme`, `data-font` 속성을 설정하면 `index.css`의 속성 선택자가 활성화된다.

```
[data-theme="minimal-dark"] { --bg-app: #000; --accent: #3b82f6; ... }
[data-font="pretendard"]    { --font-body: 'Pretendard Variable', ...; }
```

`useThemeApply` 훅이 `userSettings` 변화를 감지해 DOM 속성과 CSS 변수(`--font-size-body`, `--content-width`, `--line-height-body`)를 동기화한다.

## 이미지 처리

마크다운 내 상대 경로 이미지는 `toLocalFileUrl()` 함수가 `local-file:///` 프로토콜로 변환한다. 메인 프로세스에서 해당 프로토콜을 등록해 로컬 파일을 안전하게 서빙한다.

```
![alt](./images/photo.png)
→ local-file:///C:/path/to/docs/images/photo.png
```

외부 URL(`http:`, `https:`, `data:`)은 변환 없이 그대로 사용된다.
