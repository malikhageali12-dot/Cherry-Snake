
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highscoreElement = document.getElementById("highscore");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const startButton = document.getElementById("start-button");

const gridSize = 25;
const cellSize = 20;

let snake;
let cherry;
let direction;
let nextDirection;
let score = 0;
let highscore = Number(localStorage.getItem("snakeHighscore")) || 0;
let gameRunning = false;
let gameInterval;
let speed = 115;

highscoreElement.textContent = highscore;

const opposite = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

function startGame() {
  clearInterval(gameInterval);

  snake = [
    { x: 12, y: 12 },
    { x: 11, y: 12 },
    { x: 10, y: 12 }
  ];

  direction = "right";
  nextDirection = "right";
  score = 0;
  speed = 115;
  gameRunning = true;

  scoreElement.textContent = score;
  overlay.classList.add("hidden");

  spawnCherry();
  draw();

  gameInterval = setInterval(update, speed);
}

function spawnCherry() {
  do {
    cherry = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  } while (
    snake.some(part => part.x === cherry.x && part.y === cherry.y)
  );
}

function changeDirection(newDirection) {
  if (!gameRunning) return;

  if (opposite[newDirection] === direction) return;

  nextDirection = newDirection;
}

function drawGrid() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      ctx.fillStyle = (x + y) % 2 === 0
        ? "#e8bce8"
        : "#dda9df";

      ctx.fillRect(
        x * cellSize,
        y * cellSize,
        cellSize,
        cellSize
      );
    }
  }
}

function drawSnake() {
  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#168b3b" : "#35b85a";

    ctx.beginPath();
    ctx.roundRect(
      part.x * cellSize + 2,
      part.y * cellSize + 2,
      cellSize - 4,
      cellSize - 4,
      6
    );
    ctx.fill();

    if (index === 0) {
      ctx.fillStyle = "white";

      ctx.beginPath();
      ctx.arc(
        part.x * cellSize + 14,
        part.y * cellSize + 7,
        2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  });
}

// Draw two red cherries with green stems
function drawCherry() {
  const x = cherry.x * cellSize;
  const y = cherry.y * cellSize;

  ctx.strokeStyle = "#347b36";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 9, y + 9);
  ctx.quadraticCurveTo(x + 8, y + 1, x + 14, y + 3);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 14, y + 3);
  ctx.quadraticCurveTo(x + 17, y + 1, x + 17, y + 8);
  ctx.stroke();

  ctx.fillStyle = "#e62952";

  ctx.beginPath();
  ctx.arc(x + 8, y + 12, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + 16, y + 12, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff829b";
  ctx.beginPath();
  ctx.arc(x + 6, y + 10, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  drawGrid();
  drawCherry();
  drawSnake();
}

function update() {
  direction = nextDirection;

  const head = { ...snake[0] };

  if (direction === "up") head.y--;
  if (direction === "down") head.y++;
  if (direction === "left") head.x--;
  if (direction === "right") head.x++;

  const eatingCherry =
    head.x === cherry.x && head.y === cherry.y;

  const bodyToCheck = eatingCherry
    ? snake
    : snake.slice(0, -1);

  const hitWall =
    head.x < 0 ||
    head.x >= gridSize ||
    head.y < 0 ||
    head.y >= gridSize;

  const hitSelf = bodyToCheck.some(
    part => part.x === head.x && part.y === head.y
  );

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (eatingCherry) {
    score++;
    scoreElement.textContent = score;

    if (score > highscore) {
      highscore = score;
      highscoreElement.textContent = highscore;
      localStorage.setItem("snakeHighscore", highscore);
    }

    spawnCherry();

    if (score % 5 === 0 && speed > 55) {
      speed -= 10;
      clearInterval(gameInterval);
      gameInterval = setInterval(update, speed);
    }
  } else {
    snake.pop();
  }

  draw();
}

function endGame() {
  gameRunning = false;
  clearInterval(gameInterval);

  overlayTitle.textContent = "Game Over!";
  overlayText.textContent = `You collected ${score} cherries! 🍒`;
  startButton.textContent = "Play Again";
  overlay.classList.remove("hidden");
}

startButton.addEventListener("click", startGame);

document.addEventListener("keydown", event => {
  const keys = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right"
  };

  if (keys[event.key]) {
    event.preventDefault();
    changeDirection(keys[event.key]);
  }
});

document.querySelectorAll("[data-direction]").forEach(button => {
  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    changeDirection(button.dataset.direction);
  });
});

// Swipe controls for phones
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("pointerdown", event => {
  touchStartX = event.clientX;
  touchStartY = event.clientY;
});

canvas.addEventListener("pointerup", event => {
  const dx = event.clientX - touchStartX;
  const dy = event.clientY - touchStartY;

  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    changeDirection(dx > 0 ? "right" : "left");
  } else {
    changeDirection(dy > 0 ? "down" : "up");
  }
});

drawGrid();
