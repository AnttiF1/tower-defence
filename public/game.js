const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let lives = 10;
let money = 100;
let wave = 1;

const enemy = {
    x: 0,
    y: 250,
    speed: 1.5,
    size: 20,
    health: 100
};

function drawMap() {
    ctx.fillStyle = "#4a8f45";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vihollisen reitti
    ctx.fillStyle = "#c2a36b";
    ctx.fillRect(0, 220, 800, 60);

    // Tukikohta
    ctx.fillStyle = "#444";
    ctx.fillRect(740, 190, 60, 120);

    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("TUKIKOHTA", 735, 180);
}

function drawEnemy() {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();

    // Elämäpalkki
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

function updateEnemy() {
    enemy.x += enemy.speed;

    // Vihollinen saavuttaa tukikohdan
    if (enemy.x > canvas.width) {
        lives--;
        enemy.x = 0;

        document.getElementById("lives").textContent = lives;

        if (lives <= 0) {
            alert("Peli loppui!");
            lives = 10;
        }
    }
}

function gameLoop() {
    drawMap();
    updateEnemy();
    drawEnemy();

    requestAnimationFrame(gameLoop);
}

gameLoop();
