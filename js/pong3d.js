import * as THREE from "three";

export class MessageManager {
  constructor() {
    this.messageElement = null; // Elemento del mensaje en el DOM
  }

  createMessageElement() {
    this.messageElement = document.createElement("div");
    this.messageElement.id = "pong-message";

    this.messageElement.style.position = "absolute";
    this.messageElement.style.top = "0";
    this.messageElement.style.left = "0";
    this.messageElement.style.width = "100vw";
    this.messageElement.style.height = "100vh";
    this.messageElement.style.backgroundColor = "black";
    this.messageElement.style.color = "white";
    this.messageElement.style.fontSize = "24px";
    this.messageElement.style.display = "flex";
    this.messageElement.style.alignItems = "center";
    this.messageElement.style.flexDirection = "column";
    this.messageElement.style.justifyContent = "center";
    this.messageElement.style.zIndex = "1000";
    this.messageElement.style.textAlign = "center";

    document
      .getElementById("main")
      .insertAdjacentElement("afterbegin", this.messageElement);
  }

  showMessage(text, color = "#FFFFFF", bg = "black") {
    if (!this.messageElement) {
      this.createMessageElement(); // Crear el elemento si no existe
    }
    this.messageElement.style.color = color;
    this.messageElement.style.display = "flex";
    this.messageElement.style.backgroundColor = bg;
    this.messageElement.innerHTML = text;
  }

  hideMessage() {
    if (this.messageElement) {
      this.messageElement.style.display = "none";
    }
  }
}

// Clase principal del juego
class Game {
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.messageManager = new MessageManager();

    // Configuración de dificultad
    this.initialSpeed = 0.5
    this.aiSpeed = 1;
    this.speed = 1; // Velocidad de movimiento de las palas
    this.speedIncrement = 0.02; // Incremento de velocidad de la pelota en cada colisión

    // Dimensiones y propiedades del campo
    this.ballHeight = 2;
    this.wallHeight = this.ballHeight * 2;
    this.wallThickness = 1;
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.fieldWidth = 150;
    this.fieldHeight = 75;

    // Estado del juego
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.paddle1 = null;
    this.paddle2 = null;
    this.ball = null;
    this.field = null;
    this.walls = null;

    // Entradas del teclado
    this.wKey = { isPressed: false };
    this.sKey = { isPressed: false };
    this.upKey = { isPressed: false };
    this.downKey = { isPressed: false };

    // Variables de juego
    this.boundaryMargin = 5; // Margen para detectar cuando la pelota sale del campo

    // Inicializa las palas
    this.paddle1 = new Paddle(-10, 20); // Ejemplo de posición x para la pala 1
    this.paddle2 = new Paddle(10, 20); // Ejemplo de posición x para la pala 2

    this.isGameStarted = false; // Nuevo estado para saber si el juego ha comenzado

    this.winner = ""; // Variable para almacenar al ganador
    this.loser = ""; // Variable para almacenar al ganador
    this.winScore = 10; // Goles necesarios para ganar
    this.winner_points = ""; // Goles necesarios para ganar
    this.loser_points = ""; // Goles necesarios para ganar
  }

  exitGame() {
    this.isGameStarted = false;
    // Función para salir del juego y volver al menú anterior
    const exitMessage = confirm(
      "¿Estás seguro de que quieres salir del juego?",
    );
    if (exitMessage) {
      // Aquí puedes redirigir al menú anterior, por ejemplo:
      window.location.href = "/"; // Cambiar la URL al menú o página anterior
    }
  }

  init() {
    // Ocultar el header siempre que inicie el juego
    const header = document.getElementsByTagName("header")?.[0];
    if (header) {
      header.setAttribute("style", "display:none;");
    }

    this.scene = new THREE.Scene();
    this.createCamera();
    this.createRenderer();
    this.createLights();
    this.createObjects();

    // Crear el marcador
    this.createScoreboard();

    // Configurar los event listeners
    window.addEventListener("resize", this.resizeCanvas.bind(this));
    window.addEventListener("keydown", this.handleKeydown.bind(this));
    window.addEventListener("keyup", this.handleKeyup.bind(this));

    this.messageManager.showMessage(`¡Bienvenido ${this.player1}! Jugarás contra ${this.player2}.Presiona cualquier tecla para comenzar`);
    // this.gameLoop();
  }

  startGame() {
    if (!this.isGameStarted) {
      this.messageManager.hideMessage(); // Ocultar el mensaje de inicio
      this.isGameStarted = true; // Marcar que el juego ha comenzado
      // Restablecer posiciones de las palas
      this.paddle1.resetPosition();
      this.paddle2.resetPosition();
      this.ball.resetPosition();

      this.gameLoop(); // Iniciar el bucle del juego
    }
  }

  endGame(winnerMessage) {
    this.isGameStarted = false;

    this.winner = this.paddle1.score >= this.paddle2.score ? this.player1 : this.player2;
    this.loser = this.paddle1.score < this.paddle2.score ? this.player1 : this.player2;
    this.winner_points = this.paddle1.score >= this.paddle2.score ? this.paddle1.score : this.paddle2.score;
    this.loser_points = this.paddle1.score < this.paddle2.score ? this.paddle1.score : this.paddle2.score;

    // Mostrar mensaje de fin de juego
    this.messageManager.showMessage(
      `${winnerMessage}<br>Presiona 'R' para volver a jugar o ESC para salir.`,
      "#FF0000",
    );
    const csrfToken = getCSRFToken();
    fetch("/tresD/play/save_match/", {  // Correct URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({
        winner: this.winner,
        loser: this.loser,
        winner_points: this.winner_points,
        loser_points: this.loser_points,
      })
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then(data => {
            throw new Error(data.message || 'An error occurred');
          });
        }
      })
      .then(data => {
        if (data.status === 'success') {
          console.log('Match saved successfully:', data);
        } else {
          console.error('Error saving match:', data.message);
        }
      })
      .catch(error => {
        if (error.message === 'User not authenticated') {
          console.log('User is not logged in, match not saved');
        } else {
          console.error('Unexpected error:', error);
        }
      });
  }

  resetGame() {
    
    // Limpiar el mensaje de fin de juego
    document.getElementById("pong-message").innerHTML = ""; // Asegúrate de eliminar el mensaje

    // Reiniciar puntajes y estado del juego
    this.paddle1.score = 0;
    this.paddle2.score = 0;
    this.updateScoreboard(); // Asegurarte de que el marcador se reinicie
    this.isGameStarted = true; // Marcar el juego como no iniciado
    this.ball.resetPosition();
    this.paddle1.resetPosition();
    this.paddle2.resetPosition();
    this.messageManager.hideMessage(); // Ocultar el mensaje de inicio
    this.gameLoop();
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75, // Campo de visión (FOV)
      window.innerWidth / window.innerHeight, // Relación de aspecto
      1, // Plano cercano
      1000, // Plano lejano
    );

    // Ajustar la posición de la cámara
    this.camera.position.set(20, 70, 70); // Colocarla en una posición elevada
    this.camera.lookAt(0, 0, 0); // Mirar hacia el centro del campo
  }

  createScoreboard() {
    // Crear el contenedor del marcador
    this.scoreboard = document.createElement("div");
    this.scoreboard.id = "scoreboard";
    this.scoreboard.style.position = "absolute";
    this.scoreboard.style.top = "10px";
    this.scoreboard.style.left = "50%";
    this.scoreboard.style.transform = "translateX(-50%)";
    this.scoreboard.style.fontSize = "32px";
    this.scoreboard.style.color = "#FFD700"; // Oro brillante
    this.scoreboard.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.8), 0px 0px 10px rgba(255, 215, 0, 0.7)"; // Sombra para profundidad
    this.scoreboard.style.background = "linear-gradient(145deg, rgba(50, 50, 50, 0.8), rgba(0, 0, 0, 0.5))"; // Fondo con degradado
    this.scoreboard.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.2)"; // Efecto 3D
    this.scoreboard.style.padding = "15px";
    this.scoreboard.style.borderRadius = "10px";
    this.scoreboard.style.fontFamily = "Arial, sans-serif";
    this.scoreboard.style.textAlign = "center";
    document.body.appendChild(this.scoreboard);

    // Inicializar el marcador
    this.updateScoreboard();
  }

  createRenderer() {
    // Asegúrate de que la escena esté inicializada
    this.scene = new THREE.Scene();

    // Crear el renderizador
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.screenWidth, this.screenHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    
    // Cargar la textura de fondo
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        '../static/assets/textura.jpg', // Reemplaza con la ruta a tu imagen
        (texture) => {
            // Establece el fondo de la escena una vez la textura haya sido cargada
            this.scene.background = texture;
            // Aquí no es necesario usar setClearColor, ya que la textura reemplaza el fondo.
        },
        undefined, // Opcional: función de progreso de carga (si quieres mostrar progreso)
        (error) => {
            console.error('Error al cargar la textura de fondo:', error);
        }
    );

    // Establecer el color de fondo del body (esto puede ser opcional si usas la textura)
    document.body.style.backgroundColor = "#faf0e6";

    // Asegúrate de que el elemento "main" exista
    const main = document.getElementById("main");
    if (main) {
      main.replaceChildren(this.renderer.domElement);
    } else {
      console.error(
        "No se encontró el elemento con id 'main'. Asegúrate de que exista en tu HTML.",
      );
    }
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 50, 50);
    this.scene.add(directionalLight);
  }

  createObjects() {
    // Crear el campo
    this.field = new Field(this.fieldWidth, this.fieldHeight);
    this.scene.add(this.field.mesh);

    // Crear las palas
    this.paddle1 = new Paddle(-this.fieldWidth / 2 + 1, this.fieldHeight);
    this.paddle2 = new Paddle(this.fieldWidth / 2 - 1, this.fieldHeight);
    this.scene.add(this.paddle1.mesh);
    this.scene.add(this.paddle2.mesh);

    // Crear la pelota
    this.ball = new Ball(this.initialSpeed);
    this.scene.add(this.ball.mesh);

    // Crear los muros laterales
    this.walls = new Walls(
      this.fieldWidth,
      this.fieldHeight,
      this.wallHeight,
      this.wallThickness,
    );
    this.scene.add(this.walls.topWall);
    this.scene.add(this.walls.bottomWall);

    // Crear la línea central
    this.createCenterLine();
  }

  createCenterLine() {
    const lineGeometry = new THREE.BufferGeometry();
    const lineVertices = new Float32Array([
      0,
      0,
      this.fieldHeight / 2,
      0,
      0,
      -this.fieldHeight / 2,
    ]);
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(lineVertices, 3),
    );
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
    });
    const centerLine = new THREE.Line(lineGeometry, lineMaterial);
    this.scene.add(centerLine);
  }

  resizeCanvas() {
    // Obtener el nuevo ancho y alto de la ventana
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;

    // Ajustar el tamaño del renderizador
    this.renderer.setSize(this.screenWidth, this.screenHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Calcular la nueva relación de aspecto
    const aspectRatio = this.screenWidth / this.screenHeight;

    // Ajustar la cámara con la nueva relación de aspecto
    this.camera.aspect = aspectRatio;

    // Actualizar la matriz de proyección de la cámara
    this.camera.updateProjectionMatrix();
  }

  handleKeydown(event) {
    console.log(event.key);
    if (!this.isGameStarted) {
      // Si el juego no ha comenzado, permite iniciar el juego
      if (event.key === "Escape")
        this.exitGame(); // Salir del juego
      else if (event.key === "r")
        this.resetGame(); // Reiniciar el juego
      else this.startGame(); // Iniciar el juego
    } else {
      switch (event.key) {
        case "w":
          this.wKey.isPressed = true;
          event.preventDefault(); // Evitar el scroll de la pantalla
          break;
        case "s":
          this.sKey.isPressed = true;
          event.preventDefault(); // Evitar el scroll de la pantalla
          break;
        case "Escape": // Detectar si se presiona 'ESC'
          this.exitGame(); // Llamar a la función para salir del juego
          break;
      }
    }
  }

  handleKeyup(event) {
    switch (event.key) {
      case "w":
        this.wKey.isPressed = false;
        break;
      case "s":
        this.sKey.isPressed = false;
        break;
    }
  }

  createScoreboard() {
    // Crear el contenedor del marcador
    this.scoreboard = document.createElement("div");
    this.scoreboard.id = "scoreboard";
    this.scoreboard.style.position = "absolute";
    this.scoreboard.style.top = "10px";
    this.scoreboard.style.left = "50%";
    this.scoreboard.style.transform = "translateX(-50%)";
    this.scoreboard.style.fontSize = "32px";
    this.scoreboard.style.color = "#FFD700"; // Oro brillante
    this.scoreboard.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.8), 0px 0px 10px rgba(255, 215, 0, 0.7)"; // Sombra para profundidad
    this.scoreboard.style.background = "linear-gradient(145deg, rgba(50, 50, 50, 0.8), rgba(0, 0, 0, 0.5))"; // Fondo con degradado
    this.scoreboard.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.2)"; // Efecto 3D
    this.scoreboard.style.padding = "15px";
    this.scoreboard.style.borderRadius = "10px";
    this.scoreboard.style.fontFamily = "Arial, sans-serif";
    this.scoreboard.style.textAlign = "center";
    document.body.appendChild(this.scoreboard);

    // Inicializar el marcador
    this.updateScoreboard();
  }

  updateScoreboard() {
    // Actualizar el marcador con los puntajes actuales
    this.scoreboard.innerHTML = `${this.player1} : ${this.paddle1.score} | ${this.player2} ${this.paddle2.score}`;
  }

  collision(ball, paddle) {
    const ballBox = new THREE.Box3().setFromObject(ball.mesh);
    const paddleBox = new THREE.Box3().setFromObject(paddle.mesh);
    return ballBox.intersectsBox(paddleBox);
  }

  getCollisionAngle(ball, paddle) {
    const ballRadius = ball.mesh.geometry.parameters.radius;
    const paddleHeight = paddle.height; // Asumimos que la pala tiene una propiedad "height"
    const paddleCenter = paddle.mesh.position.z;
  
    // La posición de la pelota al momento de la colisión
    const ballPosition = ball.mesh.position.z;
  
    // Calculamos la distancia relativa desde el centro de la pala
    const distanceFromCenter = ballPosition - paddleCenter;
  
    // Mapeamos la distancia al rango [-1, 1] donde 0 es el centro de la pala
    const normalizedDistance = distanceFromCenter / (paddleHeight / 2);
  
    // Calculamos el ángulo de rebote, en función de la distancia del centro
    // Cuanto más lejos del centro, más abierto será el ángulo
    const maxAngle = Math.PI / 4; // El ángulo máximo que puede tener la pelota (45 grados)
    const angle = normalizedDistance * maxAngle; // Ángulo ajustado en función de la distancia
  
    return angle;
  }

  movePaddle(paddle, moveUp, moveDown) {
    if (moveUp) {
      paddle.moveDown(this.speed); // Cambiar a moveDown para invertir el movimiento
    }
    if (moveDown) {
      paddle.moveUp(this.speed); // Cambiar a moveUp para invertir el movimiento
    }
    paddle.limitPosition(-this.fieldHeight / 2, this.fieldHeight / 2);
  }

  update() {
    this.ball.updatePosition();

    const ballRadius = this.ball.mesh.geometry.parameters.radius;

    // Rebote en los muros superior e inferior
    if (this.ball.mesh.position.z + ballRadius >= this.fieldHeight / 2) {
      this.ball.bounceY();
      this.ball.mesh.position.z = this.fieldHeight / 2 - ballRadius;
      this.ball.increaseSpeed(this.speedIncrement);
    } else if (
      this.ball.mesh.position.z - ballRadius <=
      -this.fieldHeight / 2
    ) {
      this.ball.bounceY();
      this.ball.mesh.position.z = -this.fieldHeight / 2 + ballRadius;
      this.ball.increaseSpeed(this.speedIncrement);
    }

    // Colisiones con las palas
    if (this.collision(this.ball, this.paddle1)) {
      const angle = this.getCollisionAngle(this.ball, this.paddle1);
      this.ball.bounceX(angle); // Aplicamos el ángulo al rebote
      this.ball.mesh.position.x =
        this.paddle1.mesh.position.x + (ballRadius + this.paddle1.width / 2);
      this.ball.increaseSpeed(this.speedIncrement);
    }
  
    if (this.collision(this.ball, this.paddle2)) {
      const angle = this.getCollisionAngle(this.ball, this.paddle2);
      this.ball.bounceX(angle); // Aplicamos el ángulo al rebote
      this.ball.mesh.position.x =
        this.paddle2.mesh.position.x - (ballRadius + this.paddle2.width / 2);
      this.ball.increaseSpeed(this.speedIncrement);
    }

    // Comprobar si la pelota salió del campo
    if (
      this.ball.mesh.position.x - ballRadius <=
      -this.fieldWidth / 2 - this.boundaryMargin
    ) {
      if (!this.collision(this.ball, this.paddle1)) {
        this.ball.resetPosition();
        this.paddle2.score++;
        this.updateScoreboard(); // Actualizar el marcador
      }
    } else if (
      this.ball.mesh.position.x + ballRadius >=
      this.fieldWidth / 2 + this.boundaryMargin
    ) {
      if (!this.collision(this.ball, this.paddle2)) {
        this.ball.resetPosition();
        this.paddle1.score++;
        this.updateScoreboard(); // Actualizar el marcador
      }
    }

    // Verificar si algún jugador ha alcanzado el puntaje de victoria
    if (this.paddle1.score >= this.winScore) {
      this.endGame(`${this.player1} wins!`); // Use backticks
    } else if (this.paddle2.score >= this.winScore) {
      this.endGame(`${this.player2} wins!`); // Use backticks
    }

    // Modo "solo_play", movemos la pala del jugador 1 con las teclas 'W' y 'S'
    this.movePaddle(this.paddle1, this.wKey.isPressed, this.sKey.isPressed);
    // Y también actualizamos la pala del CPU (computadora)
    this.updateComPaddle();
  }

  updateComPaddle() {
    const distanceToBall =
      this.ball.mesh.position.z - this.paddle2.mesh.position.z;

    // Aquí se calcula la velocidad de la pala de la máquina
    const aiSpeed = this.aiSpeed;

    // Lógica para seguir la pelota
    if (distanceToBall > 0) {
      this.paddle2.moveUp(aiSpeed);
    } else {
      this.paddle2.moveDown(aiSpeed);
    }

    // Lógica de limitación de posición
    this.paddle2.limitPosition(-this.fieldHeight / 2, this.fieldHeight / 2);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  gameLoop() {
    if (this.isGameStarted) {
      this.update();
      this.render(); // Asegúrate de seguir renderizando aunque el juego no haya comenzado
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }
}

// Clase para las palas
class Paddle {
  constructor(xPosition, fieldHeight) {
    const paddleGeometry = new THREE.BoxGeometry(2, 2, 15);
    const paddleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(paddleGeometry, paddleMaterial);
    this.mesh.position.set(xPosition, 1.5, 0);
    this.width = paddleGeometry.parameters.width;
    this.depth = paddleGeometry.parameters.depth;
    this.fieldHeight = fieldHeight;
    this.score = 0;

    // Guardar la posición inicial
    this.initialPosition = this.mesh.position.clone(); // Clonar la posición inicial
  }

  moveUp(speed) {
    this.mesh.position.z += speed;
  }

  moveDown(speed) {
    this.mesh.position.z -= speed;
  }

  limitPosition(minZ, maxZ) {
    this.mesh.position.z = Math.max(
      Math.min(this.mesh.position.z, maxZ - this.depth / 2),
      minZ + this.depth / 2,
    );
  }

  resetPosition() {
    this.mesh.position.copy(this.initialPosition); // Restablecer la posición inicial
  }
}

class Ball {
  constructor(initialSpeed) {
    const ballRadius = 1;
    const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    this.mesh = new THREE.Mesh(ballGeometry, ballMaterial);

    // Guardar siempre la velocidad inicial base
    this.baseSpeed = initialSpeed; // Velocidad inicial permanente
    this.initialSpeed = initialSpeed; // Velocidad que puede cambiar durante el juego
    this.resetPosition();
  }

  resetPosition() {
    
    this.mesh.position.set(0, 3, 0);
    
    // Reiniciar la velocidad a la velocidad base
    this.initialSpeed = this.baseSpeed;
    const randomDirectionX = Math.random() < 0.5 ? 1 : -1;
    const randomDirectionZ = Math.random() < 0.5 ? 1 : -1;

    // Usar la velocidad inicial reiniciada
    this.velocityX = randomDirectionX * this.baseSpeed;
    this.velocityY = randomDirectionZ * this.baseSpeed;
  
    
  }

  updatePosition() {
    this.mesh.position.x += this.velocityX;
    this.mesh.position.z += this.velocityY;
  }

  bounceX() {
    this.velocityX = -this.velocityX;
  }

  bounceY() {
    this.velocityY = -this.velocityY;
  }

  increaseSpeed(amount) {
    this.velocityX += this.velocityX > 0 ? amount : -amount;
    this.velocityY += this.velocityY > 0 ? amount : -amount;
  }
}

// Clase para el campo
class Field {
  constructor(width, height) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshStandardMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geometry, material);

    // Rotar el campo para que esté alineado con la vista
    this.mesh.rotation.x = -Math.PI / 2; // Girar el campo para que esté recto
    this.mesh.position.y = 0;
  }
}

// Clase para los muros
// class Walls {
//   constructor(fieldWidth, fieldHeight, wallHeight, wallThickness) {
//     // Cargar una textura para los muros (si tienes una)
//     const textureLoader = new THREE.TextureLoader();

//     // Cargar el mapa de normales para dar una sensación de relieve
//     const normalMap = textureLoader.load('/static/assets/stone.jpg'); // Asegúrate de que la ruta sea correcta

//     // Material con más detalles, que simula relieve y añade brillo
//     const wallMaterial = new THREE.MeshStandardMaterial({
//       color: 0x2F4F4F,             // Color base
//       roughness: 0.4,              // Un poco menos rugoso para dar un acabado más suave
//       metalness: 0.2,              // Material con algo de efecto metálico
//       emissive: 0x333333,          // Le da un resplandor suave
//       normalMap: normalMap         // Añadir el normalMap para dar más detalles
//     });

//     // Muro superior con más volumen
//     const topWallGeometry = new THREE.BoxGeometry(
//       fieldWidth,          // Ancho del muro
//       wallThickness * 1.5,   // Grosor del muro (aumentado para dar más presencia)
//       wallHeight * 1     // Aumentamos la altura para darle más presencia
//     );
//     this.topWall = new THREE.Mesh(topWallGeometry, wallMaterial);
//     this.topWall.position.set(
//       0,
//       wallHeight / 2,                  // Posición Y centrada
//       fieldHeight / 2 + wallThickness / 2  // Posición Z para el muro superior
//     );
//     this.topWall.castShadow = true;  // Habilitamos las sombras
//     this.topWall.receiveShadow = true;

//     // Muro inferior con más volumen
//     const bottomWallGeometry = new THREE.BoxGeometry(
//       fieldWidth,          // Ancho del muro
//       wallThickness * 1.5,   // Grosor del muro (aumentado para dar más presencia)
//       wallHeight * 1     // Aumentamos la altura para darle más presencia
//     );
//     this.bottomWall = new THREE.Mesh(bottomWallGeometry, wallMaterial);
//     this.bottomWall.position.set(
//       0,
//       wallHeight / 2,                  // Posición Y centrada
//       -fieldHeight / 2 - wallThickness / 2 // Posición Z para el muro inferior
//     );
//     this.bottomWall.castShadow = true; // Habilitamos las sombras
//     this.bottomWall.receiveShadow = true;

//     // Agregar más muros laterales (si es necesario)
//   }
// }
class Walls {
  constructor(fieldWidth, fieldHeight, wallHeight, wallThickness) {
    const textureLoader = new THREE.TextureLoader();
    
    // Cargar la textura principal para el muro
    const wallTexture = textureLoader.load(
      '/static/assets/stone.jpg', // Asegúrate de que la ruta sea correcta
      (texture) => {
        console.log('Textura principal cargada correctamente');
      },
      undefined, // Opcional: función de progreso
      (error) => {
        console.error('Error al cargar la textura principal:', error);
      }
    );

    // Cargar el normal map
    const normalMap = textureLoader.load(
      '/static/assets/stone.jpg', // Asegúrate de que la ruta sea correcta
      (texture) => {
        console.log('Normal map cargado correctamente');
      },
      undefined, // Opcional: función de progreso
      (error) => {
        console.error('Error al cargar el normal map:', error);
      }
    );

    // Material mejorado con textura, normalMap y otros parámetros
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: wallTexture,            // Usamos una textura para los muros
      color: 0xFF4500,             // Azul oscuro para los muros
      roughness: 0.4,              // Rugosidad para no ser tan brillante
      metalness: 0.2,              // Le damos algo de aspecto metálico
      emissive: 0x333333,          // Le da un resplandor suave (si lo quieres)
      normalMap: normalMap,        // Mapa normal para más detalles
    });

    // Muro superior
    const topWallGeometry = new THREE.BoxGeometry(
      fieldWidth,          // Ancho del muro
      wallThickness * 3,   // Hacemos el grosor más grueso para más volumen
      wallHeight * 1     // Aumentamos la altura para darle más presencia
    );
    this.topWall = new THREE.Mesh(topWallGeometry, wallMaterial);
    this.topWall.position.set(
      0,
      wallHeight / 2 + wallThickness,  // Posición Y centrada, ajustada por grosor
      fieldHeight / 2 + wallThickness  // Posición Z para el muro superior
    );
    this.topWall.castShadow = true;
    this.topWall.receiveShadow = true;

    // Muro inferior
    const bottomWallGeometry = new THREE.BoxGeometry(
      fieldWidth,          // Ancho del muro
      wallThickness * 3,   // Hacemos el grosor más grueso
      wallHeight * 1     // Aumentamos la altura para darle más presencia
    );
    this.bottomWall = new THREE.Mesh(bottomWallGeometry, wallMaterial);
    this.bottomWall.position.set(
      0,
      wallHeight / 2 + wallThickness, // Posición Y centrada, ajustada por grosor
      -fieldHeight / 2 - wallThickness // Posición Z para el muro inferior
    );
    this.bottomWall.castShadow = true;
    this.bottomWall.receiveShadow = true;

    // Agregar los muros a la escena (suponiendo que ya has creado la escena en otro lugar)
    scene.add(this.topWall);
    scene.add(this.bottomWall);
  }
}

// Crear la escena y añadir luces
const scene = new THREE.Scene();

// Crear una luz direccional
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz blanca
directionalLight.position.set(5, 5, 5); // Posición de la luz
directionalLight.castShadow = true; // Habilitar sombras
scene.add(directionalLight);

// Crear una luz ambiental
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Luz ambiental suave
scene.add(ambientLight);

// Crear una luz puntual (opcional)
const pointLight = new THREE.PointLight(0xFFFFFF, 1, 100);
pointLight.position.set(0, 10, 0);
pointLight.castShadow = true;
scene.add(pointLight);

// Añadir los muros a la escena
const walls = new Walls(100, 50, 20, 5);




function getCSRFToken() {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return csrfToken || ''; // Return the token or empty string if not found
}

const csrfToken = getCSRFToken();

export { Game };