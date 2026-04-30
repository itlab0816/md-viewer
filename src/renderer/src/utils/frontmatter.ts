export interface FrontmatterData {
  title?: string
  tags?: string[]
  date?: string
  description?: string
  [key: string]: unknown
}

export interface ParsedContent {
  data: FrontmatterData
  body: string
}

function parseYamlValue(val: string): unknown {
  const s = val.trim()
  if (s.startsWith('[') && s.endsWith(']')) {
    return s.slice(1, -1).split(',').map((v) => v.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
  }
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1)
  }
  if (s === 'true') return true
  if (s === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s)
  return s
}

export function parseFrontmatter(content: string): ParsedContent {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/)
  if (!match) return { data: {}, body: content }

  const data: FrontmatterData = {}
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    const val = line.slice(colon + 1).trim()
    if (key) (data as any)[key] = parseYamlValue(val)
  }

  return { data, body: content.slice(match[0].length) }
}
