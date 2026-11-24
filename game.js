/**
 * SnakeJS — Classic Snake Game in Vanilla JavaScript
 * Features:
 * - 20x20 HTML5 Canvas grid with rounded segments & directional eyes
 * - Input buffer queue to prevent accidental 180-degree self-collisions
 * - Classic Wall mode & Wrap-around Portal mode
 * - Synthesized Web Audio API sound effects (no external audio files)
 * - Keyboard (Arrow keys / WASD / Space) + Touch Swipe + Mobile D-Pad
 */

const GRID_SIZE = 20;
const STORAGE_KEY = 'snakejs_high_score';

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const OPPOSITE = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const lengthEl = document.getElementById('length');
const speedSelect = document.getElementById('speedSelect');
const wrapToggle = document.getElementById('wrapToggle');
const muteBtn = document.getElementById('muteBtn');
const pauseBtn = document.getElementById('pauseBtn');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySubtitle = document.getElementById('overlaySubtitle');
const startBtn = document.getElementById('startBtn');

let snake = [];
let direction = 'RIGHT';
let directionQueue = [];
let food = { x: 14, y: 10 };
let score = 0;
let highScore = Number(localStorage.getItem(STORAGE_KEY) || 0);
let gameState = 'IDLE'; // 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'
let tickTimer = null;
let muted = false;
let audioCtx = null;

highScoreEl.textContent = String(highScore);

function playTone(freqStart, freqEnd, duration, type = 'triangle') {
  if (muted) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  if (!audioCtx) audioCtx = new AudioContextClass();
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, now);
  osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.01);
}

function spawnFood() {
  const occupied = new Set(snake.map((seg) => `${seg.x},${seg.y}`));
  const freeCells = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!occupied.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }
  if (freeCells.length === 0) return;
  food = freeCells[Math.floor(Math.random() * freeCells.length)];
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = 'RIGHT';
  directionQueue = [];
  score = 0;
  spawnFood();
  updateHud();
  draw();
}

function updateHud() {
  scoreEl.textContent = String(score);
  highScoreEl.textContent = String(highScore);
  lengthEl.textContent = String(snake.length);
}

function queueDirection(nextDir) {
  const lastQueued = directionQueue[directionQueue.length - 1] || direction;
  if (nextDir === lastQueued || OPPOSITE[nextDir] === lastQueued) return;
  if (directionQueue.length < 2) {
    directionQueue.push(nextDir);
  }
}

function step() {
  if (gameState !== 'PLAYING') return;

  if (directionQueue.length > 0) {
    direction = directionQueue.shift();
  }

  const delta = DIRECTIONS[direction];
  let nextX = snake[0].x + delta.x;
  let nextY = snake[0].y + delta.y;

  if (wrapToggle.checked) {
    nextX = (nextX + GRID_SIZE) % GRID_SIZE;
    nextY = (nextY + GRID_SIZE) % GRID_SIZE;
  } else if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
    endGame();
    return;
  }

  const willEat = nextX === food.x && nextY === food.y;
  const bodyToCheck = willEat ? snake : snake.slice(0, -1);
  const hitSelf = bodyToCheck.some((seg) => seg.x === nextX && seg.y === nextY);

  if (hitSelf) {
    endGame();
    return;
  }

  snake.unshift({ x: nextX, y: nextY });

  if (willEat) {
    score += 10;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem(STORAGE_KEY, String(highScore));
    }
    playTone(520, 880, 0.09);
    spawnFood();
  } else {
    snake.pop();
  }

  updateHud();
  draw();
}

function startLoop() {
  clearInterval(tickTimer);
  const intervalMs = Number(speedSelect.value);
  tickTimer = setInterval(step, intervalMs);
}

function startGame() {
  if (gameState === 'IDLE' || gameState === 'GAME_OVER') {
    resetGame();
  }
  gameState = 'PLAYING';
  overlay.classList.add('hidden');
  pauseBtn.textContent = 'พักเกม';
  playTone(392, 523.25, 0.1);
  startLoop();
}

function togglePause() {
  if (gameState === 'PLAYING') {
    gameState = 'PAUSED';
    clearInterval(tickTimer);
    overlayTitle.textContent = 'พักเกมชั่วคราว';
    overlaySubtitle.textContent = 'กด Space หรือปุ่มด้านล่างเพื่อเล่นต่อ';
    startBtn.textContent = 'เล่นต่อ';
    pauseBtn.textContent = 'เล่นต่อ';
    overlay.classList.remove('hidden');
  } else if (gameState === 'PAUSED') {
    startGame();
  }
}

function endGame() {
  gameState = 'GAME_OVER';
  clearInterval(tickTimer);
  playTone(260, 90, 0.28, 'sawtooth');
  overlayTitle.textContent = 'จบเกม!';
  overlaySubtitle.textContent = `คะแนนของคุณ: ${score} · สูงสุด: ${highScore}`;
  startBtn.textContent = 'เล่นอีกครั้ง';
  overlay.classList.remove('hidden');
}

function draw() {
  const cellSize = canvas.width / GRID_SIZE;

  // Board background
  ctx.fillStyle = '#0f241b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle checkerboard grid
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if ((x + y) % 2 === 0) {
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  // Draw apple
  const fx = food.x * cellSize + cellSize / 2;
  const fy = food.y * cellSize + cellSize / 2;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(fx, fy + 1, cellSize * 0.36, 0, Math.PI * 2);
  ctx.fill();

  // Apple leaf
  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  ctx.ellipse(fx + 3, fy - cellSize * 0.3, cellSize * 0.14, cellSize * 0.08, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Draw snake from tail to head
  for (let i = snake.length - 1; i >= 0; i--) {
    const seg = snake[i];
    const isHead = i === 0;
    const pad = isHead ? 1.5 : 2.5;
    const x = seg.x * cellSize + pad;
    const y = seg.y * cellSize + pad;
    const size = cellSize - pad * 2;
    const radius = isHead ? 7 : 5;

    ctx.fillStyle = isHead ? '#34d399' : i % 2 === 0 ? '#10b981' : '#059669';
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, radius);
    ctx.fill();

    if (isHead) {
      drawEyes(seg, cellSize);
    }
  }
}

function drawEyes(head, cellSize) {
  const cx = head.x * cellSize + cellSize / 2;
  const cy = head.y * cellSize + cellSize / 2;
  const offset = cellSize * 0.22;
  const spread = cellSize * 0.18;

  let e1 = { x: cx + offset, y: cy - spread };
  let e2 = { x: cx + offset, y: cy + spread };

  if (direction === 'LEFT') {
    e1 = { x: cx - offset, y: cy - spread };
    e2 = { x: cx - offset, y: cy + spread };
  } else if (direction === 'UP') {
    e1 = { x: cx - spread, y: cy - offset };
    e2 = { x: cx + spread, y: cy - offset };
  } else if (direction === 'DOWN') {
    e1 = { x: cx - spread, y: cy + offset };
    e2 = { x: cx + spread, y: cy + offset };
  }

  ctx.fillStyle = '#052e16';
  ctx.beginPath();
  ctx.arc(e1.x, e1.y, 2.5, 0, Math.PI * 2);
  ctx.arc(e2.x, e2.y, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

// Keyboard controls
window.addEventListener('keydown', (e) => {
  const keyMap = {
    ArrowUp: 'UP',
    KeyW: 'UP',
    ArrowDown: 'DOWN',
    KeyS: 'DOWN',
    ArrowLeft: 'LEFT',
    KeyA: 'LEFT',
    ArrowRight: 'RIGHT',
    KeyD: 'RIGHT',
  };

  if (keyMap[e.code]) {
    e.preventDefault();
    if (gameState === 'IDLE') startGame();
    queueDirection(keyMap[e.code]);
  } else if (e.code === 'Space') {
    e.preventDefault();
    if (gameState === 'IDLE' || gameState === 'GAME_OVER') startGame();
    else togglePause();
  }
});

// Touch swipe support
let touchStart = null;
canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  touchStart = { x: t.clientX, y: t.clientY };
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    queueDirection(dx > 0 ? 'RIGHT' : 'LEFT');
  } else {
    queueDirection(dy > 0 ? 'DOWN' : 'UP');
  }
  touchStart = null;
}, { passive: true });

// UI buttons
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
speedSelect.addEventListener('change', () => {
  if (gameState === 'PLAYING') startLoop();
});
muteBtn.addEventListener('click', () => {
  muted = !muted;
  muteBtn.textContent = muted ? 'เสียง: ปิด' : 'เสียง: เปิด';
});

document.querySelectorAll('.dpad-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (gameState === 'IDLE') startGame();
    queueDirection(btn.dataset.dir);
  });
});

// Initial render
resetGame();
