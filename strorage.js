"use strict";

import { CONFIG } from "./config.js";


const DEFAULTS = {

  settings: {

    sound: true,

    music: true,

    ghost: true,

    haptic: true,

    motion: true,

    theme: "system"

  },

  stats: {

    games: 0,

    bestScore: 0,

    bestLines: 0,

    bestSprint: null

  },

  records: []

};


function cloneDefaults() {

  return JSON.parse(
    JSON.stringify(DEFAULTS)
  );

}


export function loadData() {

  try {

    const raw =
      localStorage.getItem(
        CONFIG.STORAGE_KEY
      );

    if (!raw) {

      return cloneDefaults();

    }

    const data =
      JSON.parse(raw);

    return {

      ...cloneDefaults(),

      ...data,

      settings: {

        ...DEFAULTS.settings,

        ...(data.settings || {})

      },

      stats: {

        ...DEFAULTS.stats,

        ...(data.stats || {})

      },

      records:
        Array.isArray(data.records)
          ? data.records
          : []

    };

  } catch {

    return cloneDefaults();

  }

}


export function saveData(
  data
) {

  localStorage.setItem(
    CONFIG.STORAGE_KEY,
    JSON.stringify(data)
  );

}


export function saveSettings(
  data,
  settings
) {

  data.settings = {
    ...data.settings,
    ...settings
  };

  saveData(data);

}


export function recordGame(
  data,
  result
) {

  data.stats.games += 1;

  data.stats.bestScore =
    Math.max(
      data.stats.bestScore,
      result.score
    );

  data.stats.bestLines =
    Math.max(
      data.stats.bestLines,
      result.lines
    );


  if (
    result.mode === "sprint" &&
    result.completed
  ) {

    if (
      data.stats.bestSprint === null ||
      result.time <
      data.stats.bestSprint
    ) {

      data.stats.bestSprint =
        result.time;

    }

  }


  data.records.unshift({

    mode:
      result.mode,

    score:
      result.score,

    lines:
      result.lines,

    level:
      result.level,

    time:
      result.time,

    date:
      Date.now()

  });


  data.records =
    data.records.slice(
      0,
      20
    );


  saveData(data);

}


export function clearRecords(
  data
) {

  data.records = [];

  saveData(data);

}


export function formatTime(
  seconds
) {

  if (
    seconds === null ||
    seconds === undefined ||
    !Number.isFinite(seconds)
  ) {

    return "—";

  }

  const s =
    Math.max(
      0,
      Math.floor(seconds)
    );

  const min =
    Math.floor(
      s / 60
    );

  const sec =
    String(
      s % 60
    ).padStart(
      2,
      "0"
    );

  return `${min}:${sec}`;

}
