import { create } from 'zustand'
import { FileNode } from '../../../preload/index.d'
import { UserSettings, DEFAULT_USER_SETTINGS } from '../themes/types'

export interface Tab {
  path: string
  content: string
  modified?: boolean
}

export type RightPanel = 'toc' | 'settings' | null
export type ViewMode = 'preview' | 'split' | 'editor'

interface AppState {
  sidebarOpen: boolean
  sidebarWidth: number
  folderPath: string | null
  fileTree: FileNode[]
  showAllFiles: boolean
  recentFolders: string[]
  tabs: Tab[]
  activeTabPath: string | null
  currentFile: Tab | null
  userSettings: UserSettings
  rightPanel: RightPanel
  rightPanelWidth: number
  viewMode: ViewMode
  splitRatio: number  // 0.0 ~ 1.0, editor 비율

  setSidebarOpen: (open: boolean) => void
  setSidebarWidth: (width: number) => void
  setRightPanelWidth: (width: number) => void
  setFolderPath: (path: string | null) => void
  setFileTree: (tree: FileNode[]) => void
  setShowAllFiles: (show: boolean) => void
  setRecentFolders: (folders: string[]) => void
  openTab: (file: Tab) => void
  closeTab: (path: string) => void
  setActiveTab: (path: string) => void
  setCurrentFile: (file: Tab | null) => void
  setUserSettings: (patch: Partial<UserSettings>) => void
  toggleRightPanel: (panel: 'toc' | 'settings') => void
  setViewMode: (mode: ViewMode) => void
  setSplitRatio: (ratio: number) => void
  updateTabContent: (path: string, content: string) => void
  markTabSaved: (path: string) => void
  reloadTabContent: (path: string, content: string) => void
}

export const useStore = create<AppState>((set, get) => ({
  sidebarOpen: true,
  sidebarWidth: 240,
  folderPath: null,
  fileTree: [],
  showAllFiles: false,
  recentFolders: [],
  tabs: [],
  activeTabPath: null,
  currentFile: null,
  userSettings: { ...DEFAULT_USER_SETTINGS },
  rightPanel: 'toc',
  rightPanelWidth: 256,
  viewMode: 'preview',
  splitRatio: 0.5,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  setRightPanelWidth: (width) => set({ rightPanelWidth: width }),
  setFolderPath: (path) => set({ folderPath: path }),
  setFileTree: (tree) => set({ fileTree: tree }),
  setShowAllFiles: (show) => set({ showAllFiles: show }),
  setRecentFolders: (folders) => set({ recentFolders: folders }),

  openTab: (file) => {
    const { tabs } = get()
    const norm = (p: string) => p.replace(/\\/g, '/')
    const exists = tabs.find((t) => norm(t.path) === norm(file.path))
    if (exists) {
      set({ activeTabPath: exists.path, currentFile: exists })
    } else {
      set({ tabs: [...tabs, file], activeTabPath: file.path, currentFile: file })
    }
  },

  closeTab: (path) => {
    const { tabs, activeTabPath } = get()
    const idx = tabs.findIndex((t) => t.path === path)
    const next = tabs.filter((t) => t.path !== path)
    let nextActive = activeTabPath
    if (activeTabPath === path) {
      nextActive = next[idx]?.path ?? next[idx - 1]?.path ?? null
    }
    const nextFile = next.find((t) => t.path === nextActive) ?? null
    set({ tabs: next, activeTabPath: nextActive, currentFile: nextFile })
  },

  setActiveTab: (path) => {
    const file = get().tabs.find((t) => t.path === path) ?? null
    set({ activeTabPath: path, currentFile: file })
  },

  setCurrentFile: (file) => {
    if (!file) { set({ currentFile: null, activeTabPath: null }); return }
    get().openTab(file)
  },

  setUserSettings: (patch) =>
    set((s) => ({ userSettings: { ...s.userSettings, ...patch } })),

  toggleRightPanel: (panel) =>
    set((s) => ({ rightPanel: s.rightPanel === panel ? null : panel })),

  setViewMode: (mode) => set({ viewMode: mode }),
  setSplitRatio: (ratio) => set({ splitRatio: ratio }),

  updateTabContent: (path, content) =>
    set((s) => {
      const tabs = s.tabs.map((t) =>
        t.path === path ? { ...t, content, modified: true } : t
      )
      const currentFile = s.currentFile?.path === path
        ? { ...s.currentFile, content, modified: true }
        : s.currentFile
      return { tabs, currentFile }
    }),

  markTabSaved: (path) =>
    set((s) => {
      const tabs = s.tabs.map((t) =>
        t.path === path ? { ...t, modified: false } : t
      )
      const currentFile = s.currentFile?.path === path
        ? { ...s.currentFile, modified: false }
        : s.currentFile
      return { tabs, currentFile }
    }),

  reloadTabContent: (path, content) =>
    set((s) => {
      const tabs = s.tabs.map((t) =>
        t.path === path ? { ...t, content, modified: false } : t
      )
      const currentFile = s.currentFile?.path === path
        ? { ...s.currentFile, content, modified: false }
        : s.currentFile
      return { tabs, currentFile }
    })
}))
