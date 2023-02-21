// Layer import
import { Layer } from "../../Core/Layer";

// Constants
import { SPRITE_SIZE } from "../../Constants/Constants";

// Ecs imports
import { ECS, Entity } from "../../Core/Ecs/Core/Ecs";

// Pixi imports
import { Application, Container, LoaderResource } from "pixi.js";

// Lobby level context
import { LobbyLevelContext } from "../../Levels/Lobby";

// Files import
import { Vec2 } from "../../Utils/Math";

class MapLayer extends Layer {
    // Entities storage
    protected entities: Entity[] = [];

    // Map container
    protected mapContainer: Container;

    // Application related
    protected app: Application;
    protected res: Record<string, any>;
    private levelMap: Record<string, any>;
    private levelCollider: Record<string, any>;

    // Current level's context
    private levelContext: LobbyLevelContext;

    // Dimension
    private dim: Vec2 = new Vec2();

    constructor(
        ecs: ECS,
        levelContext: LobbyLevelContext,
        app: Application,
        resource: Record<string, any>,
        levelMap: Record<string, any>,
        levelCollider: Record<string, any>
    ) {
        super("Basemap", ecs);

        this.app = app;
        this.res = resource;
        this.levelContext = levelContext;

        this.levelMap = levelMap;
        this.levelCollider = levelCollider;

        // Creates new pixi container
        this.mapContainer = new Container();
    }

    loadMap() {
        let rows = this.levelMap["height"];
        let cols = this.levelMap["width"];

        const step = SPRITE_SIZE / 2.0;

        let x = 0.0;
        let y = 0.0;

        for (let i = 0; i < rows; ++i) {
            y += step;
            for (let j = 0; j < cols; ++j) {
                x += step;

                // Creates entity and add sprite to it
                const entity = this.ecs.createEntity(x, y, false);
                const sprite = entity.addSprite();

                // Calculates base cuts in spritesheet
                const pw = j * SPRITE_SIZE;
                const ph = i * SPRITE_SIZE;

                // Load the cuted image to sprite
                sprite.sprite.width = SPRITE_SIZE;
                sprite.sprite.height = SPRITE_SIZE;

                const imgMap: { [index: number]: LoaderResource } = {
                    0: this.app.loader.resources["floor"],
                    1: this.app.loader.resources["border"],
                    2: this.app.loader.resources["voidfloor"]
                };
                sprite.setImg(imgMap[this.levelCollider.data[j][i]]);

                this.entities.push(entity);
                this.mapContainer.addChild(sprite.sprite);
                x += step;
            }
            x = 0;
            y += step;
        }
    }

    onAttach() {
        this.loadMap();

        this.dim.x = this.mapContainer.width;
        this.dim.y = this.mapContainer.height;

        // Add layers to render stage
        this.app.stage.addChild(this.mapContainer);
        this.onUpdate(0);
    }

    onUpdate(deltaTime: number) {
        let fixFactorX = (this.dim.x - this.dim.x * (1 - this.levelContext.zoom)) / 2.0;

        let fixFactorY = (this.dim.y - this.dim.y * (1 - this.levelContext.zoom)) / 2.0;

        // Translate and scale soil
        this.mapContainer.x = this.levelContext.offsetX + fixFactorX + SPRITE_SIZE * 0.5;
        this.mapContainer.y = this.levelContext.offsetY + fixFactorY + SPRITE_SIZE * 0.5;
        this.mapContainer.scale.x = 1 - this.levelContext.zoom;
        this.mapContainer.scale.y = 1 - this.levelContext.zoom;
    }

    onDetach() {
        this.app.stage.removeChild(this.mapContainer);
    }
}

export { MapLayer };
