import { Vec2 } from "../../../Utils/Math";
import { Entity } from "../Core/Ecs";
import { Rigidbody } from "./Rigidbody";
import { Status } from "./Status";
import { Transform } from "./Transform";

class Behavior {

    public status: Status;
    public transform: Transform;
    public rigidbody: Rigidbody;
    public staticColide: boolean = false;
    public staticNormal: Vec2 = new Vec2();
    public staticCenter: Vec2 = new Vec2();

    // Nearby enemies
    public inRange: Entity[] = [];
    public nearest: Entity | null;

    // Attacking status
    public refresh: number = 0.0;
    public attacking: boolean = false;

    // Attacking enemies
    public target: Entity | null;
    public colliding: Entity[] = [];

    // Healing purpose
    public healing: boolean = false;

    constructor(
        status: Status,
        transform: Transform,
        rigidbody: Rigidbody,
    ) {
        this.status = status;
        this.transform = transform;
        this.rigidbody = rigidbody;
    }
}

export { Behavior };
