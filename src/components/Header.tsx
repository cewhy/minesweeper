import type { GameConfig } from '../game/types'

interface HeaderProps {
  config: GameConfig
  remainingMines: number
  elapsed: number
  onReset: () => void
  onMenu: () => void
}

function formatTime(seconds: number): string {
  return String(Math.min(seconds, 999)).padStart(3, '0')
}

function formatMines(n: number): string {
  const clamped = Math.max(-99, Math.min(n, 999))
  return String(clamped).padStart(3, '0')
}

export function Header({
  config,
  remainingMines,
  elapsed,
  onReset,
  onMenu,
}: HeaderProps) {
  return (
    <header className="header in-game">
      <div className="brand-block compact">
        <p className="brand compact-brand">Mines</p>
        <p className="mode-chip">
          {config.label}
          <span>
            {config.rows}×{config.cols} · {config.mines} 雷
          </span>
        </p>
      </div>

      <div className="hud">
        <div className="meter" aria-label={`剩余雷数 ${remainingMines}`}>
          <span className="meter-label">雷</span>
          <span className="meter-value">{formatMines(remainingMines)}</span>
        </div>

        <button
          type="button"
          className="reset-btn"
          onClick={onReset}
          aria-label="重新开始本局"
          title="重新开始"
        >
          重开
        </button>

        <div className="meter" aria-label={`用时 ${elapsed} 秒`}>
          <span className="meter-label">时</span>
          <span className="meter-value">{formatTime(elapsed)}</span>
        </div>
      </div>

      <div className="header-actions">
        <button type="button" className="menu-btn" onClick={onMenu}>
          返回菜单
        </button>
      </div>
    </header>
  )
}
