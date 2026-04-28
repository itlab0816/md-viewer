import { app, shell, BrowserWindow, ipcMain, dialog, Menu, protocol } from 'electron'
import { join } from 'path'
import { readFile, readdir, stat, writeFile, mkdir } from 'fs/promises'
import { existsSync, watch as fsWatch } from 'fs'
import type { FSWatcher } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

// ─── File Watcher ─────────────────────────────────────────────────────────────

let mainWin: BrowserWindow | null = null
const fileWatchers = new Map<string, { watcher: FSWatcher; timer: ReturnType<typeof setTimeout> | null }>()

ipcMain.handle('watch:file', (_, filePath: string) => {
  if (fileWatchers.has(filePath)) return
  let timer: ReturnType<typeof setTimeout> | null = null
  const watcher = fsWatch(filePath, () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      mainWin?.webContents.send('file:changed', filePath)
    }, 300)
  })
  fileWatchers.set(filePath, { watcher, timer })
})

ipcMain.handle('unwatch:file', (_, filePath: string) => {
  const entry = fileWatchers.get(filePath)
  if (entry) {
    if (entry.timer) clearTimeout(entry.timer)
    entry.watcher.close()
    fileWatchers.delete(filePath)
  }
})

// 로컬 파일 프로토콜 (이미지 등 로컬 리소스 접근용)
protocol.registerSchemesAsPrivileged([
  { scheme: 'local-file', privileges: { secure: true, standard: true, supportFetchAPI: true, bypassCSP: true } }
])

// ─── Settings ────────────────────────────────────────────────────────────────

interface AppSettings {
  lastFolder: string | null
  lastFile: string | null
  recentFolders: string[]
  windowBounds: { width: number; height: number; x?: number; y?: number }
  sidebarWidth: number
  showAllFiles: boolean
  userSettings?: Record<string, unknown>
}

const DEFAULT_SETTINGS: AppSettings = {
  lastFolder: null,
  lastFile: null,
  recentFolders: [],
  windowBounds: { width: 1280, height: 800 },
  sidebarWidth: 240,
  showAllFiles: false
}

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

async function readSettings(): Promise<AppSettings> {
  try {
    const raw = await readFile(settingsPath(), 'utf-8')
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

async function writeSettings(data: Partial<AppSettings>): Promise<void> {
  const current = await readSettings()
  const next = { ...current, ...data }
  await mkdir(app.getPath('userData'), { recursive: true })
  await writeFile(settingsPath(), JSON.stringify(next, null, 2), 'utf-8')
}

// ─── Window ───────────────────────────────────────────────────────────────────

async function createWindow(): Promise<BrowserWindow> {
  const settings = await readSettings()
  const { width, height, x, y } = settings.windowBounds

  const mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    minWidth: 800,
    minHeight: 600,
    show: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#000000',
    icon: join(__dirname, '../../build/icon.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  // 창 크기/위치 저장
  const saveBounds = () => {
    const b = mainWindow.getBounds()
    writeSettings({ windowBounds: { width: b.width, height: b.height, x: b.x, y: b.y } })
  }
  mainWindow.on('resize', saveBounds)
  mainWindow.on('move', saveBounds)

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

function buildMenu(mainWindow: BrowserWindow): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open File...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu:open-file')
        },
        {
          label: 'Open Folder...',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => mainWindow.webContents.send('menu:open-folder')
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.mdviewer.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  protocol.handle('local-file', async (request) => {
    const url = request.url.slice('local-file:///'.length)
    const filePath = decodeURIComponent(url)
    try {
      const data = await readFile(filePath)
      const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
      const mime: Record<string, string> = {
        svg:  'image/svg+xml',
        png:  'image/png',
        jpg:  'image/jpeg',
        jpeg: 'image/jpeg',
        gif:  'image/gif',
        webp: 'image/webp',
        bmp:  'image/bmp',
        ico:  'image/x-icon',
      }
      return new Response(data, {
        headers: { 'content-type': mime[ext] ?? 'application/octet-stream' }
      })
    } catch {
      return new Response('Not found', { status: 404 })
    }
  })

  const mainWindow = await createWindow()
  mainWin = mainWindow
  buildMenu(mainWindow)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ─── IPC: Settings ────────────────────────────────────────────────────────────

ipcMain.handle('settings:get', () => readSettings())

ipcMain.handle('settings:set', async (_, data: Partial<AppSettings>) => {
  await writeSettings(data)
})

// ─── IPC: Dialogs ─────────────────────────────────────────────────────────────

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'mdx'] }],
    properties: ['openFile']
  })
  if (canceled || filePaths.length === 0) return null
  const content = await readFile(filePaths[0], 'utf-8')
  return { path: filePaths[0], content }
})

ipcMain.handle('dialog:openFolder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (canceled || filePaths.length === 0) return null
  return filePaths[0]
})

// ─── IPC: File System ─────────────────────────────────────────────────────────

ipcMain.handle('fs:readDir', async (_, dirPath: string, allFiles = false) => {
  async function walk(dir: string): Promise<FileNode[]> {
    const entries = await readdir(dir)
    const nodes: FileNode[] = []
    for (const entry of entries) {
      if (entry.startsWith('.')) continue
      const fullPath = join(dir, entry)
      const info = await stat(fullPath)
      if (info.isDirectory()) {
        nodes.push({ name: entry, path: fullPath, type: 'dir', children: await walk(fullPath) })
      } else if (allFiles || /\.(md|markdown|mdx)$/i.test(entry)) {
        nodes.push({ name: entry, path: fullPath, type: 'file' })
      }
    }
    return nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }
  return walk(dirPath)
})

ipcMain.handle('fs:readFile', async (_, filePath: string) => {
  if (!existsSync(filePath)) return null
  const content = await readFile(filePath, 'utf-8')
  return { path: filePath, content }
})

ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
  await writeFile(filePath, content, 'utf-8')
})

interface FileNode {
  name: string
  path: string
  type: 'file' | 'dir'
  children?: FileNode[]
}
