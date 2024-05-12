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
    horizontalStep = 0
    verticalStep = -20
    constructor(x: number, y: number, spriteLink: string, objectType: ObjectType, targets: ObjectType[]) {
        super(x, y, spriteLink, objectType, targets)
    }
}

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

    updateBullets = () => {
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

export const powerUpLinks = ['./sprites/power_health.png', './sprites/power_points.png', './sprites/power_weapon.png']

export class Spawner {
    canvas: HTMLCanvasElement
    powerUps: PowerUp[] = []
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
    }

    cleanPowerUps() {
        this.powerUps = this.powerUps.filter(pup => !pup.outOfBounds && !pup.powerUpUsed)
    }

    spawnPowerUp(x: number, y: number) {
        const random = getRandom(0,31)
        const powerUpType = (random > 0 && random < 30) ? 1 : random === 30 ? 2 : random
        this.powerUps.push(new PowerUp(x,y, powerUpLinks[powerUpType], OBJECTS.power_up, targets.power_up, powerUpType, '/sounds/beep.mp3'))
    }
}