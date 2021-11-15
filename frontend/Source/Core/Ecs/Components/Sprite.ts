import { Vec2 } from "../../../Utils/Math";

// Components imports
import { Transform } from "./Transform";

// Pixi imports
import { Application, LoaderResource, BaseTexture, Texture, Rectangle } from "pixi.js";
import { Sprite as PixiSprite } from  "pixi.js";

class Sprite {

    public transform: Transform;

    public img: LoaderResource;
    public sprite: PixiSprite;

    private app: Application | null = null;

    constructor(transform: Transform, res: LoaderResource | null) {
        this.transform = transform;

        this.sprite = new PixiSprite();
        this.sprite.anchor.set(0.5);
        this.sprite.x = this.transform.pos.x;
        this.sprite.y = this.transform.pos.y;

        if (res)
            this.setImg(res);
    }

    setCutImg(img: LoaderResource, pw: number, ph: number, w: number, h: number) {
        const url: string = img.url;
        const ssheet: BaseTexture = BaseTexture.from(url);
        const texture = new Texture(ssheet, new Rectangle(pw, ph, w, h));

        this.sprite.texture = texture;
    }

    setImg(img: LoaderResource) {
        this.img = img;
        this.sprite.texture = img.texture;
    }

    setFromUrl(url: string) {
        this.sprite.texture = Texture.from(url);
    }

    addStage(app: Application) {
        if (!this.app) {
            this.app = app;
            app.stage.addChild(this.sprite);
        } else {
            this.remStage();
            this.app = app;
            app.stage.addChild(this.sprite);
        }
    }

    remStage() {
        if (!this.app)
            return;
            
        this.app.stage.removeChild(this.sprite);
    }

    setScale(x: number, y: number) {
        this.transform.scale.x = x;
        this.transform.scale.y = y;
    }

    setPos(x: number, y: number) {
        this.transform.pos.x = x;
        this.transform.pos.y = y;
    }

    setSize(width: number, height: number) {
        const scaleX = width / this.sprite.width;
        const scaleY = height / this.sprite.height;

        this.transform.scale.x = scaleX;
        this.transform.scale.y = scaleY;
    }

    setAnchor(x: number, y?: number) {
        y ? this.sprite.anchor.set(x, y) : this.sprite.anchor.set(x);
    }
}

export { Sprite };