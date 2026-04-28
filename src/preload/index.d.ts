import { ElectronAPI } from '@electron-toolkit/preload'

export interface FileNode {
  name: string
  path: string
  type: 'file' | 'dir'
  children?: FileNode[]
}

export interface FileData {
  path: string
  content: string
}

export interface AppSettings {
  lastFolder: string | null
  lastFile: string | null
  recentFolders: string[]
  windowBounds: { width: number; height: number; x?: number; y?: number }
  sidebarWidth: number
  showAllFiles: boolean
  userSettings?: Record<string, unknown>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openFile: () => Promise<FileData | null>
      openFolder: () => Promise<string | null>
      readDir: (dirPath: string, allFiles?: boolean) => Promise<FileNode[]>
      readFile: (filePath: string) => Promise<FileData | null>
      writeFile: (filePath: string, content: string) => Promise<void>
      getSettings: () => Promise<AppSettings>
      setSettings: (data: Partial<AppSettings>) => Promise<void>
      onMenuOpenFile: (cb: () => void) => void
      onMenuOpenFolder: (cb: () => void) => void
      removeAllListeners: (channel: string) => void
      getFilePath: (file: File) => string
      watchFile: (filePath: string) => Promise<void>
      unwatchFile: (filePath: string) => Promise<void>
      onFileChanged: (cb: (filePath: string) => void) => void
    }
  }
}
