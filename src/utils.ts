import { GameObject } from "./ship"

export const NUMBER_OF_ENEMIES = 14

export const MAX_HEALTH = 3

export const GAMEOVER_MSG = "GAMEOVER"

export const PLAYER_BULLET_SRC = "../public/bullet_1.png"

export type ObjectType = 'player' | 'enemy' | 'player_bullet' | 'enemy_bullet' | null
export interface Boundary {
    top: number
    bottom: number
}

export interface GameState {
    score: number,
    health: number,
    enemySpeed: number,
    bulletSpeed: number,
    gameInSession: boolean,
    gameOver: boolean,
    fps: number,
    menuPosition: number,
    paused: boolean
}

export const DEFAULT_GAME_STATE: GameState = {
    score: 0,
    health: MAX_HEALTH,
    enemySpeed: 1,
    bulletSpeed: 20,
    gameInSession: false,
    gameOver: false,
    fps: 60,
    menuPosition: 0,
    paused: false
} as const

export interface TextData {
    fillStyle: string
    font: string
    message: string
    xPosition: number
    yPosition: number
    center: boolean
}
/** 
 * @returns x coordinate offset to 200 units from right side of the screen
 * and y coordinate offset to 100 units from the bottom of the screen
*/
export const getRandomWindowPosition = (canvas: HTMLCanvasElement): { x: number, y: number } => {
    return {
        x: (canvas.width) * 0.1 + Math.random() * (canvas.width) * 0.7,
        y: -Math.random() * (canvas.height) * 2
    }
}

export const getShipSpriteLink = (shipIndex: number) => {
    return `../public/ship_${shipIndex}.png`
}

export const checkBounds = (gameObject: GameObject, bounds: Boundary) => {
    return (gameObject.y < bounds.top ||
        gameObject.y > bounds.bottom)
}

export const updateCollusion = (gameObjects: GameObject[], canvas: HTMLCanvasElement) => {
    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].collided = !!gameObjects.find(object => {
            return (((gameObjects[i].x < object.x) && ((gameObjects[i].x + gameObjects[i].sprite.width) > object.x)
                && (gameObjects[i].y < object.y) && ((gameObjects[i].y + gameObjects[i].sprite.height) > object.y))
                || ((gameObjects[i].x > object.x) && (gameObjects[i].x < (object.x + object.sprite.width))
                    && (gameObjects[i].y > object.y) && (gameObjects[i].y < (object.y + object.sprite.height))))
                && (gameObjects[i].targets.includes(object.objectType))
        })
        // checking if the object is out of bounds in the same loop to avoid looping again over objects
        gameObjects[i].outOfBounds = gameObjects[i].checkBounds({ top: 0, bottom: canvas.height })
    }
}

export const getRandom = (min: number, max: number) => {
    return min + Math.floor(Math.random() * max)
}

export const toggleMenuVisibility = (selector: string, visibilityValue: string) => {
    const menu = document.querySelector(selector) as HTMLElement
    menu.style.display = visibilityValue
}

export const drawMessage = (ctx: CanvasRenderingContext2D, textData: TextData) => {
    ctx.fillStyle = textData.fillStyle
    ctx.font = textData.font
    const textWidth = ctx!.measureText(textData.message).width
    ctx!.fillText(
        textData.message,
        textData.xPosition - (textData.center ? textWidth / 2 : 0),
        textData.yPosition)
}

export const visibility = (selector: string) => {
    const menu = document.querySelector(selector) as HTMLElement
    return menu.style.display !== 'none'
}
