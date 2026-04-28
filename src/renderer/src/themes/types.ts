export type ThemePresetId = 'minimal-dark' | 'minimal-light' | 'github' | 'notion' | 'sepia'
export type FontFamily = 'system' | 'pretendard' | 'serif' | 'mono'
export type CodeThemeId =
  | 'github-dark'
  | 'github-light'
  | 'one-dark-pro'
  | 'dracula'
  | 'nord'
  | 'tokyo-night'

export type ProseElement =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'blockquote' | 'hr' | 'list' | 'table'
  | 'a' | 'img' | 'strong' | 'em' | 'del'

export interface ProseStyleOption {
  id: string
  label: string
}

export const PROSE_STYLE_OPTIONS: Record<ProseElement, { label: string; options: ProseStyleOption[] }> = {
  h1:         { label: 'H1 제목',   options: [{ id: 'default', label: '기본' }, { id: 'hash', label: '# 프리픽스' }, { id: 'underline', label: '하단선만' }] },
  h2:         { label: 'H2 제목',   options: [{ id: 'default', label: '기본' }, { id: 'border-left', label: '왼쪽 테두리' }, { id: 'underline', label: '하단선' }] },
  h3:         { label: 'H3 제목',   options: [{ id: 'default', label: '기본' }, { id: 'diamond', label: '◆ 프리픽스' }, { id: 'arrow', label: '▸ 프리픽스' }, { id: 'dot', label: '● 프리픽스' }] },
  h4:         { label: 'H4 제목',   options: [{ id: 'default', label: '기본' }, { id: 'arrow', label: '▸ 프리픽스' }] },
  h5:         { label: 'H5 소제목', options: [{ id: 'default', label: '기본' }, { id: 'custom', label: '대문자 트래킹' }] },
  h6:         { label: 'H6 소제목', options: [{ id: 'default', label: '기본' }, { id: 'custom', label: '뮤트 스타일' }] },
  blockquote: { label: '인용문',    options: [{ id: 'default', label: '기본' }, { id: 'custom', label: '콜아웃 감지' }] },
  hr:         { label: '구분선',    options: [{ id: 'default', label: '기본' }, { id: 'decorative', label: '✦ ✦ ✦ 장식' }] },
  list:       { label: '목록 불릿', options: [{ id: 'default', label: '기본' }, { id: 'custom', label: '깊이별 불릿' }] },
  table:      { label: '표',        options: [{ id: 'default', label: '기본' }, { id: 'custom', label: '스타일 표' }] },
  a:          { label: '링크',      options: [{ id: 'default', label: '기본' }, { id: 'icon', label: '외부 ↗ 아이콘' }] },
  img:        { label: '이미지',    options: [{ id: 'default', label: '기본' }, { id: 'custom', label: '그림자 + 캡션' }] },
  strong:     { label: '굵게',      options: [{ id: 'default', label: '기본' }, { id: 'highlight', label: '하이라이트 배경' }, { id: 'color', label: '색상만' }] },
  em:         { label: '기울임',    options: [{ id: 'default', label: '기본' }, { id: 'custom', label: '색상 적용' }] },
  del:        { label: '취소선',    options: [{ id: 'default', label: '기본' }, { id: 'custom', label: '색상 적용' }] },
}

export type ProseStyles = Record<ProseElement, string>

export const DEFAULT_PROSE_STYLES: ProseStyles = {
  h1: 'default', h2: 'default', h3: 'default', h4: 'default', h5: 'default', h6: 'default',
  blockquote: 'default', hr: 'default', list: 'default', table: 'custom',
  a: 'default', img: 'default', strong: 'default', em: 'default', del: 'default',
}

export interface UserSettings {
  activePreset: ThemePresetId
  fontFamily: FontFamily
  fontSize: number       // 10–28
  contentWidth: number   // 480–1200
  lineHeight: number     // 1.0–3.0
  codeTheme: CodeThemeId
  proseStyles: ProseStyles
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  activePreset: 'minimal-dark',
  fontFamily: 'system',
  fontSize: 15,
  contentWidth: 720,
  lineHeight: 1.7,
  codeTheme: 'github-dark',
  proseStyles: { ...DEFAULT_PROSE_STYLES },
}

export interface ThemePreset {
  id: ThemePresetId
  label: string
  isDark: boolean
  preview: { bg: string; panel: string; text: string; accent: string }
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'minimal-dark',
    label: 'Minimal Dark',
    isDark: true,
    preview: { bg: '#000', panel: '#1c1c1e', text: 'rgba(255,255,255,0.85)', accent: '#3b82f6' }
  },
  {
    id: 'minimal-light',
    label: 'Minimal Light',
    isDark: false,
    preview: { bg: '#fff', panel: '#f5f5f7', text: '#1d1d1f', accent: '#0071e3' }
  },
  {
    id: 'github',
    label: 'GitHub',
    isDark: false,
    preview: { bg: '#fff', panel: '#f6f8fa', text: '#24292f', accent: '#0969da' }
  },
  {
    id: 'notion',
    label: 'Notion',
    isDark: false,
    preview: { bg: '#fff', panel: '#fbfbfa', text: '#37352f', accent: '#2383e2' }
  },
  {
    id: 'sepia',
    label: 'Sepia',
    isDark: false,
    preview: { bg: '#f9f3e8', panel: '#f2ead9', text: '#3d2b1f', accent: '#8b5a2b' }
  }
]

export const FONT_OPTIONS: { id: FontFamily; label: string; sample: string; stack: string }[] = [
  { id: 'system',     label: 'System UI',   sample: 'Aa 가나',  stack: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' },
  { id: 'pretendard', label: 'Pretendard',  sample: 'Aa 가나',  stack: '"Pretendard Variable", Pretendard, sans-serif' },
  { id: 'serif',      label: 'Serif',       sample: 'Aa 가나',  stack: 'Georgia, "Noto Serif", "Times New Roman", serif' },
  { id: 'mono',       label: 'Monospace',   sample: 'Aa 가나',  stack: '"Consolas", "D2Coding", "Fira Code", monospace' },
]

export const CODE_THEME_OPTIONS: { id: CodeThemeId; label: string; isDark: boolean }[] = [
  { id: 'github-dark', label: 'GitHub Dark', isDark: true },
  { id: 'github-light', label: 'GitHub Light', isDark: false },
  { id: 'one-dark-pro', label: 'One Dark Pro', isDark: true },
  { id: 'dracula', label: 'Dracula', isDark: true },
  { id: 'nord', label: 'Nord', isDark: true },
  { id: 'tokyo-night', label: 'Tokyo Night', isDark: true }
]
