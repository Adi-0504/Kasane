"use strict";

import {
  CONFIG,
  COLORS,
  SFX,
  KEYS
} from "./config.js";

import {
  createPiece,
  cells,
  createRandomizer,
  getShape
} from "./pieces.js";

import {
  createBoard,
  collides,
  tryMove,
  tryRotate,
  merge,
  clearLines,
  ghostY,
  isPerfectClear,
  isTSpin
} from "./board.js";

import {
  getMode,
  getLevel,
  scoringLines
} from "./modes.js";

import {
  loadData,
  saveData,
  saveSettings,
  recordGame,
  clearRecords,
  formatTime
} from "./strorage.js";

import {
  unlockAudio,
  playSFX
} from "./audio.js";


/* =========================================================
 * DATA
 * ========================================================= */

const data = loadData();

window.KasaneData = data;

window.KasaneSaveSettings = settings => {
  data.settings = {
    ...data.settings,
    ...settings
  };

  saveData(data);
};


/* =========================================================
 * DOM
 * ========================================================= */

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  Array.from(document.querySelectorAll(selector));


const screens = {
  home: $("#homeScreen"),
  setup: $("#setupScreen"),
  game: $("#gameScreen"),
  result: $("#resultScreen"),
  records: $("#recordsScreen"),
  settings: $("#settingsScreen")
};


const elements = {
  backButton: $("#backButton"),
  menuButton: $("#menuButton"),
  startButton: $("#startButton"),
  recordsButton: $("#recordsButton"),
  settingsButton: $("#settingsButton"),
  beginButton: $("#beginButton"),

  gameCanvas: $("#gameCanvas"),
  holdCanvas: $("#holdCanvas"),

  pauseButton: $("#pauseButton"),
  resumeButton: $("#resumeButton"),
  pauseOverlay: $("#pauseOverlay"),

  againButton: $("#againButton"),
  homeButton: $("#homeButton"),
  clearRecordsButton: $("#clearRecordsButton"),

  soundToggle: $("#soundToggle"),
  musicToggle: $("#musicToggle"),
  ghostToggle: $("#ghostToggle"),
  hapticToggle: $("#hapticToggle"),
  motionToggle: $("#motionToggle"),
  themeSelect: $("#themeSelect"),

  modeLabel: $("#modeLabel"),
  levelLabel: $("#levelLabel"),
  scoreLabel: $("#scoreLabel"),
  linesLabel: $("#linesLabel"),
  comboLabel: $("#comboLabel"),
  b2bLabel: $("#b2bLabel"),

  scoreLabelMobile: $("#scoreLabelMobile"),
  linesLabelMobile: $("#linesLabelMobile"),

  homeBestScore: $("#homeBestScore"),

  gamesStat: $("#gamesStat"),
  bestStat: $("#bestStat"),
  linesStat: $("#linesStat"),
  sprintStat: $("#sprintStat"),

  recordList: $("#recordList"),

  resultMarkText: $("#resultMarkText"),
  resultKicker: $("#resultKicker"),
  resultTitle: $("#resultTitle"),
  resultDescription: $("#resultDescription"),
  resultScore: $("#resultScore"),
  resultLines: $("#resultLines"),
  resultLevel: $("#resultLevel"),

  toast: $("#toast")
};


const canvas =
  elements.gameCanvas;

const ctx =
  canvas?.getContext("2d");

const holdCanvas =
  elements.holdCanvas;

const holdCtx =
  holdCanvas?.getContext("2d");

const nextCanvases =
  $$(".next-list canvas");


/* =========================================================
 * GAME
 * ========================================================= */

const game = {

  running: false,
  paused: false,
  over: false,

  mode: "marathon",
  modeConfig: getMode("marathon"),

  board: createBoard(),
  randomizer: createRandomizer(),

  current: null,
  next: [],
  hold: null,
  holdUsed: false,

  score: 0,
  lines: 0,
  level: 1,

  combo: -1,
  b2b: false,

  lastActionWasRotation: false,

  lockStartedAt: null,
  accumulator: 0,
  lastTime: 0,
  startTime: 0,

  dropInterval: 900,

  softDropping: false,

  animationFrame: null,

  touchRepeat: null,
  touchAction: null,

  gesture: {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startTime: 0,
    moved: false
  }

};


let currentScreen = "home";
let selectedMode = "marathon";
let toastTimer = null;


/* =========================================================
 * SETTINGS
 * ========================================================= */

function syncSettings() {

  if (elements.soundToggle) {
    elements.soundToggle.checked =
      data.settings.sound !== false;
  }

  if (elements.musicToggle) {
    elements.musicToggle.checked =
      data.settings.music !== false;
  }

  if (elements.ghostToggle) {
    elements.ghostToggle.checked =
      data.settings.ghost !== false;
  }

  if (elements.hapticToggle) {
    elements.hapticToggle.checked =
      data.settings.haptic !== false;
  }

  if (elements.motionToggle) {
    elements.motionToggle.checked =
      data.settings.motion !== false;
  }

  if (elements.themeSelect) {
    elements.themeSelect.value =
      data.settings.theme || "system";
  }

}


function updateSetting(key, value) {

  data.settings[key] = value;

  saveSettings(
    data,
    data.settings
  );

  window.KasaneData = data;

}


function applyTheme() {

  document.documentElement.dataset.theme =
    data.settings.theme || "system";

}


function initializeSettings() {

  syncSettings();
  applyTheme();

}


/* =========================================================
 * NAVIGATION
 * ========================================================= */

function showScreen(name) {

  Object.entries(screens).forEach(
    ([key, screen]) => {

      if (!screen) {
        return;
      }

      screen.classList.toggle(
        "active",
        key === name
      );

    }
  );

  currentScreen = name;

  if (name === "home") {
    updateHome();
  }

  if (name === "records") {
    renderRecords();
  }

  if (name === "settings") {
    syncSettings();
  }

  if (name === "game") {
    requestAnimationFrame(() => {
      resizeCanvas();
      draw();
    });
  }

}


function goHome() {

  if (
    game.running &&
    !game.over
  ) {
    pauseGame();
  }

  showScreen("home");

}


/* =========================================================
 * MODE
 * ========================================================= */

function setupModeSelection() {

  $$(".mode-card").forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          $$(".mode-card").forEach(
            item =>
              item.classList.remove("selected")
          );

          button.classList.add("selected");

          selectedMode =
            button.dataset.mode ||
            "marathon";

          playSFX(SFX.move);

        }
      );

    }
  );

}


/* =========================================================
 * RANDOMIZER
 * ========================================================= */

function fillNextQueue() {

  while (
    game.next.length <
    CONFIG.NEXT_COUNT
  ) {

    game.next.push(
      game.randomizer.next()
    );

  }

}


function takeNextPiece() {

  fillNextQueue();

  const type =
    game.next.shift();

  fillNextQueue();

  return createPiece(type);

}


/* =========================================================
 * START
 * ========================================================= */

function startGame(
  modeId = selectedMode
) {

  unlockAudio();

  game.running = true;
  game.paused = false;
  game.over = false;

  game.mode = modeId;
  game.modeConfig = getMode(modeId);

  game.board = createBoard();
  game.randomizer = createRandomizer();

  game.next = [];
  game.hold = null;
  game.holdUsed = false;

  game.score = 0;
  game.lines = 0;
  game.level = 1;

  game.combo = -1;
  game.b2b = false;

  game.lastActionWasRotation = false;

  game.lockStartedAt = null;
  game.accumulator = 0;

  game.lastTime = performance.now();
  game.startTime = performance.now();

  game.softDropping = false;

  game.modeConfig.duration =
    Number(game.modeConfig.duration) || 120;

  game.ultraEndTime =
    game.modeConfig.timed
      ? performance.now() +
        game.modeConfig.duration * 1000
      : null;

  fillNextQueue();

  game.current =
    takeNextPiece();

  updateGravity();
  updateGameUI();

  showScreen("game");

  resetGesture();
  focusGameCanvas();

  playSFX(SFX.resume);

  cancelAnimationFrame(
    game.animationFrame
  );

  game.animationFrame =
    requestAnimationFrame(loop);

}


/* =========================================================
 * LOOP
 * ========================================================= */

function loop(timestamp) {

  if (!game.running) {
    return;
  }

  const delta =
    Math.min(
      100,
      timestamp -
      game.lastTime
    );

  game.lastTime =
    timestamp;

  if (
    !game.paused &&
    !game.over
  ) {

    update(
      delta,
      timestamp
    );

  }

  draw();

  game.animationFrame =
    requestAnimationFrame(loop);

}


/* =========================================================
 * UPDATE
 * ========================================================= */

function update(
  delta,
  timestamp
) {

  if (
    game.modeConfig.timed &&
    game.ultraEndTime
  ) {

    const remaining =
      Math.max(
        0,
        game.ultraEndTime -
        timestamp
      );

    if (remaining <= 0) {

      finishGame(true);

      return;

    }

  }

  game.accumulator += delta;

  const interval =
    game.softDropping
      ? Math.max(
          18,
          game.dropInterval /
          CONFIG.SOFT_DROP_FACTOR
        )
      : game.dropInterval;

  while (
    game.accumulator >= interval
  ) {

    game.accumulator -= interval;

    const moved =
      tryMove(
        game.board,
        game.current,
        0,
        1
      );

    if (moved) {

      game.current = moved;
      game.lockStartedAt = null;

    } else {

      if (
        game.lockStartedAt === null
      ) {

        game.lockStartedAt =
          timestamp;

      }

      if (
        timestamp -
        game.lockStartedAt >=
        CONFIG.LOCK_DELAY
      ) {

        lockPiece();

        break;

      }

    }

  }

  updateGameUI();

}


/* =========================================================
 * GRAVITY
 * ========================================================= */

function updateGravity() {

  game.level =
    getLevel(
      game.lines,
      game.mode
    );

  game.dropInterval =
    game.modeConfig.gravity(
      game.level
    );

}


/* =========================================================
 * MOVE
 * ========================================================= */

function moveHorizontal(direction) {

  if (!canPlay()) {
    return false;
  }

  const moved =
    tryMove(
      game.board,
      game.current,
      direction,
      0
    );

  if (!moved) {
    return false;
  }

  game.current = moved;
  game.lastActionWasRotation = false;
  game.lockStartedAt = null;

  playSFX(
    SFX.move,
    {
      cooldownMs: 35
    }
  );

  vibrate(4);

  draw();

  return true;

}


/* =========================================================
 * SOFT DROP
 * ========================================================= */

function softDrop() {

  if (!canPlay()) {
    return false;
  }

  const moved =
    tryMove(
      game.board,
      game.current,
      0,
      1
    );

  if (!moved) {
    return false;
  }

  game.current = moved;

  game.lastActionWasRotation = false;
  game.lockStartedAt = null;

  game.score +=
    CONFIG.SCORE.softDrop;

  draw();

  return true;

}


/* =========================================================
 * HARD DROP
 * ========================================================= */

function hardDrop() {

  if (!canPlay()) {
    return;
  }

  let distance = 0;

  while (true) {

    const moved =
      tryMove(
        game.board,
        game.current,
        0,
        1
      );

    if (!moved) {
      break;
    }

    game.current = moved;
    distance++;

  }

  game.score +=
    distance *
    CONFIG.SCORE.hardDrop;

  playSFX(SFX.drop);

  vibrate(12);

  lockPiece();

}


/* =========================================================
 * ROTATE
 * ========================================================= */

function rotate(direction) {

  if (!canPlay()) {
    return false;
  }

  const result =
    tryRotate(
      game.board,
      game.current,
      direction
    );

  if (!result) {
    return false;
  }

  game.current =
    result.piece;

  game.lastActionWasRotation = true;
  game.lockStartedAt = null;

  playSFX(
    SFX.rotate,
    {
      cooldownMs: 40
    }
  );

  vibrate(5);

  draw();

  return true;

}


/* =========================================================
 * HOLD
 * ========================================================= */

function holdPiece() {

  if (
    !canPlay() ||
    game.holdUsed
  ) {
    return;
  }

  const currentType =
    game.current.type;

  if (game.hold) {

    const nextType =
      game.hold;

    game.hold =
      currentType;

    game.current =
      createPiece(nextType);

  } else {

    game.hold =
      currentType;

    game.current =
      takeNextPiece();

  }

  game.holdUsed = true;
  game.lockStartedAt = null;
  game.lastActionWasRotation = false;

  playSFX(SFX.hold);

  vibrate(8);

  draw();

}


/* =========================================================
 * LOCK
 * ========================================================= */

function lockPiece() {

  if (!game.current) {
    return;
  }

  const wasTSpin =
    isTSpin(
      game.board,
      game.current,
      game.lastActionWasRotation
    );

  game.board =
    merge(
      game.board,
      game.current
    );

  playSFX(SFX.lock);

  const result =
    clearLines(game.board);

  game.board =
    result.board;

  const cleared =
    result.lines;

  if (wasTSpin) {

    scoreTSpin(cleared);

  } else if (cleared > 0) {

    scoreNormalClear(cleared);

  } else {

    game.combo = -1;
    game.lastClearWasSpecial = false;

  }

  game.lines += cleared;

  updateGravity();

  if (cleared > 0) {

    playClearSound(
      cleared,
      wasTSpin
    );

    vibrate(
      cleared >= 4
        ? 30
        : 12
    );

  }

  if (
    isPerfectClear(game.board) &&
    cleared > 0
  ) {

    game.score +=
      CONFIG.SCORE.perfectClear;

    showToast("Perfect Clear");

  }

  if (
    game.mode === "sprint" &&
    game.lines >=
    game.modeConfig.target
  ) {

    finishGame(true);

    return;

  }

  game.current =
    takeNextPiece();

  game.holdUsed = false;
  game.lockStartedAt = null;
  game.lastActionWasRotation = false;

  if (
    collides(
      game.board,
      game.current
    )
  ) {

    finishGame(false);

  }

}


/* =========================================================
 * SCORE
 * ========================================================= */

function scoreNormalClear(lines) {

  game.combo += 1;

  let score =
    scoringLines(
      lines,
      game.level
    );

  if (lines === 4) {

    if (game.b2b) {

      score =
        Math.floor(
          score * 1.5
        );

    }

    game.b2b = true;

  } else {

    game.b2b = false;

  }

  if (game.combo > 0) {

    score +=
      game.combo *
      CONFIG.SCORE.combo;

    playSFX(SFX.combo);

  }

  game.score += score;

}


function scoreTSpin(lines) {

  game.combo += 1;

  let score = 0;

  if (lines === 1) {
    score = CONFIG.SCORE.tSpinSingle;
  } else if (lines === 2) {
    score = CONFIG.SCORE.tSpinDouble;
  } else if (lines === 3) {
    score = CONFIG.SCORE.tSpinTriple;
  } else {
    score = CONFIG.SCORE.tSpinMini;
  }

  score *= game.level;

  if (game.b2b) {
    score =
      Math.floor(
        score * 1.5
      );
  }

  game.b2b =
    lines > 0;

  game.score += score;

  playSFX(SFX.tSpin);

}


function playClearSound(
  lines,
  tSpin
) {

  if (tSpin) {
    playSFX(SFX.tSpin);
    return;
  }

  if (lines >= 4) {

    playSFX(SFX.tetris);

    showToast("TETRIS");

    return;

  }

  playSFX(SFX.line);

}


/* =========================================================
 * PAUSE
 * ========================================================= */

function pauseGame() {

  if (
    !game.running ||
    game.over
  ) {
    return;
  }

  if (game.paused) {
    resumeGame();
    return;
  }

  game.paused = true;
  game.softDropping = false;

  stopRepeat();
  resetGesture();

  if (elements.pauseOverlay) {
    elements.pauseOverlay.hidden = false;
  }

  playSFX(SFX.pause);

  draw();

}


function resumeGame() {

  if (
    !game.running ||
    game.over
  ) {
    return;
  }

  game.paused = false;

  game.lastTime =
    performance.now();

  game.accumulator = 0;

  if (elements.pauseOverlay) {
    elements.pauseOverlay.hidden = true;
  }

  unlockAudio();

  playSFX(SFX.resume);

  focusGameCanvas();

  draw();

}


/* =========================================================
 * FINISH
 * ========================================================= */

function finishGame(completed) {

  if (game.over) {
    return;
  }

  game.over = true;
  game.running = false;
  game.paused = false;
  game.softDropping = false;

  stopRepeat();
  resetGesture();

  const elapsed =
    (
      performance.now() -
      game.startTime
    ) /
    1000;

  const result = {

    mode: game.mode,

    score: game.score,

    lines: game.lines,

    level: game.level,

    time:
      game.mode === "ultra"
        ? 120
        : elapsed,

    completed:
      Boolean(completed)

  };

  recordGame(
    data,
    result
  );

  window.KasaneData =
    data;

  playSFX(
    completed
      ? SFX.level
      : SFX.gameover
  );

  vibrate(
    completed
      ? 35
      : 60
  );

  showResult(result);

  updateHome();

}


/* =========================================================
 * RESULT
 * ========================================================= */

function showResult(result) {

  if (elements.resultScore) {
    elements.resultScore.textContent =
      String(result.score);
  }

  if (elements.resultLines) {
    elements.resultLines.textContent =
      String(result.lines);
  }

  if (elements.resultLevel) {
    elements.resultLevel.textContent =
      String(result.level);
  }

  if (elements.resultMarkText) {
    elements.resultMarkText.textContent =
      result.completed
        ? "CLEAR"
        : "GAME";
  }

  if (elements.resultKicker) {
    elements.resultKicker.textContent =
      result.completed
        ? "GAME COMPLETE"
        : "GAME OVER";
  }

  if (elements.resultTitle) {

    if (
      result.mode === "sprint" &&
      result.completed
    ) {

      elements.resultTitle.textContent =
        "40 行完成";

    } else if (
      result.mode === "ultra"
    ) {

      elements.resultTitle.textContent =
        "時間到";

    } else {

      elements.resultTitle.textContent =
        result.completed
          ? "完成得很好"
          : "這局結束了";

    }

  }

  if (elements.resultDescription) {

    elements.resultDescription.textContent =
      result.mode === "sprint"
        ? (
            result.completed
              ? `用時 ${formatTime(result.time)}`
              : `已完成 ${result.lines} 行`
          )
        : (
            `${result.lines} 行 · ${result.score} 分`
          );

  }

  showScreen("result");

}


/* =========================================================
 * PLAY STATE
 * ========================================================= */

function canPlay() {

  return (
    game.running &&
    !game.paused &&
    !game.over &&
    Boolean(game.current)
  );

}


/* =========================================================
 * CANVAS
 * ========================================================= */

function resizeCanvas() {

  if (!canvas || !ctx) {
    return;
  }

  const rect =
    canvas.getBoundingClientRect();

  const dpr =
    Math.min(
      window.devicePixelRatio || 1,
      3
    );

  const width =
    Math.max(
      1,
      Math.round(
        rect.width * dpr
      )
    );

  const height =
    Math.max(
      1,
      Math.round(
        rect.height * dpr
      )
    );

  if (
    canvas.width !== width ||
    canvas.height !== height
  ) {

    canvas.width = width;
    canvas.height = height;

  }

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

}


function getBoardGeometry() {

  const rect =
    canvas.getBoundingClientRect();

  const width =
    rect.width;

  const height =
    rect.height;

  const cell =
    Math.min(
      width / CONFIG.WIDTH,
      height / CONFIG.HEIGHT
    );

  const boardWidth =
    cell * CONFIG.WIDTH;

  const boardHeight =
    cell * CONFIG.HEIGHT;

  return {

    x:
      (width - boardWidth) / 2,

    y:
      (height - boardHeight) / 2,

    cell,

    width: boardWidth,

    height: boardHeight

  };

}


/* =========================================================
 * DRAW
 * ========================================================= */

function draw() {

  if (!canvas || !ctx) {
    return;
  }

  resizeCanvas();

  const rect =
    canvas.getBoundingClientRect();

  ctx.clearRect(
    0,
    0,
    rect.width,
    rect.height
  );

  const g =
    getBoardGeometry();

  drawBoardBackground(g);
  drawGrid(g);
  drawPlacedBlocks(g);

  if (game.current) {

    if (
      data.settings.ghost !== false
    ) {

      drawGhost(g);

    }

    drawPiece(
      g,
      game.current,
      1
    );

  }

  drawBoardFrame(g);

  drawSidePreviews();

}


function drawBoardBackground(g) {

  const gradient =
    ctx.createLinearGradient(
      0,
      g.y,
      0,
      g.y + g.height
    );

  gradient.addColorStop(
    0,
    "#f4ecd9"
  );

  gradient.addColorStop(
    1,
    "#e7dbc0"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    g.x,
    g.y,
    g.width,
    g.height
  );

}


function drawGrid(g) {

  ctx.save();

  ctx.strokeStyle =
    "rgba(71,90,97,.12)";

  ctx.lineWidth = 1;

  for (
    let x = 0;
    x <= CONFIG.WIDTH;
    x++
  ) {

    const px =
      g.x + x * g.cell;

    ctx.beginPath();

    ctx.moveTo(
      px,
      g.y
    );

    ctx.lineTo(
      px,
      g.y + g.height
    );

    ctx.stroke();

  }

  for (
    let y = 0;
    y <= CONFIG.HEIGHT;
    y++
  ) {

    const py =
      g.y + y * g.cell;

    ctx.beginPath();

    ctx.moveTo(
      g.x,
      py
    );

    ctx.lineTo(
      g.x + g.width,
      py
    );

    ctx.stroke();

  }

  ctx.restore();

}


function drawPlacedBlocks(g) {

  const hidden =
    CONFIG.HIDDEN_ROWS;

  for (
    let y = hidden;
    y < game.board.length;
    y++
  ) {

    for (
      let x = 0;
      x < CONFIG.WIDTH;
      x++
    ) {

      const type =
        game.board[y][x];

      if (!type) {
        continue;
      }

      drawCell(
        g,
        x,
        y - hidden,
        type,
        1
      );

    }

  }

}


function drawGhost(g) {

  const gy =
    ghostY(
      game.board,
      game.current
    );

  drawPiece(
    g,
    {
      ...game.current,
      y: gy
    },
    0.20
  );

}


function drawPiece(
  g,
  piece,
  alpha
) {

  const hidden =
    CONFIG.HIDDEN_ROWS;

  for (
    const cell of cells(piece)
  ) {

    const visibleY =
      cell.y - hidden;

    if (
      visibleY < 0 ||
      visibleY >= CONFIG.HEIGHT
    ) {
      continue;
    }

    drawCell(
      g,
      cell.x,
      visibleY,
      piece.type,
      alpha
    );

  }

}


function drawCell(
  g,
  x,
  y,
  type,
  alpha
) {

  const px =
    g.x + x * g.cell;

  const py =
    g.y + y * g.cell;

  const size =
    g.cell;

  ctx.save();

  ctx.globalAlpha =
    alpha;

  const color =
    COLORS[type] || "#888";

  if (alpha < 1) {

    ctx.strokeStyle = color;

    ctx.lineWidth =
      Math.max(
        1,
        size * 0.08
      );

    ctx.strokeRect(
      px + size * .13,
      py + size * .13,
      size * .74,
      size * .74
    );

    ctx.restore();

    return;

  }

  const gradient =
    ctx.createLinearGradient(
      px,
      py,
      px + size,
      py + size
    );

  gradient.addColorStop(
    0,
    lighten(color, .15)
  );

  gradient.addColorStop(
    1,
    color
  );

  ctx.fillStyle =
    gradient;

  roundRect(
    ctx,
    px + size * .07,
    py + size * .07,
    size * .86,
    size * .86,
    size * .16
  );

  ctx.fill();

  ctx.strokeStyle =
    "rgba(255,255,255,.30)";

  ctx.lineWidth =
    Math.max(
      1,
      size * .045
    );

  roundRect(
    ctx,
    px + size * .07,
    py + size * .07,
    size * .86,
    size * .86,
    size * .16
  );

  ctx.stroke();

  ctx.restore();

}


function drawBoardFrame(g) {

  ctx.save();

  ctx.strokeStyle =
    "rgba(71,90,97,.42)";

  ctx.lineWidth = 2;

  ctx.strokeRect(
    g.x,
    g.y,
    g.width,
    g.height
  );

  ctx.restore();

}


/* =========================================================
 * PREVIEW
 * ========================================================= */

function drawSidePreviews() {

  drawMiniPiece(
    holdCtx,
    holdCanvas,
    game.hold
  );

  nextCanvases.forEach(
    (nextCanvas, index) => {

      drawMiniPiece(
        nextCanvas.getContext("2d"),
        nextCanvas,
        game.next[index]
      );

    }
  );

}


function drawMiniPiece(
  context,
  targetCanvas,
  type
) {

  if (
    !context ||
    !targetCanvas
  ) {
    return;
  }

  const rect =
    targetCanvas.getBoundingClientRect();

  const dpr =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );

  const width =
    Math.max(
      1,
      Math.round(rect.width * dpr)
    );

  const height =
    Math.max(
      1,
      Math.round(rect.height * dpr)
    );

  if (
    targetCanvas.width !== width ||
    targetCanvas.height !== height
  ) {

    targetCanvas.width = width;
    targetCanvas.height = height;

  }

  context.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

  context.clearRect(
    0,
    0,
    rect.width,
    rect.height
  );

  if (!type) {
    return;
  }

  const shape =
    getShape(type, 0);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (
    let y = 0;
    y < shape.length;
    y++
  ) {

    for (
      let x = 0;
      x < shape[y].length;
      x++
    ) {

      if (!shape[y][x]) {
        continue;
      }

      minX =
        Math.min(minX, x);

      minY =
        Math.min(minY, y);

      maxX =
        Math.max(maxX, x);

      maxY =
        Math.max(maxY, y);

    }

  }

  const cellsWidth =
    maxX - minX + 1;

  const cellsHeight =
    maxY - minY + 1;

  const size =
    Math.min(
      22,
      rect.width / (cellsWidth + 1),
      rect.height / (cellsHeight + 1)
    );

  const offsetX =
    (
      rect.width -
      cellsWidth * size
    ) / 2;

  const offsetY =
    (
      rect.height -
      cellsHeight * size
    ) / 2;

  for (
    let y = 0;
    y < shape.length;
    y++
  ) {

    for (
      let x = 0;
      x < shape[y].length;
      x++
    ) {

      if (!shape[y][x]) {
        continue;
      }

      drawMiniCell(
        context,
        offsetX +
          (x - minX) * size,
        offsetY +
          (y - minY) * size,
        size,
        COLORS[type]
      );

    }

  }

}


function drawMiniCell(
  context,
  x,
  y,
  size,
  color
) {

  context.save();

  context.fillStyle =
    color;

  roundRect(
    context,
    x + size * .08,
    y + size * .08,
    size * .84,
    size * .84,
    size * .15
  );

  context.fill();

  context.strokeStyle =
    "rgba(255,255,255,.35)";

  context.lineWidth =
    Math.max(
      1,
      size * .04
    );

  context.stroke();

  context.restore();

}


/* =========================================================
 * UI
 * ========================================================= */

function updateGameUI() {

  if (elements.modeLabel) {
    elements.modeLabel.textContent =
      game.modeConfig.name;
  }

  if (elements.levelLabel) {
    elements.levelLabel.textContent =
      String(game.level);
  }

  if (elements.scoreLabel) {
    elements.scoreLabel.textContent =
      String(game.score);
  }

  if (elements.linesLabel) {
    elements.linesLabel.textContent =
      String(game.lines);
  }

  if (elements.comboLabel) {
    elements.comboLabel.textContent =
      String(
        Math.max(0, game.combo)
      );
  }

  if (elements.b2bLabel) {
    elements.b2bLabel.textContent =
      game.b2b ? "ON" : "0";
  }

  if (elements.scoreLabelMobile) {
    elements.scoreLabelMobile.textContent =
      String(game.score);
  }

  if (elements.linesLabelMobile) {
    elements.linesLabelMobile.textContent =
      String(game.lines);
  }

  drawSidePreviews();

}


function updateHome() {

  if (elements.homeBestScore) {
    elements.homeBestScore.textContent =
      String(
        data.stats.bestScore || 0
      );
  }

}


/* =========================================================
 * RECORDS
 * ========================================================= */

function renderRecords() {

  if (elements.gamesStat) {
    elements.gamesStat.textContent =
      String(data.stats.games || 0);
  }

  if (elements.bestStat) {
    elements.bestStat.textContent =
      String(data.stats.bestScore || 0);
  }

  if (elements.linesStat) {
    elements.linesStat.textContent =
      String(data.stats.bestLines || 0);
  }

  if (elements.sprintStat) {
    elements.sprintStat.textContent =
      formatTime(data.stats.bestSprint);
  }

  if (!elements.recordList) {
    return;
  }

  elements.recordList.innerHTML = "";

  if (!data.records.length) {

    const empty =
      document.createElement("div");

    empty.className =
      "record-empty";

    empty.textContent =
      "還沒有棋局紀錄。";

    elements.recordList.appendChild(
      empty
    );

    return;

  }

  data.records.forEach(
    record => {

      const item =
        document.createElement("div");

      item.className =
        "record-item";

      const date =
        new Date(record.date);

      const dateText =
        date.toLocaleDateString(
          "zh-TW"
        );

      item.innerHTML = `
        <div>
          <strong>
            ${escapeHTML(record.mode)}
          </strong>
          <span>
            ${dateText}
          </span>
        </div>

        <div>
          <strong>
            ${record.score}
          </strong>
          <span>
            ${record.lines} 行
          </span>
        </div>
      `;

      elements.recordList.appendChild(
        item
      );

    }
  );

}


/* =========================================================
 * KEYBOARD
 * ========================================================= */

function setupKeyboard() {

  window.addEventListener(
    "keydown",
    event => {

      if (
        currentScreen !== "game"
      ) {
        return;
      }

      unlockAudio();

      if (
        matches(
          KEYS.pause,
          event.key
        )
      ) {

        event.preventDefault();

        pauseGame();

        return;

      }

      if (game.paused) {
        return;
      }

      if (
        matches(
          KEYS.left,
          event.key
        )
      ) {

        event.preventDefault();

        if (!event.repeat) {
          moveHorizontal(-1);
        }

        return;

      }

      if (
        matches(
          KEYS.right,
          event.key
        )
      ) {

        event.preventDefault();

        if (!event.repeat) {
          moveHorizontal(1);
        }

        return;

      }

      if (
        matches(
          KEYS.down,
          event.key
        )
      ) {

        event.preventDefault();

        game.softDropping = true;

        if (!event.repeat) {
          softDrop();
        }

        return;

      }

      if (
        matches(
          KEYS.rotate,
          event.key
        )
      ) {

        event.preventDefault();

        if (!event.repeat) {
          rotate(1);
        }

        return;

      }

      if (
        matches(
          KEYS.rotateCCW,
          event.key
        )
      ) {

        event.preventDefault();

        if (!event.repeat) {
          rotate(-1);
        }

        return;

      }

      if (
        matches(
          KEYS.drop,
          event.key
        )
      ) {

        event.preventDefault();

        if (!event.repeat) {
          hardDrop();
        }

        return;

      }

      if (
        matches(
          KEYS.hold,
          event.key
        )
      ) {

        event.preventDefault();

        if (!event.repeat) {
          holdPiece();
        }

      }

    }
  );


  window.addEventListener(
    "keyup",
    event => {

      if (
        matches(
          KEYS.down,
          event.key
        )
      ) {

        game.softDropping = false;

      }

    }
  );

}


/* =========================================================
 * MOBILE BUTTONS
 * ========================================================= */

function setupMobileControls() {

  $$(".control-button").forEach(
    button => {

      const action =
        button.dataset.action;

      button.addEventListener(
        "pointerdown",
        event => {

          event.preventDefault();
          event.stopPropagation();

          try {
            button.setPointerCapture(
              event.pointerId
            );
          } catch {}

          unlockAudio();

          if (!canPlay()) {
            return;
          }

          switch (action) {

            case "left":
              moveHorizontal(-1);
              startRepeat("left");
              break;

            case "right":
              moveHorizontal(1);
              startRepeat("right");
              break;

            case "down":
              game.softDropping = true;
              softDrop();
              break;

            case "rotate":
              rotate(1);
              break;

            case "rotateCCW":
              rotate(-1);
              break;

            case "drop":
              hardDrop();
              break;

            case "hold":
              holdPiece();
              break;

          }

        },
        {
          passive: false
        }
      );


      button.addEventListener(
        "pointerup",
        event => {

          event.preventDefault();

          stopRepeat();

          if (
            action === "down"
          ) {

            game.softDropping =
              false;

          }

        },
        {
          passive: false
        }
      );


      button.addEventListener(
        "pointercancel",
        () => {

          stopRepeat();

          game.softDropping =
            false;

        }
      );


      button.addEventListener(
        "pointerleave",
        () => {

          stopRepeat();

        }
      );

    }
  );

}


/* =========================================================
 * DAS / ARR
 * ========================================================= */

function startRepeat(action) {

  stopRepeat();

  game.touchAction =
    action;

  game.touchRepeat =
    window.setTimeout(
      () => {

        game.touchRepeat =
          window.setInterval(
            () => {

              if (!canPlay()) {
                return;
              }

              if (action === "left") {
                moveHorizontal(-1);
              } else {
                moveHorizontal(1);
              }

            },
            CONFIG.ARR
          );

      },
      CONFIG.DAS
    );

}


function stopRepeat() {

  if (
    game.touchRepeat !== null
  ) {

    clearTimeout(
      game.touchRepeat
    );

    clearInterval(
      game.touchRepeat
    );

  }

  game.touchRepeat = null;
  game.touchAction = null;

}


/* =========================================================
 * TOUCH / SWIPE GAMEPLAY
 * ========================================================= */

function resetGesture() {

  game.gesture.active = false;
  game.gesture.pointerId = null;
  game.gesture.startX = 0;
  game.gesture.startY = 0;
  game.gesture.lastX = 0;
  game.gesture.lastY = 0;
  game.gesture.startTime = 0;
  game.gesture.moved = false;

}


function setupCanvasPointer() {

  if (!canvas) {
    return;
  }

  canvas.style.touchAction = "none";

  canvas.addEventListener(
    "contextmenu",
    event => {
      event.preventDefault();
    }
  );


  canvas.addEventListener(
    "pointerdown",
    event => {

      if (
        currentScreen !== "game"
      ) {
        return;
      }

      if (
        event.pointerType === "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();

      unlockAudio();

      if (!canPlay()) {
        return;
      }

      game.gesture.active = true;
      game.gesture.pointerId =
        event.pointerId;

      game.gesture.startX =
        event.clientX;

      game.gesture.startY =
        event.clientY;

      game.gesture.lastX =
        event.clientX;

      game.gesture.lastY =
        event.clientY;

      game.gesture.startTime =
        performance.now();

      game.gesture.moved = false;

      try {
        canvas.setPointerCapture(
          event.pointerId
        );
      } catch {}

    },
    {
      passive: false
    }
  );


  canvas.addEventListener(
    "pointermove",
    event => {

      if (
        !game.gesture.active ||
        event.pointerId !==
        game.gesture.pointerId
      ) {
        return;
      }

      event.preventDefault();

      if (!canPlay()) {
        return;
      }

      const dx =
        event.clientX -
        game.gesture.lastX;

      const dy =
        event.clientY -
        game.gesture.lastY;

      const totalX =
        event.clientX -
        game.gesture.startX;

      const totalY =
        event.clientY -
        game.gesture.startY;

      const boardWidth =
        canvas.getBoundingClientRect().width;

      const step =
        Math.max(
          22,
          boardWidth * 0.075
        );

      if (
        Math.abs(totalX) >
        Math.abs(totalY)
      ) {

        if (
          Math.abs(dx) >= step
        ) {

          const count =
            Math.floor(
              Math.abs(dx) / step
            );

          const direction =
            dx > 0 ? 1 : -1;

          for (
            let i = 0;
            i < count;
            i++
          ) {

            moveHorizontal(
              direction
            );

          }

          game.gesture.lastX =
            event.clientX;

          game.gesture.moved =
            true;

        }

      } else if (
        dy > 0 &&
        Math.abs(dy) >= step
      ) {

        softDrop();

        game.gesture.lastY =
          event.clientY;

        game.gesture.moved =
          true;

      }

    },
    {
      passive: false
    }
  );


  canvas.addEventListener(
    "pointerup",
    event => {

      if (
        event.pointerId !==
        game.gesture.pointerId
      ) {
        return;
      }

      event.preventDefault();

      if (
        canPlay() &&
        !game.gesture.moved
      ) {

        const duration =
          performance.now() -
          game.gesture.startTime;

        const dx =
          event.clientX -
          game.gesture.startX;

        const dy =
          event.clientY -
          game.gesture.startY;

        /*
         * Short tap:
         * rotate clockwise.
         */

        if (
          duration < 260 &&
          Math.abs(dx) < 18 &&
          Math.abs(dy) < 18
        ) {

          rotate(1);

        }

        /*
         * Fast downward flick:
         * hard drop.
         */

        else if (
          dy > 90 &&
          duration < 260
        ) {

          hardDrop();

        }

      }

      resetGesture();

    },
    {
      passive: false
    }
  );


  canvas.addEventListener(
    "pointercancel",
    event => {

      if (
        event.pointerId ===
        game.gesture.pointerId
      ) {

        resetGesture();

      }

    }
  );

}


/* =========================================================
 * SETTINGS
 * ========================================================= */

function setupSettingsEvents() {

  elements.soundToggle?.addEventListener(
    "change",
    () => {

      updateSetting(
        "sound",
        elements.soundToggle.checked
      );

      if (
        elements.soundToggle.checked
      ) {

        unlockAudio();

      }

    }
  );


  elements.musicToggle?.addEventListener(
    "change",
    () => {

      updateSetting(
        "music",
        elements.musicToggle.checked
      );

      window.GomokuAudio
        ?.setMusicEnabled
        ?.(
          elements.musicToggle.checked
        );

      if (
        elements.musicToggle.checked
      ) {

        unlockAudio();

      }

    }
  );


  elements.ghostToggle?.addEventListener(
    "change",
    () => {

      updateSetting(
        "ghost",
        elements.ghostToggle.checked
      );

      draw();

    }
  );


  elements.hapticToggle?.addEventListener(
    "change",
    () => {

      updateSetting(
        "haptic",
        elements.hapticToggle.checked
      );

    }
  );


  elements.motionToggle?.addEventListener(
    "change",
    () => {

      updateSetting(
        "motion",
        elements.motionToggle.checked
      );

    }
  );


  elements.themeSelect?.addEventListener(
    "change",
    () => {

      updateSetting(
        "theme",
        elements.themeSelect.value
      );

      applyTheme();

    }
  );

}


/* =========================================================
 * NAVIGATION
 * ========================================================= */

function setupNavigation() {

  elements.startButton?.addEventListener(
    "click",
    () => showScreen("setup")
  );


  elements.recordsButton?.addEventListener(
    "click",
    () => showScreen("records")
  );


  elements.settingsButton?.addEventListener(
    "click",
    () => showScreen("settings")
  );


  elements.beginButton?.addEventListener(
    "click",
    () => startGame(selectedMode)
  );


  elements.pauseButton?.addEventListener(
    "click",
    pauseGame
  );


  elements.resumeButton?.addEventListener(
    "click",
    resumeGame
  );


  elements.againButton?.addEventListener(
    "click",
    () => startGame(game.mode)
  );


  elements.homeButton?.addEventListener(
    "click",
    () => showScreen("home")
  );


  elements.backButton?.addEventListener(
    "click",
    () => showScreen("home")
  );


  elements.menuButton?.addEventListener(
    "click",
    () => {

      if (
        currentScreen === "game"
      ) {

        pauseGame();

      } else {

        showScreen("settings");

      }

    }
  );


  elements.clearRecordsButton?.addEventListener(
    "click",
    () => {

      clearRecords(data);

      showToast(
        "紀錄已清除"
      );

      renderRecords();
      updateHome();

    }
  );

}


/* =========================================================
 * AUDIO BRIDGE
 * ========================================================= */

function installAudioBridge() {

  window.KasaneStartGame =
    () => unlockAudio();

  window.KasaneData =
    data;

}


/* =========================================================
 * HAPTIC
 * ========================================================= */

function vibrate(duration) {

  if (
    data.settings.haptic === false
  ) {
    return;
  }

  if (
    typeof navigator.vibrate !==
    "function"
  ) {
    return;
  }

  try {
    navigator.vibrate(duration);
  } catch {}

}


/* =========================================================
 * TOAST
 * ========================================================= */

function showToast(message) {

  if (!elements.toast) {
    return;
  }

  elements.toast.textContent =
    message;

  elements.toast.classList.add(
    "visible"
  );

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(
      () => {

        elements.toast.classList.remove(
          "visible"
        );

      },
      1300
    );

}


/* =========================================================
 * FOCUS
 * ========================================================= */

function focusGameCanvas() {

  if (!canvas) {
    return;
  }

  try {
    canvas.focus({
      preventScroll: true
    });
  } catch {}

}


/* =========================================================
 * HELPERS
 * ========================================================= */

function matches(keys, value) {

  return (
    Array.isArray(keys) &&
    keys.includes(value)
  );

}


function roundRect(
  context,
  x,
  y,
  width,
  height,
  radius
) {

  const r =
    Math.min(
      radius,
      width / 2,
      height / 2
    );

  context.beginPath();

  context.moveTo(
    x + r,
    y
  );

  context.arcTo(
    x + width,
    y,
    x + width,
    y + height,
    r
  );

  context.arcTo(
    x + width,
    y + height,
    x,
    y + height,
    r
  );

  context.arcTo(
    x,
    y + height,
    x,
    y,
    r
  );

  context.arcTo(
    x,
    y,
    x + width,
    y,
    r
  );

  context.closePath();

}


function lighten(hex, amount) {

  const value =
    hex.replace("#", "");

  const r =
    parseInt(
      value.slice(0, 2),
      16
    );

  const g =
    parseInt(
      value.slice(2, 4),
      16
    );

  const b =
    parseInt(
      value.slice(4, 6),
      16
    );

  const nr =
    Math.min(
      255,
      Math.round(
        r +
        (255 - r) *
        amount
      )
    );

  const ng =
    Math.min(
      255,
      Math.round(
        g +
        (255 - g) *
        amount
      )
    );

  const nb =
    Math.min(
      255,
      Math.round(
        b +
        (255 - b) *
        amount
      )
    );

  return `rgb(${nr}, ${ng}, ${nb})`;

}


function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
 * RESIZE
 * ========================================================= */

function handleResize() {

  if (
    currentScreen === "game"
  ) {

    requestAnimationFrame(
      () => {

        resizeCanvas();
        draw();

      }
    );

  }

}


window.addEventListener(
  "resize",
  handleResize,
  {
    passive: true
  }
);


window.addEventListener(
  "orientationchange",
  () => {

    window.setTimeout(
      handleResize,
      100
    );

    window.setTimeout(
      handleResize,
      400
    );

  },
  {
    passive: true
  }
);


/* =========================================================
 * VISIBILITY
 * ========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden &&
      game.running &&
      !game.paused &&
      !game.over
    ) {

      pauseGame();

    }

  }
);


/* =========================================================
 * INITIALIZE
 * ========================================================= */

function init() {

  initializeSettings();

  setupModeSelection();

  setupNavigation();

  setupKeyboard();

  setupMobileControls();

  setupCanvasPointer();

  setupSettingsEvents();

  installAudioBridge();

  updateHome();

  renderRecords();

  resizeCanvas();

  draw();

}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    init,
    {
      once: true
    }
  );

} else {

  init();

}
