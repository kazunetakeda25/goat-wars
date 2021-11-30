import { Layer } from "../../Core/Layer";

// Ecs and Components imports
import { ECS } from "../../Core/Ecs/Core/Ecs";

// Pixi imports
import { Application, ITextStyle, Container } from "pixi.js";
import { ScheduledGameParticipant } from "../../Clients/Strapi";
import { Sprite } from "../../Core/Ecs/Components/Sprite";
import { lerp } from "../../Utils/Math";

class ResultsLayer extends Layer {
    // Current app instance
    private app: Application;
    private resContainer: Container;

    private count: number = 0.0;
    private initialResY = 0.0;
    private firstPass = true;

    private readonly textStyle: Partial<ITextStyle> = {
        fontFamily: "monospace",
        fontStyle: "normal",
        fontWeight: "400",
        fontSize: 16,
        fill: 0xffffff,
        lineHeight: 22,
        align: "center"
    };

    private readonly titleStyle: Partial<ITextStyle> = {
        ...this.textStyle,
        fontWeight: "bold",
        fontSize: 24,
        lineHeight: 31
    };

    // Percents of the screen
    private percentX: number;
    private percentY: number;

    constructor(ecs: ECS, app: Application, gameParticipants: ScheduledGameParticipant[]) {
        super("TesteLayer", ecs);

        this.app = app;
        this.resContainer = new Container();

        // Set current percents
        this.percentX = this.app.view.width / 100.0;
        this.percentY = this.app.view.height / 100.0;

        // Create results title
        this.ecs
            .createEntity(58.4022 * this.percentX, 5.25 * this.percentY)
            .addText("RESULTS", this.titleStyle)
            .addStage(this.resContainer);

        // renders all the results
        console.log(gameParticipants)
        gameParticipants.map((participant, index) =>
            this.renderResult(participant, index)
        );

        this.app.stage.addChild(this.resContainer);
        this.initialResY = this.resContainer.y;
    }

    // create result for a specific participant
    renderResult(participant: ScheduledGameParticipant, index: number) {
        // represents how much the y coordinate is offset, according to current index
        const yOffset = this.percentY * (14.166 + index * 3.75);
        const result = participant.game_participants_result;
        // First render the icon
        let resultIcon: Sprite;
        // if it's the first one(winner) show the star
        if (index === 0) {
            resultIcon = this.ecs
                .createEntity(this.percentX * 50.23, yOffset)
                .addSprite(this.app.loader.resources["purpleStar"]);

            resultIcon.setSize(13.333, 13.333);
        } else {
            resultIcon = this.ecs
                .createEntity(this.percentX * 50.23, yOffset)
                .addSprite(this.app.loader.resources["userIcon"]);
        }

        resultIcon.addStage(this.resContainer);
        resultIcon.setAnchor(0.0);

        // Render the text for the position
        this.ecs
            .createEntity(this.percentX * 51.944, yOffset)
            .addText(`${index + 1}`, this.textStyle)
            .addStage(this.resContainer);

        // render the text for participant name
        this.ecs
            .createEntity(this.percentX * 56.458, yOffset)
            .addText(`${participant.name}`, this.textStyle)
            .addStage(this.resContainer);

        // Render the tombstone icon
        const deathIcon = this.ecs
            .createEntity(this.percentX * 70.694, yOffset)
            .addSprite(this.app.loader.resources["tombstone"]);

        deathIcon.addStage(this.resContainer);
        deathIcon.setAnchor(0.0);

        // Render the text for participants killed
        this.ecs
            .createEntity(this.percentX * 72.43, yOffset)
            .addText(`${result.kills}`, this.textStyle)
            .addStage(this.resContainer);
    }

    onAttach() {}

    onUpdate(deltaTime: number) {
        if (this.firstPass) {
            this.resContainer.y = lerp(this.initialResY, -(this.resContainer.height + this.initialResY), this.count / 20.0);
        } else {
            this.resContainer.y = lerp(this.app.view.height, -(this.resContainer.height + this.initialResY), this.count / 20.0);
        }

        if (this.count >= 20.0) {
            this.count -= 20.0;
            this.firstPass = false;
        }
        else
            this.count += deltaTime;  
    }

    onDetach() {
        this.self.destroy();
    }
}

export { ResultsLayer };
