import { OBJECTS } from "./constants"
import { Bullet } from "./objects"
import { Ship } from "./player"
import { Spawner } from "./spawner"
import { GameState, ObjectType } from "./types"
import { getRandom, getRandomWindowPosition } from "./utils"

export class EnemyShip extends Ship {
    weaponCoolDownTime = getRandom(30,80)
    speed = 1
    weaponsActivated = false
    spawner: Spawner
    constructor(
        x: number, 
        y: number, 
        spriteLink: string, 
        objectType: ObjectType, 
        targets: ObjectType[], 
        spawner: Spawner,
        bulletSoundPath?: string, 
        collusionSoundPath?: string, 
        bulletSpriteLink?: string, 
        weaponsActivated?: boolean
    ) {
        super(x, y, spriteLink, objectType, targets, bulletSoundPath, collusionSoundPath, bulletSpriteLink)
        this.weaponsActivated = weaponsActivated || false
        this.spawner = spawner
    }

    update = (canvas: HTMLCanvasElement, gameState: GameState) => {
        this.y += this.speed
        this.weaponCoolDownTime--
        if (this.outOfBounds) {
            this.resetObject(canvas)
        }
        if (this.collided) {
            gameState.score++
            this.spawnPowerUp()
            this.handleCollusion(canvas)
        }
        if (this.weaponCoolDownTime === 0 && this.weaponsActivated) {
            this.addBullet()
        }
        if (this.bullets.length) {
            this.updateBullets(gameState.bulletSpeed)
        }
    }

    spawnPowerUp() {
        const lucky = getRandom(0, 10) > 6
        if (!this.outOfBounds && lucky) {
            this.spawner.spawnPowerUp(this.x, this.y)
        }
    }

    addBullet = () => {
        if (this.bulletSpriteLink) {
            this.weaponCoolDownTime = 60
            this.bullets.push(new Bullet(
                this.x + this.sprite.width/2, 
                this.y + this.sprite.height, 
                this.bulletSpriteLink, 
                OBJECTS.enemy_bullet, this.targets))
        }   else {
            throw console.error('!Cannot add bullets, bullet sprite path not set for ship object');
        }
    }

    updateBullets = (bulletSpeed: number) => {
        // remove bullets which have collided and are out of bounds
        this.bullets = this.bullets.filter(bullet => !bullet.collided && !bullet.outOfBounds)
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].y += bulletSpeed
        }
    }

    resetObject = (canvas:HTMLCanvasElement) => {
        this.collided = false
        this.outOfBounds = false
        this.speed = getRandom(1.5, 3, true)
        this.setPosition(getRandomWindowPosition(canvas))
    }
}