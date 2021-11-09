import { SpriteComponent } from "../core/ecs/components/sprite";
import { AnimSprite, ECS, Entity, Sprite, Transform } from "../core/ecs/core/ecs";
import { Layer } from "../core/layer";

import { Application } from "pixi.js";
import { AnimSpriteComponent } from "../core/ecs/components/animsprite";
import { WSClient } from "../clients/websocket";
import { wordToView } from "../utils/views";
import { Vec2 } from "../utils/math";
import { TransformComponent } from "../core/ecs/components/transform";


class PlayerLayer extends Layer {

    // Entites storage
    private entities: Record<number, Entity> = {};

    // Listener id
    private listenerId: number = 0;

    protected app: Application;
    protected res: Record<string, any>;
    protected wsClient: WSClient;

    constructor(ecs: ECS, app: Application, wsClient: WSClient, resource: Record<string, any>) {
        super("TesteLayer", ecs);

        this.app = app;
        this.res = resource;
        this.wsClient = wsClient;

        this.listenerId = this.wsClient.addMsgListener(
            (msg) => this.onServerMsg(msg)
        );
    }

    onAttach() {}

    onUpdate(deltaTime: number) {
        
    }

    onDetach() {
        this.wsClient.remMsgListener(this.listenerId);

        this.self.destroy();
    }

    createEnemy(id: number, x: number, y: number) {
        const entity = this.ecs.createEntity(x, y);
        this.entities[id] = entity;
        const sprite = entity.addComponent[AnimSprite]() as AnimSpriteComponent;
        sprite.useView = true;
        sprite.loadFromConfig(this.app, this.res["enemy-sheet"]);
        sprite.addStage(this.app);
    }

    updateEnemy(id: number, action: number, x: number, y: number) {
        const entity = this.entities[id];
        const sprite = entity.getComponent[AnimSprite]() as AnimSpriteComponent;
        const transform = entity.getComponent[Transform]() as TransformComponent;

        transform.pos.x = x;
        transform.pos.y = y;

        switch (action) {
            case 0:
                sprite.animate(this.res["enemy-sheet"]["animations"][0]);
                break;
            case 1:
                sprite.animate(this.res["enemy-sheet"]["animations"][1]);
                break;
            case 2:
                sprite.animate(this.res["enemy-sheet"]["animations"][2]);
                break;
            case 3:
                sprite.animate(this.res["enemy-sheet"]["animations"][3]);
                break;
            case 4:
                sprite.animate(this.res["enemy-sheet"]["animations"][4]);
                break;
            case 5:
                sprite.animate(this.res["enemy-sheet"]["animations"][5]);
                break;
            case 6:
                sprite.animate(this.res["enemy-sheet"]["animations"][6]);
                break;
            case 7:
                sprite.animate(this.res["enemy-sheet"]["animations"][7]);
                break;
        }
    }

    deleteEnemy(id: number) {
        const sprite = this.entities[id].getComponent[AnimSprite]() as AnimSpriteComponent;
        sprite.remStage(this.app);
        this.entities[id].destroy();
    }

    onServerMsg(msg: any) {
        let pos;
        switch (msg.type) {
            case "create-enemy":
                pos = wordToView(new Vec2(msg.content.pos.x, msg.content.pos.y));
                this.createEnemy(msg.content.id, pos.x, pos.y);
                break;
            case "update-enemy":
                pos = wordToView(new Vec2(msg.content.pos.x, msg.content.pos.y));
                this.updateEnemy(msg.content.id, msg.content.action, pos.x, pos.y);
                break;
            case "delete-enemy":
                this.deleteEnemy(msg.content.id);
                break;
        }
        console.log(msg.content.id, pos)
        return false;
    }
}

export { PlayerLayer };
