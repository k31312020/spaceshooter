import { Ship } from "./player"
import { mechSound } from "./soundbank"
import { GameState } from "./types"
import { toggleMenuVisibility, visibility } from "./utils"

export const setUpGameEvents = (
    gameState: GameState,
    handleGamePausedEvent: () => void,
    recordScore: () => void,
    canvas: HTMLCanvasElement,
    player: Ship,
    startGame: () => void,
    scores: {
        name: string,
        score: number
    }[]
) => {
    // setup menu events
    document.addEventListener('keydown', (e) => {
        if (visibility('.game-menu')) {
            return handleMainMenuEvents(e.code, gameState, startGame, scores)
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
        if (gameState.gameInSession) playerShoot(player)
    })
}

const playerShoot = (player: Ship) => player.addBullet()


const handleMainMenuEvents = (key: string, gameState: GameState, startGame: () => void, scores: {
    name: string,
    score: number
}[]) => {
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

