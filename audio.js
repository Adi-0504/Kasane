"use strict";


import {
  CONFIG,
  SFX
} from "./config.js";


export class AudioSystem {

  constructor(
    data
  ) {

    this.data =
      data;

    this.ctx =
      null;

    this.master =
      null;

    this.musicGain =
      null;

    this.musicTimer =
      null;

    this.musicStep =
      0;

    this.unlocked =
      false;

    this.uiSFX =
      null;

    this.loading =
      false;

    this.last =
      new Map();

  }


  ensureContext() {

    if (
      this.ctx
    ) {

      return this.ctx;

    }


    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;


    if (
      !AudioContextClass
    ) {

      return null;

    }


    this.ctx =
      new AudioContextClass();


    this.master =
      this.ctx.createGain();


    this.master.gain.value =
      CONFIG.SFX_VOLUME;


    this.master.connect(
      this.ctx.destination
    );


    this.musicGain =
      this.ctx.createGain();


    this.musicGain.gain.value =
      CONFIG.BGM_VOLUME;


    this.musicGain.connect(
      this.ctx.destination
    );


    return this.ctx;

  }


  async unlock() {

    const ctx =
      this.ensureContext();


    if (
      !ctx
    ) {

      return;

    }


    try {

      if (
        ctx.state ===
        "suspended"
      ) {

        await ctx.resume();

      }


      const oscillator =
        ctx.createOscillator();

      const gain =
        ctx.createGain();


      gain.gain.value =
        0;


      oscillator.connect(
        gain
      );


      gain.connect(
        ctx.destination
      );


      oscillator.start();

      oscillator.stop(
        ctx.currentTime +
        0.01
      );


      this.unlocked =
        true;

      this.loadUISFX();

      if (
        this.data.settings.music
      ) {

        this.startMusic();

      }

    } catch {}

  }


  async loadUISFX() {

    if (
      this.uiSFX ||
      this.loading
    ) {

      return this.uiSFX;

    }


    this.loading =
      true;


    try {

      /*
       * Shared UISFX module from the Gomoku
       * project. If the shared module is not
       * available, Web Audio fallback is used.
       */

      const module =
        await import(
          "../js/uisfx.js"
        );


      const createUISFX =
        module.createUISFX ||
        module.default?.createUISFX;


      if (
        typeof createUISFX ===
        "function"
      ) {

        this.uiSFX =
          createUISFX({

            volume:
              CONFIG.SFX_VOLUME

          });

      }

    } catch {

      this.uiSFX =
        null;

    } finally {

      this.loading =
        false;

    }


    return this.uiSFX;

  }


  play(
    cue
  ) {

    if (
      !this.data.settings.sound
    ) {

      return;

    }


    const now =
      performance.now();

    const last =
      this.last.get(cue) ||
      0;


    if (
      now - last <
      35
    ) {

      return;

    }


    this.last.set(
      cue,
      now
    );


    this.unlock();


    if (
      this.uiSFX &&
      typeof this.uiSFX.play ===
      "function"
    ) {

      try {

        this.uiSFX.play(
          cue
        );

        return;

      } catch {}

    }


    this.nativeSFX(
      cue
    );

  }


  nativeSFX(
    cue
  ) {

    const ctx =
      this.ensureContext();


    if (
      !ctx ||
      !this.master
    ) {

      return;

    }


    const settings = {

      move:
        [210, 270, .045],

      rotate:
        [320, 430, .055],

      hold:
        [260, 190, .075],

      drop:
        [160, 90, .08],

      lock:
        [180, 120, .055],

      line:
        [430, 700, .12],

      tetris:
        [420, 920, .25],

      tspin:
        [280, 820, .24],

      combo:
        [500, 800, .12],

      level:
        [350, 700, .18],

      gameover:
        [220, 80, .35],

      pause:
        [260, 180, .08],

      resume:
        [180, 360, .08]

    };


    const [
      f1,
      f2,
      duration
    ] =
      settings[cue] ||
      settings.move;


    const oscillator =
      ctx.createOscillator();

    const gain =
      ctx.createGain();


    oscillator.type =
      cue === "drop"
        ? "triangle"
        : "sine";


    oscillator.frequency.setValueAtTime(
      f1,
      ctx.currentTime
    );


    oscillator.frequency.exponentialRampToValueAtTime(
      f2,
      ctx.currentTime +
      duration
    );


    gain.gain.setValueAtTime(
      0.0001,
      ctx.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
      .18,
      ctx.currentTime +
      .012
    );


    gain.gain.exponentialRampToValueAtTime(
      .0001,
      ctx.currentTime +
      duration
    );


    oscillator.connect(
      gain
    );


    gain.connect(
      this.master
    );


    oscillator.start();

    oscillator.stop(
      ctx.currentTime +
      duration +
      .01
    );

  }


  startMusic() {

    if (
      !this.data.settings.music
    ) {

      return;

    }


    const ctx =
      this.ensureContext();


    if (
      !ctx ||
      !this.musicGain ||
      this.musicTimer
    ) {

      return;

    }


    /*
     * Original procedural ambient loop.
     *
     * No external copyrighted recording.
     * Designed as a quiet CC0-style background
     * layer for this project.
     */

    const notes = [
      146.83,
      174.61,
      220.00,
      261.63,
      220.00,
      174.61,
      196.00,
      246.94
    ];


    const tick =
      () => {

        if (
          !this.data.settings.music
        ) {

          this.stopMusic();

          return;

        }


        const frequency =
          notes[
            this.musicStep %
            notes.length
          ];


        const oscillator =
          ctx.createOscillator();

        const gain =
          ctx.createGain();


        oscillator.type =
          "sine";


        oscillator.frequency.value =
          frequency;


        gain.gain.setValueAtTime(
          0.0001,
          ctx.currentTime
        );


        gain.gain.linearRampToValueAtTime(
          0.035,
          ctx.currentTime +
          0.35
        );


        gain.gain.linearRampToValueAtTime(
          0.0001,
          ctx.currentTime +
          2.4
        );


        oscillator.connect(
          gain
        );


        gain.connect(
          this.musicGain
        );


        oscillator.start();


        oscillator.stop(
          ctx.currentTime +
          2.5
        );


        this.musicStep++;

      };


    tick();


    this.musicTimer =
      setInterval(
        tick,
        2500
      );

  }


  stopMusic() {

    if (
      this.musicTimer
    ) {

      clearInterval(
        this.musicTimer
      );

      this.musicTimer =
        null;

    }

  }


  setMusic(
    enabled
  ) {

    this.data.settings.music =
      Boolean(enabled);


    if (
      enabled
    ) {

      this.unlock();

      this.startMusic();

    } else {

      this.stopMusic();

    }

  }


  setSound(
    enabled
  ) {

    this.data.settings.sound =
      Boolean(enabled);

  }


  haptic(
    amount = 8
  ) {

    if (
      !this.data.settings.haptic
    ) {

      return;

    }


    if (
      navigator.vibrate
    ) {

      navigator.vibrate(
        amount
      );

    }

  }

}
