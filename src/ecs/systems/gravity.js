import { ECS_CORE } from "../core/ecs";

const GRAVITY = -30.1;

const sysApplyGravity = (data, deltaTime) => {
    data[ECS_CORE.RIGIDBODY].forEach((body) => {
        body.velocity.y -= GRAVITY * deltaTime;
    });
};

export { sysApplyGravity };