import { EnemyShip, Ship } from './ship'
import './style.css'
import { GAMEOVER_MSG, NUMBER_OF_ENEMIES, updateCollusion, getRandomWindowPosition, getShipSpriteLink, DEFAULT_GAME_STATE, GameState, getRandom, toggleMenuVisibility, drawMessage, visibility } from './utils'
import HEART from '/sprites/heart.png'
import PLAYER_BULLET_SRC from '/sprites/bullet_1.png'
import SHIP_DESTROY from '/sounds/explosion-6055.mp3'
import BULLET_SOUND from '/sounds/bullet_1_sound.wav'
import MECH_KEYBOARD_SOUND from '/sounds/mech-keyboard-02-102918.mp3'
import BACKGROUND_TRACK from '/sounds/stardust-danijel-zambo-main-version-03-13-1372.mp3'

// array to record high scores
let scores: {
  name: string,
  score: number
}[] = []

let gameState: GameState = { ...DEFAULT_GAME_STATE }

// initialize sounds start
const heartImg = new Image
heartImg.src = HEART

const mechSound = new Audio
mechSound.src = MECH_KEYBOARD_SOUND

const backgroundTrack = new Audio
backgroundTrack.src = BACKGROUND_TRACK
backgroundTrack.loop = true
// initialize sounds end

// to store game loop interval
let interval = 0

// Initialize canvas start
const canvas = document.createElement('canvas')
document.querySelector<HTMLDivElement>('#app')!.appendChild(canvas)
const ctx = canvas.getContext("2d", { willReadFrequently: true })

canvas.width = window.innerWidth
canvas.height = window.innerHeight
//  Initialize canvas end

// list to store enemies
let enemies: EnemyShip[] = []
// player object
let player: Ship

const initializePlayer = () => {
  player = new Ship(canvas.width / 2, canvas.height*0.9, getShipSpriteLink(0), 'player', ['enemy', 'enemy_bullet'], BULLET_SOUND, SHIP_DESTROY, PLAYER_BULLET_SRC)
}

const initailizeGame = () => {
  setUpGameEvents()
  drawBackground()
}

const handleMainMenuEvents = (key: string) => {
  // moving between options in main menu
  switch (key) {
    case 'ArrowUp':
      gameState.menuPosition = gameState.menuPosition === 0 ? 2 : gameState.menuPosition - 1
      break
    case 'ArrowDown':
      gameState.menuPosition = gameState.menuPosition === 2 ? 0 : gameState.menuPosition + 1
      break
    case 'Enter':
      if (gameState.menuPosition === 0) {
        startGame()
      } else if (gameState.menuPosition === 1) {
        toggleMenuVisibility('.game-menu', 'none')
        toggleMenuVisibility('.leaderboard', 'block')
        const tableBody = document.querySelector('tbody')
        tableBody!.innerHTML = ''
        scores.forEach(s => {
          tableBody!.innerHTML += `<tr><td>${s.name}</td><td>${s.score}</td></tr>`
        })
      } else if (gameState.menuPosition === 2) {
        toggleMenuVisibility('.game-menu', 'none')
        toggleMenuVisibility('.credits', 'block')
      }
      break
    default:
      return
  }
  mechSound.load()
  mechSound.play()
  const menuArrows = document.querySelectorAll('.menu-arrow')
  menuArrows.forEach((item, index) => {
    item.innerHTML = (index === gameState.menuPosition) ? '>' : '&nbsp'
  })
}

const setUpGameEvents = () => {
  // setup menu events
  document.addEventListener('keydown', (e) => {
    if (visibility('.game-menu')) {
      return handleMainMenuEvents(e.code)
    } else if (e.code === 'Enter' && visibility('.score-input')) {
      recordScore()
    } else if (e.code === 'Escape' && gameState.gameInSession) {
      handleGamePausedEvent()
    } else if (e.code === 'Escape' && !gameState.gameInSession) {
      toggleMenuVisibility('.game-menu', 'flex')
      if (gameState.menuPosition === 1) {
        toggleMenuVisibility('.leaderboard', 'none')
      } else if (gameState.menuPosition === 2) {
        toggleMenuVisibility('.credits', 'none')
      }
    }
  })

  // play mech sound when score input is changed
  document.querySelector('#score-input')?.addEventListener('input', () => {
    if (!gameState.gameInSession && gameState.gameOver) {
      mechSound.load()
      mechSound.play()
    }
  })
  // disable right click 
  document.addEventListener('contextmenu', event => event.preventDefault());
  // update player x position when mouse moves
  canvas.addEventListener('mousemove', (event) => {
    if (gameState.gameInSession) player.setPosition({ x: event.clientX, y: event.clientY })
  })
  // allow the player to shoot on left click
  canvas.addEventListener('click', () => {
    if (gameState.gameInSession) playerShoot()
  })
}

const handleGamePausedEvent = () => {
  gameState.paused = !gameState.paused
  if (gameState.paused) {
    backgroundTrack.pause()
    drawPausedMsg()
    clearInterval(interval)
  } else {
    backgroundTrack.play()
    startGameLoop()
  }
}

const playerShoot = () => player.addBullet()

const initializeEmemyShips = (amount: number) => {
  enemies = []
  for (let i = 0; i < amount; i++) {
    const { x, y } = getRandomWindowPosition(canvas)
    const enemySpriteIndex = getRandom(1, 5)
    enemies.push(new EnemyShip(x, y, getShipSpriteLink(enemySpriteIndex), 'enemy', ['player', 'player_bullet'], BULLET_SOUND, SHIP_DESTROY, PLAYER_BULLET_SRC, enemySpriteIndex === 4))
  }
}

const updateEnemies = () => {
  for (let i = 0; i < NUMBER_OF_ENEMIES; i++) {
    enemies[i].update(canvas, gameState)
  }
}

const drawHUD = () => {
  drawScore()
  if (player.health > 0) {
    updateHealth()
  } else {
    gameState.gameInSession = false
    displayGameoverMsg()
  }
}

const displayGameoverMsg = () => {
  drawMessage(ctx!, {
    fillStyle: "white",
    font: "100px Pixelify Sans",
    message: GAMEOVER_MSG,
    xPosition: canvas.width / 2,
    yPosition: canvas.height / 2,
    center: true
  })
  setTimeout(() => endGame(), 3000)
}

const updateHealth = () => {
  for (let i = 1; i <= player.health; i++) {
    ctx!.drawImage(heartImg, canvas.width - i * 50, canvas.height * 0.06)
  }
}

const drawScore = () => {
  drawMessage(ctx!, {
    fillStyle: "white",
    font: "30px Pixelify Sans",
    message: gameState.score.toString(),
    xPosition: canvas.width * 0.05,
    yPosition: canvas.height * 0.1,
    center: false
  })
}

const drawBackground = () => {
  ctx!.fillStyle = "black"
  ctx!.fillRect(0, 0, canvas.width, canvas.height)
}

const render = () => {
  drawBackground()
  const gameObjects = [
    ...enemies, player,
    ...player.bullets,
    ...enemies.flatMap(e => e.weaponsActivated ? e.bullets : [])
  ]
  for (let i = 0; i < gameObjects.length; i++) {
    gameObjects[i].render(ctx!)
  }
  drawHUD()
  requestAnimationFrame(() => {
    if (gameState.gameInSession && !gameState.paused) render()
  })
}

const increseEnemySpeed = () => {
  gameState.enemySpeed += 0.0001
}

const updateValues = () => {
  const gameObjects = [
    ...enemies, player,
    ...player.bullets,
    ...enemies.flatMap(e => e.weaponsActivated ? e.bullets : [])
  ]
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
  backgroundTrack.volume = 0.6
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

const drawPausedMsg = () => {
  drawMessage(ctx!, {
    fillStyle: 'white',
    font: "100px Pixelify Sans",
    message: 'Paused',
    xPosition: canvas.width / 2,
    yPosition: canvas.height / 2,
    center: true
  })
}

const showScoreInput = () => {
  toggleMenuVisibility('.score-input', 'block');
  (document.querySelector('#score-input') as HTMLInputElement).value = '';
  (document.querySelector('#score-input') as HTMLElement).focus()
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
  drawBackground()
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


