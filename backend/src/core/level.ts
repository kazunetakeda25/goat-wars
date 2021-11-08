import { ECS } from "./ecs/core/ecs";
import { EngineContext } from "./interfaces";
import { Layer } from "./layer";
import { LayerStack } from "./layer-stack";

abstract class Level {
    
    // Name of the current runnign level
    protected name: string;

    // Current level's ECS instance
    protected ecs: ECS;

    // Current level's Layer Stack instance
    protected layerStack: LayerStack;

    // Main Engine context
    protected context: EngineContext;

    constructor(context: EngineContext, name: string = "Default") {
        this.name = name;
        this.context = context;
        this.ecs = new ECS();
        this.layerStack = new LayerStack();
    }

    runPendings(deltaTime: number) {
        // Update ECS systems
        this.ecs.onUpdate(deltaTime);

        // Update all level's layers
        this.layerStack.layers.map((layer: Layer) => {
            layer.onUpdate(deltaTime);
        })
    }

    closeSystems() {
        this.layerStack.destroy();
        this.ecs.destroy();
    }

    abstract onStart(): void;
    abstract onUpdate(deltaTime: number): void;
    abstract onClose(): void;

    getName() { return this.name; }
};

export { Level };
