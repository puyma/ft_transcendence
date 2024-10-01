
// const canvas = document.getElementById('canvas');
// if (!canvas) {
//     console.error("Canvas element not found!");
// }
// const ctx = canvas.getContext('2d');
// if (!ctx) {
//     console.error("Canvas context not found!");
// }

// //sessionStorage para guardar el modo de juego
// const modoJuego = sessionStorage.getItem('modoJuego');
// const soloPlay = modoJuego === 'solo';

// function resizeCanvas() {
//     const dpr = window.devicePixelRatio || 1;
//     canvas.width = window.innerWidth * dpr;
//     canvas.height = window.innerHeight * dpr;
//     ctx.scale(dpr, dpr);
// }

// window.addEventListener('resize', resizeCanvas);
// resizeCanvas(); 

// // Scale factor for making the game elements larger
// const scaleFactor = 1.5;

// const user = {
//     x: 0,
//     y: canvas.height / 2 / window.devicePixelRatio - (100 * scaleFactor) / 2,
//     width: 10 * scaleFactor,
//     height: 100 * scaleFactor,
//     color: "RED",
//     score: 0
// };

// const com = {
//     x: canvas.width / window.devicePixelRatio - (10 * scaleFactor),
//     y: canvas.height / 2 / window.devicePixelRatio - (100 * scaleFactor) / 2,
//     width: 10 * scaleFactor,
//     height: 100 * scaleFactor,
//     color: "RED",
//     score: 0
// };

// const ball = {
//     x: canvas.width / 2 / window.devicePixelRatio,
//     y: canvas.height / 2 / window.devicePixelRatio,
//     radius: 5 * scaleFactor,
//     speed: 7,
//     velocityX: 7,
//     velocityY: 7,
//     color: "WHITE"
// };

// const net = {
//     x: canvas.width / 2 / window.devicePixelRatio - 1,
//     y: 0,
//     width: 2 * scaleFactor,
//     height: 10 * scaleFactor,
//     color: "WHITE"
// };

// function drawRectangle(x, y, w, h, color) {
//     ctx.fillStyle = color;
//     ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
// }

// function drawCircle(x, y, r, color) {
//     ctx.fillStyle = color;
//     ctx.beginPath();
//     ctx.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2, false);
//     ctx.closePath();
//     ctx.fill();
// }

// function drawText(text, x, y, color) {
//     ctx.fillStyle = color;
//     ctx.font = `${70 * scaleFactor}px Arial`;
//     ctx.fillText(text, x, y);
// }

// function drawNet() {
//     for (let i = 0; i <= canvas.height / window.devicePixelRatio; i += 15 * scaleFactor) {
//         drawRectangle(net.x, net.y + i, net.width, net.height, net.color);
//     }
// }

// function render() {
//     drawRectangle(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio, "BLACK");
//     drawNet();
//     drawText(user.score, canvas.width / 4 / window.devicePixelRatio, canvas.height / 5 / window.devicePixelRatio, "WHITE");
//     drawText(com.score, 3 * canvas.width / 4 / window.devicePixelRatio, canvas.height / 5 / window.devicePixelRatio, "WHITE");
//     drawRectangle(user.x, user.y, user.width, user.height, user.color);
//     drawRectangle(com.x, com.y, com.width, com.height, com.color);
//     drawCircle(ball.x, ball.y, ball.radius, ball.color);
// }

// canvas.setAttribute('tabindex', 0);
// canvas.focus();
// canvas.addEventListener("keydown", move);

// function move(evt) {
//     const paddleSpeed = 40; // Increased paddle speed

//     if (evt.key === "w") {
//         if (user.y > 0) {
//             user.y -= paddleSpeed;
//         }
//     } else if (evt.key === "s") {
//         if (user.y + user.height < canvas.height / window.devicePixelRatio) {
//             user.y += paddleSpeed;
//         }
//     }
//     if (!soloPlay) {
//         if (evt.key === "ArrowUp") {
//             if (com.y > 0) {
//                 com.y -= paddleSpeed;
//             }
//         } else if (evt.key === "ArrowDown") {
//             if (com.y + com.height < canvas.height / window.devicePixelRatio) {
//                 com.y += paddleSpeed;
//             }
//         }
//     }
// }

// function collision(b, p) {
//     b.top = b.y - b.radius;
//     b.bottom = b.y + b.radius;
//     b.left = b.x - b.radius;
//     b.right = b.x + b.radius;

//     p.top = p.y;
//     p.bottom = p.y + p.height;
//     p.left = p.x;
//     p.right = p.x + p.width;
//     return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
// }

// function resetBall() {
//     ball.x = canvas.width / 2 / window.devicePixelRatio;
//     ball.y = canvas.height / 2 / window.devicePixelRatio;
//     ball.speed = ball.velocityX = ball.velocityY = 7;
// }

// let comLevel = 0.7;
// let lastUpdate = Date.now();
// let updateInterval = 16;

// function updateComPaddle() {
//     let now = Date.now();
//     if (now - lastUpdate > updateInterval) {
//         lastUpdate = now;

//         // delay
//         let targetY = ball.y - (com.y + com.height / 2);
        
//         if (Math.abs(targetY) > 10) {
//             if (targetY > 0) {
//                 com.y += comLevel * Math.min(10, Math.abs(targetY));
//             } else {
//                 com.y -= comLevel * Math.min(10, Math.abs(targetY));
//             }
//         }
        
//         // limits
//         if (com.y < 0) {
//             com.y = 0;
//         } else if (com.y + com.height > canvas.height / window.devicePixelRatio) {
//             com.y = (canvas.height / window.devicePixelRatio) - com.height;
//         }
//     }
// }

// function update() {
//     if (ball.x - ball.radius < 0) {
//         com.score++;
//         // if (com.score === 11 || user.score === 11) {
//         //     window.location.href = "game_over.html";
//         // }
//         resetBall();
//     } else if (ball.x + ball.radius > canvas.width / window.devicePixelRatio) {
//         user.score++;
//         // if (user.score === 11 || com.score === 11) {
//         //     window.location.href = "game_over.html";
//         // }
//         resetBall();
//     }

//     ball.x += ball.velocityX;
//     ball.y += ball.velocityY;

//     //update soloPlay
//     if (soloPlay) {
//         updateComPaddle();
//     }

//     if (ball.y + ball.radius > canvas.height / window.devicePixelRatio || ball.y - ball.radius < 0) {
//         ball.velocityY = -ball.velocityY;
//     }

//     let player = (ball.x < canvas.width / 2 / window.devicePixelRatio) ? user : com;
//     if (collision(ball, player)) {
//         let collidePoint = ball.y - (player.y + player.height / 2);
//         collidePoint = collidePoint / (player.height / 2);

//         let angleRad = collidePoint * Math.PI / 4;
//         let direction = (ball.x < canvas.width / 2 / window.devicePixelRatio) ? 1 : -1;

//         ball.velocityX = direction * ball.speed * Math.cos(angleRad);
//         ball.velocityY = ball.speed * Math.sin(angleRad);

//         ball.speed += 0.5;
//     }
// }

// function game() {
//     update();
//     render();
//     requestAnimationFrame(game);
// }

// // const framePerSecond = 50;
// // setInterval(game, 1000 / framePerSecond);

// export {game};

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        this.dpr = window.devicePixelRatio || 1;
        this.modoJuego = sessionStorage.getItem('modoJuego');
        this.soloPlay = this.modoJuego === 'solo';
        this.scaleFactor = 1.5;
        this.user = this.createPaddle(0, this.canvas.height / 2 / this.dpr - 50 * this.scaleFactor, "RED");
        this.com = this.createPaddle(this.canvas.width / this.dpr - 10 * this.scaleFactor, this.canvas.height / 2 / this.dpr - 50 * this.scaleFactor, "RED");
        this.ball = this.createBall(this.canvas.width / 2 / this.dpr, this.canvas.height / 2 / this.dpr, "WHITE");

        this.net = {
            x: this.canvas.width / 2 / this.dpr - 1,
            y: 0,
            width: 2 * this.scaleFactor,
            height: 10 * this.scaleFactor,
            color: "WHITE"
        };

        this.comLevel = 0.7;
        this.lastUpdate = Date.now();
        this.updateInterval = 16;
        this.init();
    }

    createPaddle(x, y, color) {
        return {
            x: x,
            y: y,
            width: 10 * this.scaleFactor,
            height: 100 * this.scaleFactor,
            color: color,
            score: 0
        };
    }

    createBall(x, y, color) {
        return {
            x: x,
            y: y,
            radius: 5 * this.scaleFactor,
            speed: 7,
            velocityX: 7,
            velocityY: 7,
            color: color
        };
    }

    init() {
        document.getElementsByTagName( 'header' )?.[0].setAttribute( "style", "display:none;" );
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.user.y = this.canvas.height / 2 / this.dpr - this.user.height / 2;
        this.com.x = this.canvas.width / this.dpr - this.com.width;
        this.com.y = this.canvas.height / 2 / this.dpr - this.com.height / 2;
        this.ball.x = this.canvas.width / 2 / this.dpr;
        this.ball.y = this.canvas.height / 2 / this.dpr;
        this.canvas.setAttribute('tabindex', 0);
        this.canvas.focus();
        this.canvas.addEventListener("keydown", (evt) => this.move(evt));

        this.gameLoop();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth * this.dpr;
        this.canvas.height = window.innerHeight * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
    }

    drawRectangle(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }

    drawCircle(x, y, r, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2, false);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawText(text, x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.font = `${70 * this.scaleFactor}px Arial`;
        this.ctx.fillText(text, x, y);
    }

    drawNet() {
        const canvasWidth = this.canvas.width / this.dpr;
        const canvasHeight = this.canvas.height / this.dpr;
        //check centro
        const netX = canvasWidth / 2 - this.net.width / 2; 
        // console.log("w: ", canvasWidth, "h: ", canvasHeight);
        for (let i = 0; i <= canvasHeight; i += 15 * this.scaleFactor) {
            this.drawRectangle(netX, this.net.y + i, this.net.width, this.net.height, this.net.color);
        }
    }

    render() {
        this.drawRectangle(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr, "BLACK");
        this.drawNet();
        this.drawText(this.user.score, this.canvas.width / 4 / this.dpr, this.canvas.height / 5 / this.dpr, "WHITE");
        this.drawText(this.com.score, 3 * this.canvas.width / 4 / this.dpr, this.canvas.height / 5 / this.dpr, "WHITE");
        this.drawRectangle(this.user.x, this.user.y, this.user.width, this.user.height, this.user.color);
        this.drawRectangle(this.com.x, this.com.y, this.com.width, this.com.height, this.com.color);
        this.drawCircle(this.ball.x, this.ball.y, this.ball.radius, this.ball.color);
    }

    move(evt) {
        const paddleSpeed = 40;
        const canvasHeight = this.canvas.height / this.dpr;
    
        // Movimiento del usuario
        if (evt.key === "w") {
            this.user.y = Math.max(this.user.y - paddleSpeed, 0); // No pasa del borde superior
        } else if (evt.key === "s") {
            this.user.y = Math.min(this.user.y + paddleSpeed, canvasHeight - this.user.height); // No pasa del borde inferior
        }
    
        // Movimiento del segundo jugador (o computadora)
        if (!this.soloPlay) {
            if (evt.key === "ArrowUp") {
                this.com.y = Math.max(this.com.y - paddleSpeed, 0); // No pasa del borde superior
            } else if (evt.key === "ArrowDown") {
                this.com.y = Math.min(this.com.y + paddleSpeed, canvasHeight - this.com.height); // No pasa del borde inferior
            }
        }
    }
    

    collision(ball, player) {
        ball.top = ball.y - ball.radius;
        ball.bottom = ball.y + ball.radius;
        ball.left = ball.x - ball.radius;
        ball.right = ball.x + ball.radius;

        player.top = player.y;
        player.bottom = player.y + player.height;
        player.left = player.x;
        player.right = player.x + player.width;

        return ball.right > player.left && ball.bottom > player.top && ball.left < player.right && ball.top < player.bottom;
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2 / this.dpr;
        this.ball.y = this.canvas.height / 2 / this.dpr;
        this.ball.speed = this.ball.velocityX = this.ball.velocityY = 7;
    }

    updateComPaddle() {
        let now = Date.now();
        if (now - this.lastUpdate > this.updateInterval) {
            this.lastUpdate = now;
            let targetY = this.ball.y - (this.com.y + this.com.height / 2);
            if (Math.abs(targetY) > 10) {
                this.com.y += this.comLevel * Math.sign(targetY) * Math.min(10, Math.abs(targetY));
            }
            if (this.com.y < 0) {
                this.com.y = 0;
            } else if (this.com.y + this.com.height > this.canvas.height / this.dpr) {
                this.com.y = (this.canvas.height / this.dpr) - this.com.height;
            }
        }
    }

    update() {
        if (this.ball.x - this.ball.radius < 0) {
            this.com.score++;
            this.resetBall();
        } else if (this.ball.x + this.ball.radius > this.canvas.width / this.dpr) {
            this.user.score++;
            this.resetBall();
        }

        this.ball.x += this.ball.velocityX;
        this.ball.y += this.ball.velocityY;

        if (this.soloPlay) {
            this.updateComPaddle();
        }

        if (this.ball.y + this.ball.radius > this.canvas.height / this.dpr || this.ball.y - this.ball.radius < 0) {
            this.ball.velocityY = -this.ball.velocityY;
        }

        let player = (this.ball.x < this.canvas.width / 2 / this.dpr) ? this.user : this.com;
        if (this.collision(this.ball, player)) {
            let collidePoint = this.ball.y - (player.y + player.height / 2);
            collidePoint = collidePoint / (player.height / 2);

            let angleRad = collidePoint * Math.PI / 4;
            let direction = (this.ball.x < this.canvas.width / 2 / this.dpr) ? 1 : -1;

            this.ball.velocityX = direction * this.ball.speed * Math.cos(angleRad);
            this.ball.velocityY = this.ball.speed * Math.sin(angleRad);

            this.ball.speed += 0.5;
        }
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}