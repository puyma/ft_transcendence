import * as THREE from 'three';

// Define un nivel de dificultad (por ejemplo, 'fácil', 'medio', 'difícil')
const difficulty = 'medium';  // Puedes ajustar esto para 'easy', 'medium', 'hard'

// Configura las velocidades para cada nivel de dificultad
const difficultySettings = {
    easy: 0.5,     // Velocidad baja
    medium: 1,     // Velocidad media
    hard: 2        // Velocidad alta
};

// Obtén la velocidad en función de la dificultad
const initialSpeed = difficultySettings[difficulty];

const ballHeight = 2; // Radio de la pelota
const wallHeight = ballHeight * 2; // Las paredes serán el doble de altas que la pelota
const wallThickness = 1; // Grosor de los muros

let scene, camera, renderer, paddle1, paddle2, ball;
const soloPlay = sessionStorage.getItem('modoJuego') === 'solo';

// Variables para controlar el tamaño de la pantalla, el campo y la cámara
let screenWidth = window.innerWidth;   // Puedes cambiar el tamaño de la pantalla aquí
let screenHeight = window.innerHeight; // Puedes cambiar el tamaño de la pantalla aquí

let fieldWidth = 100;  // Tamaño del campo de juego (ancho)
let fieldHeight = 50; // Tamaño del campo de juego (alto)

// Parámetros de la cámara ortográfica
let cameraLeft = -fieldWidth / 2;
let cameraRight = fieldWidth / 2;
let cameraTop = fieldHeight / 2;
let cameraBottom = -fieldHeight / 2;

let cameraPosition = { x: 150, y: 50, z: 150 };  // Posición de la cámara (puedes modificar estos valores)

// Inicializamos la escena, la cámara y el renderizador
function init() {
    scene = new THREE.Scene();

    // Cámara ortográfica
    camera = new THREE.OrthographicCamera(
        cameraLeft,   // left
        cameraRight,  // right
        cameraTop,    // top
        cameraBottom, // bottom
        0.1,          // near
        1000          // far
    );

    // Posición de la cámara para una vista isométrica tradicional
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    
    // Rotación isométrica clásica (45 grados en X y Y)
    camera.rotation.set(Math.PI / 12, Math.PI / 4, 0);
    
    camera.lookAt(0, 0, 0);  // Apunta al centro del campo

    // Crear el renderizador
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(screenWidth, screenHeight);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const main = document.getElementById("main");
    if (main) {
        main.appendChild(renderer.domElement);
    } else {
        console.error("No se encontró el elemento con id 'main'. Asegúrate de que exista en tu HTML.");
    }

    // Luz
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 50, 50);
    scene.add(directionalLight);

    createField();
    createPaddles();
    createBall();
    createSideWalls();
}

// Redimensionar el renderizador al cambiar el tamaño de la ventana
function resizeCanvas() {
    screenWidth = window.innerWidth;  // Actualiza el ancho
    screenHeight = window.innerHeight; // Actualiza el alto
    renderer.setSize(screenWidth, screenHeight);
    camera.left = -fieldWidth / 2;
    camera.right = fieldWidth / 2;
    camera.top = fieldHeight / 2;
    camera.bottom = -fieldHeight / 2;
    camera.aspect = screenWidth / screenHeight;
    camera.updateProjectionMatrix();
}

window.addEventListener('resize', resizeCanvas);

// Crear el campo de juego
function createField() {
    const geometry = new THREE.PlaneGeometry(fieldWidth, fieldHeight);  // Tamaño dinámico del campo
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const field = new THREE.Mesh(geometry, material);
    // Rotar el campo en diferentes ángulos
    field.rotation.x = -Math.PI / 2;  // Campo horizontal
    // field.rotation.x = -Math.PI / 2; // Campo horizontal
    // field.rotation.y = Math.PI / 4;  // Rotación adicional alrededor del eje Y
    // field.rotation.z = Math.PI / 6;  // Rotación adicional alrededor del eje Z
    scene.add(field);
}

// Crear los muros laterales
function createSideWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 }); // Material para los muros

    // Pared superior
    const topWallGeometry = new THREE.BoxGeometry(fieldWidth, wallThickness, wallThickness);
    const topWall = new THREE.Mesh(topWallGeometry, wallMaterial);
    topWall.position.set(0, wallHeight / 2, fieldHeight / 2 + wallThickness / 2); // Posicionar en el borde superior

    // Pared inferior
    const bottomWallGeometry = new THREE.BoxGeometry(fieldWidth, wallThickness, wallThickness);
    const bottomWall = new THREE.Mesh(bottomWallGeometry, wallMaterial);
    bottomWall.position.set(0, wallHeight / 2, -fieldHeight / 2 - wallThickness / 2); // Posicionar en el borde inferior

    // Añadir los muros a la escena
    scene.add(topWall);
    scene.add(bottomWall);
}

// Crear los paddles
function createPaddles() {
    const paddleGeometry = new THREE.BoxGeometry(2, 2, 5);  // Ajustar el ancho de las palas
    const paddleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

    // Paddle 1 (izquierda)
    // Colocamos la pala de forma que su borde derecho coincida con el borde izquierdo del campo
    paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle1.position.set(-fieldWidth / 2 + paddleGeometry.parameters.width / 2, 1.5, 0);  // Ajuste del borde izquierdo
    scene.add(paddle1);

    // Paddle 2 (derecha)
    // Colocamos la pala de forma que su borde izquierdo coincida con el borde derecho del campo
    paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle2.position.set(fieldWidth / 2 - paddleGeometry.parameters.width / 2, 1.5, 0);  // Ajuste del borde derecho
    scene.add(paddle2);
}

// Crear la bola
function createBall() {
    const ballRadius = 0.5; // Ajusta el radio de la pelota aquí
    const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);
    resetBall();
}

// Resetear la posición de la bola
function resetBall() {
    ball.position.set(0, 3, 0);  // Colocar la pelota en el centro del campo

    // Asignar una velocidad inicial aleatoria (positivo o negativo)
    const randomDirectionX = Math.random() < 0.5 ? 1 : -1;  // Aleatorio: 1 o -1
    const randomDirectionZ = Math.random() < 0.5 ? 1 : -1;  // Aleatorio: 1 o -1

    // Velocidad ajustada
    ball.velocityX = randomDirectionX * initialSpeed;  // Velocidad en X basada en dificultad
    ball.velocityY = randomDirectionZ * initialSpeed;  // Velocidad en Z basada en dificultad
    ball.speed = initialSpeed;  // Velocidad total basada en dificultad
}

// Colisiones con el paddle
function collision(b, p) {
    const ballBox = new THREE.Box3().setFromObject(b);
    const paddleBox = new THREE.Box3().setFromObject(p);
    return ballBox.intersectsBox(paddleBox);
}

const wKey = { isPressed: false };
const sKey = { isPressed: false };
// Definir las teclas de control
const upKey = { isPressed: false };
const downKey = { isPressed: false };

// Función para manejar el teclado
function handleKeydown(event) {
    switch (event.key) {
        case 'ArrowUp':
            upKey.isPressed = true;
            break;
        case 'ArrowDown':
            downKey.isPressed = true;
            break;
        case 'w':
            wKey.isPressed = true;
            break;
        case 's':
            sKey.isPressed = true;
            break;
    }
}

function handleKeyup(event) {
    switch (event.key) {
        case 'ArrowUp':
            upKey.isPressed = false;
            break;
        case 'ArrowDown':
            downKey.isPressed = false;
            break;
        case 'w':
            wKey.isPressed = false;
            break;
        case 's':
            sKey.isPressed = false;
            break;
    }
}

// Lógica para actualizar el juego
const speed = 0.5;  // Ajusta la velocidad de movimiento de la pala aquí
// Función para mover las palas del jugador
function movePaddle(paddle, moveUp, moveDown) {
    if (moveUp) {
        paddle.position.z += paddleSpeed;
    }
    if (moveDown) {
        paddle.position.z -= paddleSpeed;
    }
    
    // Asegúrate de que la pala no atraviese los muros laterales
    paddle.position.z = Math.max(Math.min(paddle.position.z, fieldHeight / 2 - paddle.geometry.parameters.depth / 2), -fieldHeight / 2 + paddle.geometry.parameters.depth / 2);
}

const boundaryMargin = 5; // Margen adicional para superar los límites del campo

function update() {
    // Actualizar la posición de la pelota
    ball.position.x += ball.velocityX;
    ball.position.z += ball.velocityY;

    // Definir el radio de la pelota para los cálculos de rebote
    const ballRadius = ball.geometry.parameters.radius;

    // Rebote en los bordes superiores e inferiores del campo
    if (ball.position.z >= fieldHeight / 2 - ballRadius - boundaryMargin) {
        ball.velocityY = -ball.velocityY;
        ball.position.z = fieldHeight / 2 - ballRadius - boundaryMargin; // Asegúrate de que la pelota no atraviese el borde
    } else if (ball.position.z <= -fieldHeight / 2 + ballRadius + boundaryMargin) {
        ball.velocityY = -ball.velocityY;
        ball.position.z = -fieldHeight / 2 + ballRadius + boundaryMargin; // Asegúrate de que la pelota no atraviese el borde
    }

    // Colisiones con las palas
    if (collision(ball, paddle1)) {
        ball.velocityX = -ball.velocityX;
        ball.position.x = paddle1.position.x + (ballRadius + paddle1.geometry.parameters.width / 2);
    }

    if (collision(ball, paddle2)) {
        ball.velocityX = -ball.velocityX;
        ball.position.x = paddle2.position.x - (ballRadius + paddle2.geometry.parameters.width / 2);
    }

    // Comprobar si la pelota se ha ido fuera del campo
    if (ball.position.x <= -fieldWidth / 2 - ballRadius - boundaryMargin) {
        // La pelota se ha ido por el lado izquierdo y no colisionó con la pala
        if (!collision(ball, paddle1)) {
            resetBall();
            paddle2.score++;
        }
    } else if (ball.position.x >= fieldWidth / 2 + ballRadius + boundaryMargin) {
        // La pelota se ha ido por el lado derecho y no colisionó con la pala
        if (!collision(ball, paddle2)) {
            resetBall();
            paddle1.score++;
        }
    }

    // Mueve las palas solo si la pelota no está fuera del campo
    movePaddle(paddle1, upKey.isPressed, downKey.isPressed);
    movePaddle(paddle2, wKey.isPressed, sKey.isPressed);
}

// Manejo de eventos de teclado
window.addEventListener('keydown', handleKeydown);
window.addEventListener('keyup', handleKeyup);

// Velocidad de movimiento de las palas
const paddleSpeed = 2;

// Actualizar las palas
function updatePaddles() {
    // Mueve la pala del jugador (paddle1) con las teclas 'ArrowUp' y 'ArrowDown'
    movePaddle(paddle1, upKey.isPressed, downKey.isPressed);

    // Mueve la pala de la IA (paddle2) con las teclas 'W' y 'S'
    movePaddle(paddle2, wKey.isPressed, sKey.isPressed);

    // if (soloPlay) {
    //     updatePaddles();  // Actualiza la pala de la IA si estás en modo solo
    // }
}

function updateComPaddle() {
    // Lógica básica para la IA:
    // Mover la pala de la IA hacia la pelota en el eje Z (vertical).

    // Diferencia en la posición Z entre la pelota y la pala de la IA
    const distanceToBall = ball.position.z - paddle2.position.z;

    // Ajusta la velocidad de la IA según la dificultad
    const aiSpeed = 0.5 * initialSpeed;  // Puedes ajustar esto si deseas más dificultad

    if (distanceToBall > 0) {
        // Si la pelota está por encima de la pala de la IA, mover la pala hacia arriba
        paddle2.position.z += aiSpeed;
    } else {
        // Si la pelota está por debajo de la pala de la IA, mover la pala hacia abajo
        paddle2.position.z -= aiSpeed;
    }

    // Limitar el movimiento de la pala para que no atraviese los muros laterales
    paddle2.position.z = Math.max(Math.min(paddle2.position.z, fieldHeight / 2 - paddle2.geometry.parameters.depth / 2), -fieldHeight / 2 + paddle2.geometry.parameters.depth / 2);
}

function render() {
    renderer.render(scene, camera);
}

function gameLoop() {
    update();  // Actualiza la posición de la pelota y la lógica del juego
    updatePaddles();  // Mueve las palas según las teclas del teclado
    if (soloPlay) {
        updateComPaddle();  // Actualiza la pala de la IA si estás en modo solo
    }
    render();  // Renderiza la escena
    requestAnimationFrame(gameLoop);  // Solicita el siguiente frame
}

init();
gameLoop();
