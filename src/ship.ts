import { Boundary, GameState, getRandom, getRandomWindowPosition, OBJECTS, ObjectType, targets } from "./utils";

export class GameObject {
    x: number
    y: number
    sprite: HTMLImageElement
    collided = false
    outOfBounds = false
    objectType: ObjectType
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
    bulletSpriteLink: string | undefined
    bulletSoundPath: string | undefined
    collusionSoundPath: string | undefined
    health: number = 3

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

    resetObject = (_canvas: HTMLCanvasElement) => {
        this.collided = false
        // disable for god mode
        // this.health--
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
        const lucky = getRandom(0, 10) > 4
        // if (lucky) {
            this.spawner.spawnPowerUp(this.x, this.y)
        // }
        this.setPosition(getRandomWindowPosition(canvas))
    }
}

export class PowerUp extends GameObject {
    constructor(x: number, y: number, spriteLink: string, objectType: ObjectType, targets: ObjectType[]) {
        super (x, y, spriteLink, objectType, targets)
    }

    update() {
        this.y += 0.01
    }
}

export const powerUpLinks = {
    0: './sprites/power_health.png',
    1: './sprites/power_speed.png',
    2: './sprites/power_weapon.png'
}

export class Spawner {
    canvas: HTMLCanvasElement
    powerUps: PowerUp[]
    constructor(canvas: HTMLCanvasElement, powerUps: PowerUp[]) {
        this.canvas = canvas
        this.powerUps = powerUps
    }

    spawnPowerUp(x: number, y: number) {
        const powerUpType = getRandom(0,2)
        this.powerUps.push(new PowerUp(x,y, powerUpLinks[0], OBJECTS.power_up, targets.power_up))
    }
}