import { Layer } from "../../Core/Layer";

// Ecs and Components imports
import { ECS } from "../../Core/Ecs/Core/Ecs";
import { BMPText } from "../../Core/Ecs/Components/BMPText";
import { ColoredRectangle } from "../../Core/Ecs/Components/ColoredRectangle";

// Pixi imports
import { Application, CompressedTextureLoader, Container, IBitmapTextStyle } from "pixi.js";
import { EngineContext } from "../../Core/Interfaces";


interface JoinLog {
    player: string;
    text?: {
        player: BMPText;
        action: BMPText;
    };
}

class LogsLayer extends Layer {

    static MAX_LOG:number = 12;
    // Current app instance
    private app: Application;

    // context
    private context: EngineContext;
    //  queue for storing the kills
    private logs: Array<JoinLog> = [];
    private screenX: number;

    private darkOverlay:ColoredRectangle;

    private readonly normalStyle: Partial<IBitmapTextStyle> = {
        fontName: "Rubik-Regular",
        align: "left",
        fontSize: 20,
    };

    private readonly boldStyle: Partial<IBitmapTextStyle> = {
        fontName: "Rubik-Bold",
        align: "left",
        fontSize: 20
    };

    private container:Container;

    constructor(ecs: ECS, app: Application, context: EngineContext) {
        super("TesteLayer", ecs);
        this.app = app;
        this.context = context;
        this.screenX = this.app.view.clientWidth;
        this.container = new Container();
    }

    onAttach() {
        
        this.darkOverlay = this.ecs.createEntity(0,0,false).addColoredRectangle(this.app.view.clientWidth, this.app.view.clientHeight, 0x000000);
        this.darkOverlay.graphics.alpha = 0.4;
        this.container.addChildAt(this.darkOverlay.graphics, 0);
        
        this.app.stage.addChild(this.container);
    }

    async onUpdate(deltaTime: number) {

        // on window resize 
        if(this.app.view.clientWidth != this.screenX ) {
            this.screenX = this.app.view.clientWidth;
            this.logs.forEach((log, index) => this.renderLog(log, index));
            this.darkOverlay.graphics.width = this.screenX;
            this.darkOverlay.graphics.height = this.app.screen.height;
        }

        // if we're on full screen
        if( window.innerHeight == this.app.screen.height ) {
            this.darkOverlay.graphics.width = window.innerWidth;
            this.darkOverlay.graphics.height = window.innerHeight;
        }
      
    
    }

    // adds log on top of queue
    addLog(log: JoinLog) {
        this.logs.unshift(log);
    }

    // Removes last log
    remLog() {
        if (this.logs != undefined && this.logs.length) {
            const log = this.logs[this.logs.length-1]

            // after reducing opacity, unstage text
            if (log && log.text) {
                Object.values(log.text).forEach((text) => {
                    text.remStage();
                });
            }
            // removes log from log queue
            this.logs.pop();
        }
    }

    // create result for a specific participant
    renderLog(log: JoinLog, index: number) {
        // represents how much the y coordinate is offset, according to current index
        const yOffset = 30 + index * 35;
        const initialX = this.screenX ;
        let xOffset = 40;

        // if text already exists, just reposition it
        if (log.text) {
            const { player, action } = log.text;

            
            // set action pos
            xOffset += action.text.width;
            action.setPos(initialX - xOffset, yOffset);

            xOffset += player.text.width + 5;
            player.setPos(initialX - xOffset, yOffset);

            if (index == LogsLayer.MAX_LOG - 1) {
                action.text.alpha = 0.6;
                player.text.alpha = 0.6;
            }

            
        } else {
            // Render the text for participants killed
            const player = this.ecs.createEntity().addBMPText(`${log.player}`, this.boldStyle);

            
            // render the text for participant name
            const action = this.ecs.createEntity().addBMPText("entered battle", this.normalStyle);

            xOffset += action.text.width;
            action.setPos(initialX - xOffset, yOffset);

            xOffset += player.text.width + 5;
            player.setPos(initialX - xOffset, yOffset);

            // stage all texts
            // this.container.addChild(player.text);
            // this.container.addChild(action.text);
            action.addStage(this.container);
            player.addStage(this.container);

            log.text = {
                player: player,
                action: action
            };
        }
    }

    onDetach() {
        
        this.logs.map((log) => {
            if (log.text) {
                Object.values(log.text).forEach((text) => {
                    text.remStage();
                });
            }
        })
        this.container.removeChildren();
        this.app.stage.removeChild(this.container);
    }


    addPlayerToLog(playerName:string) {
            
        this.addLog({
            player: playerName
        });

        if (this.logs.length > LogsLayer.MAX_LOG) {
            this.remLog();
        }
        
        this.logs.forEach((log, index) => this.renderLog(log, index));

    }
}

export { LogsLayer };
