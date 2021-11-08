import { Vec2 } from "../../../utils/math";
import { Entity, Transform } from "../core/ecs";
import { RectangleComponent } from "./rectangle";
import { TransformComponent } from "./transform";

interface DynamicEntity {
    entity: Entity;
    index: Vec2;
}

class GridComponent {

    // Size properties
    width: number;
    height: number;

    // Intervals of each cell
    intervalX: number;
    intervalY: number;

    // Stores all statics entities
    statics: Array<RectangleComponent | null> = [];

    // Stores all dynamic entities
    dynamics: Array<DynamicEntity> = [];

    constructor(width: number = 0, height: number = 0) {
        this.width = width;
        this.height = height;

        // Get current single cell size
        this.intervalX = 2.0 / this.width;
        this.intervalY = 2.0 / this.height;

        // First initialize all static cells as false
        this.statics = new Array<null>(this.width * this.height);
    }

    addDynamic(entity: Entity) {
        const transform = entity.getComponent[Transform]() as TransformComponent;

        // Changes coordinate sistem from ndc to normalized left-upper origin
        const position = transform.pos.adds(1.0).divs(2.0);
        position.y = 1 - position.y;

        // Find the correct index of entity in grid
        const index = new Vec2(
            Math.floor(position.x / (this.intervalX / 2.0)),
            Math.floor(position.y / (this.intervalY / 2.0)),
        );

        // If index gets out of bounds return
        if (index.x >= this.width || index.y >= this.height)
            return;

        this.dynamics.push({ entity: entity, index: index });
    }

    removeDynamic(entity: Entity) {
        this.dynamics = this.dynamics.filter(dynamic => dynamic.entity !== entity);
    }

    addStatic(x: number, y: number) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return;

        this.statics[y * this.width + x] = new RectangleComponent(
            this.intervalX, this.intervalY,
            new TransformComponent(
                ((x * this.intervalX + this.intervalX / 2.0)) - 1.0,
                1.0 - ((y * this.intervalY + this.intervalY / 2.0))
            )
        );
    }

    removeStatic(x: number, y: number) {
        this.statics[y * this.width + x] = null;
    }
};

export { GridComponent };
