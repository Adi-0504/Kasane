"use strict";


export const MODES = {

  marathon: {

    name: "Marathon",

    target: null,

    timed: false,

    gravity(level) {

      return Math.max(
        55,
        900 -
        (
          level - 1
        ) *
        70
      );

    }

  },


  sprint: {

    name: "Sprint",

    target: 40,

    timed: false,

    gravity() {

      return 700;

    }

  },


  ultra: {

    name: "Ultra",

    target: null,

    timed: true,

    duration: 120,

    gravity(level) {

      return Math.max(
        45,
        800 -
        (
          level - 1
        ) *
        65
      );

    }

  },


  zen: {

    name: "Zen",

    target: null,

    timed: false,

    gravity() {

      return 1100;

    }

  }

};


export function getMode(
  id
) {

  return (
    MODES[id] ||
    MODES.marathon
  );

}


export function getLevel(
  lines,
  mode
) {

  if (
    mode === "zen"
  ) {

    return 1;

  }


  return (
    Math.floor(
      lines / 10
    ) + 1
  );

}


export function scoringLines(
  lines,
  level
) {

  const base = {

    1: 100,

    2: 300,

    3: 500,

    4: 800

  };


  return (
    base[lines] ||
    0
  ) *
  level;

}
