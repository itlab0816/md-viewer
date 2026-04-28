import React from 'react'
import { useStore, ViewMode } from '../store/useStore'

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

  const fileName = currentFile
    ? currentFile.path.split(/[\\/]/).pop()?.replace(/\.(md|markdown|mdx)$/i, '') ?? ''
    : ''

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

      {/* 가운데 — 파일명 + 뷰 모드 토글 */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <span className="text-sm font-medium truncate max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>
          {fileName || 'MD Viewer'}
        </span>

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
