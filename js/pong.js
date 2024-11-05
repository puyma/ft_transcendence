// TODO: space para empezar el juego
//     set players, 1 y 2, si no hay 2 -> computer
//     teclas para empezar a jugar y reset game

class Message {
    constructor(ctx, dpr, scaleFactor) {
        this.ctx = ctx;
        this.dpr = dpr;
        this.scaleFactor = scaleFactor;
        this.messageText = "";
        this.isVisible = false;
    }

    showMessage(text) {
        this.messageText = text;
        this.isVisible = true;
        this.render();
    }

    hide() {
        this.isVisible = false;
        this.clear();
    }

    render() {
        if (this.isVisible) {
            // this.clear();
            // this.ctx.font = `${20 * this.scaleFactor}px Arial`;
            // this.ctx.fillStyle = "white";
            // this.ctx.textAlign = "center";
            // this.ctx.fillText(this.messageText, this.ctx.canvas.width / 2 / this.dpr, this.ctx.canvas.height / 2 / this.dpr);
            
            // Crea un rectángulo semi-transparente para oscurecer la pantalla
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Cambia el último valor para ajustar la opacidad
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            // Dibuja el texto del mensaje
            this.ctx.font = `${20 * this.scaleFactor}px Arial`;
            this.ctx.fillStyle = "white"; // Color del texto
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.messageText, this.ctx.canvas.width / 2 / this.dpr, this.ctx.canvas.height / 2 / this.dpr);
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}


export class Game {
    constructor(canvasId, mode) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        this.dpr = window.devicePixelRatio || 1;
        this.gameMode = mode;
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
        this.isGameOver = false;
        this.gameStarted = false;
        // -----PROBANDO
        this.message = new Message(this.ctx, this.dpr, this.scaleFactor);
        // this.init();
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
        // this.canvas.addEventListener("keydown", (evt) => this.move(evt));
        // ------ probando
        this.message.showMessage("Press Space to Start");
        document.addEventListener("keydown", (evt) => {
            if (evt.code === "Space" && !this.gameStarted) {
                this.startGame(); // Inicia el juego al presionar "Space"
            } else {
                this.move(evt); // Mueve el paddle si el juego ha comenzado
            }
        });
        this.render(); // Dibuja la escena inicial
        // ------- fin prueba
    }

    startGame() {
        this.gameStarted = true; // Marca que el juego ha comenzado
        this.gameLoop(); // Inicia el bucle del juego
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

        if (!this.gameStarted || this.isGameOver) {
            this.message.render();  // Renderiza el mensaje si el juego no ha comenzado o está terminado
        }
    }

    move(evt) {
        const paddleSpeed = 40;
        const canvasHeight = this.canvas.height / this.dpr;
    
        // 1er player
        if (evt.key === "w") {
            this.user.y = Math.max(this.user.y - paddleSpeed, 0);
        } else if (evt.key === "s") {
            this.user.y = Math.min(this.user.y + paddleSpeed, canvasHeight - this.user.height);
        }
    
        // 2do player / computer
        if (this.gameMode != 'solo_play') {
            if (evt.key === "ArrowUp") {
                this.com.y = Math.max(this.com.y - paddleSpeed, 0);
            } else if (evt.key === "ArrowDown") {
                this.com.y = Math.min(this.com.y + paddleSpeed, canvasHeight - this.com.height);
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
        if (this.user.score >= 2 || this.com.score >= 2) {
            this.endGame();
            return;
        }

        if (this.ball.x - this.ball.radius < 0) {
            this.com.score++;
            this.resetBall();
        } else if (this.ball.x + this.ball.radius > this.canvas.width / this.dpr) {
            this.user.score++;
            this.resetBall();
        }

        this.ball.x += this.ball.velocityX;
        this.ball.y += this.ball.velocityY;

        if (this.gameMode === 'solo_play') {
        // if (this.soloPlay) {
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

    endGame(onFinish) {
        this.isGameOver = true;
        let winner = this.user.score >= 2 ? "User" : "Computer";
        
        // this.winnerMessage = `${winner} Wins!`;
        
        // Mostrar mensaje de ganador con opción de reiniciar
        // this.message.showMessage(`${winner} Wins!`, "Press 'R' to Restart");
        
        // TODO -> if (this.gameMode === 'solo_play' || this.gameMode === 'double_play')
        this.message.showMessage(`${winner} Wins! Press 'R' to Restart`);
        document.addEventListener("keydown", (evt) => this.resetGame(evt), { once: true });

        console.log("DESDE PONG.JS, ganador:", winner);
    
        // Llamar al callback con el ganador
        if (onFinish) {
            onFinish(winner);
        }
    }

    gameLoop() {
        if (!this.isGameOver) {
            this.update();
            this.render();
            // this.animationFrame = requestAnimationFrame(() => this.gameLoop());
        }
        //-----CHECKKK
        else {
            this.message.render(); // Muestra el mensaje en pantalla
        }

        if (!this.isGameOver) {
            requestAnimationFrame(() => this.gameLoop());
        }
        // --------FIN
        
        // this.animationFrame = requestAnimationFrame(() => this.gameLoop());
        
        // //PRUEBA MENSAJE PARA GANADOR
        // if (this.isGameOver && this.winnerMessage) {
        //     // Fondo semi-transparente para el mensaje
        //     this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        //     this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
        //     // Estilos del texto del mensaje
        //     this.ctx.fillStyle = "white";
        //     this.ctx.font = `${40 * this.scaleFactor}px Arial`;
        //     this.ctx.textAlign = "center";
        //     this.ctx.textBaseline = "middle";
            
        //     // Coordenadas para centrar el mensaje en la pantalla
        //     const centerX = this.canvas.width / 2 / this.dpr;
        //     const centerY = this.canvas.height / 2 / this.dpr;
            
        //     // Dibuja el mensaje centrado
        //     this.ctx.fillText(this.winnerMessage, centerX, centerY);

        //     //-----------PRUEBA RETRY
        //     // Dibuja el mensaje para reiniciar
        //     this.ctx.font = `${20 * this.scaleFactor}px Arial`;
        //     this.ctx.fillText("Press 'R' to Restart", centerX, centerY + 50 * this.scaleFactor);

        //     // Listener para reiniciar el juego al presionar 'R'
        //     document.addEventListener("keydown", (evt) => this.resetGame(evt), { once: true });
        //     //-----------FIN PRUEBA RETRY
        //     return;
        // }

        // // Continuar el bucle si el juego no ha terminado
        // if (!this.isGameOver) {
        //     requestAnimationFrame(() => this.gameLoop());
        // }
        // //FIN PRUEBA MENSAJE GANADOR
    }

    resetGame(evt) {
        if (evt.code === "KeyR") {
            this.isGameOver = false; // Reinicia el estado del juego
            this.user.score = 0;
            this.com.score = 0;
            this.winnerMessage = null;
            this.gameStarted = false;
            
            this.init(); // Vuelve a inicializar el juego
            // this.gameLoop(); // Comienza el bucle de juego nuevamente
        }
    }
}