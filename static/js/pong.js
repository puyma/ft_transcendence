document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    //sessionStorage para guardar el modo de juego
    const modoJuego = sessionStorage.getItem('modoJuego');
    const soloPlay = modoJuego === 'solo';

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Scale factor for making the game elements larger
    const scaleFactor = 1.5;

    const user = {
        x: 0,
        y: canvas.height / 2 / window.devicePixelRatio - (100 * scaleFactor) / 2,
        width: 10 * scaleFactor,
        height: 100 * scaleFactor,
        color: "RED",
        score: 0
    };

    const com = {
        x: canvas.width / window.devicePixelRatio - (10 * scaleFactor),
        y: canvas.height / 2 / window.devicePixelRatio - (100 * scaleFactor) / 2,
        width: 10 * scaleFactor,
        height: 100 * scaleFactor,
        color: "RED",
        score: 0
    };

    const ball = {
        x: canvas.width / 2 / window.devicePixelRatio,
        y: canvas.height / 2 / window.devicePixelRatio,
        radius: 5 * scaleFactor,
        speed: 7,
        velocityX: 7,
        velocityY: 7,
        color: "WHITE"
    };

    const net = {
        x: canvas.width / 2 / window.devicePixelRatio - 1,
        y: 0,
        width: 2 * scaleFactor,
        height: 10 * scaleFactor,
        color: "WHITE"
    };

    function drawRectangle(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }

    function drawCircle(x, y, r, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    }

    function drawText(text, x, y, color) {
        ctx.fillStyle = color;
        ctx.font = `${70 * scaleFactor}px Arial`;
        ctx.fillText(text, x, y);
    }

    function drawNet() {
        for (let i = 0; i <= canvas.height / window.devicePixelRatio; i += 15 * scaleFactor) {
            drawRectangle(net.x, net.y + i, net.width, net.height, net.color);
        }
    }

    function render() {
        drawRectangle(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio, "BLACK");
        drawNet();
        drawText(user.score, canvas.width / 4 / window.devicePixelRatio, canvas.height / 5 / window.devicePixelRatio, "WHITE");
        drawText(com.score, 3 * canvas.width / 4 / window.devicePixelRatio, canvas.height / 5 / window.devicePixelRatio, "WHITE");
        drawRectangle(user.x, user.y, user.width, user.height, user.color);
        drawRectangle(com.x, com.y, com.width, com.height, com.color);
        drawCircle(ball.x, ball.y, ball.radius, ball.color);
    }

    canvas.setAttribute('tabindex', 0);
    canvas.focus();
    canvas.addEventListener("keydown", move);

    function move(evt) {
        const paddleSpeed = 40; // Increased paddle speed
    
        if (evt.key === "w") {
            if (user.y > 0) {
                user.y -= paddleSpeed;
            }
        } else if (evt.key === "s") {
            if (user.y + user.height < canvas.height / window.devicePixelRatio) {
                user.y += paddleSpeed;
            }
        }
        if (!soloPlay) {
            if (evt.key === "ArrowUp") {
                if (com.y > 0) {
                    com.y -= paddleSpeed;
                }
            } else if (evt.key === "ArrowDown") {
                if (com.y + com.height < canvas.height / window.devicePixelRatio) {
                    com.y += paddleSpeed;
                }
            }
        }
    }

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
        ball.x = canvas.width / 2 / window.devicePixelRatio;
        ball.y = canvas.height / 2 / window.devicePixelRatio;
        ball.speed = ball.velocityX = ball.velocityY = 7;
    }

    let comLevel = 0.7;
    let lastUpdate = Date.now();
    let updateInterval = 16;

    function updateComPaddle() {
        let now = Date.now();
        if (now - lastUpdate > updateInterval) {
            lastUpdate = now;

            // delay
            let targetY = ball.y - (com.y + com.height / 2);
            
            if (Math.abs(targetY) > 10) {
                if (targetY > 0) {
                    com.y += comLevel * Math.min(10, Math.abs(targetY));
                } else {
                    com.y -= comLevel * Math.min(10, Math.abs(targetY));
                }
            }
            
            // limits
            if (com.y < 0) {
                com.y = 0;
            } else if (com.y + com.height > canvas.height / window.devicePixelRatio) {
                com.y = (canvas.height / window.devicePixelRatio) - com.height;
            }
        }
    }

    function update() {
        if (ball.x - ball.radius < 0) {
            com.score++;
            // if (com.score === 11 || user.score === 11) {
            //     window.location.href = "game_over.html";
            // }
            resetBall();
        } else if (ball.x + ball.radius > canvas.width / window.devicePixelRatio) {
            user.score++;
            // if (user.score === 11 || com.score === 11) {
            //     window.location.href = "game_over.html";
            // }
            resetBall();
        }

        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        //update soloPlay
        if (soloPlay) {
            updateComPaddle();
        }

        if (ball.y + ball.radius > canvas.height / window.devicePixelRatio || ball.y - ball.radius < 0) {
            ball.velocityY = -ball.velocityY;
        }

        let player = (ball.x < canvas.width / 2 / window.devicePixelRatio) ? user : com;
        if (collision(ball, player)) {
            let collidePoint = ball.y - (player.y + player.height / 2);
            collidePoint = collidePoint / (player.height / 2);

            let angleRad = collidePoint * Math.PI / 4;
            let direction = (ball.x < canvas.width / 2 / window.devicePixelRatio) ? 1 : -1;

            ball.velocityX = direction * ball.speed * Math.cos(angleRad);
            ball.velocityY = ball.speed * Math.sin(angleRad);

            ball.speed += 0.5;
        }
    }

    function game() {
        update();
        render();
    }

    const framePerSecond = 50;
    setInterval(game, 1000 / framePerSecond);
});