const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let lives = 10;
let money = 100;
let wave = 1;

const towerCost = 25;

const enemy = {
    x: 0,
    y: 250,
    speed: 1.2,
    size: 20,
    health: 100
};

const towers = [];
const bullets = [];

// Piirretään pelikenttä
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

// Piirretään vihollinen
function drawEnemy() {
    ctx.fillStyle = "red";

    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();

    // HP-palkki
    ctx.fillStyle = "black";
    ctx.fillRect(enemy.x - 20, enemy.y - 30, 40, 5);

    ctx.fillStyle = "lime";
    ctx.fillRect(
        enemy.x - 20,
        enemy.y - 30,
        40 * (enemy.health / 100),
        5
    );
}

// Päivitetään vihollisen sijainti
function updateEnemy() {
    enemy.x += enemy.speed;

    if (enemy.x > canvas.width) {
        lives--;

        document.getElementById("lives").textContent = lives;

        resetEnemy();

        if (lives <= 0) {
            alert("Peli loppui!");
            lives = 10;
            document.getElementById("lives").textContent = lives;
        }
    }
}

// Palautetaan vihollinen alkuun
function resetEnemy() {
    enemy.x = 0;
    enemy.health = 100;
}

// Piirretään tornit
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
        ctx.arc(tower.x, tower.y, 10, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Lisätään torni hiiren klikkauksella
canvas.addEventListener("click", event => {
    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Tornia ei voi sijoittaa vihollisen reitille
    if (y > 220 && y < 280) {
        return;
    }

    // Rahaa täytyy olla tarpeeksi
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

// Tornit etsivät vihollisen ja ampuvat
function updateTowers() {
    towers.forEach(tower => {

        if (tower.cooldown > 0) {
            tower.cooldown--;
            return;
        }

        const distance = Math.sqrt(
            Math.pow(enemy.x - tower.x, 2) +
            Math.pow(enemy.y - tower.y, 2)
        );

        if (distance <= tower.range) {

            bullets.push({
                x: tower.x,
                y: tower.y,
                speed: 5,
                damage: 25
            });

            tower.cooldown = 40;
        }
    });
}

// Päivitetään luodit
function updateBullets() {
    bullets.forEach((bullet, index) => {

        const dx = enemy.x - bullet.x;
        const dy = enemy.y - bullet.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {

            enemy.health -= bullet.damage;

            bullets.splice(index, 1);

            if (enemy.health <= 0) {
                money += 10;

                document.getElementById("money").textContent = money;

                resetEnemy();
            }

        } else {

            bullet.x += (dx / distance) * bullet.speed;
            bullet.y += (dy / distance) * bullet.speed;
        }
    });
}

// Piirretään luodit
function drawBullets() {
    ctx.fillStyle = "yellow";

    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Pelisilmukka
function gameLoop() {

    drawMap();

    updateEnemy();
    updateTowers();
    updateBullets();

    drawTowers();
    drawEnemy();
    drawBullets();

    requestAnimationFrame(gameLoop);
}

gameLoop();

