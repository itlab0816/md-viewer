import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import mermaid from 'mermaid'
import { useHighlighter } from '../hooks/useMarkdownHighlight'
import { useStore } from '../store/useStore'
import { THEME_PRESETS } from '../themes/types'
import * as Prose from './ProseComponents'
import { parseFrontmatter } from '../utils/frontmatter'

interface Props {
  content: string
  filePath?: string
}

function toLocalFileUrl(src: string, filePath?: string): string {
  if (!src || /^(https?:|data:|local-file:|file:|blob:)/.test(src)) return src
  if (!filePath) return src
  const dir = filePath.replace(/\\/g, '/').replace(/\/[^/]+$/, '')
  const parts = (`${dir}/${src}`).split('/')
  const resolved: string[] = []
  for (const p of parts) {
    if (p === '..') resolved.pop()
    else if (p !== '.') resolved.push(p)
  }
  return `local-file:///${resolved.join('/').replace(/^\//, '')}`
}

function resolvePath(base: string, rel: string): string {
  const dir = base.replace(/\\/g, '/').replace(/\/[^/]+$/, '')
  const parts = `${dir}/${rel.replace(/\\/g, '/')}`.split('/')
  const out: string[] = []
  for (const p of parts) {
    if (p === '..') out.pop()
    else if (p !== '.') out.push(p)
  }
  return out.join('/')
}

function HtmlPreview({ html, filePath }: { html: string; filePath?: string }) {
  const [height, setHeight] = useState(300)
  const [srcdoc, setSrcdoc] = useState('')

  const trimmed = html.trim()
  const isFilePath = !trimmed.includes('\n') && !/[<>]/.test(trimmed) && /\.html$/i.test(trimmed)

  useEffect(() => {
    if (!isFilePath) {
      const base = filePath
        ? `local-file:///${resolvePath(filePath, '').replace(/^\//, '')}/`
        : null
      setSrcdoc(base ? `<base href="${base}">\n${html}` : html)
      return
    }

    const resolved = filePath ? resolvePath(filePath, trimmed) : trimmed
    ;(window as any).api.readFile(resolved).then((result: any) => {
      if (result) {
        const base = `local-file:///${resolved.replace(/\/[^/]+$/, '').replace(/^\//, '')}/`
        setSrcdoc(`<base href="${base}">\n${result.content}`)
      } else {
        setSrcdoc(`<p style="color:red;font-family:sans-serif;padding:1rem">파일을 찾을 수 없습니다: ${trimmed}</p>`)
      }
    })
  }, [html, filePath, isFilePath, trimmed])

  const onLoad = useCallback((e: React.SyntheticEvent<HTMLIFrameElement>) => {
    try {
      const doc = (e.target as HTMLIFrameElement).contentDocument
      if (!doc) return
      const h = Math.max(doc.documentElement.scrollHeight, doc.body?.scrollHeight ?? 0)
      if (h > 0) setHeight(h + 16)
    } catch {}
  }, [])

  return (
    <div className="my-4 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <iframe
        srcDoc={srcdoc}
        sandbox="allow-scripts allow-same-origin"
        style={{ width: '100%', height: `${height}px`, border: 'none', display: 'block' }}
        onLoad={onLoad}
      />
    </div>
  )
}

let mermaidTheme: string | null = null

function MermaidBlock({ code, isDark }: { code: string; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const idRef = useRef(`mm-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    const theme = isDark ? 'dark' : 'default'
    if (mermaidTheme !== theme) {
      mermaid.initialize({ startOnLoad: false, theme, securityLevel: 'loose' })
      mermaidTheme = theme
    }
    mermaid.render(idRef.current, code)
      .then(({ svg }) => { if (ref.current) ref.current.innerHTML = svg })
      .catch(() => { if (ref.current) ref.current.textContent = code })
  }, [code, isDark])

  return (
    <div
      ref={ref}
      className="my-4 flex justify-center overflow-x-auto rounded-lg p-4"
      style={{ background: 'var(--bg-elevated)' }}
    />
  )
}

export default function MarkdownRenderer({ content, filePath }: Props) {
  const { userSettings } = useStore()
  const { highlight } = useHighlighter(userSettings.codeTheme)
  const isDark = THEME_PRESETS.find((p) => p.id === userSettings.activePreset)?.isDark ?? true
  const ps = userSettings.proseStyles
  const psKey = JSON.stringify(ps)

  const { body: mdBody } = parseFrontmatter(content)

  const contentRef = useRef(content)
  const filePathRef = useRef(filePath)
  contentRef.current = content
  filePathRef.current = filePath

  const checkboxCountRef = useRef(0)
  checkboxCountRef.current = 0

  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  const components = useMemo(() => {
    const c: Record<string, any> = {
      p:     Prose.P,

      input({ checked }: any) {
        const myIdx = checkboxCountRef.current++
        const handleChange = async () => {
          const fp = filePathRef.current
          if (!fp) return
          let count = 0
          const newContent = contentRef.current.replace(
            /^([ \t]*(?:[-*+]|\d+[.)]) \[)([ xX])(\])/gm,
            (match, pre, state, post) => {
              if (count++ === myIdx) return `${pre}${state.trim() === '' ? 'x' : ' '}${post}`
              return match
            }
          )
          await (window as any).api.writeFile(fp, newContent)
          useStore.getState().reloadTabContent(fp, newContent)
        }
        return (
          <input
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            style={{ cursor: 'pointer', accentColor: 'var(--accent)' }}
          />
        )
      },

      img({ src, alt }: any) {
        const resolved = toLocalFileUrl(src, filePath)
        const open = () => setLightbox({ src: resolved, alt: alt ?? '' })
        return ps?.img !== 'default'
          ? <span onClick={open} style={{ cursor: 'zoom-in', display: 'inline-block' }}><Prose.Img src={resolved} alt={alt} /></span>
          : <img src={resolved} alt={alt} onClick={open} style={{ maxWidth: '100%', cursor: 'zoom-in' }} />
      },

      pre({ children }: any) {
        const arr = React.Children.toArray(children)
        const codeEl = arr.find((c: any) => {
          const cls: string = c?.props?.className ?? ''
          return cls.includes('language-html')
        }) as any
        if (codeEl) {
          const rawChildren = codeEl.props?.children ?? ''
          const raw = (Array.isArray(rawChildren)
            ? rawChildren.map(String).join('')
            : String(rawChildren)
          ).replace(/\n$/, '')
          return <HtmlPreview html={raw} filePath={filePath} />
        }
        return <pre>{children}</pre>
      },

      code({ inline, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || '')
        const code = String(children).replace(/\n$/, '')

        if (!inline && match?.[1] === 'mermaid') {
          return <MermaidBlock code={code} isDark={isDark} />
        }
        if (!inline && match) {
          return (
            <div
              className="shiki-wrapper rounded-lg overflow-auto my-4 text-sm"
              dangerouslySetInnerHTML={{ __html: highlight(code, match[1]) }}
            />
          )
        }
        return (
          <code
            className="px-1.5 py-0.5 rounded text-sm font-mono"
            style={{ background: 'var(--code-bg)', color: 'var(--code-fg)' }}
            {...props}
          >
            {children}
          </code>
        )
      },
    }

    if (ps?.h1         !== 'default') c.h1         = Prose.H1
    if (ps?.h2         !== 'default') c.h2         = Prose.H2
    if (ps?.h3 === 'diamond') c.h3 = Prose.H3
    else if (ps?.h3 === 'arrow') c.h3 = Prose.H3Arrow
    else if (ps?.h3 === 'dot')   c.h3 = Prose.H3Dot
    if (ps?.h4         !== 'default') c.h4         = Prose.H4
    if (ps?.h5         !== 'default') c.h5         = Prose.H5
    if (ps?.h6         !== 'default') c.h6         = Prose.H6
    if (ps?.blockquote !== 'default') c.blockquote = Prose.Blockquote
    if (ps?.hr         !== 'default') c.hr         = Prose.Hr
    if (ps?.list       !== 'default') { c.ul = Prose.Ul; c.ol = Prose.Ol; c.li = Prose.Li }
    if (ps?.table      !== 'default') { c.table = Prose.Table; c.thead = Prose.Thead; c.tbody = Prose.Tbody; c.tr = Prose.Tr; c.th = Prose.Th; c.td = Prose.Td }
    c.a = ({ href, children }: any) => {
      const isExternal = /^https?:/.test(href ?? '')
      const isLocalMd = !isExternal && /\.(md|markdown|mdx)$/i.test(href ?? '')
      const isAnchor = href?.startsWith('#')

      const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (isAnchor) {
          e.preventDefault()
          document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
          return
        }
        if (isLocalMd) {
          e.preventDefault()
          const resolved = filePath ? resolvePath(filePath, href) : href
          const data = await (window as any).api.readFile(resolved)
          if (data) {
            useStore.getState().openTab(data)
            ;(window as any).api.watchFile(data.path)
          }
        }
      }

      return (
        <a
          href={isExternal ? href : undefined}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          onClick={handleClick}
          style={{ color: 'var(--prose-link)', textDecoration: 'underline', textUnderlineOffset: '2px', cursor: 'pointer' }}
        >
          {children}
          {isExternal && <span style={{ fontSize: '0.65em', marginLeft: '0.2em', opacity: 0.7, verticalAlign: 'super' }}>↗</span>}
        </a>
      )
    }
    c.strong = ps?.strong === 'highlight'
      ? Prose.Strong
      : ps?.strong === 'color'
      ? ({ children }: any) => <strong style={{ color: 'var(--accent)', fontWeight: 700 }}>{children}</strong>
      : ({ children }: any) => <strong style={{ color: 'var(--prose-bold)', fontWeight: 700 }}>{children}</strong>
    c.em = ps?.em !== 'default'
      ? Prose.Em
      : ({ children }: any) => <em style={{ fontStyle: 'italic' }}>{children}</em>
    if (ps?.del !== 'default') c.del = Prose.Del

    return c
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlight, filePath, isDark, psKey])

  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeSlug]}
        components={components}
      >
        {mdBody}
      </ReactMarkdown>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '85vh',
              borderRadius: 8,
              boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
              cursor: 'default',
            }}
          />
          {lightbox.alt && (
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: 12 }}>
              {lightbox.alt}
            </p>
          )}
        </div>
      )}
    </>
  )
}
