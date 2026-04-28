import React, { useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { githubDark, githubLight } from '@uiw/codemirror-theme-github'
import { EditorView, keymap } from '@codemirror/view'
import { EditorSelection } from '@codemirror/state'
import { indentWithTab } from '@codemirror/commands'
import { useStore } from '../store/useStore'
import { THEME_PRESETS } from '../themes/types'

interface Props {
  path: string
  content: string
}

const baseTheme = EditorView.theme({
  '&': { height: '100%', fontSize: 'var(--font-size-body, 14px)' },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'var(--font-body, monospace)',
    lineHeight: 'var(--line-height-body, 1.6)'
  },
  '.cm-content': { padding: '2rem 2.5rem' },
  '.cm-line': { padding: '0' },
  '.cm-gutters': { minWidth: '3rem' },
})

// 선택 영역을 마커로 감싸는 헬퍼
function wrapWith(marker: string) {
  return (view: EditorView): boolean => {
    const { state, dispatch } = view
    const changes = state.changeByRange((range) => {
      const selected = state.sliceDoc(range.from, range.to)
      const insert = `${marker}${selected}${marker}`
      return {
        changes: { from: range.from, to: range.to, insert },
        range: selected.length > 0
          ? EditorSelection.range(range.from + marker.length, range.to + marker.length)
          : EditorSelection.cursor(range.from + marker.length)
      }
    })
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: 'input' }))
    return true
  }
}

const markdownKeymap = keymap.of([
  { key: 'Mod-b', run: wrapWith('**') },           // Bold
  { key: 'Mod-i', run: wrapWith('*') },             // Italic
  { key: 'Mod-`', run: wrapWith('`') },             // Inline code
  { key: 'Mod-Shift-`', run: wrapWith('```\n') },   // Code block (위아래)
])

export default function MarkdownEditor({ path, content }: Props) {
  const { updateTabContent, userSettings } = useStore()

  const isDark = THEME_PRESETS.find((p) => p.id === userSettings.activePreset)?.isDark ?? true
  const cmTheme = isDark ? githubDark : githubLight

  const onChange = useCallback((value: string) => {
    updateTabContent(path, value)
  }, [path, updateTabContent])

  return (
    <div className="flex-1 overflow-hidden flex flex-col" style={{ background: 'var(--bg-app)' }}>
      <CodeMirror
        value={content}
        height="100%"
        theme={cmTheme}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          history: true,         // Ctrl+Z / Ctrl+Shift+Z
          searchKeymap: true,    // Ctrl+F
        }}
        extensions={[
          markdown({ base: markdownLanguage }),
          baseTheme,
          EditorView.lineWrapping,
          keymap.of([indentWithTab]),
          markdownKeymap,
        ]}
        onChange={onChange}
        style={{ height: '100%', overflow: 'hidden' }}
      />
    </div>
  )
}
