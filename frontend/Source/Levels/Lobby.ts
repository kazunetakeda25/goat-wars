// Level import
import { Level } from "../Core/Level";

// Constants
import { MAIN_BG_COLOR } from "../Constants/Constants";

// Layers imports
import { MapLayer } from "../Layers/Lobby/Map";
import { PlayerLayer } from "../Layers/Lobby/Player";
import { ViewContext, ViewLayer } from "../Layers/Lobby/View";
import { BattleStatusLayer } from "../Layers/Lobby/Status";
import { LogsLayer } from "../Layers/Lobby/Log";

interface LobbyLevelContext extends ViewContext {
    // View properties
    zoom: number;
    offsetX: number;
    offsetY: number;
}

class LobbyLevel extends Level {

    private levelContext: LobbyLevelContext = {
        // View properties
        zoom: 0.0,
        offsetX: 0.0,
        offsetY: 0.0
    };

    onStart(): void {
        // Sets bg color of main app
        this.context.app.renderer.backgroundColor = MAIN_BG_COLOR;

        // Pushs view controller
        this.layerStack.pushLayer(
            new ViewLayer(this.ecs, this.levelContext, this.context.app, this.context.inputs)
        );

        // Pushs map generator
        this.layerStack.pushLayer(
            new MapLayer(
                this.ecs,
                this.levelContext,
                this.context.app,
                this.context.res
            )
        );

        // Pushs the player controller
        this.layerStack.pushLayer(
            new PlayerLayer(
                this.ecs,
                this.levelContext,
                this.context.app,
                this.context.ws,
                this.context.res
            )
        );

        this.layerStack.pushLayer(
            new BattleStatusLayer(
                this.ecs,
                this.context.app,
                this.context
            )
        );

        this.layerStack.pushLayer(
            new LogsLayer(
                this.ecs,
                this.context.app,
                this.context
            )
        );
    }

    onUpdate(deltaTime: number) {}

    onClose(): void {}
}

export { LobbyLevel, LobbyLevelContext };