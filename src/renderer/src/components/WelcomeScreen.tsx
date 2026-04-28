import React from 'react'
import { useStore } from '../store/useStore'

interface Props {
  onFolderOpen: (path?: string) => void
  onFileOpen: () => void
}

export default function WelcomeScreen({ onFolderOpen, onFileOpen }: Props) {
  const { recentFolders } = useStore()

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-8">
      <div className="text-center">
        <div className="text-5xl mb-3 opacity-20">📝</div>
        <div className="text-xl font-semibold" style={{ color: 'var(--text-secondary)' }}>MD Viewer</div>
        <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>마크다운을 아름답게</div>
      </div>

      {/* 빠른 실행 */}
      <div className="flex gap-3">
        <button
          onClick={() => onFolderOpen()}
          className="flex flex-col items-center gap-1.5 px-6 py-4 rounded-xl text-sm transition-colors border hover:bg-[var(--bg-hover)]"
          style={{
            background: 'var(--bg-panel)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)'
          }}
        >
          <span className="text-2xl">🗂️</span>
          <span className="font-medium">폴더 열기</span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Ctrl+Shift+O</span>
        </button>
        <button
          onClick={onFileOpen}
          className="flex flex-col items-center gap-1.5 px-6 py-4 rounded-xl text-sm transition-colors border hover:bg-[var(--bg-hover)]"
          style={{
            background: 'var(--bg-panel)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)'
          }}
        >
          <span className="text-2xl">📄</span>
          <span className="font-medium">파일 열기</span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Ctrl+O</span>
        </button>
      </div>

      {/* 최근 폴더 */}
      {recentFolders.length > 0 && (
        <div className="w-full max-w-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            최근 프로젝트
          </div>
          <ul className="space-y-0.5">
            {recentFolders.map((folder) => {
              const name = folder.split(/[\\/]/).pop() ?? folder
              const parent = folder.split(/[\\/]/).slice(0, -1).join('/')
              return (
                <li key={folder}>
                  <button
                    onClick={() => onFolderOpen(folder)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-[var(--bg-hover)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span className="text-lg flex-shrink-0">🗂️</span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium truncate">{name}</div>
                      <div className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{parent}</div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
