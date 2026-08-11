const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ========================================
// PELIN TILAT
// ========================================

let lives = 10;
let money = 100;
let wave = 1;
let score = 0;

let gameRunning = false;
let scoreSaved = false;

let enemies = [];
let bullets = [];
let towers = [];
let effects = [];
let floatingTexts = [];

let enemiesToSpawn = 8;
let enemiesSpawned = 0;
let spawnTimer = 0;

let mouseX = 400;
let mouseY = 250;

let selectedTowerType = "basic";
let selectedTower = null;

const towerSpacing = 55;

// ========================================
// AWS API GATEWAY
// ========================================

const API_URL =
    "https://560c02bl0e.execute-api.us-east-1.amazonaws.com";

// ========================================
// TARGETOINTI
// ========================================

const targetingModes = [
    "first",
    "last",
    "strongest"
];

const targetingNames = {
    first: "First",
    last: "Last",
    strongest: "Strongest"
};

// ========================================
// HTML-ELEMENTIT
// ========================================

const startScreen =
    document.getElementById("startScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const finalScore =
    document.getElementById("finalScore");

const finalWave =
    document.getElementById("finalWave");

const selectedTowerText =
    document.getElementById("selectedTower");

const buildPanel =
    document.getElementById("buildPanel");

const towerInfoPanel =
    document.getElementById("towerInfoPanel");

const selectedTowerIcon =
    document.getElementById("selectedTowerIcon");

const selectedTowerName =
    document.getElementById("selectedTowerName");

const selectedTowerLevel =
    document.getElementById("selectedTowerLevel");

const towerDamage =
    document.getElementById("towerDamage");

const towerRange =
    document.getElementById("towerRange");

const towerCooldown =
    document.getElementById("towerCooldown");

const upgradeTowerButton =
    document.getElementById("upgradeTowerButton");

const upgradeCost =
    document.getElementById("upgradeCost");

const sellTowerButton =
    document.getElementById("sellTowerButton");

const sellValue =
    document.getElementById("sellValue");

const deselectTowerButton =
    document.getElementById("deselectTowerButton");

// ========================================
// TURVALLINEN UI-APU
// ========================================

function showElement(element) {
    if (element) {
        element.classList.remove("hidden");
    }
}

function hideElement(element) {
    if (element) {
        element.classList.add("hidden");
    }
}

// ========================================
// TORNITYYPIT
// ========================================

const towerTypes = {

    basic: {
        name: "Basic Tower",
        color: "#3498db",
        icon: "🟦",

        cost: 25,

        damage: 25,
        range: 145,
        cooldown: 55,

        bulletSpeed: 7,

        splash: 0
    },

    rapid: {
        name: "Rapid Tower",
        color: "#2ecc71",
        icon: "🟩",

        cost: 50,

        damage: 12,
        range: 130,
        cooldown: 20,

        bulletSpeed: 9,

        splash: 0
    },

    cannon: {
        name: "Cannon Tower",
        color: "#e74c3c",
        icon: "🟥",

        cost: 75,

        damage: 80,
        range: 180,
        cooldown: 100,

        bulletSpeed: 5,

        splash: 55
    }
};

// ========================================
// VIHOLLISTYYPIT
// ========================================

const enemyTypes = {

    normal: {
        name: "Normal",
        color: "#e74c3c",

        speed: 1.25,
        health: 100,

        reward: 10,

        size: 18
    },

    fast: {
        name: "Fast",
        color: "#f1c40f",

        speed: 2.1,
        health: 65,

        reward: 15,

        size: 15
    },

    tank: {
        name: "Tank",
        color: "#8e44ad",

        speed: 0.75,
        health: 450,

        reward: 30,

        size: 27
    },

    boss: {
        name: "BOSS",
        color: "#111111",

        speed: 0.55,
        health: 2200,

        reward: 150,

        size: 36
    }
};

// ========================================
// REITTI
// ========================================

const path = [

    { x: -30, y: 250 },

    { x: 130, y: 250 },

    { x: 130, y: 100 },

    { x: 330, y: 100 },

    { x: 330, y: 400 },

    { x: 530, y: 400 },

    { x: 530, y: 170 },

    { x: 740, y: 170 },

    { x: 810, y: 170 }
];

// ========================================
// TORNIN VALINTA
// ========================================

function selectTower(type) {

    selectedTowerType = type;

    selectedTower = null;

    hideElement(towerInfoPanel);
    showElement(buildPanel);

    const tower =
        towerTypes[type];

    if (selectedTowerText) {

        selectedTowerText.textContent =
            `Valittu rakennettavaksi: ${tower.name} • 💰 ${tower.cost}`;
    }
}

// ========================================
// TORNINAPIT
// ========================================

const basicTowerButton =
    document.getElementById("basicTowerButton");

const rapidTowerButton =
    document.getElementById("rapidTowerButton");

const cannonTowerButton =
    document.getElementById("cannonTowerButton");

if (basicTowerButton) {

    basicTowerButton.addEventListener(
        "click",
        () => selectTower("basic")
    );
}

if (rapidTowerButton) {

    rapidTowerButton.addEventListener(
        "click",
        () => selectTower("rapid")
    );
}

if (cannonTowerButton) {

    cannonTowerButton.addEventListener(
        "click",
        () => selectTower("cannon")
    );
}

// ========================================
// TORNIN INFO
// ========================================

function showTowerInfo(tower) {

    if (!tower) {
        return;
    }

    selectedTower = tower;

    const type =
        towerTypes[tower.type];

    hideElement(buildPanel);
    showElement(towerInfoPanel);

    if (selectedTowerText) {

        selectedTowerText.textContent =
            `Valittu: ${type.name}`;
    }

    if (selectedTowerIcon) {

        selectedTowerIcon.textContent =
            type.icon;

        selectedTowerIcon.style.borderColor =
            type.color;
    }

    if (selectedTowerName) {

        selectedTowerName.textContent =
            type.name;
    }

    if (selectedTowerLevel) {

        selectedTowerLevel.textContent =
            `Taso ${tower.level}`;
    }

    if (towerDamage) {

        towerDamage.textContent =
            Math.round(tower.damage);
    }

    if (towerRange) {

        towerRange.textContent =
            Math.round(tower.range);
    }

    if (towerCooldown) {

        towerCooldown.textContent =
            type.cooldown;
    }

    if (upgradeCost) {

        upgradeCost.textContent =
            `💰 ${getUpgradeCost(tower)}`;
    }

    if (sellValue) {

        sellValue.textContent =
            `+${getSellValue(tower)}`;
    }

    if (upgradeTowerButton) {

        upgradeTowerButton.disabled =
            money < getUpgradeCost(tower);
    }

    updateTargetingUI();
}

// ========================================
// TARGETOINTI UI
// ========================================

function updateTargetingUI() {

    if (!selectedTower) {
        return;
    }

    const mode =
        selectedTower.targeting ||
        "first";

    const possibleButtons =
        document.querySelectorAll(
            "[data-targeting]"
        );

    possibleButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.targeting === mode
        );
    });
}

// ========================================
// VALINNAN POISTO
// ========================================

function deselectTower() {

    selectedTower = null;

    hideElement(towerInfoPanel);
    showElement(buildPanel);

    if (selectedTowerText) {

        selectedTowerText.textContent =
            `Valittu rakennettavaksi: ${
                towerTypes[selectedTowerType].name
            }`;
    }
}

if (deselectTowerButton) {

    deselectTowerButton.addEventListener(
        "click",
        deselectTower
    );
}

// ========================================
// MOUSE
// ========================================

function updateMousePosition(event) {

    const rect =
        canvas.getBoundingClientRect();

    const scaleX =
        canvas.width / rect.width;

    const scaleY =
        canvas.height / rect.height;

    mouseX =
        (event.clientX - rect.left) *
        scaleX;

    mouseY =
        (event.clientY - rect.top) *
        scaleY;
}

canvas.addEventListener(
    "mousemove",
    updateMousePosition
);

// ========================================
// MAP
// ========================================

function drawMap() {

    ctx.fillStyle = "#4a8f45";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Ruudukko

    ctx.strokeStyle =
        "rgba(255,255,255,0.035)";

    ctx.lineWidth = 1;

    for (
        let x = 0;
        x < canvas.width;
        x += 40
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);

        ctx.stroke();
    }

    for (
        let y = 0;
        y < canvas.height;
        y += 40
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);

        ctx.stroke();
    }

    // Reitti

    ctx.strokeStyle = "#9b7b4d";
    ctx.lineWidth = 64;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();

    ctx.moveTo(
        path[0].x,
        path[0].y
    );

    for (
        let i = 1;
        i < path.length;
        i++
    ) {

        ctx.lineTo(
            path[i].x,
            path[i].y
        );
    }

    ctx.stroke();

    // Reitin vaaleampi sisus

    ctx.strokeStyle = "#c2a36b";
    ctx.lineWidth = 52;

    ctx.beginPath();

    ctx.moveTo(
        path[0].x,
        path[0].y
    );

    for (
        let i = 1;
        i < path.length;
        i++
    ) {

        ctx.lineTo(
            path[i].x,
            path[i].y
        );
    }

    ctx.stroke();

    // Tukikohta

    ctx.fillStyle = "#252525";

    ctx.fillRect(
        740,
        110,
        60,
        60
    );

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;

    ctx.strokeRect(
        740,
        110,
        60,
        60
    );

    ctx.fillStyle = "#fff";

    ctx.font =
        "bold 12px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "TUKIKOHTA",
        770,
        98
    );

    ctx.textAlign =
        "left";

    // Rakennusesikatselu

    if (
        !selectedTower &&
        gameRunning
    ) {

        const valid =
            isValidTowerPosition(
                mouseX,
                mouseY
            );

        const tower =
            towerTypes[selectedTowerType];

        ctx.beginPath();

        ctx.arc(
            mouseX,
            mouseY,
            tower.range,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            valid
                ? "rgba(46,204,113,0.08)"
                : "rgba(231,76,60,0.08)";

        ctx.fill();

        ctx.strokeStyle =
            valid
                ? "rgba(46,204,113,0.7)"
                : "rgba(231,76,60,0.7)";

        ctx.lineWidth = 2;

        ctx.stroke();

        ctx.beginPath();

        ctx.arc(
            mouseX,
            mouseY,
            20,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            valid
                ? tower.color
                : "#e74c3c";

        ctx.globalAlpha = 0.45;

        ctx.fill();

        ctx.globalAlpha = 1;

        ctx.strokeStyle =
            valid
                ? "#ffffff"
                : "#ff5555";

        ctx.stroke();
    }

    // Valitun tornin range

    if (selectedTower) {

        ctx.beginPath();

        ctx.arc(
            selectedTower.x,
            selectedTower.y,
            selectedTower.range,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(255,255,255,0.05)";

        ctx.fill();

        ctx.strokeStyle =
            "rgba(255,255,255,0.8)";

        ctx.lineWidth = 2;

        ctx.setLineDash([
            6,
            5
        ]);

        ctx.stroke();

        ctx.setLineDash([]);
    }
}

// ========================================
// VIHOLLISTEN LUONTI
// ========================================

function getEnemyTypeForWave() {

    // Boss joka 5. aallolla

    if (
        wave % 5 === 0 &&
        enemiesSpawned === 0
    ) {

        return "boss";
    }

    const random =
        Math.random();

    if (
        wave >= 4 &&
        random < 0.20
    ) {

        return "tank";
    }

    if (
        wave >= 2 &&
        random < 0.35
    ) {

        return "fast";
    }

    return "normal";
}

function createEnemy() {

    const type =
        getEnemyTypeForWave();

    const template =
        enemyTypes[type];

    let healthMultiplier =
        1 + (wave - 1) * 0.18;

    let speedBonus =
        (wave - 1) * 0.025;

    // Boss skaalautuu nopeammin

    if (type === "boss") {

        healthMultiplier =
            1 + (wave - 5) * 0.30;

        speedBonus =
            (wave - 5) * 0.015;
    }

    const health =
        Math.round(
            template.health *
            healthMultiplier
        );

    const speed =
        template.speed +
        speedBonus;

    const enemy = {

        x: path[0].x,

        y: path[0].y,

        pathIndex: 0,

        progress: 0,

        type,

        speed,

        size:
            template.size,

        health,

        maxHealth:
            health,

        reward:
            Math.round(
                template.reward *
                (1 + (wave - 1) * 0.08)
            ),

        dead: false,

        hitFlash: 0
    };

    enemies.push(enemy);

    enemiesSpawned++;

    // Boss-ilmoitus

    if (type === "boss") {

        createFloatingText(
            "👑 BOSS SAAPUU!",
            400,
            70,
            "#ffcc00",
            22
        );
    }
}

// ========================================
// VIHOLLISTEN LIIKE
// ========================================

function updateEnemies() {

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            enemies[i];

        if (enemy.hitFlash > 0) {
            enemy.hitFlash--;
        }

        const nextPoint =
            path[
                enemy.pathIndex + 1
            ];

        if (!nextPoint) {

            lives--;

            createFloatingText(
                "-1 ❤️",
                enemy.x,
                enemy.y,
                "#ff5555",
                16
            );

            enemies.splice(
                i,
                1
            );

            updateUI();

            if (lives <= 0) {

                gameOver();
            }

            continue;
        }

        const dx =
            nextPoint.x -
            enemy.x;

        const dy =
            nextPoint.y -
            enemy.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distance <=
            enemy.speed
        ) {

            enemy.x =
                nextPoint.x;

            enemy.y =
                nextPoint.y;

            enemy.pathIndex++;

        } else {

            enemy.x +=
                (dx / distance) *
                enemy.speed;

            enemy.y +=
                (dy / distance) *
                enemy.speed;
        }

        // Tarkempi progress targetointia varten

        enemy.progress =
            enemy.pathIndex +
            (
                enemy.pathIndex <
                path.length - 1
                    ? 1 -
                      distance /
                      Math.max(
                          1,
                          distanceBetweenPoints(
                              path[
                                  enemy.pathIndex
                              ],
                              nextPoint
                          )
                      )
                    : 0
            );
    }
}

// ========================================
// VIHOLLISTEN PIIRTO
// ========================================

function drawEnemies() {

    enemies.forEach(enemy => {

        const type =
            enemyTypes[enemy.type];

        // Boss aura

        if (
            enemy.type === "boss"
        ) {

            ctx.beginPath();

            ctx.arc(
                enemy.x,
                enemy.y,
                enemy.size + 9,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "rgba(255,0,0,0.12)";

            ctx.fill();

            ctx.strokeStyle =
                "rgba(255,204,0,0.8)";

            ctx.lineWidth = 2;

            ctx.stroke();
        }

        // Hit flash

        ctx.fillStyle =
            enemy.hitFlash > 0
                ? "#ffffff"
                : type.color;

        ctx.beginPath();

        ctx.arc(
            enemy.x,
            enemy.y,
            enemy.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.strokeStyle =
            enemy.type === "boss"
                ? "#ffcc00"
                : "#222";

        ctx.lineWidth =
            enemy.type === "boss"
                ? 4
                : 2;

        ctx.stroke();

        // Boss kruunu

        if (
            enemy.type === "boss"
        ) {

            ctx.font =
                "20px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(
                "👑",
                enemy.x,
                enemy.y -
                enemy.size -
                5
            );

            ctx.textAlign =
                "left";
        }

        // HP-palkki

        const barWidth =
            enemy.type === "boss"
                ? 80
                : 50;

        const barHeight =
            enemy.type === "boss"
                ? 8
                : 6;

        ctx.fillStyle =
            "#222";

        ctx.fillRect(
            enemy.x -
                barWidth / 2,
            enemy.y -
                enemy.size -
                13,
            barWidth,
            barHeight
        );

        const hp =
            Math.max(
                0,
                enemy.health /
                enemy.maxHealth
            );

        ctx.fillStyle =
            enemy.type === "boss"
                ? "#ff3333"
                : "#2ecc71";

        ctx.fillRect(
            enemy.x -
                barWidth / 2,
            enemy.y -
                enemy.size -
                13,
            barWidth * hp,
            barHeight
        );

        // Boss HP-teksti

        if (
            enemy.type === "boss"
        ) {

            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "bold 10px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(
                `${Math.ceil(enemy.health)} HP`,
                enemy.x,
                enemy.y +
                enemy.size +
                15
            );

            ctx.textAlign =
                "left";
        }
    });
}

// ========================================
// AALLOT
// ========================================

function getEnemiesForWave() {

    return (
        8 +
        wave * 4
    );
}

function getWaveBonus() {

    return (
        20 +
        wave * 5
    );
}

function updateWave() {

    if (
        enemiesSpawned <
        enemiesToSpawn
    ) {

        spawnTimer--;

        if (
            spawnTimer <= 0
        ) {

            createEnemy();

            spawnTimer =
                Math.max(
                    22,
                    70 -
                    wave * 2
                );
        }

        return;
    }

    if (
        enemies.length === 0
    ) {

        const bonus =
            getWaveBonus();

        money += bonus;

        score +=
            bonus * 2;

        createFloatingText(
            `🌊 Aalto valmis! +${bonus} 💰`,
            400,
            40,
            "#ffd166",
            18
        );

        wave++;

        enemiesSpawned = 0;

        enemiesToSpawn =
            getEnemiesForWave();

        spawnTimer = 100;

        updateUI();
    }
}

// ========================================
// TORNIN SIJOITUS
// ========================================

function isValidTowerPosition(
    x,
    y
) {

    if (
        x < 30 ||
        x > 770 ||
        y < 30 ||
        y > 470
    ) {

        return false;
    }

    // Tukikohta

    if (
        x > 710 &&
        y > 80 &&
        y < 200
    ) {

        return false;
    }

    // Reitti

    for (
        let i = 0;
        i < path.length - 1;
        i++
    ) {

        const a =
            path[i];

        const b =
            path[i + 1];

        const distance =
            distanceToLineSegment(
                x,
                y,
                a.x,
                a.y,
                b.x,
                b.y
            );

        if (
            distance < 45
        ) {

            return false;
        }
    }

    // Muut tornit

    for (
        const tower of towers
    ) {

        const dx =
            tower.x - x;

        const dy =
            tower.y - y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distance <
            towerSpacing
        ) {

            return false;
        }
    }

    return true;
}

// ========================================
// ETÄISYYS REITISTÄ
// ========================================

function distanceToLineSegment(
    px,
    py,
    x1,
    y1,
    x2,
    y2
) {

    const dx =
        x2 - x1;

    const dy =
        y2 - y1;

    if (
        dx === 0 &&
        dy === 0
    ) {

        return Math.sqrt(
            (px - x1) ** 2 +
            (py - y1) ** 2
        );
    }

    let t =
        (
            (px - x1) * dx +
            (py - y1) * dy
        ) /
        (
            dx * dx +
            dy * dy
        );

    t =
        Math.max(
            0,
            Math.min(
                1,
                t
            )
        );

    const closestX =
        x1 + t * dx;

    const closestY =
        y1 + t * dy;

    return Math.sqrt(
        (px - closestX) ** 2 +
        (py - closestY) ** 2
    );
}

// ========================================
// KLIKKAUS
// ========================================

canvas.addEventListener(
    "click",
    event => {

        if (!gameRunning) {
            return;
        }

        updateMousePosition(event);

        const x = mouseX;
        const y = mouseY;

        // Klikattiinko tornia?

        const clickedTower =
            towers.find(
                tower => {

                    const dx =
                        tower.x - x;

                    const dy =
                        tower.y - y;

                    return Math.sqrt(
                        dx * dx +
                        dy * dy
                    ) < 25;
                }
            );

        if (clickedTower) {

            showTowerInfo(
                clickedTower
            );

            return;
        }

        // Tyhjä klikkaus

        if (selectedTower) {

            deselectTower();

            return;
        }

        // Rakentaminen

        if (
            !isValidTowerPosition(
                x,
                y
            )
        ) {

            createFloatingText(
                "❌ Tänne ei voi rakentaa",
                x,
                y,
                "#ff5555",
                14
            );

            return;
        }

        const type =
            towerTypes[
                selectedTowerType
            ];

        if (
            money <
            type.cost
        ) {

            if (selectedTowerText) {

                selectedTowerText.textContent =
                    "❌ Rahaa ei ole tarpeeksi!";
            }

            return;
        }

        const newTower = {

            x,

            y,

            type:
                selectedTowerType,

            range:
                type.range,

            damage:
                type.damage,

            cooldown: 0,

            level: 1,

            totalSpent:
                type.cost,

            targeting:
                "first"
        };

        towers.push(
            newTower
        );

        money -=
            type.cost;

        createEffect(
            x,
            y,
            "build"
        );

        if (selectedTowerText) {

            selectedTowerText.textContent =
                `${type.name} rakennettu!`;
        }

        updateUI();
    }
);

// ========================================
// TORNIN PÄIVITYS
// ========================================

function getUpgradeCost(tower) {

    return (
        tower.level *
        50
    );
}

function upgradeTower(tower) {

    if (!tower) {
        return;
    }

    const cost =
        getUpgradeCost(tower);

    if (
        money <
        cost
    ) {

        if (selectedTowerText) {

            selectedTowerText.textContent =
                `❌ Päivitys maksaa ${cost} rahaa`;
        }

        return;
    }

    money -= cost;

    tower.level++;

    tower.damage +=
        Math.round(
            tower.damage * 0.35
        );

    tower.range += 10;

    tower.totalSpent +=
        cost;

    // Pieni cooldown-parannus

    const type =
        towerTypes[tower.type];

    if (
        tower.level % 2 === 0 &&
        type.cooldown > 10
    ) {

        tower.cooldown = 0;
    }

    createEffect(
        tower.x,
        tower.y,
        "upgrade"
    );

    if (selectedTowerText) {

        selectedTowerText.textContent =
            `⬆️ ${type.name} päivitetty tasolle ${tower.level}`;
    }

    showTowerInfo(tower);

    updateUI();
}

if (upgradeTowerButton) {

    upgradeTowerButton.addEventListener(
        "click",
        () => {

            if (selectedTower) {

                upgradeTower(
                    selectedTower
                );
            }
        }
    );
}

// ========================================
// TORNIN MYYNTI
// ========================================

function getSellValue(tower) {

    if (!tower) {
        return 0;
    }

    return Math.floor(
        tower.totalSpent *
        0.6
    );
}

function sellTower(tower) {

    if (!tower) {
        return;
    }

    const value =
        getSellValue(tower);

    money += value;

    const index =
        towers.indexOf(tower);

    if (
        index !== -1
    ) {

        towers.splice(
            index,
            1
        );
    }

    createFloatingText(
        `+${value} 💰`,
        tower.x,
        tower.y,
        "#ffd166",
        16
    );

    selectedTower = null;

    hideElement(
        towerInfoPanel
    );

    showElement(
        buildPanel
    );

    if (selectedTowerText) {

        selectedTowerText.textContent =
            `💰 Torni myyty +${value} rahaa`;
    }

    updateUI();
}

if (sellTowerButton) {

    sellTowerButton.addEventListener(
        "click",
        () => {

            if (selectedTower) {

                sellTower(
                    selectedTower
                );
            }
        }
    );
}

// ========================================
// TARGETOINTI
// ========================================

function setTargeting(mode) {

    if (!selectedTower) {
        return;
    }

    if (
        !targetingModes.includes(mode)
    ) {

        return;
    }

    selectedTower.targeting =
        mode;

    updateTargetingUI();

    if (selectedTowerText) {

        selectedTowerText.textContent =
            `🎯 Targetointi: ${targetingNames[mode]}`;
    }
}

document
    .querySelectorAll(
        "[data-targeting]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                setTargeting(
                    button.dataset.targeting
                );
            }
        );
    });

// ========================================
// TORNIT
// ========================================

function drawTowers() {

    towers.forEach(tower => {

        const type =
            towerTypes[
                tower.type
            ];

        // Valinnan aura

        if (
            tower ===
            selectedTower
        ) {

            ctx.beginPath();

            ctx.arc(
                tower.x,
                tower.y,
                27,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "rgba(255,255,255,0.12)";

            ctx.fill();

            ctx.strokeStyle =
                "#ffffff";

            ctx.lineWidth = 2;

            ctx.stroke();
        }

        // Torni

        ctx.fillStyle =
            type.color;

        ctx.fillRect(
            tower.x - 17,
            tower.y - 17,
            34,
            34
        );

        ctx.strokeStyle =
            tower === selectedTower
                ? "#ffffff"
                : "#222";

        ctx.lineWidth = 2;

        ctx.strokeRect(
            tower.x - 17,
            tower.y - 17,
            34,
            34
        );

        // Torniase

        ctx.save();

        ctx.translate(
            tower.x,
            tower.y
        );

        let angle = 0;

        const target =
            getTargetForTower(
                tower
            );

        if (target) {

            angle =
                Math.atan2(
                    target.y - tower.y,
                    target.x - tower.x
                );
        }

        ctx.rotate(angle);

        ctx.fillStyle =
            "#222";

        ctx.fillRect(
            0,
            -5,
            24,
            10
        );

        ctx.restore();

        // Keskiosa

        ctx.fillStyle =
            "#222";

        ctx.beginPath();

        ctx.arc(
            tower.x,
            tower.y,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Level

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "bold 11px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            tower.level,
            tower.x,
            tower.y
        );

        ctx.textAlign =
            "left";

        ctx.textBaseline =
            "alphabetic";
    });
}

// ========================================
// TARGETIN VALINTA
// ========================================

function getTargetForTower(tower) {

    const targets =
        enemies.filter(
            enemy => {

                const dx =
                    enemy.x -
                    tower.x;

                const dy =
                    enemy.y -
                    tower.y;

                return (
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    ) <=
                    tower.range
                );
            }
        );

    if (
        targets.length === 0
    ) {

        return null;
    }

    const mode =
        tower.targeting ||
        "first";

    if (
        mode === "last"
    ) {

        return targets.reduce(
            (best, enemy) =>
                enemy.progress <
                best.progress
                    ? enemy
                    : best
        );
    }

    if (
        mode === "strongest"
    ) {

        return targets.reduce(
            (best, enemy) =>
                enemy.health >
                best.health
                    ? enemy
                    : best
        );
    }

    // First

    return targets.reduce(
        (best, enemy) =>
            enemy.progress >
            best.progress
                ? enemy
                : best
    );
}

// ========================================
// TORNIT AMPUVAT
// ========================================

function updateTowers() {

    towers.forEach(tower => {

        if (
            tower.cooldown > 0
        ) {

            tower.cooldown--;

            return;
        }

        const type =
            towerTypes[
                tower.type
            ];

        const target =
            getTargetForTower(
                tower
            );

        if (!target) {
            return;
        }

        bullets.push({

            x:
                tower.x,

            y:
                tower.y,

            target,

            speed:
                type.bulletSpeed,

            damage:
                tower.damage,

            splash:
                type.splash,

            towerType:
                tower.type,

            color:
                type.color
        });

        tower.cooldown =
            type.cooldown;
    });
}

// ========================================
// LUODIT
// ========================================

function updateBullets() {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];

        if (
            !enemies.includes(
                bullet.target
            )
        ) {

            bullets.splice(
                i,
                1
            );

            continue;
        }

        const dx =
            bullet.target.x -
            bullet.x;

        const dy =
            bullet.target.y -
            bullet.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distance <=
            Math.max(
                8,
                bullet.speed
            )
        ) {

            hitEnemy(
                bullet
            );

            bullets.splice(
                i,
                1
            );

            continue;
        }

        bullet.x +=
            (dx / distance) *
            bullet.speed;

        bullet.y +=
            (dy / distance) *
            bullet.speed;
    }
}

// ========================================
// OSUMA
// ========================================

function hitEnemy(bullet) {

    const target =
        bullet.target;

    if (
        !enemies.includes(target)
    ) {

        return;
    }

    createEffect(
        target.x,
        target.y,
        bullet.towerType ===
            "cannon"
            ? "explosion"
            : "hit"
    );

    if (
        bullet.splash > 0
    ) {

        enemies.forEach(enemy => {

            const dx =
                enemy.x -
                target.x;

            const dy =
                enemy.y -
                target.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (
                distance <=
                bullet.splash
            ) {

                const damageMultiplier =
                    enemy === target
                        ? 1
                        : 0.65;

                damageEnemy(
                    enemy,
                    bullet.damage *
                    damageMultiplier
                );
            }
        });

    } else {

        damageEnemy(
            target,
            bullet.damage
        );
    }

    removeDeadEnemies();

    updateUI();
}

// ========================================
// DAMAGE
// ========================================

function damageEnemy(
    enemy,
    damage
) {

    if (
        enemy.dead
    ) {

        return;
    }

    enemy.health -=
        damage;

    enemy.hitFlash =
        4;
}

// ========================================
// KUOLLEIDEN POISTO
// ========================================

function removeDeadEnemies() {

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            enemies[i];

        if (
            enemy.health <= 0 &&
            !enemy.dead
        ) {

            enemy.dead = true;

            money +=
                enemy.reward;

            score +=
                enemy.reward;

            const text =
                enemy.type === "boss"
                    ? `👑 BOSS KAATUI! +${enemy.reward}`
                    : `+${enemy.reward} 💰`;

            createFloatingText(
                text,
                enemy.x,
                enemy.y,
                enemy.type === "boss"
                    ? "#ffd166"
                    : "#ffffff",
                enemy.type === "boss"
                    ? 20
                    : 14
            );

            createEffect(
                enemy.x,
                enemy.y,
                enemy.type === "boss"
                    ? "bossDeath"
                    : "death"
            );

            enemies.splice(
                i,
                1
            );
        }
    }
}

// ========================================
// LUOTIEN PIIRTO
// ========================================

function drawBullets() {

    bullets.forEach(bullet => {

        ctx.beginPath();

        ctx.arc(
            bullet.x,
            bullet.y,
            bullet.towerType ===
                "cannon"
                ? 7
                : 5,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            bullet.towerType ===
                "cannon"
                ? "#ff6600"
                : bullet.towerType ===
                    "rapid"
                    ? "#7dff7d"
                    : "#ffff00";

        ctx.shadowBlur = 8;

        ctx.shadowColor =
            bullet.color;

        ctx.fill();

        ctx.shadowBlur = 0;
    });
}

// ========================================
// EFEKTIT
// ========================================

function createEffect(
    x,
    y,
    type
) {

    let amount = 8;
    let color = "#ffffff";
    let maxSize = 25;

    if (
        type === "explosion"
    ) {

        amount = 18;
        color = "#ff8c00";
        maxSize = 55;
    }

    if (
        type === "death"
    ) {

        amount = 12;
        color = "#ff5555";
        maxSize = 30;
    }

    if (
        type === "bossDeath"
    ) {

        amount = 35;
        color = "#ffd166";
        maxSize = 90;
    }

    if (
        type === "build"
    ) {

        amount = 12;
        color = "#55efc4";
        maxSize = 35;
    }

    if (
        type === "upgrade"
    ) {

        amount = 20;
        color = "#74b9ff";
        maxSize = 45;
    }

    effects.push({

        x,
        y,

        type,

        life: 1,

        decay:
            type === "bossDeath"
                ? 0.018
                : 0.035,

        amount,

        color,

        maxSize,

        particles:
            Array.from(
                {
                    length: amount
                },
                () => {

                    const angle =
                        Math.random() *
                        Math.PI *
                        2;

                    const speed =
                        0.5 +
                        Math.random() *
                        3;

                    return {

                        x: 0,
                        y: 0,

                        vx:
                            Math.cos(angle) *
                            speed,

                        vy:
                            Math.sin(angle) *
                            speed,

                        size:
                            2 +
                            Math.random() *
                            4
                    };
                }
            )
    });
}

function updateEffects() {

    for (
        let i = effects.length - 1;
        i >= 0;
        i--
    ) {

        const effect =
            effects[i];

        effect.life -=
            effect.decay;

        effect.particles.forEach(
            particle => {

                particle.x +=
                    particle.vx;

                particle.y +=
                    particle.vy;

                particle.vx *=
                    0.97;

                particle.vy *=
                    0.97;
            }
        );

        if (
            effect.life <= 0
        ) {

            effects.splice(
                i,
                1
            );
        }
    }
}

function drawEffects() {

    effects.forEach(
        effect => {

            ctx.save();

            ctx.globalAlpha =
                Math.max(
                    0,
                    effect.life
                );

            if (
                effect.type ===
                    "explosion" ||
                effect.type ===
                    "bossDeath"
            ) {

                const radius =
                    effect.maxSize *
                    (1 - effect.life);

                ctx.beginPath();

                ctx.arc(
                    effect.x,
                    effect.y,
                    radius,
                    0,
                    Math.PI * 2
                );

                ctx.strokeStyle =
                    effect.color;

                ctx.lineWidth =
                    3;

                ctx.stroke();
            }

            effect.particles.forEach(
                particle => {

                    ctx.beginPath();

                    ctx.arc(
                        effect.x +
                            particle.x,
                        effect.y +
                            particle.y,
                        particle.size,
                        0,
                        Math.PI * 2
                    );

                    ctx.fillStyle =
                        effect.color;

                    ctx.fill();
                }
            );

            ctx.restore();
        }
    );
}

// ========================================
// FLOATING TEXT
// ========================================

function createFloatingText(
    text,
    x,
    y,
    color = "#ffffff",
    size = 14
) {

    floatingTexts.push({

        text,

        x,
        y,

        color,

        size,

        life: 1,

        vy: -0.7
    });
}

function updateFloatingTexts() {

    for (
        let i =
            floatingTexts.length - 1;
        i >= 0;
        i--
    ) {

        const text =
            floatingTexts[i];

        text.y +=
            text.vy;

        text.life -=
            0.018;

        if (
            text.life <= 0
        ) {

            floatingTexts.splice(
                i,
                1
            );
        }
    }
}

function drawFloatingTexts() {

    floatingTexts.forEach(
        text => {

            ctx.save();

            ctx.globalAlpha =
                text.life;

            ctx.fillStyle =
                text.color;

            ctx.font =
                `bold ${text.size}px Arial`;

            ctx.textAlign =
                "center";

            ctx.fillText(
                text.text,
                text.x,
                text.y
            );

            ctx.restore();
        }
    );
}

// ========================================
// ETÄISYYS
// ========================================

function distanceBetweenPoints(
    a,
    b
) {

    const dx =
        b.x - a.x;

    const dy =
        b.y - a.y;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}

// ========================================
// UI
// ========================================

function updateUI() {

    const livesElement =
        document.getElementById(
            "lives"
        );

    const moneyElement =
        document.getElementById(
            "money"
        );

    const waveElement =
        document.getElementById(
            "wave"
        );

    const scoreElement =
        document.getElementById(
            "score"
        );

    if (livesElement) {
        livesElement.textContent =
            lives;
    }

    if (moneyElement) {
        moneyElement.textContent =
            money;
    }

    if (waveElement) {
        waveElement.textContent =
            wave;
    }

    if (scoreElement) {
        scoreElement.textContent =
            score;
    }

    if (
        selectedTower
    ) {

        showTowerInfo(
            selectedTower
        );
    }
}

// ========================================
// TOP 10
// AWS LAMBDA + API GATEWAY
// ========================================

async function loadLeaderboard() {

    try {

        console.log(
            "Ladataan TOP 10 AWS Lambdasta..."
        );

        const response =
            await fetch(
                `${API_URL}/scores`,
                {
                    method: "GET"
                }
            );

        if (
            !response.ok
        ) {

            throw new Error(
                `Leaderboard error: ${response.status}`
            );
        }

        const scores =
            await response.json();

        console.log(
            "TOP 10 ladattu:",
            scores
        );

        const leaderboard =
            document.getElementById(
                "leaderboard"
            );

        if (!leaderboard) {
            return;
        }

        leaderboard.innerHTML = `
            <div class="leaderboard-title">
                <h2>🏆 TOP 10</h2>
                <span>Parhaat pelaajat</span>
            </div>
        `;

        if (
            scores.length === 0
        ) {

            leaderboard.innerHTML +=
                "<p>Ei vielä tuloksia.</p>";

            return;
        }

        scores.forEach(
            (entry, index) => {

                const row =
                    document.createElement(
                        "div"
                    );

                let medal = "";

                if (
                    index === 0
                ) {

                    medal = "🥇 ";

                } else if (
                    index === 1
                ) {

                    medal = "🥈 ";

                } else if (
                    index === 2
                ) {

                    medal = "🥉 ";
                }

                row.textContent =
                    `${medal}${index + 1}. ` +
                    `${entry.playerName} — ` +
                    `${entry.score} pistettä — ` +
                    `aalto ${entry.wave}`;

                leaderboard.appendChild(
                    row
                );
            }
        );

    } catch (error) {

        console.error(
            "Leaderboard error:",
            error
        );

        const leaderboard =
            document.getElementById(
                "leaderboard"
            );

        if (leaderboard) {

            leaderboard.innerHTML = `
                <div class="leaderboard-title">
                    <h2>🏆 TOP 10</h2>
                    <span>Parhaat pelaajat</span>
                </div>
                <p>Leaderboardin lataaminen epäonnistui.</p>
            `;
        }
    }
}

// ========================================
// PISTEIDEN TALLENNUS
// AWS LAMBDA + API GATEWAY
// ========================================

async function saveScore() {

    if (
        scoreSaved
    ) {

        return;
    }

    scoreSaved = true;

    let playerName =
        prompt(
            "Peli loppui!\n\n" +
            "Anna nimesi TOP 10 -listaa varten:"
        );

    if (
        !playerName ||
        playerName.trim() === ""
    ) {

        playerName =
            "Tuntematon";
    }

    playerName =
        playerName
            .trim()
            .substring(
                0,
                20
            );

    try {

        console.log(
            "Tallennetaan pisteet AWS Lambdaan..."
        );

        const response =
            await fetch(
                `${API_URL}/scores`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            playerName,

                            score,

                            wave
                        })
                }
            );

        const result =
            await response.json();

        console.log(
            "AWS vastaus:",
            result
        );

        if (
            !response.ok
        ) {

            throw new Error(
                result.message ||
                "Tallennus epäonnistui"
            );
        }

        console.log(
            "Pisteet tallennettu onnistuneesti!"
        );

        await loadLeaderboard();

    } catch (error) {

        console.error(
            "Score save error:",
            error
        );

        alert(
            "Pisteiden tallennus epäonnistui.\n\n" +
            "Tarkista selaimen Console."
        );
    }
}

// ========================================
// GAME OVER
// ========================================

function gameOver() {

    if (
        !gameRunning
    ) {

        return;
    }

    gameRunning = false;

    if (finalScore) {

        finalScore.textContent =
            score;
    }

    if (finalWave) {

        finalWave.textContent =
            wave;
    }

    showElement(
        gameOverScreen
    );

    saveScore();
}

// ========================================
// ALOITUS
// ========================================

if (startButton) {

    startButton.addEventListener(
        "click",
        () => {

            gameRunning = true;

            hideElement(
                startScreen
            );

            updateUI();
        }
    );
}

// ========================================
// UUDELLEEN
// ========================================

if (restartButton) {

    restartButton.addEventListener(
        "click",
        () => {

            location.reload();
        }
    );
}

// ========================================
// PELISILMUKKA
// ========================================

function gameLoop() {

    drawMap();

    if (
        gameRunning
    ) {

        updateWave();

        updateEnemies();

        updateTowers();

        updateBullets();

        updateEffects();

        updateFloatingTexts();
    }

    drawTowers();

    drawEnemies();

    drawBullets();

    drawEffects();

    drawFloatingTexts();

    requestAnimationFrame(
        gameLoop
    );
}

// ========================================
// KÄYNNISTYS
// ========================================

selectTower(
    "basic"
);

updateUI();

loadLeaderboard();

gameLoop();