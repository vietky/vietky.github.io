import './style.css';
import { setupNav } from './shared/nav';

const navContainer = document.getElementById('nav-container')!;
setupNav(navContainer);

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-[calc(100vh-64px)] bg-gray-900 flex flex-col items-center justify-center font-sans py-8">
    <div class="mb-6 text-center">
      <h1 class="text-4xl font-bold text-white mb-2">Tank 1990</h1>
      <p class="text-gray-400">Use WASD/Arrows to move, Space to shoot. Protect the Eagle!</p>
    </div>

    <div class="flex flex-col md:flex-row gap-8 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">

      <!-- Main Game/Editor Canvas -->
      <div class="relative bg-black rounded border-2 border-gray-600 shadow-inner">
        <canvas id="tank-canvas" width="520" height="520" class="block"></canvas>
        <div id="game-over" class="absolute inset-0 bg-black/80 hidden flex-col items-center justify-center rounded">
          <h2 id="game-over-text" class="text-3xl font-bold text-red-500 mb-4">GAME OVER</h2>
          <button id="restart-btn" class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors mb-2">
            Play Again
          </button>
        </div>
      </div>

      <!-- Score & Info Panel / Editor Controls -->
      <div class="flex flex-col w-64 gap-4">
        <!-- Game Stats -->
        <div id="game-stats" class="flex flex-col gap-4">
          <div class="bg-gray-900 p-4 rounded border border-gray-700">
            <h3 class="text-gray-400 text-sm font-bold mb-1 uppercase tracking-wider">Score</h3>
            <div id="score" class="text-3xl font-mono text-white">0</div>
          </div>
          <div class="bg-gray-900 p-4 rounded border border-gray-700">
            <h3 class="text-gray-400 text-sm font-bold mb-1 uppercase tracking-wider">Lives</h3>
            <div id="lives" class="text-2xl font-mono text-white">3</div>
          </div>
          <button id="toggle-editor-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors w-full mt-auto">
            Open Map Editor
          </button>
        </div>

        <!-- Editor Controls (Hidden by default) -->
        <div id="editor-controls" class="hidden flex-col gap-4">
          <h3 class="text-white text-lg font-bold border-b border-gray-700 pb-2">Map Editor</h3>

          <div class="bg-gray-900 p-4 rounded border border-gray-700 grid grid-cols-2 gap-2" id="tile-palette">
            <!-- Filled by JS -->
          </div>

          <div class="flex flex-col gap-2 mt-4">
            <button id="save-map-btn" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded transition-colors">
              Save Custom Map
            </button>
            <button id="load-map-btn" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded transition-colors">
              Load Custom Map
            </button>
            <button id="clear-map-btn" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors">
              Clear Map
            </button>
            <hr class="border-gray-700 my-2">
            <button id="play-custom-btn" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors">
              Play Custom Map
            </button>
            <button id="close-editor-btn" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded transition-colors">
              Close Editor
            </button>
          </div>
        </div>

      </div>

    </div>
  </div>
`;

// Logic implementation will follow in the next steps...

// --- TANK 1990 LOGIC & EDITOR ---

const TILE_SIZE = 20; // 26x26 grid = 520x520
const COLS = 26;
const ROWS = 26;

// Const object for map tiles to allow easy asset swapping later (avoiding TS enum with erasableSyntaxOnly)
const TileType = {
  EMPTY: 0,
  BRICK: 1,
  STEEL: 2,
  WATER: 3,
  GRASS: 4,
  BASE: 5,
  BASE_DESTROYED: 6
} as const;

type TileType = typeof TileType[keyof typeof TileType];

// Colors for the fallback rendering
const TILE_COLORS: Record<TileType, string> = {
  [TileType.EMPTY]: '#000000',
  [TileType.BRICK]: '#B22222', // Firebrick
  [TileType.STEEL]: '#A9A9A9', // DarkGray
  [TileType.WATER]: '#1E90FF', // DodgerBlue
  [TileType.GRASS]: '#228B22', // ForestGreen (rendered on top)
  [TileType.BASE]: '#FFD700',  // Gold (Eagle)
  [TileType.BASE_DESTROYED]: '#8B4513' // SaddleBrown
};

let map: TileType[][] = [];

const Direction = { UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3 } as const;
type Direction = typeof Direction[keyof typeof Direction];

interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  dir: Direction;
  speed: number;
}

interface Tank extends Entity {
  isPlayer: boolean;
  color: string;
  cooldown: number;
  hp?: number; // for enemies
}

interface Bullet extends Entity {
  isPlayer: boolean;
  active: boolean;
}

let playerTank: Tank;
let enemies: Tank[] = [];
let bullets: Bullet[] = [];

let score = 0;
let lives = 3;
let isGameOver = false;
let isEditorMode = false;
let currentEditorTile: TileType = TileType.BRICK;
let baseDestroyed = false;
let animationId: number | null = null;

const canvas = document.getElementById('tank-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// UI Elements
const scoreEl = document.getElementById('score')!;
const livesEl = document.getElementById('lives')!;
const gameOverScreen = document.getElementById('game-over')!;
const gameOverText = document.getElementById('game-over-text')!;
const restartBtn = document.getElementById('restart-btn')!;

const toggleEditorBtn = document.getElementById('toggle-editor-btn')!;
const closeEditorBtn = document.getElementById('close-editor-btn')!;
const gameStats = document.getElementById('game-stats')!;
const editorControls = document.getElementById('editor-controls')!;
const tilePalette = document.getElementById('tile-palette')!;
const saveMapBtn = document.getElementById('save-map-btn')!;
const loadMapBtn = document.getElementById('load-map-btn')!;
const clearMapBtn = document.getElementById('clear-map-btn')!;
const playCustomBtn = document.getElementById('play-custom-btn')!;

// Input State
const keys: { [key: string]: boolean } = {};

// --- INITIALIZATION ---

function initMap(empty: boolean = false) {
  map = [];
  for (let y = 0; y < ROWS; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < COLS; x++) {
      row.push(TileType.EMPTY);
    }
    map.push(row);
  }

  if (!empty) {
    // Generate random level obstacles
    for (let y = 2; y < ROWS - 2; y += 2) {
      for (let x = 2; x < COLS - 2; x += 2) {
        if (Math.random() > 0.6) {
          const type = Math.random() > 0.8 ? TileType.STEEL :
                       (Math.random() > 0.8 ? TileType.WATER :
                       (Math.random() > 0.8 ? TileType.GRASS : TileType.BRICK));
          map[y][x] = type;
          map[y][x+1] = type;
          map[y+1][x] = type;
          map[y+1][x+1] = type;
        }
      }
    }
    // Setup Base (12, 24)
    map[24][12] = TileType.BASE;
    map[24][13] = TileType.BASE;
    map[25][12] = TileType.BASE;
    map[25][13] = TileType.BASE;

    // Brick wall around base
    map[23][11] = map[23][12] = map[23][13] = map[23][14] = TileType.BRICK;
    map[24][11] = map[25][11] = TileType.BRICK;
    map[24][14] = map[25][14] = TileType.BRICK;
  } else {
     // Setup Base only for empty map
     map[24][12] = TileType.BASE;
     map[24][13] = TileType.BASE;
     map[25][12] = TileType.BASE;
     map[25][13] = TileType.BASE;
  }
}

function initPlayer() {
  playerTank = {
    x: 8 * TILE_SIZE, // Spawn left of base
    y: 24 * TILE_SIZE,
    width: TILE_SIZE * 1.8,
    height: TILE_SIZE * 1.8,
    dir: Direction.UP,
    speed: 2,
    isPlayer: true,
    color: '#EAB308', // Yellow
    cooldown: 0
  };
}

function spawnEnemy() {
  if (enemies.length >= 4) return; // Max 4 enemies on screen
  const spawnPoints = [0, 12 * TILE_SIZE, 24 * TILE_SIZE];
  const spawnX = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

  // Random enemy type
  const typeRand = Math.random();
  let hp = 1;
  let speed = 1.5;
  let color = '#d1d5db'; // Basic Gray

  if (typeRand > 0.8) {
    hp = 3; // Armor Tank
    speed = 1;
    color = '#16a34a'; // Green
  } else if (typeRand > 0.5) {
    speed = 2.5; // Fast Tank
    color = '#ef4444'; // Red
  }

  enemies.push({
    x: spawnX,
    y: 0,
    width: TILE_SIZE * 1.8,
    height: TILE_SIZE * 1.8,
    dir: Direction.DOWN,
    speed: speed,
    isPlayer: false,
    color: color,
    cooldown: 0,
    hp: hp
  });
}

// --- RENDERING ---

function drawRect(x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

function drawMap(layer: 'base' | 'top') {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const tile = map[y][x];
      if (tile === TileType.EMPTY) continue;

      // Grass renders on top of tanks, everything else below
      if (layer === 'base' && tile !== TileType.GRASS) {
         drawRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE, TILE_COLORS[tile]);
         // Add some texture
         if (tile === TileType.BRICK) {
             ctx.strokeStyle = '#8B0000';
             ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
         }
      } else if (layer === 'top' && tile === TileType.GRASS) {
         drawRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE, TILE_COLORS[tile]);
      }
    }
  }
}

function drawTank(tank: Tank) {
  const { x, y, width, height, dir, color } = tank;
  drawRect(x, y, width, height, color); // Body

  // Draw Gun Barrel
  ctx.fillStyle = '#6b7280';
  const barrelL = 10;
  const barrelW = 6;
  let bx = x, by = y, bw = barrelW, bh = barrelW;

  const center_x = x + width/2;
  const center_y = y + height/2;

  if (dir === Direction.UP) {
    bx = center_x - barrelW/2;
    by = y - 4;
    bh = barrelL + 4;
  } else if (dir === Direction.DOWN) {
    bx = center_x - barrelW/2;
    by = center_y;
    bh = barrelL + 4;
  } else if (dir === Direction.LEFT) {
    bx = x - 4;
    by = center_y - barrelW/2;
    bw = barrelL + 4;
  } else if (dir === Direction.RIGHT) {
    bx = center_x;
    by = center_y - barrelW/2;
    bw = barrelL + 4;
  }
  ctx.fillRect(bx, by, bw, bh);

  // Draw HP for enemies
  if (!tank.isPlayer && tank.hp && tank.hp > 1) {
     ctx.fillStyle = 'white';
     ctx.font = '10px monospace';
     ctx.fillText(tank.hp.toString(), x + 4, y + 14);
  }
}

function drawBullets() {
  for (const b of bullets) {
    if (!b.active) continue;
    drawRect(b.x, b.y, b.width, b.height, b.isPlayer ? '#fbbf24' : '#f87171');
  }
}

function render() {
  // Clear
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (isEditorMode) {
      drawMap('base');
      drawMap('top');
      // Draw grid
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      for (let i=0; i<=COLS; i++) {
          ctx.beginPath(); ctx.moveTo(i*TILE_SIZE, 0); ctx.lineTo(i*TILE_SIZE, canvas.height); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, i*TILE_SIZE); ctx.lineTo(canvas.width, i*TILE_SIZE); ctx.stroke();
      }
      return; // Skip drawing tanks in editor
  }

  drawMap('base');

  // Tanks
  if (playerTank) drawTank(playerTank);
  for (const e of enemies) drawTank(e);

  drawBullets();

  drawMap('top'); // Grass over tanks
}

// --- PHYSICS & COLLISION ---

function checkAABB(e1: Entity, e2: Entity): boolean {
  return e1.x < e2.x + e2.width &&
         e1.x + e1.width > e2.x &&
         e1.y < e2.y + e2.height &&
         e1.y + e1.height > e2.y;
}

function getMapTiles(x: number, y: number, w: number, h: number): {r: number, c: number, type: TileType}[] {
  const tiles = [];
  const startC = Math.floor(x / TILE_SIZE);
  const endC = Math.floor((x + w - 0.1) / TILE_SIZE);
  const startR = Math.floor(y / TILE_SIZE);
  const endR = Math.floor((y + h - 0.1) / TILE_SIZE);

  for (let r = startR; r <= endR; r++) {
    for (let c = startC; c <= endC; c++) {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        tiles.push({r, c, type: map[r][c]});
      } else {
        // Treat out of bounds as unbreakable wall
        tiles.push({r, c, type: TileType.STEEL});
      }
    }
  }
  return tiles;
}

function canMove(entity: Entity, newX: number, newY: number): boolean {
  // Check bounds
  if (newX < 0 || newX + entity.width > canvas.width ||
      newY < 0 || newY + entity.height > canvas.height) {
    return false;
  }

  // Check Map Tiles
  const tiles = getMapTiles(newX, newY, entity.width, entity.height);
  for (const t of tiles) {
    if (t.type === TileType.BRICK || t.type === TileType.STEEL ||
        t.type === TileType.WATER || t.type === TileType.BASE || t.type === TileType.BASE_DESTROYED) {
      return false;
    }
  }

  // Check Tank collisions
  const testEntity = { ...entity, x: newX, y: newY };
  if (entity !== playerTank && playerTank && checkAABB(testEntity, playerTank)) return false;

  for (const e of enemies) {
    if (entity !== e && checkAABB(testEntity, e)) return false;
  }

  return true;
}

// --- UPDATES ---

function shoot(tank: Tank) {
  if (tank.cooldown > 0) return;

  const bw = 4;
  let bx = tank.x + tank.width / 2 - bw/2;
  let by = tank.y + tank.height / 2 - bw/2;

  if (tank.dir === Direction.UP) by = tank.y - bw;
  if (tank.dir === Direction.DOWN) by = tank.y + tank.height;
  if (tank.dir === Direction.LEFT) bx = tank.x - bw;
  if (tank.dir === Direction.RIGHT) bx = tank.x + tank.width;

  bullets.push({
    x: bx, y: by, width: bw, height: bw,
    dir: tank.dir, speed: 5,
    isPlayer: tank.isPlayer, active: true
  });

  tank.cooldown = 30; // Frames
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    if (!b.active) {
        bullets.splice(i, 1);
        continue;
    }

    if (b.dir === Direction.UP) b.y -= b.speed;
    if (b.dir === Direction.DOWN) b.y += b.speed;
    if (b.dir === Direction.LEFT) b.x -= b.speed;
    if (b.dir === Direction.RIGHT) b.x += b.speed;

    // Map bounds
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      b.active = false;
      continue;
    }

    // Map tile collision
    const tiles = getMapTiles(b.x, b.y, b.width, b.height);
    let hitTile = false;
    for (const t of tiles) {
      if (t.type === TileType.BRICK) {
        map[t.r][t.c] = TileType.EMPTY; // break brick
        hitTile = true;
      } else if (t.type === TileType.STEEL) {
        hitTile = true;
      } else if (t.type === TileType.BASE) {
        map[t.r][t.c] = TileType.BASE_DESTROYED;
        baseDestroyed = true;
        hitTile = true;
      }
    }
    if (hitTile) {
      b.active = false;
      continue;
    }

    // Tank collision
    if (b.isPlayer) {
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (checkAABB(b, e)) {
          b.active = false;
          if (e.hp) e.hp--;
          if (!e.hp || e.hp <= 0) {
              enemies.splice(j, 1);
              score += 100;
              scoreEl.innerText = score.toString();
          }
          break;
        }
      }
    } else {
      if (playerTank && checkAABB(b, playerTank)) {
        b.active = false;
        lives--;
        livesEl.innerText = lives.toString();
        if (lives <= 0) {
            isGameOver = true;
            gameOverText.innerText = "GAME OVER";
        } else {
            initPlayer(); // Respawn
        }
      }
    }
  }
}

function updatePlayer() {
  if (!playerTank) return;
  if (playerTank.cooldown > 0) playerTank.cooldown--;

  let newX = playerTank.x;
  let newY = playerTank.y;
  let moving = false;

  if (keys['w'] || keys['ArrowUp']) { newY -= playerTank.speed; playerTank.dir = Direction.UP; moving = true; }
  else if (keys['s'] || keys['ArrowDown']) { newY += playerTank.speed; playerTank.dir = Direction.DOWN; moving = true; }
  else if (keys['a'] || keys['ArrowLeft']) { newX -= playerTank.speed; playerTank.dir = Direction.LEFT; moving = true; }
  else if (keys['d'] || keys['ArrowRight']) { newX += playerTank.speed; playerTank.dir = Direction.RIGHT; moving = true; }

  if (keys[' ']) {
      shoot(playerTank);
  }

  if (moving) {
    // Basic sliding collision on axes
    if (canMove(playerTank, newX, playerTank.y)) playerTank.x = newX;
    if (canMove(playerTank, playerTank.x, newY)) playerTank.y = newY;
  }
}

function updateEnemies() {
  if (Math.random() < 0.01) spawnEnemy();

  for (const e of enemies) {
    if (e.cooldown > 0) e.cooldown--;

    // AI: occasionally change direction or shoot
    if (Math.random() < 0.02) {
      e.dir = Math.floor(Math.random() * 4) as Direction;
    }
    if (Math.random() < 0.03) {
      shoot(e);
    }

    let newX = e.x;
    let newY = e.y;

    if (e.dir === Direction.UP) newY -= e.speed;
    if (e.dir === Direction.DOWN) newY += e.speed;
    if (e.dir === Direction.LEFT) newX -= e.speed;
    if (e.dir === Direction.RIGHT) newX += e.speed;

    if (canMove(e, newX, newY)) {
      e.x = newX;
      e.y = newY;
    } else {
      // Force turn if blocked
      e.dir = Math.floor(Math.random() * 4) as Direction;
    }
  }
}

function gameLoop() {
  if (isEditorMode) {
     render();
     animationId = requestAnimationFrame(gameLoop);
     return;
  }

  if (isGameOver || baseDestroyed) {
    render();
    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('flex');
    if (baseDestroyed && !isGameOver) {
        gameOverText.innerText = "BASE DESTROYED";
    }
    return; // Stop updating
  }

  updatePlayer();
  updateEnemies();
  updateBullets();
  render();

  animationId = requestAnimationFrame(gameLoop);
}

// --- EDITOR LOGIC ---

function setupEditor() {
    tilePalette.innerHTML = '';
    const editableTiles = [TileType.EMPTY, TileType.BRICK, TileType.STEEL, TileType.WATER, TileType.GRASS];

    editableTiles.forEach(type => {
        const btn = document.createElement('button');
        btn.className = `p-2 rounded border-2 border-transparent hover:border-white transition-colors flex items-center justify-center gap-2`;
        if (type === currentEditorTile) btn.classList.add('border-white', 'ring-2', 'ring-blue-500');

        const typeName = Object.keys(TileType).find(k => TileType[k as keyof typeof TileType] === type);
        btn.innerHTML = `
           <div style="width: 20px; height: 20px; background-color: ${TILE_COLORS[type]}; border: 1px solid #333;"></div>
           <span class="text-white text-xs">${typeName}</span>
        `;

        btn.onclick = () => {
            currentEditorTile = type;
            setupEditor(); // re-render to update selection style
        };
        tilePalette.appendChild(btn);
    });
}

function paintTile(e: MouseEvent) {
    if (!isEditorMode) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const c = Math.floor(x / TILE_SIZE);
    const r = Math.floor(y / TILE_SIZE);

    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        // Prevent overwriting the base area
        if (r >= 24 && c >= 12 && c <= 13) return;
        map[r][c] = currentEditorTile;
    }
}

canvas.addEventListener('mousedown', (e) => {
    if (isEditorMode) {
        paintTile(e);
        canvas.onmousemove = paintTile;
    }
});
canvas.addEventListener('mouseup', () => canvas.onmousemove = null);
canvas.addEventListener('mouseleave', () => canvas.onmousemove = null);

// --- EVENT LISTENERS ---

window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].indexOf(e.code) > -1 && !isEditorMode) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', e => { keys[e.key] = false; });

restartBtn.addEventListener('click', () => {
    startGame(false);
});

toggleEditorBtn.addEventListener('click', () => {
    isEditorMode = true;
    gameStats.classList.add('hidden');
    editorControls.classList.remove('hidden');
    editorControls.classList.add('flex');
    initMap(true); // Start with empty map for editor
    setupEditor();
});

closeEditorBtn.addEventListener('click', () => {
    isEditorMode = false;
    editorControls.classList.add('hidden');
    editorControls.classList.remove('flex');
    gameStats.classList.remove('hidden');
    startGame(false); // Restart normally
});

saveMapBtn.addEventListener('click', () => {
    localStorage.setItem('tankMap', JSON.stringify(map));
    alert('Map saved successfully!');
});

loadMapBtn.addEventListener('click', () => {
    const saved = localStorage.getItem('tankMap');
    if (saved) {
        map = JSON.parse(saved);
        alert('Map loaded!');
    } else {
        alert('No custom map found.');
    }
});

clearMapBtn.addEventListener('click', () => {
    if(confirm('Are you sure you want to clear the map?')) {
        initMap(true);
    }
});

playCustomBtn.addEventListener('click', () => {
    const saved = localStorage.getItem('tankMap');
    if (saved) {
        isEditorMode = false;
        editorControls.classList.add('hidden');
        editorControls.classList.remove('flex');
        gameStats.classList.remove('hidden');
        startGame(true, JSON.parse(saved));
    } else {
        alert('Save a map first!');
    }
});

// --- MAIN START ---

function startGame(useCustomMap: boolean = false, customMapData: any = null) {
  if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
  }

  isGameOver = false;
  baseDestroyed = false;
  score = 0;
  lives = 3;
  enemies = [];
  bullets = [];

  scoreEl.innerText = '0';
  livesEl.innerText = '3';
  gameOverScreen.classList.add('hidden');
  gameOverScreen.classList.remove('flex');

  if (useCustomMap && customMapData) {
      map = customMapData;
  } else {
      initMap(false);
  }

  initPlayer();

  // ensure loop is running
  animationId = requestAnimationFrame(gameLoop);
}

startGame();
