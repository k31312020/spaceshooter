import { Boundary, GameState, getRandom, getRandomWindowPosition, ObjectType } from "./utils";

export class GameObject {
    x: number
    y: number
    sprite: HTMLImageElement
    collided = false
    outOfBounds = false
    objectType: ObjectType = null
    targets: ObjectType[] = []

    constructor(x: number, y: number, spriteLink: string, objectType: ObjectType, targets: ObjectType[]) {
        this.x = x;
        this.y = y;
        this.sprite = this.setSprite(spriteLink)
        this.objectType = objectType
        this.targets = targets
    }

    getPosition = (): { x: number, y: number } => ({ x: this.x, y: this.y })

    setSprite = (sprite: string) => {
        const img = new Image
        img.src = sprite
        return img
    }

    setPosition = ({ x, y }: { x: number, y: number }): void => {
        this.x = x
        this.y = y
    }

    render = (ctx: CanvasRenderingContext2D) => {
        ctx.drawImage(this.sprite, this.x, this.y)
    }

    checkBounds = (bounds: Boundary) => {
        return (this.y < bounds.top || 
            this.y > bounds.bottom)
    }
}

export class Bullet extends GameObject {
    constructor(x: number, y: number, spriteLink: string, objectType: ObjectType, targets: ObjectType[]) {
        super(x, y, spriteLink, objectType, targets)
    }
}

export class Ship extends GameObject {
    hit: boolean = false
    destroyAnimation = 0
    bullets: GameObject[] = []
    explodeSprite: HTMLImageElement
    bulletSpriteLink: string | undefined
    bulletSoundPath: string | undefined
    collusionSoundPath: string | undefined
    health: number = 3

    constructor(x: number, y: number, spriteLink: string, objectType: ObjectType, targets: ObjectType[], explodeSprite: string, bulletSoundPath?: string, collusionSoundPath?: string, bulletSpriteLink?: string) {
        super(x, y, spriteLink, objectType, targets)
        this.bulletSoundPath = bulletSoundPath
        this.collusionSoundPath = collusionSoundPath
        this.bulletSpriteLink = bulletSpriteLink
        this.explodeSprite = this.setSprite(explodeSprite)
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
            this.bullets.push(new Bullet(this.x + this.sprite.width/2, this.y, this.bulletSpriteLink, 'player_bullet', ['enemy']))
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

    resetObject = (canvas: HTMLCanvasElement) => {
        this.collided = false
        this.health--
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

    updateBullets = (bulletSpeed: number) => {
        // remove bullets which have collided and are out of bounds
        this.bullets = this.bullets.filter(bullet => !bullet.collided && !bullet.outOfBounds)
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].y -= bulletSpeed
        }
    }

    checkBounds = (bounds: Boundary) => {
        return (this.y > bounds.bottom)
    }
}

export class EnemyShip extends Ship {
    weaponCoolDownTime = getRandom(30,80)
    weaponsActivated = false
    constructor(x: number, y: number, spriteLink: string, objectType: ObjectType, targets: ObjectType[], explodeSprite: string, bulletSoundPath?: string, collusionSoundPath?: string, bulletSpriteLink?: string, weaponsActivated?: boolean) {
        super(x, y, spriteLink, objectType, targets, explodeSprite, bulletSoundPath, collusionSoundPath, bulletSpriteLink)
        this.weaponsActivated = weaponsActivated || false
    }

    update = (canvas: HTMLCanvasElement, gameState: GameState) => {
        this.y += gameState.enemySpeed
        this.weaponCoolDownTime--
        if (this.outOfBounds) {
            this.resetObject(canvas)
        }
        if (this.collided) {
            // increase game score
            gameState.score++
            this.handleCollusion(canvas)
        }
        if (this.weaponCoolDownTime === 0 && this.weaponsActivated) {
            this.addBullet()
        }
        if (this.bullets.length) {
            this.updateBullets(gameState.bulletSpeed)
        }
    }

    addBullet = () => {
        if (this.bulletSpriteLink) {
            this.weaponCoolDownTime = 60
            this.bullets.push(new Bullet(this.x + this.sprite.width/2, this.y + this.sprite.height, this.bulletSpriteLink, 'enemy_bullet', ['player']))
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
        this.setPosition(getRandomWindowPosition(canvas))
    }
}