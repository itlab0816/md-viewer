import React, { useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'

const MD_EXT = /\.(md|markdown|mdx)$/i

function tabName(path: string): string {
  return path.split(/[\\/]/).pop()?.replace(MD_EXT, '') ?? path
}

export default function TabBar() {
  const { tabs, activeTabPath, closeTab, setActiveTab } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeTabPath || !scrollRef.current) return
    const el = scrollRef.current.querySelector(`[data-path="${CSS.escape(activeTabPath)}"]`) as HTMLElement
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [activeTabPath])

  if (tabs.length === 0) return null

  return (
    <div
      ref={scrollRef}
      className="flex items-end overflow-x-auto flex-shrink-0 border-b"
      style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)', scrollbarWidth: 'none' } as React.CSSProperties}
    >
      {tabs.map((tab) => {
        const isActive = tab.path === activeTabPath
        return (
          <div
            key={tab.path}
            data-path={tab.path}
            className="group flex items-center gap-1.5 px-3 h-9 flex-shrink-0 cursor-pointer select-none border-r transition-colors hover:bg-[var(--bg-hover)]"
            style={{
              borderColor: 'var(--border)',
              borderTop: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              background: isActive ? 'var(--tab-active-bg)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
            onClick={() => setActiveTab(tab.path)}
            title={tab.path}
          >
            <span className="text-[11px]">📝</span>
            <span className="text-[12px] max-w-[140px] truncate">{tabName(tab.path)}</span>
            {tab.modified && (
              <span className="text-[8px] flex-shrink-0" style={{ color: 'var(--accent)' }}>●</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.api.unwatchFile(tab.path)
                closeTab(tab.path)
              }}
              className="w-4 h-4 flex items-center justify-center rounded text-[10px] flex-shrink-0 transition-colors opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:bg-[var(--bg-elevated)]"
              style={isActive ? { opacity: 0.5 } : undefined}
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
