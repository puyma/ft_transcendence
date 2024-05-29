const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

// const scaleFactor = window.devicePixelRatio || 1;
// canvas.width = window.innerWidth * scaleFactor;
// canvas.height = window.innerHeight * scaleFactor;
// canvas.style.width = window.innerWidth + 'px';
// canvas.style.height = window.innerHeight + 'px';
// ctx.scale(scaleFactor, scaleFactor);

const user = {
    x: 0,
    y: canvas.height / 2 - 100 / 2,
    width: 10,
    height: 100,
    color: "RED",
    score: 0
}

const com = {
    x: canvas.width - 10,
    y: canvas.height / 2 - 100 / 2,
    width: 10,
    height: 100,
    color: "RED",
    score: 0
}

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 5,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
    color: "WHITE"
}

const net = {
    x: canvas.width / 2 - 1,
    y: 0,
    width: 2,
    height: 10,
    color: "WHITE"
}

function drawRectangle(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "70px Arial";
    ctx.fillText(text, x, y);
}

function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRectangle(net.x, net.y + i, net.width, net.height, net.color);
    }
}

function render() {
    drawRectangle(0, 0, canvas.width, canvas.height, "BLACK");
    drawNet();
    drawText(user.score, canvas.width / 4, canvas.height / 5, "WHITE");
    drawText(com.score, 3 * canvas.width / 4, canvas.height / 5, "WHITE");
    drawRectangle(user.x, user.y, user.width, user.height, user.color);
    drawRectangle(com.x, com.y, com.width, com.height, com.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// canvas.addEventListener("mousemove", move);
// function move(evt) {
//     let rect = canvas.getBoundingClientRect();
//     user.y = evt.clientY - rect.top - user.height / 2;
// }

canvas.setAttribute('tabindex', 0);
canvas.focus();
canvas.addEventListener("keydown", move);

// i changed the funciton limiting in the canvas the key up and down

function move(evt) {
    if (evt.key == "w") {
        if (user.y > 0) {
            user.y -= 10;
        }
    } else if (evt.key == "s") {
        if (user.y + user.height < canvas.height) {
            user.y += 10;
        }
    }
}
// function move(evt) {
//     if (evt.key == "w") {
//         let rect = canvas.getBoundingClientRect();
//         user.y -= 10;
//     } else if (evt.key == "s") {
//         let rect = canvas.getBoundingClientRect();
//         user.y += 10;
//     }
// }

function collision(b, p) {
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;
    return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.velocityX = -ball.velocityX;
}

//probando
// let reactionTime = 0;
// let lastUpdateTime = 0;
// const errorMargin = 20;

function update() {
    if (ball.x - ball.radius < 0) {
        com.score++;
        if (com.score == 11 || user.score == 11)
            window.location.href = "game_over.html";
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        if (com.score == 11 || user.score == 11)
            window.location.href = "game_over.html";
        resetBall();
    }
    
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    //IA
    let comLevel = 0.1;
    com.y += (ball.y - (com.y + com.height / 2)) * comLevel;

    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
    }

    //probando
    // const currentTime = Date.now();
    // if (currentTime - lastUpdateTime > reactionTime) {
    //     reactionTime = Math.random() * 200 + 100; // Retardo aleatorio entre 100ms y 300ms
    //     lastUpdateTime = currentTime;
        
    //     // Movimiento de la IA con imprecisión
    //     if (ball.y + ball.radius < com.y + com.height / 2 - errorMargin) {
    //         com.y -= com.y;
    //     } else if (ball.y - ball.radius > com.y + com.height / 2 + errorMargin) {
    //         com.y += com.y;
    //     }
    // }

    // if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    //     ball.velocityY = -ball.velocityY;
    // }
    

    let player = (ball.x < canvas.width / 2) ? user : com;
    if (collision(ball, player)) {

        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);

        let angleRad = collidePoint * Math.PI / 4;
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;

        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        ball.speed += 0.1;

    }
}

function game() {
    update();
    render();
}

const framePerSecond = 50;
setInterval(game, 1000 / framePerSecond);