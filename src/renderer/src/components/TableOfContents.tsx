import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'

interface Heading {
  id: string
  text: string
  level: number
}

export default function TableOfContents() {
  const { currentFile } = useStore()
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const scrollingRef = useRef(false)

  // rehype-slug가 생성한 실제 DOM ID를 읽어 목차 구성
  useEffect(() => {
    const timer = setTimeout(() => {
      const main = document.querySelector('main')
      if (!main) return
      const els = main.querySelectorAll('h1,h2,h3,h4,h5,h6')
      const hs: Heading[] = []
      els.forEach((el) => {
        if (el.id) hs.push({ id: el.id, text: el.textContent ?? '', level: parseInt(el.tagName[1]) })
      })
      setHeadings(hs)
    }, 150)
    return () => clearTimeout(timer)
  }, [currentFile])

  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { root: main, rootMargin: '-10% 0% -80% 0%' }
    )
    main.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [currentFile])

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const main = document.querySelector('main')
    const target = document.getElementById(id)
    if (!main || !target) return

    setActiveId(id)
    scrollingRef.current = true
    const scrollTop = main.scrollTop + target.getBoundingClientRect().top - main.getBoundingClientRect().top - 32
    main.scrollTo({ top: scrollTop, behavior: 'smooth' })
    setTimeout(() => { scrollingRef.current = false }, 800)
  }

  return (
    <nav
      className="flex flex-col flex-1 overflow-y-auto"
      style={{ background: 'var(--bg-panel)' }}
    >
      <div
        className="px-3 py-3 text-xs font-semibold uppercase tracking-wider border-b flex-shrink-0"
        style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
      >
        목차
      </div>
      {headings.length > 0 ? (
        <ul className="py-2">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={(e) => handleClick(e, h.id)}
                className="block py-1 text-xs transition-colors truncate hover:text-[var(--text-primary)]"
                style={{
                  paddingLeft: `${8 + (h.level - 1) * 10}px`,
                  color: activeId === h.id ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: activeId === h.id ? 500 : undefined
                }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-3 py-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          헤딩 없음
        </div>
      )}
    </nav>
  )
}
