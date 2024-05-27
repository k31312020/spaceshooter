import { GameObject } from "./game_object"
import { Bullet } from "./objects"
import { Boundary, GameState, ObjectType } from "./types"

export class Ship extends GameObject {
    hit: boolean = false
    destroyAnimation = 0
    bullets: Bullet[] = []
    bulletSpriteLink: string | undefined
    bulletSoundPath: string | undefined
    collusionSoundPath: string | undefined
    health: number = 3
    shootMode: number = 1

    constructor(x: number, y: number, spriteLink: string, objectType: ObjectType, targets: ObjectType[], bulletSoundPath?: string, collusionSoundPath?: string, bulletSpriteLink?: string) {
        super(x, y, spriteLink, objectType, targets)
        this.bulletSoundPath = bulletSoundPath
        this.collusionSoundPath = collusionSoundPath
        this.bulletSpriteLink = bulletSpriteLink
    }

    addBullet = () => {
        if (this.bulletSoundPath) {
            let bulletSound = new Audio
            bulletSound.src = this.bulletSoundPath
            bulletSound.play()
            bulletSound.remove()
        } else {
            throw console.error('!Cannot play sound, bullet sound path not set for ship object');
        }
        if (this.bulletSpriteLink) {
            if (this.shootMode === 1) {
                this.bullets.push(new Bullet(
                    this.x + this.sprite.width/2, 
                    this.y, 
                    this.bulletSpriteLink, 
                    'player_bullet', 
                    ['enemy']
                ))
            } else {
                const bulletOne =  new Bullet(
                    this.x + this.sprite.width * 3/4, 
                    this.y, 
                    this.bulletSpriteLink, 
                    'player_bullet', 
                    ['enemy']
                )
                const bulletTwo =  new Bullet(
                    this.x + this.sprite.width * 1/4, 
                    this.y, 
                    this.bulletSpriteLink, 
                    'player_bullet', 
                    ['enemy']
                )
                bulletOne.horizontalStep = 0.03*20
                bulletTwo.horizontalStep = -0.03*20
                this.bullets.push(bulletOne, bulletTwo)
            }
        }   else {
            throw console.error('!Cannot add bullets, bullet sprite path not set for ship object');
        }
    }

    update = (canvas: HTMLCanvasElement, gameState: GameState) => {
        if (this.collided) {
            this.handleCollusion(canvas)
        }
        if (this.bullets.length) {
            this.updateBullets(gameState.bulletSpeed)
        }
    }

    handleCollusion = (canvas: HTMLCanvasElement) => {
        this.resetObject(canvas)
        if (!this.checkBounds({top: 0, bottom: canvas.height})) this.playCollusionSound()
    }

    resetObject = (_canvas: HTMLCanvasElement) => {
        this.collided = false
        this.health--
    }

    increaseHealth() {
        if (this.health < 3) {
            this.health++
        }
    }

    playCollusionSound = () => {
        if (this.collusionSoundPath) {
            const sound = new Audio
            sound.src = this.collusionSoundPath
            sound.play()
            sound.remove()
        } else {
            throw console.error('!Cannot play sound, collusion sound path not set for ship object');
        }
    }

    updateBullets = (_bulletSpeed: number) => {
        // remove bullets which have collided and are out of bounds
        this.bullets = this.bullets.filter(bullet => !bullet.collided && !bullet.outOfBounds)
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].y += this.bullets[i].verticalStep
            this.bullets[i].x += this.bullets[i].horizontalStep
        }
    }

    checkBounds = (bounds: Boundary) => {
        return (this.y > bounds.bottom)
    }
}
