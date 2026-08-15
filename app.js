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
  getShape,
  createRandomizer
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


const el = {
  back: $("#backButton"),
  menu: $("#menuButton"),

  start: $("#startButton"),
  records: $("#recordsButton"),
  settings: $("#settingsButton"),
  begin: $("#beginButton"),

  canvas: $("#gameCanvas"),
  holdCanvas: $("#holdCanvas"),

  pause: $("#pauseButton"),
  resume: $("#resumeButton"),
  pauseOverlay: $("#pauseOverlay"),

  again: $("#againButton"),
  home: $("#homeButton"),

  clearRecords: $("#clearRecordsButton"),

  sound: $("#soundToggle"),
  music: $("#musicToggle"),
  ghost: $("#ghostToggle"),
  haptic: $("#hapticToggle"),
  motion: $("#motionToggle"),
  theme: $("#themeSelect"),

  mode: $("#modeLabel"),
  level: $("#levelLabel"),
  score: $("#scoreLabel"),
  lines: $("#linesLabel"),
  combo: $("#comboLabel"),
  b2b: $("#b2bLabel"),

  mobileScore: $("#scoreLabelMobile"),
  mobileLines: $("#linesLabelMobile"),

  best: $("#homeBestScore"),

  gamesStat: $("#gamesStat"),
  bestStat: $("#bestStat"),
  linesStat: $("#linesStat"),
  sprintStat: $("#sprintStat"),
  recordList: $("#recordList"),

  resultMark: $("#resultMarkText"),
  resultKicker: $("#resultKicker"),
  resultTitle: $("#resultTitle"),
  resultDescription: $("#resultDescription"),
  resultScore: $("#resultScore"),
  resultLines: $("#resultLines"),
  resultLevel: $("#resultLevel"),

  toast: $("#toast")
};


const canvas = el.canvas;
const ctx = canvas?.getContext("2d");

const holdCanvas = el.holdCanvas;
const holdCtx = holdCanvas?.getContext("2d");

const nextCanvases =
  $$(".next-list canvas");


/* =========================================================
   DATA
========================================================= */

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
   I18N
========================================================= */

const translations = {

  "zh-TW": {
    title: "Kasane",
    subtitle: "一格一格，慢慢堆成自己的節奏。",
    start: "開始遊戲",
    records: "紀錄",
    settings: "設定",
    modes: "遊戲模式",
    begin: "開始",

    marathon: "Marathon",
    marathonDesc: "一路升級，挑戰極限",

    sprint: "Sprint",
    sprintDesc: "40 行速度挑戰",

    ultra: "Ultra",
    ultraDesc: "120 秒最高分",

    zen: "Zen",
    zenDesc: "沒有壓力，慢慢玩",

    hold: "HOLD",
    next: "NEXT",

    score: "分數",
    lines: "行數",
    level: "等級",
    combo: "COMBO",
    b2b: "B2B",

    pause: "暫停",
    paused: "暫停中",
    resume: "繼續",

    gameComplete: "GAME COMPLETE",
    gameOver: "GAME OVER",

    again: "再來一局",
    backHome: "返回首頁",

    recordTitle: "紀錄",
    games: "遊戲",
    bestScore: "最高分",
    bestLines: "最多行",
    bestSprint: "最佳 Sprint",
    clearRecords: "清除紀錄",
    emptyRecords: "還沒有棋局紀錄。",

    settingsTitle: "設定",
    sound: "音效",
    soundDesc: "UISFX 遊戲音效",
    music: "背景音樂",
    musicDesc: "CC0 背景音樂",
    ghost: "Ghost",
    ghostDesc: "顯示落點預覽",
    haptic: "震動",
    hapticDesc: "支援裝置震動回饋",
    motion: "動畫",
    motionDesc: "方塊與消行動畫",
    appearance: "外觀",
    appearanceDesc: "系統 / 淺色 / 深色",

    system: "System",
    light: "Light",
    dark: "Dark",

    clear: "CLEAR",
    timeUp: "時間到",
    fortyLines: "40 行完成",
    finished: "這局結束了",
    completed: "完成得很好",

    perfect: "Perfect Clear",
    tetris: "TETRIS"
  },

  "en": {
    title: "Kasane",
    subtitle: "One block at a time. Find your rhythm.",
    start: "Start Game",
    records: "Records",
    settings: "Settings",
    modes: "Game Mode",
    begin: "Start",

    marathon: "Marathon",
    marathonDesc: "Level up and push your limits",

    sprint: "Sprint",
    sprintDesc: "Clear 40 lines as fast as possible",

    ultra: "Ultra",
    ultraDesc: "Get the highest score in 120 seconds",

    zen: "Zen",
    zenDesc: "No pressure. Just play.",

    hold: "HOLD",
    next: "NEXT",

    score: "SCORE",
    lines: "LINES",
    level: "LEVEL",
    combo: "COMBO",
    b2b: "B2B",

    pause: "Pause",
    paused: "Paused",
    resume: "Resume",

    gameComplete: "GAME COMPLETE",
    gameOver: "GAME OVER",

    again: "Play Again",
    backHome: "Home",

    recordTitle: "Records",
    games: "Games",
    bestScore: "Best Score",
    bestLines: "Best Lines",
    bestSprint: "Best Sprint",
    clearRecords: "Clear Records",
    emptyRecords: "No records yet.",

    settingsTitle: "Settings",
    sound: "Sound",
    soundDesc: "UISFX game sounds",
    music: "Music",
    musicDesc: "CC0 background music",
    ghost: "Ghost",
    ghostDesc: "Show landing preview",
    haptic: "Haptics",
    hapticDesc: "Device vibration feedback",
    motion: "Motion",
    motionDesc: "Block and line animations",
    appearance: "Appearance",
    appearanceDesc: "System / Light / Dark",

    system: "System",
    light: "Light",
    dark: "Dark",

    clear: "CLEAR",
    timeUp: "Time Up",
    fortyLines: "40 Lines",
    finished: "Game Over",
    completed: "Well Done",

    perfect: "Perfect Clear",
    tetris: "TETRIS"
  },

  "ja": {
    title: "カサネ",
    subtitle: "ひとつずつ、自分のリズムで。",
    start: "ゲーム開始",
    records: "記録",
    settings: "設定",
    modes: "ゲームモード",
    begin: "スタート",

    marathon: "マラソン",
    marathonDesc: "レベルを上げて限界に挑戦",

    sprint: "スプリント",
    sprintDesc: "40ラインをできるだけ速く",

    ultra: "ウルトラ",
    ultraDesc: "120秒で最高スコアを目指す",

    zen: "ゼン",
    zenDesc: "ゆっくり遊ぼう",

    hold: "HOLD",
    next: "NEXT",

    score: "スコア",
    lines: "ライン",
    level: "レベル",
    combo: "COMBO",
    b2b: "B2B",

    pause: "一時停止",
    paused: "一時停止中",
    resume: "再開",

    gameComplete: "GAME COMPLETE",
    gameOver: "GAME OVER",

    again: "もう一度",
    backHome: "ホーム",

    recordTitle: "記録",
    games: "ゲーム",
    bestScore: "最高スコア",
    bestLines: "最多ライン",
    bestSprint: "ベストスプリント",
    clearRecords: "記録を消去",
    emptyRecords: "まだ記録がありません。",

    settingsTitle: "設定",
    sound: "サウンド",
    soundDesc: "UISFX ゲームサウンド",
    music: "BGM",
    musicDesc: "CC0 バックグラウンド音楽",
    ghost: "ゴースト",
    ghostDesc: "落下位置を表示",
    haptic: "振動",
    hapticDesc: "デバイスの振動",
    motion: "アニメーション",
    motionDesc: "ブロックとライン演出",
    appearance: "外観",
    appearanceDesc: "システム / ライト / ダーク",

    system: "System",
    light: "Light",
    dark: "Dark",

    clear: "CLEAR",
    timeUp: "時間切れ",
    fortyLines: "40ライン達成",
    finished: "ゲーム終了",
    completed: "おつかれさま",

    perfect: "Perfect Clear",
    tetris: "TETRIS"
  },

  "ko": {
    title: "카사네",
    subtitle: "한 칸씩, 나만의 리듬으로.",
    start: "게임 시작",
    records: "기록",
    settings: "설정",
    modes: "게임 모드",
    begin: "시작",

    marathon: "마라톤",
    marathonDesc: "레벨을 올리며 한계에 도전",

    sprint: "스프린트",
    sprintDesc: "40줄을 최대한 빠르게",

    ultra: "울트라",
    ultraDesc: "120초 동안 최고 점수",

    zen: "젠",
    zenDesc: "천천히 편하게 플레이",

    hold: "HOLD",
    next: "NEXT",

    score: "점수",
    lines: "줄",
    level: "레벨",
    combo: "COMBO",
    b2b: "B2B",

    pause: "일시정지",
    paused: "일시정지 중",
    resume: "계속",

    gameComplete: "GAME COMPLETE",
    gameOver: "GAME OVER",

    again: "다시 하기",
    backHome: "홈으로",

    recordTitle: "기록",
    games: "게임",
    bestScore: "최고 점수",
    bestLines: "최다 줄",
    bestSprint: "최고 스프린트",
    clearRecords: "기록 삭제",
    emptyRecords: "아직 기록이 없습니다.",

    settingsTitle: "설정",
    sound: "효과음",
    soundDesc: "UISFX 게임 효과음",
    music: "배경 음악",
    musicDesc: "CC0 배경 음악",
    ghost: "고스트",
    ghostDesc: "착지 위치 표시",
    haptic: "진동",
    hapticDesc: "기기 진동 피드백",
    motion: "애니메이션",
    motionDesc: "블록과 줄 삭제 효과",
    appearance: "화면",
    appearanceDesc: "시스템 / 라이트 / 다크",

    system: "System",
    light: "Light",
    dark: "Dark",

    clear: "CLEAR",
    timeUp: "시간 종료",
    fortyLines: "40줄 달성",
    finished: "게임 종료",
    completed: "잘했어",

    perfect: "Perfect Clear",
    tetris: "TETRIS"
  }

};


function getLanguage() {

  const saved =
    data.settings?.language;

  if (
    saved &&
    translations[saved]
  ) {

    return saved;

  }

  const browser =
    navigator.language
      ?.toLowerCase();

  if (
    browser.startsWith("ja")
  ) {

    return "ja";

  }

  if (
    browser.startsWith("ko")
  ) {

    return "ko";

  }

  if (
    browser.startsWith("en")
  ) {

    return "en";

  }

  return "zh-TW";

}


function t(key) {

  const language =
    getLanguage();

  return (
    translations[language]?.[key] ??
    translations["zh-TW"][key] ??
    key
  );

}


function applyI18n() {

  document
    .querySelectorAll(
      "[data-i18n]"
    )
    .forEach(
      node => {

        const key =
          node.dataset.i18n;

        const value =
          t(key);

        if (
          value != null
        ) {

          node.textContent =
            value;

        }

      }
    );

  document.documentElement.lang =
    getLanguage();

}


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

  lastActionWasRotation: false,

  dropInterval: 900,
  accumulator: 0,

  lastTime: 0,
  startTime: 0,

  animationFrame: null,

  softDropping: false,

  ultraEndTime: null,
  ultraRemaining: 120,

  touch: {

    active: false,
    id: null,

    startX: 0,
    startY: 0,

    lastX: 0,
    lastY: 0,

    startTime: 0,

    moved: false,

    actionStarted: false,

    longPressTriggered: false,

    longPressTimer: null,

    repeatTimer: null,

    softDropTimer: null

  }

};


let selectedMode =
  "marathon";

let currentScreen =
  "home";

let toastTimer =
  null;


/* =========================================================
   SETTINGS
========================================================= */

function syncSettings() {

  if (el.sound) {

    el.sound.checked =
      data.settings.sound !== false;

  }

  if (el.music) {

    el.music.checked =
      data.settings.music !== false;

  }

  if (el.ghost) {

    el.ghost.checked =
      data.settings.ghost !== false;

  }

  if (el.haptic) {

    el.haptic.checked =
      data.settings.haptic !== false;

  }

  if (el.motion) {

    el.motion.checked =
      data.settings.motion !== false;

  }

  if (el.theme) {

    el.theme.value =
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

  document.documentElement
    .dataset
    .theme =
      data.settings.theme ||
      "system";

}


/* =========================================================
   NAVIGATION
========================================================= */

function showScreen(
  name
) {

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

  if (
    name === "home"
  ) {

    updateHome();

  }

  if (
    name === "records"
  ) {

    renderRecords();

  }

  if (
    name === "settings"
  ) {

    syncSettings();

  }

  if (
    name === "game"
  ) {

    requestAnimationFrame(
      () => {

        resizeCanvas();
        draw();

      }
    );

  }

}


function goHome() {

  cleanupTouch();

  if (
    game.running &&
    !game.over
  ) {

    pauseGame();

  }

  showScreen(
    "home"
  );

}


/* =========================================================
   MODE
========================================================= */

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

  const count =
    CONFIG.NEXT_COUNT || 5;

  while (
    game.next.length <
    count
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

  cleanupTouch();

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

  fillNextQueue();

  game.current =
    takeNextPiece();

  updateGravity();

  updateGameUI();

  if (
    el.pauseOverlay
  ) {

    el.pauseOverlay.hidden =
      true;

  }

  showScreen(
    "game"
  );

  focusGameCanvas();

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
      Math.max(
        0,
        timestamp -
        game.lastTime
      )
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
          25,
          game.dropInterval /
          (CONFIG.SOFT_DROP_FACTOR || 20)
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

    if (
      moved
    ) {

      game.current =
        moved;

    } else {

      lockPiece();

      break;

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
    Math.max(
      40,
      game.modeConfig.gravity(
        game.level
      )
    );

}


/* =========================================================
   MOVE
========================================================= */

function moveHorizontal(
  direction
) {

  if (
    !canPlay()
  ) {

    return false;

  }

  const moved =
    tryMove(
      game.board,
      game.current,
      direction,
      0
    );

  if (
    !moved
  ) {

    return false;

  }

  game.current =
    moved;

  game.lastActionWasRotation =
    false;

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
   SOFT DROP
========================================================= */

function softDrop() {

  if (
    !canPlay()
  ) {

    return false;

  }

  const moved =
    tryMove(
      game.board,
      game.current,
      0,
      1
    );

  if (
    !moved
  ) {

    return false;

  }

  game.current =
    moved;

  game.lastActionWasRotation =
    false;

  game.score +=
    CONFIG.SCORE.softDrop;

  draw();

  return true;

}


/* =========================================================
   HARD DROP
========================================================= */

function hardDrop() {

  if (
    !canPlay()
  ) {

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

    if (
      !moved
    ) {

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
  direction
) {

  if (
    !canPlay()
  ) {

    return false;

  }

  const result =
    tryRotate(
      game.board,
      game.current,
      direction
    );

  if (
    !result
  ) {

    return false;

  }

  game.current =
    result.piece;

  game.lastActionWasRotation =
    true;

  playSFX(
    SFX.rotate,
    {
      cooldownMs: 40
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

  if (
    game.hold
  ) {

    const nextType =
      game.hold;

    game.hold =
      currentType;

    game.current =
      createPiece(
        nextType
      );

  } else {

    game.hold =
      currentType;

    game.current =
      takeNextPiece();

  }

  game.holdUsed =
    true;

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

  if (
    wasTSpin
  ) {

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

  }

  game.lines +=
    cleared;

  updateGravity();

  if (
    cleared > 0
  ) {

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
    cleared > 0 &&
    isPerfectClear(
      game.board
    )
  ) {

    game.score +=
      CONFIG.SCORE.perfectClear;

    showToast(
      t("perfect")
    );

  }

  if (
    game.mode === "sprint" &&
    game.lines >=
    game.modeConfig.target
  ) {

    finishGame(
      true
    );

    return;

  }

  game.current =
    takeNextPiece();

  game.holdUsed =
    false;

  game.lastActionWasRotation =
    false;

  if (
    collides(
      game.board,
      game.current
    )
  ) {

    finishGame(
      false
    );

  }

}


/* =========================================================
   SCORING
========================================================= */

function scoreNormalClear(
  lines
) {

  game.combo +=
    1;

  let score =
    scoringLines(
      lines,
      game.level
    );

  if (
    lines === 4
  ) {

    if (
      game.b2b
    ) {

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

  let score;

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


function playClearSound(
  lines,
  tSpin
) {

  if (
    tSpin
  ) {

    playSFX(
      SFX.tSpin
    );

    return;

  }

  if (
    lines >= 4
  ) {

    playSFX(
      SFX.tetris
    );

    showToast(
      t("tetris")
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

  cleanupTouch();

  if (
    game.paused
  ) {

    resumeGame();

    return;

  }

  game.paused =
    true;

  game.softDropping =
    false;

  if (
    el.pauseOverlay
  ) {

    el.pauseOverlay.hidden =
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

  cleanupTouch();

  game.paused =
    false;

  game.lastTime =
    performance.now();

  game.accumulator =
    0;

  if (
    el.pauseOverlay
  ) {

    el.pauseOverlay.hidden =
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

  if (
    game.over
  ) {

    return;

  }

  cleanupTouch();

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
      ? 35
      : 60
  );

  showResult(
    result
  );

  updateHome();

}


/* =========================================================
   RESULT
========================================================= */

function showResult(
  result
) {

  if (
    el.resultScore
  ) {

    el.resultScore.textContent =
      String(
        result.score
      );

  }

  if (
    el.resultLines
  ) {

    el.resultLines.textContent =
      String(
        result.lines
      );

  }

  if (
    el.resultLevel
  ) {

    el.resultLevel.textContent =
      String(
        result.level
      );

  }

  if (
    el.resultMark
  ) {

    el.resultMark.textContent =
      result.completed
        ? t("clear")
        : "GAME";

  }

  if (
    el.resultKicker
  ) {

    el.resultKicker.textContent =
      result.completed
        ? t("gameComplete")
        : t("gameOver");

  }

  if (
    el.resultTitle
  ) {

    if (
      result.mode === "sprint" &&
      result.completed
    ) {

      el.resultTitle.textContent =
        t("fortyLines");

    } else if (
      result.mode === "ultra"
    ) {

      el.resultTitle.textContent =
        t("timeUp");

    } else {

      el.resultTitle.textContent =
        result.completed
          ? t("completed")
          : t("finished");

    }

  }

  if (
    el.resultDescription
  ) {

    el.resultDescription.textContent =
      result.mode === "sprint"
        ? (
            result.completed
              ? `${formatTime(result.time)}`
              : `${result.lines} ${t("lines")}`
          )
        : `${result.lines} ${t("lines")} · ${result.score}`;

  }

  showScreen(
    "result"
  );

}


/* =========================================================
   PLAY CHECK
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
      window.devicePixelRatio || 1,
      2
    );

  const width =
    Math.max(
      1,
      Math.floor(
        rect.width * dpr
      )
    );

  const height =
    Math.max(
      1,
      Math.floor(
        rect.height * dpr
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
      width / CONFIG.WIDTH,
      height / CONFIG.HEIGHT
    );

  const boardWidth =
    cell * CONFIG.WIDTH;

  const boardHeight =
    cell * CONFIG.HEIGHT;

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

  drawBoardBackground(
    g
  );

  drawGrid(
    g
  );

  drawPlacedBlocks(
    g
  );

  if (
    game.current
  ) {

    if (
      data.settings.ghost !== false
    ) {

      drawGhost(
        g
      );

    }

    drawPiece(
      g,
      game.current,
      1
    );

  }

  drawBoardFrame(
    g
  );

  drawSidePreviews();

}


/* =========================================================
   BOARD DRAW
========================================================= */

function drawBoardBackground(
  g
) {

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


function drawGrid(
  g
) {

  ctx.save();

  ctx.strokeStyle =
    "rgba(71,90,97,.12)";

  ctx.lineWidth =
    1;

  for (
    let x = 0;
    x <= CONFIG.WIDTH;
    x++
  ) {

    const px =
      g.x +
      x * g.cell;

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
      y * g.cell;

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


function drawPlacedBlocks(
  g
) {

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

      if (
        !type
      ) {

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


function drawGhost(
  g
) {

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
    g.x +
    x * g.cell;

  const py =
    g.y +
    y * g.cell;

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
        size * .08
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
    lighten(
      color,
      .15
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


function drawBoardFrame(
  g
) {

  ctx.save();

  ctx.strokeStyle =
    "rgba(71,90,97,.42)";

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

  nextCanvases.forEach(
    (
      target,
      index
    ) => {

      drawMiniPiece(
        target.getContext(
          "2d"
        ),
        target,
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

  if (
    !type
  ) {

    return;

  }

  const shape =
    getShape(
      type,
      0
    );

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

      if (
        !shape[y][x]
      ) {

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
    maxX - minX + 1;

  const cellsHeight =
    maxY - minY + 1;

  const size =
    Math.min(
      22,
      width /
        (cellsWidth + 1),
      height /
        (cellsHeight + 1)
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

      if (
        !shape[y][x]
      ) {

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
   UI
========================================================= */

function updateGameUI() {

  if (el.mode) {

    el.mode.textContent =
      game.modeConfig.name;

  }

  if (el.level) {

    el.level.textContent =
      String(
        game.level
      );

  }

  if (el.score) {

    el.score.textContent =
      String(
        game.score
      );

  }

  if (el.lines) {

    el.lines.textContent =
      String(
        game.lines
      );

  }

  if (el.combo) {

    el.combo.textContent =
      String(
        Math.max(
          0,
          game.combo
        )
      );

  }

  if (el.b2b) {

    el.b2b.textContent =
      game.b2b
        ? "ON"
        : "0";

  }

  if (el.mobileScore) {

    el.mobileScore.textContent =
      String(
        game.score
      );

  }

  if (el.mobileLines) {

    el.mobileLines.textContent =
      String(
        game.lines
      );

  }

}


function updateHome() {

  if (
    el.best
  ) {

    el.best.textContent =
      String(
        data.stats?.bestScore ||
        0
      );

  }

}


/* =========================================================
   RECORDS
========================================================= */

function renderRecords() {

  if (el.gamesStat) {

    el.gamesStat.textContent =
      String(
        data.stats?.games || 0
      );

  }

  if (el.bestStat) {

    el.bestStat.textContent =
      String(
        data.stats?.bestScore || 0
      );

  }

  if (el.linesStat) {

    el.linesStat.textContent =
      String(
        data.stats?.bestLines || 0
      );

  }

  if (el.sprintStat) {

    el.sprintStat.textContent =
      formatTime(
        data.stats?.bestSprint || 0
      );

  }

  if (
    !el.recordList
  ) {

    return;

  }

  el.recordList.innerHTML =
    "";

  if (
    !data.records?.length
  ) {

    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "record-empty";

    empty.textContent =
      t("emptyRecords");

    el.recordList.appendChild(
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

      item.innerHTML = `

        <div>
          <strong>
            ${escapeHTML(
              record.mode
            )}
          </strong>

          <span>
            ${date.toLocaleDateString(
              getLanguage() === "zh-TW"
                ? "zh-TW"
                : getLanguage()
            )}
          </span>
        </div>

        <div>
          <strong>
            ${Number(
              record.score || 0
            )}
          </strong>

          <span>
            ${Number(
              record.lines || 0
            )} ${escapeHTML(
              t("lines")
            )}
          </span>
        </div>

      `;

      el.recordList.appendChild(
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

      if (
        game.paused
      ) {

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
   TOUCH SYSTEM
========================================================= */

/*
 * Mobile controls:
 *
 * TAP
 *   -> rotate clockwise
 *
 * SWIPE LEFT
 *   -> move left
 *
 * SWIPE RIGHT
 *   -> move right
 *
 * FAST SWIPE DOWN
 *   -> hard drop
 *
 * SLOW DOWNWARD DRAG
 *   -> soft drop
 *
 * LONG PRESS
 *   -> hold piece
 *
 * Important:
 * Long press has its own state.
 * Once triggered, pointer movement can never
 * trigger another action from the same gesture.
 */

const TOUCH = {

  TAP_MAX_DISTANCE: 18,

  TAP_MAX_TIME: 300,

  LONG_PRESS_TIME: 520,

  SWIPE_DISTANCE: 30,

  HARD_DROP_DISTANCE: 105,

  HARD_DROP_TIME: 360,

  MOVE_REPEAT_DELAY: 150,

  MOVE_REPEAT_RATE: 45,

  SOFT_DROP_RATE: 70

};


function setupTouchControls() {

  if (
    !canvas
  ) {

    return;

  }

  /*
   * Critical for iOS Safari.
   * Without this, the browser may interpret
   * the gesture as page scrolling/zooming.
   */

  canvas.style.touchAction =
    "none";

  canvas.style.userSelect =
    "none";

  canvas.style.webkitUserSelect =
    "none";

  canvas.style.webkitTouchCallout =
    "none";


  canvas.addEventListener(
    "pointerdown",
    onPointerDown,
    {
      passive: false
    }
  );


  canvas.addEventListener(
    "pointermove",
    onPointerMove,
    {
      passive: false
    }
  );


  canvas.addEventListener(
    "pointerup",
    onPointerUp,
    {
      passive: false
    }
  );


  canvas.addEventListener(
    "pointercancel",
    onPointerCancel,
    {
      passive: false
    }
  );


  canvas.addEventListener(
    "lostpointercapture",
    onPointerCancel,
    {
      passive: false
    }
  );

}


function onPointerDown(
  event
) {

  if (
    event.pointerType === "mouse" &&
    event.button !== 0
  ) {

    return;

  }

  /*
   * Never allow two fingers to control
   * the same falling piece.
   */

  if (
    game.touch.active
  ) {

    return;

  }

  if (
    currentScreen !== "game" ||
    !canPlay()
  ) {

    return;

  }

  event.preventDefault();

  unlockAudio();

  game.touch.active =
    true;

  game.touch.id =
    event.pointerId;

  game.touch.startX =
    event.clientX;

  game.touch.startY =
    event.clientY;

  game.touch.lastX =
    event.clientX;

  game.touch.lastY =
    event.clientY;

  game.touch.startTime =
    performance.now();

  game.touch.moved =
    false;

  game.touch.actionStarted =
    false;

  game.touch.longPressTriggered =
    false;


  try {

    canvas.setPointerCapture(
      event.pointerId
    );

  } catch {}


  /*
   * Long press is HOLD.
   *
   * This timer runs only once.
   * It is cancelled immediately when
   * the finger moves.
   */

  game.touch.longPressTimer =
    window.setTimeout(
      () => {

        if (
          !game.touch.active ||
          game.touch.moved ||
          !canPlay()
        ) {

          return;

        }

        game.touch.longPressTriggered =
          true;

        game.touch.actionStarted =
          true;

        holdPiece();

      },
      TOUCH.LONG_PRESS_TIME
    );

}


function onPointerMove(
  event
) {

  if (
    !game.touch.active ||
    event.pointerId !==
    game.touch.id
  ) {

    return;

  }

  event.preventDefault();

  if (
    !canPlay()
  ) {

    cleanupTouch();

    return;

  }

  const x =
    event.clientX;

  const y =
    event.clientY;

  const totalDX =
    x -
    game.touch.startX;

  const totalDY =
    y -
    game.touch.startY;

  const stepDX =
    x -
    game.touch.lastX;

  const stepDY =
    y -
    game.touch.lastY;

  const absX =
    Math.abs(
      totalDX
    );

  const absY =
    Math.abs(
      totalDY
    );


  /*
   * Once the finger moves enough,
   * it is definitely NOT a long press.
   */

  if (
    absX >
      TOUCH.TAP_MAX_DISTANCE ||
    absY >
      TOUCH.TAP_MAX_DISTANCE
  ) {

    game.touch.moved =
      true;

    clearTimeout(
      game.touch.longPressTimer
    );

    game.touch.longPressTimer =
      null;

  }


  /*
   * A long press already became HOLD.
   *
   * Absolutely no other gesture is allowed
   * to fire from this pointer session.
   */

  if (
    game.touch.longPressTriggered
  ) {

    game.touch.lastX =
      x;

    game.touch.lastY =
      y;

    return;

  }


  /*
   * Horizontal movement.
   *
   * Every threshold crossed moves exactly one cell.
   * This prevents a single pointermove event from
   * generating dozens of moves.
   */

  if (
    absX >
      TOUCH.SWIPE_DISTANCE &&
    absX >
      absY
  ) {

    clearTimeout(
      game.touch.longPressTimer
    );

    game.touch.longPressTimer =
      null;

    game.touch.actionStarted =
      true;

    const direction =
      totalDX > 0
        ? 1
        : -1;

    /*
     * Move immediately once.
     */

    moveHorizontal(
      direction
    );

    /*
     * After the first movement,
     * use controlled DAS-like repeat.
     */

    if (
      !game.touch.repeatTimer
    ) {

      game.touch.repeatTimer =
        window.setTimeout(
          () => {

            if (
              !game.touch.active ||
              !canPlay() ||
              game.touch.longPressTriggered
            ) {

              return;

            }

            game.touch.repeatTimer =
              window.setInterval(
                () => {

                  if (
                    !game.touch.active ||
                    !canPlay() ||
                    game.touch.longPressTriggered
                  ) {

                    return;

                  }

                  const dx =
                    game.touch.lastX -
                    game.touch.startX;

                  moveHorizontal(
                    dx > 0
                      ? 1
                      : -1
                  );

                },
                TOUCH.MOVE_REPEAT_RATE
              );

          },
          TOUCH.MOVE_REPEAT_DELAY
        );

    }

  }


  /*
   * Downward movement.
   */

  if (
    absY >
      TOUCH.SWIPE_DISTANCE &&
    absY >
      absX &&
    totalDY > 0
  ) {

    clearTimeout(
      game.touch.longPressTimer
    );

    game.touch.longPressTimer =
      null;

    game.touch.actionStarted =
      true;

    /*
     * Fast downward swipe.
     *
     * It locks exactly ONCE.
     */

    const elapsed =
      Math.max(
        1,
        performance.now() -
        game.touch.startTime
      );

    const velocity =
      absY /
      elapsed;

    const hardDrop =
      absY >=
        TOUCH.HARD_DROP_DISTANCE ||
      (
        absY >= 70 &&
        elapsed <=
          TOUCH.HARD_DROP_TIME
      );

    if (
      hardDrop
    ) {

      hardDropOnce();

      return;

    }


    /*
     * Slow drag:
     * controlled soft drop.
     */

    if (
      Math.abs(stepDY) >= 8
    ) {

      softDrop();

    }

  }


  game.touch.lastX =
    x;

  game.touch.lastY =
    y;

}


function onPointerUp(
  event
) {

  if (
    !game.touch.active ||
    event.pointerId !==
    game.touch.id
  ) {

    return;

  }

  event.preventDefault();

  const dx =
    event.clientX -
    game.touch.startX;

  const dy =
    event.clientY -
    game.touch.startY;

  const distance =
    Math.hypot(
      dx,
      dy
    );

  const elapsed =
    performance.now() -
    game.touch.startTime;


  /*
   * If Hold was triggered,
   * this pointer session is DONE.
   *
   * This is the key fix for your
   * "long press creates many blocks" bug.
   */

  if (
    game.touch.longPressTriggered
  ) {

    cleanupTouch();

    return;

  }


  /*
   * If hard drop already happened
   * during pointermove, don't do anything again.
   */

  if (
    game.touch.actionStarted &&
    distance >
      TOUCH.SWIPE_DISTANCE
  ) {

    cleanupTouch();

    return;

  }


  /*
   * Tap = clockwise rotate.
   */

  if (
    distance <=
      TOUCH.TAP_MAX_DISTANCE &&
    elapsed <=
      TOUCH.TAP_MAX_TIME &&
    canPlay()
  ) {

    rotate(1);

  }


  cleanupTouch();

}


function onPointerCancel(
  event
) {

  if (
    event.pointerId ===
    game.touch.id
  ) {

    cleanupTouch();

  }

}


/*
 * Hard drop is deliberately isolated.
 *
 * There is NO interval.
 * There is NO repeat.
 * There is NO setTimeout.
 *
 * One gesture = one hard drop.
 */

function hardDropOnce() {

  if (
    !game.touch.active ||
    game.touch.longPressTriggered ||
    !canPlay()
  ) {

    return;

  }

  game.touch.actionStarted =
    true;

  game.touch.longPressTriggered =
    true;

  clearTimeout(
    game.touch.longPressTimer
  );

  game.touch.longPressTimer =
    null;

  stopTouchRepeat();

  hardDrop();

  cleanupTouch();

}


/*
 * Kill every touch-related timer.
 */

function cleanupTouch() {

  clearTimeout(
    game.touch.longPressTimer
  );

  game.touch.longPressTimer =
    null;

  stopTouchRepeat();

  clearInterval(
    game.touch.softDropTimer
  );

  game.touch.softDropTimer =
    null;

  game.touch.active =
    false;

  game.touch.id =
    null;

  game.touch.startX =
    0;

  game.touch.startY =
    0;

  game.touch.lastX =
    0;

  game.touch.lastY =
    0;

  game.touch.startTime =
    0;

  game.touch.moved =
    false;

  game.touch.actionStarted =
    false;

  game.touch.longPressTriggered =
    false;

}


function stopTouchRepeat() {

  clearTimeout(
    game.touch.repeatTimer
  );

  clearInterval(
    game.touch.repeatTimer
  );

  game.touch.repeatTimer =
    null;

}


/* =========================================================
   CANVAS FOCUS
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
   SETTINGS EVENTS
========================================================= */

function setupSettingsEvents() {

  el.sound?.addEventListener(
    "change",
    () => {

      updateSetting(
        "sound",
        el.sound.checked
      );

      if (
        el.sound.checked
      ) {

        unlockAudio();

      }

    }
  );


  el.music?.addEventListener(
    "change",
    () => {

      updateSetting(
        "music",
        el.music.checked
      );

      window.KasaneAudio
        ?.setMusicEnabled
        ?.(
          el.music.checked
        );

      window.GomokuAudio
        ?.setMusicEnabled
        ?.(
          el.music.checked
        );

      if (
        el.music.checked
      ) {

        unlockAudio();

      }

    }
  );


  el.ghost?.addEventListener(
    "change",
    () => {

      updateSetting(
        "ghost",
        el.ghost.checked
      );

      draw();

    }
  );


  el.haptic?.addEventListener(
    "change",
    () => {

      updateSetting(
        "haptic",
        el.haptic.checked
      );

    }
  );


  el.motion?.addEventListener(
    "change",
    () => {

      updateSetting(
        "motion",
        el.motion.checked
      );

    }
  );


  el.theme?.addEventListener(
    "change",
    () => {

      updateSetting(
        "theme",
        el.theme.value
      );

      applyTheme();

    }
  );

}


/* =========================================================
   NAVIGATION EVENTS
========================================================= */

function setupNavigation() {

  el.start?.addEventListener(
    "click",
    () => {

      showScreen(
        "setup"
      );

    }
  );


  el.records?.addEventListener(
    "click",
    () => {

      showScreen(
        "records"
      );

    }
  );


  el.settings?.addEventListener(
    "click",
    () => {

      showScreen(
        "settings"
      );

    }
  );


  el.begin?.addEventListener(
    "click",
    () => {

      startGame(
        selectedMode
      );

    }
  );


  el.pause?.addEventListener(
    "click",
    () => {

      pauseGame();

    }
  );


  el.resume?.addEventListener(
    "click",
    () => {

      resumeGame();

    }
  );


  el.again?.addEventListener(
    "click",
    () => {

      startGame(
        game.mode
      );

    }
  );


  el.home?.addEventListener(
    "click",
    () => {

      cleanupTouch();

      showScreen(
        "home"
      );

    }
  );


  el.back?.addEventListener(
    "click",
    () => {

      cleanupTouch();

      showScreen(
        "home"
      );

    }
  );


  el.menu?.addEventListener(
    "click",
    () => {

      if (
        currentScreen === "game"
      ) {

        pauseGame();

        return;

      }

      showScreen(
        "settings"
      );

    }
  );


  el.clearRecords?.addEventListener(
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
   HAPTICS
========================================================= */

function vibrate(
  duration
) {

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

    navigator.vibrate(
      duration
    );

  } catch {}

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
  message
) {

  if (
    !el.toast
  ) {

    return;

  }

  el.toast.textContent =
    message;

  el.toast.classList.add(
    "visible"
  );

  clearTimeout(
    toastTimer
  );

  toastTimer =
    window.setTimeout(
      () => {

        el.toast.classList.remove(
          "visible"
        );

      },
      1300
    );

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
   PAGE SAFETY
========================================================= */

window.addEventListener(
  "blur",
  () => {

    cleanupTouch();

  }
);


window.addEventListener(
  "pagehide",
  () => {

    cleanupTouch();

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

  updateHome();

  renderRecords();

  resizeCanvas();

  draw();

}


/*
 * initializeSettings
 */

function initializeSettings() {

  syncSettings();

  applyTheme();

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
