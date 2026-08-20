export type GameStatus = 'ready' | 'playing' | 'won' | 'lost'

export type DifficultyKey = 'beginner' | 'intermediate' | 'expert' | 'custom'

export interface GameConfig {
  key: DifficultyKey
  label: string
  rows: number
  cols: number
  mines: number
}

/** @deprecated alias — prefer GameConfig */
export type Difficulty = GameConfig

/** none → flag → question → none (right-click cycle) */
export type CellMark = 'none' | 'flag' | 'question'

export interface Cell {
  row: number
  col: number
  mine: boolean
  adjacent: number
  revealed: boolean
  mark: CellMark
  exploded: boolean
}

export type Board = Cell[][]

export const DIFFICULTIES: Record<
  Exclude<DifficultyKey, 'custom'>,
  GameConfig
> = {
  beginner: { key: 'beginner', label: '初级', rows: 9, cols: 9, mines: 10 },
  intermediate: {
    key: 'intermediate',
    label: '中级',
    rows: 16,
    cols: 16,
    mines: 40,
  },
  expert: { key: 'expert', label: '高级', rows: 16, cols: 30, mines: 99 },
}

export const CUSTOM_LIMITS = {
  rows: { min: 5, max: 30 },
  cols: { min: 5, max: 30 },
  /** At least 9 cells reserved for first-click safe zone when possible */
  minesMin: 1,
} as const

export function maxMinesFor(rows: number, cols: number): number {
  const cells = rows * cols
  const reserved = Math.min(9, cells - 1)
  return Math.max(CUSTOM_LIMITS.minesMin, cells - reserved)
}

export function clampCustomConfig(
  rows: number,
  cols: number,
  mines: number,
): GameConfig {
  const r = clamp(
    Math.round(rows),
    CUSTOM_LIMITS.rows.min,
    CUSTOM_LIMITS.rows.max,
  )
  const c = clamp(
    Math.round(cols),
    CUSTOM_LIMITS.cols.min,
    CUSTOM_LIMITS.cols.max,
  )
  const maxM = maxMinesFor(r, c)
  const m = clamp(Math.round(mines), CUSTOM_LIMITS.minesMin, maxM)
  return {
    key: 'custom',
    label: '自定义',
    rows: r,
    cols: c,
    mines: m,
  }
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min
  return Math.min(max, Math.max(min, n))
}
