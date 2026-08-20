import { useMemo, useState } from 'react'
import {
  CUSTOM_LIMITS,
  DIFFICULTIES,
  clampCustomConfig,
  maxMinesFor,
  type DifficultyKey,
  type GameConfig,
} from '../game/types'

interface StartScreenProps {
  onStart: (config: GameConfig) => void
}

type PresetKey = Exclude<DifficultyKey, 'custom'>

export function StartScreen({ onStart }: StartScreenProps) {
  const [selected, setSelected] = useState<DifficultyKey>('beginner')
  const [rows, setRows] = useState(9)
  const [cols, setCols] = useState(9)
  const [mines, setMines] = useState(10)

  const mineCap = useMemo(() => maxMinesFor(rows, cols), [rows, cols])

  const selectPreset = (key: PresetKey) => {
    setSelected(key)
    const d = DIFFICULTIES[key]
    setRows(d.rows)
    setCols(d.cols)
    setMines(d.mines)
  }

  const selectCustom = () => {
    setSelected('custom')
  }

  const handleStart = () => {
    if (selected === 'custom') {
      onStart(clampCustomConfig(rows, cols, mines))
    } else {
      onStart(DIFFICULTIES[selected])
    }
  }

  const presets = Object.keys(DIFFICULTIES) as PresetKey[]

  return (
    <section className="start-screen">
      <div className="start-hero">
        <h1 className="brand start-brand">Mines</h1>
        <p className="tagline">揭开安全格，避开地雷。</p>
      </div>

      <div className="start-panel">
        <p className="start-label">选择难度</p>
        <div className="start-presets" role="group" aria-label="难度">
          {presets.map((key) => {
            const d = DIFFICULTIES[key]
            return (
              <button
                key={key}
                type="button"
                className={`preset-card${selected === key ? ' active' : ''}`}
                onClick={() => selectPreset(key)}
              >
                <span className="preset-name">{d.label}</span>
                <span className="preset-meta">
                  {d.rows}×{d.cols} · {d.mines} 雷
                </span>
              </button>
            )
          })}
          <button
            type="button"
            className={`preset-card${selected === 'custom' ? ' active' : ''}`}
            onClick={selectCustom}
          >
            <span className="preset-name">自定义</span>
            <span className="preset-meta">自由设定棋盘与雷数</span>
          </button>
        </div>

        {selected === 'custom' ? (
          <div className="custom-fields">
            <label className="field">
              <span>行数</span>
              <input
                type="number"
                min={CUSTOM_LIMITS.rows.min}
                max={CUSTOM_LIMITS.rows.max}
                value={rows}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setRows(v)
                  setMines((m) => Math.min(m, maxMinesFor(v, cols)))
                }}
              />
            </label>
            <label className="field">
              <span>列数</span>
              <input
                type="number"
                min={CUSTOM_LIMITS.cols.min}
                max={CUSTOM_LIMITS.cols.max}
                value={cols}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setCols(v)
                  setMines((m) => Math.min(m, maxMinesFor(rows, v)))
                }}
              />
            </label>
            <label className="field">
              <span>雷数</span>
              <input
                type="number"
                min={CUSTOM_LIMITS.minesMin}
                max={mineCap}
                value={Math.min(mines, mineCap)}
                onChange={(e) => setMines(Number(e.target.value))}
              />
            </label>
            <p className="custom-hint">
              范围 {CUSTOM_LIMITS.rows.min}–{CUSTOM_LIMITS.rows.max} 行/列，雷数最多{' '}
              {mineCap}
            </p>
          </div>
        ) : null}

        <button type="button" className="start-cta" onClick={handleStart}>
          开始游戏
        </button>
      </div>
    </section>
  )
}
