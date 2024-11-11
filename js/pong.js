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
      // Crea un rectángulo semi-transparente para oscurecer la pantalla
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Cambia el último valor para ajustar la opacidad
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

      // Dibuja el texto del mensaje
      this.ctx.font = `${20 * this.scaleFactor}px Arial`;
      this.ctx.fillStyle = "white"; // Color del texto
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        this.messageText,
        this.ctx.canvas.width / 2 / this.dpr,
        this.ctx.canvas.height / 2 / this.dpr
      );
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
}

export class Game {
  constructor(canvasId, mode, play1, play2) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;

    this.dpr = window.devicePixelRatio || 1;
    this.gameMode = mode;
    this.player1 = play1;
    if (this.gameMode === "solo_play") this.player2 = "Computer";
    else this.player2 = play2;
    this.scaleFactor = 1.5;
    this.user = this.createPaddle(
      0,
      this.canvas.height / 2 / this.dpr - 50 * this.scaleFactor,
      "RED"
    );
    this.com = this.createPaddle(
      this.canvas.width / this.dpr - 10 * this.scaleFactor,
      this.canvas.height / 2 / this.dpr - 50 * this.scaleFactor,
      "RED"
    );
    this.ball = this.createBall(
      this.canvas.width / 2 / this.dpr,
      this.canvas.height / 2 / this.dpr,
      "WHITE"
    );

    this.net = {
      x: this.canvas.width / 2 / this.dpr - 1,
      y: 0,
      width: 2 * this.scaleFactor,
      height: 10 * this.scaleFactor,
      color: "WHITE",
    };

    // this.comLevel = 0.7;
    this.comLevel = 1.2;
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
      score: 0,
    };
  }

  createBall(x, y, color) {
    let angleRad = (Math.random() * Math.PI) / 4; // Ángulo aleatorio en la salida
    let direction = Math.random() > 0.5 ? 1 : -1; // Dirección aleatoria
    let initialSpeed = 7; // Velocidad inicial más baja
    return {
      x: x,
      y: y,
      radius: 5 * this.scaleFactor,
      // speed: 7,
      // velocityX: 7,
      // velocityY: 7,
      speed: initialSpeed, // Establece la velocidad inicial baja
      velocityX: initialSpeed * Math.cos(angleRad) * direction, // Inicializa la velocidad X
      velocityY: initialSpeed * Math.sin(angleRad),
      color: color,
    };
  }

  init() {
    document
      .getElementsByTagName("header")?.[0]
      .setAttribute("style", "display:none;");
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.user.y = this.canvas.height / 2 / this.dpr - this.user.height / 2;
    this.com.x = this.canvas.width / this.dpr - this.com.width;
    this.com.y = this.canvas.height / 2 / this.dpr - this.com.height / 2;
    this.ball.x = this.canvas.width / 2 / this.dpr;
    this.ball.y = this.canvas.height / 2 / this.dpr;
    this.canvas.setAttribute("tabindex", 0);
    this.canvas.focus();
    // this.canvas.addEventListener("keydown", (evt) => this.move(evt));
    // ------ probando
    // this.message.showMessage("Press Space to Start");
    this.message.showMessage(
      `Next Match: ${this.player1} vs ${this.player2}, Press Space to start`
    );
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
    this.ctx.fillRect(
      Math.round(x),
      Math.round(y),
      Math.round(w),
      Math.round(h)
    );
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
      this.drawRectangle(
        netX,
        this.net.y + i,
        this.net.width,
        this.net.height,
        this.net.color
      );
    }
  }

  render() {
    this.drawRectangle(
      0,
      0,
      this.canvas.width / this.dpr,
      this.canvas.height / this.dpr,
      "BLACK"
    );
    this.drawNet();
    this.drawText(
      this.user.score,
      this.canvas.width / 4 / this.dpr,
      this.canvas.height / 5 / this.dpr,
      "WHITE"
    );
    this.drawText(
      this.com.score,
      (3 * this.canvas.width) / 4 / this.dpr,
      this.canvas.height / 5 / this.dpr,
      "WHITE"
    );
    this.drawRectangle(
      this.user.x,
      this.user.y,
      this.user.width,
      this.user.height,
      this.user.color
    );
    this.drawRectangle(
      this.com.x,
      this.com.y,
      this.com.width,
      this.com.height,
      this.com.color
    );
    this.drawCircle(
      this.ball.x,
      this.ball.y,
      this.ball.radius,
      this.ball.color
    );

    if (!this.gameStarted || this.isGameOver) {
      this.message.render(); // Renderiza el mensaje si el juego no ha comenzado o está terminado
    }
  }

  move(evt) {
    const paddleSpeed = 40;
    const canvasHeight = this.canvas.height / this.dpr;

    // 1er player
    if (evt.key === "w") {
      this.user.y = Math.max(this.user.y - paddleSpeed, 0);
    } else if (evt.key === "s") {
      this.user.y = Math.min(
        this.user.y + paddleSpeed,
        canvasHeight - this.user.height
      );
    }

    // 2do player / computer
    if (this.gameMode != "solo_play") {
      if (evt.key === "ArrowUp") {
        this.com.y = Math.max(this.com.y - paddleSpeed, 0);
      } else if (evt.key === "ArrowDown") {
        this.com.y = Math.min(
          this.com.y + paddleSpeed,
          canvasHeight - this.com.height
        );
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

    return (
      ball.right > player.left &&
      ball.bottom > player.top &&
      ball.left < player.right &&
      ball.top < player.bottom
    );
  }

  resetBall() {
    // this.ball.x = this.canvas.width / 2 / this.dpr;
    // this.ball.y = this.canvas.height / 2 / this.dpr;
    // this.ball.speed = this.ball.velocityX = this.ball.velocityY = 7;
    this.ball.x = this.canvas.width / 2 / this.dpr;
    this.ball.y = this.canvas.height / 2 / this.dpr;
    this.ball.speed = 7; // Asegúrate de que la velocidad se restablezca correctamente

    let angleRad = (Math.random() * Math.PI) / 4; // Genera un nuevo ángulo de rebote
    let direction = Math.random() > 0.5 ? 1 : -1; // Elige una dirección aleatoria

    // Calcula las velocidades iniciales basadas en la velocidad total
    this.ball.velocityX = this.ball.speed * Math.cos(angleRad) * direction;
    this.ball.velocityY = this.ball.speed * Math.sin(angleRad);
  }

  // updateComPaddle() {
  //     let now = Date.now();
  //     if (now - this.lastUpdate > this.updateInterval) {
  //         this.lastUpdate = now;
  //         let targetY = this.ball.y - (this.com.y + this.com.height / 2);
  //         if (Math.abs(targetY) > 5) {
  //             this.com.y += this.comLevel * Math.sign(targetY) * Math.min(10, Math.abs(targetY));
  //         }
  //         if (this.com.y < 0) {
  //             this.com.y = 0;
  //         } else if (this.com.y + this.com.height > this.canvas.height / this.dpr) {
  //             this.com.y = (this.canvas.height / this.dpr) - this.com.height;
  //         }
  //     }
  // }
  updateComPaddle() {
    let now = Date.now();
    if (now - this.lastUpdate > this.updateInterval) {
      this.lastUpdate = now;

      // Duración del tiempo para mantener el error constante
      if (!this.errorTime || now - this.errorTime > 1000) {
        // Cambia el margen de error cada segundo
        this.errorFactor = Math.min(this.ball.speed / 10, 1.5); // Ajusta este factor según la velocidad
        this.errorOffset = (Math.random() - 0.5) * 100 * this.errorFactor; // Genera un nuevo error
        this.errorTime = now; // Marca el momento en que se generó el nuevo error
      }

      // El targetY ahora incluye el error aleatorio, pero este error se actualiza cada 1 segundo
      let targetY =
        this.ball.y + this.errorOffset - (this.com.y + this.com.height / 2);

      // Si el error es pequeño (para evitar movimientos bruscos), ajusta el paddle
      if (Math.abs(targetY) > 10) {
        this.com.y +=
          this.comLevel * Math.sign(targetY) * Math.min(8, Math.abs(targetY));
      }

      // Limita el paddle dentro de los bordes del canvas
      if (this.com.y < 0) {
        this.com.y = 0;
      } else if (this.com.y + this.com.height > this.canvas.height / this.dpr) {
        this.com.y = this.canvas.height / this.dpr - this.com.height;
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

    if (this.ball.y + this.ball.radius > this.canvas.height / this.dpr) {
      this.ball.y = this.canvas.height / this.dpr - this.ball.radius; // Corrige la posición
      this.ball.velocityY = -this.ball.velocityY; // Cambia la dirección
    } else if (this.ball.y - this.ball.radius < 0) {
      this.ball.y = this.ball.radius; // Corrige la posición
      this.ball.velocityY = -this.ball.velocityY; // Cambia la dirección
    }

    if (this.gameMode === "solo_play") {
      this.updateComPaddle();
    }

    // if (this.ball.y + this.ball.radius > this.canvas.height / this.dpr || this.ball.y - this.ball.radius < 0) {
    //     this.ball.velocityY = -this.ball.velocityY;
    // }

    let player =
      this.ball.x < this.canvas.width / 2 / this.dpr ? this.user : this.com;
    if (this.collision(this.ball, player)) {
      let collidePoint = this.ball.y - (player.y + player.height / 2);
      collidePoint = collidePoint / (player.height / 2);

      let angleRad = (collidePoint * Math.PI) / 4;
      let direction = this.ball.x < this.canvas.width / 2 / this.dpr ? 1 : -1;

      this.ball.velocityX = direction * this.ball.speed * Math.cos(angleRad);
      this.ball.velocityY = this.ball.speed * Math.sin(angleRad);

      this.ball.speed += 0.5;
    }
  }

  // endGame(onFinish) {
  //     this.isGameOver = true;
  //     let winner = this.user.score >= 2 ? this.player1 : this.player2;

  //     // this.winnerMessage = `${winner} Wins!`;

  //     // Mostrar mensaje de ganador con opción de reiniciar
  //     // this.message.showMessage(`${winner} Wins!`, "Press 'R' to Restart");

  //     if (this.gameMode === 'solo_play' || this.gameMode === 'double_play')
  //     {
  //         this.message.showMessage(`${winner} Wins! Press 'R' to Restart`);
  //         document.addEventListener("keydown", (evt) => this.resetGame(evt), { once: true });
  //     }

  //     console.log("DESDE PONG.JS, ganador:", winner);

  //     // Llamar al callback con el ganador
  //     if (onFinish) {
  //         onFinish(winner);
  //     }
  // }

  // endGame(onFinish, onNextMatch) {
  //     this.isGameOver = true;
  //     let winner = this.user.score >= 2 ? this.player1 : this.player2;

  //     // Mostrar el mensaje del ganador
  //     this.message.showMessage(`${winner} Wins! Press 'N' for Next Match`);

  //     // Si estamos en un modo de torneo (con múltiples jugadores)
  //     if (this.gameMode !== 'solo_play' && this.gameMode !== 'double_play') {
  //         // Llamar a handleNextMatch (definido en tournament.js)
  //         onNextMatch(() => {
  //             // Llamar a la función de siguiente partido cuando presionemos 'N'
  //         });
  //     } else {
  //         // Para los modos solo_play o double_play, usamos R para reiniciar
  //         document.addEventListener("keydown", (evt) => this.resetGame(evt), { once: true });
  //     }

  //     console.log("DESDE PONG.JS, ganador:", winner);

  //     // Llamar al callback con el ganador
  //     if (onFinish) {
  //         onFinish(winner);
  //     }
  // }

  endGame(onFinish, onNextMatch, isLastMatch, tournamentWinner) {
    this.isGameOver = true;
    let winner = this.user.score >= 2 ? this.player1 : this.player2;

    if (this.gameMode === "solo_play" || this.gameMode === "double_play") {
      this.message.showMessage(`${winner} Wins! Press 'R' to Restart`);
      document.addEventListener("keydown", (evt) => this.resetGame(evt), {
        once: true,
      });
    }
    if (
      (this.gameMode === "all_vs_all" || this.gameMode === "knockout") &&
      !isLastMatch
    ) {
      this.message.showMessage(`${winner} Wins! Press 'N' for Next Match`);
      if (onNextMatch) onNextMatch();
    }
    // Si es el último partido, mostrar ganador del partido y luego ganador del torneo
    if (isLastMatch) {
      if (this.gameMode === "knockout")
        this.message.showMessage(`Tournament winner: ${winner}.`);
      else if (this.gameMode === "all_vs_all")
        this.message.showMessage(`Tournament winner: ${tournamentWinner}`);
    }
    // else {
    // //     Mensaje para un partido normal, sin ser el último
    //     this.message.showMessage(`${winner} Wins! Press 'N' for Next Match`);
    //     if (onNextMatch) onNextMatch();
    // }

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
