"use strict";

export const CONFIG = {
  WIDTH: 10,
  HEIGHT: 20,
  HIDDEN_ROWS: 4,

  CELL_SIZE: 30,

  LOCK_DELAY: 500,
  MAX_LOCK_RESETS: 15,

  DAS: 120,
  ARR: 30,

  SOFT_DROP_FACTOR: 18,

  LEVEL_LINES: 10,
  NEXT_COUNT: 5,

  SCORE: {
    single: 100,
    double: 300,
    triple: 500,
    tetris: 800,

    tSpinMini: 100,
    tSpinSingle: 800,
    tSpinDouble: 1200,
    tSpinTriple: 1600,

    perfectClear: 3500,

    combo: 50,

    softDrop: 1,
    hardDrop: 2
  },

  BGM_VOLUME: 0.18,
  SFX_VOLUME: 0.42,

  STORAGE_KEY: "gomoku-tetris-mmp-v1"
};


/*
 * KASANE
 * 手工陶瓷／釉彩方塊色票
 *
 * UI 本身維持：
 * 暖棕
 * 米白
 * 木質
 * 深咖啡
 *
 * 方塊則使用低飽和陶瓷釉色，
 * 讓遊戲畫面有「陶片」的質感，
 * 不會破壞 KASANE 的整體色調。
 */

export const COLORS = {
  // 青白釉
  I: "#9FB9B1",

  // 灰青陶
  J: "#879995",

  // 赤陶
  L: "#B87550",

  // 米黃陶
  O: "#D2B77A",

  // 青綠釉
  S: "#849A7E",

  // 玫瑰陶
  Z: "#B77D73",

  // 灰紫釉
  T: "#9B8793"
};


/*
 * 陶瓷高光色
 *
 * 如果你的 renderer 有做漸層、
 * highlight 或 bevel，可以直接使用。
 */

export const CERAMIC = {
  I: {
    base: "#9FB9B1",
    light: "#C7D8D2",
    dark: "#718982"
  },

  J: {
    base: "#879995",
    light: "#B4C1BE",
    dark: "#626F6C"
  },

  L: {
    base: "#B87550",
    light: "#D19A78",
    dark: "#895139"
  },

  O: {
    base: "#D2B77A",
    light: "#E6D5A8",
    dark: "#A58C58"
  },

  S: {
    base: "#849A7E",
    light: "#AFC0A8",
    dark: "#63755E"
  },

  Z: {
    base: "#B77D73",
    light: "#D09E97",
    dark: "#8C5B55"
  },

  T: {
    base: "#9B8793",
    light: "#BBAEB6",
    dark: "#75636E"
  }
};


export const SFX = {
  move: "move",
  rotate: "rotate",
  hold: "hold",
  drop: "drop",
  lock: "lock",

  line: "line",
  tetris: "tetris",
  tSpin: "tspin",
  combo: "combo",

  level: "level",
  gameover: "gameover",

  pause: "pause",
  resume: "resume"
};


export const KEYS = {
  left: [
    "ArrowLeft",
    "a",
    "A"
  ],

  right: [
    "ArrowRight",
    "d",
    "D"
  ],

  down: [
    "ArrowDown",
    "s",
    "S"
  ],

  rotate: [
    "ArrowUp",
    "x",
    "X"
  ],

  rotateCCW: [
    "z",
    "Z",
    "Control"
  ],

  drop: [
    " ",
    "Enter"
  ],

  hold: [
    "c",
    "C",
    "Shift"
  ],

  pause: [
    "Escape",
    "p",
    "P"
  ]
};
