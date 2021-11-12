import { EcsData, EngineContext } from "../../interfaces";

const sysUpdateSpritePos = (data: EcsData, context: EngineContext, deltaTime: number): void => {
    // Iterates through all sprites in system
    data.sprites.forEach((sprite) => {
        sprite.sprite.x = sprite.transform.pos.x;
        sprite.sprite.y = sprite.transform.pos.y;

        sprite.setScale(
            sprite.transform.scale.x,
            sprite.transform.scale.y,
        );
    });
};

export { sysUpdateSpritePos };

