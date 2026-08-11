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

let enemiesToSpawn = 8;
let enemiesSpawned = 0;
let spawnTimer = 0;

let mouseX = 400;
let mouseY = 250;

let selectedTowerType = "basic";

// Kuinka lähellä toinen torni saa olla
const towerSpacing = 55;


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


// ========================================
// TORNITYYPIT
// ========================================

const towerTypes = {

    basic: {
        name: "Basic Tower",
        color: "#3498db",
        cost: 25,
        damage: 25,
        range: 145,
        cooldown: 55,
        bulletSpeed: 6,
        splash: 0
    },

    rapid: {
        name: "Rapid Tower",
        color: "#2ecc71",
        cost: 50,
        damage: 12,
        range: 130,
        cooldown: 20,
        bulletSpeed: 8,
        splash: 0
    },

    cannon: {
        name: "Cannon Tower",
        color: "#e74c3c",
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
        color: "#e74c3c",
        speed: 1.25,
        health: 100,
        reward: 10
    },

    fast: {
        color: "#f1c40f",
        speed: 2.1,
        health: 65,
        reward: 15
    },

    tank: {
        color: "#8e44ad",
        speed: 0.75,
        health: 450,
        reward: 30
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

    const tower =
        towerTypes[type];

    selectedTowerText.textContent =
        `Valittu: ${tower.name} • 💰 ${tower.cost}`;
}


// ========================================
// TORNINAPIT
// ========================================

document
    .getElementById("basicTowerButton")
    .addEventListener(
        "click",
        () => selectTower("basic")
    );

document
    .getElementById("rapidTowerButton")
    .addEventListener(
        "click",
        () => selectTower("rapid")
    );

document
    .getElementById("cannonTowerButton")
    .addEventListener(
        "click",
        () => selectTower("cannon")
    );


// ========================================
// KURSORIN KOORDINAATIT
// ========================================

// TÄRKEÄ KORJAUS:
// Canvas on CSS:llä pienempi kuin oikea
// 800x500 piirtoalue.
// Muutetaan hiiren sijainti canvasin
// omiin koordinaatteihin.

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
// KARTAN PIIRTO
// ========================================

function drawMap() {

    ctx.fillStyle = "#4a8f45";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Reitti

    ctx.strokeStyle = "#c2a36b";

    ctx.lineWidth = 60;

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


    // Tukikohta

    ctx.fillStyle = "#333";

    ctx.fillRect(
        740,
        110,
        60,
        60
    );

    ctx.fillStyle = "#fff";

    ctx.font = "12px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        "TUKIKOHTA",
        770,
        100
    );

    ctx.textAlign = "left";


    // Rakennuspaikan esikatselu

    const valid =
        isValidTowerPosition(
            mouseX,
            mouseY
        );

    const tower =
        towerTypes[
            selectedTowerType
        ];


    // Kantaman rinkula

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
            ? "rgba(46, 204, 113, 0.08)"
            : "rgba(231, 76, 60, 0.08)";

    ctx.fill();

    ctx.strokeStyle =
        valid
            ? "rgba(46, 204, 113, 0.75)"
            : "rgba(231, 76, 60, 0.75)";

    ctx.lineWidth = 2;

    ctx.stroke();


    // Tornin esikatselu

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
            ? "#fff"
            : "#ff5555";

    ctx.lineWidth = 2;

    ctx.stroke();
}


// ========================================
// VIHOLLISTEN LUONTI
// ========================================

function createEnemy() {

    let type = "normal";

    const random =
        Math.random();


    if (
        wave >= 2 &&
        random < 0.30
    ) {

        type = "fast";
    }


    if (
        wave >= 4 &&
        random < 0.18
    ) {

        type = "tank";
    }


    const template =
        enemyTypes[type];


    const health =
        template.health +
        wave * 25;


    const speed =
        template.speed +
        wave * 0.04;


    enemies.push({

        x: path[0].x,

        y: path[0].y,

        pathIndex: 0,

        type: type,

        speed: speed,

        size:
            type === "tank"
                ? 27
                : 18,

        health: health,

        maxHealth: health,

        reward:
            template.reward

    });


    enemiesSpawned++;
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

        const nextPoint =
            path[
                enemy.pathIndex + 1
            ];


        if (!nextPoint) {

            lives--;

            enemies.splice(i, 1);

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
    }
}


// ========================================
// VIHOLLISTEN PIIRTO
// ========================================

function drawEnemies() {

    enemies.forEach(
        enemy => {

        const type =
            enemyTypes[
                enemy.type
            ];


        ctx.fillStyle =
            type.color;


        ctx.beginPath();

        ctx.arc(
            enemy.x,
            enemy.y,
            enemy.size,
            0,
            Math.PI * 2
        );

        ctx.fill();


        if (
            enemy.type === "tank"
        ) {

            ctx.strokeStyle =
                "#fff";

            ctx.lineWidth = 2;

            ctx.stroke();
        }


        // HP-palkki

        ctx.fillStyle =
            "#222";

        ctx.fillRect(
            enemy.x - 25,
            enemy.y - 35,
            50,
            6
        );


        ctx.fillStyle =
            "#2ecc71";


        const hp =
            Math.max(
                0,
                enemy.health /
                enemy.maxHealth
            );


        ctx.fillRect(
            enemy.x - 25,
            enemy.y - 35,
            50 * hp,
            6
        );

    });
}


// ========================================
// AALLOT
// ========================================

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
                    25,
                    70 -
                    wave * 3
                );
        }

        return;
    }


    if (
        enemies.length === 0
    ) {

        wave++;

        enemiesSpawned = 0;

        enemiesToSpawn =
            8 +
            wave * 4;

        spawnTimer = 90;

        updateUI();
    }
}


// ========================================
// TORNIN SIJOITTAMINEN
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


    // Tukikohdan päälle ei saa rakentaa

    if (
        x > 710 &&
        y > 80 &&
        y < 200
    ) {

        return false;
    }


    // Reitin päälle ei saa rakentaa

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


    // Liian lähelle toista tornia
    // ei saa rakentaa

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
            distance < towerSpacing
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
            Math.min(1, t)
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


        // Käytetään samaa korjattua
        // koordinaattimuunnosta kuin
        // kursorissa.

        updateMousePosition(event);


        const x = mouseX;
        const y = mouseY;


        // Jos klikataan olemassa olevaa
        // tornia -> päivitetään sitä

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
                ) < 22;
            }
        );


        if (
            clickedTower
        ) {

            upgradeTower(
                clickedTower
            );

            return;
        }


        // Tarkistetaan rakennuspaikka

        if (
            !isValidTowerPosition(
                x,
                y
            )
        ) {

            return;
        }


        const type =
            towerTypes[
                selectedTowerType
            ];


        // Ei tarpeeksi rahaa

        if (
            money < type.cost
        ) {

            selectedTowerText.textContent =
                "❌ Rahaa ei ole tarpeeksi!";

            return;
        }


        // RAKENNETAAN TORNI

        towers.push({

            x: x,

            y: y,

            type:
                selectedTowerType,

            range:
                type.range,

            damage:
                type.damage,

            cooldown: 0,

            level: 1
        });


        money -=
            type.cost;


        selectedTowerText.textContent =
            `${type.name} rakennettu!`;


        updateUI();
    }
);


// ========================================
// TORNIN PÄIVITYS
// ========================================

function upgradeTower(
    tower
) {

    const upgradeCost =
        tower.level * 50;


    if (
        money < upgradeCost
    ) {

        selectedTowerText.textContent =
            `❌ Päivitys maksaa ${upgradeCost} rahaa`;

        return;
    }


    money -=
        upgradeCost;


    tower.level++;


    tower.damage +=
        Math.round(
            tower.damage * 0.35
        );


    tower.range += 10;


    selectedTowerText.textContent =
        `⬆️ Torni päivitetty tasolle ${tower.level}`;


    updateUI();
}


// ========================================
// TORNIT
// ========================================

function drawTowers() {

    towers.forEach(
        tower => {

        const type =
            towerTypes[
                tower.type
            ];


        // Torni

        ctx.fillStyle =
            type.color;


        ctx.fillRect(
            tower.x - 17,
            tower.y - 17,
            34,
            34
        );


        // Torniin liittyvä ympyrä

        ctx.strokeStyle =
            "#222";

        ctx.lineWidth = 2;

        ctx.strokeRect(
            tower.x - 17,
            tower.y - 17,
            34,
            34
        );


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


        // Tason numero

        ctx.fillStyle =
            "#fff";

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
// TORNIT AMPUVAT
// ========================================

function updateTowers() {

    towers.forEach(
        tower => {

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


        let target = null;

        let bestProgress =
            -Infinity;


        enemies.forEach(
            enemy => {

            const dx =
                enemy.x -
                tower.x;

            const dy =
                enemy.y -
                tower.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance <=
                tower.range
            ) {

                if (
                    enemy.pathIndex >
                    bestProgress
                ) {

                    bestProgress =
                        enemy.pathIndex;

                    target =
                        enemy;
                }
            }
        });


        if (
            target
        ) {

            bullets.push({

                x:
                    tower.x,

                y:
                    tower.y,

                target:
                    target,

                speed:
                    type.bulletSpeed,

                damage:
                    tower.damage,

                splash:
                    type.splash,

                towerType:
                    tower.type
            });


            tower.cooldown =
                type.cooldown;
        }
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
            distance < 8
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

function hitEnemy(
    bullet
) {

    const target =
        bullet.target;


    if (
        bullet.splash > 0
    ) {

        enemies.forEach(
            enemy => {

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

                enemy.health -=
                    bullet.damage;
            }
        });

    } else {

        target.health -=
            bullet.damage;
    }


    // Poistetaan kuolleet

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        if (
            enemies[i].health <= 0
        ) {

            money +=
                enemies[i].reward;

            score +=
                enemies[i].reward;

            enemies.splice(
                i,
                1
            );
        }
    }


    updateUI();
}


// ========================================
// LUOTIEN PIIRTO
// ========================================

function drawBullets() {

    bullets.forEach(
        bullet => {

        if (
            bullet.towerType ===
            "cannon"
        ) {

            ctx.fillStyle =
                "#ff6600";

        } else if (
            bullet.towerType ===
            "rapid"
        ) {

            ctx.fillStyle =
                "#7dff7d";

        } else {

            ctx.fillStyle =
                "#ffff00";
        }


        ctx.beginPath();

        ctx.arc(
            bullet.x,
            bullet.y,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });
}


// ========================================
// UI
// ========================================

function updateUI() {

    document.getElementById(
        "lives"
    ).textContent =
        lives;


    document.getElementById(
        "money"
    ).textContent =
        money;


    document.getElementById(
        "wave"
    ).textContent =
        wave;


    document.getElementById(
        "score"
    ).textContent =
        score;
}


// ========================================
// TOP 10
// ========================================

async function loadLeaderboard() {

    try {

        const response =
            await fetch(
                "/api/scores"
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Leaderboard error"
            );
        }


        const scores =
            await response.json();


        const leaderboard =
            document.getElementById(
                "leaderboard"
            );


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


            row.textContent =
                `${index + 1}. ` +
                `${entry.playerName} — ` +
                `${entry.score} pistettä — ` +
                `aalto ${entry.wave}`;


            leaderboard.appendChild(
                row
            );
        });


    } catch (error) {

        console.error(
            "Leaderboard error:",
            error
        );
    }
}


// ========================================
// PISTEIDEN TALLENNUS
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
            .substring(0, 20);


    try {

        const response =
            await fetch(
                "/api/scores",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            playerName:
                                playerName,

                            score:
                                score,

                            wave:
                                wave
                        })
                }
            );


        const result =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                result.message ||
                "Tallennus epäonnistui"
            );
        }


        console.log(
            "Pisteet tallennettu:",
            result
        );


        await loadLeaderboard();


    } catch (error) {

        console.error(
            "Score save error:",
            error
        );


        alert(
            "Pisteiden tallennus epäonnistui."
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


    finalScore.textContent =
        score;


    finalWave.textContent =
        wave;


    gameOverScreen.classList.remove(
        "hidden"
    );


    saveScore();
}


// ========================================
// ALOITUS
// ========================================

startButton.addEventListener(
    "click",
    () => {

    gameRunning = true;

    startScreen.classList.add(
        "hidden"
    );

    updateUI();
});


// ========================================
// UUDELLEEN
// ========================================

restartButton.addEventListener(
    "click",
    () => {

    location.reload();
});


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

        drawTowers();

        drawEnemies();

        drawBullets();

    } else {

        // Näytetään tornit myös
        // kun peli ei ole käynnissä

        drawTowers();
    }


    requestAnimationFrame(
        gameLoop
    );
}


// ========================================
// KÄYNNISTYS
// ========================================

selectTower("basic");

updateUI();

loadLeaderboard();

gameLoop();