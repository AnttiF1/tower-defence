const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let lives = 10;
let money = 100;
let wave = 1;

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

    // Rakennuspaikan esikatselu
    if (isValidTowerPosition(mouseX, mouseY)) {
        ctx.strokeStyle = "rgba(0,255,0,0.5)";
    } else {
        ctx.strokeStyle = "rgba(255,0,0,0.5)";
    }

    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 25, 0, Math.PI * 2);
    ctx.stroke();
}

// -------------------------
// VIHOLLINEN
// -------------------------

function createEnemy() {
    const health = 100 + wave * 20;

    enemies.push({
        x: -20,
        y: 250,
        speed: 1 + wave * 0.15,
        size: 20,
        health: health,
        maxHealth: health
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
                towers = [];
                bullets = [];

                enemiesSpawned = 0;
                enemiesToSpawn = 5;

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

    if (enemiesSpawned < enemiesToSpawn) {

        spawnTimer--;

        if (spawnTimer <= 0) {

            createEnemy();

            spawnTimer = 80;
        }

    } else if (enemies.length === 0) {

        wave++;

        enemiesSpawned = 0;

        enemiesToSpawn = 5 + wave * 2;

        spawnTimer = 100;

        document.getElementById("wave").textContent = wave;
    }
}

// -------------------------
// TORNIEN SIJOITTAMINEN
// -------------------------

function isValidTowerPosition(x, y) {

    // Ei saa rakentaa vihollisten reitille
    if (y > 220 && y < 280) {
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

    // Ei saa rakentaa liian lähelle toista tornia
    for (const tower of towers) {

        const dx = tower.x - x;
        const dy = tower.y - y;

        const distance = Math.sqrt(
            dx * dx + dy * dy
        );

        if (distance < towerSpacing) {
            return false;
        }
    }

    return true;
}

canvas.addEventListener("mousemove", event => {

    const rect = canvas.getBoundingClientRect();

    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

canvas.addEventListener("click", event => {

    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Jos klikataan olemassa olevaa tornia,
    // päivitetään se
    const clickedTower = towers.find(tower => {

        const dx = tower.x - x;
        const dy = tower.y - y;

        const distance = Math.sqrt(
            dx * dx + dy * dy
        );

        return distance < 20;
    });

    if (clickedTower) {

        upgradeTower(clickedTower);

        return;
    }

    // Tarkistetaan rakennuspaikka
    if (!isValidTowerPosition(x, y)) {
        return;
    }

    // Tarkistetaan raha
    if (money < towerCost) {
        return;
    }

    towers.push({
        x: x,
        y: y,
        range: 150,
        damage: 25,
        cooldown: 0,
        level: 1
    });

    money -= towerCost;

    document.getElementById("money").textContent = money;
});

// -------------------------
// TORNIN PÄIVITYS
// -------------------------

function upgradeTower(tower) {

    const upgradeCost = tower.level * 25;

    if (money < upgradeCost) {
        return;
    }

    money -= upgradeCost;

    tower.level++;

    tower.damage += 15;
    tower.range += 10;

    document.getElementById("money").textContent = money;
}

// -------------------------
// TORNIT
// -------------------------

function drawTowers() {

    towers.forEach(tower => {

        // Torni
        ctx.fillStyle = "#555";

        ctx.fillRect(
            tower.x - 15,
            tower.y - 15,
            30,
            30
        );

        // Tornin keskiosa
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

        // Level
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";

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
                dx * dx +
                dy * dy
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
                damage: tower.damage
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

        if (!enemies.includes(bullet.target)) {

            bullets.splice(bulletIndex, 1);

            return;
        }

        const dx = bullet.target.x - bullet.x;
        const dy = bullet.target.y - bullet.y;

        const distance = Math.sqrt(
            dx * dx +
            dy * dy
        );

        if (distance < 5) {

            bullet.target.health -= bullet.damage;

            bullets.splice(bulletIndex, 1);

            if (bullet.target.health <= 0) {

                const enemyIndex =
                    enemies.indexOf(bullet.target);

                if (enemyIndex !== -1) {

                    enemies.splice(
                        enemyIndex,
                        1
                    );
                }

                money += 10;

                document.getElementById("money").textContent = money;
            }

        } else {

            bullet.x +=
                (dx / distance) *
                bullet.speed;

            bullet.y +=
                (dy / distance) *
                bullet.speed;
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
