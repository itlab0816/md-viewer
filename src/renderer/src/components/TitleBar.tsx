import React, { useMemo } from 'react'
import { useStore, ViewMode } from '../store/useStore'
import { parseFrontmatter } from '../utils/frontmatter'

function calcReadingTime(content: string): number {
  const stripped = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~#>|\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const korean = (stripped.match(/[가-힣]/g) ?? []).length
  const english = (stripped.match(/\b[a-zA-Z]+\b/g) ?? []).length
  return Math.max(1, Math.round(korean / 500 + english / 200))
}

const VIEW_MODES: { mode: ViewMode; label: string; title: string }[] = [
  { mode: 'editor', label: '✎', title: '에디터' },
  { mode: 'split', label: '◫', title: '분할 보기' },
  { mode: 'preview', label: '⊡', title: '미리보기' }
]

export default function TitleBar() {
  const {
    sidebarOpen, setSidebarOpen,
    rightPanel, toggleRightPanel,
    currentFile, viewMode, setViewMode
  } = useStore()

  const { data: fm, body: fmBody } = useMemo(
    () => currentFile ? parseFrontmatter(currentFile.content) : { data: {}, body: '' },
    [currentFile?.content]
  )

  const fileName = currentFile
    ? (fm.title ?? currentFile.path.split(/[\\/]/).pop()?.replace(/\.(md|markdown|mdx)$/i, '') ?? '')
    : ''

  const readingTime = useMemo(
    () => currentFile ? calcReadingTime(fmBody) : 0,
    [fmBody]
  )

  return (
    <header
      className="flex items-center h-10 px-3 gap-2 flex-shrink-0 select-none border-b"
      style={{
        background: 'var(--bg-panel)',
        borderColor: 'var(--border)',
        WebkitAppRegion: 'drag'
      } as React.CSSProperties}
    >
      <div className="w-16 flex-shrink-0" />

      {/* 왼쪽 — 사이드바 토글 */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <IconButton title="사이드바" active={sidebarOpen} onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </IconButton>
      </div>

      {/* 가운데 — 파일명 + 태그 + 뷰 모드 토글 */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-0.5 min-w-0">
          <span className="text-sm font-medium truncate max-w-[240px]" style={{ color: 'var(--text-secondary)' }}>
            {fileName || 'MD Viewer'}
          </span>
          {fm.tags && fm.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {fm.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.62rem', padding: '0 5px', lineHeight: '16px',
                    borderRadius: 4, background: 'var(--accent)', color: 'var(--accent-text)',
                    opacity: 0.8,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {currentFile && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            약 {readingTime}분
          </span>
        )}

        {currentFile && (
          <div
            className="flex items-center gap-0.5 rounded-lg p-0.5"
            style={{ background: 'var(--bg-elevated)', WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            {VIEW_MODES.map(({ mode, label, title }) => (
              <button
                key={mode}
                title={title}
                onClick={() => setViewMode(mode)}
                className="w-7 h-6 flex items-center justify-center rounded-md text-sm transition-colors"
                style={
                  viewMode === mode
                    ? { background: 'var(--bg-app)', color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }
                    : { color: 'var(--text-muted)' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 오른쪽 — 패널 토글 */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {currentFile && (
          <IconButton title="PDF 내보내기 (Ctrl+P)" onClick={() => window.print()}>
            ⎙
          </IconButton>
        )}
        <IconButton title="목차" active={rightPanel === 'toc'} onClick={() => toggleRightPanel('toc')}>
          ≡
        </IconButton>
        <IconButton title="설정" active={rightPanel === 'settings'} onClick={() => toggleRightPanel('settings')}>
          ⚙
        </IconButton>
      </div>
    </header>
  )
}

function IconButton({
  children, title, onClick, active
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded text-sm transition-colors hover:bg-[var(--bg-hover)]"
      style={
        active
          ? { background: 'var(--accent)', color: 'var(--accent-text)' }
          : { color: 'var(--text-muted)' }
      }
    >
      {children}
    </button>
  )
}
