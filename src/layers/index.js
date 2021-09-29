import { PlayerLayer } from "./player";
import { BgLayer } from "./background";
import { BaseMove } from "./base-move";
import { Map } from "./map";

let layers = [];

const initLayers = (app) => {
    // Connect layers to the stack
    layers.push(new BaseMove(app));
    layers.push(new BgLayer(app));
    layers.push(new PlayerLayer(app));
    layers.push(new Map(app));

    // Call onAttach method
    layers.forEach((layer) => {
        layer.onAttach();
    });
}

export { initLayers, layers };