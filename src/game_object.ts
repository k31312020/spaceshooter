import { Boundary, ObjectType } from "./types"

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
