# MD Viewer — 프로젝트 개요

고품질 마크다운 뷰어 데스크탑 애플리케이션.  
기존 뷰어들의 투박한 UI를 개선하고, 테마별로 아름답게 보여주는 것이 목표.

## 플랫폼 계획

| 플랫폼 | 상태 | 기술 스택 |
|--------|------|-----------|
| 데스크탑 | ✅ 개발 중 | Electron + React |
| 웹 | 🔜 예정 | 별개 프로젝트 |
| 앱 | 🔜 예정 | 별개 프로젝트 |

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Electron 33, React 18, TypeScript 5 |
| 빌드 | electron-vite 3, Vite 6 |
| 스타일 | Tailwind CSS 3, @tailwindcss/typography |
| 상태 관리 | Zustand |
| 마크다운 | react-markdown, remark-gfm, remark-math |
| 코드 하이라이팅 | Shiki (6가지 테마) |
| 수식 | KaTeX (rehype-katex) |
| 다이어그램 | Mermaid |
| 에디터 | CodeMirror 6 |
| 폰트 | Pretendard Variable |

## 구현된 기능

### 파일 관리
- 파일 / 폴더 열기 (메뉴, 다이얼로그)
- 탭 기반 다중 파일 편집
- 최근 폴더 자동 복원
- 외부 파일 변경 자동 감지 및 리로드
- Ctrl+S 저장

### 뷰 모드
- **Preview** — 마크다운 렌더링만 표시
- **Editor** — CodeMirror 에디터만 표시
- **Split** — 에디터 + 렌더러 나란히

### 마크다운 렌더링
- GFM (테이블, 체크박스, 취소선)
- 수식 (KaTeX — `$inline$`, `$$block$$`)
- 코드 블록 Shiki 하이라이팅 (20+ 언어)
- Mermaid 다이어그램
- 이미지 (상대 경로 → `local-file://` 자동 변환)
- 콜아웃 블럭 (`[!NOTE]`, `[!TIP]`, `[!WARNING]`, `[!DANGER]`, `[!INFO]`, `[!CAUTION]`)
- 외부 링크 자동 `target="_blank"` + ↗ 아이콘

### 탐색
- 좌측 파일 트리 사이드바 (폴더/파일 계층)
- 우측 자동 목차 (IntersectionObserver 기반 현재 위치 추적)
- Ctrl+F 내부 검색 (하이라이트 + 이전/다음)

### 테마 / 설정
- 5가지 테마 프리셋 (Minimal Dark, Minimal Light, GitHub, Notion, Sepia)
- 4가지 폰트 패밀리 (System, Pretendard, Serif, Mono)
- 6가지 코드 테마 (GitHub Dark/Light, One Dark Pro, Dracula, Nord, Tokyo Night)
- 글자 크기 / 본문 너비 / 줄간격 슬라이더
- 마크다운 요소별 스타일 커스터마이징 (ProseStyles — 제목, 인용문, 목록, 표, 굵게, 기울임 등)
- 우측 슬라이드 패널에서 실시간 변경

## 빠른 시작

```bash
npm install
npm run dev           # 개발 모드
npm run build         # 빌드
npm run package:win   # Windows 패키징
npm run package:mac   # macOS 패키징
```
