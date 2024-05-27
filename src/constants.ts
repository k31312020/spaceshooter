import { GameState, ObjectType, Targets } from "./types"

export const NUMBER_OF_ENEMIES = 14

export const MAX_HEALTH = 3

export const GAMEOVER_MSG = "GAMEOVER"

export enum OBJECTS {
    player = 'player',
    enemy = 'enemy',
    player_bullet = 'player_bullet',
    enemy_bullet = 'enemy_bullet',
    power_up = 'power_up'
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

export const targets: Record<ObjectType, Targets> = {
    player: [OBJECTS.enemy, OBJECTS.enemy_bullet],
    enemy: [OBJECTS.player, OBJECTS.player_bullet],
    player_bullet: [OBJECTS.enemy, OBJECTS.enemy_bullet],
    enemy_bullet: [OBJECTS.player, OBJECTS.player_bullet],
    power_up: [OBJECTS.player]
} as const