import './style.css'
import { updateCollusion, toggleMenuVisibility } from './utils'
import { GameState } from './types'
import { DEFAULT_GAME_STATE, NUMBER_OF_ENEMIES } from './constants'
import { backgroundTrack } from './soundbank'
import { Ship } from './player'
import { Spawner } from './spawner'
import { drawBackground, drawHUD, drawPausedMsg, showScoreInput } from './hud'
import { setUpGameEvents } from './menu'

// array to record high scores
let scores: {
  name: string,
  score: number
}[] = []

let gameState: GameState = { ...DEFAULT_GAME_STATE }

// player object
let player: Ship

// to store game loop interval
let interval = 0

// Initialize canvas start
const canvas = document.createElement('canvas')
document.querySelector<HTMLDivElement>('#app')!.appendChild(canvas)
const ctx = canvas.getContext("2d", { willReadFrequently: true })

canvas.width = window.innerWidth
canvas.height = window.innerHeight
//  Initialize canvas end

const spawner = new Spawner(canvas)

const initializePlayer = () => {
  player = spawner.spawnPlayer()
}

const initailizeGame = () => {
  setUpGameEvents(gameState, handleGamePausedEvent, recordScore, canvas, player, startGame, scores)
  drawBackground(ctx!, canvas)
}

const handleGamePausedEvent = () => {
  gameState.paused = !gameState.paused
  if (gameState.paused) {
    backgroundTrack.pause()
    drawPausedMsg(ctx!, canvas)
    clearInterval(interval)
  } else {
    backgroundTrack.play()
    startGameLoop()
  }
}

const initializeEmemyShips = (amount: number) => {
  spawner.enemies = []
  spawner.spawnEnemy(amount)
}

const updateEnemies = () => {
  for (let i = 0; i < NUMBER_OF_ENEMIES; i++) {
    spawner.enemies[i].update(canvas, gameState)
  }
}

const render = () => {
  drawBackground(ctx!, canvas)
  const gameObjects = [
    ...spawner.enemies, player,
    ...player.bullets,
    ...spawner.enemies.flatMap(e => e.weaponsActivated ? e.bullets : []),
    ...spawner.powerUps
  ]
  for (let i = 0; i < gameObjects.length; i++) {
    gameObjects[i].render(ctx!)
  }
  drawHUD(ctx!, canvas, gameState, player, endGame)
  requestAnimationFrame(() => {
    if (gameState.gameInSession && !gameState.paused) render()
  })
}

const increseEnemySpeed = () => {
  gameState.enemySpeed += 0.0001
}

const updateValues = () => {
  spawner.cleanPowerUps()
  const gameObjects = [
    ...spawner.enemies, player,
    ...player.bullets,
    ...spawner.enemies.flatMap(e => e.weaponsActivated ? e.bullets : []),
    ...spawner.powerUps
  ]
  for (let i=0; i<spawner.powerUps.length; i++) {
    spawner.powerUps[i].update(gameState, player)
  }
  updateCollusion(gameObjects, canvas)
  updateEnemies()
  increseEnemySpeed()
  player.update(canvas, gameState)
}

const startGame = () => {
  initializeEmemyShips(NUMBER_OF_ENEMIES)
  initializePlayer()
  gameState.gameInSession = true
  toggleMenuVisibility('.game-menu', 'none')
  backgroundTrack.load()
  backgroundTrack.play()
  startGameLoop()
}

const startGameLoop = () => {
  // start physics loop, refresh based on FPS value
  interval = setInterval(() => {
    if (gameState.paused && !gameState.gameInSession) return
    updateValues()
  }, 1000 / gameState.fps)

  // start rendering loop
  render()
}

const recordScore = () => {
  const scoreInput = document.querySelector('#score-input') as HTMLInputElement
  if (scoreInput.value.length === 4) {
    gameState.gameOver = true
    scores.push({
      name: scoreInput.value.toUpperCase(),
      score: gameState.score
    })
    gameState.gameOver = false
    gameState.score = 0
    toggleMenuVisibility('.score-input', 'none')
    toggleMenuVisibility('.game-menu', 'flex')
  }
}

const endGame = () => {
  backgroundTrack.pause()
  clearInterval(interval)
  drawBackground(ctx!, canvas)
  /* 
    retaining gamescore value to record score
    setting gameOver value to true to record score
  */
  gameState = {
    ...DEFAULT_GAME_STATE,
    score: gameState.score,
    gameOver: true
  }
  showScoreInput()
}

initailizeGame()


