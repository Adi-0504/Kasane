"use strict";

import {
  CONFIG
} from "./config.js";

import {
  cells,
  rotatePiece
} from "./pieces.js";


export function createBoard() {

  return Array.from(
    {
      length:
        CONFIG.HEIGHT +
        CONFIG.HIDDEN_ROWS
    },
    () =>
      Array(
        CONFIG.WIDTH
      ).fill(null)
  );

}


export function inside(
  x,
  y
) {

  return (
    x >= 0 &&
    x < CONFIG.WIDTH &&
    y < CONFIG.HEIGHT +
      CONFIG.HIDDEN_ROWS
  );

}


export function collides(
  board,
  piece
) {

  for (
    const cell of cells(piece)
  ) {

    if (
      cell.x < 0 ||
      cell.x >= CONFIG.WIDTH
    ) {

      return true;

    }


    if (
      cell.y >=
      CONFIG.HEIGHT +
      CONFIG.HIDDEN_ROWS
    ) {

      return true;

    }


    if (
      cell.y >= 0 &&
      board[cell.y][cell.x]
    ) {

      return true;

    }

  }

  return false;

}


export function tryMove(
  board,
  piece,
  dx,
  dy
) {

  const moved = {

    ...piece,

    x:
      piece.x + dx,

    y:
      piece.y + dy

  };


  if (
    !collides(
      board,
      moved
    )
  ) {

    return moved;

  }


  return null;

}


export function tryRotate(
  board,
  piece,
  direction
) {

  const rotated =
    rotatePiece(
      piece,
      direction
    );


  const kicks =
    rotated.kicks ||
    [[0,0]];


  for (
    const [
      dx,
      dy
    ] of kicks
  ) {

    const candidate = {

      ...rotated,

      x:
        rotated.x + dx,

      y:
        rotated.y - dy

    };


    if (
      !collides(
        board,
        candidate
      )
    ) {

      delete candidate.kicks;

      return {

        piece:
          candidate,

        kick:
          dx !== 0 ||
          dy !== 0

      };

    }

  }


  return null;

}


export function merge(
  board,
  piece
) {

  const next =
    board.map(
      row =>
        row.slice()
    );


  for (
    const cell of cells(piece)
  ) {

    if (
      cell.y < 0
    ) {

      continue;

    }


    if (
      cell.y >= next.length
    ) {

      continue;

    }


    next[cell.y][cell.x] =
      piece.type;

  }


  return next;

}


export function clearLines(
  board
) {

  const remaining =
    board.filter(
      row =>
        row.some(
          cell =>
            cell === null
        )
    );


  const cleared =
    board.length -
    remaining.length;


  while (
    remaining.length <
    board.length
  ) {

    remaining.unshift(
      Array(
        CONFIG.WIDTH
      ).fill(null)
    );

  }


  return {

    board:
      remaining,

    lines:
      cleared

  };

}


export function isPerfectClear(
  board
) {

  return board.every(
    row =>
      row.every(
        cell =>
          cell === null
      )
  );

}


export function ghostY(
  board,
  piece
) {

  let current = {
    ...piece
  };


  while (true) {

    const next =
      tryMove(
        board,
        current,
        0,
        1
      );


    if (!next) {

      return current.y;

    }


    current =
      next;

  }

}


export function topOut(
  board
) {

  return board
    .slice(
      0,
      CONFIG.HIDDEN_ROWS
    )
    .some(
      row =>
        row.some(
          Boolean
        )
    );

}


export function countFilled(
  board
) {

  return board.reduce(
    (
      total,
      row
    ) =>
      total +
      row.filter(
        Boolean
      ).length,
    0
  );

}


export function isTSpin(
  board,
  piece,
  lastActionWasRotation
) {

  if (
    piece.type !== "T" ||
    !lastActionWasRotation
  ) {

    return false;

  }


  const cx =
    piece.x + 1;

  const cy =
    piece.y + 1;

  let occupied =
    0;


  const corners = [
    [-1,-1],
    [1,-1],
    [-1,1],
    [1,1]
  ];


  for (
    const [
      dx,
      dy
    ] of corners
  ) {

    const x =
      cx + dx;

    const y =
      cy + dy;


    if (
      x < 0 ||
      x >= CONFIG.WIDTH ||
      y >= board.length ||
      (
        y >= 0 &&
        board[y][x]
      )
    ) {

      occupied++;

    }

  }


  return occupied >= 3;

}
