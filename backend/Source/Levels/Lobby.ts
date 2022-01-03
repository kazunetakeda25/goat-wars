// Level imports
import { Level } from "../Core/Level";

// Await level imports
import { AwaitLevel } from "./Await";

// Web clients imports
import { GameParticipantsResult, ParticipantDetails, ScheduledGame, ScheduledGameParticipant } from "../Clients/Strapi";

// Interfaces imports
import { EngineContext } from "../Core/Interfaces";

// Layers import
import { PlayerLayer } from "../Layers/Lobby/Player";
import { MapColliderLayer } from "../Layers/Lobby/MapCollider";

// Websocket related imports
import { ReplyableMsg } from "../Clients/WebSocket";
import { 
    requests, 
    GameStatus,
    PlayerNames,
    GameStatusListener,
    PlayerNamesListener,
    OnConnectionListener,
} from "../Clients/Interfaces";
import { WebSocket } from "ws";
import { sleep } from "../Utils/Sleep";

//
// Types
//
type OnDieEvent = { result: GameParticipantsResult, killer: number };
type OnDamageEvent = { damage: number, participant: number };

interface TimeLeft {
    hours: string;
    minutes: string;
    seconds: string;
}

//
// Constants
//

// Delay to await when new client connect to respond
// Represented in miliseconds
const ON_WS_CONNECTION_RESPONSE_DELAY: number = 1000;

//
// Level implementation
//
class LobbyLevel extends Level {

    // Current running game id
    private gameId: number;

    // Number of figthers remaining in the lobby
    private fighters: number = 0;

    // Current game participants
    private participants: ScheduledGameParticipant[] = [];

    // Counters
    private oneSecondCounter: number = 0.0;

    // Store game start time
    private readonly initialDate: number = Date.now();

    // WebSockets listeners
    private gameNamesListener: PlayerNamesListener;
    private gameStatusListener: GameStatusListener;
    private wsConnectionListener: OnConnectionListener;

    // Event Dispatchers queue
    private dieEventQueue: OnDieEvent[] = [];
    private damageEventQueue: OnDamageEvent[] = [];
    
    // Web Event Dispatchers queue
    private dieEventRequestQueue: Promise<void>[] = [];
    private damageEventRequestQueue: Promise<void>[] = [];

    // Player names from API
    static playerNames: Record<string, string> = {};

    // Players layers storage
    private players: PlayerLayer[] = [];

    constructor(context: EngineContext, name: string, gameId: number) {
        super(context, name);

        // Set current game id for game status request purpose and
        // strapi informations requests
        this.gameId = gameId;

        // Clear static variables with name from the players in the game
        // to make sure that no residues from last game remains alive
        LobbyLevel.playerNames = {};

        // Adding WebSockets listeners
        this.gameStatusListener = this.context.ws.addListener(
            "game-status", (msg) => this.onGameStatusMsg(msg)
        );

        this.gameNamesListener = this.context.ws.addListener(
            "player-names", (msg) => this.onGameNamesMsg(msg)
        );

        this.wsConnectionListener = this.context.ws.addListener(
            "connection", (ws) => this.onWsConnectionEvent(ws)
        );
    }

    // Default level's start method, called when engine loads the level
    async onStart(): Promise<void> {
        let game: ScheduledGame;

        try {
            // Request the game using gameId passed in the constructor
            game = await this.context.strapi.getGameById(this.gameId);

            game.scheduled_game_participants.map((participant) => {
                this.participants.push(participant);
                this.fighters++;
            });

            // Effectivelly starts the game
            await this.startGame();
        } catch(e) {
            console.log("Failed to request game in strapi");
            console.log(JSON.stringify(e, null, 4));

            // Closes the engine
            this.context.close = true;
        }
    }

    async startGame(): Promise<void> {

        // Creates game map layer
        const mapCollider = new MapColliderLayer(this.ecs);

        // Extracts grid component from mapCollider
        const grid = mapCollider.getSelf().getGrid();

        // Initial broadcast for players length
        // Tells frontends number of player in lobby
        this.context.ws.broadcast({
            msgType: "remain-players",
            remainingPlayers: this.participants.length,
            totalPlayers: this.participants.length
        });

        await Promise.all(this.participants.map(async (participant) => {

            // Extracts the address and id of token
            const tokenId = (participant.nft_id).split('/')[1];
            const tokenAddr = (participant.nft_id).split('/')[0];

            // Request participant details from strapi
            const details = await this.context.strapi.getParticipantDetails(tokenAddr, tokenId);

            // console.log("Participant: ", participant, "Details: ", details);

            // Add current player name to the playerNames storage
            LobbyLevel.playerNames[participant.nft_id] = details.name;

            // Lambda to process when some palyer dies
            const onDieLambda = (result: GameParticipantsResult, killer: number) => {

                // Extracts the player ID to filter in layers
                const strapId = result.scheduled_game_participant;

                let deadPlayer: PlayerLayer;

                console.log("Processing dead player: ", player.strapiID);

                // Find the dead player and remove it from current player storage
                this.players = this.players.filter((player) => {
                    if (player.strapiID === strapId) {
                        deadPlayer = player;
                        return false;
                    }

                    return true;
                });

                if (!deadPlayer) return;

                // Removes the dead player from the layerstack
                this.layerStack.popLayer(deadPlayer);
                this.fighters--;

                this.dieEventQueue.push({
                    result: result,
                    killer: killer
                });
            };

            // Lambda to process when some player dies
            const onDamageLambda = (damage: number, participant: number) => {
                this.damageEventQueue.push({
                    damage: damage,
                    participant: participant,
                })
            };

            // Creates current player
            const player = new PlayerLayer(
                // Basic tools passed to the layer
                this.ecs, this.context.ws,

                // Ids and grid
                participant.nft_id, participant.id, grid,

                // Lambdas and player details
                onDieLambda, onDamageLambda, details
            );

            // Add player to the current map
            grid.addDynamic(player.getSelf());

            // Iserts player in the layer stack
            this.layerStack.pushLayer(player);

            // Saves a copy of player for on die use
            this.players.push(player);

            // Create player entrant log in strapi
            try {
                await this.context.strapi.createLog({
                    event: "entrants",
                    timestamp: Date.now().toString(),
                    scheduled_game: this.gameId,
                    scheduled_game_participant: participant.id,
                });
            } catch(e) {
                console.log("Failed to create entrants log");
            }
        }));

        // Put the map in the stack
        this.layerStack.pushLayer(mapCollider);
    }

    async onUpdate(deltaTime: number) {

        // Update timer
        if (this.oneSecondCounter >= 1) {
            const { hours, minutes, seconds } = this.getFormatedTime();

            // Send message containing current game time
            this.context.ws.broadcast({
                msgType: 'game-time',
                hours: Number(hours), 
                minutes: Number(minutes), 
                seconds: Number(seconds)
            })
            this.oneSecondCounter -= 1.0;
        }
        this.oneSecondCounter += deltaTime;

        // Checks if there are events to dispatch
        this.dieEventQueue.map((event) => {

            // Push new promisse in the dispatch queue
            this.damageEventRequestQueue.push(
                new Promise(async () => {
                    try {
                        await this.context.strapi.createLog({
                            timestamp: Date.now().toString(),
                            event: "kills",
                            value: String(event.result.scheduled_game_participant),
                            scheduled_game: this.gameId,
                            scheduled_game_participant: event.killer,
                        });
                    } catch(e) {
                        console.log(
                            "Failed to dispatch kill log for player: ",
                            event.result.scheduled_game_participant
                        )
                    }
                    
                    try {
                        await this.context.strapi.createLog({
                            timestamp: Date.now().toString(),
                            event: "final_rank",
                            value: String(this.fighters),
                            scheduled_game: this.gameId,
                            scheduled_game_participant: event.result.scheduled_game_participant,
                        });
                    } catch(e) {
                        console.log(
                            "Failed to dispatch final rank log for player: ",
                            event.result.scheduled_game_participant
                        )
                    }
                })
            );
        });

        // Empty all dispatched events
        this.dieEventQueue = [];

        // Checks if there are events to dispatch
        this.damageEventQueue.map((event) => {

            // Push new promisse in the dispatch queue
            this.damageEventRequestQueue.push(
                new Promise(async () => {
                    this.context.strapi.createLog({
                        timestamp: Date.now().toString(),
                        event: "damage",
                        value: String(event.damage),
                        scheduled_game: this.gameId,
                        scheduled_game_participant: event.participant
                    });
                })
            );
        });

        this.damageEventRequestQueue = [];

        // When game finished
        if (this.fighters == 1) {
            // Find the last remain player
            const lastFigther = this.players[0];

            // Tells front-ends that there is only one player
            this.context.ws.broadcast({
                msgType: "remain-players",
                remainingPlayers: this.fighters,
                totalPlayers: this.participants.length
            });

            // Stores the start of await time of requests
            const startRequestTime = Date.now();
            // Await all opened request to change to other level
            Promise.all(this.dieEventRequestQueue);
            Promise.all(this.damageEventRequestQueue);

            // Get last player status
            const lastPlayerStatus = lastFigther.getSelf().getStatus();

            // Creates the log for the last player
            await this.context.strapi.createParticipantResult({
                scheduled_game_participant: lastFigther.strapiID,
                survived_for: Math.floor(lastPlayerStatus.survived),
                kills: Math.floor(lastPlayerStatus.kills),
                health: Math.ceil(lastPlayerStatus.health)
            });

            // Winner log
            await this.context.strapi.createLog({
                timestamp: Date.now().toString(),
                event: "winners",
                scheduled_game: this.gameId,
                scheduled_game_participant: lastFigther.strapiID,
            })

            const eleapsedRequestsTime = Date.now() - startRequestTime;

            // In case that request last less than five seconds, await remaining time
            if (eleapsedRequestsTime < 5000) {
                await sleep(5000 - eleapsedRequestsTime);
            }

            // Tells frontends that is return to await from this gameId
            const msg: GameStatus = {
                msgType: "game-status",
                gameId: this.gameId,
                lastGameId: 0,
                gameStatus: "awaiting"
            };
            this.context.ws.broadcast(msg);

            // Change to await level
            this.context.engine.loadLevel(new AwaitLevel(this.context, "Await"));
        }
    }

    // Default level's close method, called when engine
    // switch between levels or close itself
    onClose(): void {
        // Listeners destruction
        this.gameNamesListener.destroy();
        this.gameStatusListener.destroy();
        this.wsConnectionListener.destroy();
    }

    // Handles all requests from frontends that relate with current game-status
    onGameStatusMsg(msg: ReplyableMsg): boolean {

        // Check the veracity of message type
        if (msg.content.type === requests.gameStatus) {

            // Generates the reply
            const reply: GameStatus = {
                msgType: "game-status",
                gameId: this.gameId,
                lastGameId: 0,
                gameStatus: "lobby"
            };

            // Send the reply to the author of request
            msg.reply(reply);
        }

        // Handles the event, doesn't allow event propagation
        // in the event listeners queue
        return true;
    }

    // Handles all requests from frontends that relate with current player names
    onGameNamesMsg(msg: ReplyableMsg): boolean {

        // Check the veracity of message type
        if (msg.content.type == requests.playerNames) {

            // Generates the reply
            const reply: PlayerNames = {
                msgType: "player-names",
                gameId: this.gameId,
                names: {
                    // LobbyLevel contains one static variable to store
                    // all names from last game, it's reseted in every 
                    // game start.
                    ...LobbyLevel.playerNames
                }
            };

            // Send the reply to the author of request
            msg.reply(reply);
        }

        // Handles the event, doesn't allow event propagation
        // in the event listeners queue
        return true;
    }

    // Handles all requests from frontends that relate with current player names
    onWsConnectionEvent(ws: WebSocket): boolean {

        setTimeout(
            () => {
                this.context.ws.send(ws, {
                    msgType: "remain-players",
                    remainingPlayers: this.fighters,
                    totalPlayers: this.participants.length
                });
            }, ON_WS_CONNECTION_RESPONSE_DELAY
        );

        // Doesn't handles the event, allow event propagation
        // in the event listeners queue
        return false;
    }

    getFormatedTime(): TimeLeft {
        // Small lambda to return string with two digits of a number
        const minTwoDigits = (n: number) => {
            return (n < 10 ? "0" : "") + String(n);
        };

        // Time difference between start game time
        const difference = Date.now() - this.initialDate;

        let timeLeft: TimeLeft;

        if (difference > 0) {
            timeLeft = {
                hours: minTwoDigits(
                    Math.floor((difference / (1000 * 60 * 60 * 24)) * 24)
                ),
                minutes: minTwoDigits(
                    Math.floor((difference / 1000 / 60) % 60)
                ),
                seconds: minTwoDigits(Math.floor((difference / 1000) % 60))
            };
        }

        return timeLeft;
    }
};

export { LobbyLevel };
