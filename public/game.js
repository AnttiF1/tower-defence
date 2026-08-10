const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ========================================
// PELIN TILASTOT
// ========================================

let lives = 10;
let money = 100;
let wave = 1;
let score = 0;

let gameRunning = false;
let scoreSaved = false;

const towerCost = 25;
const towerSpacing = 55;

let enemies = [];
let bullets = [];
let towers = [];

let enemiesToSpawn = 8;
let enemiesSpawned = 0;
let spawnTimer = 0;

let mouseX = 0;
let mouseY = 0;


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


// ========================================
// TOP 10 -LISTA
// Luodaan HTML:n kautta automaattisesti
// ========================================

let leaderboard =
    document.createElement("div");

leaderboard.id = "leaderboard";

leaderboard.style.width = "800px";
leaderboard.style.margin = "20px auto";
leaderboard.style.padding = "15px";
leaderboard.style.background = "#333";
leaderboard.style.borderRadius = "10px";
leaderboard.style.color = "white";

document.body.appendChild(
    leaderboard
);


// ========================================
// VIHOLLISTYYPIT
// ========================================

const enemyTypes = {

    normal: {
        color: "red",
        speed: 1.25,
        health: 100,
        reward: 10
    },

    fast: {
        color: "yellow",
        speed: 2.1,
        health: 65,
        reward: 15
    },

    tank: {
        color: "purple",
        speed: 0.75,
        health: 450,
        reward: 30
    }
};


// ========================================
// VIHOLLISEN REITTI
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
// KENTÄN PIIRTO
// ========================================

function drawMap() {

    // Tausta
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


    // Reitin keskiviiva
    ctx.strokeStyle =
        "rgba(255,255,255,0.15)";

    ctx.lineWidth = 2;

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
    ctx.fillStyle = "#444";

    ctx.fillRect(
        740,
        110,
        60,
        60
    );

    ctx.fillStyle = "white";

    ctx.font =
        "14px Arial";

    ctx.fillText(
        "TUKIKOHTA",
        735,
        100
    );


    // Tornin sijoituksen esikatselu
    if (
        isValidTowerPosition(
            mouseX,
            mouseY
        )
    ) {

        ctx.strokeStyle =
            "rgba(0,255,0,0.7)";

    } else {

        ctx.strokeStyle =
            "rgba(255,0,0,0.7)";
    }

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        mouseX,
        mouseY,
        25,
        0,
        Math.PI * 2
    );

    ctx.stroke();
}


// ========================================
// VIHOLLISTEN LUONTI
// ========================================

function createEnemy() {

    let type = "normal";

    const random =
        Math.random();


    // Fast-vihollisia
    if (
        wave >= 2 &&
        random < 0.30
    ) {

        type = "fast";
    }


    // Tankkeja
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

    // Käydään takaperin,
    // jotta poistaminen on turvallista

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


        // Vihollinen on saavuttamassa
        // seuraavaa reittipistettä

        if (!nextPoint) {

            lives--;

            enemies.splice(i, 1);

            updateUI();

            if (
                lives <= 0
            ) {

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


        // Seuraavaan pisteeseen
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


        // Vihollinen
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


        // Tankille reunus
        if (
            enemy.type === "tank"
        ) {

            ctx.strokeStyle =
                "white";

            ctx.lineWidth = 2;

            ctx.stroke();
        }


        // HP-palkin tausta
        ctx.fillStyle =
            "black";

        ctx.fillRect(
            enemy.x - 25,
            enemy.y - 35,
            50,
            6
        );


        // HP
        ctx.fillStyle =
            "lime";

        const healthPercent =
            Math.max(
                0,
                enemy.health /
                enemy.maxHealth
            );

        ctx.fillRect(
            enemy.x - 25,
            enemy.y - 35,
            50 *
            healthPercent,
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


            // Viholliset tulevat
            // nopeammin myöhemmissä
            // aalloissa

            spawnTimer =
                Math.max(
                    25,
                    70 -
                    wave * 3
                );
        }

        return;
    }


    // Seuraava aalto vasta kun
    // kaikki viholliset ovat kuolleet

    if (
        enemies.length === 0
    ) {

        wave++;

        enemiesSpawned = 0;


        // Enemmän vihollisia
        enemiesToSpawn =
            8 +
            wave * 4;


        spawnTimer = 90;

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

    // Ei canvasin ulkopuolelle
    if (
        x < 30 ||
        x > 770 ||
        y < 30 ||
        y > 470
    ) {

        return false;
    }


    // Ei tukikohdan päälle
    if (
        x > 710 &&
        y > 80 &&
        y < 200
    ) {

        return false;
    }


    // Ei reitin lähelle
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


    // Ei liian lähelle
    // toista tornia

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
            (px - x1) *
            (px - x1) +
            (py - y1) *
            (py - y1)
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
        (px - closestX) *
        (px - closestX) +
        (py - closestY) *
        (py - closestY)
    );
}


// ========================================
// HIIRI
// ========================================

canvas.addEventListener(
    "mousemove",
    event => {

        const rect =
            canvas.getBoundingClientRect();


        mouseX =
            event.clientX -
            rect.left;


        mouseY =
            event.clientY -
            rect.top;
    }
);


// ========================================
// TORNIN SIJOITTAMINEN
// ========================================

canvas.addEventListener(
    "click",
    event => {

        if (
            !gameRunning
        ) {

            return;
        }


        const rect =
            canvas.getBoundingClientRect();


        const x =
            event.clientX -
            rect.left;


        const y =
            event.clientY -
            rect.top;


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
                ) < 20;
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


        // Voiko tähän rakentaa?

        if (
            !isValidTowerPosition(
                x,
                y
            )
        ) {

            return;
        }


        // Onko rahaa?

        if (
            money <
            towerCost
        ) {

            return;
        }


        // Uusi torni

        towers.push({

            x: x,

            y: y,

            range: 145,

            damage: 25,

            cooldown: 0,

            level: 1
        });


        money -=
            towerCost;


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
        money <
        upgradeCost
    ) {

        return;
    }


    money -=
        upgradeCost;


    tower.level++;

    tower.damage += 20;

    tower.range += 15;


    updateUI();
}


// ========================================
// TORNIT
// ========================================

function drawTowers() {

    towers.forEach(
        tower => {

        // Tornin range
        // näkyy kun hiiri on tornin päällä

        const mouseDistance =
            Math.sqrt(
                (
                    tower.x -
                    mouseX
                ) ** 2 +
                (
                    tower.y -
                    mouseY
                ) ** 2
            );


        if (
            mouseDistance < 20
        ) {

            ctx.strokeStyle =
                "rgba(255,255,255,0.25)";

            ctx.beginPath();

            ctx.arc(
                tower.x,
                tower.y,
                tower.range,
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }


        // Tornin pohja
        ctx.fillStyle =
            "#555";

        ctx.fillRect(
            tower.x - 15,
            tower.y - 15,
            30,
            30
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


        // Level
        ctx.fillStyle =
            "white";

        ctx.font =
            "12px Arial";

        ctx.fillText(
            tower.level,
            tower.x - 4,
            tower.y + 4
        );
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

                // Tornit tähtäävät
                // viholliseen, joka on
                // pisimmällä reitillä

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

                x: tower.x,

                y: tower.y,

                target: target,

                speed: 6,

                damage:
                    tower.damage
            });


            // Hitaampi ampuminen

            tower.cooldown =
                65;
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

            bullets.splice(i, 1);

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


        // Osuma

        if (
            distance < 7
        ) {

            bullet.target.health -=
                bullet.damage;


            bullets.splice(i, 1);


            // Vihollinen kuolee

            if (
                bullet.target.health <=
                0
            ) {

                const enemyIndex =
                    enemies.indexOf(
                        bullet.target
                    );


                if (
                    enemyIndex !== -1
                ) {

                    enemies.splice(
                        enemyIndex,
                        1
                    );
                }


                money +=
                    bullet.target.reward;


                score +=
                    bullet.target.reward;


                updateUI();
            }


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
// LUOTIEN PIIRTO
// ========================================

function drawBullets() {

    ctx.fillStyle =
        "yellow";


    bullets.forEach(
        bullet => {

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
// KÄYTTÖLIITTYMÄ
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
// TOP 10 HAKEMINEN
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
                "Scores API error"
            );
        }


        const scores =
            await response.json();


        leaderboard.innerHTML =
            "<h2>🏆 TOP 10</h2>";


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


            row.style.padding =
                "6px";


            row.style.fontSize =
                "18px";


            row.innerHTML =
                `${index + 1}. 
                <strong>
                ${escapeHtml(
                    entry.playerName
                )}
                </strong>
                — ${entry.score} pistettä
                — aalto ${entry.wave}`;


            leaderboard.appendChild(
                row
            );
        });


    } catch (error) {

        console.error(
            "Leaderboard error:",
            error
        );


        leaderboard.innerHTML =
            "<h2>🏆 TOP 10</h2>" +
            "<p>TOP 10 -listaa ei voitu ladata.</p>";
    }
}


// ========================================
// TURVALLINEN TEKSTI
// ========================================

function escapeHtml(
    text
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;
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
            "Anna pelaajanimesi TOP 10 -listaa varten:"
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


        // Päivitetään TOP 10
        await loadLeaderboard();


    } catch (error) {

        console.error(
            "Score save error:",
            error
        );


        alert(
            "Pisteiden tallennus epäonnistui.\n" +
            "Tarkista, että serveri ja MongoDB toimivat."
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


    // Tallennetaan tulos
    saveScore();
}


// ========================================
// PELIN ALOITUS
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
// UUDELLEENALOITUS
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

    if (
        gameRunning
    ) {

        drawMap();

        updateWave();

        updateEnemies();

        updateTowers();

        updateBullets();

        drawTowers();

        drawEnemies();

        drawBullets();
    }


    requestAnimationFrame(
        gameLoop
    );
}


// ========================================
// KÄYNNISTYS
// ========================================

updateUI();

loadLeaderboard();

gameLoop();
