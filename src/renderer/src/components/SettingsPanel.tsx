import React, { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import {
  THEME_PRESETS, FONT_OPTIONS, CODE_THEME_OPTIONS, DEFAULT_USER_SETTINGS,
  PROSE_STYLE_OPTIONS, ProseElement,
} from '../themes/types'

// 대표 폰트 설치 여부 확인 (system/pretendard는 항상 available)
const ALWAYS_AVAILABLE = new Set(['system', 'pretendard'])
const FONT_CHECK: Record<string, string> = {
  serif: 'Georgia',
  mono: 'Consolas'
}

function useFontAvailability() {
  const [available, setAvailable] = useState<Record<string, boolean>>({})
  useEffect(() => {
    async function check() {
      const result: Record<string, boolean> = {}
      for (const opt of FONT_OPTIONS) {
        if (ALWAYS_AVAILABLE.has(opt.id)) { result[opt.id] = true; continue }
        const testFont = FONT_CHECK[opt.id]
        try {
          await document.fonts.load(`16px "${testFont}"`)
          result[opt.id] = document.fonts.check(`16px "${testFont}"`)
        } catch {
          result[opt.id] = false
        }
      }
      setAvailable(result)
    }
    check()
  }, [])
  return available
}

export default function SettingsPanel() {
  const { userSettings, setUserSettings } = useStore()
  const { activePreset, fontFamily, fontSize, contentWidth, lineHeight, codeTheme, proseStyles } = userSettings
  const fontAvailable = useFontAvailability()

  const ps = proseStyles ?? { ...DEFAULT_USER_SETTINGS.proseStyles }

  function selectProse(key: ProseElement, id: string) {
    setUserSettings({ proseStyles: { ...ps, [key]: id } })
  }

  return (
    <nav
      className="flex flex-col flex-1 overflow-y-auto"
      style={{ background: 'var(--bg-panel)' }}
    >
      {/* 헤더 */}
      <div
        className="px-3 py-3 text-xs font-semibold uppercase tracking-wider border-b flex-shrink-0"
        style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
      >
        설정
      </div>

      {/* 테마 프리셋 */}
      <Section title="테마">
        <div className="grid grid-cols-2 gap-2">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setUserSettings({ activePreset: preset.id })}
              className="flex flex-col items-start rounded-lg overflow-hidden border-2 transition-all text-left"
              style={{
                borderColor: activePreset === preset.id ? 'var(--accent)' : 'var(--border)',
                boxShadow: activePreset === preset.id ? '0 0 0 1px var(--accent)' : 'none'
              }}
            >
              <div
                className="w-full h-10 flex items-end gap-1 px-2 pb-1.5"
                style={{ background: preset.preview.bg }}
              >
                <div className="h-1.5 rounded-full flex-1" style={{ background: preset.preview.text, opacity: 0.8 }} />
                <div className="h-1.5 rounded-full w-1/2" style={{ background: preset.preview.text, opacity: 0.4 }} />
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: preset.preview.accent }} />
              </div>
              <div
                className="px-2 py-1.5 text-[11px] font-medium w-full"
                style={{ background: preset.preview.panel, color: preset.preview.text }}
              >
                {preset.label}
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* 글꼴 */}
      <Section title="글꼴">
        <div className="flex flex-col gap-1">
          {FONT_OPTIONS.map((opt) => {
            const isAvailable = fontAvailable[opt.id] !== false
            const isActive = fontFamily === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => isAvailable && setUserSettings({ fontFamily: opt.id })}
                disabled={!isAvailable}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
                style={{
                  background: isActive ? 'var(--bg-elevated)' : 'transparent',
                  color: !isAvailable
                    ? 'var(--text-muted)'
                    : isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: isActive ? 'var(--accent)' : 'transparent',
                  opacity: !isAvailable ? 0.4 : 1,
                  cursor: !isAvailable ? 'not-allowed' : 'pointer'
                }}
              >
                <span>{opt.label}</span>
                <div className="flex items-center gap-2">
                  {!isAvailable && (
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>미설치</span>
                  )}
                  <span className="text-base" style={{ fontFamily: opt.stack }}>
                    {opt.sample}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </Section>

      {/* 글자 크기 */}
      <Section title={`글자 크기 — ${fontSize}px`}>
        <input
          type="range" min={10} max={28} step={1}
          value={fontSize}
          onChange={(e) => setUserSettings({ fontSize: Number(e.target.value) })}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: 'var(--accent)' }}
        />
        <div className="flex justify-between mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <span>10</span><span>28</span>
        </div>
      </Section>

      {/* 본문 너비 */}
      <Section title={`본문 너비 — ${contentWidth}px`}>
        <input
          type="range" min={480} max={1200} step={40}
          value={contentWidth}
          onChange={(e) => setUserSettings({ contentWidth: Number(e.target.value) })}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: 'var(--accent)' }}
        />
        <div className="flex justify-between mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <span>좁게</span><span>넓게</span>
        </div>
      </Section>

      {/* 줄간격 */}
      <Section title={`줄간격 — ${lineHeight.toFixed(1)}`}>
        <input
          type="range" min={1.0} max={3.0} step={0.1}
          value={lineHeight}
          onChange={(e) => setUserSettings({ lineHeight: Number(e.target.value) })}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: 'var(--accent)' }}
        />
        <div className="flex justify-between mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <span>1.0</span><span>3.0</span>
        </div>
      </Section>

      {/* 코드 스타일 */}
      <Section title="코드 스타일">
        <div className="flex flex-col gap-1">
          {CODE_THEME_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setUserSettings({ codeTheme: opt.id })}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[12px] transition-colors"
              style={{
                background: codeTheme === opt.id ? 'var(--bg-elevated)' : 'transparent',
                color: codeTheme === opt.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: codeTheme === opt.id ? 'var(--accent)' : 'transparent'
              }}
            >
              <span>{opt.label}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: 'var(--bg-active)', color: 'var(--text-muted)' }}
              >
                {opt.isDark ? 'dark' : 'light'}
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* 마크다운 요소 커스텀 */}
      <Section title="마크다운 요소 스타일">
        <div className="flex flex-col gap-3">
          {(Object.keys(PROSE_STYLE_OPTIONS) as ProseElement[]).map((key) => (
            <div key={key}>
              <div className="text-[11px] mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {PROSE_STYLE_OPTIONS[key].label}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PROSE_STYLE_OPTIONS[key].options.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md cursor-pointer text-[11px] transition-colors"
                    style={{
                      background: ps[key] === opt.id ? 'var(--bg-elevated)' : 'transparent',
                      color: ps[key] === opt.id ? 'var(--text-primary)' : 'var(--text-muted)',
                      border: `1px solid ${ps[key] === opt.id ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    <input
                      type="radio"
                      name={`prose-${key}`}
                      value={opt.id}
                      checked={ps[key] === opt.id}
                      onChange={() => selectProse(key, opt.id)}
                      style={{ accentColor: 'var(--accent)', width: '10px', height: '10px' }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 초기화 */}
      <div className="px-4 py-4">
        <button
          onClick={() => setUserSettings({ ...DEFAULT_USER_SETTINGS })}
          className="w-full px-3 py-2 rounded-lg text-[12px] transition-colors"
          style={{
            background: 'var(--bg-hover)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)'
          }}
        >
          기본값으로 초기화
        </button>
      </div>
    </nav>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-muted)' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

