import { GameObject } from "./game_object";
import { Ship } from "./player";
import { GameState, ObjectType } from "./types";

export class Bullet extends GameObject {
    horizontalStep = 0
    verticalStep = -20
    constructor(x: number, y: number, spriteLink: string, objectType: ObjectType, targets: ObjectType[]) {
        super(x, y, spriteLink, objectType, targets)
    }
}

export class PowerUp extends GameObject {
    type:number
    powerUpUsed = false
    collusionSoundPath: string | undefined
    constructor(x: number, y: number, spriteLink: string, objectType: ObjectType, targets: ObjectType[], type: number, collusionSoundPath: string) {
        super (x, y, spriteLink, objectType, targets)
        this.type = type
        this.collusionSoundPath = collusionSoundPath
    }

    playCollusionSound = () => {
        if (this.collusionSoundPath) {
            const sound = new Audio(this.collusionSoundPath) 
            sound.play()
            sound.remove()
        } else {
            throw console.error('!Cannot play sound, collusion sound path not set for ship object');
        }
    }

    update(gameState: GameState, player: Ship) {
        this.y += gameState.enemySpeed
        if (this.collided) {
            this.addPowerUp(gameState, player)
            this.handleCollusion()
        }
    }

    handleCollusion() {
        this.playCollusionSound()
        this.resetObject()
    }

    addPowerUp(gameState: GameState, player: Ship) {
        if (!this.powerUpUsed) {
            switch(this.type) {
                case 0: 
                    player.increaseHealth()
                    break
                case 1: 
                    gameState.score += 5
                    break
                case 2: player.shootMode = 2
                    break
                default:
            }
        }
        this.powerUpUsed = true
    }

    resetObject() {
        this.sprite.remove()
    }
}