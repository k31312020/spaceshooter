import { OBJECTS, targets } from "./constants"
import { EnemyShip } from "./enemy"
import { PowerUp } from "./objects"
import { Ship } from "./player"
import { getRandom, getRandomWindowPosition, getShipSpriteLink } from "./utils"
import BULLET_SOUND from '/sounds/bullet_1_sound.wav'
import SHIP_DESTROY from '/sounds/explosion-6055.mp3'
import PLAYER_BULLET_SRC from '/sprites/bullet_1.png'


export const powerUpLinks = ['./sprites/power_health.png', './sprites/power_points.png', './sprites/power_weapon.png']

export class Spawner {
    canvas: HTMLCanvasElement
    powerUps: PowerUp[] = []
    enemies: EnemyShip[] = []

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
    }

    cleanPowerUps() {
        this.powerUps = this.powerUps.filter(pup => !pup.outOfBounds && !pup.powerUpUsed)
    }

    spawnPowerUp(x: number, y: number) {
        const random = getRandom(0, 31)
        const powerUpType = (random > 0 && random < 30) ? 1 : random === 30 ? 2 : random
        this.powerUps.push(new PowerUp(x, y, powerUpLinks[powerUpType], OBJECTS.power_up, targets.power_up, powerUpType, '/sounds/beep.mp3'))
    }

    spawnPlayer() {
        return new Ship(
            this.canvas.width / 2,
            this.canvas.height * 0.9,
            getShipSpriteLink(0),
            OBJECTS.player, targets.player,
            BULLET_SOUND,
            SHIP_DESTROY,
            PLAYER_BULLET_SRC
        )
    }

    spawnEnemy(amount: number) {
        for (let i = 0; i < amount; i++) {
            // random enemy position
            const { x, y } = getRandomWindowPosition(this.canvas)
            // random enemy sprite
            const enemySpriteIndex = getRandom(1, 5)
            const enemy = new EnemyShip(
                x, y,
                getShipSpriteLink(enemySpriteIndex),
                OBJECTS.enemy,
                targets.enemy,
                this,
                BULLET_SOUND,
                SHIP_DESTROY,
                PLAYER_BULLET_SRC,
                enemySpriteIndex === 4
            )
            //randomize enemy speed
            enemy.speed = getRandom(1.5, 3, true)
            this.enemies.push(enemy)
        }
    }
}