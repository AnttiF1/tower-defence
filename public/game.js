const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// -------------------------
// PELIN TILASTOT
// -------------------------

let lives = 10;
let money = 100;
let wave = 1;
let score = 0;

let gameRunning = false;

const towerCost = 25;
const towerSpacing = 50;

let enemies = [];
let bullets = [];
let towers = [];

let enemiesToSpawn = 5;
let enemiesSpawned = 0;
let spawnTimer = 0;

let mouseX = 0;
let mouseY = 0;


// -------------------------
// HTML-ELEMENTIT
// -------------------------

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


// -------------------------
// VIHOLLISTYYPIT
// -------------------------

const enemyTypes = {

    normal: {
        color: "red",
        speed: 1.2,
        health: 100,
        reward: 10
    },

    fast: {
        color: "yellow",
        speed: 2.2,
        health: 60,
        reward: 15
    },

    tank: {
        color: "purple",
        speed: 0.7,
        health: 300,
        reward: 30
    }
};


// -------------------------
// KENTÄN PIIRTO
// -------------------------

function drawMap() {

    // Tausta
    ctx.fillStyle = "#4a8f45";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Vihollisten reitti
    ctx.fillStyle = "#c2a36b";

    ctx.fillRect(
        0,
        220,
        800,
        60
    );

    // Tukikohta
    ctx.fillStyle = "#444";

    ctx.fillRect(
        740,
        190,
        60,
        120
    );

    ctx.fillStyle = "white";
    ctx.font = "16px Arial";

    ctx.fillText(
        "TUKIKOHTA",
        735,
        180
    );

    // Tornin rakennuspaikan esikatselu
    if (isValidTowerPosition(mouseX, mouseY)) {

        ctx.strokeStyle =
            "rgba(0,255,0,0.5)";

    } else {

        ctx.strokeStyle =
            "rgba(255,0,0,0.5)";
    }

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


// -------------------------
// VIHOLLISEN LUONTI
// -------------------------

function createEnemy() {

    let type = "normal";

    const random = Math.random();

    // Fast-vihollisia aallosta 3 alkaen
    if (
        wave >= 3 &&
        random < 0.20
    ) {

        type = "fast";

    // Tank-vihollisia aallosta 5 alkaen
    } else if (
        wave >= 5 &&
        random < 0.15
    ) {

        type = "tank";
    }

    const template =
        enemyTypes[type];

    const health =
        template.health +
        wave * 10;

    enemies.push({

        x: -20,

        y: 250,

        type: type,

        speed:
            template.speed +
            wave * 0.05,

        size:
            type === "tank"
                ? 25
                : 20,

        health: health,

        maxHealth: health,

        reward:
            template.reward
    });

    enemiesSpawned++;
}


// -------------------------
// VIHOLLISTEN PIIRTO
// -------------------------

function drawEnemies() {

    enemies.forEach(enemy => {

        const type =
            enemyTypes[enemy.type];

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

        // HP-palkin tausta
        ctx.fillStyle = "black";

        ctx.fillRect(
            enemy.x - 25,
            enemy.y - 35,
            50,
            6
        );

        // HP
        ctx.fillStyle = "lime";

        ctx.fillRect(
            enemy.x - 25,
            enemy.y - 35,
            50 *
            (enemy.health /
            enemy.maxHealth),
            6
        );
    });
}


// -------------------------
// VIHOLLISTEN LIIKE
// -------------------------

function updateEnemies() {

    enemies.forEach(
        (enemy, index) => {

        enemy.x += enemy.speed;

        // Vihollinen saavuttaa tukikohdan
        if (
            enemy.x >
            canvas.width
        ) {

            lives--;

            updateUI();

            enemies.splice(
                index,
                1
            );

            // Game Over
            if (lives <= 0) {

                gameOver();
            }
        }
    });
}


// -------------------------
// AALLOT
// -------------------------

function updateWave() {

    // Luodaan uusia vihollisia
    if (
        enemiesSpawned <
        enemiesToSpawn
    ) {

        spawnTimer--;

        if (
            spawnTimer <= 0
        ) {

            createEnemy();

            spawnTimer = 80;
        }

    // Kaikki viholliset ovat kuolleet
    } else if (
        enemies.length === 0
    ) {

        wave++;

        enemiesSpawned = 0;

        enemiesToSpawn =
            5 + wave * 2;

        spawnTimer = 100;

        updateUI();
    }
}


// -------------------------
// TORNIN SIJOITTAMINEN
// -------------------------

function isValidTowerPosition(
    x,
    y
) {

    // Ei saa rakentaa reitille
    if (
        y > 220 &&
        y < 280
    ) {

        return false;
    }

    // Ei saa rakentaa tukikohdan päälle
    if (
        x > 710 &&
        x < 800 &&
        y > 160 &&
        y < 330
    ) {

        return false;
    }

    // Ei saa rakentaa toisen tornin päälle
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


// -------------------------
// HIIRI
// -------------------------

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


// -------------------------
// KLIKKAUS
// -------------------------

canvas.addEventListener(
    "click",
    event => {

        if (!gameRunning) {
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


        // Tarkistetaan klikattiinko
        // olemassa olevaa tornia
        const clickedTower =
            towers.find(tower => {

            const dx =
                tower.x - x;

            const dy =
                tower.y - y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            return distance < 20;
        });


        // Jos torni löytyi,
        // päivitetään sitä
        if (clickedTower) {

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


        // Rahaa oltava tarpeeksi
        if (
            money <
            towerCost
        ) {

            return;
        }


        // Luodaan torni
        towers.push({

            x: x,

            y: y,

            range: 150,

            damage: 25,

            cooldown: 0,

            level: 1
        });


        money -=
            towerCost;

        updateUI();
    }
);


// -------------------------
// TORNIN PÄIVITYS
// -------------------------

function upgradeTower(
    tower
) {

    const upgradeCost =
        tower.level * 25;

    if (
        money <
        upgradeCost
    ) {

        return;
    }

    money -=
        upgradeCost;

    tower.level++;

    tower.damage += 15;

    tower.range += 10;

    updateUI();
}


// -------------------------
// TORNIT
// -------------------------

function drawTowers() {

    towers.forEach(
        tower => {

        // Tornin pohja
        ctx.fillStyle =
            "#555";

        ctx.fillRect(
            tower.x - 15,
            tower.y - 15,
            30,
            30
        );


        // Tornin keskiosa
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


        // Tornin level
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


// -------------------------
// TORNIT AMPUVAT
// -------------------------

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

        let closestDistance =
            Infinity;


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
                tower.range &&
                distance <
                closestDistance
            ) {

                target =
                    enemy;

                closestDistance =
                    distance;
            }
        });


        if (target) {

            bullets.push({

                x: tower.x,

                y: tower.y,

                target: target,

                speed: 5,

                damage:
                    tower.damage
            });


            tower.cooldown =
                40;
        }
    });
}


// -------------------------
// LUOTIEN PÄIVITYS
// -------------------------

function updateBullets() {

    bullets.forEach(
        (bullet, bulletIndex) => {

        // Kohde on kuollut
        if (
            !enemies.includes(
                bullet.target
            )
        ) {

            bullets.splice(
                bulletIndex,
                1
            );

            return;
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


        // Luoti osuu
        if (
            distance < 5
        ) {

            bullet.target.health -=
                bullet.damage;


            bullets.splice(
                bulletIndex,
                1
            );


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


                // Rahaa
                money +=
                    bullet.target.reward;


                // Pisteitä
                score +=
                    bullet.target.reward;


                updateUI();
            }

        } else {

            // Luoti liikkuu kohti vihollista
            bullet.x +=
                (dx / distance) *
                bullet.speed;

            bullet.y +=
                (dy / distance) *
                bullet.speed;
        }
    });
}


// -------------------------
// LUOTIEN PIIRTO
// -------------------------

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


// -------------------------
// KÄYTTÖLIITTYMÄN PÄIVITYS
// -------------------------

function updateUI() {

    document.getElementById(
        "lives"
    ).textContent = lives;

    document.getElementById(
        "money"
    ).textContent = money;

    document.getElementById(
        "wave"
    ).textContent = wave;

    document.getElementById(
        "score"
    ).textContent = score;
}


// -------------------------
// GAME OVER
// -------------------------

function gameOver() {

    gameRunning = false;

    finalScore.textContent =
        score;

    finalWave.textContent =
        wave;

    gameOverScreen.classList.remove(
        "hidden"
    );
}


// -------------------------
// PELIN ALOITUS
// -------------------------

startButton.addEventListener(
    "click",
    () => {

    gameRunning = true;

    startScreen.classList.add(
        "hidden"
    );

    updateUI();
});


// -------------------------
// PELIN Uudelleenkäynnistys
// -------------------------

restartButton.addEventListener(
    "click",
    () => {

    location.reload();
});


// -------------------------
// PELISILMUKKA
// -------------------------

function gameLoop() {

    if (gameRunning) {

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


// -------------------------
// KÄYNNISTETÄÄN PELISILMUKKA
// -------------------------

gameLoop();
