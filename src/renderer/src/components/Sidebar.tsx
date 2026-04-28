import React, { useState, useCallback, useRef } from 'react'
import { useStore } from '../store/useStore'
import { FileNode } from '../../../preload/index.d'

const MD_EXT = /\.(md|markdown|mdx)$/i

function fileIcon(name: string, type: 'file' | 'dir', isRoot = false): string {
  if (isRoot) return '🗂️'
  if (type === 'dir') return '📁'
  if (MD_EXT.test(name)) return '📝'
  if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) return '🖼️'
  if (/\.(mp4|mov|avi|mkv)$/i.test(name)) return '🎬'
  if (/\.(mp3|wav|ogg|flac)$/i.test(name)) return '🎵'
  if (/\.(pdf)$/i.test(name)) return '📕'
  if (/\.(zip|tar|gz|rar|7z)$/i.test(name)) return '📦'
  if (/\.(js|ts|jsx|tsx|py|go|rs|java|c|cpp|cs|swift|rb|php)$/i.test(name)) return '💻'
  if (/\.(json|yaml|yml|toml|xml|env)$/i.test(name)) return '⚙️'
  return '📄'
}

function collectDirPaths(nodes: FileNode[]): string[] {
  const paths: string[] = []
  for (const node of nodes) {
    if (node.type === 'dir') {
      paths.push(node.path)
      if (node.children) paths.push(...collectDirPaths(node.children))
    }
  }
  return paths
}

interface TreeProps {
  nodes: FileNode[]
  depth: number
  expandedDirs: Set<string>
  onToggleDir: (path: string) => void
}

function FileTree({ nodes, depth, expandedDirs, onToggleDir }: TreeProps) {
  return (
    <ul>
      {nodes.map((node) => (
        <FileItem
          key={node.path}
          node={node}
          depth={depth}
          expandedDirs={expandedDirs}
          onToggleDir={onToggleDir}
        />
      ))}
    </ul>
  )
}

function FileItem({ node, depth, expandedDirs, onToggleDir }: {
  node: FileNode
  depth: number
  expandedDirs: Set<string>
  onToggleDir: (path: string) => void
}) {
  const { currentFile, openTab, showAllFiles } = useStore()
  const isActive = currentFile?.path === node.path
  const isMarkdown = MD_EXT.test(node.name)
  const expanded = expandedDirs.has(node.path)
  const dimmed = showAllFiles && node.type === 'file' && !isMarkdown

  const handleClick = async () => {
    if (node.type === 'dir') {
      onToggleDir(node.path)
    } else if (isMarkdown) {
      const data = await window.api.readFile(node.path)
      if (data) {
        openTab(data)
        window.api.watchFile(data.path)
        await window.api.setSettings({ lastFile: data.path })
      }
    }
  }

  return (
    <li>
      <button
        onClick={handleClick}
        disabled={dimmed}
        className="flex items-center w-full text-left py-[2px] rounded text-[12px] transition-colors leading-tight hover:bg-[var(--bg-hover)]"
        style={{
          paddingLeft: `${depth * 12}px`,
          paddingRight: '6px',
          background: isActive ? 'var(--accent)' : 'transparent',
          color: isActive
            ? 'var(--accent-text)'
            : dimmed
            ? 'var(--text-placeholder)'
            : 'var(--text-secondary)',
          cursor: dimmed ? 'default' : undefined
        }}
        title={node.path}
      >
        <span className="w-4 flex-shrink-0 flex items-center justify-center text-[9px] opacity-50">
          {node.type === 'dir' ? (expanded ? '▼' : '▶') : ''}
        </span>
        <span className="flex-shrink-0 mr-1">{fileIcon(node.name, node.type)}</span>
        <span className="truncate">
          {node.type === 'file' ? node.name.replace(MD_EXT, '') : node.name}
        </span>
      </button>
      {node.type === 'dir' && expanded && node.children && (
        <FileTree
          nodes={node.children}
          depth={depth + 1}
          expandedDirs={expandedDirs}
          onToggleDir={onToggleDir}
        />
      )}
    </li>
  )
}

function RootNode({ folderPath, fileTree, expandedDirs, onToggleDir }: {
  folderPath: string
  fileTree: FileNode[]
  expandedDirs: Set<string>
  onToggleDir: (path: string) => void
}) {
  const rootName = folderPath.split(/[\\/]/).pop() ?? folderPath
  const expanded = expandedDirs.has(folderPath)

  return (
    <ul>
      <li>
        <button
          onClick={() => onToggleDir(folderPath)}
          className="flex items-center w-full text-left py-[3px] rounded text-[12px] font-semibold transition-colors leading-tight hover:bg-[var(--bg-hover)]"
          style={{ paddingLeft: '2px', paddingRight: '6px', color: 'var(--text-primary)' }}
          title={folderPath}
        >
          <span className="w-4 flex-shrink-0 flex items-center justify-center text-[9px] opacity-50">
            {expanded ? '▼' : '▶'}
          </span>
          <span className="flex-shrink-0 mr-1">{fileIcon('', 'dir', true)}</span>
          <span className="truncate">{rootName}</span>
        </button>
        {expanded && (
          <FileTree
            nodes={fileTree}
            depth={1}
            expandedDirs={expandedDirs}
            onToggleDir={onToggleDir}
          />
        )}
      </li>
    </ul>
  )
}

interface SidebarProps {
  onFolderOpen: (path?: string) => void
  onFileOpen: () => void
}

export default function Sidebar({ onFolderOpen, onFileOpen }: SidebarProps) {
  const {
    sidebarOpen, sidebarWidth, setSidebarWidth,
    folderPath, fileTree, showAllFiles,
    setFileTree, setShowAllFiles
  } = useStore()

  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())

  const isDragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    startX.current = e.clientX
    startWidth.current = sidebarWidth

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return
      const next = Math.min(480, Math.max(160, startWidth.current + ev.clientX - startX.current))
      setSidebarWidth(next)
    }
    const onUp = () => {
      isDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [sidebarWidth, setSidebarWidth])

  const handleToggleDir = useCallback((path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const handleExpandAll = useCallback(() => {
    const all = new Set(collectDirPaths(fileTree))
    if (folderPath) all.add(folderPath)
    setExpandedDirs(all)
  }, [fileTree, folderPath])

  const handleCollapseAll = useCallback(() => {
    setExpandedDirs(folderPath ? new Set([folderPath]) : new Set())
  }, [folderPath])

  const handleToggleAllFiles = async () => {
    const next = !showAllFiles
    setShowAllFiles(next)
    if (folderPath) {
      const tree = await window.api.readDir(folderPath, next)
      setFileTree(tree)
    }
  }

  if (!sidebarOpen) return null

  return (
    <div className="flex flex-shrink-0" style={{ width: sidebarWidth }}>
      <aside
        className="flex flex-col flex-1 min-w-0"
        style={{ background: 'var(--bg-panel)' }}
      >
        {/* 툴바 */}
        <div
          className="flex items-center gap-1 pl-1 pr-1 py-1.5 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={onFileOpen}
            className="text-[11px] px-1.5 py-1 rounded transition-colors hover:bg-[var(--bg-elevated)]"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
          >
            파일
          </button>
          <button
            onClick={() => onFolderOpen()}
            className="text-[11px] px-1.5 py-1 rounded transition-colors hover:bg-[var(--bg-elevated)]"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
          >
            폴더
          </button>

          <div className="flex items-center gap-0.5 ml-auto">
            <IconBtn title="모두 펼치기" onClick={handleExpandAll}>
              <span className="flex flex-col items-center leading-[6px]">
                <span className="text-[7px]">▲</span>
                <span className="text-[7px]">▼</span>
              </span>
            </IconBtn>
            <IconBtn title="모두 닫기" onClick={handleCollapseAll}>
              <span className="flex flex-col items-center leading-[6px]">
                <span className="text-[7px]">▼</span>
                <span className="text-[7px]">▲</span>
              </span>
            </IconBtn>
            <IconBtn
              title={showAllFiles ? 'MD 파일만 보기' : '모든 파일 보기'}
              onClick={handleToggleAllFiles}
              active={showAllFiles}
            >
              ⊞
            </IconBtn>
          </div>
        </div>

        {/* 파일 트리 */}
        <div className="flex-1 overflow-y-auto py-1">
          {folderPath && fileTree.length >= 0 ? (
            <RootNode
              folderPath={folderPath}
              fileTree={fileTree}
              expandedDirs={expandedDirs}
              onToggleDir={handleToggleDir}
            />
          ) : (
            <div
              className="px-4 py-8 text-[11px] text-center"
              style={{ color: 'var(--text-muted)' }}
            >
              폴더를 열거나
              <br />
              파일을 선택하세요
            </div>
          )}
        </div>
      </aside>

      {/* 리사이즈 핸들 */}
      <div
        onMouseDown={onMouseDown}
        className="w-[1px] flex-shrink-0 cursor-col-resize transition-colors hover:bg-[var(--accent)]"
        style={{ background: 'var(--border)' }}
      />
    </div>
  )
}

function IconBtn({
  children, title, onClick, active
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-5 h-5 flex items-center justify-center rounded text-[10px] transition-colors hover:bg-[var(--bg-elevated)]"
      style={
        active
          ? { background: 'var(--accent)', color: 'var(--accent-text)' }
          : { color: 'var(--text-muted)' }
      }
    >
      {children}
    </button>
  )
}
