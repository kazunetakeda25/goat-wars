// Level imports
import { Level } from "../Core/Level";
import { AwaitLevel } from "./Await";

// Web clients imports
import { ScheduledGameParticipant } from "../Clients/Strapi";

// Interfaces imports
import { EngineContext } from "../Core/Interfaces";

// Layers import
import { PlayerLayer } from "../Layers/Lobby/Player";
import { MapColliderLayer } from "../Layers/Lobby/MapCollider";
import { ReplyableMsg } from "../Clients/WebSocket";
import { GameStatus, GameStatusListener, requests } from "../Clients/Interfaces";

class LobbyLevel extends Level {

    // Current running game id
    private gameId: number;

    // Current game participants
    private participants: ScheduledGameParticipant[] = [];
    private fighters: number = 0;

    // Tells when game is ready to play
    private ready: boolean = false;

    // Current ws listener is
    private listener: GameStatusListener;

    constructor(context: EngineContext, name: string, gameId: number) {
        super(context, name);

        this.gameId = gameId;

        this.listener = this.context.ws.addListener("game-status", (msg) => this.onServerMsg(msg));
    }

    onStart(): void {
        this.context.strapi.getGameById(this.gameId)
            .then((game) => {
                game.scheduled_game_participants.map((participant) => {
                    this.participants.push(participant);
                    this.fighters++;
                });
                this.startGame();
            }).catch((err) => {
                console.log(err);
                this.context.close = true;
            });
    }

    startGame() {
        const mapCollider = new MapColliderLayer(this.ecs);
        const grid = mapCollider.getSelf().getGrid();

        // Put the map in the stack
        this.layerStack.pushLayer(mapCollider);

        this.participants.map((participant, index) => {
            const player = new PlayerLayer(
                this.ecs, this.context.ws,
                participant.nft_id, grid, () => {
                    this.context.ws.broadcast({
                        alive: this.fighters,
                        total: this.participants.length
                    })
                    this.layerStack.popLayer(player);
                    this.fighters--;
                }
            );
            grid.addDynamic(player.getSelf());
            this.layerStack.pushLayer(player)
        });

        // Tells that lobby is ready to play
        this.ready = true;
    }

    onUpdate(deltaTime: number) {
        if (this.fighters <= 1 && this.ready) {
            this.context.engine.loadLevel(new AwaitLevel(this.context, "Await"));
        }
    }

    onClose(): void {
        this.listener.destroy();
        // this.context.ws.remMsgListener(this.listener);
    }

    onServerMsg(msg: ReplyableMsg) {

        if (msg.content.type == requests.gameStatus) {
            const reply: GameStatus = {
                msgType: "game-status",
                gameId: this.gameId,
                lastGameId: 0,
                gameStatus: "lobby"
            }

            msg.reply(reply);
        }

        return true;
    }
};

export { LobbyLevel };
