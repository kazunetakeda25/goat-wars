//
//  Assets directories
//

const ICON_DIR = "../assets/icons/";
const IMAGE_DIR = "../assets/images/";
const SPRITE_DIR = "../assets/sprites/";
const SPRITESHEET_DIR = "../assets/spritesheets/";
const BGPACK_DIR = "../assets/bg-pack/"


const resources = {
    "bg-pack": [
        { "name": "bg1", "url": "../assets/bg-pack/bg-back.png" },
        { "name": "bg2", "url": "../assets/bg-pack/bg-clouds.png" },
        { "name": "bg3", "url": "../assets/bg-pack/bg-trees3.png" },
        { "name": "bg4", "url": "../assets/bg-pack/bg-trees2.png" },
        { "name": "bg5", "url": "../assets/bg-pack/bg-trees1.png" },
        { "name": "bg6", "url": "../assets/bg-pack/bg-terrain.png" }
    ],
    "ui-pack": [
        { "name": "lifebar", "url": "../assets/ui-pack/teste.png" }
    ],
    "player-pack": [
        { "name": "player", "url": "../assets/player-pack/player.png" },
        { "name": "shots", "url": "../assets/player-pack/shots.png" },
        { "name": "bullets", "url": "../assets/player-pack/bullet.png" }
    ],
    "enemy-pack": [
        { "name": "enemy", "url": "../assets/enemy-pack/enemy.png" },
        { "name": "enemy-bullets", "url": "../assets/enemy-pack/enemy-bullet.png" }
    ],
    "tutorial-pack": [
        { "name": "mage", "url": "../assets/sprites/mage.png" },
        { "name": "paper", "url": "../assets/sprites/paperscroll.png" }
    ]
}

//  Constants
const ROOT_DIV = document.querySelector("#root");

//  Physical constants
const GRAVITY = 15.8;

//  In game used key codes

const KEY_CODE = {
    KEY_W: 87,
    KEY_S: 83,
    KEY_A: 65,
    KEY_D: 68,
    KEY_ESC: 27,
    KEY_SPACE: 32
};

const MOUSE_CODE = {
    MOUSE_LEFT: 0,
    MOUSE_MIDDLE: 1,
    MOUSE_RIGTH: 2,
};

//
//  Data containers
//

//  Represent the current state of the key
//  true == down  /  false == up
const input = {
    key: {},
    btn: {},
    cursorPos: { x: 0, y: 0 }
};

//  Parallax background data
const background = {
    layers: [],
    number: 6,
    texWidth: 560,
    texHeight: 315,
    parallax: 2.0,
    currentX: 0.0,
    terrainFactor: 0.86984
};

const world = {
    down: 0.0,
    up: 0.0,
    width: 0.0,
    height: 0.0
};

const player = {
    sheet: {},
    shotSheet: {},
    sprite: {},
    shotSprite: {},
    texWidth: 492,
    texHeight: 400,
    shotWidth: 492,
    shotHeight: 200,
    sheetWidth: 82,
    sheetHeight: 100,
    right: true,
    velocityY: 0.0,
    jumping: false,
    doubleJumping: false,
    lastJump: 0.0,
    shoting: false,
    hits: 0,
};

const enemyBullets = {
    sheet: [],
    number: 0,
    sprites: [],
    velocitys: [],
    times: [],
    appInstance: {},
    lastShot: 0.0
};

const enemy = {
    sheet: {},
    sprite: {},
    texWidth: 120,
    texHeight: 170,
    sheetWidth: 40,
    sheetHeight: 85,
    right: true,
    velocityY: 0.0,
    jumping: false,
    hits: 0
};

//  Bullets control

const bullets = {
    sheet: [],
    number: 0,
    sprites: [],
    velocitys: [],
    times: [],
    appInstance: {},
    lastShot: 0.0
};

//
//  Handled by PIXI
//
const handlePointerMove = (event) => {
    let pos = event.data.global;

    input.cursorPos.x = pos.x;
    input.cursorPos.y = pos.y;
};

//
//  Handled by default browser event system
//

//  When some key is pressed down
const handleKeyDown = (event) => {
    input.key[event.keyCode] = true;
    if (event.keyCode == KEY_CODE.KEY_ESC)
        closeTutorial();
};

//  When some key is released up
const handleKeyUp = (event) => {
    input.key[event.keyCode] = false;
};

//  When some button is pressed down
const handleMouseBtnDown = (event) => {
    input.btn[event.button] = true;
};

//  When some button is released up
const handleMouseBtnUp = (event) => {
    input.btn[event.button] = false;
};

//  When mouse wheel is activated
const handleMouseWheel = (event) => {
    let up = (event.wheelDelta > 0) ? true : false;
};

//
//  Tutorial
//

const tutorial = {
    mage: {},
    paper: {},
    text: {},
    appInstance: {}
}

const closeTutorial = () => {
    tutorial.appInstance.stage.removeChild(tutorial.mage);
    tutorial.appInstance.stage.removeChild(tutorial.paper);
    tutorial.appInstance.stage.removeChild(tutorial.text);
}

const showTutorial = (app) => {
    tutorial.mage = new PIXI.Sprite(app.loader.resources["mage"].texture);
    tutorial.paper = new PIXI.Sprite(app.loader.resources["paper"].texture);

    tutorial.mage.x = 700;

    tutorial.text = new PIXI.Text("Use as teclas [ a, d, space ] para se mexer.\nE utilize o botão esquerdo do mouse para atirar\n-ESC para fechar o tutorial-");
    tutorial.text.anchor.set(0.5);
    tutorial.text.x = 350;
    tutorial.text.y = 150;

    app.stage.addChild(tutorial.mage);
    app.stage.addChild(tutorial.paper);
    app.stage.addChild(tutorial.text);

    tutorial.appInstance = app;
}

//  Software entry point
window.onload = () => {
    
    //  Create a PIXI application
    let app = new PIXI.Application({
        resolution: devicePixelRatio,
        backgroundColor: 0xAAAAAA,
        resizeTo: ROOT_DIV
    });

    //  Attach the app view to root div in index.html
    ROOT_DIV.appendChild(app.view);

    app.loader
        .add(resources["bg-pack"])
        .add(resources["ui-pack"])
        .add(resources["player-pack"])
        .add(resources["tutorial-pack"])
        .add(resources["enemy-pack"]);

    app.loader.onComplete.add(() => {
        initLevel(app);
        showTutorial(app);
    });
    app.loader.load();

    // Allow the interactive mode of PIXI
    app.stage.interactive = true;

    // Set the PIXI event listener
    app.stage.on("pointermove", handlePointerMove);

    // Remove the default behavior of browser of open contextmenu
    // when right mouse button is pressed on page
    document.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    }, false);

    // Set the browser event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseBtnDown);
    window.addEventListener("mouseup", handleMouseBtnUp);
    window.addEventListener("wheel", handleMouseWheel);
};

//
//  Parallax Background functions
//

const initWorld = (app) => {
    world.width = app.view.width;
    world.height = app.view.height;
    world.down = (app.view.height - (app.view.height * background.terrainFactor));
    world.up = app.view.height;
}

const createBg = (texture, app) => {
    let tiling = new PIXI.TilingSprite(texture, app.view.width, app.view.height);
    tiling.position.set(0.0);

    let factorX = app.view.width / background.texWidth;
    let factorY = app.view.height / background.texHeight;

    tiling.tileScale.x = factorX;
    tiling.tileScale.y = factorY;
    app.stage.addChild(tiling);

    return tiling;
};

const initBg = (app) => {
    for (i = 1; i <= background.number; ++i) {
        background.layers.push(createBg(app.loader.resources[`bg${i}`].texture, app));
    }
};

const updateBg = () => {
    if (input.key[KEY_CODE.KEY_A])
        background.currentX += background.parallax;
    else if (input.key[KEY_CODE.KEY_D])
        background.currentX -= background.parallax;

    background.layers[0].tilePosition.x = background.currentX / 6;
    background.layers[1].tilePosition.x = background.currentX / 5;
    background.layers[2].tilePosition.x = background.currentX / 4;
    background.layers[3].tilePosition.x = background.currentX / 3;
    background.layers[4].tilePosition.x = background.currentX / 2;
    background.layers[5].tilePosition.x = background.currentX / 1;
};

const initPlayer = (app) => {
    let ssheet = new PIXI.BaseTexture.from(app.loader.resources["player"].url);
    let shotSshet = new PIXI.BaseTexture.from(app.loader.resources["shots"].url);
    let w = player.sheetWidth;
    let h = player.sheetHeight;

    player.sheet["right"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(0, 0, w, h))
    ];

    player.sheet["left"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(0, h, w, h))
    ];

    player.sheet["walkright"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(1 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(2 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(3 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(4 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(5 * w, 0, w, h)),
    ]

    player.sheet["walkleft"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(1 * w, h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(2 * w, h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(3 * w, h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(4 * w, h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(5 * w, h, w, h)),
    ]

    player.shotSheet["shotright"] = [
        new PIXI.Texture(shotSshet, new PIXI.Rectangle(0 * w, 0, w, h)),
        new PIXI.Texture(shotSshet, new PIXI.Rectangle(1 * w, 0, w, h)),
        new PIXI.Texture(shotSshet, new PIXI.Rectangle(2 * w, 0, w, h)),
        new PIXI.Texture(shotSshet, new PIXI.Rectangle(3 * w, 0, w, h)),
        new PIXI.Texture(shotSshet, new PIXI.Rectangle(4 * w, 0, w, h)),
        new PIXI.Texture(shotSshet, new PIXI.Rectangle(5 * w, 0, w, h)),
    ]

    player.shotSheet["shotleft"] = [
        new PIXI.Texture(shotSshet, new PIXI.Rectangle(0 * w, h, w, h)),
        new PIXI.Texture(shotSshet, new PIXI.Rectangle(1 * w, h, w, h)),
        new PIXI.Texture(shotSshet, new PIXI.Rectangle(2 * w, h, w, h)),
        new PIXI.Texture(shotSshet, new PIXI.Rectangle(3 * w, h, w, h)),
        new PIXI.Texture(shotSshet, new PIXI.Rectangle(4 * w, h, w, h)),
        new PIXI.Texture(shotSshet, new PIXI.Rectangle(5 * w, h, w, h)),
    ]

    player.sprite = new PIXI.AnimatedSprite(player.sheet["right"]);
    player.sprite.animationSpeed = 0.5;
    player.sprite.loop = false;

    player.sprite.anchor.set(1.0);
    player.sprite.x = app.view.width / 2;
    player.sprite.y = Math.round(app.view.height - world.down) + 1;

    player.shotSprite = new PIXI.AnimatedSprite(player.shotSheet["shotright"]);
    player.shotSprite.animationSpeed = 1.0;
    player.shotSprite.loop = false;
    player.shotSprite.visible = false;

    player.shotSprite.anchor.set(1.0);
    player.shotSprite.x = app.view.width / 2;
    player.shotSprite.y = Math.round(app.view.height - world.down) + 1;

    player.shotSprite.onComplete = () => {
        player.shoting = false;
        player.shotSprite.visible = false;
    }

    app.stage.addChild(player.sprite);
    app.stage.addChild(player.shotSprite);
}

const playerJump = () => {
    if (!player.jumping) {
        player.velocityY = 12.0;
        player.jumping = true;
        player.lastJump = 0.0;
    } else if ((!player.doubleJumping) && (player.lastJump >= 0.5)) {
        player.velocityY += 15.0;
        player.doubleJumping = true;
        player.lastJump = 0.0;
    }
}

const updatePlayerJump = () => {
    if (player.jumping) {
        player.sprite.y = Math.round(player.sprite.y - player.velocityY);
        player.velocityY -= GRAVITY * 0.030
    }
    if (player.sprite.y >= Math.round(world.height - world.down) + 1) {
        velocityY = 0.0;
        player.jumping = false;
        player.doubleJumping = false;
        player.sprite.y = Math.round(world.height - world.down) + 1;
    }
    player.shotSprite.y = player.sprite.y;
    player.lastJump += 0.016;
}

const updatePlayer = () => {
    if (input.key[KEY_CODE.KEY_A]) {
        if (!player.sprite.playing) {
            player.sprite.textures = player.sheet["walkleft"];
            player.sprite.play();
        }
        player.right = false;
        player.sprite.x -= 1.5;
    } else if (input.key[KEY_CODE.KEY_D]) {
        if (!player.sprite.playing) {
            player.sprite.textures = player.sheet["walkright"];
            player.sprite.play();
        }
        player.right = true;
        player.sprite.x += 1.5;
    }

    if (input.key[KEY_CODE.KEY_SPACE]) {
        playerJump();
    }
    player.shotSprite.x = player.sprite.x;

    if (input.btn['0']) {
        if (bullets.lastShot >= 0.5) {
            player.shoting = true;
            player.shotSprite.visible = true;
            createShot();
        }
    }

    if (player.shoting) {
        if (!player.shotSprite.playing && player.right) {
            player.shotSprite.textures = player.shotSheet["shotright"];
            player.shotSprite.play();
        }
        if ((!player.shotSprite.playing) && (!player.right)) {
            player.shotSprite.textures = player.shotSheet["shotleft"];
            player.shotSprite.play();
        }
    }

    updatePlayerJump();
};

const initBullets = (app) => {
    let ssheet = new PIXI.BaseTexture.from(app.loader.resources["bullets"].url);
    let enemySsheet = new PIXI.BaseTexture.from(app.loader.resources["enemy-bullets"].url);
    let w = 21;
    let h = 21;

    for (i = 0; i < 15; ++i) {
        bullets.sheet.push(new PIXI.Texture(ssheet, new PIXI.Rectangle(i * w, 0, w, h)));
        enemyBullets.sheet.push(new PIXI.Texture(enemySsheet, new PIXI.Rectangle(i * w, 0, w, h)))
    }

    bullets.appInstance = app;
    enemyBullets.appInstance = app;
}

const createShot = (app) => {
    let sprite = new PIXI.AnimatedSprite(bullets.sheet);
    sprite.animationSpeed = 0.8;
    sprite.loop = true;
    sprite.anchor.set(0.5);
    if (player.right) {
        sprite.x = player.sprite.x;
    } else {
        sprite.x = player.sprite.x - player.sheetWidth;
    }
    sprite.y = Math.round(player.sprite.y - player.sheetHeight);

    let difX = input.cursorPos.x - sprite.x;
    let difY = input.cursorPos.y - sprite.y;
    let length = Math.sqrt((difX ** 2) + (difY ** 2));

    difX /= length;
    difY /= length;

    bullets.appInstance.stage.addChild(sprite);
    sprite.play();
    bullets.sprites.push(sprite);
    bullets.velocitys.push({x: difX, y: difY});
    bullets.times.push(0.0);

    bullets.number++;
    bullets.lastShot = 0.0;
};

const createEnemyShot = (app) => {
    if (enemyBullets.lastShot <= 2.0)
        return;

    let sprite = new PIXI.AnimatedSprite(enemyBullets.sheet);
    sprite.animationSpeed = 0.8;
    sprite.loop = true;
    sprite.anchor.set(0.5);
    if (enemy.right) {
        sprite.x = enemy.sprite.x;
    } else {
        sprite.x = enemy.sprite.x - enemy.sheetWidth;
    }
    sprite.y = Math.round(enemy.sprite.y - enemy.sheetHeight);

    let difX = player.sprite.x - sprite.x;
    let difY = player.sprite.y - sprite.y;
    let length = Math.sqrt((difX ** 2) + (difY ** 2));

    difX /= length;
    difY /= length;

    enemyBullets.appInstance.stage.addChild(sprite);
    sprite.play();
    enemyBullets.sprites.push(sprite);
    enemyBullets.velocitys.push({x: difX, y: difY});
    enemyBullets.times.push(0.0);

    enemyBullets.number++;
    enemyBullets.lastShot = 0.0;
}

const updateEnemyShot = () => {
    let difX = player.sprite.x - enemy.sprite.x;
    let difY = player.sprite.y - enemy.sprite.y;
    let length = Math.sqrt((difX ** 2) + (difY ** 2));

    difX /= length;
    difY /= length;

    for (i = 0; i < enemyBullets.number; ++i) {
        if (shotIntersectRect(enemyBullets.sprites[i], player))
            player.hits++;

        enemyBullets.velocitys[i].x = difX;
        enemyBullets.velocitys[i].y = difY;

        enemyBullets.sprites[i].x += enemyBullets.velocitys[i].x * 8;
        enemyBullets.sprites[i].y += enemyBullets.velocitys[i].y * 8;

        if (enemyBullets.times[i] >= 5.0 || enemyBullets.sprites[i].y >= Math.round(world.height - world.down) + 1) {
            enemyBullets.appInstance.stage.removeChild(enemyBullets.sprites[i]);
            enemyBullets.sprites.splice(i, 1);
            enemyBullets.velocitys.splice(i, 1);
            enemyBullets.times.splice(i, 1);
            enemyBullets.number--;
        } else {
            enemyBullets.times[i] += 0.016;
        }
    }
    enemyBullets.lastShot += 0.016;
};

const updateShot = () => {
    for (i = 0; i < bullets.number; ++i) {
        if (shotIntersectRect(bullets.sprites[i], enemy))
            enemy.hits++;

        bullets.sprites[i].x += bullets.velocitys[i].x * 15;
        bullets.sprites[i].y += bullets.velocitys[i].y * 15;

        if (bullets.times[i] >= 1.1 || bullets.sprites[i].y >= Math.round(world.height - world.down) + 1) {
            bullets.appInstance.stage.removeChild(bullets.sprites[i]);
            bullets.sprites.splice(i, 1);
            bullets.velocitys.splice(i, 1);
            bullets.times.splice(i, 1);
            bullets.number--;
        } else {
            bullets.times[i] += 0.016;
        }
    }
    bullets.lastShot += 0.016;
};

const initEnemy = (app) => {
    let ssheet = new PIXI.BaseTexture.from(app.loader.resources["enemy"].url);
    let w = enemy.sheetWidth;
    let h = enemy.sheetHeight;

    enemy.sheet["walkright"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(1 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(2 * w, 0, w, h))
    ];

    enemy.sheet["walkleft"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(1 * w, h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(2 * w, h, w, h))
    ];

    enemy.sprite = new PIXI.AnimatedSprite(enemy.sheet["walkright"]);
    enemy.sprite.animationSpeed = 0.5;
    enemy.sprite.loop = false;

    enemy.sprite.anchor.set(1.0);
    enemy.sprite.x = app.view.width / 3;
    enemy.sprite.y = Math.round(app.view.height - world.down) + 1;

    app.stage.addChild(enemy.sprite);
}

const enemyJump = () => {
    if (!enemy.jumping) {
        enemy.velocityY = 25.0;
        enemy.jumping = true;
        enemy.lastJump = 0.0;
    }
}

const updateEnemyJump = () => {
    if (enemy.jumping) {
        enemy.sprite.y = Math.round(enemy.sprite.y - enemy.velocityY);
        enemy.velocityY -= GRAVITY * 0.030
    }
    if (enemy.sprite.y >= Math.round(world.height - world.down) + 1) {
        velocityY = 0.0;
        enemy.jumping = false;
        enemy.sprite.y = Math.round(world.height - world.down) + 1;
    }
    enemy.lastJump += 0.016;
}

const updateEnemy = (follow) => {
    if ((player.sprite.x - enemy.sprite.x) >= 0 && (player.sprite.x - enemy.sprite.x) <= 200 && (!follow)) {
        if (!enemy.sprite.playing) {
            enemy.sprite.textures = enemy.sheet["walkleft"];
            enemy.sprite.play();
        }
        enemy.right = false;
        enemy.sprite.x -= 1.5;
    }
    if ((player.sprite.x - enemy.sprite.x) <= 0 && (player.sprite.x - enemy.sprite.x) >= -200 && (!follow)) {
        if (!enemy.sprite.playing) {
            enemy.sprite.textures = enemy.sheet["walkright"];
            enemy.sprite.play();
        }
        enemy.right = true;
        enemy.sprite.x += 1.5;
    }
    if (follow) {
        if ((player.sprite.x - enemy.sprite.x) >= 0) {
            if (!enemy.sprite.playing) {
                enemy.sprite.textures = enemy.sheet["walkright"];
                enemy.sprite.play();
            }
            enemy.right = true;
            enemy.sprite.x += 1.5;
        } else {
            if (!enemy.sprite.playing) {
                enemy.sprite.textures = enemy.sheet["walkleft"];
                enemy.sprite.play();
            }
            enemy.right = false;
            enemy.sprite.x -= 1.5;
        }
    }
    if (Math.abs(player.sprite.x - enemy.sprite.x) < 150) {
        enemyJump();
    }

    if (enemyBullets.lastShot >= 2.5) {
        createEnemyShot();
    }

    updateEnemyJump();
}

const shotIntersectRect = (a, b) => {
    let aPosX = a.x;
    let aPosY = a.y;
    let bPosX = b.sprite.x;
    let bPosY = b.sprite.y;
    let bWidth = b.sprite.width;
    let bHeight = b.sprite.height;

    return (((bPosX - bWidth) < aPosX) && (aPosX < bPosX) && ((bPosY - bHeight) < aPosY) && (aPosY < bPosY));
}

//
//  Main game loop and level initialization
//

const initLevel = (app) => {
    initBg(app);
    initWorld(app);
    initEnemy(app);
    initPlayer(app);
    initBullets(app);
    app.ticker.add(gameLoop);
};

let lastRand = 0.0;
let follow = false;

const gameLoop = () => {

    const setRand = () => {
        if (lastRand >= 1.0) {
            follow = (Math.random() < 0.2);
            lastRand = 0.0;
        }
        lastRand += 0.016;
    }

    setRand();
    updateBg();
    updateEnemy(follow);
    updatePlayer();
    updateShot();
    updateEnemyShot();

    console.log(player.hits);
    console.log(enemy.hits);
};