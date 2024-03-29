import { v4 as uuidv4 } from "uuid";
import { Logger } from "../Utils/Logger";
import {
    ConnectionLostListener,
    EnemyListener,
    GameStateListener,
    GameStatusListener,
    GameTimeListener,
    KillListener,
    Listener,
    ListenerTypes,
    msgHandlerFn,
    OnConnectionFn,
    OnConnectionListener,
    OnConnectionLostFn,
    OnEnemyFn,
    OnGameStateFn,
    OnGameStatusFn,
    OnGameTimeFn,
    OnKillFn,
    OnListenerFns,
    OnRemainPlayersFn,
    OnResponseFn,
    RemainPlayersListener,
    RequestMsg,
    ResponseListener,
    ServerMsg
} from "./Interfaces";

// Server callbacks types
type OnReadyFn = () => void;

class WSClient {
    // Server settings
    private host: string;
    private port: number;
    private socket: WebSocket;

    // Client status
    private connected: boolean = false;
    private reconnect: boolean = true;

    private listeners: Record<string, Listener> = {};

    // When server is ready to requests
    private onReadyListeners: OnReadyFn[] = [];

    // msg handler record for each msg type
    private readonly msgHandlers: Record<string, msgHandlerFn> = {
        "game-status": (data: ServerMsg): void => {
            for (let listener of Object.values(this.listeners)) {
                if (listener.type == "game-status") {
                    if ((listener as GameStatusListener).callback(data)) break;
                }
            }
        },
        kill: (data: ServerMsg): void => {
            for (let listener of Object.values(this.listeners)) {
                if (listener.type == "kill") {
                    if ((listener as KillListener).callback(data)) break;
                }
            }
        },
        "remain-players": (data: ServerMsg): void => {
            for (let listener of Object.values(this.listeners)) {
                if (listener.type == "remain-players") {
                    if ((listener as RemainPlayersListener).callback(data)) break;
                }
            }
        },
        enemy: (data: ServerMsg): void => {
            for (let listener of Object.values(this.listeners)) {
                if (listener.type == "enemy") {
                    if ((listener as EnemyListener).callback(data)) break;
                }
            }
        },

        "game-time": (data: ServerMsg): void => {
            for (let listener of Object.values(this.listeners)) {
                if (listener.type == "game-time") {
                    if ((listener as GameTimeListener).callback(data)) break;
                }
            }
        },

        "game-state": (data: ServerMsg): void => {
            for (let listener of Object.values(this.listeners)) {
                if (listener.type == "game-state") {
                    if ((listener as GameStateListener).callback(data)) break;
                }
            }
        }

    };

    constructor(host: string, port: number) {
        this.host = host;
        this.port = port;

        if (process.env.NODE_ENV != "production" && !this.port) {
            console.warn(
                "Port is not set in local developent this should be set: ",
                `${this.host}:${this.port}`
            );
        }

        Logger.info("WebSocket client initing in host: ", `${this.host}`);
    }

    private handleServerMsg(message: any) {
        const data = JSON.parse(message.data) as ServerMsg;

        if (data.type == "broadcast" || data.type == "send") {
            this.msgHandlers[data.content.msgType](data);
        } else {
            for (let listener of Object.values(this.listeners)) {
                if (listener.type == "response") {
                    if ((listener as ResponseListener).callback(data)) break;
                }
            }
        }
    }

    private onConnectionReady(event: Event) {
        this.connected = true;

        for (let listener of Object.values(this.listeners)) {
            if (listener.type == "connection") {
                if ((listener as OnConnectionListener).callback(event)) break;
            }
        }

        for (let onReady of this.onReadyListeners) {
            onReady();
        }

        this.onReadyListeners = [];

        this.socket.addEventListener("message", (message) => {
            this.handleServerMsg(message);
        });
    }

    private onConnectionLost(event: Event) {
        this.connected = false;

        for (let listener of Object.values(this.listeners)) {
            if (listener.type == "connection-lost") {
                if ((listener as ConnectionLostListener).callback(event)) break;
            }
        }
    }

    request(message: RequestMsg): Promise<ServerMsg> {
        return new Promise<ServerMsg>((resolve, reject) => {
            if (this.connected) {
                // Sends the request to the server
                this.socket.send(JSON.stringify(message));

                // Add response listener
                const responseListener = this.addListener("response", (msg: ServerMsg) => {
                    if (msg.type == "response" && msg.uuid == message.uuid) {
                        this.remListener(responseListener.id);
                        resolve(msg);
                        return true;
                    }
                    return false;
                });

                // If there is no response in 2 seconds reject
                setTimeout(() => {
                    this.remListener(responseListener.id);
                    reject("Request timeout.");
                }, 5000);
            } else {
                reject("Client is not connect to backend.");
            }
        });
    }

    start(): void {
        // In production PORT is not required due to load balancing check if port is set
        const connectionString = this.port ? `${this.host}:${this.port}` : `${this.host}`;

        this.socket = new WebSocket(connectionString);

        this.socket.addEventListener("open", (event) => {
            Logger.info("Connected to backend.");

            this.onConnectionReady(event);
        });

        this.socket.addEventListener("close", (event) => {
            this.onConnectionLost(event);

            if (this.reconnect) {
                setTimeout(() => {
                    Logger.info("Trying to reconnect...");
                    this.start();
                }, 1000);
            }
        });
    }

    close(): void {
        Logger.info("WebSocket client closing in host: ", this.host);

        this.reconnect = false;
        this.socket.close();
    }

    onReady(fn: OnReadyFn) {
        if (this.connected) {
            fn();
        } else {
            this.onReadyListeners.push(fn);
        }
    }

    async whenReady(): Promise<void> {
        return new Promise((resolve, reject) => {
            const checkConnection = () => {
                if (this.connected) {
                    resolve();
                } else {
                    setTimeout(checkConnection, 1000);
                }
            };
            checkConnection();
        });
    }

    //
    //  Listeners to add and remove ids
    //

    addListener(type: "connection", fn: OnConnectionFn): OnConnectionListener;
    addListener(type: "connection-lost", fn: OnConnectionLostFn): ConnectionLostListener;
    addListener(type: "game-status", fn: OnGameStatusFn): GameStatusListener;
    addListener(type: "remain-players", fn: OnRemainPlayersFn): RemainPlayersListener;
    addListener(type: "kill", fn: OnKillFn): KillListener;
    addListener(type: "enemy", fn: OnEnemyFn): EnemyListener;
    addListener(type: "response", fn: OnResponseFn): ResponseListener;
    addListener(type: "game-state", fn: OnGameStateFn): GameStateListener;

    addListener(type: "game-time", fn: OnGameTimeFn): GameTimeListener;
    addListener(type: ListenerTypes, fn: OnListenerFns): Listener {
        const id = uuidv4();
        Logger.info("Adicionando listener: ", id);
        Logger.info("Listeners: ", this.listeners);

        const listener = {
            type: type,
            callback: fn,
            destroy: () => this.remListener(id),
            id: id
        };

        this.listeners[id] = listener;

        return listener;
    }

    remListener(id: string): void {
        Logger.info("Removendo Listener: ", id);
        delete this.listeners[id];
    }

    isConnected() {
        return this.connected;
    }
}

export { WSClient };
