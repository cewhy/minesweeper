import { useState } from 'react'
import { Board } from './components/Board'
import { Header } from './components/Header'
import { ResultBar } from './components/ResultBar'
import { StartScreen } from './components/StartScreen'
import { useGame } from './hooks/useGame'
import type { GameConfig } from './game/types'
import './App.css'

type Screen = 'start' | 'game'

function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const game = useGame()

  const handleStart = (config: GameConfig) => {
    game.startWith(config)
    setScreen('game')
  }

  const handleMenu = () => {
    game.reset()
    setScreen('start')
  }

  const ended = game.status === 'won' || game.status === 'lost'

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden />
      <main className={`shell${screen === 'start' ? ' shell-start' : ''}`}>
        {screen === 'start' ? (
          <StartScreen onStart={handleStart} />
        ) : (
          <>
            <Header
              config={game.config}
              remainingMines={game.remainingMines}
              elapsed={game.elapsed}
              onReset={game.reset}
              onMenu={handleMenu}
            />

            <section className="board-wrap">
              <Board
                board={game.board}
                status={game.status}
                lastRevealOrigin={game.lastRevealOrigin}
                revealGeneration={game.revealGeneration}
                onReveal={game.handleReveal}
                onFlag={game.handleFlag}
              />
              {ended && (game.status === 'won' || game.status === 'lost') ? (
                <ResultBar
                  status={game.status}
                  canUndo={game.canUndoLoss}
                  onUndo={game.undoLoss}
                  onRetry={game.reset}
                  onMenu={handleMenu}
                />
              ) : null}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default App
