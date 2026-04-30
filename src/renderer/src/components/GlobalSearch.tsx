import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '../store/useStore'
import type { FileNode } from '../../../preload/index.d'

interface SearchResult {
  filePath: string
  fileName: string
  lineNumber: number
  lineText: string
  matchStart: number
  matchEnd: number
}

function flattenTree(nodes: FileNode[]): string[] {
  const paths: string[] = []
  for (const node of nodes) {
    if (node.type === 'file') paths.push(node.path)
    else if (node.children) paths.push(...flattenTree(node.children))
  }
  return paths
}

function highlight(text: string, start: number, end: number) {
  const pre = text.slice(0, start)
  const match = text.slice(start, end)
  const post = text.slice(end, end + 120)
  return (
    <>
      <span style={{ opacity: 0.6 }}>{pre.slice(-40)}</span>
      <mark style={{ background: 'var(--accent)', color: '#fff', borderRadius: 2, padding: '0 2px' }}>
        {match}
      </mark>
      <span>{post}</span>
    </>
  )
}

export default function GlobalSearch({ onClose }: { onClose: () => void }) {
  const { fileTree } = useStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!query.trim()) { setResults([]); return }

    timerRef.current = setTimeout(async () => {
      setSearching(true)
      const files = flattenTree(fileTree)
      const q = query.toLowerCase()
      const found: SearchResult[] = []

      await Promise.all(files.map(async (filePath) => {
        if (found.length >= 200) return
        const data = await window.api.readFile(filePath)
        if (!data) return
        const lines = data.content.split('\n')
        const fileName = filePath.replace(/\\/g, '/').split('/').pop() ?? filePath
        for (let i = 0; i < lines.length; i++) {
          const lower = lines[i].toLowerCase()
          const idx = lower.indexOf(q)
          if (idx === -1) continue
          found.push({
            filePath,
            fileName,
            lineNumber: i + 1,
            lineText: lines[i].trim(),
            matchStart: lines[i].trimStart().length - lines[i].length + idx,
            matchEnd: lines[i].trimStart().length - lines[i].length + idx + q.length,
          })
        }
      }))

      found.sort((a, b) => a.filePath.localeCompare(b.filePath))
      setResults(found.slice(0, 100))
      setActiveIdx(0)
      setSearching(false)
    }, 300)
  }, [query, fileTree])

  const openResult = useCallback(async (result: SearchResult) => {
    const data = await window.api.readFile(result.filePath)
    if (data) {
      useStore.getState().openTab(data)
      window.api.watchFile(data.path)
    }
    onClose()
  }, [onClose])

  useEffect(() => {
    const el = listRef.current?.children[activeIdx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[activeIdx]) openResult(results[activeIdx])
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* 입력 */}
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIdx(0) }}
            onKeyDown={handleKeyDown}
            placeholder="폴더 내 전체 검색..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
          {searching && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>검색 중…</span>
          )}
          {!searching && results.length > 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{results.length}건</span>
          )}
        </div>

        {/* 결과 */}
        {results.length > 0 && (
          <div ref={listRef} style={{ maxHeight: 420, overflowY: 'auto' }}>
            {results.map((r, i) => (
              <div
                key={`${r.filePath}:${r.lineNumber}:${i}`}
                onClick={() => openResult(r)}
                style={{
                  padding: '7px 16px',
                  cursor: 'pointer',
                  background: i === activeIdx ? 'var(--bg-hover)' : undefined,
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={() => setActiveIdx(i)}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                  {r.fileName}
                  <span style={{ opacity: 0.5, marginLeft: 4 }}>:{r.lineNumber}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {highlight(r.lineText, r.matchStart, r.matchEnd)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 빈 결과 */}
        {!searching && query.trim() && results.length === 0 && (
          <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            결과 없음
          </div>
        )}

        {/* 힌트 */}
        <div style={{ padding: '6px 16px', borderTop: results.length > 0 || (!searching && query.trim()) ? '1px solid var(--border)' : undefined }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <kbd style={{ padding: '1px 4px', borderRadius: 3, border: '1px solid var(--border)', marginRight: 4 }}>↑↓</kbd>이동
            <kbd style={{ padding: '1px 4px', borderRadius: 3, border: '1px solid var(--border)', margin: '0 4px 0 8px' }}>Enter</kbd>열기
            <kbd style={{ padding: '1px 4px', borderRadius: 3, border: '1px solid var(--border)', margin: '0 4px 0 8px' }}>Esc</kbd>닫기
          </span>
        </div>
      </div>
    </div>
  )
}
