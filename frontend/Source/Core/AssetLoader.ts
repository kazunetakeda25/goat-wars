import { BaseTextureCache } from "@pixi/utils";
import { Application, BaseRenderTexture, Loader, LoaderResource, SCALE_MODES, settings } from "pixi.js";
import { ParticipantDetails } from "../Clients/Strapi";

type Resource = {
    name:string;
    url:string;
}
type Dict<T> = {
    [key: string]: T;
};

class AssetLoader {

    private app: Application;
    private assets:Set<string> = new Set();
    private loadedResources:Dict<LoaderResource> = {}; 

    constructor (app:Application) {
        this.app = app;
    }

    async loadSpriteSheets (playerDetails:ParticipantDetails[], callBack?:()=>void):Promise<void> {

        playerDetails.map (d => {
            if(d.spritesheet.indexOf ("_beta") == -1) {
                const url = this.getImageURL(d, d.spritesheet);
                if (!this.assets.has(url)) {
                    this.assets.add(url);
                    this.app.loader.add(d.spritesheet, url);
                }
            }
        });
        
        settings.SCALE_MODE = SCALE_MODES.NEAREST;
        this.app.loader.load( (loader: Loader, resources: Dict<LoaderResource>) => {
            Object.assign(this.loadedResources, resources);
            if (callBack) callBack();
            }
        );

    }

    loadFromJSON (res:Record<string, any>, callBack?:()=>void) {
        res["packs"].forEach((pack: string) => { 
            const resource:Resource[]= res[pack];
            resource.forEach( asset => {
                if (!this.assets.has(asset.url)) {
                    this.app.loader.add(asset);
                    this.assets.add(asset.url);
                }
            });
        });

              settings.SCALE_MODE = SCALE_MODES.NEAREST;
        this.app.loader.load( (loader: Loader, resources: Dict<LoaderResource>) => {
            Object.assign(this.loadedResources, resources);
            if (callBack) callBack();
            }
        );
        
    }

    getImageURL (detail:ParticipantDetails, imageName:string) {
        const urlELements = detail.image.split('/');
        urlELements.pop();
        urlELements.push(imageName);
        return urlELements.join("/");
    }

}

export { AssetLoader, Resource }