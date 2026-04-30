import React, { useEffect, useRef, useCallback, useState } from 'react'
import TitleBar from './components/TitleBar'
import TabBar from './components/TabBar'
import Sidebar from './components/Sidebar'
import MarkdownRenderer from './components/MarkdownRenderer'
import MarkdownEditor from './components/MarkdownEditor'
import TableOfContents from './components/TableOfContents'
import WelcomeScreen from './components/WelcomeScreen'
import SettingsPanel from './components/SettingsPanel'
import SearchBar from './components/SearchBar'
import GlobalSearch from './components/GlobalSearch'
import { useStore } from './store/useStore'
import { useThemeApply } from './hooks/useThemeApply'
import type { UserSettings } from './themes/types'
import { DEFAULT_PROSE_STYLES } from './themes/types'

export default function App() {
  const {
    currentFile, openTab, setRecentFolders,
    setFolderPath, setFileTree, setSidebarOpen,
    userSettings, rightPanel, rightPanelWidth, setRightPanelWidth,
    viewMode, splitRatio, setSplitRatio,
    markTabSaved, reloadTabContent
  } = useStore()

  useThemeApply()

  const [searchOpen, setSearchOpen] = useState(false)
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const splitMainRef = useRef<HTMLElement>(null)

  // 앱 시작 시 설정 복원
  useEffect(() => {
    async function restore() {
      const settings = await window.api.getSettings()
      const patch: Partial<{ sidebarWidth: number; showAllFiles: boolean; userSettings: UserSettings }> = {
        sidebarWidth: settings.sidebarWidth,
        showAllFiles: settings.showAllFiles
      }
      if (settings.userSettings) {
        const saved = settings.userSettings as Partial<UserSettings>
        patch.userSettings = {
          ...useStore.getState().userSettings,
          ...saved,
          proseStyles: { ...DEFAULT_PROSE_STYLES, ...(saved.proseStyles ?? {}) },
        }
      }
      useStore.setState(patch)
      setRecentFolders(settings.recentFolders ?? [])
    }
    restore()
  }, [])

  // 설정 변경 시 저장
  useEffect(() => {
    window.api.setSettings({ userSettings })
  }, [userSettings])

  // 외부 파일 변경 감지 → 자동 리로드 (수정 중인 탭은 건너뜀)
  useEffect(() => {
    window.api.onFileChanged(async (filePath) => {
      const { tabs } = useStore.getState()
      const tab = tabs.find((t) => t.path === filePath)
      if (!tab || tab.modified) return
      const data = await window.api.readFile(filePath)
      if (data) reloadTabContent(filePath, data.content)
    })
    return () => window.api.removeAllListeners('file:changed')
  }, [])

  // 메뉴 IPC
  useEffect(() => {
    window.api.onMenuOpenFile(async () => { await openFile() })
    window.api.onMenuOpenFolder(async () => { await openFolder() })
    return () => {
      window.api.removeAllListeners('menu:open-file')
      window.api.removeAllListeners('menu:open-folder')
    }
  }, [])

  // 단축키 (Ctrl+S, Ctrl+F)
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        const { currentFile } = useStore.getState()
        if (!currentFile) return
        await window.api.writeFile(currentFile.path, currentFile.content)
        markTabSaved(currentFile.path)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        const { viewMode, currentFile } = useStore.getState()
        if (currentFile && viewMode !== 'editor') {
          e.preventDefault()
          setSearchOpen(true)
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        const { folderPath } = useStore.getState()
        if (folderPath) { e.preventDefault(); setGlobalSearchOpen(true) }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        const { userSettings, setUserSettings } = useStore.getState()
        setUserSettings({ fontSize: Math.min(28, userSettings.fontSize + 1) })
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        const { userSettings, setUserSettings } = useStore.getState()
        setUserSettings({ fontSize: Math.max(10, userSettings.fontSize - 1) })
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        useStore.getState().setUserSettings({ fontSize: 15 })
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        const { currentFile } = useStore.getState()
        if (currentFile) { e.preventDefault(); window.print() }
      }
      if (e.key === 'Escape') { setSearchOpen(false); setGlobalSearchOpen(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // 오른쪽 패널 리사이즈
  const rightDragRef = useRef(false)
  const rightStartX = useRef(0)
  const rightStartWidth = useRef(0)

  const onRightPanelMouseDown = useCallback((e: React.MouseEvent) => {
    rightDragRef.current = true
    rightStartX.current = e.clientX
    rightStartWidth.current = rightPanelWidth
    const onMove = (ev: MouseEvent) => {
      if (!rightDragRef.current) return
      setRightPanelWidth(Math.min(480, Math.max(180, rightStartWidth.current + rightStartX.current - ev.clientX)))
    }
    const onUp = () => {
      rightDragRef.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [rightPanelWidth, setRightPanelWidth])

  // 분할 뷰 리사이즈
  const splitDragRef = useRef(false)
  const splitContainerRef = useRef<HTMLDivElement>(null)

  const onSplitMouseDown = useCallback((e: React.MouseEvent) => {
    splitDragRef.current = true
    const onMove = (ev: MouseEvent) => {
      if (!splitDragRef.current || !splitContainerRef.current) return
      const rect = splitContainerRef.current.getBoundingClientRect()
      setSplitRatio(Math.min(0.8, Math.max(0.2, (ev.clientX - rect.left) / rect.width)))
    }
    const onUp = () => {
      splitDragRef.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [setSplitRatio])

  // 드래그 앤 드롭
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation() }
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    const items = Array.from(e.dataTransfer.files)
    if (items.length === 0) return
    const first = items[0]
    const filePath = window.api.getFilePath(first)
    if (!filePath) return

    if (!first.type) {
      // 폴더
      await openFolder(filePath)
    } else if (/\.(md|markdown|mdx)$/i.test(first.name)) {
      const data = await window.api.readFile(filePath)
      if (data) { openTab(data); await window.api.setSettings({ lastFile: data.path }) }
    }
  }

  const previewPane = (ref: React.RefObject<HTMLElement>) => currentFile ? (
    <article
      className="prose mx-auto px-8 py-8"
      style={{ maxWidth: 'var(--content-width)', fontSize: 'var(--font-size-body)' }}
    >
      <MarkdownRenderer content={currentFile.content} filePath={currentFile.path} />
    </article>
  ) : null

  return (
    <div
      id="app-root"
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {globalSearchOpen && <GlobalSearch onClose={() => setGlobalSearchOpen(false)} />}
      <TitleBar />
      <div id="app-tabbar"><TabBar /></div>
      <div id="app-body" className="flex flex-1 overflow-hidden">
        <div id="app-sidebar" style={{ display: 'contents' }}><Sidebar onFolderOpen={openFolder} onFileOpen={openFile} /></div>

        {!currentFile ? (
          <main id="app-main" className="flex-1 overflow-y-auto">
            <WelcomeScreen onFolderOpen={openFolder} onFileOpen={openFile} />
          </main>
        ) : viewMode === 'preview' ? (
          <main id="app-main" ref={mainRef} className="flex-1 overflow-y-auto relative">
            {searchOpen && <SearchBar containerRef={mainRef} onClose={() => setSearchOpen(false)} />}
            {previewPane(mainRef)}
          </main>
        ) : viewMode === 'editor' ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <MarkdownEditor path={currentFile.path} content={currentFile.content} />
          </div>
        ) : (
          <div ref={splitContainerRef} className="flex-1 overflow-hidden flex">
            <div className="overflow-hidden flex flex-col" style={{ width: `${splitRatio * 100}%` }}>
              <MarkdownEditor path={currentFile.path} content={currentFile.content} />
            </div>
            <div
              onMouseDown={onSplitMouseDown}
              className="w-[1px] flex-shrink-0 cursor-col-resize hover:bg-[var(--accent)]"
              style={{ background: 'var(--border)' }}
            />
            <main id="app-main" ref={splitMainRef} className="flex-1 overflow-y-auto relative">
              {searchOpen && <SearchBar containerRef={splitMainRef} onClose={() => setSearchOpen(false)} />}
              {previewPane(splitMainRef)}
            </main>
          </div>
        )}

        {rightPanel && (
          <div id="app-right-panel" className="flex flex-shrink-0" style={{ width: rightPanelWidth }}>
            <div
              onMouseDown={onRightPanelMouseDown}
              className="w-[1px] flex-shrink-0 cursor-col-resize hover:bg-[var(--accent)]"
              style={{ background: 'var(--border)' }}
            />
            <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
              {rightPanel === 'toc' && <TableOfContents />}
              {rightPanel === 'settings' && <SettingsPanel />}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  async function openFolder(path?: string) {
    const folderPath = path ?? await window.api.openFolder()
    if (!folderPath) return
    const { showAllFiles, recentFolders } = useStore.getState()
    const tree = await window.api.readDir(folderPath, showAllFiles)
    setFolderPath(folderPath)
    setFileTree(tree)
    setSidebarOpen(true)
    const next = [folderPath, ...recentFolders.filter((f) => f !== folderPath)].slice(0, 10)
    setRecentFolders(next)
    await window.api.setSettings({ lastFolder: folderPath, recentFolders: next })
  }

  async function openFile() {
    const data = await window.api.openFile()
    if (!data) return
    openTab(data)
    window.api.watchFile(data.path)
    await window.api.setSettings({ lastFile: data.path })
  }
}
