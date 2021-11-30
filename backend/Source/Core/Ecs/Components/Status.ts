import { Entity } from "../Core/Ecs";

interface StatusResult {
    attack: number;
    health: number;
    defense: number;
    cooldown: number;
    survived: number;
    kills: number;
}

type OnDieFn = (status: StatusResult) => (void);

class Status {

    // Current Entity Status
    public health: number;
    public readonly attack: number;
    public readonly speed: number;
    public readonly defense: number;
    public readonly cooldown: number;
    public readonly maxHealth: number;
    public readonly name: string;

    // Current Entity Stats
    public survived: number = 0.0;
    public kills: number = 0.0;

    // Other enemy status
    public lastHit: Entity;

    public onDie: OnDieFn = () => {};

    constructor(
        attack: number,
        speed: number,
        health: number,
        defense: number,
        cooldown: number,
        name: string,
    ) {
        this.attack = attack;
        this.health = health;
        this.speed = speed;
        this.defense = defense;
        this.maxHealth = health;
        this.cooldown = cooldown;
        this.name = name;
    }

    hit(enemy: Entity) {
        this.lastHit = enemy;
        let damage = enemy.getStatus().attack;

        // 8% critical rate
        if (Math.random() < 0.08) {
            damage += Math.random() * 30;
        } else {
            // 15% miss rate
            if (Math.random() < 0.15) {
                damage -= Math.random() * 30;
            }
        }

        // Not allow negative damage
        if (damage < 1)
            damage = 1;

        if (damage <= this.defense) {
            this.health -= 1;
        } else {
            this.health -= damage -  this.defense;
        }
    }

    setOnDie(fn: OnDieFn) {
        this.onDie = fn;
    }
}

export { Status, StatusResult };
