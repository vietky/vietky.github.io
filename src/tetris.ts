import './style.css';
import { setupNav } from './shared/nav';
import { setupFooter } from './shared/footer';

const navContainer = document.getElementById('nav-container')!;
setupNav(navContainer);

const footerContainer = document.getElementById('footer-container');
if (footerContainer) {
    setupFooter(footerContainer);
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-[calc(100vh-64px)] bg-gray-900 flex flex-col items-center justify-center font-sans py-8">
    <div class="mb-6 text-center">
      <h1 class="text-4xl font-bold text-white mb-2">Tetris</h1>
      <p class="text-gray-400">Use Arrow Keys to move and rotate. Press Space to drop.</p>
    </div>

    <div class="flex flex-col md:flex-row gap-8 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">

      <!-- Main Game Canvas -->
      <div class="relative bg-black rounded border-2 border-gray-600 shadow-inner">
        <canvas id="tetris-canvas" width="300" height="600" class="block"></canvas>
        <div id="game-over" class="absolute inset-0 bg-black/80 hidden flex-col items-center justify-center rounded">
          <h2 class="text-3xl font-bold text-red-500 mb-4">GAME OVER</h2>
          <button id="restart-btn" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded transition-colors">
            Play Again
          </button>
        </div>
      </div>

      <!-- Score & Info Panel -->
      <div class="flex flex-col w-48 gap-6">
        <div class="bg-gray-900 p-4 rounded border border-gray-700">
          <h3 class="text-gray-400 text-sm font-bold mb-1 uppercase tracking-wider">Score</h3>
          <div id="score" class="text-3xl font-mono text-white">0</div>
        </div>

        <div class="bg-gray-900 p-4 rounded border border-gray-700">
          <h3 class="text-gray-400 text-sm font-bold mb-1 uppercase tracking-wider">Lines</h3>
          <div id="lines" class="text-2xl font-mono text-white">0</div>
        </div>

        <div class="bg-gray-900 p-4 rounded border border-gray-700 flex-grow">
          <h3 class="text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Next</h3>
          <canvas id="next-piece-canvas" width="120" height="120" class="block mx-auto"></canvas>
        </div>
      </div>

    </div>
  </div>
`;

// --- TETRIS LOGIC ---

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30; // 300px / 10 cols

const canvas = document.getElementById('tetris-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const nextCanvas = document.getElementById('next-piece-canvas') as HTMLCanvasElement;
const nextCtx = nextCanvas.getContext('2d')!;

const scoreElement = document.getElementById('score')!;
const linesElement = document.getElementById('lines')!;
const gameOverScreen = document.getElementById('game-over')!;
const restartBtn = document.getElementById('restart-btn')!;

// Colors for the 7 Tetrominoes
const COLORS = [
  '#000000', // 0: Empty
  '#00FFFF', // 1: I (Cyan)
  '#0000FF', // 2: J (Blue)
  '#FFA500', // 3: L (Orange)
  '#FFFF00', // 4: O (Yellow)
  '#00FF00', // 5: S (Green)
  '#800080', // 6: T (Purple)
  '#FF0000'  // 7: Z (Red)
];

// Shapes
const SHAPES = [
  [], // Empty
  [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], // I
  [[2,0,0], [2,2,2], [0,0,0]], // J
  [[0,0,3], [3,3,3], [0,0,0]], // L
  [[4,4], [4,4]], // O
  [[0,5,5], [5,5,0], [0,0,0]], // S
  [[0,6,0], [6,6,6], [0,0,0]], // T
  [[7,7,0], [0,7,7], [0,0,0]]  // Z
];

let board: number[][] = [];
let score = 0;
let lines = 0;
let isGameOver = false;

interface Piece {
  x: number;
  y: number;
  shape: number[][];
  colorIdx: number;
}

let currentPiece: Piece;
let nextPiece: Piece;

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let animationId: number;

function createMatrix(w: number, h: number): number[][] {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(): Piece {
  const typeId = Math.floor(Math.random() * 7) + 1;
  const shape = SHAPES[typeId];
  return {
    x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
    y: 0,
    shape: shape,
    colorIdx: typeId
  };
}

function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, colorIdx: number, size: number) {
  ctx.fillStyle = COLORS[colorIdx];
  ctx.fillRect(x * size, y * size, size, size);
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1;
  ctx.strokeRect(x * size, y * size, size, size);
}

function drawMatrix(matrix: number[][], offset: {x: number, y: number}, targetCtx: CanvasRenderingContext2D, size: number) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        drawBlock(targetCtx, x + offset.x, y + offset.y, value, size);
      }
    });
  });
}

function draw() {
  // Clear canvas
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid lines
  ctx.strokeStyle = '#222';
  for (let r = 0; r < ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * BLOCK_SIZE);
      ctx.lineTo(canvas.width, r * BLOCK_SIZE);
      ctx.stroke();
  }
  for (let c = 0; c < COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * BLOCK_SIZE, 0);
      ctx.lineTo(c * BLOCK_SIZE, canvas.height);
      ctx.stroke();
  }

  // Draw board
  drawMatrix(board, {x: 0, y: 0}, ctx, BLOCK_SIZE);

  // Draw ghost piece (optional, but good UX)
  let ghostY = currentPiece.y;
  while (!collide(board, { ...currentPiece, y: ghostY + 1 })) {
    ghostY++;
  }
  ctx.globalAlpha = 0.2;
  drawMatrix(currentPiece.shape, {x: currentPiece.x, y: ghostY}, ctx, BLOCK_SIZE);
  ctx.globalAlpha = 1.0;

  // Draw current piece
  drawMatrix(currentPiece.shape, {x: currentPiece.x, y: currentPiece.y}, ctx, BLOCK_SIZE);

  // Draw next piece in sidebar
  nextCtx.fillStyle = '#111827'; // match bg-gray-900
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

  // Center next piece in nextCanvas
  const nextPieceSize = 30;
  const offsetX = (nextCanvas.width / nextPieceSize - nextPiece.shape[0].length) / 2;
  const offsetY = (nextCanvas.height / nextPieceSize - nextPiece.shape.length) / 2;

  drawMatrix(nextPiece.shape, {x: offsetX, y: offsetY}, nextCtx, nextPieceSize);
}

function collide(board: number[][], piece: Piece): boolean {
  const m = piece.shape;
  const o = piece;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
         (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(board: number[][], piece: Piece) {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        board[y + piece.y][x + piece.x] = value;
      }
    });
  });
}

function rotate(matrix: number[][]): number[][] {
  const N = matrix.length;
  const result = matrix.map((row, i) =>
    row.map((_, j) => matrix[N - 1 - j][i])
  );
  return result;
}

function playerRotate() {
  const pos = currentPiece.x;
  let offset = 1;
  const originalShape = currentPiece.shape;
  currentPiece.shape = rotate(currentPiece.shape);

  // Wall kick logic
  while (collide(board, currentPiece)) {
    currentPiece.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > currentPiece.shape[0].length) {
      currentPiece.shape = originalShape; // revert
      currentPiece.x = pos;
      return;
    }
  }
}

function playerMove(offset: number) {
  currentPiece.x += offset;
  if (collide(board, currentPiece)) {
    currentPiece.x -= offset;
  }
}

function playerDrop() {
  currentPiece.y++;
  if (collide(board, currentPiece)) {
    currentPiece.y--;
    merge(board, currentPiece);
    resetPiece();
    arenaSweep();
  }
  dropCounter = 0;
}

function playerHardDrop() {
    while (!collide(board, currentPiece)) {
        currentPiece.y++;
    }
    currentPiece.y--;
    merge(board, currentPiece);
    resetPiece();
    arenaSweep();
    dropCounter = 0;
}


function resetPiece() {
  currentPiece = nextPiece;
  nextPiece = createPiece();

  if (collide(board, currentPiece)) {
    // Game Over
    isGameOver = true;
    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('flex');
    cancelAnimationFrame(animationId);
  }
}

function arenaSweep() {
  let rowCount = 0;
  outer: for (let y = board.length - 1; y >= 0; --y) {
    for (let x = 0; x < board[y].length; ++x) {
      if (board[y][x] === 0) {
        continue outer;
      }
    }

    const row = board.splice(y, 1)[0].fill(0);
    board.unshift(row);
    ++y;
    rowCount++;
  }

  if (rowCount > 0) {
    const lineScores = [0, 40, 100, 300, 1200];
    score += lineScores[rowCount];
    lines += rowCount;
    scoreElement.innerText = score.toString();
    linesElement.innerText = lines.toString();

    // Increase speed
    dropInterval = Math.max(100, 1000 - (lines * 20));
  }
}

function update(time = 0) {
  if (isGameOver) return;

  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  animationId = requestAnimationFrame(update);
}

function startGame() {
  board = createMatrix(COLS, ROWS);
  score = 0;
  lines = 0;
  dropInterval = 1000;
  isGameOver = false;

  scoreElement.innerText = '0';
  linesElement.innerText = '0';
  gameOverScreen.classList.add('hidden');
  gameOverScreen.classList.remove('flex');

  nextPiece = createPiece();
  resetPiece();

  lastTime = performance.now();
  update();
}

// Input handling
document.addEventListener('keydown', event => {
  if (isGameOver) return;

  // Prevent default scrolling for game keys
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
      event.preventDefault();
  }

  switch (event.key) {
    case 'ArrowLeft':
      playerMove(-1);
      break;
    case 'ArrowRight':
      playerMove(1);
      break;
    case 'ArrowDown':
      playerDrop();
      break;
    case 'ArrowUp':
      playerRotate();
      break;
    case ' ':
      playerHardDrop();
      break;
  }
});

restartBtn.addEventListener('click', startGame);

// Initialize
startGame();
