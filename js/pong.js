export class Game {
    constructor(canvasId, mode) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        this.dpr = window.devicePixelRatio || 1;
        // this.modoJuego = sessionStorage.getItem('modoJuego');
        // this.soloPlay = this.modoJuego === 'solo';
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
    
        // 1er player
        if (evt.key === "w") {
            this.user.y = Math.max(this.user.y - paddleSpeed, 0);
        } else if (evt.key === "s") {
            this.user.y = Math.min(this.user.y + paddleSpeed, canvasHeight - this.user.height);
        }
    
        // 2do player / computer
        // if (!this.soloPlay) {
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

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}