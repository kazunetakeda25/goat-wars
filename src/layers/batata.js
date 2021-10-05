import { ECS } from "../ecs/core/ecs";
import { inputs, KEYS, BTNS } from "../inputs/inputs";

import resources from "../resource.json";

class Batata {
    constructor(app) {
        this.app = app;
        this.entity = {};
    }

    onAttach() {
        this.entity = ECS.createEntity(500, 200, ECS.ANIMSPRITE | ECS.RIGIDBODY);
        let sprite = ECS.getComponent(this.entity, ECS.ANIMSPRITE);

        sprite.loadFromConfig(this.app, resources["sprite-sheet-load"]);
        sprite.addStage(this.app);
    }

    onUpdate(deltaTime) {
        let sprite = ECS.getComponent(this.entity, ECS.ANIMSPRITE);
        let rigidibody = ECS.getComponent(this.entity, ECS.RIGIDBODY);

        if (inputs.key[KEYS.W]) {
            sprite.animate(resources["sprite-sheet-load"]["animations"][0]);
        }

        if (inputs.btn[BTNS.LEFT]) {
            let difX = inputs.cursor.x - rigidibody.transform.pos.x;
            let difY = inputs.cursor.y - rigidibody.transform.pos.y;

            let length = Math.sqrt(difX ** 2 + difY ** 2);

            difX /= length;
            difY /= length;

            let factor = 1.5;

            difX *= factor;
            difY *= factor;

            rigidibody.addVel(difX, difY);
        }
    }
}

export { Batata };