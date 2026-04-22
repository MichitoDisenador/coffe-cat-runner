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

// Posición del suelo (línea amarilla)
const GROUND_Y = 260; // Y donde está la línea (base del piso)

// Gato: usamos baseY (sus patas tocan GROUND_Y)
const cat = {
    x: 70,
    baseY: GROUND_Y,
    width: 38,
    height: 38,
    velocity: 0,
    gravity: 0.8,
    jumpPower: -10,
    isJumping: false
};
// La variable y es la esquina superior (se calcula)
cat.y = cat.baseY - cat.height;

// Taza: también base en GROUND_Y
let obstacle = {
    x: canvas.width,
    baseY: GROUND_Y,
    width: 30,
    height: 38,
    active: true
};
obstacle.y = obstacle.baseY - obstacle.height;

let frameCounter = 0;
let spawnGap = 85;

function drawCat() {
    ctx.save();
    ctx.fillStyle = ACCENT_COLOR;
    // Cuerpo
    ctx.beginPath();
    ctx.ellipse(cat.x + cat.width/2, cat.y + cat.height/2 - 2, cat.width/2, cat.height/2.3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Orejas izquierda
    ctx.beginPath();
    ctx.moveTo(cat.x + 5, cat.y + 4);
    ctx.lineTo(cat.x + 2, cat.y - 10);
    ctx.lineTo(cat.x + 16, cat.y + 2);
    ctx.fill();
    // Orejas derecha
    ctx.beginPath();
    ctx.moveTo(cat.x + cat.width - 5, cat.y + 4);
    ctx.lineTo(cat.x + cat.width - 2, cat.y - 10);
    ctx.lineTo(cat.x + cat.width - 16, cat.y + 2);
    ctx.fill();
    // Ojos blancos
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cat.x + 11, cat.y + 16, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cat.x + 27, cat.y + 16, 6, 0, Math.PI * 2);
    ctx.fill();
    // Pupilas
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cat.x + 10, cat.y + 15, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cat.x + 26, cat.y + 15, 3, 0, Math.PI * 2);
    ctx.fill();
    // Reflejos
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cat.x + 8, cat.y + 13, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cat.x + 24, cat.y + 13, 1.2, 0, Math.PI * 2);
    ctx.fill();
    // Gafas
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cat.x + 11, cat.y + 16, 7.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cat.x + 27, cat.y + 16, 7.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cat.x + 18.5, cat.y + 15);
    ctx.lineTo(cat.x + 19.5, cat.y + 15);
    ctx.stroke();
    // Nariz
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(cat.x + 19, cat.y + 23);
    ctx.lineTo(cat.x + 17, cat.y + 26);
    ctx.lineTo(cat.x + 21, cat.y + 26);
    ctx.fill();
    // Bigotes
    ctx.beginPath();
    ctx.moveTo(cat.x + 5, cat.y + 22);
    ctx.lineTo(cat.x + 12, cat.y + 24);
    ctx.moveTo(cat.x + 4, cat.y + 26);
    ctx.lineTo(cat.x + 12, cat.y + 26);
    ctx.moveTo(cat.x + 5, cat.y + 30);
    ctx.lineTo(cat.x + 12, cat.y + 28);
    ctx.moveTo(cat.x + 33, cat.y + 22);
    ctx.lineTo(cat.x + 26, cat.y + 24);
    ctx.moveTo(cat.x + 34, cat.y + 26);
    ctx.lineTo(cat.x + 26, cat.y + 26);
    ctx.moveTo(cat.x + 33, cat.y + 30);
    ctx.lineTo(cat.x + 26, cat.y + 28);
    ctx.stroke();
    ctx.restore();
}

function drawCoffee() {
    ctx.fillStyle = ACCENT_COLOR;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height - 8);
    ctx.beginPath();
    ctx.ellipse(obstacle.x + obstacle.width + 5, obstacle.y + 12, 6, 9, 0, 0, Math.PI * 2);
    ctx.strokeStyle = ACCENT_COLOR;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(obstacle.x + 8, obstacle.y - 4);
    ctx.lineTo(obstacle.x + 12, obstacle.y - 12);
    ctx.lineTo(obstacle.x + 16, obstacle.y - 4);
    ctx.fill();
}

function drawLogo() {
    ctx.font = 'bold 20px "Montserrat"';
    ctx.fillStyle = ACCENT_COLOR;
    ctx.fillText("🐱", 12, 38);
    ctx.font = 'bold 11px "Montserrat"';
    ctx.fillStyle = "#ffd333cc";
    ctx.fillText("Bunta", 38, 35);
}

function updateCat() {
    cat.velocity += cat.gravity;
    cat.y += cat.velocity;
    // Convertimos y a baseY
    let newBaseY = cat.y + cat.height;
    if (newBaseY >= GROUND_Y) {
        newBaseY = GROUND_Y;
        cat.y = newBaseY - cat.height;
        cat.isJumping = false;
        cat.velocity = 0;
    } else if (cat.y < 0) {
        cat.y = 0;
        if (cat.velocity < 0) cat.velocity = 0;
    }
}

function jump() {
    if (!gameRunning) {
        resetGame();
        return;
    }
    if (!cat.isJumping && cat.y + cat.height >= GROUND_Y - 1) {
        cat.velocity = cat.jumpPower;
        cat.isJumping = true;
    }
}

function updateObstacle() {
    if (!obstacle.active) return;
    obstacle.x -= 5;
    if (obstacle.x + obstacle.width < 0) {
        obstacle.active = false;
        score++;
        document.getElementById('score').innerText = score;
        if (score > 10) spawnGap = 70;
        if (score > 20) spawnGap = 60;
        if (score > 35) spawnGap = 50;
    }
    // Colisión usando rectángulos (base y altura)
    if (obstacle.active &&
        cat.x < obstacle.x + obstacle.width - 4 &&
        cat.x + cat.width - 4 > obstacle.x &&
        cat.y + cat.height - 6 > obstacle.y &&
        cat.y + 12 < obstacle.y + obstacle.height) {
        gameRunning = false;
    }
}

function spawnObstacle() {
    if (!obstacle.active && gameRunning) {
        obstacle = {
            x: canvas.width,
            baseY: GROUND_Y,
            width: 30,
            height: 38,
            active: true
        };
        obstacle.y = obstacle.baseY - obstacle.height;
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
    cat.y = GROUND_Y - cat.height;
    cat.velocity = 0;
    cat.isJumping = false;
    obstacle.active = false;
    frameCounter = spawnGap;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Dibujar suelo (línea amarilla en GROUND_Y)
    ctx.fillStyle = ACCENT_COLOR;
    ctx.fillRect(0, GROUND_Y, canvas.width, 3);
    if (gameRunning) {
        updateCat();
        updateObstacle();
        frameCounter++;
        if (frameCounter >= spawnGap && !obstacle.active) {
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
    if (obstacle.active) drawCoffee();
    drawLogo();
    requestAnimationFrame(animate);
}

// Eventos
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

document.getElementById('highScore').innerText = highScore;
setTimeout(() => {
    if (!obstacle.active && gameRunning) {
        frameCounter = 40;
    }
}, 500);
animate();    ctx.moveTo(cat.x + 19, cat.y + 15);
    ctx.lineTo(cat.x + 19, cat.y + 17);
    ctx.stroke();
    
    // Nariz y bigotes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cat.x + 19, cat.y + 23, 2.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(cat.x + 7, cat.y + 20);
    ctx.lineTo(cat.x + 13, cat.y + 22);
    ctx.moveTo(cat.x + 7, cat.y + 24);
    ctx.lineTo(cat.x + 13, cat.y + 24);
    ctx.moveTo(cat.x + 25, cat.y + 22);
    ctx.lineTo(cat.x + 31, cat.y + 20);
    ctx.moveTo(cat.x + 25, cat.y + 24);
    ctx.lineTo(cat.x + 31, cat.y + 24);
    ctx.stroke();
    
    ctx.restore();
}

function drawCoffee() {
    ctx.fillStyle = ACCENT_COLOR;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height - 8);
    
    ctx.beginPath();
    ctx.ellipse(obstacle.x + obstacle.width + 5, obstacle.y + 12, 6, 9, 0, 0, Math.PI * 2);
    ctx.strokeStyle = ACCENT_COLOR;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(obstacle.x + 8, obstacle.y - 4);
    ctx.lineTo(obstacle.x + 12, obstacle.y - 12);
    ctx.lineTo(obstacle.x + 16, obstacle.y - 4);
    ctx.fill();
}

function drawLogo() {
    ctx.font = 'bold 20px "Montserrat"';
    ctx.fillStyle = ACCENT_COLOR;
    ctx.fillText("🐱", 12, 38);
    ctx.font = 'bold 11px "Montserrat"';
    ctx.fillStyle = "#ffd333cc";
    ctx.fillText("Bunta", 38, 35);
}

function updateCat() {
    cat.velocity += cat.gravity;
    cat.y += cat.velocity;
    
    if (cat.y >= cat.groundY) {
        cat.y = cat.groundY;
        cat.isJumping = false;
        cat.velocity = 0;
    }
    
    if (cat.y < 0) {
        cat.y = 0;
        if (cat.velocity < 0) cat.velocity = 0;
    }
}

function jump() {
    if (!gameRunning) {
        resetGame();
        return;
    }
    
    if (!cat.isJumping) {
        cat.velocity = cat.jumpPower;
        cat.isJumping = true;
    }
}

function updateObstacle() {
    if (!obstacle.active) return;
    
    obstacle.x -= 5;
    
    if (obstacle.x + obstacle.width < 0) {
        obstacle.active = false;
        score++;
        document.getElementById('score').innerText = score;
        
        if (score > 10) spawnGap = 70;
        if (score > 20) spawnGap = 60;
        if (score > 35) spawnGap = 50;
    }
    
    if (obstacle.active &&
        cat.x < obstacle.x + obstacle.width - 4 &&
        cat.x + cat.width - 4 > obstacle.x &&
        cat.y + cat.height - 6 > obstacle.y &&
        cat.y + 12 < obstacle.y + obstacle.height) {
        gameRunning = false;
    }
}

function spawnObstacle() {
    if (!obstacle.active && gameRunning) {
        obstacle = {
            x: canvas.width,
            y: 258,
            width: 30,
            height: 35,
            active: true
        };
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
    
    cat.y = cat.groundY;
    cat.velocity = 0;
    cat.isJumping = false;
    obstacle.active = false;
    frameCounter = spawnGap;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Suelo
    ctx.fillStyle = ACCENT_COLOR;
    ctx.fillRect(0, canvas.height - 42, canvas.width, 3);
    
    if (gameRunning) {
        updateCat();
        updateObstacle();
        
        frameCounter++;
        if (frameCounter >= spawnGap && !obstacle.active) {
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
    if (obstacle.active) drawCoffee();
    drawLogo();
    
    requestAnimationFrame(animate);
}

// Eventos
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

document.getElementById('highScore').innerText = highScore;
setTimeout(() => {
    if (!obstacle.active && gameRunning) {
        frameCounter = 40;
    }
}, 500);

animate();
