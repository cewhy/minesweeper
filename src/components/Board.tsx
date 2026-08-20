import type { Board, GameStatus } from '../game/types'
import { Cell } from './Cell'

interface BoardProps {
  board: Board
  status: GameStatus
  lastRevealOrigin: { row: number; col: number } | null
  revealGeneration: number
  onReveal: (row: number, col: number) => void
  onFlag: (row: number, col: number) => void
}

export function Board({
  board,
  status,
  lastRevealOrigin,
  revealGeneration,
  onReveal,
  onFlag,
}: BoardProps) {
  const cols = board[0]?.length ?? 0

  return (
    <div
      className={`board${status === 'won' ? ' won' : ''}${status === 'lost' ? ' lost' : ''}`}
      data-cols={cols}
      style={{ gridTemplateColumns: `repeat(${cols}, var(--cell-size))` }}
      role="grid"
      aria-label="扫雷棋盘"
    >
      {board.map((row) =>
        row.map((cell) => (
          <Cell
            key={`${cell.row}-${cell.col}`}
            cell={cell}
            status={status}
            origin={lastRevealOrigin}
            revealGeneration={revealGeneration}
            onReveal={onReveal}
            onFlag={onFlag}
          />
        )),
      )}
    </div>
  )
}
