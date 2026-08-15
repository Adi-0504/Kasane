"use strict";

/*
 * =========================================================
 * KASANE TETRIS
 * =========================================================
 *
 * Main game controller
 *
 * - Responsive canvas rendering
 * - Independent gravity timer
 * - 7-bag randomizer
 * - Hold
 * - Next queue
 * - Ghost piece
 * - SRS rotation
 * - DAS / ARR touch movement
 * - Keyboard controls
 * - Soft drop
 * - Hard drop
 * - Lock delay
 * - T-Spin
 * - Combo
 * - Back-to-Back
 * - Perfect Clear
 * - Marathon / Sprint / Ultra / Zen
 * - UISFX / BGM integration
 *
 * =========================================================
 */

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


/*
 * =========================================================
 * DATA
 * =========================================================
 */

const data = loadData();

window.KasaneData = data;

window.KasaneSaveSettings = settings => {

  data.settings = {
    ...data.settings,
    ...settings
  };

  saveData(data);

};


/*
 * =========================================================
 * DOM HELPERS
 * =========================================================
 */

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  Array.from(
    document.querySelectorAll(selector)
  );


/*
 * =========================================================
 * SCREENS
 * =========================================================
 */

const screens = {

  home:
    $("#homeScreen"),

  setup:
    $("#setupScreen"),

  game:
    $("#gameScreen"),

  result:
    $("#resultScreen"),

  records:
    $("#recordsScreen"),

  settings:
    $("#settingsScreen")

};


/*
 * =========================================================
 * ELEMENTS
 * =========================================================
 */

const elements = {

  backButton:
    $("#backButton"),

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
    $("#toast")

};


/*
 * =========================================================
 * CANVAS
 * =========================================================
 */

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


/*
 * =========================================================
 * GAME STATE
 * =========================================================
 */

const game = {

  running:
    false,

  paused:
    false,

  over:
    false,

  mode:
    "marathon",

  modeConfig:
    getMode("marathon"),

  board:
    createBoard(),

  randomizer:
    createRandomizer(),

  current:
    null,

  next:
    [],

  hold:
    null,

  holdUsed:
    false,

  score:
    0,

  lines:
    0,

  level:
    1,

  combo:
    -1,

  b2b:
    false,

  lastActionWasRotation:
    false,

  lastClearWasSpecial:
    false,

  /*
   * Independent timers.
   */

  gravityTimer:
    0,

  lockTimer:
    0,

  grounded:
    false,

  lockResets:
    0,

  /*
   * Frame timing.
   */

  lastTime:
    0,

  startTime:
    0,

  /*
   * Ultra.
   */

  ultraEndTime:
    null,

  ultraRemaining:
    120,

  /*
   * Drop state.
   */

  softDropping:
    false,

  /*
   * Animation.
   */

  animationFrame:
    null,

  /*
   * Touch repeat.
   */

  touchRepeat:
    null,

  touchAction:
    null,

  /*
   * Keyboard repeat state.
   */

  heldKeys:
    new Set(),

  /*
   * Prevent accidental double-start.
   */

  startLock:
    false

};


/*
 * =========================================================
 * SCREEN STATE
 * =========================================================
 */

let currentScreen =
  "home";

let selectedMode =
  "marathon";


/*
 * =========================================================
 * SETTINGS
 * =========================================================
 */

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


/*
 * =========================================================
 * SCREEN NAVIGATION
 * =========================================================
 */

function showScreen(name) {

  Object.entries(
    screens
  ).forEach(
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

    resizeCanvas();

    draw();

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


/*
 * =========================================================
 * MODE SELECTION
 * =========================================================
 */

function setupModeSelection() {

  $$(".mode-card")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          $$(".mode-card")
            .forEach(item => {

              item.classList.remove(
                "selected"
              );

            });

          button.classList.add(
            "selected"
          );

          selectedMode =
            button.dataset.mode ||
            "marathon";

          playSFX(
            SFX.move,
            {
              cooldownMs:
                80
            }
          );

        }
      );

    });

}


/*
 * =========================================================
 * QUEUE
 * =========================================================
 */

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


/*
 * =========================================================
 * SPAWN
 * =========================================================
 */

function spawnPiece() {

  game.current =
    takeNextPiece();

  game.holdUsed =
    false;

  game.gravityTimer =
    0;

  game.lockTimer =
    0;

  game.grounded =
    false;

  game.lockResets =
    0;

  game.lastActionWasRotation =
    false;

  /*
   * Spawn immediately.
   */

  if (
    collides(
      game.board,
      game.current
    )
  ) {

    finishGame(false);

    return false;

  }

  return true;

}


/*
 * =========================================================
 * START GAME
 * =========================================================
 */

function startGame(
  modeId = selectedMode
) {

  if (game.startLock) {
    return;
  }

  game.startLock =
    true;

  setTimeout(
    () => {

      game.startLock =
        false;

    },
    150
  );


  unlockAudio();

  /*
   * Cancel old loop.
   */

  if (
    game.animationFrame !==
    null
  ) {

    cancelAnimationFrame(
      game.animationFrame
    );

    game.animationFrame =
      null;

  }


  /*
   * Reset game.
   */

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

  game.current =
    null;

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

  game.lastClearWasSpecial =
    false;

  game.gravityTimer =
    0;

  game.lockTimer =
    0;

  game.grounded =
    false;

  game.lockResets =
    0;

  game.softDropping =
    false;

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


  fillNextQueue();


  if (!spawnPiece()) {

    return;

  }


  updateGravity();

  updateGameUI();

  showScreen("game");

  focusGameCanvas();

  if (
    elements.pauseOverlay
  ) {

    elements.pauseOverlay.hidden =
      true;

  }


  playSFX(
    SFX.resume
  );


  game.animationFrame =
    requestAnimationFrame(
      loop
    );

}


/*
 * =========================================================
 * GRAVITY
 * =========================================================
 */

function updateGravity() {

  game.level =
    getLevel(
      game.lines,
      game.mode
    );

  game.dropInterval =
    Math.max(
      1,
      Number(
        game.modeConfig.gravity(
          game.level
        )
      ) || 900
    );

}


/*
 * =========================================================
 * MAIN LOOP
 * =========================================================
 */

function loop(timestamp) {

  if (!game.running) {

    return;

  }


  /*
   * First frame protection.
   */

  if (!game.lastTime) {

    game.lastTime =
      timestamp;

  }


  let delta =
    timestamp -
    game.lastTime;


  game.lastTime =
    timestamp;


  /*
   * Never allow a huge background
   * delta to dump the entire board.
   */

  delta =
    Math.min(
      delta,
      100
    );


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


  if (game.running) {

    game.animationFrame =
      requestAnimationFrame(
        loop
      );

  }

}


/*
 * =========================================================
 * UPDATE
 * =========================================================
 */

function update(
  delta,
  timestamp
) {

  /*
   * Ultra timer.
   */

  if (
    game.modeConfig.timed &&
    game.ultraEndTime !== null
  ) {

    const remaining =
      Math.max(
        0,
        game.ultraEndTime -
        timestamp
      );


    game.ultraRemaining =
      remaining /
      1000;


    if (
      remaining <= 0
    ) {

      finishGame(true);

      return;

    }

  }


  /*
   * Gravity is independent from rendering.
   */

  game.gravityTimer +=
    delta;


  /*
   * Soft drop makes gravity faster,
   * but still uses the same timer.
   */

  const gravityInterval =
    game.softDropping
      ? Math.max(
          16,
          game.dropInterval /
          CONFIG.SOFT_DROP_FACTOR
        )
      : game.dropInterval;


  /*
   * Process gravity ticks.
   *
   * Maximum 8 steps per frame prevents
   * pathological loops.
   */

  let steps =
    0;


  while (
    game.gravityTimer >=
    gravityInterval &&
    steps < 8
  ) {

    game.gravityTimer -=
      gravityInterval;

    steps++;


    gravityStep();

  }


  /*
   * Lock timer runs separately.
   */

  if (
    game.grounded
  ) {

    game.lockTimer +=
      delta;


    if (
      game.lockTimer >=
      CONFIG.LOCK_DELAY
    ) {

      lockPiece();

      return;

    }

  }


  updateGameUI();

}


/*
 * =========================================================
 * GRAVITY STEP
 * =========================================================
 */

function gravityStep() {

  if (
    !game.current
  ) {

    return;

  }


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

    /*
     * The piece is no longer grounded.
     */

    game.grounded =
      false;

    game.lockTimer =
      0;

    return;

  }


  /*
   * It has touched the stack.
   */

  if (!game.grounded) {

    game.grounded =
      true;

    game.lockTimer =
      0;

  }

}


/*
 * =========================================================
 * CAN PLAY
 * =========================================================
 */

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


/*
 * =========================================================
 * LOCK RESET
 * =========================================================
 */

function resetLockDelay() {

  if (
    !game.grounded
  ) {

    return;

  }


  if (
    game.lockResets >=
    CONFIG.MAX_LOCK_RESETS
  ) {

    return;

  }


  game.lockTimer =
    0;

  game.lockResets +=
    1;

}


/*
 * =========================================================
 * HORIZONTAL MOVE
 * =========================================================
 */

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

  resetLockDelay();


  playSFX(
    SFX.move,
    {
      cooldownMs:
        35
    }
  );


  vibrate(5);

  draw();

  return true;

}


/*
 * =========================================================
 * SOFT DROP
 * =========================================================
 */

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

    /*
     * Immediately mark grounded.
     */

    game.grounded =
      true;

    return false;

  }


  game.current =
    moved;

  game.score +=
    CONFIG.SCORE.softDrop;

  game.lastActionWasRotation =
    false;

  game.grounded =
    false;

  game.lockTimer =
    0;

  game.gravityTimer =
    0;

  draw();

  return true;

}


/*
 * =========================================================
 * HARD DROP
 * =========================================================
 */

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


  game.grounded =
    true;

  game.gravityTimer =
    0;

  game.lockTimer =
    CONFIG.LOCK_DELAY;


  playSFX(
    SFX.drop
  );


  vibrate(12);


  lockPiece();

}


/*
 * =========================================================
 * ROTATION
 * =========================================================
 */

function rotate(
  direction
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


  resetLockDelay();


  /*
   * A rotation also means the
   * next gravity tick starts cleanly.
   */

  game.gravityTimer =
    0;


  playSFX(
    SFX.rotate,
    {
      cooldownMs:
        40
    }
  );


  vibrate(5);

  draw();

  return true;

}


/*
 * =========================================================
 * HOLD
 * =========================================================
 */

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

    const heldType =
      game.hold;

    game.hold =
      currentType;

    game.current =
      createPiece(
        heldType
      );

  } else {

    game.hold =
      currentType;

    game.current =
      takeNextPiece();

  }


  game.holdUsed =
    true;

  game.gravityTimer =
    0;

  game.lockTimer =
    0;

  game.grounded =
    false;

  game.lockResets =
    0;

  game.lastActionWasRotation =
    false;


  if (
    collides(
      game.board,
      game.current
    )
  ) {

    finishGame(false);

    return;

  }


  playSFX(
    SFX.hold
  );


  vibrate(8);

  draw();

}


/*
 * =========================================================
 * LOCK PIECE
 * =========================================================
 */

function lockPiece() {

  if (
    !game.current ||
    game.over
  ) {

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


  game.lastClearWasSpecial =
    false;


  if (wasTSpin) {

    game.lastClearWasSpecial =
      true;

    scoreTSpin(
      cleared
    );

  } else if (cleared > 0) {

    scoreNormalClear(
      cleared
    );

  } else {

    game.combo =
      -1;

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
        ? 30
        : 12
    );

  }


  if (
    cleared > 0 &&
    isPerfectClear(
      game.board
    )
  ) {

    game.score +=
      CONFIG.SCORE.perfectClear;

    showToast(
      "Perfect Clear"
    );

  }


  /*
   * Sprint completion.
   */

  if (
    game.mode === "sprint" &&
    game.lines >=
    game.modeConfig.target
  ) {

    finishGame(true);

    return;

  }


  /*
   * Spawn next.
   */

  if (!spawnPiece()) {

    return;

  }


  updateGameUI();

  draw();

}


/*
 * =========================================================
 * NORMAL SCORING
 * =========================================================
 */

function scoreNormalClear(
  lines
) {

  game.combo +=
    1;


  const base =
    scoringLines(
      lines,
      game.level
    );


  let score =
    base;


  const difficult =
    lines === 4;


  if (difficult) {

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


/*
 * =========================================================
 * T-SPIN
 * =========================================================
 */

function scoreTSpin(
  lines
) {

  game.combo +=
    1;


  let score =
    0;


  if (
    lines === 1
  ) {

    score =
      CONFIG.SCORE.tSpinSingle;

  } else if (
    lines === 2
  ) {

    score =
      CONFIG.SCORE.tSpinDouble;

  } else if (
    lines === 3
  ) {

    score =
      CONFIG.SCORE.tSpinTriple;

  } else {

    score =
      CONFIG.SCORE.tSpinMini;

  }


  score *=
    game.level;


  if (
    game.b2b
  ) {

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


/*
 * =========================================================
 * CLEAR SOUND
 * =========================================================
 */

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


/*
 * =========================================================
 * PAUSE
 * =========================================================
 */

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

  game.lastTime =
    0;

  /*
   * Timers stop because update()
   * is no longer called.
   */

  if (
    elements.pauseOverlay
  ) {

    elements.pauseOverlay.hidden =
      false;

  }


  playSFX(
    SFX.pause
  );


  draw();

}


/*
 * =========================================================
 * RESUME
 * =========================================================
 */

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

  /*
   * Do not reset gravityTimer.
   * The piece resumes exactly where
   * it was before pause.
   */

  if (
    elements.pauseOverlay
  ) {

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


/*
 * =========================================================
 * FINISH
 * =========================================================
 */

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


  if (
    game.animationFrame !==
    null
  ) {

    cancelAnimationFrame(
      game.animationFrame
    );

    game.animationFrame =
      null;

  }


  stopRepeat();


  const elapsed =
    (
      performance.now() -
      game.startTime
    ) /
    1000;


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
      ? 35
      : 60
  );


  showResult(
    result
  );


  updateHome();

}


/*
 * =========================================================
 * RESULT
 * =========================================================
 */

function showResult(
  result
) {

  if (
    elements.resultScore
  ) {

    elements.resultScore.textContent =
      String(
        result.score
      );

  }


  if (
    elements.resultLines
  ) {

    elements.resultLines.textContent =
      String(
        result.lines
      );

  }


  if (
    elements.resultLevel
  ) {

    elements.resultLevel.textContent =
      String(
        result.level
      );

  }


  if (
    elements.resultMarkText
  ) {

    elements.resultMarkText.textContent =
      result.completed
        ? "CLEAR"
        : "GAME";

  }


  if (
    elements.resultKicker
  ) {

    elements.resultKicker.textContent =
      result.completed
        ? "GAME COMPLETE"
        : "GAME OVER";

  }


  if (
    elements.resultTitle
  ) {

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


  if (
    elements.resultDescription
  ) {

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


  showScreen(
    "result"
  );

}


/*
 * =========================================================
 * CANVAS RESIZE
 * =========================================================
 */

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


/*
 * =========================================================
 * BOARD GEOMETRY
 * =========================================================
 */

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
       boardWidth) /
      2,

    y:
      (height -
       boardHeight) /
      2,

    cell,

    width:
      boardWidth,

    height:
      boardHeight

  };

}


/*
 * =========================================================
 * DRAW
 * =========================================================
 */

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


  if (
    game.current
  ) {

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


/*
 * =========================================================
 * BOARD BACKGROUND
 * =========================================================
 */

function drawBoardBackground(g) {

  const gradient =
    ctx.createLinearGradient(
      0,
      g.y,
      0,
      g.y +
      g.height
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


/*
 * =========================================================
 * GRID
 * =========================================================
 */

function drawGrid(g) {

  ctx.save();

  ctx.strokeStyle =
    "rgba(71,90,97,0.12)";

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
      g.y +
      g.height
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
      g.x +
      g.width,
      py
    );

    ctx.stroke();

  }


  ctx.restore();

}


/*
 * =========================================================
 * PLACED BLOCKS
 * =========================================================
 */

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


/*
 * =========================================================
 * GHOST
 * =========================================================
 */

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
    0.20
  );

}


/*
 * =========================================================
 * PIECE
 * =========================================================
 */

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
      visibleY >=
      CONFIG.HEIGHT
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


/*
 * =========================================================
 * CELL
 * =========================================================
 */

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


  if (alpha < 1) {

    ctx.strokeStyle =
      color;

    ctx.lineWidth =
      Math.max(
        1,
        size * 0.08
      );


    ctx.strokeRect(
      px +
      size * 0.13,
      py +
      size * 0.13,
      size * 0.74,
      size * 0.74
    );


    ctx.restore();

    return;

  }


  const gradient =
    ctx.createLinearGradient(
      px,
      py,
      px +
      size,
      py +
      size
    );


  gradient.addColorStop(
    0,
    lighten(
      color,
      0.15
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
    px +
    size * 0.07,
    py +
    size * 0.07,
    size * 0.86,
    size * 0.86,
    size * 0.16
  );


  ctx.fill();


  ctx.strokeStyle =
    "rgba(255,255,255,0.30)";


  ctx.lineWidth =
    Math.max(
      1,
      size * 0.045
    );


  roundRect(
    ctx,
    px +
    size * 0.07,
    py +
    size * 0.07,
    size * 0.86,
    size * 0.86,
    size * 0.16
  );


  ctx.stroke();

  ctx.restore();

}


/*
 * =========================================================
 * FRAME
 * =========================================================
 */

function drawBoardFrame(g) {

  ctx.save();

  ctx.strokeStyle =
    "rgba(71,90,97,0.42)";

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


/*
 * =========================================================
 * SIDE PREVIEWS
 * =========================================================
 */

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

        const type =
          game.next[index];


        drawMiniPiece(
          nextCanvas.getContext(
            "2d"
          ),
          nextCanvas,
          type
        );

      }
    );

}


/*
 * =========================================================
 * MINI PIECE
 * =========================================================
 */

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
          cellsWidth +
          1
        ),
      height /
        (
          cellsHeight +
          1
        )
    );


  const offsetX =
    (
      width -
      cellsWidth *
      size
    ) /
    2;


  const offsetY =
    (
      height -
      cellsHeight *
      size
    ) /
    2;


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
          x -
          minX
        ) *
        size,
        offsetY +
        (
          y -
          minY
        ) *
        size,
        size,
        COLORS[type]
      );

    }

  }

}


/*
 * =========================================================
 * MINI CELL
 * =========================================================
 */

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
    x +
    size * 0.08,
    y +
    size * 0.08,
    size * 0.84,
    size * 0.84,
    size * 0.15
  );


  context.fill();


  context.strokeStyle =
    "rgba(255,255,255,0.35)";


  context.lineWidth =
    Math.max(
      1,
      size * 0.04
    );


  context.stroke();

  context.restore();

}


/*
 * =========================================================
 * UI
 * =========================================================
 */

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


  if (
    elements.scoreLabelMobile
  ) {

    elements.scoreLabelMobile.textContent =
      String(
        game.score
      );

  }


  if (
    elements.linesLabelMobile
  ) {

    elements.linesLabelMobile.textContent =
      String(
        game.lines
      );

  }


  drawSidePreviews();

}


/*
 * =========================================================
 * HOME
 * =========================================================
 */

function updateHome() {

  if (
    elements.homeBestScore
  ) {

    elements.homeBestScore.textContent =
      String(
        data.stats.bestScore ||
        0
      );

  }

}


/*
 * =========================================================
 * RECORDS
 * =========================================================
 */

function renderRecords() {

  if (
    elements.gamesStat
  ) {

    elements.gamesStat.textContent =
      String(
        data.stats.games ||
        0
      );

  }


  if (
    elements.bestStat
  ) {

    elements.bestStat.textContent =
      String(
        data.stats.bestScore ||
        0
      );

  }


  if (
    elements.linesStat
  ) {

    elements.linesStat.textContent =
      String(
        data.stats.bestLines ||
        0
      );

  }


  if (
    elements.sprintStat
  ) {

    elements.sprintStat.textContent =
      formatTime(
        data.stats.bestSprint
      );

  }


  if (
    !elements.recordList
  ) {

    return;

  }


  elements.recordList.innerHTML =
    "";


  if (
    !data.records.length
  ) {

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


/*
 * =========================================================
 * KEYBOARD
 * =========================================================
 */

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


      /*
       * Prevent browser scrolling.
       */

      if (
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowDown",
          "ArrowUp",
          " ",
          "Shift",
          "Control"
        ].includes(
          event.key
        )
      ) {

        event.preventDefault();

      }


      if (
        matches(
          KEYS.pause,
          event.key
        )
      ) {

        pauseGame();

        return;

      }


      if (
        game.paused
      ) {

        return;

      }


      /*
       * Ignore repeated keydown for
       * one-shot actions.
       */

      const oneShot =
        event.repeat;


      if (
        matches(
          KEYS.left,
          event.key
        )
      ) {

        if (
          !game.heldKeys.has(
            "left"
          )
        ) {

          game.heldKeys.add(
            "left"
          );

          moveHorizontal(-1);

          startRepeat(
            "left"
          );

        }

        return;

      }


      if (
        matches(
          KEYS.right,
          event.key
        )
      ) {

        if (
          !game.heldKeys.has(
            "right"
          )
        ) {

          game.heldKeys.add(
            "right"
          );

          moveHorizontal(1);

          startRepeat(
            "right"
          );

        }

        return;

      }


      if (
        matches(
          KEYS.down,
          event.key
        )
      ) {

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

        if (!oneShot) {

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

        if (!oneShot) {

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

        if (!oneShot) {

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

        if (!oneShot) {

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
          KEYS.left,
          event.key
        )
      ) {

        game.heldKeys.delete(
          "left"
        );

        stopRepeat();

      }


      if (
        matches(
          KEYS.right,
          event.key
        )
      ) {

        game.heldKeys.delete(
          "right"
        );

        stopRepeat();

      }


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


  window.addEventListener(
    "blur",
    () => {

      game.heldKeys.clear();

      game.softDropping =
        false;

      stopRepeat();

    }
  );

}


/*
 * =========================================================
 * MOBILE CONTROLS
 * =========================================================
 */

function setupMobileControls() {

  $$(".control-button")
    .forEach(button => {

      const action =
        button.dataset.action;


      button.style.touchAction =
        "none";


      button.addEventListener(
        "pointerdown",
        event => {

          event.preventDefault();

          unlockAudio();


          try {

            button.setPointerCapture(
              event.pointerId
            );

          } catch {}


          if (
            action === "left"
          ) {

            moveHorizontal(-1);

            startRepeat(
              "left"
            );

          } else if (
            action === "right"
          ) {

            moveHorizontal(1);

            startRepeat(
              "right"
            );

          } else if (
            action === "down"
          ) {

            game.softDropping =
              true;

            softDrop();

          } else if (
            action === "rotate"
          ) {

            rotate(1);

          } else if (
            action === "rotateCCW"
          ) {

            rotate(-1);

          } else if (
            action === "drop"
          ) {

            hardDrop();

          } else if (
            action === "hold"
          ) {

            holdPiece();

          }

        },
        {
          passive:
            false
        }
      );


      const release =
        event => {

          event?.preventDefault?.();

          stopRepeat();

          if (
            action === "down"
          ) {

            game.softDropping =
              false;

          }

        };


      button.addEventListener(
        "pointerup",
        release,
        {
          passive:
            false
        }
      );


      button.addEventListener(
        "pointercancel",
        release,
        {
          passive:
            false
        }
      );


      button.addEventListener(
        "lostpointercapture",
        release,
        {
          passive:
            false
        }
      );

    });

}


/*
 * =========================================================
 * DAS / ARR
 * =========================================================
 */

function startRepeat(
  action
) {

  stopRepeat();


  game.touchAction =
    action;


  game.touchRepeat =
    window.setTimeout(
      () => {

        game.touchRepeat =
          window.setInterval(
            () => {

              if (
                !canPlay()
              ) {

                return;

              }


              if (
                action ===
                "left"
              ) {

                moveHorizontal(-1);

              } else {

                moveHorizontal(1);

              }

            },
            Math.max(
              1,
              CONFIG.ARR
            )
          );

      },
      Math.max(
        1,
        CONFIG.DAS
      )
    );

}


function stopRepeat() {

  if (
    game.touchRepeat !==
    null
  ) {

    clearTimeout(
      game.touchRepeat
    );

    clearInterval(
      game.touchRepeat
    );

  }


  game.touchRepeat =
    null;

  game.touchAction =
    null;

}


/*
 * =========================================================
 * CANVAS POINTER
 * =========================================================
 */

function setupCanvasPointer() {

  if (!canvas) {

    return;

  }


  canvas.style.touchAction =
    "none";


  canvas.addEventListener(
    "pointerdown",
    () => {

      unlockAudio();

      focusGameCanvas();

    },
    {
      passive:
        true
    }
  );

}


/*
 * =========================================================
 * SETTINGS EVENTS
 * =========================================================
 */

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


/*
 * =========================================================
 * NAVIGATION
 * =========================================================
 */

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

      goHome();

    }
  );


  elements.backButton?.addEventListener(
    "click",
    () => {

      if (
        currentScreen ===
        "game"
      ) {

        pauseGame();

        return;

      }


      showScreen(
        "home"
      );

    }
  );


  elements.menuButton?.addEventListener(
    "click",
    () => {

      if (
        currentScreen ===
        "game"
      ) {

        pauseGame();

        return;

      }


      showScreen(
        "settings"
      );

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


/*
 * =========================================================
 * AUDIO BRIDGE
 * =========================================================
 */

function installAudioBridge() {

  window.KasaneStartGame =
    () => {

      unlockAudio();

    };


  window.KasaneData =
    data;

}


/*
 * =========================================================
 * HAPTIC
 * =========================================================
 */

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


/*
 * =========================================================
 * TOAST
 * =========================================================
 */

let toastTimer =
  null;


function showToast(
  message
) {

  if (
    !elements.toast
  ) {

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


/*
 * =========================================================
 * FOCUS
 * =========================================================
 */

function focusGameCanvas() {

  if (!canvas) {

    return;

  }


  try {

    canvas.focus({
      preventScroll:
        true
    });

  } catch {}

}


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function matches(
  keys,
  value
) {

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


function lighten(
  hex,
  amount
) {

  const value =
    String(hex)
      .replace(
        "#",
        ""
      );


  if (
    value.length !== 6
  ) {

    return hex;

  }


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
          255 -
          r
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
          255 -
          g
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
          255 -
          b
        ) *
        amount
      )
    );


  return `rgb(${nr}, ${ng}, ${nb})`;

}


function escapeHTML(
  value
) {

  return String(value)
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


/*
 * =========================================================
 * RESIZE
 * =========================================================
 */

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

  },
  {
    passive:
      true
  }
);


/*
 * =========================================================
 * VISIBILITY
 * =========================================================
 */

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


/*
 * =========================================================
 * PAGE HIDE / MOBILE SAFETY
 * =========================================================
 */

window.addEventListener(
  "pagehide",
  () => {

    game.softDropping =
      false;

    game.heldKeys.clear();

    stopRepeat();

  }
);


/*
 * =========================================================
 * INITIALIZE
 * =========================================================
 */

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
      once:
        true
    }
  );

} else {

  init();

}
