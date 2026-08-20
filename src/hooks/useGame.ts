import { useCallback, useEffect, useRef, useState } from 'react'
import {
  checkWin,
  countFlags,
  createEmptyBoard,
  hasExplodedMine,
  placeMines,
  reveal,
  cycleMark,
} from '../game/engine'
import {
  DIFFICULTIES,
  type Board,
  type GameConfig,
  type GameStatus,
} from '../game/types'

const DEFAULT_CONFIG = DIFFICULTIES.beginner

function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell })))
}

export function useGame(initialConfig: GameConfig = DEFAULT_CONFIG) {
  const [config, setConfig] = useState<GameConfig>(initialConfig)
  const [board, setBoard] = useState<Board>(() =>
    createEmptyBoard(initialConfig),
  )
  const [status, setStatus] = useState<GameStatus>('ready')
  const [minesPlaced, setMinesPlaced] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [lastRevealOrigin, setLastRevealOrigin] = useState<{
    row: number
    col: number
  } | null>(null)
  const [revealGeneration, setRevealGeneration] = useState(0)
  const [canUndoLoss, setCanUndoLoss] = useState(false)
  const undoSnapshotRef = useRef<Board | null>(null)
  const timerRef = useRef<number | null>(null)

  const remainingMines = config.mines - countFlags(board)

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    if (timerRef.current !== null) return
    timerRef.current = window.setInterval(() => {
      setElapsed((t) => t + 1)
    }, 1000)
  }, [])

  useEffect(() => () => stopTimer(), [stopTimer])

  const clearUndo = useCallback(() => {
    undoSnapshotRef.current = null
    setCanUndoLoss(false)
  }, [])

  const startWith = useCallback(
    (next: GameConfig) => {
      stopTimer()
      clearUndo()
      setConfig(next)
      setBoard(createEmptyBoard(next))
      setStatus('ready')
      setMinesPlaced(false)
      setElapsed(0)
      setLastRevealOrigin(null)
      setRevealGeneration(0)
    },
    [clearUndo, stopTimer],
  )

  const reset = useCallback(() => {
    startWith(config)
  }, [config, startWith])

  const undoLoss = useCallback(() => {
    const snapshot = undoSnapshotRef.current
    if (!snapshot || status !== 'lost') return

    setBoard(cloneBoard(snapshot))
    setStatus('playing')
    setLastRevealOrigin(null)
    clearUndo()
    startTimer()
  }, [clearUndo, startTimer, status])

  const handleReveal = useCallback(
    (row: number, col: number) => {
      if (status === 'won' || status === 'lost') return

      const cell = board[row][col]
      if (cell.revealed || cell.mark === 'flag') return

      let working = board

      if (!minesPlaced) {
        working = placeMines(board, config.mines, row, col)
        setMinesPlaced(true)
        setStatus('playing')
        startTimer()
      }

      // Snapshot before this reveal — used only if this click hits a mine
      const beforeReveal = cloneBoard(working)
      const nextBoard = reveal(working, row, col)
      setBoard(nextBoard)
      setLastRevealOrigin({ row, col })
      setRevealGeneration((g) => g + 1)

      if (hasExplodedMine(nextBoard)) {
        undoSnapshotRef.current = beforeReveal
        setCanUndoLoss(true)
        setStatus('lost')
        stopTimer()
        return
      }

      clearUndo()

      if (checkWin(nextBoard)) {
        setStatus('won')
        stopTimer()
      }
    },
    [
      board,
      clearUndo,
      config.mines,
      minesPlaced,
      startTimer,
      status,
      stopTimer,
    ],
  )

  const handleFlag = useCallback(
    (row: number, col: number) => {
      if (status === 'won' || status === 'lost') return
      const cell = board[row][col]
      if (cell.revealed) return
      setBoard(cycleMark(board, row, col))
    },
    [board, status],
  )

  return {
    board,
    config,
    status,
    elapsed,
    remainingMines,
    lastRevealOrigin,
    revealGeneration,
    canUndoLoss,
    startWith,
    reset,
    undoLoss,
    handleReveal,
    handleFlag,
  }
}
