import * as THREE from "three";
import {Router} from "./router"

export class MessageManager {
  constructor() {
    this.messageElement = null;
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
      this.createMessageElement();
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

class Game {
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.messageManager = new MessageManager();

    this.initialSpeed = 0.5
    this.aiSpeed = 1;
    this.speed = 1; 
    this.speedIncrement = 0.02;

    this.ballHeight = 2;
    this.wallHeight = this.ballHeight * 2;
    this.wallThickness = 1;
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.fieldWidth = 150;
    this.fieldHeight = 75;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.paddle1 = null;
    this.paddle2 = null;
    this.ball = null;
    this.field = null;
    this.walls = null;

    this.wKey = { isPressed: false };
    this.sKey = { isPressed: false };
    this.upKey = { isPressed: false };
    this.downKey = { isPressed: false };

    this.boundaryMargin = 5;

    this.paddle1 = new Paddle(-10, 20);
    this.paddle2 = new Paddle(10, 20); 

    this.isGameStarted = false;

    this.winner = "";
    this.loser = "";
    this.winScore = 3;
    this.winner_points = "";
    this.loser_points = "";
  }

  exitGame() {
    this.isGameStarted = false

    const exitMessage = confirm(
      "Are you sure you want to exit the game?",
    );
    if (exitMessage) {
      Router.get("/");
    }
  }

  init() {
    document
      .getElementsByTagName("header")?.[0]
      ?.classList.add("d-none");

    this.scene = new THREE.Scene();
    this.createCamera();
    this.createRenderer();
    this.createLights();
    this.createObjects();

    this.createScoreboard();

    window.addEventListener("resize", this.resizeCanvas.bind(this));
    window.addEventListener("keydown", this.handleKeydown.bind(this));
    window.addEventListener("keyup", this.handleKeyup.bind(this));

    this.messageManager.showMessage(`¡Welcome ${this.player1}! You will play against ${this.player2}.Press any key to start`);
  }

  startGame() {
    if (!this.isGameStarted) {
      this.messageManager.hideMessage();
      this.isGameStarted = true;
      this.paddle1.resetPosition();
      this.paddle2.resetPosition();
      this.ball.resetPosition();

      this.gameLoop();
    }
  }

  endGame(winnerMessage) {
    this.isGameStarted = false;

    this.winner = this.paddle1.score >= this.paddle2.score ? this.player1 : this.player2;
    this.loser = this.paddle1.score < this.paddle2.score ? this.player1 : this.player2;
    this.winner_points = this.paddle1.score >= this.paddle2.score ? this.paddle1.score : this.paddle2.score;
    this.loser_points = this.paddle1.score < this.paddle2.score ? this.paddle1.score : this.paddle2.score;

    this.messageManager.showMessage(
      `${winnerMessage}<br>Press 'R' to play again or ESC to exit the game.`,
      "#FFFFFF",
    );
    const csrfToken = getCSRFToken();
    fetch("/tresD/play/save_match/", {
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
    
    document.getElementById("pong-message").innerHTML = "";

    this.paddle1.score = 0;
    this.paddle2.score = 0;
    this.updateScoreboard();
    this.isGameStarted = true;
    this.ball.resetPosition();
    this.paddle1.resetPosition();
    this.paddle2.resetPosition();
    this.messageManager.hideMessage();
    this.gameLoop();
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000,
    );

    this.camera.position.set(20, 70, 70); 
    this.camera.lookAt(0, 0, 0);
  }
  
  /*
  createScoreboard() {
    this.scoreboard = document.createElement("div");
    this.scoreboard.id = "scoreboard";
    this.scoreboard.style.position = "absolute";
    this.scoreboard.style.top = "10px";
    this.scoreboard.style.left = "50%";
    this.scoreboard.style.transform = "translateX(-50%)";
    this.scoreboard.style.fontSize = "32px";
    this.scoreboard.style.color = "#FFD700";
    this.scoreboard.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.8), 0px 0px 10px rgba(255, 215, 0, 0.7)";
    this.scoreboard.style.background = "linear-gradient(145deg, rgba(50, 50, 50, 0.8), rgba(0, 0, 0, 0.5))";
    this.scoreboard.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.2)";
    this.scoreboard.style.padding = "15px";
    this.scoreboard.style.borderRadius = "10px";
    this.scoreboard.style.fontFamily = "Arial, sans-serif";
    this.scoreboard.style.textAlign = "center";
	document.body.appendChild(
    //document.body.appendChild(this.scoreboard);

    this.updateScoreboard();
  }
  */

  createRenderer() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.screenWidth, this.screenHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        '/static/assets/textures/textura.jpg',
        (texture) => {
            this.scene.background = texture;
        },
        undefined,
        (error) => {
            console.error('Error al cargar la textura de fondo:', error);
        }
    );

    //document.body.style.backgroundColor = "#faf0e6";

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
    this.field = new Field(this.fieldWidth, this.fieldHeight);
    this.scene.add(this.field.mesh);

    this.paddle1 = new Paddle(-this.fieldWidth / 2 + 1, this.fieldHeight);
    this.paddle2 = new Paddle(this.fieldWidth / 2 - 1, this.fieldHeight);
    this.scene.add(this.paddle1.mesh);
    this.scene.add(this.paddle2.mesh);

    this.ball = new Ball(this.initialSpeed);
    this.scene.add(this.ball.mesh);

    this.walls = new Walls(
      this.fieldWidth,
      this.fieldHeight,
      this.wallHeight,
      this.wallThickness,
    );
    this.scene.add(this.walls.topWall);
    this.scene.add(this.walls.bottomWall);

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
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;

    this.renderer.setSize(this.screenWidth, this.screenHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const aspectRatio = this.screenWidth / this.screenHeight;

    this.camera.aspect = aspectRatio;

    this.camera.updateProjectionMatrix();
  }

  handleKeydown(event) {
    console.log(event.key);
    if (!this.isGameStarted) {
      if (event.key === "Escape")
        this.exitGame();
      else if (event.key === "r")
        this.resetGame();
      else this.startGame();
    } else {
      switch (event.key) {
        case "w":
          this.wKey.isPressed = true;
          event.preventDefault();
          break;
        case "s":
          this.sKey.isPressed = true;
          event.preventDefault();
          break;
        case "Escape":
          this.exitGame();
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
    this.scoreboard = document.createElement("div");
    this.scoreboard.id = "scoreboard";
    this.scoreboard.style.position = "absolute";
    this.scoreboard.style.top = "10px";
    this.scoreboard.style.left = "50%";
    this.scoreboard.style.transform = "translateX(-50%)";
    this.scoreboard.style.fontSize = "32px";
    this.scoreboard.style.color = "#FFD700"; // Oro brillante
    this.scoreboard.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.8), 0px 0px 10px rgba(255, 215, 0, 0.7)";
    this.scoreboard.style.background = "linear-gradient(145deg, rgba(50, 50, 50, 0.8), rgba(0, 0, 0, 0.5))";
    this.scoreboard.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.2)";
    this.scoreboard.style.padding = "15px";
    this.scoreboard.style.borderRadius = "10px";
    this.scoreboard.style.fontFamily = "Arial, sans-serif";
    this.scoreboard.style.textAlign = "center";
    window.document.getElementsByTagName('main')[0].insertAdjacentElement('afterbegin', this.scoreboard);

    this.updateScoreboard();
  }

  updateScoreboard() {
    this.scoreboard.innerHTML = `${this.player1} : ${this.paddle1.score} | ${this.player2} ${this.paddle2.score}`;
  }

  collision(ball, paddle) {
    const ballBox = new THREE.Box3().setFromObject(ball.mesh);
    const paddleBox = new THREE.Box3().setFromObject(paddle.mesh);
    return ballBox.intersectsBox(paddleBox);
  }

  getCollisionAngle(ball, paddle) {
    const ballRadius = ball.mesh.geometry.parameters.radius || 0;
    const paddleHeight = paddle.height || 1;
    const paddleCenterZ = paddle.mesh.position.z || 0;
    const ballPositionZ = ball.mesh.position.z || 0;
  }

  getCollisionAngle(ball, paddle) {
    const ballRadius = ball.mesh.geometry.parameters.radius;
    const paddleHeight = paddle.height;
    const paddleCenter = paddle.mesh.position.z;
  
    const ballPosition = ball.mesh.position.z;
  
    const distanceFromCenter = ballPosition - paddleCenter;
  
    const normalizedDistance = distanceFromCenter / (paddleHeight / 2);
  
    const maxAngle = Math.PI / 4;
    const angle = normalizedDistance * maxAngle;
  
    return angle;
  }

  movePaddle(paddle, moveUp, moveDown) {
    if (moveUp) {
      paddle.moveDown(this.speed);
    }
    if (moveDown) {
      paddle.moveUp(this.speed);
    }
    paddle.limitPosition(-this.fieldHeight / 2, this.fieldHeight / 2);
  }

  update() {
    this.ball.updatePosition();

    const ballRadius = this.ball.mesh.geometry.parameters.radius;

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

    if (this.collision(this.ball, this.paddle1)) {
      const angle = this.getCollisionAngle(this.ball, this.paddle1);
      this.ball.bounceX(angle);
      this.ball.mesh.position.x =
        this.paddle1.mesh.position.x + (ballRadius + this.paddle1.width / 2);
      this.ball.increaseSpeed(this.speedIncrement);
    }
  
    if (this.collision(this.ball, this.paddle2)) {
      const angle = this.getCollisionAngle(this.ball, this.paddle2);
      this.ball.bounceX(angle);
      this.ball.mesh.position.x =
        this.paddle2.mesh.position.x - (ballRadius + this.paddle2.width / 2);
      this.ball.increaseSpeed(this.speedIncrement);
    }

    if (
      this.ball.mesh.position.x - ballRadius <=
      -this.fieldWidth / 2 - this.boundaryMargin
    ) {
      if (!this.collision(this.ball, this.paddle1)) {
        this.ball.resetPosition();
        this.paddle2.score++;
        this.updateScoreboard();
      }
    } else if (
      this.ball.mesh.position.x + ballRadius >=
      this.fieldWidth / 2 + this.boundaryMargin
    ) {
      if (!this.collision(this.ball, this.paddle2)) {
        this.ball.resetPosition();
        this.paddle1.score++;
        this.updateScoreboard(); 
      }
    }

    if (this.paddle1.score >= this.winScore) {
      this.endGame(`${this.player1} wins!`);
    } else if (this.paddle2.score >= this.winScore) {
      this.endGame(`${this.player2} wins!`);
    }

    this.movePaddle(this.paddle1, this.wKey.isPressed, this.sKey.isPressed);
    this.updateComPaddle();
  }

  updateComPaddle() {
    const distanceToBall = this.ball.mesh.position.z - this.paddle2.mesh.position.z;

    const isBallTouchedByPlayer = this.ball.velocityX > 0;

    let finalPredictedPosition = this.ball.mesh.position.z;

    if (isBallTouchedByPlayer) {
        const timeToImpact = Math.abs(this.ball.mesh.position.z - this.paddle2.mesh.position.z) / (Math.abs(this.ball.velocityY) + Math.abs(this.ball.velocityX)); // Calcular el tiempo de impacto

        const predictedPosition = this.ball.mesh.position.z + this.ball.velocityY * timeToImpact;

        const errorMargin = Math.random() * 0.01 * (1 - Math.abs(this.ball.velocityX) * 0.02);
        finalPredictedPosition = predictedPosition + errorMargin;

        const reactionDistance = 6 + Math.abs(this.ball.velocityX) * 0.7;

        const closeEnoughToTouch = Math.abs(finalPredictedPosition - this.paddle2.mesh.position.z) < reactionDistance * 1.5; // Aumenta la zona de reacción si está cerca

        if (closeEnoughToTouch) {
            if (finalPredictedPosition > this.paddle2.mesh.position.z) {
                this.paddle2.moveUp(this.aiSpeed);
            } else {
                this.paddle2.moveDown(this.aiSpeed);
            }
        } else {
            if (Math.abs(finalPredictedPosition - this.paddle2.mesh.position.z) < reactionDistance) {
                if (finalPredictedPosition > this.paddle2.mesh.position.z) {
                    this.paddle2.moveUp(this.aiSpeed);
                } else {
                    this.paddle2.moveDown(this.aiSpeed);
                }
            }
        }
    }

    this.paddle2.limitPosition(-this.fieldHeight / 2, this.fieldHeight / 2);

    if (this.ball.velocityX < 0) {
        this.paddle2.mesh.position.z = this.paddle2.mesh.position.z; 
    }

    if (isBallTouchedByPlayer) {
        const adjustedPrediction = finalPredictedPosition * 1.05;
        if (adjustedPrediction > this.paddle2.mesh.position.z) {
            this.paddle2.moveUp(this.aiSpeed);
        } else {
            this.paddle2.moveDown(this.aiSpeed);
        }
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  gameLoop() {
    if (this.isGameStarted) {
      this.update();
      this.render();
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }
}

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

    this.initialPosition = this.mesh.position.clone();
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
    this.mesh.position.copy(this.initialPosition);
  }
}

class Ball {
  constructor(initialSpeed) {
    const ballRadius = 1;
    const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    this.mesh = new THREE.Mesh(ballGeometry, ballMaterial);

    this.baseSpeed = initialSpeed;
    this.initialSpeed = initialSpeed;
    this.resetPosition();
  }

  resetPosition() {
    this.mesh.position.set(0, 3, 0);

    this.initialSpeed = this.baseSpeed;

    const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;

    const randomDirectionX = Math.cos(angle) * this.baseSpeed;
    const randomDirectionZ = Math.sin(angle) * this.baseSpeed;

    this.velocityX = Math.random() < 0.5 ? randomDirectionX : -randomDirectionX;
    this.velocityY = Math.random() < 0.5 ? randomDirectionZ : -randomDirectionZ;
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

class Field {
  constructor(width, height) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshStandardMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = 0;
  }
}

class Walls {
  constructor(fieldWidth, fieldHeight, wallHeight, wallThickness) {
    const textureLoader = new THREE.TextureLoader();
    
    const wallTexture = textureLoader.load(
      '/static/assets/textures/stone.jpg',
      (texture) => {
        console.log('Textura principal cargada correctamente');
      },
      undefined,
      (error) => {
        console.error('Error al cargar la textura principal:', error);
      }
    );

    const normalMap = textureLoader.load(
      '/static/assets/textures/stone.jpg',
      (texture) => {
        console.log('Normal map cargado correctamente');
      },
      undefined,
      (error) => {
        console.error('Error al cargar el normal map:', error);
      }
    );

    const wallMaterial = new THREE.MeshStandardMaterial({
      map: wallTexture,            
      color: 0x808080,             
      roughness: 0.4,              
      metalness: 0.2,              
      emissive: 0x333333,          
      normalMap: normalMap,        
    });

    const topWallGeometry = new THREE.BoxGeometry(
      fieldWidth,          
      wallThickness * 3,   
      wallHeight * 1     
    );
    this.topWall = new THREE.Mesh(topWallGeometry, wallMaterial);
    this.topWall.position.set(
      0,
      wallHeight / 2 + wallThickness,  
      fieldHeight / 2 + wallThickness  
    );
    this.topWall.castShadow = true;
    this.topWall.receiveShadow = true;

    const bottomWallGeometry = new THREE.BoxGeometry(
      fieldWidth,          
      wallThickness * 3,   
      wallHeight * 1     
    );
    this.bottomWall = new THREE.Mesh(bottomWallGeometry, wallMaterial);
    this.bottomWall.position.set(
      0,
      wallHeight / 2 + wallThickness, 
      -fieldHeight / 2 - wallThickness 
    );
    this.bottomWall.castShadow = true;
    this.bottomWall.receiveShadow = true;

    scene.add(this.topWall);
    scene.add(this.bottomWall);
  }
}

const scene = new THREE.Scene();

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xFFFFFF, 1, 100);
pointLight.position.set(0, 10, 0);
pointLight.castShadow = true;
scene.add(pointLight);

const walls = new Walls(100, 50, 20, 5);

function getCSRFToken() {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return csrfToken || '';
}

const csrfToken = getCSRFToken();

export { Game };
