import { Layer } from "../../Core/Layer";

// Pixi imports
import { Application, ITextStyle } from "pixi.js";

// Web clients
import { ScheduledGame } from "../../Clients/Strapi";

// Interfaces
import { EngineContext } from "../../Core/Interfaces";

// Ecs and Components
import { ECS } from "../../Core/Ecs/Core/Ecs";
import { Text } from "../../Core/Ecs/Components/Text";
import { Sprite } from "../../Core/Ecs/Components/Sprite";

class TextLayer extends Layer {
    private app: Application;
    private title: Sprite;
    private subtitle: Text;
    private users: Sprite;
    private countdown: Text;
    private entered: Text;
    private percentX: number;
    private percentY: number;
    private currentGame: ScheduledGame;
    private context: EngineContext;

    // Styles
    private readonly titleStyle: Partial<ITextStyle> = {
        fontFamily: "monospace",
        fontSize: 130,
        fill: 0xffffff,
        align: "center",
        fontWeight: "700"
    };
    
    private readonly textStyle: Partial<ITextStyle> = {
        fontFamily: "monospace",
        fontSize: 25,
        fill: 0xffffff,
        align: "center",
        fontWeight: "700",
        lineHeight: 37
    };

    // count that resets every second
    private oneSecCount: number = 0.0;

    // count that resets every 5 seconds
    private fiveSecCount: number = 0.0;

    constructor(
        ecs: ECS,
        app: Application,
        context: EngineContext,
        currentGame: ScheduledGame
    ) {
        super("TesteLayer", ecs);

        this.app = app;
        this.currentGame = currentGame;
        this.context = context;

        // sets percents
        this.percentX = this.app.view.width / 100.0;
        this.percentY = this.app.view.height / 100.0;

        // Add sprite to it
        this.title = this.ecs.createEntity().addSprite(this.app.loader.resources["thepit"]);
        this.users = this.ecs.createEntity().addSprite(this.app.loader.resources["user"]);

        // Anchor it in 0,0
        this.title.sprite.anchor.set(0.0);
        this.users.sprite.anchor.set(0.0);

        // Add it to stage
        this.title.addStage(this.app);
        this.users.addStage(this.app);
    }

    renderText(text: Text, y: number) {
        text.setPos(
            this.percentX * 50 - text.text.width / 2.0,
            this.percentY * y
        );
        text.addStage(this.app);
    }

    onAttach() {
        this.title.setPos(50 * this.percentX - this.title.sprite.width / 2.0, 8.125 * this.percentY);
        this.users.setPos(37.5695 * this.percentX, 59.25 * this.percentY);

        const { hours, minutes, seconds } = this.calculateTimeLeft(
            this.currentGame.game_date
        );

        this.subtitle = this.ecs.createEntity().addText("NEXT BATTLE STARTS IN", this.textStyle);

        this.renderText(this.subtitle, 33.375);

        this.context.strapi
            .getGameById(this.currentGame.id)
            .then((updatedGame) => {
                this.entered = this.ecs.createEntity().addText(
                    `ENTERED: ${updatedGame.scheduled_game_participants.length} (MAX 100)`,
                    this.textStyle
                );
                this.renderText(this.entered, 59.25);
            });

        this.countdown = this.ecs.createEntity().addText(
            `${hours}:${minutes}:${seconds}`,
            this.titleStyle
        );
        this.renderText(this.countdown, 40);
    }

    onUpdate(deltaTime: number) {
        if (this.oneSecCount >= 1) {
            const { hours, minutes, seconds } = this.calculateTimeLeft(
                this.currentGame.game_date
            );
            this.countdown.setText(`${hours}:${minutes}:${seconds}`);
            this.oneSecCount -= - 1.0;
        }

        if (this.fiveSecCount >= 5) {
            this.context.strapi
                .getGameById(this.currentGame.id)
                .then((updatedGame) => {
                    this.entered.setText(`ENTERED: ${updatedGame.scheduled_game_participants.length} (MAX 100)`);
                });
            this.fiveSecCount -= 5.0;
        }

        this.oneSecCount += deltaTime;
        this.fiveSecCount += deltaTime;
    }

    onDetach() {
        this.self.destroy();
    }

    calculateTimeLeft(targetDate: string): Record<string, number> {
        const minTwoDigits = (n: number) => {
            return (n < 10 ? "0" : "") + n;
        };

        const difference = +new Date(targetDate) - +new Date();

        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hours: minTwoDigits(
                    Math.floor((difference / (1000 * 60 * 60 * 24)) * 24)
                ),
                minutes: minTwoDigits(
                    Math.floor((difference / 1000 / 60) % 60)
                ),
                seconds: minTwoDigits(Math.floor((difference / 1000) % 60))
            };
        }

        return timeLeft;
    }
}

export { TextLayer };