import React from 'react'

// ── 리스트 depth 추적 ─────────────────────────────────────────
const ListDepthCtx = React.createContext(0)

// ── 첫 번째 텍스트 추출 (callout 감지용) ─────────────────────
function firstText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return firstText(node[0])
  if (React.isValidElement(node)) return firstText((node.props as any).children)
  return ''
}

// ── Callout 타입 정의 ─────────────────────────────────────────
const CALLOUTS: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  NOTE:    { icon: 'ℹ️',  label: 'Note',    color: 'var(--accent)',  bg: 'rgba(59,130,246,0.08)' },
  TIP:     { icon: '💡',  label: 'Tip',     color: '#22c55e',        bg: 'rgba(34,197,94,0.08)' },
  WARNING: { icon: '⚠️',  label: 'Warning', color: '#f59e0b',        bg: 'rgba(245,158,11,0.08)' },
  DANGER:  { icon: '🚨',  label: 'Danger',  color: '#ef4444',        bg: 'rgba(239,68,68,0.08)' },
  INFO:    { icon: '📌',  label: 'Info',    color: '#8b5cf6',        bg: 'rgba(139,92,246,0.08)' },
  CAUTION: { icon: '🔥',  label: 'Caution', color: '#f97316',        bg: 'rgba(249,115,22,0.08)' },
}

// ── Headings ──────────────────────────────────────────────────

export function H1({ children, id }: any) {
  return (
    <h1 id={id} style={{ color: 'var(--prose-heading)', marginTop: 0, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--border)', position: 'relative' }}>
      <span style={{ color: 'var(--accent)', marginRight: '0.35em', fontWeight: 400, opacity: 0.85 }}>#</span>
      {children}
    </h1>
  )
}

export function H2({ children, id }: any) {
  return (
    <h2 id={id} style={{ color: 'var(--prose-heading)', marginTop: '1.75rem', marginBottom: '0.625rem', paddingLeft: '0.75rem', borderLeft: '3px solid var(--accent)', lineHeight: 1.35 }}>
      {children}
    </h2>
  )
}

export function H3({ children, id }: any) {
  return (
    <h3 id={id} style={{ color: 'var(--prose-heading)', marginTop: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4em' }}>
      <span style={{ color: 'var(--accent)', fontSize: '0.6em', lineHeight: 1 }}>◆</span>
      {children}
    </h3>
  )
}

export function H3Arrow({ children, id }: any) {
  return (
    <h3 id={id} style={{ color: 'var(--prose-heading)', marginTop: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4em' }}>
      <span style={{ color: 'var(--accent)', fontSize: '0.75em', lineHeight: 1 }}>▸</span>
      {children}
    </h3>
  )
}

export function H3Dot({ children, id }: any) {
  return (
    <h3 id={id} style={{ color: 'var(--prose-heading)', marginTop: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4em' }}>
      <span style={{ color: 'var(--accent)', fontSize: '0.5em', lineHeight: 1 }}>●</span>
      {children}
    </h3>
  )
}

export function H4({ children, id }: any) {
  return (
    <h4 id={id} style={{ color: 'var(--prose-heading)', marginTop: '1rem', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.4em' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.55em' }}>▸</span>
      {children}
    </h4>
  )
}

export function H5({ children, id }: any) {
  return (
    <h5 id={id} style={{ color: 'var(--text-secondary)', marginTop: '0.875rem', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {children}
    </h5>
  )
}

export function H6({ children, id }: any) {
  return (
    <h6 id={id} style={{ color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
      {children}
    </h6>
  )
}

// ── Paragraph ─────────────────────────────────────────────────

export function P({ children }: any) {
  return (
    <p style={{ color: 'var(--prose-body)', lineHeight: 'var(--line-height-body, 1.7)', marginBottom: '0.75rem' }}>
      {children}
    </p>
  )
}

// ── Blockquote / Callout ──────────────────────────────────────

export function Blockquote({ children }: any) {
  const text = firstText(children).trim()
  const match = text.match(/^\[!(NOTE|TIP|WARNING|DANGER|INFO|CAUTION)\]/i)

  if (match) {
    const type = match[1].toUpperCase()
    const callout = CALLOUTS[type] ?? CALLOUTS.NOTE
    return (
      <div style={{
        border: `1px solid ${callout.color}`,
        borderLeft: `4px solid ${callout.color}`,
        borderRadius: '0.5rem',
        background: callout.bg,
        padding: '0.75rem 1rem',
        margin: '1rem 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem', color: callout.color }}>
          <span>{callout.icon}</span>
          <span>{callout.label}</span>
        </div>
        <div style={{ color: 'var(--prose-body)', fontSize: '0.9rem' }}>
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child
            const text = firstText((child.props as any).children)
            if (text.trim().match(/^\[!(NOTE|TIP|WARNING|DANGER|INFO|CAUTION)\]/i)) return null
            return child
          })}
        </div>
      </div>
    )
  }

  return (
    <blockquote style={{
      borderLeft: '3px solid var(--quote-border)',
      paddingLeft: '1rem',
      margin: '1rem 0',
      color: 'var(--prose-quote)',
      fontStyle: 'italic',
    }}>
      {children}
    </blockquote>
  )
}

// ── HR ────────────────────────────────────────────────────────

export function Hr() {
  return (
    <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--prose-hr)' }} />
      <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', letterSpacing: '0.25em' }}>✦ ✦ ✦</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--prose-hr)' }} />
    </div>
  )
}

// ── Lists ─────────────────────────────────────────────────────

const UL_BULLETS = ['●', '◦', '▸', '–']
const UL_SIZES   = ['0.5em', '0.65em', '0.6em', '0.8em']
const UL_TOPS    = ['0.55em', '0.45em', '0.42em', '0.5em']

export function Ul({ children }: any) {
  const depth = React.useContext(ListDepthCtx)
  return (
    <ListDepthCtx.Provider value={depth + 1}>
      <ul style={{ listStyle: 'none', paddingLeft: depth === 0 ? '0.25rem' : '1rem', margin: '0.5rem 0' }}>
        {children}
      </ul>
    </ListDepthCtx.Provider>
  )
}

export function Ol({ children }: any) {
  return (
    <ol className="prose-ol-custom" style={{ paddingLeft: '1.75rem', margin: '0.5rem 0' }}>
      {children}
    </ol>
  )
}

export function Li({ children, ordered }: any) {
  const depth = React.useContext(ListDepthCtx)

  if (ordered) {
    return (
      <li style={{ marginBottom: '0.2rem', lineHeight: 1.65, color: 'var(--prose-body)', paddingLeft: '0.25rem' }}>
        {children}
      </li>
    )
  }

  const idx = Math.min(depth - 1, UL_BULLETS.length - 1)
  const bullet = UL_BULLETS[idx]
  const size   = UL_SIZES[idx]
  const top    = UL_TOPS[idx]

  return (
    <li style={{ marginBottom: '0.2rem', lineHeight: 1.65, color: 'var(--prose-body)', position: 'relative', paddingLeft: '1.25rem' }}>
      <span style={{
        position: 'absolute', left: 0,
        color: depth <= 1 ? 'var(--accent)' : 'var(--text-secondary)',
        fontSize: size, top, lineHeight: 1
      }}>
        {bullet}
      </span>
      {children}
    </li>
  )
}

// ── Table (custom — styled) ───────────────────────────────────

export function Table({ children }: any) {
  return (
    <div style={{
      margin: '1.5rem 0',
      borderRadius: '0.625rem',
      overflow: 'hidden',
      boxShadow: '0 1px 8px rgba(0,0,0,0.12), 0 0 0 1px var(--prose-table-border)',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', margin: 0 }}>
          {children}
        </table>
      </div>
    </div>
  )
}

export function Thead({ children }: any) {
  return (
    <thead style={{
      background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 70%, var(--bg-elevated)) 100%)',
    }}>
      {children}
    </thead>
  )
}

export function Tbody({ children }: any) {
  return <tbody>{children}</tbody>
}

export function Tr({ children }: any) {
  return (
    <tr
      style={{ transition: 'background 0.15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(var(--accent-rgb,59,130,246),0.10)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
    >
      {children}
    </tr>
  )
}

export function Th({ children }: any) {
  return (
    <th style={{
      padding: '0.625rem 1rem',
      textAlign: 'left',
      fontWeight: 700,
      color: '#ffffff',
      fontSize: '0.78rem',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      borderRight: '1px solid rgba(255,255,255,0.15)',
      whiteSpace: 'nowrap',
      lineHeight: 'var(--line-height-body, 1.7)',
    }}>
      {children}
    </th>
  )
}

export function Td({ children }: any) {
  return (
    <td style={{
      padding: '0.5rem 1rem',
      color: 'var(--prose-body)',
      borderTop: '1px solid var(--prose-table-border)',
      borderRight: '1px solid var(--prose-table-border)',
      fontSize: '0.875rem',
      lineHeight: 'var(--line-height-body, 1.7)',
    }}>
      {children}
    </td>
  )
}

// ── Inline ────────────────────────────────────────────────────

export function A({ href, children }: any) {
  const isExternal = href?.startsWith('http')
  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      style={{ color: 'var(--prose-link)', textDecoration: 'underline', textUnderlineOffset: '2px' }}
    >
      {children}
      {isExternal && (
        <span style={{ fontSize: '0.65em', marginLeft: '0.2em', opacity: 0.7, verticalAlign: 'super' }}>↗</span>
      )}
    </a>
  )
}

export function Img({ src, alt }: any) {
  return (
    <figure style={{ margin: '1.25rem 0', width: 'fit-content', maxWidth: '100%' }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ maxWidth: '100%', borderRadius: '0.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', display: 'block' }}
      />
      {alt && (
        <figcaption style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
          {alt}
        </figcaption>
      )}
    </figure>
  )
}

export function Strong({ children }: any) {
  return (
    <strong style={{
      color: 'var(--accent)',
      fontWeight: 700,
      background: 'linear-gradient(transparent 50%, rgba(var(--accent-rgb, 59,130,246),0.30) 50%)',
      WebkitBoxDecorationBreak: 'clone',
      boxDecorationBreak: 'clone',
    } as React.CSSProperties}>
      {children}
    </strong>
  )
}

export function Em({ children }: any) {
  return (
    <em style={{ color: 'var(--prose-link)', fontStyle: 'italic' }}>
      {children}
    </em>
  )
}

export function Del({ children }: any) {
  return (
    <del style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>
      {children}
    </del>
  )
}

export function Input({ checked, ...props }: any) {
  return (
    <input
      type="checkbox"
      checked={checked}
      readOnly
      style={{
        accentColor: 'var(--accent)',
        width: '0.9em',
        height: '0.9em',
        marginRight: '0.4em',
        verticalAlign: 'middle',
        cursor: 'default',
      }}
      {...props}
    />
  )
}
