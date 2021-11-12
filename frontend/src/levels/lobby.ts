import { Level } from "../core/level";
import { MapLayer } from "../layers/map";
import { PlayerLayer } from "../layers/player";
import { ViewContext, ViewLayer } from "../layers/view_offset";

interface LobbyLevelContext extends ViewContext {
    // View properties
    zoom: number;
    offsetX: number;
    offsetY: number;
};

class LobbyLevel extends Level {

    private levelContext: LobbyLevelContext = {
        // View properties
        zoom: 0.0,
        offsetX: 0.0,
        offsetY: 0.0
    };

    onStart(): void {

        // Pushs view controller
        this.layerStack.pushLayer(new ViewLayer(
            this.ecs,
            this.levelContext,
            this.context.inputs,
        ));

        // Pushs map generator
        this.layerStack.pushLayer(new MapLayer(
            this.ecs,
            this.levelContext,
            this.context.app,
            this.context.resources
        ));

        // Pushs the player controller
        this.layerStack.pushLayer(new PlayerLayer(
            this.ecs,
            this.levelContext,
            this.context.app,
            this.context.wsClient,
            this.context.resources
        ));
    }

    onUpdate(deltaTime: number) {
        
    }

    onClose(): void {}
};

export { LobbyLevel, LobbyLevelContext };