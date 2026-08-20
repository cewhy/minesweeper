import type { ReactNode } from 'react'
import { revealDelayIndex } from '../game/engine'
import type { Cell as CellType } from '../game/types'

interface CellProps {
  cell: CellType
  status: 'ready' | 'playing' | 'won' | 'lost'
  origin: { row: number; col: number } | null
  revealGeneration: number
  onReveal: (row: number, col: number) => void
  onFlag: (row: number, col: number) => void
}

export function Cell({
  cell,
  status,
  origin,
  revealGeneration,
  onReveal,
  onFlag,
}: CellProps) {
  const delay =
    cell.revealed && origin
      ? revealDelayIndex(cell, origin.row, origin.col)
      : 0

  const classes = ['cell']
  if (cell.revealed) classes.push('revealed')
  if (!cell.revealed && cell.mark === 'flag') classes.push('flagged')
  if (!cell.revealed && cell.mark === 'question') classes.push('questioned')
  if (cell.mine && cell.revealed) classes.push('mine')
  if (cell.exploded) classes.push('exploded')
  if (status === 'lost' && cell.mine && cell.revealed) classes.push('show-mine')
  if (cell.revealed && !cell.mine && cell.adjacent > 0) {
    classes.push(`n${cell.adjacent}`)
  }

  const isMineReveal = status === 'lost' && cell.mine && cell.revealed

  let content: ReactNode = null
  if (!cell.revealed && cell.mark === 'flag') {
    content = <span className="flag" aria-hidden>⚑</span>
  } else if (!cell.revealed && cell.mark === 'question') {
    content = <span className="question" aria-hidden>?</span>
  } else if (cell.revealed && cell.mine) {
    content = <span className="bomb" aria-hidden>●</span>
  } else if (cell.revealed && cell.adjacent > 0) {
    content = cell.adjacent
  }

  const label = cell.revealed
    ? cell.mine
      ? '地雷'
      : cell.adjacent > 0
        ? `周围 ${cell.adjacent} 颗雷`
        : '空白'
    : cell.mark === 'flag'
      ? '已插旗'
      : cell.mark === 'question'
        ? '问号标记'
        : '未揭开'

  return (
    <button
      type="button"
      className={classes.join(' ')}
      style={
        cell.revealed
          ? {
              animationDelay: isMineReveal
                ? `${delay * 45}ms`
                : `${delay * 28}ms`,
              ['--gen' as string]: String(revealGeneration),
            }
          : undefined
      }
      aria-label={label}
      disabled={status === 'won' || status === 'lost'}
      onClick={() => onReveal(cell.row, cell.col)}
      onContextMenu={(e) => {
        e.preventDefault()
        onFlag(cell.row, cell.col)
      }}
    >
      {content}
    </button>
  )
}
