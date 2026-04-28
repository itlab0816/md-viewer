import React, { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  containerRef: React.RefObject<HTMLElement>
  onClose: () => void
}

export default function SearchBar({ containerRef, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState(0)
  const [current, setCurrent] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const marksRef = useRef<HTMLElement[]>([])

  useEffect(() => { inputRef.current?.focus() }, [])

  const clearMarks = useCallback(() => {
    marksRef.current.forEach((el) => {
      const parent = el.parentNode
      if (!parent) return
      parent.replaceChild(document.createTextNode(el.textContent ?? ''), el)
      parent.normalize()
    })
    marksRef.current = []
  }, [])

  const doSearch = useCallback((q: string) => {
    clearMarks()
    if (!q || !containerRef.current) { setMatches(0); setCurrent(0); return }

    const walker = document.createTreeWalker(
      containerRef.current,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement
          if (!parent) return NodeFilter.FILTER_REJECT
          const tag = parent.tagName
          if (['SCRIPT', 'STYLE', 'MARK'].includes(tag)) return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        }
      }
    )

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const textNodes: Text[] = []
    let node: Node | null
    while ((node = walker.nextNode())) textNodes.push(node as Text)

    const newMarks: HTMLElement[] = []
    for (const textNode of textNodes) {
      const text = textNode.textContent ?? ''
      if (!regex.test(text)) continue
      regex.lastIndex = 0

      const frag = document.createDocumentFragment()
      let last = 0
      let m: RegExpExecArray | null
      while ((m = regex.exec(text)) !== null) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)))
        const mark = document.createElement('mark')
        mark.className = 'search-highlight'
        mark.textContent = m[0]
        frag.appendChild(mark)
        newMarks.push(mark)
        last = m.index + m[0].length
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)))
      textNode.parentNode?.replaceChild(frag, textNode)
    }

    marksRef.current = newMarks
    setMatches(newMarks.length)
    setCurrent(newMarks.length > 0 ? 1 : 0)
    if (newMarks[0]) {
      newMarks[0].classList.add('search-highlight-active')
      newMarks[0].scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [containerRef, clearMarks])

  const navigate = useCallback((dir: 1 | -1) => {
    if (marksRef.current.length === 0) return
    marksRef.current.forEach((el) => el.classList.remove('search-highlight-active'))
    const next = ((current - 1 + dir + marksRef.current.length) % marksRef.current.length)
    setCurrent(next + 1)
    const el = marksRef.current[next]
    el.classList.add('search-highlight-active')
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [current])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 150)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  useEffect(() => {
    return () => clearMarks()
  }, [clearMarks])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { clearMarks(); onClose() }
    if (e.key === 'Enter') navigate(e.shiftKey ? -1 : 1)
  }

  return (
    <div
      className="absolute top-2 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-lg border text-sm"
      style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}
    >
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="검색..."
        className="bg-transparent outline-none w-40 text-sm"
        style={{ color: 'var(--text-primary)' }}
      />
      <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {matches > 0 ? `${current}/${matches}` : query ? '없음' : ''}
      </span>
      <div className="flex gap-0.5">
        <button
          onClick={() => navigate(-1)}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-secondary)' }}
        >▲</button>
        <button
          onClick={() => navigate(1)}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-secondary)' }}
        >▼</button>
        <button
          onClick={() => { clearMarks(); onClose() }}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] text-[10px]"
          style={{ color: 'var(--text-secondary)' }}
        >✕</button>
      </div>
    </div>
  )
}
