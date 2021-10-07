import * as PIXI from "pixi.js";

// Initialization systems
import { initInputs } from "./inputs/inputs";

// Main game loop
import { gameLoop } from "./game-loop";

// Require the resources.json
import resource from "./resource.json";
import { initLayers } from "./layers";
import { initSystems } from "./ecs/systems";

const $ = (name) => {
    return document.querySelector(name);
}

const ROOT = $("#root");

// Current application
let app;
let client;

const main = () => {
    
    // Create a PIXI application
    app = new PIXI.Application({
        resolution: devicePixelRatio,
        backgroundColor: 0xAAAAAA,
        resizeTo: ROOT
    });

    // Append the base application to the root div of index.html
    ROOT.appendChild(app.view);

    // Make sure that the application is able to listen to events
    app.stage.interactive = true;

    // Add all resources to loader queue
    resource["packs"].forEach((pack) => {
        app.loader.add(resource[pack]);
    });

    // Set callback funtion to call when resources were loaded
    app.loader.onComplete.add(() => {
        initGame(app, client);
    });

    // Effectlly load all the resources
    app.loader.load();
}

const initGame = (app) => {

    // Start the event listeners and inti the input system
    initInputs(app);

    initLayers(app);

    initSystems();

    // Start the game loop
    app.ticker.add(gameLoop);
}

// Call the main function and start the app.
main();
