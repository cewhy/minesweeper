interface ResultBarProps {
  status: 'won' | 'lost'
  canUndo?: boolean
  onUndo?: () => void
  onRetry: () => void
  onMenu: () => void
}

export function ResultBar({
  status,
  canUndo = false,
  onUndo,
  onRetry,
  onMenu,
}: ResultBarProps) {
  const title = status === 'won' ? '胜利' : '踩到地雷'
  const detail =
    status === 'won'
      ? '全部安全格已揭开'
      : canUndo
        ? '可以后退一步，撤销这次点击'
        : '本局结束，可以再试一次'

  return (
    <div className={`result-bar ${status}`} role="status">
      <div className="result-copy">
        <p className="result-title">{title}</p>
        <p className="result-detail">{detail}</p>
      </div>
      <div className={`result-actions${status === 'lost' && canUndo ? ' with-undo' : ''}`}>
        {status === 'lost' && canUndo && onUndo ? (
          <button type="button" className="result-undo" onClick={onUndo}>
            后退一步
          </button>
        ) : null}
        <button type="button" className="result-primary" onClick={onRetry}>
          再来一局
        </button>
        <button type="button" className="result-secondary" onClick={onMenu}>
          返回菜单
        </button>
      </div>
    </div>
  )
}
