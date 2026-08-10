const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let lives = 10;
let money = 100;
let wave = 1;

const towerCost = 25;

let enemies = [];
let bullets = [];
let towers = [];

let enemiesToSpawn = 5;
let enemiesSpawned = 0;
let spawnTimer = 0;

// -------------------------
// KENTTÄ
// -------------------------

function drawMap() {
    ctx.fillStyle = "#4a8f45";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vihollisten reitti
    ctx.fillStyle = "#c2a36b";
    ctx.fillRect(0, 220, 800, 60);

    // Tukikohta
    ctx.fillStyle = "#444";
    ctx.fillRect(740, 190, 60, 120);

    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("TUKIKOHTA", 735, 180);
}

// -------------------------
// VIHOLLINEN
// -------------------------

function createEnemy() {
    enemies.push({
        x: -20,
        y: 250,
        speed: 1 + wave * 0.15,
        size: 20,
        health: 100 + wave * 20,
        maxHealth: 100 + wave * 20
    });

    enemiesSpawned++;
}

function drawEnemies() {
    enemies.forEach(enemy => {

        ctx.fillStyle = "red";

        ctx.beginPath();
        ctx.arc(
            enemy.x,
            enemy.y,
            enemy.size,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // HP-palkki
        ctx.fillStyle = "black";
        ctx.fillRect(
            enemy.x - 20,
            enemy.y - 30,
            40,
            5
        );

        ctx.fillStyle = "lime";
        ctx.fillRect(
            enemy.x - 20,
            enemy.y - 30,
            40 * (enemy.health / enemy.maxHealth),
            5
        );
    });
}

function updateEnemies() {

    enemies.forEach((enemy, index) => {

        enemy.x += enemy.speed;

        // Saavuttaa tukikohdan
        if (enemy.x > canvas.width) {

            lives--;

            document.getElementById("lives").textContent = lives;

            enemies.splice(index, 1);

            if (lives <= 0) {
                alert("Peli loppui!");

                lives = 10;
                money = 100;
                wave = 1;

                enemies = [];

                document.getElementById("lives").textContent = lives;
                document.getElementById("money").textContent = money;
                document.getElementById("wave").textContent = wave;
            }
        }
    });
}

// -------------------------
// AALLOT
// -------------------------

function updateWave() {

    // Lisää uusia vihollisia
    if (enemiesSpawned < enemiesToSpawn) {

        spawnTimer--;

        if (spawnTimer <= 0) {

            createEnemy();

            spawnTimer = 80;
        }
    }

    // Kun kaikki viholliset on tapettu
    // tai päässeet tukikohtaan
    else if (enemies.length === 0) {

        wave++;

        enemiesSpawned = 0;

        enemiesToSpawn = 5 + wave * 2;

        spawnTimer = 100;

        document.getElementById("wave").textContent = wave;
    }
}

// -------------------------
// TORNIT
// -------------------------

canvas.addEventListener("click", event => {

    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Ei voi rakentaa reitille
    if (y > 220 && y < 280) {
        return;
    }

    // Ei tarpeeksi rahaa
    if (money < towerCost) {
        return;
    }

    towers.push({
        x: x,
        y: y,
        range: 150,
        cooldown: 0
    });

    money -= towerCost;

    document.getElementById("money").textContent = money;
});

function drawTowers() {

    towers.forEach(tower => {

        ctx.fillStyle = "#555";

        ctx.fillRect(
            tower.x - 15,
            tower.y - 15,
            30,
            30
        );

        ctx.fillStyle = "#222";

        ctx.beginPath();

        ctx.arc(
            tower.x,
            tower.y,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });
}

// -------------------------
// AMPUMINEN
// -------------------------

function updateTowers() {

    towers.forEach(tower => {

        if (tower.cooldown > 0) {
            tower.cooldown--;
            return;
        }

        let target = null;
        let closestDistance = Infinity;

        enemies.forEach(enemy => {

            const dx = enemy.x - tower.x;
            const dy = enemy.y - tower.y;

            const distance = Math.sqrt(
                dx * dx + dy * dy
            );

            if (
                distance <= tower.range &&
                distance < closestDistance
            ) {
                target = enemy;
                closestDistance = distance;
            }
        });

        if (target) {

            bullets.push({
                x: tower.x,
                y: tower.y,
                target: target,
                speed: 5,
                damage: 25
            });

            tower.cooldown = 40;
        }
    });
}

// -------------------------
// LUODIT
// -------------------------

function updateBullets() {

    bullets.forEach((bullet, bulletIndex) => {

        // Jos kohde on kuollut
        if (!enemies.includes(bullet.target)) {

            bullets.splice(bulletIndex, 1);
            return;
        }

        const dx = bullet.target.x - bullet.x;
        const dy = bullet.target.y - bullet.y;

        const distance = Math.sqrt(
            dx * dx + dy * dy
        );

        if (distance < 5) {

            bullet.target.health -= bullet.damage;

            bullets.splice(bulletIndex, 1);

            if (bullet.target.health <= 0) {

                const enemyIndex =
                    enemies.indexOf(bullet.target);

                if (enemyIndex !== -1) {
                    enemies.splice(enemyIndex, 1);
                }

                money += 10;

                document.getElementById("money").textContent = money;
            }

        } else {

            bullet.x +=
                (dx / distance) * bullet.speed;

            bullet.y +=
                (dy / distance) * bullet.speed;
        }
    });
}

function drawBullets() {

    ctx.fillStyle = "yellow";

    bullets.forEach(bullet => {

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
// PELISILMUKKA
// -------------------------

function gameLoop() {

    drawMap();

    updateWave();
    updateEnemies();
    updateTowers();
    updateBullets();

    drawTowers();
    drawEnemies();
    drawBullets();

    requestAnimationFrame(gameLoop);
}

gameLoop();
