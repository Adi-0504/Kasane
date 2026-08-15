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
   DATA
========================================================= */

const data = loadData();

window.KasaneData = data;


/* =========================================================
   DOM
========================================================= */

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  Array.from(
    document.querySelectorAll(selector)
  );


const screens = {
  home: $("#homeScreen"),
  setup: $("#setupScreen"),
  game: $("#gameScreen"),
  result: $("#resultScreen"),
  records: $("#recordsScreen"),
  settings: $("#settingsScreen")
};


const elements = {
  backButton:
    $("#backButton"),

  backButtonRecords:
    $("#backButtonRecords"),

  backButtonSettings:
    $("#backButtonSettings"),

  menuButton:
    $("#menuButton"),

  startButton:
    $("#startButton"),

  recordsButton:
    $("#recordsButton"),

  settingsButton:
    $("#settingsButton"),

  beginButton:
    $("#beginButton"),

  gameCanvas:
    $("#gameCanvas"),

  holdCanvas:
    $("#holdCanvas"),

  pauseButton:
    $("#pauseButton"),

  resumeButton:
    $("#resumeButton"),

  pauseOverlay:
    $("#pauseOverlay"),

  againButton:
    $("#againButton"),

  homeButton:
    $("#homeButton"),

  clearRecordsButton:
    $("#clearRecordsButton"),

  soundToggle:
    $("#soundToggle"),

  musicToggle:
    $("#musicToggle"),

  ghostToggle:
    $("#ghostToggle"),

  hapticToggle:
    $("#hapticToggle"),

  motionToggle:
    $("#motionToggle"),

  themeSelect:
    $("#themeSelect"),

  modeLabel:
    $("#modeLabel"),

  levelLabel:
    $("#levelLabel"),

  scoreLabel:
    $("#scoreLabel"),

  linesLabel:
    $("#linesLabel"),

  comboLabel:
    $("#comboLabel"),

  b2bLabel:
    $("#b2bLabel"),

  scoreLabelMobile:
    $("#scoreLabelMobile"),

  linesLabelMobile:
    $("#linesLabelMobile"),

  homeBestScore:
    $("#homeBestScore"),

  gamesStat:
    $("#gamesStat"),

  bestStat:
    $("#bestStat"),

  linesStat:
    $("#linesStat"),

  sprintStat:
    $("#sprintStat"),

  recordList:
    $("#recordList"),

  resultMarkText:
    $("#resultMarkText"),

  resultKicker:
    $("#resultKicker"),

  resultTitle:
    $("#resultTitle"),

  resultDescription:
    $("#resultDescription"),

  resultScore:
    $("#resultScore"),

  resultLines:
    $("#resultLines"),

  resultLevel:
    $("#resultLevel"),

  toast:
    $("#toast"),

  touchHint:
    $("#touchHint")
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
   GAME STATE
========================================================= */

const game = {

  running: false,

  paused: false,

  over: false,

  mode: "marathon",

  modeConfig:
    getMode("marathon"),

  board:
    createBoard(),

  randomizer:
    createRandomizer(),

  current: null,

  next: [],

  hold: null,

  holdUsed: false,

  score: 0,

  lines: 0,

  level: 1,

  combo: -1,

  b2b: false,

  lastActionWasRotation:
    false,

  lockStartedAt:
    null,

  lastTime: 0,

  accumulator: 0,

  startTime: 0,

  ultraEndTime:
    null,

  ultraRemaining:
    120,

  animationFrame:
    null,

  dropInterval:
    900,

  softDropping:
    false,

  lastClearWasSpecial:
    false

};


/* =========================================================
   TOUCH STATE
========================================================= */

const touch = {

  active: false,

  pointerId: null,

  startX: 0,

  startY: 0,

  lastX: 0,

  lastY: 0,

  moved: false,

  horizontalSteps: 0,

  downSteps: 0,

  startTime: 0,

  lastTapTime: 0,

  longPressTimer: null,

  suppressClickUntil: 0

};


const TOUCH = {

  MOVE_THRESHOLD: 22,

  VERTICAL_THRESHOLD: 25,

  TAP_MAX_TIME: 230,

  DOUBLE_TAP_TIME: 300,

  LONG_PRESS_TIME: 480

};


/* =========================================================
   I18N
========================================================= */

const translations = {

  "zh-TW": {

    "home.eyebrow":
      "STACK WITH FLOW",

    "home.title":
      "一層一層，堆出節奏。",

    "home.description":
      "簡單開始，越玩越順。找出屬於你的落塊節奏。",

    "home.play":
      "開始遊戲",

    "home.records":
      "紀錄",

    "home.settings":
      "設定",

    "stats.best":
      "BEST",

    "stats.games":
      "GAMES",

    "stats.lines":
      "LINES",

    "setup.kicker":
      "GAME MODE",

    "setup.title":
      "選擇模式",

    "setup.begin":
      "開始",

    "modes.marathon":
      "MARATHON",

    "modes.marathonDescription":
      "慢慢變快，挑戰自己的最高分",

    "modes.sprint":
      "SPRINT",

    "modes.sprintDescription":
      "40 行，看你能多快完成",

    "modes.ultra":
      "ULTRA",

    "modes.ultraDescription":
      "120 秒，分數越高越好",

    "game.level":
      "LEVEL",

    "game.pause":
      "暫停",

    "game.resume":
      "繼續",

    "game.paused":
      "PAUSED",

    "game.pausedTitle":
      "休息一下",

    "game.hold":
      "HOLD",

    "game.next":
      "NEXT",

    "game.score":
      "SCORE",

    "game.lines":
      "LINES",

    "game.combo":
      "COMBO",

    "game.touchHint":
      "左右拖曳移動・上滑落下・點擊旋轉",

    "result.score":
      "SCORE",

    "result.lines":
      "LINES",

    "result.level":
      "LEVEL",

    "result.again":
      "再玩一次",

    "result.home":
      "回首頁",

    "records.kicker":
      "HISTORY",

    "records.title":
      "遊戲紀錄",

    "records.clear":
      "清除紀錄",

    "settings.kicker":
      "PREFERENCES",

    "settings.title":
      "設定",

    "settings.sound":
      "音效",

    "settings.soundDescription":
      "遊戲操作音效",

    "settings.music":
      "音樂",

    "settings.musicDescription":
      "背景音樂",

    "settings.ghost":
      "Ghost",

    "settings.ghostDescription":
      "顯示落點提示",

    "settings.haptic":
      "觸覺回饋",

    "settings.hapticDescription":
      "操作時提供輕微震動",

    "settings.motion":
      "動畫",

    "settings.motionDescription":
      "啟用介面動態效果",

    "settings.theme":
      "Theme",

    "settings.themeDescription":
      "選擇顯示主題",

    "settings.system":
      "系統",

    "settings.light":
      "淺色",

    "settings.dark":
      "深色"

  }

};


let currentLanguage =
  "zh-TW";


function t(key) {

  return (
    translations[currentLanguage]?.[key] ||
    key
  );

}


function applyI18n() {

  $$("[data-i18n]")
    .forEach(
      element => {

        const key =
          element.dataset.i18n;

        element.textContent =
          t(key);

      }
    );

}


window.KasaneSetLanguage =
  language => {

    if (
      translations[language]
    ) {

      currentLanguage =
        language;

      applyI18n();

    }

  };


/* =========================================================
   SETTINGS
========================================================= */

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
      data.settings.theme ||
      "system";

  }

}


function updateSetting(
  key,
  value
) {

  data.settings[key] =
    value;

  saveSettings(
    data,
    data.settings
  );

  window.KasaneData =
    data;

}


function applyTheme() {

  const theme =
    data.settings.theme ||
    "system";

  document.documentElement
    .dataset
    .theme =
      theme;

}


function initializeSettings() {

  syncSettings();

  applyTheme();

}


/* =========================================================
   NAVIGATION
========================================================= */

let currentScreen =
  "home";


function showScreen(
  name
) {

  Object.entries(
    screens
  )
  .forEach(
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


  currentScreen =
    name;


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

    requestAnimationFrame(
      () => {

        resizeCanvas();

        draw();

      }
    );

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
   MODE
========================================================= */

let selectedMode =
  "marathon";


function setupModeSelection() {

  $$(".mode-card")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            $$(".mode-card")
              .forEach(
                item =>
                  item.classList.remove(
                    "selected"
                  )
              );

            button.classList.add(
              "selected"
            );

            selectedMode =
              button.dataset.mode ||
              "marathon";

            playSFX(
              SFX.move
            );

          }
        );

      }
    );

}


/* =========================================================
   QUEUE
========================================================= */

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

  return createPiece(
    type
  );

}


/* =========================================================
   START
========================================================= */

function startGame(
  modeId = selectedMode
) {

  unlockAudio();

  game.running =
    true;

  game.paused =
    false;

  game.over =
    false;

  game.mode =
    modeId;

  game.modeConfig =
    getMode(modeId);

  game.board =
    createBoard();

  game.randomizer =
    createRandomizer();

  game.next =
    [];

  game.hold =
    null;

  game.holdUsed =
    false;

  game.score =
    0;

  game.lines =
    0;

  game.level =
    1;

  game.combo =
    -1;

  game.b2b =
    false;

  game.lastActionWasRotation =
    false;

  game.lockStartedAt =
    null;

  game.accumulator =
    0;

  game.lastTime =
    performance.now();

  game.startTime =
    performance.now();

  game.ultraRemaining =
    game.modeConfig.duration ||
    120;

  game.ultraEndTime =
    game.modeConfig.timed
      ? performance.now() +
        game.modeConfig.duration *
        1000
      : null;

  game.softDropping =
    false;


  fillNextQueue();


  game.current =
    takeNextPiece();


  updateGravity();

  updateGameUI();

  showScreen(
    "game"
  );

  resetTouchState();

  focusGameCanvas();

  hideTouchHintLater();

  playSFX(
    SFX.resume
  );


  cancelAnimationFrame(
    game.animationFrame
  );


  game.animationFrame =
    requestAnimationFrame(
      loop
    );

}


/* =========================================================
   LOOP
========================================================= */

function loop(
  timestamp
) {

  if (
    !game.running
  ) {

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
    requestAnimationFrame(
      loop
    );

}


/* =========================================================
   UPDATE
========================================================= */

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


    game.ultraRemaining =
      remaining / 1000;


    if (
      remaining <= 0
    ) {

      finishGame(
        true
      );

      return;

    }

  }


  game.accumulator +=
    delta;


  const interval =
    game.softDropping
      ? Math.max(
          45,
          game.dropInterval /
          CONFIG.SOFT_DROP_FACTOR
        )
      : game.dropInterval;


  while (
    game.accumulator >=
    interval
  ) {

    game.accumulator -=
      interval;


    const moved =
      tryMove(
        game.board,
        game.current,
        0,
        1
      );


    if (moved) {

      game.current =
        moved;

      game.lockStartedAt =
        null;

    } else {

      if (
        game.lockStartedAt ===
        null
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
   GRAVITY
========================================================= */

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
   MOVE
========================================================= */

function moveHorizontal(
  direction
) {

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


  game.current =
    moved;


  game.lastActionWasRotation =
    false;

  game.lockStartedAt =
    null;


  playSFX(
    SFX.move,
    {
      cooldownMs:
        35
    }
  );


  vibrate(4);

  draw();

  return true;

}


/* =========================================================
   SOFT DROP
========================================================= */

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


  game.current =
    moved;


  game.lastActionWasRotation =
    false;

  game.score +=
    CONFIG.SCORE.softDrop;

  game.lockStartedAt =
    null;


  draw();

  return true;

}


/* =========================================================
   HARD DROP
========================================================= */

function hardDrop() {

  if (!canPlay()) {

    return;

  }


  let distance =
    0;


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


    game.current =
      moved;

    distance++;

  }


  game.score +=
    distance *
    CONFIG.SCORE.hardDrop;


  playSFX(
    SFX.drop
  );


  vibrate(10);

  lockPiece();

}


/* =========================================================
   ROTATE
========================================================= */

function rotate(
  direction = 1
) {

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


  game.lastActionWasRotation =
    true;

  game.lockStartedAt =
    null;


  playSFX(
    SFX.rotate,
    {
      cooldownMs:
        40
    }
  );


  vibrate(4);

  draw();

  return true;

}


/* =========================================================
   HOLD
========================================================= */

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

    const holdType =
      game.hold;

    game.hold =
      currentType;

    game.current =
      createPiece(
        holdType
      );

  } else {

    game.hold =
      currentType;

    game.current =
      takeNextPiece();

  }


  game.holdUsed =
    true;

  game.lockStartedAt =
    null;

  game.lastActionWasRotation =
    false;


  playSFX(
    SFX.hold
  );


  vibrate(7);

  draw();

}


/* =========================================================
   LOCK
========================================================= */

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


  playSFX(
    SFX.lock
  );


  const result =
    clearLines(
      game.board
    );


  game.board =
    result.board;


  const cleared =
    result.lines;


  if (wasTSpin) {

    game.lastClearWasSpecial =
      true;

    scoreTSpin(
      cleared
    );

  } else if (
    cleared > 0
  ) {

    scoreNormalClear(
      cleared
    );

  } else {

    game.combo =
      -1;

    game.lastClearWasSpecial =
      false;

  }


  game.lines +=
    cleared;


  updateGravity();


  if (cleared > 0) {

    playClearSound(
      cleared,
      wasTSpin
    );


    vibrate(
      cleared >= 4
        ? 28
        : 10
    );

  }


  if (
    isPerfectClear(
      game.board
    ) &&
    cleared > 0
  ) {

    game.score +=
      CONFIG.SCORE.perfectClear;

    showToast(
      "Perfect Clear"
    );

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


  game.holdUsed =
    false;

  game.lockStartedAt =
    null;

  game.lastActionWasRotation =
    false;


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
   SCORING
========================================================= */

function scoreNormalClear(
  lines
) {

  game.combo += 1;


  let score =
    scoringLines(
      lines,
      game.level
    );


  if (
    lines === 4
  ) {

    if (game.b2b) {

      score =
        Math.floor(
          score * 1.5
        );

    }

    game.b2b =
      true;

  } else {

    game.b2b =
      false;

  }


  if (
    game.combo > 0
  ) {

    score +=
      game.combo *
      CONFIG.SCORE.combo;

    playSFX(
      SFX.combo
    );

  }


  game.score +=
    score;

}


function scoreTSpin(
  lines
) {

  game.combo +=
    1;


  let score =
    CONFIG.SCORE.tSpinMini;


  if (lines === 1) {

    score =
      CONFIG.SCORE.tSpinSingle;

  } else if (lines === 2) {

    score =
      CONFIG.SCORE.tSpinDouble;

  } else if (lines === 3) {

    score =
      CONFIG.SCORE.tSpinTriple;

  }


  score *=
    game.level;


  if (game.b2b) {

    score =
      Math.floor(
        score * 1.5
      );

  }


  game.b2b =
    lines > 0;


  game.score +=
    score;


  playSFX(
    SFX.tSpin
  );

}


function playClearSound(
  lines,
  tSpin
) {

  if (tSpin) {

    playSFX(
      SFX.tSpin
    );

    return;

  }


  if (lines >= 4) {

    playSFX(
      SFX.tetris
    );

    showToast(
      "TETRIS"
    );

    return;

  }


  playSFX(
    SFX.line
  );

}


/* =========================================================
   PAUSE
========================================================= */

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


  game.paused =
    true;

  game.softDropping =
    false;


  if (elements.pauseOverlay) {

    elements.pauseOverlay.hidden =
      false;

  }


  playSFX(
    SFX.pause
  );


  draw();

}


function resumeGame() {

  if (
    !game.running ||
    game.over
  ) {

    return;

  }


  game.paused =
    false;

  game.lastTime =
    performance.now();

  game.accumulator =
    0;


  if (elements.pauseOverlay) {

    elements.pauseOverlay.hidden =
      true;

  }


  unlockAudio();

  playSFX(
    SFX.resume
  );


  focusGameCanvas();

  draw();

}


/* =========================================================
   FINISH
========================================================= */

function finishGame(
  completed
) {

  if (game.over) {

    return;

  }


  game.over =
    true;

  game.running =
    false;

  game.paused =
    false;

  game.softDropping =
    false;


  cancelAnimationFrame(
    game.animationFrame
  );


  const elapsed =
    (
      performance.now() -
      game.startTime
    ) / 1000;


  const result = {

    mode:
      game.mode,

    score:
      game.score,

    lines:
      game.lines,

    level:
      game.level,

    time:
      game.mode === "ultra"
        ? 120
        : elapsed,

    completed:
      Boolean(
        completed
      )

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
      ? 32
      : 55
  );


  showResult(
    result
  );

}


/* =========================================================
   RESULT
========================================================= */

function showResult(
  result
) {

  if (elements.resultScore) {

    elements.resultScore.textContent =
      String(
        result.score
      );

  }


  if (elements.resultLines) {

    elements.resultLines.textContent =
      String(
        result.lines
      );

  }


  if (elements.resultLevel) {

    elements.resultLevel.textContent =
      String(
        result.level
      );

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
        : `${result.lines} 行 · ${result.score} 分`;

  }


  showScreen(
    "result"
  );

}


/* =========================================================
   CAN PLAY
========================================================= */

function canPlay() {

  return (
    game.running &&
    !game.paused &&
    !game.over &&
    Boolean(
      game.current
    )
  );

}


/* =========================================================
   CANVAS
========================================================= */

function resizeCanvas() {

  if (
    !canvas ||
    !ctx
  ) {

    return;

  }


  const rect =
    canvas.getBoundingClientRect();


  const dpr =
    Math.min(
      window.devicePixelRatio ||
      1,
      2
    );


  const width =
    Math.max(
      1,
      Math.floor(
        rect.width *
        dpr
      )
    );


  const height =
    Math.max(
      1,
      Math.floor(
        rect.height *
        dpr
      )
    );


  if (
    canvas.width !== width ||
    canvas.height !== height
  ) {

    canvas.width =
      width;

    canvas.height =
      height;

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
      width /
        CONFIG.WIDTH,
      height /
        CONFIG.HEIGHT
    );


  const boardWidth =
    cell *
    CONFIG.WIDTH;


  const boardHeight =
    cell *
    CONFIG.HEIGHT;


  return {

    x:
      (width -
       boardWidth) / 2,

    y:
      (height -
       boardHeight) / 2,

    cell,

    width:
      boardWidth,

    height:
      boardHeight

  };

}


/* =========================================================
   DRAW
========================================================= */

function draw() {

  if (
    !canvas ||
    !ctx
  ) {

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
    "#f5efdd"
  );


  gradient.addColorStop(
    1,
    "#e5dac1"
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
    "rgba(71,90,97,0.10)";


  ctx.lineWidth =
    1;


  for (
    let x = 0;
    x <= CONFIG.WIDTH;
    x++
  ) {

    const px =
      g.x +
      x *
      g.cell;


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
      g.y +
      y *
      g.cell;


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


  const ghostPiece = {

    ...game.current,

    y:
      gy

  };


  drawPiece(
    g,
    ghostPiece,
    0.22
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
      cell.y -
      hidden;


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
    g.x +
    x *
    g.cell;


  const py =
    g.y +
    y *
    g.cell;


  const size =
    g.cell;


  ctx.save();


  ctx.globalAlpha =
    alpha;


  const color =
    COLORS[type] ||
    "#888";


  if (
    alpha < 1
  ) {

    ctx.strokeStyle =
      color;

    ctx.lineWidth =
      Math.max(
        1,
        size * 0.07
      );

    roundRect(
      ctx,
      px + size * 0.16,
      py + size * 0.16,
      size * 0.68,
      size * 0.68,
      size * 0.12
    );

    ctx.stroke();

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
    lighten(
      color,
      0.18
    )
  );


  gradient.addColorStop(
    1,
    color
  );


  ctx.fillStyle =
    gradient;


  roundRect(
    ctx,
    px + size * 0.065,
    py + size * 0.065,
    size * 0.87,
    size * 0.87,
    size * 0.17
  );


  ctx.fill();


  ctx.strokeStyle =
    "rgba(255,255,255,0.30)";


  ctx.lineWidth =
    Math.max(
      1,
      size * 0.04
    );


  roundRect(
    ctx,
    px + size * 0.065,
    py + size * 0.065,
    size * 0.87,
    size * 0.87,
    size * 0.17
  );


  ctx.stroke();


  ctx.restore();

}


function drawBoardFrame(g) {

  ctx.save();


  ctx.strokeStyle =
    "rgba(71,90,97,0.34)";


  ctx.lineWidth =
    2;


  ctx.strokeRect(
    g.x,
    g.y,
    g.width,
    g.height
  );


  ctx.restore();

}


/* =========================================================
   PREVIEWS
========================================================= */

function drawSidePreviews() {

  drawMiniPiece(
    holdCtx,
    holdCanvas,
    game.hold
  );


  nextCanvases
    .forEach(
      (
        nextCanvas,
        index
      ) => {

        drawMiniPiece(
          nextCanvas.getContext(
            "2d"
          ),
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


  const width =
    targetCanvas.width;

  const height =
    targetCanvas.height;


  context.clearRect(
    0,
    0,
    width,
    height
  );


  if (!type) {

    return;

  }


  const shape =
    getShape(
      type,
      0
    );


  let minX =
    Infinity;

  let minY =
    Infinity;

  let maxX =
    -Infinity;

  let maxY =
    -Infinity;


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
        Math.min(
          minX,
          x
        );

      minY =
        Math.min(
          minY,
          y
        );

      maxX =
        Math.max(
          maxX,
          x
        );

      maxY =
        Math.max(
          maxY,
          y
        );

    }

  }


  const cellsWidth =
    maxX -
    minX +
    1;


  const cellsHeight =
    maxY -
    minY +
    1;


  const size =
    Math.min(
      22,
      width /
        (
          cellsWidth + 1
        ),
      height /
        (
          cellsHeight + 1
        )
    );


  const offsetX =
    (
      width -
      cellsWidth * size
    ) / 2;


  const offsetY =
    (
      height -
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
        (
          x - minX
        ) * size,
        offsetY +
        (
          y - minY
        ) * size,
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
    x + size * 0.08,
    y + size * 0.08,
    size * 0.84,
    size * 0.84,
    size * 0.15
  );


  context.fill();


  context.strokeStyle =
    "rgba(255,255,255,0.36)";


  context.lineWidth =
    Math.max(
      1,
      size * 0.04
    );


  context.stroke();


  context.restore();

}


/* =========================================================
   UI
========================================================= */

function updateGameUI() {

  if (elements.modeLabel) {

    elements.modeLabel.textContent =
      game.modeConfig.name;

  }


  if (elements.levelLabel) {

    elements.levelLabel.textContent =
      String(
        game.level
      );

  }


  if (elements.scoreLabel) {

    elements.scoreLabel.textContent =
      String(
        game.score
      );

  }


  if (elements.linesLabel) {

    elements.linesLabel.textContent =
      String(
        game.lines
      );

  }


  if (elements.comboLabel) {

    elements.comboLabel.textContent =
      String(
        Math.max(
          0,
          game.combo
        )
      );

  }


  if (elements.b2bLabel) {

    elements.b2bLabel.textContent =
      game.b2b
        ? "ON"
        : "0";

  }


  if (elements.scoreLabelMobile) {

    elements.scoreLabelMobile.textContent =
      String(
        game.score
      );

  }


  if (elements.linesLabelMobile) {

    elements.linesLabelMobile.textContent =
      String(
        game.lines
      );

  }


  drawSidePreviews();

}


function updateHome() {

  if (elements.homeBestScore) {

    elements.homeBestScore.textContent =
      String(
        data.stats.bestScore ||
        0
      );

  }


  if (elements.gamesStat) {

    elements.gamesStat.textContent =
      String(
        data.stats.games ||
        0
      );

  }

}


/* =========================================================
   RECORDS
========================================================= */

function renderRecords() {

  if (elements.gamesStat) {

    elements.gamesStat.textContent =
      String(
        data.stats.games ||
        0
      );

  }


  if (elements.bestStat) {

    elements.bestStat.textContent =
      String(
        data.stats.bestScore ||
        0
      );

  }


  if (elements.linesStat) {

    elements.linesStat.textContent =
      String(
        data.stats.bestLines ||
        0
      );

  }


  if (elements.sprintStat) {

    elements.sprintStat.textContent =
      formatTime(
        data.stats.bestSprint
      );

  }


  if (!elements.recordList) {

    return;

  }


  elements.recordList.innerHTML =
    "";


  if (!data.records.length) {

    const empty =
      document.createElement(
        "div"
      );


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
        document.createElement(
          "div"
        );


      item.className =
        "record-item";


      const date =
        new Date(
          record.date
        );


      const dateText =
        date.toLocaleDateString(
          "zh-TW"
        );


      item.innerHTML = `

        <div>

          <strong>
            ${escapeHTML(
              record.mode
            )}
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
   KEYBOARD
========================================================= */

function setupKeyboard() {

  window.addEventListener(
    "keydown",
    event => {

      if (
        currentScreen !==
        "game"
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

        moveHorizontal(-1);

        return;

      }


      if (
        matches(
          KEYS.right,
          event.key
        )
      ) {

        event.preventDefault();

        moveHorizontal(1);

        return;

      }


      if (
        matches(
          KEYS.down,
          event.key
        )
      ) {

        event.preventDefault();

        game.softDropping =
          true;

        softDrop();

        return;

      }


      if (
        matches(
          KEYS.rotate,
          event.key
        )
      ) {

        event.preventDefault();

        rotate(1);

        return;

      }


      if (
        matches(
          KEYS.rotateCCW,
          event.key
        )
      ) {

        event.preventDefault();

        rotate(-1);

        return;

      }


      if (
        matches(
          KEYS.drop,
          event.key
        )
      ) {

        event.preventDefault();

        hardDrop();

        return;

      }


      if (
        matches(
          KEYS.hold,
          event.key
        )
      ) {

        event.preventDefault();

        holdPiece();

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

        game.softDropping =
          false;

      }

    }
  );

}


/* =========================================================
   TOUCH CONTROLS
========================================================= */

function setupTouchControls() {

  if (!canvas) {

    return;

  }


  canvas.addEventListener(
    "pointerdown",
    onTouchStart,
    {
      passive: false
    }
  );


  canvas.addEventListener(
    "pointermove",
    onTouchMove,
    {
      passive: false
    }
  );


  canvas.addEventListener(
    "pointerup",
    onTouchEnd,
    {
      passive: false
    }
  );


  canvas.addEventListener(
    "pointercancel",
    onTouchCancel,
    {
      passive: false
    }
  );


  canvas.addEventListener(
    "pointerleave",
    event => {

      if (
        event.pointerType ===
        "mouse"
      ) {

        return;

      }

    }
  );

}


function onTouchStart(
  event
) {

  if (
    event.pointerType ===
    "mouse"
  ) {

    return;

  }


  if (
    currentScreen !==
    "game"
  ) {

    return;

  }


  event.preventDefault();


  unlockAudio();


  if (
    touch.active
  ) {

    return;

  }


  touch.active =
    true;

  touch.pointerId =
    event.pointerId;

  touch.startX =
    event.clientX;

  touch.startY =
    event.clientY;

  touch.lastX =
    event.clientX;

  touch.lastY =
    event.clientY;

  touch.moved =
    false;

  touch.horizontalSteps =
    0;

  touch.downSteps =
    0;

  touch.startTime =
    performance.now();


  try {

    canvas.setPointerCapture(
      event.pointerId
    );

  } catch {}


  clearTimeout(
    touch.longPressTimer
  );


  touch.longPressTimer =
    setTimeout(
      () => {

        if (
          touch.active &&
          !touch.moved
        ) {

          touch.suppressClickUntil =
            performance.now() + 180;

        }

      },
      TOUCH.LONG_PRESS_TIME
    );

}


function onTouchMove(
  event
) {

  if (
    !touch.active ||
    event.pointerId !==
    touch.pointerId
  ) {

    return;

  }


  event.preventDefault();


  if (!canPlay()) {

    return;

  }


  const x =
    event.clientX;

  const y =
    event.clientY;


  const dx =
    x -
    touch.startX;

  const dy =
    y -
    touch.startY;


  const deltaX =
    x -
    touch.lastX;

  const deltaY =
    y -
    touch.lastY;


  if (
    Math.abs(dx) >
    TOUCH.MOVE_THRESHOLD ||
    Math.abs(dy) >
    TOUCH.VERTICAL_THRESHOLD
  ) {

    touch.moved =
      true;

  }


  /*
   * HORIZONTAL DRAG
   *
   * 每跨過一格 threshold 才移動一次。
   * 不使用 setInterval。
   * 所以長按不會爆掉。
   */

  const horizontalThreshold =
    27;


  if (
    Math.abs(dx) >=
    horizontalThreshold
  ) {

    const expectedSteps =
      Math.trunc(
        dx /
        horizontalThreshold
      );


    while (
      touch.horizontalSteps <
      expectedSteps
    ) {

      moveHorizontal(1);

      touch.horizontalSteps++;

    }


    while (
      touch.horizontalSteps >
      expectedSteps
    ) {

      moveHorizontal(-1);

      touch.horizontalSteps--;

    }

  }


  /*
   * DOWN DRAG
   */

  if (
    dy >
    TOUCH.VERTICAL_THRESHOLD
  ) {

    const expectedDownSteps =
      Math.floor(
        dy /
        24
      );


    while (
      touch.downSteps <
      expectedDownSteps
    ) {

      softDrop();

      touch.downSteps++;

    }

  }


  /*
   * Keep movement reference.
   */

  touch.lastX =
    x;

  touch.lastY =
    y;

}


function onTouchEnd(
  event
) {

  if (
    !touch.active ||
    event.pointerId !==
    touch.pointerId
  ) {

    return;

  }


  event.preventDefault();


  clearTimeout(
    touch.longPressTimer
  );


  const elapsed =
    performance.now() -
    touch.startTime;


  const dx =
    event.clientX -
    touch.startX;

  const dy =
    event.clientY -
    touch.startY;


  const absX =
    Math.abs(dx);

  const absY =
    Math.abs(dy);


  touch.active =
    false;


  try {

    canvas.releasePointerCapture(
      event.pointerId
    );

  } catch {}


  /*
   * Long press:
   *
   * 不執行任何遊戲動作。
   */

  if (
    elapsed >=
    TOUCH.LONG_PRESS_TIME &&
    !touch.moved
  ) {

    resetTouchState();

    return;

  }


  /*
   * Swipe up:
   *
   * Hard drop.
   */

  if (
    dy <
    -TOUCH.VERTICAL_THRESHOLD &&
    absY >
    absX * 1.15
  ) {

    hardDrop();

    resetTouchState();

    return;

  }


  /*
   * Swipe down:
   *
   * Soft drop already happened during drag.
   */

  if (
    dy >
    TOUCH.VERTICAL_THRESHOLD &&
    absY >
    absX * 1.15
  ) {

    resetTouchState();

    return;

  }


  /*
   * Horizontal swipe:
   *
   * Movement already happened.
   */

  if (
    absX >
    TOUCH.MOVE_THRESHOLD &&
    absX >
    absY * 1.15
  ) {

    resetTouchState();

    return;

  }


  /*
   * Tap:
   *
   * Single tap = rotate
   * Double tap = hold
   */

  if (
    !touch.moved &&
    elapsed <=
    TOUCH.TAP_MAX_TIME
  ) {

    const now =
      performance.now();


    if (
      now -
      touch.lastTapTime <
      TOUCH.DOUBLE_TAP_TIME
    ) {

      touch.lastTapTime =
        0;

      holdPiece();

    } else {

      touch.lastTapTime =
        now;

      window.setTimeout(
        () => {

          if (
            touch.lastTapTime ===
            now
          ) {

            rotate(1);

            touch.lastTapTime =
              0;

          }

        },
        TOUCH.DOUBLE_TAP_TIME
      );

    }

  }


  resetTouchState();

}


function onTouchCancel(
  event
) {

  if (
    event.pointerId !==
    touch.pointerId
  ) {

    return;

  }


  clearTimeout(
    touch.longPressTimer
  );


  game.softDropping =
    false;


  resetTouchState();

}


function resetTouchState() {

  touch.active =
    false;

  touch.pointerId =
    null;

  touch.moved =
    false;

  touch.horizontalSteps =
    0;

  touch.downSteps =
    0;

  clearTimeout(
    touch.longPressTimer
  );

}


/* =========================================================
   TOUCH HINT
========================================================= */

function hideTouchHintLater() {

  if (
    !elements.touchHint
  ) {

    return;

  }


  elements.touchHint.classList.remove(
    "hidden"
  );


  window.setTimeout(
    () => {

      elements.touchHint?.classList.add(
        "hidden"
      );

    },
    4200
  );

}


/* =========================================================
   SETTINGS EVENTS
========================================================= */

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
   NAVIGATION EVENTS
========================================================= */

function setupNavigation() {

  elements.startButton?.addEventListener(
    "click",
    () => {

      showScreen(
        "setup"
      );

    }
  );


  elements.recordsButton?.addEventListener(
    "click",
    () => {

      showScreen(
        "records"
      );

    }
  );


  elements.settingsButton?.addEventListener(
    "click",
    () => {

      showScreen(
        "settings"
      );

    }
  );


  elements.beginButton?.addEventListener(
    "click",
    () => {

      startGame(
        selectedMode
      );

    }
  );


  elements.pauseButton?.addEventListener(
    "click",
    () => {

      pauseGame();

    }
  );


  elements.resumeButton?.addEventListener(
    "click",
    () => {

      resumeGame();

    }
  );


  elements.againButton?.addEventListener(
    "click",
    () => {

      startGame(
        game.mode
      );

    }
  );


  elements.homeButton?.addEventListener(
    "click",
    () => {

      showScreen(
        "home"
      );

    }
  );


  elements.backButton?.addEventListener(
    "click",
    () => {

      showScreen(
        "home"
      );

    }
  );


  elements.backButtonRecords?.addEventListener(
    "click",
    () => {

      showScreen(
        "home"
      );

    }
  );


  elements.backButtonSettings?.addEventListener(
    "click",
    () => {

      showScreen(
        "home"
      );

    }
  );


  elements.menuButton?.addEventListener(
    "click",
    () => {

      pauseGame();

    }
  );


  elements.clearRecordsButton?.addEventListener(
    "click",
    () => {

      clearRecords(
        data
      );


      showToast(
        "紀錄已清除"
      );


      renderRecords();

      updateHome();

    }
  );

}


/* =========================================================
   AUDIO BRIDGE
========================================================= */

function installAudioBridge() {

  window.KasaneStartGame =
    () => {

      unlockAudio();

    };


  window.KasaneData =
    data;

}


/* =========================================================
   HAPTIC
========================================================= */

function vibrate(
  duration
) {

  if (
    data.settings.haptic ===
    false
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

    navigator.vibrate(
      duration
    );

  } catch {}

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer =
  null;


function showToast(
  message
) {

  if (!elements.toast) {

    return;

  }


  elements.toast.textContent =
    message;


  elements.toast.classList.add(
    "visible"
  );


  clearTimeout(
    toastTimer
  );


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
   FOCUS
========================================================= */

function focusGameCanvas() {

  try {

    canvas?.focus({
      preventScroll:
        true
    });

  } catch {}

}


/* =========================================================
   HELPERS
========================================================= */

function matches(
  keys,
  value
) {

  return (
    Array.isArray(keys) &&
    keys.includes(
      value
    )
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


function lighten(
  hex,
  amount
) {

  const value =
    hex.replace(
      "#",
      ""
    );


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
        (
          255 - r
        ) *
        amount
      )
    );


  const ng =
    Math.min(
      255,
      Math.round(
        g +
        (
          255 - g
        ) *
        amount
      )
    );


  const nb =
    Math.min(
      255,
      Math.round(
        b +
        (
          255 - b
        ) *
        amount
      )
    );


  return `rgb(${nr}, ${ng}, ${nb})`;

}


function escapeHTML(
  value
) {

  return String(
    value
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
  "resize",
  () => {

    if (
      currentScreen ===
      "game"
    ) {

      resizeCanvas();

      draw();

    }

  }
);


/* =========================================================
   VISIBILITY
========================================================= */

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
   INITIALIZE
========================================================= */

function init() {

  initializeSettings();

  applyI18n();

  setupModeSelection();

  setupNavigation();

  setupKeyboard();

  setupTouchControls();

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
