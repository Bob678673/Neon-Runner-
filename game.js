
/* =========================================================
   NEON RUNNER
   ERWEITERTE VERSION
   - 10 Skins
   - Multiplikator + Jump Bonus
   - Zufällige Parkours
   - Unterschiedliche Abstände
   - Sprung-/Slide-/normale Hindernisse
   - Jump / Slide / Dash
   - Lebenssystem
   - Langsame Regeneration
   - 3 Bosse bei 500 / 1000 / 2000
   - Boss KI mit Springen / Sliden / Schießen / Ausweichen
   - Waffe + Schießen
   - Boss- und Spieler-Lebensbalken
   - Info-Menü mit Tastaturbelegung
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* =========================================================
   HTML
========================================================= */

const homeScreen = document.getElementById("homeScreen");
const shopScreen = document.getElementById("shopScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const pauseScreen = document.getElementById("pauseScreen");

const mobileControls = document.getElementById("mobileControls");

const scoreElement = document.getElementById("scoreValue");
const coinElement = document.getElementById("coinValue");
const levelElement = document.getElementById("levelValue");

const homeCoinValue = document.getElementById("homeCoinValue");
const shopCoinValue = document.getElementById("shopCoinValue");

const finalScoreElement = document.getElementById("finalScore");
const finalCoinsElement = document.getElementById("finalCoins");
const finalLevelElement = document.getElementById("finalLevel");

const gameOverHighScoreElement =
    document.getElementById("gameOverHighScore");

const skinGrid = document.getElementById("skinGrid");

/* =========================================================
   BUTTONS
========================================================= */

const playButton = document.getElementById("playButton");
const shopButton = document.getElementById("shopButton");
const shopBackButton = document.getElementById("shopBackButton");

const restartButton = document.getElementById("restartButton");
const homeButton = document.getElementById("homeButton");
const gameOverHomeButton =
    document.getElementById("gameOverHomeButton");

const resumeButton = document.getElementById("resumeButton");
const pauseRestartButton =
    document.getElementById("pauseRestartButton");

const jumpButton = document.getElementById("jumpButton");
const dashButton = document.getElementById("dashButton");
const slideButton = document.getElementById("slideButton");

/* =========================================================
   CANVAS
========================================================= */

let width = window.innerWidth;
let height = window.innerHeight;
let pixelRatio = 1;

function resizeCanvas() {

    pixelRatio =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );

    resetPlayer();
}

window.addEventListener(
    "resize",
    resizeCanvas
);

/* =========================================================
   SPEICHER
========================================================= */

let totalCoins =
    Number(
        localStorage.getItem(
            "neonRunnerCoins"
        )
    ) || 0;

let highScore =
    Number(
        localStorage.getItem(
            "neonRunnerHighScore"
        )
    ) || 0;

let selectedSkin =
    localStorage.getItem(
        "neonRunnerSkin"
    ) || "cyan";

let ownedSkins;

try {

    ownedSkins = JSON.parse(
        localStorage.getItem(
            "neonRunnerSkins"
        ) || '["cyan"]'
    );

} catch {

    ownedSkins = ["cyan"];
}

if (!ownedSkins.includes("cyan")) {
    ownedSkins.unshift("cyan");
}

/* =========================================================
   10 SKINS
========================================================= */

const skins = [

    {
        id: "cyan",
        name: "CYBER",
        price: 0,
        body: "#00ffff",
        visor: "#ff00cc",
        glow: "#00ffff",
        jump: 0,
        multiplier: 1
    },

    {
        id: "pink",
        name: "NEON PINK",
        price: 50,
        body: "#ff1493",
        visor: "#ffffff",
        glow: "#ff1493",
        jump: 0.5,
        multiplier: 1.1
    },

    {
        id: "gold",
        name: "GOLD",
        price: 100,
        body: "#ffd700",
        visor: "#ff6600",
        glow: "#ffd700",
        jump: 1,
        multiplier: 1.25
    },

    {
        id: "matrix",
        name: "MATRIX",
        price: 150,
        body: "#00ff66",
        visor: "#ffffff",
        glow: "#00ff66",
        jump: 1.3,
        multiplier: 1.4
    },

    {
        id: "void",
        name: "VOID",
        price: 250,
        body: "#9d4edd",
        visor: "#00ffff",
        glow: "#9d4edd",
        jump: 1.7,
        multiplier: 1.5
    },

    {
        id: "ice",
        name: "ICE",
        price: 400,
        body: "#66eaff",
        visor: "#ffffff",
        glow: "#66eaff",
        jump: 2.1,
        multiplier: 1.7
    },

    {
        id: "inferno",
        name: "INFERNO",
        price: 600,
        body: "#ff3030",
        visor: "#ffff00",
        glow: "#ff3030",
        jump: 2.5,
        multiplier: 1.9
    },

    {
        id: "plasma",
        name: "PLASMA",
        price: 850,
        body: "#ff6600",
        visor: "#00ffff",
        glow: "#ff6600",
        jump: 2.8,
        multiplier: 2
    },

    {
        id: "ghost",
        name: "GHOST",
        price: 1200,
        body: "#eeeeee",
        visor: "#00ffff",
        glow: "#ffffff",
        jump: 3.2,
        multiplier: 2.2
    },

    {
        id: "galaxy",
        name: "GALAXY",
        price: 2000,
        body: "#b026ff",
        visor: "#ffe600",
        glow: "#ff00ff",
        jump: 3.6,
        multiplier: 2.5
    }
];

function getSelectedSkin() {

    return (
        skins.find(
            s => s.id === selectedSkin
        ) ||
        skins[0]
    );
}

/* =========================================================
   SHOP
========================================================= */

function renderShop() {

    if (!skinGrid) return;

    skinGrid.innerHTML = "";

    skins.forEach(skin => {

        const card =
            document.createElement("div");

        card.className =
            "skin-card";

        const owned =
            ownedSkins.includes(
                skin.id
            );

        const selected =
            selectedSkin === skin.id;

        card.innerHTML = `

            <div class="skin-preview"
                 style="
                    --skin-color:${skin.body};
                    --skin-glow:${skin.glow};
                 ">

                <div class="mini-head"></div>
                <div class="mini-body"></div>

                <div class="mini-leg left"></div>
                <div class="mini-leg right"></div>

            </div>

            <h3>${skin.name}</h3>

            <div style="
                color:#00ffff;
                font-size:12px;
                margin:5px 0;
            ">
                🦘 +${skin.jump.toFixed(1)}
                &nbsp; 🪙 x${skin.multiplier}
            </div>

            ${
                selected
                ? `
                    <button
                        class="skin-button selected">
                        AUSGEWÄHLT
                    </button>
                  `
                :
                owned
                ? `
                    <button
                        class="skin-button select-skin"
                        data-skin="${skin.id}">
                        AUSWÄHLEN
                    </button>
                  `
                :
                `
                    <button
                        class="skin-button buy-skin"
                        data-skin="${skin.id}">
                        🪙 ${skin.price}
                    </button>
                  `
            }
        `;

        skinGrid.appendChild(card);
    });

    document
        .querySelectorAll(".buy-skin")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    buySkin(
                        button.dataset.skin
                    );
                }
            );
        });

    document
        .querySelectorAll(".select-skin")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    selectSkin(
                        button.dataset.skin
                    );
                }
            );
        });
}

function buySkin(id) {

    const skin =
        skins.find(
            s => s.id === id
        );

    if (!skin) return;

    if (totalCoins < skin.price) {

        alert(
            "Du brauchst noch " +
            Math.ceil(
                skin.price -
                totalCoins
            ) +
            " Münzen!"
        );

        return;
    }

    totalCoins -= skin.price;

    if (!ownedSkins.includes(id)) {
        ownedSkins.push(id);
    }

    selectedSkin = id;

    localStorage.setItem(
        "neonRunnerCoins",
        totalCoins
    );

    localStorage.setItem(
        "neonRunnerSkins",
        JSON.stringify(
            ownedSkins
        )
    );

    localStorage.setItem(
        "neonRunnerSkin",
        selectedSkin
    );

    updateCoinDisplays();
    renderShop();
}

function selectSkin(id) {

    if (!ownedSkins.includes(id)) {
        return;
    }

    selectedSkin = id;

    localStorage.setItem(
        "neonRunnerSkin",
        selectedSkin
    );

    renderShop();
}

/* =========================================================
   GAME STATE
========================================================= */

let gameRunning = false;
let gamePaused = false;

let score = 0;
let coinsCollected = 0;
let level = 1;

let gameSpeed = 6;
let distance = 0;

let lastTime = 0;

let obstacleTimer = 0;
let coinTimer = 0;
let platformTimer = 0;

let obstacleInterval = 1300;
let coinInterval = 700;
let platformInterval = 6500;

let currentParkourType = 0;

/* =========================================================
   LEBEN
========================================================= */

const MAX_PLAYER_HEALTH = 100;

let playerHealth =
    MAX_PLAYER_HEALTH;

let playerDamageCooldown = 0;
let playerRegenDelay = 0;

const PLAYER_REGEN_DELAY = 1.4;
const PLAYER_REGEN_RATE = 4;

/* =========================================================
   BOSSE
========================================================= */

const bossDefinitions = [

    {
        distance: 500,
        name: "NEON GUARDIAN",
        maxHealth: 100,
        speed: 100,
        damage: 10,
        color: "#ff174f"
    },

    {
        distance: 1000,
        name: "CYBER HUNTER",
        maxHealth: 165,
        speed: 125,
        damage: 14,
        color: "#ff6600"
    },

    {
        distance: 2000,
        name: "VOID OVERLORD",
        maxHealth: 260,
        speed: 155,
        damage: 18,
        color: "#b026ff"
    }
];

let boss = null;
let defeatedBosses = [];

let playerProjectiles = [];
let bossProjectiles = [];

let shootCooldown = 0;

/* =========================================================
   PLAYER
========================================================= */

const player = {

    x: 120,
    y: 0,

    width: 42,
    height: 60,

    velocityY: 0,

    gravity: 0.82,
    jumpPower: -15,

    grounded: true,
    sliding: false,

    dashTimer: 0,

    animation: 0,
    runCycle: 0,
    trailPulse: 0,

    currentPlatform: null
};

function getGroundY() {

    return height * 0.82;
}

function resetPlayer() {

    player.x =
        Math.min(
            120,
            width * 0.18
        );

    player.height = 60;

    player.y =
        getGroundY() -
        player.height;

    player.velocityY = 0;

    player.grounded = true;

    player.sliding = false;

    player.dashTimer = 0;

    player.currentPlatform = null;
}

/* =========================================================
   RANDOM PARKOUR
========================================================= */

const obstacles = [];

const parkourPatterns = [

    [
        {
            type: "spike",
            gap: 0
        },
        {
            type: "block",
            gap: 190
        },
        {
            type: "spike",
            gap: 170
        }
    ],

    [
        {
            type: "ceilingSpike",
            gap: 0
        },
        {
            type: "spike",
            gap: 220
        },
        {
            type: "block",
            gap: 160
        }
    ],

    [
        {
            type: "block",
            gap: 0
        },
        {
            type: "ceilingSpike",
            gap: 180
        },
        {
            type: "spike",
            gap: 210
        },
        {
            type: "block",
            gap: 180
        }
    ],

    [
        {
            type: "spike",
            gap: 0
        },
        {
            type: "ceilingSpike",
            gap: 160
        },
        {
            type: "ceilingSpike",
            gap: 170
        },
        {
            type: "spike",
            gap: 230
        }
    ],

    [
        {
            type: "block",
            gap: 0
        },
        {
            type: "spike",
            gap: 150
        },
        {
            type: "block",
            gap: 190
        },
        {
            type: "ceilingSpike",
            gap: 180
        }
    ]
];

function createObstacle(
    forcedType = null,
    forcedX = null
) {

    const type =
        forcedType ||
        (
            Math.random() <
            0.28
                ? "spike"
                : Math.random() <
                    0.62
                    ? "ceilingSpike"
                    : "block"
        );

    const x =
        forcedX !== null
            ? forcedX
            : width + 80;

    if (type === "spike") {

        obstacles.push({

            type: "spike",

            x,

            y:
                getGroundY() -
                38,

            width: 45,

            height: 38,

            damage: 18,

            pulse:
                Math.random() * 6
        });

    } else if (type === "ceilingSpike") {

        /* Deckenfalle: Kette + breiter Stachel. Sliden ist sicher. */
        const spikeTop = 58 + Math.random() * 28;
        const spikeBottom = getGroundY() - 40;

        obstacles.push({
            type: "ceilingSpike",
            x,
            y: spikeTop,
            width: 52,
            height: Math.max(55, spikeBottom - spikeTop),
            damage: 22,
            pulse: Math.random() * 6
        });

    } else {

        const h =
            40 +
            Math.random() * 45;

        const w =
            30 +
            Math.random() * 25;

        obstacles.push({

            type: "block",

            x,

            y:
                getGroundY() -
                h,

            width: w,

            height: h,

            damage: 20,

            pulse:
                Math.random() * 6
        });
    }
}

/* =========================================================
   PARKOUR ERSTELLEN
========================================================= */

const platforms = [];

let bonusParkourActive = false;

function createParkour() {

    const ground =
        getGroundY();

    const startX =
        width + 180;

    currentParkourType =
        Math.floor(
            Math.random() *
            parkourPatterns.length
        );

    const pattern =
        parkourPatterns[
            currentParkourType
        ];

    const verticalVariants = [

        75,
        105,
        135,
        165
    ];

    let cursorX =
        startX;

    pattern.forEach(
        (item, index) => {

            cursorX +=
                item.gap +
                130 +
                Math.random() * 70;

            createObstacle(
                item.type,
                cursorX
            );
        }
    );

    /*
        Zufälliger Plattformbereich
    */

    const platformCount =
        3 +
        Math.floor(
            Math.random() * 3
        );

    let platformX =
        startX + 120;

    for (
        let i = 0;
        i < platformCount;
        i++
    ) {

        const platformWidth =
            95 +
            Math.random() * 65;

        const heightIndex =
            Math.floor(
                Math.random() *
                verticalVariants.length
            );

        const platformY =
            ground -
            verticalVariants[
                heightIndex
            ];

        const platform = {

            x: platformX,

            y: platformY,

            width: platformWidth,

            height: 18,

            index: i,

            pulse:
                Math.random() * 6
        };

        platforms.push(
            platform
        );

        /*
            Münzreihe über Plattform
        */

        const coinCount =
            3 +
            Math.floor(
                Math.random() * 4
            );

        for (
            let c = 0;
            c < coinCount;
            c++
        ) {

            const spacing =
                (
                    platformWidth -
                    25
                ) /
                Math.max(
                    coinCount - 1,
                    1
                );

            createCoin(

                platform.x +
                12 +
                c * spacing,

                platform.y -
                38
            );
        }

        platformX +=
            platformWidth +
            60 +
            Math.random() * 130;
    }

    /*
        Kleine zufällige Münz-Wellen
    */

    const coinStart =
        platformX + 80;

    for (
        let i = 0;
        i < 10;
        i++
    ) {

        createCoin(

            coinStart +
            i * 35,

            ground -
            70 -
            Math.sin(
                i * 0.6
            ) * 45
        );
    }

    bonusParkourActive = true;
}

/* =========================================================
   PLATTFORM UPDATE
========================================================= */

function updatePlatforms(delta) {

    platformTimer +=
        delta * 1000;

    if (
        platformTimer >
            platformInterval &&
        !bonusParkourActive
    ) {

        createParkour();

        platformTimer = 0;

        platformInterval =
            6500 +
            Math.random() * 6500;
    }

    for (
        let i =
            platforms.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            platforms[i];

        p.x -= gameSpeed;

        p.pulse +=
            delta * 4;

        if (
            p.x +
            p.width <
            -100
        ) {

            platforms.splice(
                i,
                1
            );
        }
    }

    if (
        platforms.length === 0 &&
        obstacles.length === 0
    ) {

        bonusParkourActive = false;
    }
}

/* =========================================================
   COINS
========================================================= */

const coins = [];

function createCoin(
    x = width + 70,
    y = null
) {

    if (y === null) {

        const ground =
            getGroundY();

        const positions = [

            ground - 45,
            ground - 65,
            ground - 85,
            ground - 105,
            ground - 125
        ];

        y =
            positions[
                Math.floor(
                    Math.random() *
                    positions.length
                )
            ];
    }

    coins.push({

        x,
        y,

        radius: 10,

        rotation:
            Math.random() *
            Math.PI * 2
    });
}

/* =========================================================
   PARTICLES
========================================================= */

const particles = [];

function createParticles(
    x,
    y,
    color,
    amount = 12
) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI * 2;

        const speed =
            1 +
            Math.random() * 4;

        particles.push({

            x,
            y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            life: 1,

            size:
                2 +
                Math.random() * 3,

            color
        });
    }
}

/* =========================================================
   COLLISION
========================================================= */

function collision(a, b) {

    const padding = 7;

    return (

        a.x + padding <
        b.x +
        b.width -
        padding &&

        a.x +
        a.width -
        padding >
        b.x +
        padding &&

        a.y + padding <
        b.y +
        b.height -
        padding &&

        a.y +
        a.height -
        padding >
        b.y +
        padding
    );
}

/* =========================================================
   COIN COLLISION
========================================================= */

function touchesCoin(coin) {

    const cx =
        player.x +
        player.width / 2;

    const cy =
        player.y +
        player.height / 2;

    const dx =
        cx - coin.x;

    const dy =
        cy - coin.y;

    return Math.sqrt(
        dx * dx +
        dy * dy
    ) < 26;
}

/* =========================================================
   SCHADEN
========================================================= */

let screenShakeTime = 0;
let screenShakeIntensity = 0;
let damageFlashTime = 0;

function damagePlayer(amount) {

    if (
        playerDamageCooldown > 0 ||
        !gameRunning
    ) {
        return;
    }

    playerHealth =
        Math.max(
            0,
            playerHealth - amount
        );

    playerDamageCooldown =
        0.8;

    playerRegenDelay =
        PLAYER_REGEN_DELAY;

    screenShakeTime = 0.3;
    screenShakeIntensity = 8;
    damageFlashTime = 0.45;

    createParticles(
        player.x + player.width / 2,
        player.y + player.height / 2,
        "#ff174f",
        22
    );

    createParticles(
        player.x + player.width / 2,
        player.y + player.height / 2,
        "#ffffff",
        10
    );

    if (
        playerHealth <= 0
    ) {

        endGame();
    }
}

/* =========================================================
   LEBEN UPDATE
========================================================= */

function updatePlayerHealth(delta) {

    if (
        playerDamageCooldown > 0
    ) {

        playerDamageCooldown -=
            delta;
    }

    if (
        playerRegenDelay > 0
    ) {

        playerRegenDelay -=
            delta;

        return;
    }

    if (
        playerHealth <
        MAX_PLAYER_HEALTH
    ) {

        playerHealth =
            Math.min(
                MAX_PLAYER_HEALTH,
                playerHealth +
                PLAYER_REGEN_RATE *
                delta
            );
    }
}

/* =========================================================
   SPRINGEN
========================================================= */

function jump() {

    if (
        !gameRunning ||
        gamePaused
    ) {
        return;
    }

    const skin =
        getSelectedSkin();

    if (player.grounded) {

        player.velocityY =
            player.jumpPower -
            skin.jump;

        player.grounded = false;

        player.currentPlatform =
            null;

        createParticles(

            player.x + 20,

            player.y + 55,

            skin.glow,

            8
        );
    }
}

/* =========================================================
   SLIDE
========================================================= */

function startSlide() {

    if (
        !gameRunning ||
        gamePaused ||
        !player.grounded
    ) {
        return;
    }

    if (player.sliding) {
        return;
    }

    player.sliding = true;

    player.height = 35;

    player.y =
        getGroundY() -
        player.height;
}

function stopSlide() {

    if (!player.sliding) {
        return;
    }

    player.sliding = false;

    player.height = 60;

    player.y =
        getGroundY() -
        player.height;
}

/* =========================================================
   DASH
========================================================= */

function dash() {

    if (
        !gameRunning ||
        gamePaused
    ) {
        return;
    }

    if (player.dashTimer > 0) {
        return;
    }

    player.dashTimer =
        0.35;

    createParticles(

        player.x,

        player.y + 30,

        "#ff00cc",

        20
    );
}

/* =========================================================
   SCHIESSEN
========================================================= */

function shoot() {

    if (
        !gameRunning ||
        gamePaused
    ) {
        return;
    }

    if (
        shootCooldown > 0
    ) {
        return;
    }

    /*
        Schießen funktioniert,
        sobald der erste Boss erreicht
        wurde bzw. die Waffe freigeschaltet ist.
    */

    if (
        defeatedBosses.length === 0 &&
        !boss
    ) {

        /*
            Waffe ist ab Beginn vorhanden.
            So kann man schon üben.
        */
    }

    shootCooldown = 0.22;

    playerProjectiles.push({

        x:
            player.x +
            player.width,

        y:
            player.y +
            player.height * 0.42,

        width: 18,

        height: 5,

        speed: 13,

        damage: 10,

        life: 3
    });

    createParticles(

        player.x +
        player.width,

        player.y +
        player.height * 0.42,

        "#ffe600",

        5
    );
}

/* =========================================================
   START GAME
========================================================= */

function startGame() {

    gameRunning = true;
    gamePaused = false;

    score = 0;
    coinsCollected = 0;
    level = 1;

    gameSpeed = 6;
    distance = 0;

    obstacleTimer = 0;
    coinTimer = 0;
    platformTimer = 0;

    obstacleInterval =
        1100;

    coinInterval =
        700;

    platformInterval =
        6000;

    obstacles.length = 0;
    coins.length = 0;
    platforms.length = 0;
    particles.length = 0;

    playerProjectiles.length = 0;
    bossProjectiles.length = 0;

    defeatedBosses = [];

    boss = null;

    playerHealth =
        MAX_PLAYER_HEALTH;

    playerDamageCooldown = 0;
    playerRegenDelay = 0;

    screenShakeTime = 0;
    screenShakeIntensity = 0;
    damageFlashTime = 0;

    shootCooldown = 0;

    bonusParkourActive = false;

    resetPlayer();

    homeScreen.classList.add(
        "hidden"
    );

    shopScreen.classList.add(
        "hidden"
    );

    gameOverScreen.classList.add(
        "hidden"
    );

    pauseScreen.classList.add(
        "hidden"
    );

    if (mobileControls) {

        mobileControls.style.display =
            "flex";
    }

    updateHUD();

    showPlayerHUD();

    hideBossHUD();

    updateBossHUD();

    lastTime =
        performance.now();

    requestAnimationFrame(
        gameLoop
    );
}

/* =========================================================
   GAME OVER
========================================================= */

function endGame() {

    if (!gameRunning) {
        return;
    }

    gameRunning = false;

    const finalScore =
        Math.floor(score);

    if (
        finalScore >
        highScore
    ) {

        highScore =
            finalScore;

        localStorage.setItem(
            "neonRunnerHighScore",
            highScore
        );
    }

    if (finalScoreElement) {

        finalScoreElement.textContent =
            finalScore;
    }

    if (finalCoinsElement) {

        finalCoinsElement.textContent =
            Math.floor(
                coinsCollected
            );
    }

    if (finalLevelElement) {

        finalLevelElement.textContent =
            level;
    }

    if (gameOverHighScoreElement) {

        gameOverHighScoreElement.textContent =
            highScore;
    }

    gameOverScreen.classList.remove(
        "hidden"
    );

    if (mobileControls) {

        mobileControls.style.display =
            "none";
    }

    updateCoinDisplays();
    hidePlayerHUD();
}

/* =========================================================
   HOME
========================================================= */

function goHome() {

    gameRunning = false;
    gamePaused = false;

    boss = null;

    homeScreen.classList.remove(
        "hidden"
    );

    shopScreen.classList.add(
        "hidden"
    );

    gameOverScreen.classList.add(
        "hidden"
    );

    pauseScreen.classList.add(
        "hidden"
    );

    if (mobileControls) {

        mobileControls.style.display =
            "none";
    }

    hidePlayerHUD();

    updateCoinDisplays();
}

/* =========================================================
   SHOP
========================================================= */

function openShop() {

    gameRunning = false;

    homeScreen.classList.add(
        "hidden"
    );

    shopScreen.classList.remove(
        "hidden"
    );

    gameOverScreen.classList.add(
        "hidden"
    );

    pauseScreen.classList.add(
        "hidden"
    );

    if (mobileControls) {

        mobileControls.style.display =
            "none";
    }

    hidePlayerHUD();

    updateCoinDisplays();

    renderShop();
}

/* =========================================================
   PAUSE
========================================================= */

function pauseGame() {

    if (!gameRunning) {
        return;
    }

    gamePaused = true;

    pauseScreen.classList.remove(
        "hidden"
    );
}

function resumeGame() {

    if (!gameRunning) {
        return;
    }

    gamePaused = false;

    pauseScreen.classList.add(
        "hidden"
    );

    lastTime =
        performance.now();

    requestAnimationFrame(
        gameLoop
    );
}

/* =========================================================
   PLAYER UPDATE
========================================================= */

function updatePlayer(delta) {

    if (player.dashTimer > 0) {

        player.dashTimer -=
            delta;
    }

    const oldBottom =
        player.y +
        player.height;

    player.velocityY +=
        player.gravity;

    player.y +=
        player.velocityY;

    player.grounded = false;

    player.currentPlatform =
        null;

    const ground =
        getGroundY();

    if (
        player.y +
        player.height >=
        ground
    ) {

        player.y =
            ground -
            player.height;

        player.velocityY = 0;

        player.grounded = true;
    }

    for (const p of platforms) {

        const playerRight =
            player.x +
            player.width;

        const playerLeft =
            player.x;

        const platformRight =
            p.x +
            p.width;

        const platformLeft =
            p.x;

        const newBottom =
            player.y +
            player.height;

        const wasAbove =
            oldBottom <=
            p.y + 8;

        const overlapsX =
            playerRight >
                platformLeft &&
            playerLeft <
                platformRight;

        if (
            player.velocityY >= 0 &&
            wasAbove &&
            overlapsX &&
            newBottom >= p.y &&
            newBottom <=
                p.y + 25
        ) {

            player.y =
                p.y -
                player.height;

            player.velocityY = 0;

            player.grounded = true;

            player.currentPlatform =
                p;

            break;
        }
    }

    const runSpeed =
        11 +
        gameSpeed * 0.65 +
        (player.dashTimer > 0 ? 9 : 0);

    player.animation += delta * runSpeed;
    player.runCycle += delta * runSpeed;
    player.trailPulse += delta * 9;
}

/* =========================================================
   OBSTACLE UPDATE
========================================================= */

function updateObstacles(delta) {

    obstacleTimer +=
        delta * 1000;

    if (
        obstacleTimer >
        obstacleInterval
    ) {

        if (
            !bonusParkourActive &&
            !boss
        ) {

            createObstacle();
        }

        obstacleTimer = 0;

        obstacleInterval =
            Math.max(
                600,
                1200 -
                level * 25 +
                Math.random() * 400
            );
    }

    const speed =
        gameSpeed *
        (
            player.dashTimer > 0
                ? 1.35
                : 1
        );

    for (
        let i =
            obstacles.length - 1;
        i >= 0;
        i--
    ) {

        const obstacle =
            obstacles[i];

        obstacle.x -= speed;

        obstacle.pulse +=
            delta * 5;

        if (
            collision(
                player,
                obstacle
            )
        ) {

            if (
                player.dashTimer > 0
            ) {

                score += 25;

                createParticles(

                    obstacle.x,

                    obstacle.y,

                    "#ff00cc",

                    20
                );

                obstacles.splice(
                    i,
                    1
                );

                continue;
            }

            damagePlayer(
                obstacle.damage ||
                15
            );

            /*
                Hindernis wird nach
                einer Kollision entfernt,
                damit nicht direkt mehrfach
                Schaden verursacht wird.
            */

            obstacles.splice(
                i,
                1
            );

            continue;
        }

        if (
            obstacle.x +
            obstacle.width <
            -80
        ) {

            obstacles.splice(
                i,
                1
            );
        }
    }
}

/* =========================================================
   COIN UPDATE
========================================================= */

function updateCoins(delta) {

    coinTimer +=
        delta * 1000;

    if (
        coinTimer >
            coinInterval &&
        !bonusParkourActive &&
        !boss
    ) {

        createCoin();

        coinTimer = 0;
    }

    for (
        let i =
            coins.length - 1;
        i >= 0;
        i--
    ) {

        const coin =
            coins[i];

        coin.x -=
            gameSpeed;

        coin.rotation +=
            delta * 6;

        if (
            touchesCoin(coin)
        ) {

            const skin =
                getSelectedSkin();

            const exactReward =
                skin.multiplier;

            coinsCollected +=
                exactReward;

            totalCoins +=
                exactReward;

            coinsCollected =
                Math.floor(
                    coinsCollected
                );

            totalCoins =
                Math.floor(
                    totalCoins
                );

            score +=
                10 *
                skin.multiplier;

            localStorage.setItem(
                "neonRunnerCoins",
                totalCoins
            );

            createParticles(

                coin.x,

                coin.y,

                "#ffe600",

                15
            );

            coins.splice(
                i,
                1
            );

            continue;
        }

        if (
            coin.x +
            coin.radius <
            -50
        ) {

            coins.splice(
                i,
                1
            );
        }
    }
}

/* =========================================================
   PARTICLES UPDATE
========================================================= */

function updateParticles(delta) {

    for (
        let i =
            particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particles[i];

        p.x +=
            p.vx;

        p.y +=
            p.vy;

        p.vy +=
            0.08;

        p.life -=
            delta * 2;

        if (
            p.life <= 0
        ) {

            particles.splice(
                i,
                1
            );
        }
    }
}

/* =========================================================
   SCREEN SHAKE / DAMAGE FLASH
========================================================= */

function updateScreenEffects(delta) {

    if (screenShakeTime > 0) {

        screenShakeTime -= delta;

        if (screenShakeTime <= 0) {

            screenShakeTime = 0;
            screenShakeIntensity = 0;
        }
    }

    if (damageFlashTime > 0) {

        damageFlashTime -= delta;

        if (damageFlashTime < 0) {
            damageFlashTime = 0;
        }
    }
}

/* =========================================================
   DIFFICULTY
========================================================= */

function updateDifficulty() {

    level =
        Math.floor(
            distance / 450
        ) + 1;

    gameSpeed =
        6 +
        Math.min(
            (level - 1) * 0.55,
            7
        );
}

/* =========================================================
   SCORE
========================================================= */

function updateScore(delta) {

    /*
        Während eines Bosskampfes
        läuft die Distanz langsamer,
        damit der Bosskampf nicht
        sofort übersprungen wird.
    */

    const distanceMultiplier =
        boss ? 0.18 : 1;

    score +=
        delta *
        2.5 *
        distanceMultiplier;

    distance +=
        gameSpeed *
        delta *
        distanceMultiplier;
}

/* =========================================================
   BOSS CHECK
========================================================= */

function checkBossSpawn() {

    if (boss) {
        return;
    }

    for (
        let i = 0;
        i < bossDefinitions.length;
        i++
    ) {

        const definition =
            bossDefinitions[i];

        if (
            distance >=
                definition.distance &&
            !defeatedBosses.includes(i)
        ) {

            spawnBoss(
                definition,
                i
            );

            return;
        }
    }
}

/* =========================================================
   BOSS SPAWN
========================================================= */

function spawnBoss(
    definition,
    index
) {

    boss = {

        index,

        name:
            definition.name,

        x:
            width + 180,

        y:
            getGroundY() -
            100,

        width: 80,

        height: 100,

        velocityY: 0,

        grounded: true,

        sliding: false,

        maxHealth:
            definition.maxHealth,

        health:
            definition.maxHealth,

        speed:
            definition.speed,

        damage:
            definition.damage,

        color:
            definition.color,

        shootTimer:
            1.5,

        actionTimer:
            1.5,

        dodgeTimer: 0,

        animation: 0,

        hitFlash: 0
    };

    /*
        Parkour kurz leeren,
        damit der Boss im Mittelpunkt steht.
    */

    obstacles.length = 0;
    platforms.length = 0;

    bonusParkourActive = false;

    showBossHUD();

    createParticles(
        boss.x,
        boss.y + 50,
        boss.color,
        35
    );
}

/* =========================================================
   BOSS UPDATE
========================================================= */

function updateBoss(delta) {

    if (!boss) {
        return;
    }

    boss.animation +=
        delta * 7;

    if (boss.hitFlash > 0) {
        boss.hitFlash -= delta;
    }

    /*
        Boss kommt näher.
        Der Spieler bleibt statisch.
    */

    const targetX =
        player.x + 155;

    if (
        boss.x > targetX
    ) {

        boss.x -=
            boss.speed *
            delta;

    } else if (
        boss.x <
        targetX - 20
    ) {

        boss.x +=
            boss.speed *
            0.4 *
            delta;
    }

    /*
        Boss-KI Aktionen
    */

    boss.actionTimer -=
        delta;

    if (
        boss.actionTimer <= 0
    ) {

        boss.actionTimer =
            0.8 +
            Math.random() *
            1.6;

        const action =
            Math.random();

        if (
            action < 0.38 &&
            boss.grounded
        ) {

            /*
                Springen
            */

            boss.velocityY =
                -14 -
                boss.index * 1.2;

            boss.grounded = false;

        } else if (
            action < 0.63 &&
            boss.grounded
        ) {

            /*
                Sliden
            */

            boss.sliding = true;

        } else {

            /*
                Ausweichen
            */

            boss.dodgeTimer =
                0.35;
        }
    }

    if (
        boss.sliding
    ) {

        boss.height = 55;

    } else {

        boss.height = 100;
    }

    if (
        boss.dodgeTimer > 0
    ) {

        boss.dodgeTimer -=
            delta;

        boss.x +=
            220 *
            delta;
    }

    /*
        Schwerkraft
    */

    boss.velocityY +=
        0.75;

    boss.y +=
        boss.velocityY;

    const ground =
        getGroundY();

    if (
        boss.y +
        boss.height >=
        ground
    ) {

        boss.y =
            ground -
            boss.height;

        boss.velocityY = 0;

        boss.grounded = true;
    } else {

        boss.grounded = false;
    }

    /*
        Slide langsam beenden
    */

    if (
        boss.sliding &&
        Math.random() <
            delta * 1.8
    ) {

        boss.sliding = false;
    }

    /*
        Boss schießt
    */

    boss.shootTimer -=
        delta;

    if (
        boss.shootTimer <= 0
    ) {

        const fireDelay =
            Math.max(
                0.55,
                1.35 -
                boss.index * 0.2
            );

        boss.shootTimer =
            fireDelay +
            Math.random() *
            0.8;

        bossShoot();
    }

    /*
        Boss berührt Spieler
    */

    if (
        collision(
            player,
            boss
        )
    ) {

        damagePlayer(
            boss.damage
        );

        /*
            Boss wird leicht zurückgesetzt
        */

        boss.x +=
            35;
    }
}

/* =========================================================
   BOSS SCHIESST
========================================================= */

function bossShoot() {

    if (!boss) {
        return;
    }

    const direction =
        player.x >
        boss.x
            ? 1
            : -1;

    bossProjectiles.push({

        x:
            boss.x +
            (
                direction > 0
                    ? boss.width
                    : 0
            ),

        y:
            boss.y +
            boss.height * 0.42,

        width: 16,

        height: 7,

        speed:
            7 +
            boss.index * 1.5,

        direction,

        damage:
            boss.damage,

        life: 4
    });

    createParticles(
        boss.x +
        boss.width / 2,
        boss.y +
        boss.height * 0.42,
        boss.color,
        8
    );
}

/* =========================================================
   SPIELER PROJEKTILE
========================================================= */

function updatePlayerProjectiles(delta) {

    if (
        shootCooldown > 0
    ) {

        shootCooldown -=
            delta;
    }

    for (
        let i =
            playerProjectiles.length - 1;
        i >= 0;
        i--
    ) {

        const shot =
            playerProjectiles[i];

        shot.x +=
            shot.speed;

        shot.life -=
            delta;

        if (
            boss &&
            collision(
                shot,
                boss
            )
        ) {

            boss.health =
                Math.max(
                    0,
                    boss.health -
                    shot.damage
                );

            boss.hitFlash =
                0.12;

            createParticles(
                shot.x,
                shot.y,
                boss.color,
                10
            );

            playerProjectiles.splice(
                i,
                1
            );

            /*
                Boss reagiert auf Treffer
                mit Ausweichbewegung.
            */

            boss.dodgeTimer =
                0.28;

            if (
                boss.health <= 0
            ) {

                defeatBoss();
            }

            continue;
        }

        if (
            shot.life <= 0 ||
            shot.x > width + 100
        ) {

            playerProjectiles.splice(
                i,
                1
            );
        }
    }
}

/* =========================================================
   BOSS PROJEKTILE
========================================================= */

function updateBossProjectiles(delta) {

    for (
        let i =
            bossProjectiles.length - 1;
        i >= 0;
        i--
    ) {

        const shot =
            bossProjectiles[i];

        shot.x +=
            shot.speed *
            shot.direction;

        shot.life -=
            delta;

        if (
            collision(
                player,
                shot
            )
        ) {

            damagePlayer(
                shot.damage
            );

            bossProjectiles.splice(
                i,
                1
            );

            continue;
        }

        if (
            shot.life <= 0 ||
            shot.x < -100 ||
            shot.x > width + 100
        ) {

            bossProjectiles.splice(
                i,
                1
            );
        }
    }
}

/* =========================================================
   BOSS BESIEGT
========================================================= */

function defeatBoss() {

    if (!boss) {
        return;
    }

    const defeatedIndex =
        boss.index;

    const reward =
        100 +
        defeatedIndex * 150;

    score +=
        250 +
        defeatedIndex * 250;

    totalCoins +=
        reward;

    coinsCollected +=
        reward;

    localStorage.setItem(
        "neonRunnerCoins",
        Math.floor(totalCoins)
    );

    defeatedBosses.push(
        defeatedIndex
    );

    createParticles(
        boss.x +
        boss.width / 2,
        boss.y +
        boss.height / 2,
        boss.color,
        70
    );

    /*
        Boss verschwindet
    */

    boss = null;

    bossProjectiles.length = 0;

    hideBossHUD();

    /*
        Nach dem Boss geht der
        normale Parkour weiter.
    */

    bonusParkourActive = false;

    obstacleTimer = 0;
    platformTimer = 0;

    updateCoinDisplays();
}

/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    if (scoreElement) {

        scoreElement.textContent =
            Math.floor(score);
    }

    if (coinElement) {

        coinElement.textContent =
            Math.floor(
                coinsCollected
            );
    }

    if (levelElement) {

        levelElement.textContent =
            level;
    }
}

function updateCoinDisplays() {

    if (homeCoinValue) {

        homeCoinValue.textContent =
            Math.floor(totalCoins);
    }

    if (shopCoinValue) {

        shopCoinValue.textContent =
            Math.floor(totalCoins);
    }

    if (coinElement) {

        coinElement.textContent =
            Math.floor(
                coinsCollected
            );
    }
}

/* =========================================================
   BOSS HUD
========================================================= */

let bossHUD = null;
let playerHealthHUD = null;
let bossNameEl = null;
let bossBarEl = null;
let bossBlockEl = null;

function createHealthHUD() {

    if (bossHUD) {
        return;
    }

    /*
        Container
    */

    const container =
        document.createElement("div");

    container.id =
        "neonBossHUD";

    container.style.position =
        "fixed";

    container.style.top =
        "18px";

    container.style.left =
        "50%";

    container.style.transform =
        "translateX(-50%)";

    container.style.width =
        "min(620px, 90vw)";

    container.style.zIndex =
        "9999";

    container.style.display =
        "none";

    container.style.pointerEvents =
        "none";

    /*
        Boss Block (Name + Bar), separat
        umschaltbar, damit die Spieler-
        Lebensanzeige unabhängig sichtbar ist.
    */

    const bossBlock =
        document.createElement("div");

    bossBlock.id =
        "bossBlockHUD";

    bossBlock.style.display =
        "none";

    const bossLabel =
        document.createElement("div");

    bossLabel.id =
        "bossNameHUD";

    bossLabel.style.textAlign =
        "center";

    bossLabel.style.color =
        "#ff174f";

    bossLabel.style.font =
        "bold 14px Arial";

    bossLabel.style.marginBottom =
        "4px";

    const bossOuter =
        document.createElement("div");

    bossOuter.style.width =
        "100%";

    bossOuter.style.height =
        "18px";

    bossOuter.style.border =
        "2px solid #ff174f";

    bossOuter.style.background =
        "rgba(0,0,0,.65)";

    bossOuter.style.boxShadow =
        "0 0 15px rgba(255,23,79,.7)";

    const bossInner =
        document.createElement("div");

    bossInner.id =
        "bossHealthBar";

    bossInner.style.height =
        "100%";

    bossInner.style.width =
        "100%";

    bossInner.style.background =
        "#ff174f";

    bossInner.style.transition =
        "width .1s linear";

    bossOuter.appendChild(
        bossInner
    );

    bossBlock.appendChild(
        bossLabel
    );

    bossBlock.appendChild(
        bossOuter
    );

    /*
        Player health — immer sichtbar,
        solange eine Runde läuft.
    */

    const playerLabel =
        document.createElement("div");

    playerLabel.textContent =
        "DEINE LEBEN";

    playerLabel.style.color =
        "#00ffff";

    playerLabel.style.font =
        "bold 11px Arial";

    playerLabel.style.marginTop =
        "7px";

    playerLabel.style.marginBottom =
        "3px";

    const playerOuter =
        document.createElement("div");

    playerOuter.style.width =
        "100%";

    playerOuter.style.height =
        "12px";

    playerOuter.style.border =
        "2px solid #00ffff";

    playerOuter.style.background =
        "rgba(0,0,0,.65)";

    const playerInner =
        document.createElement("div");

    playerInner.id =
        "playerHealthBar";

    playerInner.style.height =
        "100%";

    playerInner.style.width =
        "100%";

    playerInner.style.background =
        "#00ffff";

    playerInner.style.transition =
        "width .15s linear, background .2s linear";

    playerOuter.appendChild(
        playerInner
    );

    container.appendChild(
        bossBlock
    );

    container.appendChild(
        playerLabel
    );

    container.appendChild(
        playerOuter
    );

    document.body.appendChild(
        container
    );

    bossHUD =
        container;

    playerHealthHUD =
        playerInner;

    bossNameEl =
        bossLabel;

    bossBarEl =
        bossInner;

    bossBlockEl =
        bossBlock;
}

function showPlayerHUD() {

    createHealthHUD();

    if (!bossHUD) {
        return;
    }

    bossHUD.style.display =
        "block";
}

function hidePlayerHUD() {

    if (bossHUD) {

        bossHUD.style.display =
            "none";
    }

    if (bossBlockEl) {

        bossBlockEl.style.display =
            "none";
    }
}

function showBossHUD() {

    createHealthHUD();

    if (!bossHUD) {
        return;
    }

    bossHUD.style.display =
        "block";

    if (bossBlockEl) {

        bossBlockEl.style.display =
            "block";
    }

    updateBossHUD();
}

function hideBossHUD() {

    if (bossBlockEl) {

        bossBlockEl.style.display =
            "none";
    }
}

function updateBossHUD() {

    createHealthHUD();

    if (!bossHUD) {
        return;
    }

    if (boss && bossNameEl && bossBarEl) {

        bossNameEl.textContent =
            boss.name +
            "  •  BOSS " +
            (boss.index + 1);

        bossBarEl.style.width =
            Math.max(
                0,
                (
                    boss.health /
                    boss.maxHealth
                ) * 100
            ) + "%";

    }

    if (playerHealthHUD) {

        const pct =
            Math.max(
                0,
                (
                    playerHealth /
                    MAX_PLAYER_HEALTH
                ) * 100
            );

        playerHealthHUD.style.width =
            pct + "%";

        playerHealthHUD.style.background =
            pct <= 25
                ? "#ff174f"
                : pct <= 55
                    ? "#ffb020"
                    : "#00ffff";
    }
}

/* =========================================================
   INFO BUTTON / INFO FENSTER
========================================================= */

let infoOverlay = null;

function createInfoSystem() {

    /*
        Wenn bereits ein Info-Button
        im HTML existiert, verwenden wir ihn.
        Sonst erstellen wir einen.
    */

    let infoButton =
        document.getElementById(
            "infoButton"
        );

    if (!infoButton && homeScreen) {

        infoButton =
            document.createElement(
                "button"
            );

        infoButton.id =
            "infoButton";

        infoButton.textContent =
            "INFO";

        infoButton.style.marginTop =
            "10px";

        infoButton.style.width =
            "100%";

        /*
            Unter Start und Shop
        */

        homeScreen.appendChild(
            infoButton
        );
    }

    /*
        Overlay
    */

    infoOverlay =
        document.createElement(
            "div"
        );

    infoOverlay.id =
        "neonInfoOverlay";

    infoOverlay.style.position =
        "fixed";

    infoOverlay.style.inset =
        "0";

    infoOverlay.style.zIndex =
        "10000";

    infoOverlay.style.display =
        "none";

    infoOverlay.style.alignItems =
        "center";

    infoOverlay.style.justifyContent =
        "center";

    infoOverlay.style.background =
        "rgba(0,0,0,.88)";

    infoOverlay.innerHTML = `

        <div style="
            width:min(600px,90vw);
            max-height:85vh;
            overflow:auto;
            padding:28px;
            border:2px solid #00ffff;
            background:#08051c;
            color:white;
            box-shadow:
                0 0 35px rgba(0,255,255,.45);
            font-family:Arial,sans-serif;
            border-radius:12px;
        ">

            <h1 style="
                color:#00ffff;
                text-align:center;
                margin-top:0;
            ">
                NEON RUNNER
            </h1>

            <h2 style="
                color:#ff00cc;
            ">
                TASTEN
            </h2>

            <div style="
                display:grid;
                gap:9px;
                font-size:15px;
            ">

                <div>
                    ⬆️ <b>SPACE / W / PFEIL HOCH</b>
                    — Springen
                </div>

                <div>
                    ⬇️ <b>S / PFEIL RUNTER</b>
                    — Sliden
                </div>

                <div>
                    💨 <b>D</b>
                    — Dash
                </div>

                <div>
                    🔫 <b>F</b>
                    — Schießen
                </div>

                <div>
                    ⏸️ <b>P</b>
                    — Pause
                </div>

                <div>
                    🔄 <b>R</b>
                    — Neustart nach Game Over
                </div>

            </div>

            <h2 style="
                color:#00ff66;
                margin-top:25px;
            ">
                PARKOUR
            </h2>

            <p>
                Die Strecke verändert sich ständig.
                Hindernisse kommen mit unterschiedlichen
                Abständen und zufälligen Kombinationen.
            </p>

            <p>
                🔺 Zacken verursachen Schaden.<br>
                🟥 Blöcke verursachen Schaden.<br>
                ⛓️ Deckenstacheln an Ketten: darunter musst du sliden, sonst gibt's Schaden.
            </p>

            <h2 style="
                color:#ff174f;
                margin-top:25px;
            ">
                BOSSE
            </h2>

            <p>
                👹 <b>500 m</b> — Boss 1
            </p>

            <p>
                👹 <b>1000 m</b> — Boss 2
            </p>

            <p>
                👹 <b>2000 m</b> — Boss 3
            </p>

            <p>
                Die Bosse können springen, sliden,
                ausweichen und auf dich schießen.
                Besiege sie mit deiner Waffe.
            </p>

            <h2 style="
                color:#00ffff;
                margin-top:25px;
            ">
                LEBEN
            </h2>

            <p>
                Du hast durchgehend Lebenspunkte, nicht nur
                beim Boss. Bei Hindernissen verlierst du nur
                einen Teil deiner Lebenspunkte.
            </p>

            <p>
                Deine Lebenspunkte regenerieren sich
                langsam, wenn du längere Zeit keinen
                Schaden bekommst.
            </p>

            <button id="closeInfoButton"
                style="
                    width:100%;
                    margin-top:20px;
                    padding:13px;
                    border:2px solid #00ffff;
                    background:#061b25;
                    color:#00ffff;
                    cursor:pointer;
                    font-weight:bold;
                    border-radius:7px;
                ">
                ZURÜCK
            </button>

        </div>
    `;

    document.body.appendChild(
        infoOverlay
    );

    if (infoButton) {

        infoButton.addEventListener(
            "click",
            () => {

                infoOverlay.style.display =
                    "flex";
            }
        );
    }

    const closeInfoButton =
        document.getElementById(
            "closeInfoButton"
        );

    if (closeInfoButton) {

        closeInfoButton.addEventListener(
            "click",
            () => {

                infoOverlay.style.display =
                    "none";
            }
        );
    }
}

/* =========================================================
   BACKGROUND
========================================================= */

let backgroundOffset = 0;

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            height
        );

    gradient.addColorStop(
        0,
        "#08051c"
    );

    gradient.addColorStop(
        0.55,
        "#050512"
    );

    gradient.addColorStop(
        1,
        "#020207"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    const ground =
        getGroundY();

    ctx.fillStyle =
        "rgba(8,8,25,0.9)";

    for (
        let x = 0;
        x < width + 100;
        x += 130
    ) {

        const h =
            70 +
            Math.abs(
                Math.sin(
                    x * 0.04
                )
            ) * 100;

        ctx.fillRect(
            x,
            ground - h,
            100,
            h
        );
    }

    backgroundOffset -=
        gameSpeed * 0.15;

    if (
        backgroundOffset <
        -100
    ) {

        backgroundOffset +=
            100;
    }

    ctx.strokeStyle =
        "rgba(0,255,255,0.07)";

    ctx.lineWidth = 1;

    for (
        let x =
            backgroundOffset;
        x < width;
        x += 100
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            ground
        );

        ctx.lineTo(
            x - 80,
            height
        );

        ctx.stroke();
    }

    ctx.strokeStyle =
        "#00ffff";

    ctx.lineWidth = 2;

    ctx.shadowColor =
        "#00ffff";

    ctx.shadowBlur = 10;

    ctx.beginPath();

    ctx.moveTo(
        0,
        ground
    );

    ctx.lineTo(
        width,
        ground
    );

    ctx.stroke();

    ctx.shadowBlur = 0;
}

/* =========================================================
   PLAYER DRAW
========================================================= */

function drawPlayer() {

    const skin = getSelectedSkin();
    const x = player.x;
    const y = player.y;

    /*
        Blinken während der
        Schadens-Unverwundbarkeit
    */

    const flickerOff =
        playerDamageCooldown > 0 &&
        Math.floor(playerDamageCooldown * 16) % 2 === 0;

    if (flickerOff) {
        return;
    }

    const runPhase = player.runCycle;
    const run = Math.sin(runPhase);
    const run2 = Math.sin(runPhase + Math.PI);
    const armSwing = Math.sin(runPhase + Math.PI);
    const armSwing2 = Math.sin(runPhase);

    const bob = player.grounded && !player.sliding
        ? Math.abs(Math.sin(runPhase * 2)) * 3
        : 0;

    const airTuck =
        !player.grounded
            ? Math.min(0.35, Math.abs(player.velocityY) * 0.012)
            : 0;

    const lean =
        player.grounded && !player.sliding
            ? 0.09
            : 0;

    ctx.save();

    /* Bodenschatten, wird beim Springen kleiner */
    const shadowScale =
        player.grounded ? 1 : Math.max(0.35, 1 - Math.abs(player.velocityY) * 0.03);

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.ellipse(
        x + 24,
        getGroundY() + 4,
        (player.sliding ? 30 : 25) * shadowScale,
        6 * shadowScale,
        0, 0, Math.PI * 2
    );
    ctx.fill();

    ctx.translate(x + 22, y + 30 - bob);
    ctx.rotate(lean - airTuck);
    ctx.translate(-(x + 22), -(y + 30));

    /* Speed-/Dash-Trail */
    if (player.dashTimer > 0 || (player.grounded && !player.sliding)) {
        const trailColor = player.dashTimer > 0 ? "#ff00cc" : skin.glow;
        ctx.strokeStyle = trailColor;
        ctx.shadowColor = trailColor;
        ctx.shadowBlur = player.dashTimer > 0 ? 24 : 10;
        ctx.lineCap = "round";
        ctx.lineWidth = player.dashTimer > 0 ? 5 : 2;
        for (let i = 0; i < (player.dashTimer > 0 ? 4 : 2); i++) {
            const wave = Math.sin(player.trailPulse + i) * 3;
            ctx.beginPath();
            ctx.moveTo(x - 8 - i * 12, y + 18 + i * 9 + wave);
            ctx.lineTo(x - 34 - i * 18, y + 22 + i * 9 + wave);
            ctx.stroke();
        }
    }

    ctx.shadowColor = skin.glow;
    ctx.shadowBlur = 18;

    if (player.sliding) {

        /* Geduckte Slide-Pose, flacher Körper */
        ctx.fillStyle = skin.body;
        ctx.beginPath(); ctx.roundRect(x + 3, y + 9, 38, 21, 10); ctx.fill();

        ctx.fillStyle = "#080814";
        ctx.beginPath(); ctx.roundRect(x + 11, y + 12, 22, 8, 3); ctx.fill();
        ctx.fillStyle = skin.visor;
        ctx.shadowColor = skin.visor; ctx.shadowBlur = 10;
        ctx.fillRect(x + 14, y + 14, 15, 2.5);

        ctx.shadowColor = skin.body; ctx.shadowBlur = 12;
        ctx.strokeStyle = skin.body; ctx.lineWidth = 7; ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 24); ctx.lineTo(x - 4, y + 33);
        ctx.moveTo(x + 32, y + 24); ctx.lineTo(x + 48, y + 31);
        ctx.stroke();

        ctx.strokeStyle = skin.glow; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x + 9, y + 33); ctx.lineTo(x - 8, y + 36);
        ctx.moveTo(x + 36, y + 31); ctx.lineTo(x + 53, y + 34);
        ctx.stroke();

        /* Funken am Boden während des Slides */
        ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            const sx = x - 6 - i * 14;
            ctx.beginPath();
            ctx.moveTo(sx, y + 30);
            ctx.lineTo(sx - 8, y + 30 + Math.sin(player.trailPulse + i) * 2);
            ctx.stroke();
        }

    } else {

        const stride = 13 + Math.abs(run) * 6;
        const kneeLift = 6 + Math.abs(run2) * 7;

        /* Hinteres Bein (Oberschenkel + Unterschenkel) */
        ctx.strokeStyle = skin.body; ctx.lineWidth = 7.5; ctx.lineCap = "round"; ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(x + 27, y + 42);
        ctx.lineTo(x + 33 + run2 * stride * 0.6, y + 48 + kneeLift * 0.4);
        ctx.lineTo(x + 38 + run2 * stride, y + 58);
        ctx.stroke();

        /* Vorderes Bein */
        ctx.beginPath();
        ctx.moveTo(x + 17, y + 42);
        ctx.lineTo(x + 12 + run * stride * 0.6, y + 48 + kneeLift * 0.4);
        ctx.lineTo(x + 6 + run * stride, y + 58);
        ctx.stroke();

        /* Schuhe */
        ctx.strokeStyle = skin.visor; ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(x + 6 + run * stride, y + 58); ctx.lineTo(x - 1 + run * stride * 1.2, y + 58);
        ctx.moveTo(x + 38 + run2 * stride, y + 58); ctx.lineTo(x + 45 + run2 * stride * 1.2, y + 58);
        ctx.stroke();

        /* Torso, leicht nach vorne geneigt (Rotation oben schon gesetzt) */
        ctx.shadowColor = skin.glow; ctx.shadowBlur = 16;
        ctx.fillStyle = skin.body;
        ctx.beginPath(); ctx.roundRect(x + 8, y + 16, 27, 29, 8); ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(5,8,20,.8)";
        ctx.beginPath(); ctx.roundRect(x + 13, y + 25, 17, 13, 4); ctx.fill();

        ctx.fillStyle = skin.visor; ctx.shadowColor = skin.visor; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.roundRect(x + 15, y + 27.5, 13, 3, 1.5); ctx.fill();

        /* Vorderer Arm, schwingt gegenläufig zum vorderen Bein */
        ctx.shadowColor = skin.glow; ctx.shadowBlur = 10;
        ctx.strokeStyle = skin.body; ctx.lineWidth = 6; ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + 31, y + 22);
        ctx.lineTo(x + 38 + armSwing2 * 9, y + 30 + Math.abs(armSwing2) * 3);
        ctx.lineTo(x + 33 + armSwing2 * 13, y + 40);
        ctx.stroke();

        /* Hinterer Arm */
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 22);
        ctx.lineTo(x + 5 + armSwing * 9, y + 30 + Math.abs(armSwing) * 3);
        ctx.lineTo(x + 10 + armSwing * 13, y + 40);
        ctx.stroke();

        /* Kopf mit Visier */
        ctx.shadowColor = skin.glow; ctx.shadowBlur = 20; ctx.fillStyle = skin.body;
        ctx.beginPath(); ctx.roundRect(x + 6, y - 3, 28, 24, 9); ctx.fill();

        ctx.shadowBlur = 0; ctx.fillStyle = "#070712";
        ctx.beginPath(); ctx.roundRect(x + 9, y + 4, 22, 9, 4); ctx.fill();

        ctx.shadowColor = skin.visor; ctx.shadowBlur = 12; ctx.fillStyle = skin.visor;
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 7); ctx.lineTo(x + 29, y + 6);
        ctx.lineTo(x + 27, y + 10); ctx.lineTo(x + 13, y + 11);
        ctx.closePath(); ctx.fill();

        /* Waffe */
        ctx.shadowColor = "#ffe600"; ctx.shadowBlur = 14; ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x + 33 + armSwing2 * 9, y + 30 + Math.abs(armSwing2) * 3);
        ctx.lineTo(x + 49 + armSwing2 * 9, y + 27 + Math.abs(armSwing2) * 3);
        ctx.stroke();
        ctx.fillStyle = "#fff6a0";
        ctx.fillRect(x + 46 + armSwing2 * 9, y + 24 + Math.abs(armSwing2) * 3, 5, 4);
    }

    ctx.restore();
}
/* =========================================================
   OBSTACLES DRAW
========================================================= */

function drawObstacles() {

    for (const obstacle of obstacles) {

        ctx.save();

        if (
            obstacle.type ===
            "spike"
        ) {

            ctx.shadowColor =
                "#ff174f";

            ctx.shadowBlur = 18;

            ctx.fillStyle =
                "#ff174f";

            ctx.beginPath();

            ctx.moveTo(
                obstacle.x,
                obstacle.y +
                obstacle.height
            );

            ctx.lineTo(
                obstacle.x +
                obstacle.width / 2,
                obstacle.y
            );

            ctx.lineTo(
                obstacle.x +
                obstacle.width,
                obstacle.y +
                obstacle.height
            );

            ctx.closePath();

            ctx.fill();

            ctx.strokeStyle =
                "#ffb0c0";

            ctx.lineWidth = 2;

            ctx.stroke();

        } else if (obstacle.type === "ceilingSpike") {

            const cx = obstacle.x + obstacle.width / 2;
            const chainLength = Math.max(20, obstacle.y - 6);
            ctx.strokeStyle = "#7f8ca8"; ctx.lineWidth = 3; ctx.shadowColor = "#00ffff"; ctx.shadowBlur = 7;
            ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, chainLength); ctx.stroke();
            ctx.shadowBlur = 0; ctx.strokeStyle = "#c6d3ef"; ctx.lineWidth = 2;
            for (let linkY = 8; linkY < chainLength; linkY += 13) {
                ctx.beginPath(); ctx.ellipse(cx, linkY, 5, 3.5, (linkY / 13) % 2 ? 0.35 : -0.35, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.fillStyle = "#d8e6ff"; ctx.shadowColor = "#00ffff"; ctx.shadowBlur = 12;
            ctx.beginPath(); ctx.arc(cx, 5, 6, 0, Math.PI * 2); ctx.fill();
            const pulse = 1 + Math.sin(obstacle.pulse) * 0.06;
            ctx.translate(cx, obstacle.y); ctx.scale(pulse, 1);
            ctx.fillStyle = "#ff174f"; ctx.shadowColor = "#ff174f"; ctx.shadowBlur = 24;
            ctx.beginPath(); ctx.moveTo(-obstacle.width / 2, 0); ctx.lineTo(0, obstacle.height); ctx.lineTo(obstacle.width / 2, 0); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = "#ffd0da"; ctx.lineWidth = 2; ctx.stroke();
            ctx.shadowBlur = 0; ctx.fillStyle = "#ffffff"; ctx.font = "bold 12px Arial"; ctx.textAlign = "center"; ctx.fillText("↓ SLIDE", 0, -10);

        } else {

            const glow =
                12 +
                Math.sin(
                    obstacle.pulse
                ) * 5;

            ctx.shadowColor =
                "#ff174f";

            ctx.shadowBlur =
                glow;

            ctx.fillStyle =
                "#ff174f";

            ctx.beginPath();

            ctx.roundRect(
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height,
                5
            );

            ctx.fill();

            ctx.strokeStyle =
                "#ff9bb4";

            ctx.lineWidth = 2;

            ctx.stroke();
        }

        ctx.restore();
    }
}

/* =========================================================
   PLATTFORMEN DRAW
========================================================= */

function drawPlatforms() {

    for (const p of platforms) {

        const glow =
            14 +
            Math.sin(
                p.pulse
            ) * 5;

        ctx.save();

        ctx.shadowColor =
            "#00ff66";

        ctx.shadowBlur =
            glow;

        ctx.fillStyle =
            "#00d957";

        ctx.beginPath();

        ctx.roundRect(
            p.x,
            p.y,
            p.width,
            p.height,
            6
        );

        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.strokeStyle =
            "#aaffcc";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(
            p.x + 3,
            p.y + 2
        );

        ctx.lineTo(
            p.x +
            p.width -
            3,
            p.y + 2
        );

        ctx.stroke();

        ctx.restore();
    }
}

/* =========================================================
   COINS DRAW
========================================================= */

function drawCoins() {

    for (const coin of coins) {

        ctx.save();

        ctx.translate(
            coin.x,
            coin.y
        );

        const scale =
            Math.abs(
                Math.cos(
                    coin.rotation
                )
            );

        ctx.scale(
            Math.max(
                scale,
                0.2
            ),
            1
        );

        ctx.shadowColor =
            "#ffe600";

        ctx.shadowBlur = 18;

        ctx.fillStyle =
            "#ffe600";

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            coin.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.strokeStyle =
            "#fff5a0";

        ctx.lineWidth = 2;

        ctx.stroke();

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "bold 10px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "$",
            0,
            4
        );

        ctx.restore();
    }
}

/* =========================================================
   BOSS DRAW
========================================================= */

function drawBoss() {

    if (!boss) {
        return;
    }

    ctx.save();

    const x =
        boss.x;

    const y =
        boss.y;

    /*
        Boss Aura
    */

    ctx.shadowColor =
        boss.color;

    ctx.shadowBlur =
        boss.hitFlash > 0
            ? 40
            : 24;

    ctx.fillStyle =
        boss.hitFlash > 0
            ? "#ffffff"
            : boss.color;

    /*
        Körper
    */

    ctx.beginPath();

    ctx.roundRect(
        x + 12,
        y + 30,
        56,
        boss.sliding
            ? 28
            : 55,
        10
    );

    ctx.fill();

    /*
        Kopf
    */

    if (!boss.sliding) {

        ctx.beginPath();

        ctx.roundRect(
            x + 8,
            y,
            64,
            38,
            12
        );

        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle =
            "#090914";

        ctx.beginPath();

        ctx.roundRect(
            x + 18,
            y + 10,
            44,
            12,
            5
        );

        ctx.fill();

        ctx.fillStyle =
            "#ffffff";

        ctx.fillRect(
            x + 23,
            y + 14,
            34,
            3
        );
    }

    /*
        Boss-Waffe
    */

    ctx.shadowColor =
        "#ffe600";

    ctx.shadowBlur = 15;

    ctx.strokeStyle =
        "#ffe600";

    ctx.lineWidth = 7;

    ctx.beginPath();

    ctx.moveTo(
        x + 58,
        y + 45
    );

    ctx.lineTo(
        x + 92,
        y + 50
    );

    ctx.stroke();

    /*
        Beine
    */

    if (!boss.sliding) {

        const leg =
            Math.sin(
                boss.animation
            ) * 8;

        ctx.strokeStyle =
            boss.color;

        ctx.lineWidth = 9;

        ctx.beginPath();

        ctx.moveTo(
            x + 27,
            y + 82
        );

        ctx.lineTo(
            x + 20 + leg,
            y + 100
        );

        ctx.moveTo(
            x + 53,
            y + 82
        );

        ctx.lineTo(
            x + 60 - leg,
            y + 100
        );

        ctx.stroke();
    }

    /*
        Boss Name
    */

    ctx.shadowBlur = 0;

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 12px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        boss.name,
        x + boss.width / 2,
        y - 12
    );

    ctx.restore();
}

/* =========================================================
   PROJEKTILE DRAW
========================================================= */

function drawProjectiles() {

    /*
        Spieler
    */

    for (
        const shot of
        playerProjectiles
    ) {

        ctx.save();

        ctx.shadowColor =
            "#ffe600";

        ctx.shadowBlur = 18;

        ctx.fillStyle =
            "#ffe600";

        ctx.beginPath();

        ctx.roundRect(
            shot.x,
            shot.y,
            shot.width,
            shot.height,
            3
        );

        ctx.fill();

        ctx.restore();
    }

    /*
        Boss
    */

    for (
        const shot of
        bossProjectiles
    ) {

        ctx.save();

        ctx.shadowColor =
            boss
                ? boss.color
                : "#ff174f";

        ctx.shadowBlur = 18;

        ctx.fillStyle =
            boss
                ? boss.color
                : "#ff174f";

        ctx.beginPath();

        ctx.arc(
            shot.x,
            shot.y,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }
}

/* =========================================================
   PARTICLES DRAW
========================================================= */

function drawParticles() {

    for (const p of particles) {

        ctx.globalAlpha =
            p.life;

        ctx.fillStyle =
            p.color;

        ctx.shadowColor =
            p.color;

        ctx.shadowBlur = 8;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;

    ctx.shadowBlur = 0;
}

/* =========================================================
   DAMAGE VIGNETTE OVERLAY
========================================================= */

function drawDamageOverlay() {

    if (damageFlashTime <= 0) {
        return;
    }

    const strength =
        Math.min(1, damageFlashTime / 0.45);

    ctx.save();

    const gradient =
        ctx.createRadialGradient(
            width / 2, height / 2, height * 0.25,
            width / 2, height / 2, height * 0.75
        );

    gradient.addColorStop(0, "rgba(255,23,79,0)");
    gradient.addColorStop(1, `rgba(255,23,79,${0.45 * strength})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
}

/* =========================================================
   DRAW
========================================================= */

function draw() {

    ctx.save();

    if (screenShakeTime > 0) {

        const shakeX =
            (Math.random() - 0.5) * 2 * screenShakeIntensity *
            (screenShakeTime / 0.3);

        const shakeY =
            (Math.random() - 0.5) * 2 * screenShakeIntensity *
            (screenShakeTime / 0.3);

        ctx.translate(shakeX, shakeY);
    }

    drawBackground();

    drawPlatforms();

    drawCoins();

    drawObstacles();

    drawProjectiles();

    drawBoss();

    drawParticles();

    drawPlayer();

    drawDamageOverlay();

    ctx.restore();
}

/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(
    currentTime
) {

    if (!gameRunning) {
        return;
    }

    if (gamePaused) {
        return;
    }

    let delta =
        (
            currentTime -
            lastTime
        ) / 1000;

    delta =
        Math.min(
            delta,
            0.05
        );

    lastTime =
        currentTime;

    updatePlayer(delta);

    updatePlatforms(delta);

    updateObstacles(delta);

    updateCoins(delta);

    updatePlayerHealth(delta);

    updatePlayerProjectiles(
        delta
    );

    updateBossProjectiles(
        delta
    );

    updateBoss(delta);

    updateParticles(delta);

    updateScreenEffects(delta);

    updateDifficulty();

    updateScore(delta);

    checkBossSpawn();

    updateHUD();

    updateBossHUD();

    draw();

    requestAnimationFrame(
        gameLoop
    );
}

/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();

        /*
            Springen
        */

        if (
            event.code ===
                "Space" ||
            event.code ===
                "ArrowUp" ||
            key === "w"
        ) {

            event.preventDefault();

            jump();
        }

        /*
            Sliden
        */

        if (
            event.code ===
                "ArrowDown" ||
            key === "s"
        ) {

            event.preventDefault();

            startSlide();
        }

        /*
            Dash
        */

        if (
            key === "d"
        ) {

            event.preventDefault();

            dash();
        }

        /*
            Schießen
        */

        if (
            key === "f"
        ) {

            event.preventDefault();

            shoot();
        }

        /*
            Pause
        */

        if (
            key === "p"
        ) {

            if (gameRunning) {

                if (gamePaused) {

                    resumeGame();

                } else {

                    pauseGame();
                }
            }
        }

        /*
            Neustart
        */

        if (
            key === "r"
        ) {

            if (!gameRunning) {

                startGame();
            }
        }
    }
);

document.addEventListener(
    "keyup",
    event => {

        const key =
            event.key.toLowerCase();

        if (
            event.code ===
                "ArrowDown" ||
            key === "s"
        ) {

            stopSlide();
        }
    }
);

/* =========================================================
   TOUCH
========================================================= */

canvas.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        jump();
    }
);

/* =========================================================
   BUTTON EVENTS
========================================================= */

if (playButton) {

    playButton.addEventListener(
        "click",
        startGame
    );
}

if (shopButton) {

    shopButton.addEventListener(
        "click",
        openShop
    );
}

if (shopBackButton) {

    shopBackButton.addEventListener(
        "click",
        goHome
    );
}

if (restartButton) {

    restartButton.addEventListener(
        "click",
        startGame
    );
}

if (homeButton) {

    homeButton.addEventListener(
        "click",
        goHome
    );
}

if (gameOverHomeButton) {

    gameOverHomeButton.addEventListener(
        "click",
        goHome
    );
}

if (resumeButton) {

    resumeButton.addEventListener(
        "click",
        resumeGame
    );
}

if (pauseRestartButton) {

    pauseRestartButton.addEventListener(
        "click",
        startGame
    );
}

/* =========================================================
   MOBILE
========================================================= */

if (jumpButton) {

    jumpButton.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            jump();
        }
    );
}

if (dashButton) {

    dashButton.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            dash();
        }
    );
}

if (slideButton) {

    slideButton.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            startSlide();
        }
    );

    slideButton.addEventListener(
        "pointerup",
        stopSlide
    );

    slideButton.addEventListener(
        "pointercancel",
        stopSlide
    );

    slideButton.addEventListener(
        "pointerleave",
        stopSlide
    );
}

/* =========================================================
   START
========================================================= */

resizeCanvas();

updateCoinDisplays();

updateHUD();

renderShop();

createHealthHUD();

createInfoSystem();

hidePlayerHUD();

homeScreen.classList.remove(
    "hidden"
);

shopScreen.classList.add(
    "hidden"
);

gameOverScreen.classList.add(
    "hidden"
);

pauseScreen.classList.add(
    "hidden"
);

if (mobileControls) {

    mobileControls.style.display =
        "none";
}

drawBackground();

drawPlayer();
