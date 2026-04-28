import { useEffect, useState } from 'react'
import { createHighlighter, Highlighter } from 'shiki'
import type { CodeThemeId } from '../themes/types'

let hl: Highlighter | null = null
let hlPromise: Promise<Highlighter> | null = null
const loadedThemes = new Set<string>(['github-dark', 'github-light'])

function getHighlighter(): Promise<Highlighter> {
  if (!hlPromise) {
    hlPromise = createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: [
        'javascript', 'typescript', 'jsx', 'tsx',
        'python', 'rust', 'go', 'java', 'kotlin',
        'bash', 'shell', 'json', 'yaml', 'toml',
        'html', 'css', 'scss', 'sql', 'markdown',
        'cpp', 'c', 'csharp', 'swift', 'php', 'ruby'
      ]
    }).then((h) => { hl = h; return h })
  }
  return hlPromise
}

async function ensureTheme(highlighter: Highlighter, themeId: string): Promise<void> {
  if (loadedThemes.has(themeId)) return
  try {
    const { bundledThemes } = await import('shiki/themes' as any)
    if (bundledThemes[themeId]) {
      await highlighter.loadTheme(bundledThemes[themeId])
      loadedThemes.add(themeId)
    }
  } catch {
    // 테마 로드 실패 시 github-dark 폴백
  }
}

export function useHighlighter(codeTheme: CodeThemeId) {
  const [ready, setReady] = useState(false)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    getHighlighter().then(async (h) => {
      await ensureTheme(h, codeTheme)
      setReady(true)
      forceUpdate((n) => n + 1)
    })
  }, [])

  useEffect(() => {
    if (!hl) return
    ensureTheme(hl, codeTheme).then(() => forceUpdate((n) => n + 1))
  }, [codeTheme])

  const highlight = (code: string, lang: string): string => {
    if (!hl) return `<pre><code>${code}</code></pre>`
    const theme = loadedThemes.has(codeTheme) ? codeTheme : 'github-dark'
    try {
      return hl.codeToHtml(code, { lang: lang || 'text', theme })
    } catch {
      try {
        return hl.codeToHtml(code, { lang: 'text', theme: 'github-dark' })
      } catch {
        return `<pre><code>${code}</code></pre>`
      }
    }
  }

  return { ready, highlight }
}
