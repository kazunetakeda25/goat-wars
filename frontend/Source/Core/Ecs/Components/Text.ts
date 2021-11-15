import { Vec2 } from "../../../Utils/Math";

// Components imports
import { Transform } from "./Transform";

// Pixi imports
import { Application, ITextStyle } from "pixi.js";
import { Text as PixiText } from "pixi.js";

class Text {

    public transform: Transform;

    public text: PixiText;

    // Current attached app
    private app: Application | null = null;

    constructor(transform: Transform, text: string, styles: Partial<ITextStyle>) {
        this.transform = transform;

        this.text = new PixiText(text, styles);
    }

    setText(text: string) {
        this.text.text = text;
    }

    addStage(app: Application) {
        if (!this.app) {
            this.app = app;
            app.stage.addChild(this.text);
        } else {
            this.remStage();
            this.app = app;
            app.stage.addChild(this.text);
        }
    }

    remStage() {
        if (!this.app)
            return;

        this.app.stage.removeChild(this.text);
    }

    setPos(x: number, y: number) {
        this.transform.pos.x = x;
        this.transform.pos.y = y;
    }

    setStyle(styles: Partial<ITextStyle>) {
        this.text.style = styles;
    }
}

export { Text };