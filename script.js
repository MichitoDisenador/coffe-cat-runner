const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const maxWidth = Math.min(800, window.innerWidth - 40);
    canvas.style.width = `${maxWidth}px`;
    canvas.style.height = 'auto';
    canvas.width = 800;
    canvas.height = 300;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const BG_COLOR = '#2c2e30';
const ACCENT_COLOR = '#ffd333';

let gameRunning = true;
let score = 0;
let highScore = localStorage.getItem('catHighScore') || 0;
document.getElementById('highScore').innerText = highScore;

const GROUND_Y = 260;
const CAT_WIDTH = 38;
const CAT_HEIGHT = 38;
const CAT_X = 70;
const OBSTACLE_WIDTH = 30;
const OBSTACLE_HEIGHT = 38;

let catY = GROUND_Y - CAT_HEIGHT;
let catVelocity = 0;
let catIsJumping = false;

let obstacleX = canvas.width;
let obstacleActive = false;

let frameCounter = 0;
let spawnGap = 85;

function drawCat() {
    ctx.save();
    ctx.fillStyle = ACCENT_COLOR;

    ctx.beginPath();
    ctx.ellipse(CAT_X + CAT_WIDTH/2, catY + CAT_HEIGHT/2 - 2, CAT_WIDTH/2, CAT_HEIGHT/2.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(CAT_X + 5, catY + 4);
    ctx.lineTo(CAT_X + 2, catY - 10);
    ctx.lineTo(CAT_X + 16, catY + 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(CAT_X + CAT_WIDTH - 5, catY + 4);
    ctx.lineTo(CAT_X + CAT_WIDTH - 2, catY - 10);
    ctx.lineTo(CAT_X + CAT_WIDTH - 16, catY + 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(CAT_X + 11, catY + 16, 6, 0, Math.PI * 2);
    ctx.arc(CAT_X + 27, catY + 16, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(CAT_X + 10, catY + 15, 3, 0, Math.PI * 2);
    ctx.arc(CAT_X + 26, catY + 15, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(CAT_X + 8, catY + 13, 1.2, 0, Math.PI * 2);
    ctx.arc(CAT_X + 24, catY + 13, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(CAT_X + 11, catY + 16, 7.5, 0, Math.PI * 2);
    ctx.arc(CAT_X + 27, catY + 16, 7.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CAT_X + 18.5, catY + 15);
    ctx.lineTo(CAT_X + 19.5, catY + 15);
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(CAT_X + 19, catY + 23);
    ctx.lineTo(CAT_X + 17, catY + 26);
    ctx.lineTo(CAT_X + 21, catY + 26);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(CAT_X + 5, catY + 22);
    ctx.lineTo(CAT_X + 12, catY + 24);
    ctx.moveTo(CAT_X + 4, catY + 26);
    ctx.lineTo(CAT_X + 12, catY + 26);
    ctx.moveTo(CAT_X + 5, catY + 30);
    ctx.lineTo(CAT_X + 12, catY + 28);
    ctx.moveTo(CAT_X + 33, catY + 22);
    ctx.lineTo(CAT_X + 26, catY + 24);
    ctx.moveTo(CAT_X + 34, catY + 26);
    ctx.lineTo(CAT_X + 26, catY + 26);
    ctx.moveTo(CAT_X + 33, catY + 30);
    ctx.lineTo(CAT_X + 26, catY + 28);
    ctx.stroke();

    ctx.restore();
}

function drawObstacle() {
    ctx.fillStyle = ACCENT_COLOR;
    ctx.fillRect(obstacleX, GROUND_Y - OBSTACLE_HEIGHT, OBSTACLE_WIDTH, OBSTACLE_HEIGHT - 8);
    ctx.beginPath();
    ctx.ellipse(obstacleX + OBSTACLE_WIDTH + 5, GROUND_Y - OBSTACLE_HEIGHT + 12, 6, 9, 0, 0, Math.PI * 2);
    ctx.strokeStyle = ACCENT_COLOR;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(obstacleX + 8, GROUND_Y - OBSTACLE_HEIGHT - 4);
    ctx.lineTo(obstacleX + 12, GROUND_Y - OBSTACLE_HEIGHT - 12);
    ctx.lineTo(obstacleX + 16, GROUND_Y - OBSTACLE_HEIGHT - 4);
    ctx.fill();
}

function drawGround() {
    ctx.fillStyle = ACCENT_COLOR;
    ctx.fillRect(0, GROUND_Y, canvas.width, 3);
}

function drawLogo() {
    // Emoji + Bunta en la esquina superior izquierda del canvas
    ctx.font = 'bold 20px "Montserrat"';
    ctx.fillStyle = ACCENT_COLOR;
    ctx.fillText("🐱", 12, 38);
    ctx.font = 'bold 14px "Montserrat"';
    ctx.fillStyle = ACCENT_COLOR;
    ctx.fillText("Bunta", 55, 32);
}

function updateCat() {
    catVelocity += 0.8;
    catY += catVelocity;

    if (catY + CAT_HEIGHT >= GROUND_Y) {
        catY = GROUND_Y - CAT_HEIGHT;
        catVelocity = 0;
        catIsJumping = false;
    }
    if (catY < 0) {
        catY = 0;
        if (catVelocity < 0) catVelocity = 0;
    }
}

function jump() {
    if (!gameRunning) {
        resetGame();
        return;
    }
    if (!catIsJumping && catY + CAT_HEIGHT >= GROUND_Y - 1) {
        catVelocity = -10;
        catIsJumping = true;
    }
}

function updateObstacle() {
    if (!obstacleActive) return;

    obstacleX -= 5;

    if (obstacleX + OBSTACLE_WIDTH < 0) {
        obstacleActive = false;
        score++;
        document.getElementById('score').innerText = score;
        if (score > 10) spawnGap = 70;
        if (score > 20) spawnGap = 60;
        if (score > 35) spawnGap = 50;
    }

    if (obstacleActive &&
        CAT_X < obstacleX + OBSTACLE_WIDTH - 4 &&
        CAT_X + CAT_WIDTH - 4 > obstacleX &&
        catY + CAT_HEIGHT - 6 > GROUND_Y - OBSTACLE_HEIGHT &&
        catY + 12 < GROUND_Y - OBSTACLE_HEIGHT + OBSTACLE_HEIGHT) {
        gameRunning = false;
    }
}

function spawnObstacle() {
    if (!obstacleActive && gameRunning) {
        obstacleX = canvas.width;
        obstacleActive = true;
        frameCounter = 0;
    }
}

function resetGame() {
    gameRunning = true;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('catHighScore', highScore);
        document.getElementById('highScore').innerText = highScore;
    }
    score = 0;
    document.getElementById('score').innerText = score;
    catY = GROUND_Y - CAT_HEIGHT;
    catVelocity = 0;
    catIsJumping = false;
    obstacleActive = false;
    frameCounter = 0;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGround();

    if (gameRunning) {
        updateCat();
        updateObstacle();
        frameCounter++;
        if (frameCounter >= spawnGap && !obstacleActive) {
            spawnObstacle();
            frameCounter = 0;
        }
    } else {
        ctx.fillStyle = ACCENT_COLOR;
        ctx.font = 'bold 24px "Montserrat"';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 30);
        ctx.font = '12px "Montserrat"';
        ctx.fillStyle = '#ffd333cc';
        ctx.fillText('Tap / Espacio para reiniciar', canvas.width/2, canvas.height/2 + 20);
        ctx.textAlign = 'left';
    }

    drawCat();
    if (obstacleActive) drawObstacle();
    drawLogo();

    requestAnimationFrame(animate);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
    }
});
canvas.addEventListener('click', (e) => {
    e.preventDefault();
    jump();
});
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

animate();
