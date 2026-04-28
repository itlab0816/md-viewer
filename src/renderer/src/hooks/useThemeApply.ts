import { useEffect } from 'react'
import { useStore } from '../store/useStore'

export function useThemeApply() {
  const { userSettings } = useStore()
  const { activePreset, fontFamily, fontSize, contentWidth, lineHeight } = userSettings

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', activePreset)
    root.setAttribute('data-font', fontFamily)
    root.style.setProperty('--font-size-body', `${fontSize}px`)
    root.style.setProperty('--content-width', `${contentWidth}px`)
    root.style.setProperty('--line-height-body', String(lineHeight))
  }, [activePreset, fontFamily, fontSize, contentWidth, lineHeight])
}
