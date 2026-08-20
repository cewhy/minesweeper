import type { Board, Cell, CellMark, Difficulty } from './types'

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

const MARK_CYCLE: Record<CellMark, CellMark> = {
  none: 'flag',
  flag: 'question',
  question: 'none',
}

function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell })))
}

export function createEmptyBoard(difficulty: Difficulty): Board {
  const { rows, cols } = difficulty
  const board: Board = []
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = []
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        mine: false,
        adjacent: 0,
        revealed: false,
        mark: 'none',
        exploded: false,
      })
    }
    board.push(row)
  }
  return board
}

function inBounds(board: Board, row: number, col: number): boolean {
  return row >= 0 && row < board.length && col >= 0 && col < board[0].length
}

function neighbors(board: Board, row: number, col: number): Cell[] {
  const result: Cell[] = []
  for (const [dr, dc] of DIRS) {
    const nr = row + dr
    const nc = col + dc
    if (inBounds(board, nr, nc)) {
      result.push(board[nr][nc])
    }
  }
  return result
}

function isSafeZone(
  row: number,
  col: number,
  safeRow: number,
  safeCol: number,
): boolean {
  return Math.abs(row - safeRow) <= 1 && Math.abs(col - safeCol) <= 1
}

function computeAdjacents(board: Board): void {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c].mine) {
        board[r][c].adjacent = 0
        continue
      }
      board[r][c].adjacent = neighbors(board, r, c).filter((n) => n.mine).length
    }
  }
}

/** Place mines after first click; keep the 3x3 around the click mine-free. */
export function placeMines(
  board: Board,
  mineCount: number,
  safeRow: number,
  safeCol: number,
): Board {
  const next = cloneBoard(board)
  const candidates: Array<[number, number]> = []

  for (let r = 0; r < next.length; r++) {
    for (let c = 0; c < next[r].length; c++) {
      if (!isSafeZone(r, c, safeRow, safeCol)) {
        candidates.push([r, c])
      }
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }

  const toPlace = Math.min(mineCount, candidates.length)
  for (let i = 0; i < toPlace; i++) {
    const [r, c] = candidates[i]
    next[r][c].mine = true
  }

  computeAdjacents(next)
  return next
}

export function reveal(board: Board, row: number, col: number): Board {
  const next = cloneBoard(board)
  const start = next[row][col]

  // Flags block reveal; question marks can be opened
  if (start.revealed || start.mark === 'flag') {
    return next
  }

  start.mark = 'none'

  if (start.mine) {
    start.revealed = true
    start.exploded = true
    for (const rowCells of next) {
      for (const cell of rowCells) {
        if (cell.mine) {
          cell.revealed = true
        }
      }
    }
    return next
  }

  const queue: Array<[number, number]> = [[row, col]]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const [r, c] = queue.shift()!
    const key = `${r},${c}`
    if (visited.has(key)) continue
    visited.add(key)

    const cell = next[r][c]
    if (cell.mark === 'flag' || cell.revealed || cell.mine) continue

    cell.mark = 'none'
    cell.revealed = true

    if (cell.adjacent === 0) {
      for (const n of neighbors(next, r, c)) {
        const nKey = `${n.row},${n.col}`
        if (!visited.has(nKey) && !n.revealed && n.mark !== 'flag') {
          queue.push([n.row, n.col])
        }
      }
    }
  }

  return next
}

/** Cycle mark: none → flag → question → none */
export function cycleMark(board: Board, row: number, col: number): Board {
  const next = cloneBoard(board)
  const cell = next[row][col]
  if (cell.revealed) return next
  cell.mark = MARK_CYCLE[cell.mark]
  return next
}

/** @deprecated use cycleMark */
export const toggleFlag = cycleMark

export function checkWin(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.mine && !cell.revealed) {
        return false
      }
    }
  }
  return true
}

export function countFlags(board: Board): number {
  let count = 0
  for (const row of board) {
    for (const cell of row) {
      if (cell.mark === 'flag') count++
    }
  }
  return count
}

export function hasExplodedMine(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell.exploded) return true
    }
  }
  return false
}

export function revealDelayIndex(
  cell: Cell,
  originRow: number,
  originCol: number,
): number {
  return Math.abs(cell.row - originRow) + Math.abs(cell.col - originCol)
}
