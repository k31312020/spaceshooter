import { OBJECTS } from "./constants"

export type ObjectType = keyof typeof OBJECTS

export type Targets = ObjectType[]
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

export interface TextData {
    fillStyle: string
    font: string
    message: string
    xPosition: number
    yPosition: number
    center: boolean
}

export type SoundType = 'oncollusion' | 'oncreation' | 'ondestroy'

