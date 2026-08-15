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
   I18N
========================================================= */

const LANGUAGES = {
  "zh-TW": {
    title: "Tetris",
    subtitle: "一格一格，慢慢堆成自己的節奏。",
    start: "開始遊戲",
    records: "紀錄",
    settings: "設定",
    modes: "遊戲模式",
    marathon: "Marathon",
    marathonDesc: "一路升級，挑戰極限",
    sprint: "Sprint",
    sprintDesc: "40 行速度挑戰",
    ultra: "Ultra",
    ultraDesc: "120 秒最高分",
    zen: "Zen",
    zenDesc: "沒有壓力，慢慢玩",
    begin: "開始",
    hold: "HOLD",
    next: "NEXT",
    mode: "模式",
    level: "等級",
    score: "分數",
    lines: "行數",
    combo: "COMBO",
    b2b: "B2B",
    pause: "暫停",
    paused: "暫停中",
    resume: "繼續",
    clear: "CLEAR",
    game: "GAME",
    gameComplete: "GAME COMPLETE",
    gameOver: "GAME OVER",
    complete: "完成得很好",
    gameEnded: "這次的棋局結束了。",
    sprintComplete: "40 行完成",
    timeUp: "時間到",
    playAgain: "再來一局",
    home: "返回首頁",
    games: "遊戲",
    bestScore: "最高分",
    bestLines: "最多行",
    bestSprint: "最佳 Sprint",
    noRecords: "還沒有棋局紀錄。",
    clearRecords: "清除紀錄",
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
    back: "返回",
    menu: "選單",
    perfectClear: "Perfect Clear",
    tetris: "TETRIS",
    cleared: "CLEAR",
    recordsCleared: "紀錄已清除",
    gestureHint: "滑動移動 · 點擊旋轉 · 上滑 HOLD · 下滑 DROP"
  },

  "zh-CN": {
    title: "Tetris",
    subtitle: "一格一格，慢慢堆成自己的节奏。",
    start: "开始游戏",
    records: "记录",
    settings: "设置",
    modes: "游戏模式",
    marathon: "Marathon",
    marathonDesc: "一路升级，挑战极限",
    sprint: "Sprint",
    sprintDesc: "40 行速度挑战",
    ultra: "Ultra",
    ultraDesc: "120 秒最高分",
    zen: "Zen",
    zenDesc: "没有压力，慢慢玩",
    begin: "开始",
    hold: "HOLD",
    next: "NEXT",
    mode: "模式",
    level: "等级",
    score: "分数",
    lines: "行数",
    combo: "COMBO",
    b2b: "B2B",
    pause: "暂停",
    paused: "暂停中",
    resume: "继续",
    clear: "CLEAR",
    game: "GAME",
    gameComplete: "GAME COMPLETE",
    gameOver: "GAME OVER",
    complete: "完成得很好",
    gameEnded: "这次的棋局结束了。",
    sprintComplete: "40 行完成",
    timeUp: "时间到",
    playAgain: "再来一局",
    home: "返回首页",
    games: "游戏",
    bestScore: "最高分",
    bestLines: "最多行",
    bestSprint: "最佳 Sprint",
    noRecords: "还没有棋局记录。",
    clearRecords: "清除记录",
    sound: "音效",
    soundDesc: "UISFX 游戏音效",
    music: "背景音乐",
    musicDesc: "CC0 背景音乐",
    ghost: "Ghost",
    ghostDesc: "显示落点预览",
    haptic: "震动",
    hapticDesc: "支持设备震动反馈",
    motion: "动画",
    motionDesc: "方块与消行动画",
    appearance: "外观",
    appearanceDesc: "系统 / 浅色 / 深色",
    system: "System",
    light: "Light",
    dark: "Dark",
    back: "返回",
    menu: "菜单",
    perfectClear: "Perfect Clear",
    tetris: "TETRIS",
    cleared: "CLEAR",
    recordsCleared: "记录已清除",
    gestureHint: "滑动移动 · 点击旋转 · 上滑 HOLD · 下滑 DROP"
  },

  en: {
    title: "Tetris",
    subtitle: "Stack one piece at a time. Find your rhythm.",
    start: "Start Game",
    records: "Records",
    settings: "Settings",
    modes: "Game Mode",
    marathon: "Marathon",
    marathonDesc: "Level up and push your limit",
    sprint: "Sprint",
    sprintDesc: "Clear 40 lines as fast as possible",
    ultra: "Ultra",
    ultraDesc: "Highest score in 120 seconds",
    zen: "Zen",
    zenDesc: "No pressure. Just play.",
    begin: "Start",
    hold: "HOLD",
    next: "NEXT",
    mode: "MODE",
    level: "LEVEL",
    score: "SCORE",
    lines: "LINES",
    combo: "COMBO",
    b2b: "B2B",
    pause: "Pause",
    paused: "Paused",
    resume: "Resume",
    clear: "CLEAR",
    game: "GAME",
    gameComplete: "GAME COMPLETE",
    gameOver: "GAME OVER",
    complete: "Nice run",
    gameEnded: "This game has ended.",
    sprintComplete: "40 Lines Complete",
    timeUp: "Time's Up",
    playAgain: "Play Again",
    home: "Home",
    games: "Games",
    bestScore: "Best Score",
    bestLines: "Best Lines",
    bestSprint: "Best Sprint",
    noRecords: "No games recorded yet.",
    clearRecords: "Clear Records",
    sound: "Sound",
    soundDesc: "UISFX game sounds",
    music: "Music",
    musicDesc: "CC0 background music",
    ghost: "Ghost",
    ghostDesc: "Show landing preview",
    haptic: "Haptics",
    hapticDesc: "Device vibration feedback",
    motion: "Motion",
    motionDesc: "Piece and line-clear animations",
    appearance: "Appearance",
    appearanceDesc: "System / Light / Dark",
    system: "System",
    light: "Light",
    dark: "Dark",
    back: "Back",
    menu: "Menu",
    perfectClear: "Perfect Clear",
    tetris: "TETRIS",
    cleared: "CLEAR",
    recordsCleared: "Records cleared",
    gestureHint: "Swipe to move · Tap to rotate · Swipe up for HOLD · Swipe down to DROP"
  },

  ja: {
    title: "Tetris",
    subtitle: "ひとつずつ積んで、自分のリズムで。",
    start: "ゲーム開始",
    records: "記録",
    settings: "設定",
    modes: "ゲームモード",
    marathon: "Marathon",
    marathonDesc: "レベルを上げて限界に挑戦",
    sprint: "Sprint",
    sprintDesc: "40ラインをできるだけ速く",
    ultra: "Ultra",
    ultraDesc: "120秒で最高スコア",
    zen: "Zen",
    zenDesc: "ゆっくり遊ぼう。",
    begin: "開始",
    hold: "HOLD",
    next: "NEXT",
    mode: "モード",
    level: "レベル",
    score: "スコア",
    lines: "ライン",
    combo: "COMBO",
    b2b: "B2B",
    pause: "一時停止",
    paused: "一時停止中",
    resume: "再開",
    clear: "CLEAR",
    game: "GAME",
    gameComplete: "GAME COMPLETE",
    gameOver: "GAME OVER",
    complete: "いいプレイでした",
    gameEnded: "ゲーム終了です。",
    sprintComplete: "40ラインクリア",
    timeUp: "時間切れ",
    playAgain: "もう一度",
    home: "ホーム",
    games: "ゲーム数",
    bestScore: "最高スコア",
    bestLines: "最多ライン",
    bestSprint: "ベストSprint",
    noRecords: "まだ記録がありません。",
    clearRecords: "記録を消去",
    sound: "サウンド",
    soundDesc: "UISFXゲームサウンド",
    music: "BGM",
    musicDesc: "CC0バックグラウンドミュージック",
    ghost: "Ghost",
    ghostDesc: "落下位置を表示",
    haptic: "振動",
    hapticDesc: "デバイスの振動",
    motion: "アニメーション",
    motionDesc: "ブロックとライン消去",
    appearance: "外観",
    appearanceDesc: "システム / ライト / ダーク",
    system: "System",
    light: "Light",
    dark: "Dark",
    back: "戻る",
    menu: "メニュー",
    perfectClear: "Perfect Clear",
    tetris: "TETRIS",
    cleared: "CLEAR",
    recordsCleared: "記録を消去しました",
    gestureHint: "スワイプで移動 · タップで回転 · 上スワイプでHOLD · 下スワイプでDROP"
  },

  ko: {
    title: "Tetris",
    subtitle: "한 칸씩 쌓으며 나만의 리듬을 찾아보세요.",
    start: "게임 시작",
    records: "기록",
    settings: "설정",
    modes: "게임 모드",
    marathon: "Marathon",
    marathonDesc: "레벨을 올리고 한계에 도전",
    sprint: "Sprint",
    sprintDesc: "40줄을 최대한 빠르게",
    ultra: "Ultra",
    ultraDesc: "120초 동안 최고 점수",
    zen: "Zen",
    zenDesc: "부담 없이 천천히",
    begin: "시작",
    hold: "HOLD",
    next: "NEXT",
    mode: "모드",
    level: "레벨",
    score: "점수",
    lines: "줄",
    combo: "COMBO",
    b2b: "B2B",
    pause: "일시정지",
    paused: "일시정지 중",
    resume: "계속",
    clear: "CLEAR",
    game: "GAME",
    gameComplete: "GAME COMPLETE",
    gameOver: "GAME OVER",
    complete: "멋진 플레이",
    gameEnded: "게임이 끝났습니다.",
    sprintComplete: "40줄 완료",
    timeUp: "시간 종료",
    playAgain: "다시 하기",
    home: "홈",
    games: "게임",
    bestScore: "최고 점수",
    bestLines: "최고 줄",
    bestSprint: "최고 Sprint",
    noRecords: "아직 기록이 없습니다.",
    clearRecords: "기록 삭제",
    sound: "사운드",
    soundDesc: "UISFX 게임 효과음",
    music: "배경 음악",
    musicDesc: "CC0 배경 음악",
    ghost: "Ghost",
    ghostDesc: "착지 위치 표시",
    haptic: "진동",
    hapticDesc: "기기 진동 피드백",
    motion: "애니메이션",
    motionDesc: "블록과 줄 삭제 애니메이션",
    appearance: "화면",
    appearanceDesc: "시스템 / 밝게 / 어둡게",
    system: "System",
    light: "Light",
    dark: "Dark",
    back: "뒤로",
    menu: "메뉴",
    perfectClear: "Perfect Clear",
    tetris: "TETRIS",
    cleared: "CLEAR",
    recordsCleared: "기록을 삭제했습니다",
    gestureHint: "스와이프로 이동 · 탭으로 회전 · 위로 스와이프 HOLD · 아래로 스와이프 DROP"
  }
};


function getLanguage() {
  const saved =
    data.settings.language;

  if (saved && LANGUAGES[saved]) {
    return saved;
  }

  const browser =
    navigator.language || "en";

  if (LANGUAGES[browser]) {
    return browser;
  }

  if (browser.startsWith("zh-TW")) {
    return "zh-TW";
  }

  if (browser.startsWith("zh")) {
    return "zh-CN";
  }

  if (browser.startsWith("ja")) {
    return "ja";
  }

  if (browser.startsWith("ko")) {
    return "ko";
  }

  return "en";
}


let language =
  getLanguage();


function t(key) {
  return (
    LANGUAGES[language]?.[key] ??
    LANGUAGES.en[key] ??
    key
  );
}


function setLanguage(next) {
  if (!LANGUAGES[next]) {
    return;
  }

  language = next;
  data.settings.language = next;
  saveData(data);
  applyI18n();
}


function applyI18n() {
  document.documentElement.lang =
    language;

  const map = {
    "#startButton": "start",
    "#recordsButton": "records",
    "#settingsButton": "settings",
    "#beginButton": "begin",
    "#resumeButton": "resume",
    "#againButton": "playAgain",
    "#homeButton": "home",
    "#clearRecordsButton": "clearRecords",
    "#pauseButton": "pause",
    "#backButton": "back",
    "#menuButton": "menu",
    "#soundToggle": "sound",
    "#musicToggle": "music",
    "#ghostToggle": "ghost",
    "#hapticToggle": "haptic",
    "#motionToggle": "motion",
    "#themeSelect": "appearance"
  };

  Object.entries(map).forEach(
    ([selector, key]) => {
      const el = document.querySelector(selector);

      if (!el) {
        return;
      }

      if (
        el.tagName === "INPUT" ||
        el.tagName === "SELECT"
      ) {
        return;
      }

      el.textContent = t(key);
    }
  );

  const subtitle =
    document.querySelector(".subtitle");

  if (subtitle) {
    subtitle.textContent =
      t("subtitle");
  }

  const title =
    document.querySelector("title");

  if (title) {
    title.textContent =
      t("title");
  }

  const homeH1 =
    document.querySelector("#homeScreen h1");

  if (homeH1) {
    homeH1.textContent =
      t("title");
  }

  const setupTitle =
    document.querySelector("#setupScreen h2");

  if (setupTitle) {
    setupTitle.textContent =
      t("modes");
  }

  const recordsTitle =
    document.querySelector("#recordsScreen h2");

  if (recordsTitle) {
    recordsTitle.textContent =
      t("records");
  }

  const settingsTitle =
    document.querySelector("#settingsScreen h2");

  if (settingsTitle) {
    settingsTitle.textContent =
      t("settings");
  }

  const modeCards =
    document.querySelectorAll(".mode-card");

  modeCards.forEach(card => {
    const mode =
      card.dataset.mode;

    const strong =
      card.querySelector("strong");

    const span =
      card.querySelector("span");

    if (mode === "marathon") {
      strong.textContent = t("marathon");
      span.textContent = t("marathonDesc");
    }

    if (mode === "sprint") {
      strong.textContent = t("sprint");
      span.textContent = t("sprintDesc");
    }

    if (mode === "ultra") {
      strong.textContent = t("ultra");
      span.textContent = t("ultraDesc");
    }

    if (mode === "zen") {
      strong.textContent = t("zen");
      span.textContent = t("zenDesc");
    }
  });

  const labels = {
    ".status-label": "bestScore",
    ".hold-card .panel-label": "hold",
    ".right-panel .panel-label": "next",
    ".mobile-status div:nth-child(1) span": "score",
    ".mobile-status div:nth-child(2) span": "lines",
    ".score-card div:nth-child(1) span": "score",
    ".score-card div:nth-child(2) span": "lines",
    ".score-card div:nth-child(3) span": "combo",
    ".score-card div:nth-child(4) span": "b2b",
    ".result-stats div:nth-child(1) span": "score",
    ".result-stats div:nth-child(2) span": "lines",
    ".result-stats div:nth-child(3) span": "level",
    ".stats-grid div:nth-child(1) span": "games",
    ".stats-grid div:nth-child(2) span": "bestScore",
    ".stats-grid div:nth-child(3) span": "bestLines",
    ".stats-grid div:nth-child(4) span": "bestSprint"
  };

  Object.entries(labels).forEach(
    ([selector, key]) => {
      const el =
        document.querySelector(selector);

      if (el) {
        el.textContent = t(key);
      }
    }
  );

  const settingRows =
    document.querySelectorAll(
      ".setting-row"
    );

  const settingKeys = [
    ["sound", "soundDesc"],
    ["music", "musicDesc"],
    ["ghost", "ghostDesc"],
    ["haptic", "hapticDesc"],
    ["motion", "motionDesc"],
    ["appearance", "appearanceDesc"]
  ];

  settingRows.forEach(
    (row, index) => {
      const pair =
        settingKeys[index];

      if (!pair) {
        return;
      }

      const strong =
        row.querySelector("strong");

      const small =
        row.querySelector("small");

      if (strong) {
        strong.textContent =
          t(pair[0]);
      }

      if (small) {
        small.textContent =
          t(pair[1]);
      }
    }
  );

  const themeSelect =
    document.querySelector("#themeSelect");

  if (themeSelect) {
    const options =
      themeSelect.options;

    options[0].textContent = t("system");
    options[1].textContent = t("light");
    options[2].textContent = t("dark");
  }

  renderGestureHint();
}


/* =========================================================
   DOM
========================================================= */

const $ =
  selector =>
    document.querySelector(selector);

const $$ =
  selector =>
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
   GAME
========================================================= */

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

  touch: {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startTime: 0,
    moved: false,
    holdTimer: null,
    repeatTimer: null
  }
};


let selectedMode =
  "marathon";

let currentScreen =
  "home";


/* =========================================================
   DYNAMIC TOUCH UI
========================================================= */

function installTouchUI() {
  const old =
    document.querySelector(
      "#kasaneTouchHint"
    );

  old?.remove();

  const hint =
    document.createElement("div");

  hint.id =
    "kasaneTouchHint";

  hint.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.appendChild(
    hint
  );

  const style =
    document.createElement("style");

  style.id =
    "kasaneAppRuntimeStyle";

  style.textContent = `
    #kasaneTouchHint {
      position: fixed;
      left: 50%;
      bottom: calc(
        12px + env(safe-area-inset-bottom)
      );
      transform: translateX(-50%);
      z-index: 30;
      pointer-events: none;
      padding: 8px 13px;
      border-radius: 999px;
      background: rgba(71,90,97,.72);
      color: white;
      font-size: 11px;
      line-height: 1;
      letter-spacing: .02em;
      opacity: .72;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: opacity .25s ease;
      white-space: nowrap;
    }

    body.kasane-playing
      #kasaneTouchHint {
      opacity: .34;
    }

    .mobile-controls {
      display: none !important;
    }

    .game-screen {
      padding-bottom:
        calc(
          12px +
          env(safe-area-inset-bottom)
        ) !important;
    }

    #gameCanvas {
      cursor: default;
      touch-action: none !important;
    }

    @media (max-width: 900px) {
      .game-layout {
        grid-template-columns: 1fr !important;
        width: min(680px, 100%) !important;
        gap: 10px !important;
      }

      .left-panel,
      .right-panel {
        display: none !important;
      }

      .board-column {
        width: min(
          100%,
          560px
        );
        margin: 0 auto;
      }

      .board-frame {
        width: 100% !important;
        height: auto !important;
        max-height: none !important;
        aspect-ratio: 10 / 20 !important;
      }

      .mobile-status {
        display: flex !important;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 9px;
      }

      .mobile-status > div {
        flex: 1;
        min-height: 54px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 15px;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: var(--surface);
      }

      .mobile-status span {
        color: var(--muted);
        font-size: 11px;
        letter-spacing: .08em;
      }

      .mobile-status strong {
        font-size: 20px;
      }
    }

    @media (max-width: 520px) {
      .topbar {
        grid-template-columns: 52px 1fr 52px;
      }

      .game-screen {
        padding:
          10px
          10px
          calc(
            10px +
            env(safe-area-inset-bottom)
          ) !important;
      }

      .board-column {
        width: 100%;
      }

      .board-frame {
        border-radius: 18px !important;
        padding: 7px !important;
      }

      #gameCanvas {
        border-radius: 13px !important;
      }

      #kasaneTouchHint {
        font-size: 10px;
        max-width: calc(100vw - 30px);
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    @media (orientation: landscape)
      and (max-height: 600px) {

      .game-screen {
        padding-top: 7px !important;
      }

      .board-column {
        width: auto !important;
      }

      .board-frame {
        height:
          calc(
            100dvh -
            90px -
            env(safe-area-inset-top) -
            env(safe-area-inset-bottom)
          ) !important;
        width: auto !important;
      }

      .mobile-status {
        display: none !important;
      }

      #kasaneTouchHint {
        bottom:
          calc(
            6px +
            env(safe-area-inset-bottom)
          );
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `;

  document.head.appendChild(style);
}


function renderGestureHint() {
  const hint =
    $("#kasaneTouchHint");

  if (hint) {
    hint.textContent =
      t("gestureHint");
  }
}


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
  document.documentElement.dataset.theme =
    data.settings.theme ||
    "system";
}


/* =========================================================
   NAVIGATION
========================================================= */

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
    document.body.classList.add(
      "kasane-playing"
    );

    requestAnimationFrame(() => {
      resizeCanvas();
      draw();
    });
  } else {
    document.body.classList.remove(
      "kasane-playing"
    );
  }
}


function goHome() {
  stopTouchTimers();

  if (
    game.running &&
    !game.over
  ) {
    game.running = false;
  }

  showScreen("home");
}


/* =========================================================
   MODE
========================================================= */

function setupModeSelection() {
  $$(".mode-card").forEach(
    button => {
      button.addEventListener(
        "click",
        () => {
          $$(".mode-card").forEach(
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
            SFX.move,
            {
              cooldownMs: 40
            }
          );
        }
      );
    }
  );
}


/* =========================================================
   RANDOMIZER
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

  return createPiece(type);
}


/* =========================================================
   START
========================================================= */

function startGame(
  modeId = selectedMode
) {
  unlockAudio();

  game.running = true;
  game.paused = false;
  game.over = false;

  game.mode =
    modeId;

  game.modeConfig =
    getMode(modeId);

  game.board =
    createBoard();

  game.randomizer =
    createRandomizer();

  game.next = [];
  game.hold = null;
  game.holdUsed = false;

  game.score = 0;
  game.lines = 0;
  game.level = 1;

  game.combo = -1;
  game.b2b = false;

  game.lastActionWasRotation =
    false;

  game.lockStartedAt =
    null;

  game.accumulator = 0;

  game.lastTime =
    performance.now();

  game.startTime =
    performance.now();

  fillNextQueue();

  game.current =
    takeNextPiece();

  updateGravity();

  if (
    collides(
      game.board,
      game.current
    )
  ) {
    finishGame(false);
    return;
  }

  showScreen("game");

  updateGameUI();

  cancelAnimationFrame(
    game.animationFrame
  );

  game.animationFrame =
    requestAnimationFrame(loop);

  playSFX(SFX.resume);

  focusGameCanvas();
}


/* =========================================================
   LOOP
========================================================= */

function loop(timestamp) {
  if (!game.running) {
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
    requestAnimationFrame(loop);
}


/* =========================================================
   UPDATE
========================================================= */

function update(
  delta,
  timestamp
) {
  if (
    game.modeConfig.timed
  ) {
    const elapsed =
      (
        timestamp -
        game.startTime
      ) / 1000;

    const remaining =
      Math.max(
        0,
        game.modeConfig.duration -
        elapsed
      );

    if (
      remaining <= 0
    ) {
      finishGame(true);
      return;
    }
  }

  const interval =
    game.softDropping
      ? Math.max(
          25,
          game.dropInterval /
          CONFIG.SOFT_DROP_FACTOR
        )
      : game.dropInterval;

  game.accumulator +=
    delta;

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

    game.current =
      moved;

    distance++;
  }

  game.score +=
    distance *
    CONFIG.SCORE.hardDrop;

  playSFX(SFX.drop);

  vibrate(10);

  lockPiece();
}


/* =========================================================
   ROTATE
========================================================= */

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

  game.lockStartedAt =
    null;

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

  game.holdUsed =
    true;

  game.lockStartedAt =
    null;

  game.lastActionWasRotation =
    false;

  playSFX(SFX.hold);

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

  playSFX(SFX.lock);

  const result =
    clearLines(
      game.board
    );

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
      t("perfectClear")
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

    playSFX(
      SFX.combo,
      {
        cooldownMs: 80
      }
    );
  }

  game.score +=
    score;
}


function scoreTSpin(
  lines
) {
  game.combo += 1;

  let score = 0;

  if (lines === 1) {
    score =
      CONFIG.SCORE.tSpinSingle;
  } else if (lines === 2) {
    score =
      CONFIG.SCORE.tSpinDouble;
  } else if (lines === 3) {
    score =
      CONFIG.SCORE.tSpinTriple;
  } else {
    score =
      CONFIG.SCORE.tSpinMini;
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
    showToast(t("tetris"));
    return;
  }

  playSFX(SFX.line);
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

  playSFX(SFX.resume);

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

  stopTouchTimers();

  const elapsed =
    (
      performance.now() -
      game.startTime
    ) / 1000;

  const result = {
    mode: game.mode,
    score: game.score,
    lines: game.lines,
    level: game.level,
    time:
      game.mode === "ultra"
        ? Math.min(
            120,
            elapsed
          )
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
      ? 30
      : 55
  );

  showResult(result);
  updateHome();
}


/* =========================================================
   RESULT
========================================================= */

function showResult(
  result
) {
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
        ? t("clear")
        : t("game");
  }

  if (elements.resultKicker) {
    elements.resultKicker.textContent =
      result.completed
        ? t("gameComplete")
        : t("gameOver");
  }

  if (elements.resultTitle) {
    if (
      result.mode === "sprint" &&
      result.completed
    ) {
      elements.resultTitle.textContent =
        t("sprintComplete");
    } else if (
      result.mode === "ultra"
    ) {
      elements.resultTitle.textContent =
        t("timeUp");
    } else {
      elements.resultTitle.textContent =
        result.completed
          ? t("complete")
          : t("gameEnded");
    }
  }

  if (elements.resultDescription) {
    elements.resultDescription.textContent =
      result.mode === "sprint"
        ? (
            result.completed
              ? formatTime(result.time)
              : `${result.lines}`
          )
        : `${result.lines} · ${result.score}`;
  }

  showScreen("result");
}


/* =========================================================
   CAN PLAY
========================================================= */

function canPlay() {
  return (
    game.running &&
    !game.paused &&
    !game.over &&
    Boolean(game.current)
  );
}


/* =========================================================
   CANVAS
========================================================= */

function resizeCanvas() {
  if (!canvas || !ctx) {
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

  const cell =
    Math.min(
      rect.width /
        CONFIG.WIDTH,
      rect.height /
        CONFIG.HEIGHT
    );

  const width =
    cell *
    CONFIG.WIDTH;

  const height =
    cell *
    CONFIG.HEIGHT;

  return {
    x:
      (rect.width - width) / 2,
    y:
      (rect.height - height) / 2,
    cell,
    width,
    height
  };
}


/* =========================================================
   DRAW
========================================================= */

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
    "rgba(71,90,97,.10)";

  ctx.lineWidth = 1;

  for (
    let x = 0;
    x <= CONFIG.WIDTH;
    x++
  ) {
    const px =
      g.x +
      x * g.cell;

    ctx.beginPath();
    ctx.moveTo(px, g.y);
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
    ctx.moveTo(g.x, py);
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
    0.18
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
    x * g.cell;

  const py =
    g.y +
    y * g.cell;

  const size =
    g.cell;

  const color =
    COLORS[type] ||
    "#888888";

  ctx.save();

  ctx.globalAlpha =
    alpha;

  if (alpha < 1) {
    ctx.strokeStyle =
      color;

    ctx.lineWidth =
      Math.max(
        1,
        size * .07
      );

    ctx.strokeRect(
      px + size * .15,
      py + size * .15,
      size * .7,
      size * .7
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
    lighten(color, .18)
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
   PREVIEWS
========================================================= */

function drawSidePreviews() {
  drawMiniPiece(
    holdCtx,
    holdCanvas,
    game.hold
  );

  nextCanvases.forEach(
    (target, index) => {
      drawMiniPiece(
        target.getContext("2d"),
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

  context.clearRect(
    0,
    0,
    targetCanvas.width,
    targetCanvas.height
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
      targetCanvas.width /
        (cellsWidth + 1),
      targetCanvas.height /
        (cellsHeight + 1)
    );

  const offsetX =
    (
      targetCanvas.width -
      cellsWidth * size
    ) / 2;

  const offsetY =
    (
      targetCanvas.height -
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
   UI
========================================================= */

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
   RECORDS
========================================================= */

function renderRecords() {
  if (elements.gamesStat) {
    elements.gamesStat.textContent =
      String(
        data.stats.games || 0
      );
  }

  if (elements.bestStat) {
    elements.bestStat.textContent =
      String(
        data.stats.bestScore || 0
      );
  }

  if (elements.linesStat) {
    elements.linesStat.textContent =
      String(
        data.stats.bestLines || 0
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
      t("noRecords");

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
          language
        );

      item.innerHTML = `
        <div>
          <strong>
            ${escapeHTML(record.mode)}
          </strong>
          <span>
            ${escapeHTML(dateText)}
          </span>
        </div>

        <div>
          <strong>
            ${record.score}
          </strong>
          <span>
            ${record.lines}
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
        game.softDropping = true;
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
   TOUCH ENGINE
========================================================= */

function setupTouchControls() {
  if (!canvas) {
    return;
  }

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
    "pointerleave",
    event => {
      if (
        game.touch.active &&
        event.pointerType === "mouse"
      ) {
        onPointerCancel(event);
      }
    },
    {
      passive: false
    }
  );

  canvas.addEventListener(
    "contextmenu",
    event => {
      event.preventDefault();
    }
  );
}


function onPointerDown(event) {
  if (
    currentScreen !== "game"
  ) {
    return;
  }

  if (
    !game.running ||
    game.over
  ) {
    return;
  }

  event.preventDefault();

  unlockAudio();

  try {
    canvas.setPointerCapture(
      event.pointerId
    );
  } catch {}

  stopTouchTimers();

  const now =
    performance.now();

  game.touch.active =
    true;

  game.touch.pointerId =
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
    now;

  game.touch.moved =
    false;

  if (
    game.paused
  ) {
    return;
  }

  game.touch.holdTimer =
    window.setTimeout(
      () => {
        if (
          !game.touch.active ||
          game.touch.moved
        ) {
          return;
        }

        if (
          game.softDropping
        ) {
          return;
        }

        game.softDropping =
          true;

        softDrop();

        game.touch.repeatTimer =
          window.setInterval(
            () => {
              if (
                !game.touch.active ||
                !game.softDropping
              ) {
                return;
              }

              softDrop();
            },
            55
          );
      },
      220
    );
}


function onPointerMove(event) {
  if (
    !game.touch.active ||
    event.pointerId !==
      game.touch.pointerId
  ) {
    return;
  }

  event.preventDefault();

  if (game.paused) {
    return;
  }

  const dx =
    event.clientX -
    game.touch.lastX;

  const dy =
    event.clientY -
    game.touch.lastY;

  const totalX =
    event.clientX -
    game.touch.startX;

  const totalY =
    event.clientY -
    game.touch.startY;

  const absTotalX =
    Math.abs(totalX);

  const absTotalY =
    Math.abs(totalY);

  if (
    absTotalX > 10 ||
    absTotalY > 10
  ) {
    game.touch.moved =
      true;

    clearTimeout(
      game.touch.holdTimer
    );
  }

  const rect =
    canvas.getBoundingClientRect();

  const threshold =
    Math.max(
      18,
      Math.min(
        42,
        rect.width / 12
      )
    );

  if (
    Math.abs(dx) >= threshold
  ) {
    const count =
      Math.max(
        1,
        Math.floor(
          Math.abs(dx) /
          threshold
        )
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

    game.touch.lastX =
      event.clientX;
  }

  if (
    totalY >
    threshold
  ) {
    if (
      Math.abs(totalY) >
      Math.abs(totalX) * .75
    ) {
      if (
        game.softDropping
      ) {
        game.softDropping =
          false;
      }

      hardDrop();

      game.touch.moved =
        true;

      game.touch.startX =
        event.clientX;

      game.touch.startY =
        event.clientY;

      game.touch.lastX =
        event.clientX;

      game.touch.lastY =
        event.clientY;

      return;
    }
  }

  if (
    totalY <
    -threshold
  ) {
    if (
      Math.abs(totalY) >
      Math.abs(totalX) * .75
    ) {
      holdPiece();

      game.touch.moved =
        true;

      game.touch.startX =
        event.clientX;

      game.touch.startY =
        event.clientY;

      game.touch.lastX =
        event.clientX;

      game.touch.lastY =
        event.clientY;

      return;
    }
  }

  game.touch.lastY =
    event.clientY;
}


function onPointerUp(event) {
  if (
    !game.touch.active ||
    event.pointerId !==
      game.touch.pointerId
  ) {
    return;
  }

  event.preventDefault();

  const duration =
    performance.now() -
    game.touch.startTime;

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

  const wasMoving =
    game.touch.moved ||
    distance > 16;

  stopTouchTimers();

  if (
    !game.paused &&
    !wasMoving &&
    duration < 350
  ) {
    const rect =
      canvas.getBoundingClientRect();

    const localX =
      event.clientX -
      rect.left;

    const direction =
      localX <
      rect.width / 2
        ? -1
        : 1;

    rotate(direction);
  }

  game.touch.active =
    false;

  try {
    canvas.releasePointerCapture(
      event.pointerId
    );
  } catch {}
}


function onPointerCancel(event) {
  if (
    !game.touch.active
  ) {
    return;
  }

  event.preventDefault();

  game.softDropping =
    false;

  stopTouchTimers();

  game.touch.active =
    false;

  try {
    canvas.releasePointerCapture(
      game.touch.pointerId
    );
  } catch {}
}


function stopTouchTimers() {
  clearTimeout(
    game.touch.holdTimer
  );

  clearInterval(
    game.touch.repeatTimer
  );

  game.touch.holdTimer =
    null;

  game.touch.repeatTimer =
    null;

  game.softDropping =
    false;
}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {
  elements.startButton?.addEventListener(
    "click",
    () => {
      unlockAudio();
      showScreen("setup");
    }
  );

  elements.recordsButton?.addEventListener(
    "click",
    () => {
      showScreen("records");
    }
  );

  elements.settingsButton?.addEventListener(
    "click",
    () => {
      showScreen("settings");
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
      goHome();
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

      showScreen("settings");
    }
  );

  elements.clearRecordsButton?.addEventListener(
    "click",
    () => {
      clearRecords(data);

      showToast(
        t("recordsCleared")
      );

      renderRecords();
      updateHome();
    }
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

  installLanguageSelector();
}


/* =========================================================
   LANGUAGE SELECTOR
========================================================= */

function installLanguageSelector() {
  const settingsList =
    document.querySelector(
      ".settings-list"
    );

  if (!settingsList) {
    return;
  }

  const existing =
    document.querySelector(
      "#kasaneLanguageRow"
    );

  existing?.remove();

  const row =
    document.createElement("label");

  row.className =
    "setting-row";

  row.id =
    "kasaneLanguageRow";

  row.innerHTML = `
    <span>
      <strong>Language</strong>
      <small>繁中 / 简中 / English / 日本語 / 한국어</small>
    </span>

    <select
      id="kasaneLanguageSelect"
      aria-label="Language"
    >
      <option value="zh-TW">繁中</option>
      <option value="zh-CN">简中</option>
      <option value="en">English</option>
      <option value="ja">日本語</option>
      <option value="ko">한국어</option>
    </select>
  `;

  settingsList.appendChild(row);

  const select =
    row.querySelector(
      "#kasaneLanguageSelect"
    );

  select.value =
    language;

  select.addEventListener(
    "change",
    () => {
      setLanguage(
        select.value
      );
    }
  );
}


/* =========================================================
   AUDIO
========================================================= */

function installAudioBridge() {
  window.KasaneStartGame =
    () => unlockAudio();

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
      preventScroll: true
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

  return `
    rgb(
      ${nr},
      ${ng},
      ${nb}
    )
  `;
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
  },
  {
    passive: true
  }
);


/* =========================================================
   ORIENTATION
========================================================= */

window.addEventListener(
  "orientationchange",
  () => {
    window.setTimeout(
      () => {
        resizeCanvas();
        draw();
      },
      120
    );
  },
  {
    passive: true
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
   SYSTEM THEME
========================================================= */

const media =
  window.matchMedia?.(
    "(prefers-color-scheme: dark)"
  );

media?.addEventListener?.(
  "change",
  () => {
    if (
      data.settings.theme ===
      "system"
    ) {
      applyTheme();
    }
  }
);


/* =========================================================
   INIT
========================================================= */

function init() {
  installTouchUI();

  syncSettings();
  applyTheme();

  setupModeSelection();
  setupNavigation();
  setupKeyboard();
  setupTouchControls();
  setupSettingsEvents();
  installAudioBridge();

  applyI18n();

  updateHome();
  renderRecords();

  requestAnimationFrame(
    () => {
      resizeCanvas();
      draw();
    }
  );
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
