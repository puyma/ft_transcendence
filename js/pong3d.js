import * as THREE from 'three';

class MessageManager {
    constructor() {
        this.messageElement = null; // Elemento del mensaje en el DOM
    }

    createMessageElement() {
        // Crear el contenedor del mensaje
        this.messageElement = document.createElement('div');
        this.messageElement.id = "pong-message";
        this.messageElement.style.position = 'absolute';
        this.messageElement.style.top = '20%';
        this.messageElement.style.left = '50%';
        this.messageElement.style.transform = 'translate(-50%, -50%)';
        this.messageElement.style.fontSize = '24px';
        this.messageElement.style.color = '#0000FF';
        document.getElementById('main').insertAdjacentElement('afterbegin', this.messageElement);
    }

    showMessage(text, color = '#0000FF') {
        if (!this.messageElement) {
            this.createMessageElement(); // Crear el elemento si no existe
        }
        this.messageElement.style.color = color;
        this.messageElement.style.display = '';
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
    constructor() {

        this.messageManager = new MessageManager();

        // Configuración de dificultad
        this.difficulty = 'easy'; // Puedes ajustar esto para 'easy', 'medium', 'hard'
        this.difficultySettings = {
            easy: 0.5,
            medium: 1,
            hard: 2
        };
        this.initialSpeed = this.difficultySettings[this.difficulty];

        // Ajustar dificultad de la máquina
        this.aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
        this.aiDifficultySettings = {
            easy: 0.5,   // velocidad de la máquina
            medium: 1,   // velocidad de la máquina
            hard: 1.5    // velocidad de la máquina
        };
        this.aiSpeed = this.aiDifficultySettings[this.aiDifficulty];

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
        this.soloPlay = sessionStorage.getItem('modoJuego') === 'solo';

        // Entradas del teclado
        this.wKey = { isPressed: false };
        this.sKey = { isPressed: false };
        this.upKey = { isPressed: false };
        this.downKey = { isPressed: false };

        // Variables de juego
        this.speed = 0.5;  // Velocidad de movimiento de las palas
        this.speedIncrement = 0.02; // Incremento de velocidad de la pelota en cada colisión
        this.boundaryMargin = 5; // Margen para detectar cuando la pelota sale del campo

        // Inicializa las palas
        this.paddle1 = new Paddle(-10, 20); // Ejemplo de posición x para la pala 1
        this.paddle2 = new Paddle(10, 20);   // Ejemplo de posición x para la pala 2

        this.isGameStarted = false; // Nuevo estado para saber si el juego ha comenzado

        this.winScore = 1; // Goles necesarios para ganar
    }
    
    start() {
        // Aquí puedes inicializar el juego
        this.init(); // Llamar al método init para configurar el juego
    }

    exitGame() {
        this.isGameStarted = false;
        // Función para salir del juego y volver al menú anterior
        const exitMessage = confirm("¿Estás seguro de que quieres salir del juego?");
        if (exitMessage) {
            // Aquí puedes redirigir al menú anterior, por ejemplo:
            window.location.href = "menu.html";  // Cambiar la URL al menú o página anterior
        }
    }

    init() {

        // TEMP
        document.getElementsByTagName( 'header' )?.[0].setAttribute( "style", "display:none;" );

        this.scene = new THREE.Scene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createObjects();

        // Crear el marcador
        this.createScoreboard();

        // Configurar los event listeners
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        window.addEventListener('keyup', this.handleKeyup.bind(this));

        this.messageManager.showMessage("Presiona cualquier tecla para comenzar");
        this.gameLoop();
    }

    startGame() {

        if (!this.isGameStarted) {
            this.messageManager.hideMessage(); // Ocultar el mensaje de inicio
            this.isGameStarted = true;  // Marcar que el juego ha comenzado
            // Restablecer posiciones de las palas
            this.paddle1.resetPosition();
            this.paddle2.resetPosition();
            his.initialSpeed = this.difficultySettings[this.difficulty];
            this.gameLoop();            // Iniciar el bucle del juego
        }
    }

    exitGame() {
        // Función para salir del juego y volver al menú anterior
        const exitMessage = confirm("¿Estás seguro de que quieres salir del juego?");
        if (exitMessage) {
            // Aquí puedes redirigir al menú anterior, por ejemplo:
            window.location.href = "/";  // Cambiar la URL al menú o página anterior
        }
    }

    endGame(winnerMessage) {
        this.isGameStarted = false;
    
        // Mostrar mensaje de fin de juego
        this.messageManager.showMessage(`${winnerMessage}<br>Presiona 'R' para volver a jugar o ESC para salir.`, '#FF0000');
    }

    resetGame() {

        // Limpiar el mensaje de fin de juego
        document.getElementById("pong-message").innerHTML = ''; // Asegúrate de eliminar el mensaje
    
        // Reiniciar puntajes y estado del juego
        this.paddle1.score = 0;
        this.paddle2.score = 0;
        this.updateScoreboard(); // Asegurarte de que el marcador se reinicie
        this.isGameStarted = false; // Marcar el juego como no iniciado
        // Mostrar el mensaje de inicio
        this.messageManager.showMessage("Presiona cualquier tecla para comenzar");
     }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, // Campo de visión (FOV)
            window.innerWidth / window.innerHeight, // Relación de aspecto
            1, // Plano cercano
            1000 // Plano lejano
        );
    
        // Ajustar la posición de la cámara
        this.camera.position.set(20, 70, 70); // Colocarla en una posición elevada
        this.camera.lookAt(0, 0, 0); // Mirar hacia el centro del campo
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.screenWidth, this.screenHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.setClearColor(0xfaf0e6);

        // Establecer el color de fondo del body
        document.body.style.backgroundColor = '#faf0e6';

        const main = document.getElementById("main");
        if (main) {
            main.appendChild(this.renderer.domElement);
        } else {
            console.error("No se encontró el elemento con id 'main'. Asegúrate de que exista en tu HTML.");
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
        this.walls = new Walls(this.fieldWidth, this.fieldHeight, this.wallHeight, this.wallThickness);
        this.scene.add(this.walls.topWall);
        this.scene.add(this.walls.bottomWall);

        // Crear la línea central
        this.createCenterLine();
    }

    createCenterLine() {
        const lineGeometry = new THREE.BufferGeometry();
        const lineVertices = new Float32Array([
            0, 0, this.fieldHeight / 2,
            0, 0, -this.fieldHeight / 2
        ]);
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineVertices, 3));
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
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
        console.log( event.key );
        if (!this.isGameStarted) {
            // Si el juego no ha comenzado, permite iniciar el juego
            if (event.key === 'Escape')
                this.exitGame(); // Salir del juego
            else if ( event.key === 'r' )
                this.resetGame(); // Reiniciar el juego
            else 
                this.startGame(); // Iniciar el juego

        } else {
            switch (event.key) {
                case 'ArrowUp':
                    this.upKey.isPressed = true;
                    event.preventDefault(); // Evitar el scroll de la pantalla
                    break;
                case 'ArrowDown':
                    this.downKey.isPressed = true;
                    event.preventDefault(); // Evitar el scroll de la pantalla
                    break;
                case 'w':
                    this.wKey.isPressed = true;
                    event.preventDefault(); // Evitar el scroll de la pantalla
                    break;
                case 's':
                    this.sKey.isPressed = true;
                    event.preventDefault(); // Evitar el scroll de la pantalla
                    break;
                case 'Escape': // Detectar si se presiona 'ESC'
                    this.exitGame();  // Llamar a la función para salir del juego
                    break;

            }
        }
    }

    handleKeyup(event) {
        switch (event.key) {
            case 'ArrowUp':
                this.upKey.isPressed = false;
                break;
            case 'ArrowDown':
                this.downKey.isPressed = false;
                break;
            case 'w':
                this.wKey.isPressed = false;
                break;
            case 's':
                this.sKey.isPressed = false;
                break;
        }
    }

    createScoreboard() {
        // Crear el contenedor del marcador
        this.scoreboard = document.createElement('div');
        this.scoreboard.id = 'scoreboard';
        this.scoreboard.style.position = 'absolute';
        this.scoreboard.style.top = '10px';
        this.scoreboard.style.left = '50%';
        this.scoreboard.style.transform = 'translateX(-50%)';
        this.scoreboard.style.fontSize = '24px';
        this.scoreboard.style.color = '#FFFFFF';
        this.scoreboard.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Fondo semi-transparente
        this.scoreboard.style.padding = '10px';
        this.scoreboard.style.borderRadius = '5px';
        document.body.appendChild(this.scoreboard);
    
        // Inicializar el marcador
        this.updateScoreboard();
    }

    updateScoreboard() {
        // Actualizar el marcador con los puntajes actuales
        this.scoreboard.innerHTML = `Jugador 1: ${this.paddle1.score} | Jugador 2: ${this.paddle2.score}`;
    }

    collision(ball, paddle) {
        const ballBox = new THREE.Box3().setFromObject(ball.mesh);
        const paddleBox = new THREE.Box3().setFromObject(paddle.mesh);
        return ballBox.intersectsBox(paddleBox);
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
        } else if (this.ball.mesh.position.z - ballRadius <= -this.fieldHeight / 2) {
            this.ball.bounceY();
            this.ball.mesh.position.z = -this.fieldHeight / 2 + ballRadius;
            this.ball.increaseSpeed(this.speedIncrement);
        }

        // Colisiones con las palas
        if (this.collision(this.ball, this.paddle1)) {
            this.ball.bounceX();
            this.ball.mesh.position.x = this.paddle1.mesh.position.x + (ballRadius + this.paddle1.width / 2);
            this.ball.increaseSpeed(this.speedIncrement);
        }

        if (this.collision(this.ball, this.paddle2)) {
            this.ball.bounceX();
            this.ball.mesh.position.x = this.paddle2.mesh.position.x - (ballRadius + this.paddle2.width / 2);
            this.ball.increaseSpeed(this.speedIncrement);
        }

        // Comprobar si la pelota salió del campo
        if (this.ball.mesh.position.x - ballRadius <= -this.fieldWidth / 2 - this.boundaryMargin) {
            if (!this.collision(this.ball, this.paddle1)) {
                this.ball.resetPosition();
                this.paddle2.score++;
                this.updateScoreboard(); // Actualizar el marcador
            }
        } else if (this.ball.mesh.position.x + ballRadius >= this.fieldWidth / 2 + this.boundaryMargin) {
            if (!this.collision(this.ball, this.paddle2)) {
                this.ball.resetPosition();
                this.paddle1.score++;
                this.updateScoreboard(); // Actualizar el marcador
            }
        }

        // Verificar si algún jugador ha alcanzado el puntaje de victoria
        if (this.paddle1.score >= this.winScore) {
            this.endGame('Jugador 1 gana!');
        } else if (this.paddle2.score >= this.winScore) {
            this.endGame('Jugador 2 gana!');
        }

        // Mover las palas
        this.movePaddle(this.paddle1, this.upKey.isPressed, this.downKey.isPressed);
        if (this.soloPlay) {
            this.updateComPaddle();
        } else {
            this.movePaddle(this.paddle2, this.wKey.isPressed, this.sKey.isPressed);
        }
    }

    updateComPaddle() {
        const distanceToBall = this.ball.mesh.position.z - this.paddle2.mesh.position.z;

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
        }
        this.render();  // Asegúrate de seguir renderizando aunque el juego no haya comenzado
        requestAnimationFrame(this.gameLoop.bind(this));
    }

}

// Clase para las palas
class Paddle {
    constructor(xPosition, fieldHeight) {
        const paddleGeometry = new THREE.BoxGeometry(2, 2, 10);
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
            minZ + this.depth / 2
        );
    }

    resetPosition() {
        this.mesh.position.copy(this.initialPosition); // Restablecer la posición inicial
    }
}

// Clase para la pelota
class Ball {
    constructor(initialSpeed) {
        const ballRadius = 0.5;
        const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
        const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        this.mesh = new THREE.Mesh(ballGeometry, ballMaterial);
        this.initialSpeed = initialSpeed;
        this.speed = initialSpeed;
        this.resetPosition();
    }

    resetPosition() {
        this.mesh.position.set(0, 3, 0);
        const randomDirectionX = Math.random() < 0.5 ? 1 : -1;
        const randomDirectionZ = Math.random() < 0.5 ? 1 : -1;
        this.velocityX = randomDirectionX * this.initialSpeed;
        this.velocityY = randomDirectionZ * this.initialSpeed;
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
        this.velocityX += (this.velocityX > 0 ? amount : -amount);
        this.velocityY += (this.velocityY > 0 ? amount : -amount);
    }
}

// Clase para el campo
class Field {
    constructor(width, height) {
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide });
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Rotar el campo para que esté alineado con la vista
        this.mesh.rotation.x = -Math.PI / 2; // Girar el campo para que esté recto
        this.mesh.position.y = 0;
    }
}

// Clase para los muros
class Walls {
    constructor(fieldWidth, fieldHeight, wallHeight, wallThickness) {
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

        // Muro superior
        const topWallGeometry = new THREE.BoxGeometry(fieldWidth, wallThickness, wallThickness);
        this.topWall = new THREE.Mesh(topWallGeometry, wallMaterial);
        this.topWall.position.set(0, wallHeight / 2, fieldHeight / 2 + wallThickness / 2);

        // Muro inferior
        const bottomWallGeometry = new THREE.BoxGeometry(fieldWidth, wallThickness, wallThickness);
        this.bottomWall = new THREE.Mesh(bottomWallGeometry, wallMaterial);
        this.bottomWall.position.set(0, wallHeight / 2, -fieldHeight / 2 - wallThickness / 2);
    }
}

// Modificar el listener del botón para que llame a esta función
document.getElementById("pong-play-btn")?.addEventListener("click", (event) => {
    event.preventDefault();
    // Iniciar el juego
    const game = new Game();
    document.getElementById('main').innerHTML = ""; // Limpiar el contenedor principal
    game.start();  // Llamar al nuevo método start
});