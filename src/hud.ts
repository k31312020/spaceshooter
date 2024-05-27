import { GAMEOVER_MSG } from "./constants"
import { Ship } from "./player"
import { GameState } from "./types"
import { drawMessage, toggleMenuVisibility } from "./utils"
import HEART from '/sprites/heart.png'

// initialize sounds start
const heartImg = new Image
heartImg.src = HEART

export const drawHUD = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, gameState: GameState, player: Ship, endGame: () => void) => {
    drawScore(ctx!, canvas, gameState)
    if (player.health > 0) {
        drawHealth(ctx!, canvas, player)
    } else {
        gameState.gameInSession = false
        displayGameoverMsg(ctx!, canvas, endGame)
    }
}

export const displayGameoverMsg = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, endGame: () => void) => {
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

export const drawScore = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, gameState: GameState) => {
    drawMessage(ctx!, {
        fillStyle: "white",
        font: "30px Pixelify Sans",
        message: gameState.score.toString(),
        xPosition: canvas.width * 0.05,
        yPosition: canvas.height * 0.1,
        center: false
    })
}

export const drawBackground = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

export const drawHealth = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, player: Ship) => {
    for (let i = 1; i <= player.health; i++) {
        ctx!.drawImage(heartImg, canvas.width - i * 50, canvas.height * 0.06)
    }
}

export const drawPausedMsg = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    drawMessage(ctx!, {
        fillStyle: 'white',
        font: "100px Pixelify Sans",
        message: 'Paused',
        xPosition: canvas.width / 2,
        yPosition: canvas.height / 2,
        center: true
    })
}

export const showScoreInput = () => {
    toggleMenuVisibility('.score-input', 'block');
    (document.querySelector('#score-input') as HTMLInputElement).value = '';
    (document.querySelector('#score-input') as HTMLElement).focus()
}
