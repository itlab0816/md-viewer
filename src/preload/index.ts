import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  readDir: (dirPath: string, allFiles?: boolean) => ipcRenderer.invoke('fs:readDir', dirPath, allFiles),
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (data: Record<string, unknown>) => ipcRenderer.invoke('settings:set', data),
  onMenuOpenFile: (cb: () => void) => ipcRenderer.on('menu:open-file', cb),
  onMenuOpenFolder: (cb: () => void) => ipcRenderer.on('menu:open-folder', cb),
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
  getFilePath: (file: File) => webUtils.getPathForFile(file),
  watchFile: (filePath: string) => ipcRenderer.invoke('watch:file', filePath),
  unwatchFile: (filePath: string) => ipcRenderer.invoke('unwatch:file', filePath),
  onFileChanged: (cb: (filePath: string) => void) =>
    ipcRenderer.on('file:changed', (_, path) => cb(path))
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
