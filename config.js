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


export const COLORS = {

  I: "#73b9c8",

  J: "#6b86b5",

  L: "#d69a5b",

  O: "#d9bf69",

  S: "#7fae87",

  Z: "#bd7474",

  T: "#9b7cae"

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
