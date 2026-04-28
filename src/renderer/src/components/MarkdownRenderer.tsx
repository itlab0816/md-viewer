import React, { useMemo, useEffect, useRef } from 'react'
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

  const components = useMemo(() => {
    const c: Record<string, any> = {
      p:     Prose.P,
      input: Prose.Input,

      img({ src, alt }: any) {
        return ps?.img !== 'default'
          ? <Prose.Img src={toLocalFileUrl(src, filePath)} alt={alt} />
          : <img src={toLocalFileUrl(src, filePath)} alt={alt} style={{ maxWidth: '100%' }} />
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
    if (ps?.a          !== 'default') c.a          = Prose.A
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
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex, rehypeSlug]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}
