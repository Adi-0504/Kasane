"use strict";

export const TYPES = [
  "I",
  "J",
  "L",
  "O",
  "S",
  "T",
  "Z"
];


const SHAPES = {

  I: [
    [
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0]
    ],
    [
      [0,0,1,0],
      [0,0,1,0],
      [0,0,1,0],
      [0,0,1,0]
    ],
    [
      [0,0,0,0],
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0]
    ],
    [
      [0,1,0,0],
      [0,1,0,0],
      [0,1,0,0],
      [0,1,0,0]
    ]
  ],

  J: [
    [
      [1,0,0],
      [1,1,1],
      [0,0,0]
    ],
    [
      [0,1,1],
      [0,1,0],
      [0,1,0]
    ],
    [
      [0,0,0],
      [1,1,1],
      [0,0,1]
    ],
    [
      [0,1,0],
      [0,1,0],
      [1,1,0]
    ]
  ],

  L: [
    [
      [0,0,1],
      [1,1,1],
      [0,0,0]
    ],
    [
      [0,1,0],
      [0,1,0],
      [0,1,1]
    ],
    [
      [0,0,0],
      [1,1,1],
      [1,0,0]
    ],
    [
      [1,1,0],
      [0,1,0],
      [0,1,0]
    ]
  ],

  O: [
    [
      [0,1,1,0],
      [0,1,1,0],
      [0,0,0,0],
      [0,0,0,0]
    ],
    [
      [0,1,1,0],
      [0,1,1,0],
      [0,0,0,0],
      [0,0,0,0]
    ],
    [
      [0,1,1,0],
      [0,1,1,0],
      [0,0,0,0],
      [0,0,0,0]
    ],
    [
      [0,1,1,0],
      [0,1,1,0],
      [0,0,0,0],
      [0,0,0,0]
    ]
  ],

  S: [
    [
      [0,1,1],
      [1,1,0],
      [0,0,0]
    ],
    [
      [0,1,0],
      [0,1,1],
      [0,0,1]
    ],
    [
      [0,0,0],
      [0,1,1],
      [1,1,0]
    ],
    [
      [1,0,0],
      [1,1,0],
      [0,1,0]
    ]
  ],

  Z: [
    [
      [1,1,0],
      [0,1,1],
      [0,0,0]
    ],
    [
      [0,0,1],
      [0,1,1],
      [0,1,0]
    ],
    [
      [0,0,0],
      [1,1,0],
      [0,1,1]
    ],
    [
      [0,1,0],
      [1,1,0],
      [1,0,0]
    ]
  ],

  T: [
    [
      [0,1,0],
      [1,1,1],
      [0,0,0]
    ],
    [
      [0,1,0],
      [0,1,1],
      [0,1,0]
    ],
    [
      [0,0,0],
      [1,1,1],
      [0,1,0]
    ],
    [
      [0,1,0],
      [1,1,0],
      [0,1,0]
    ]
  ]

};


const KICKS_NORMAL = {

  "0>1": [
    [0,0],
    [-1,0],
    [-1,1],
    [0,-2],
    [-1,-2]
  ],

  "1>0": [
    [0,0],
    [1,0],
    [1,-1],
    [0,2],
    [1,2]
  ],

  "1>2": [
    [0,0],
    [1,0],
    [1,-1],
    [0,2],
    [1,2]
  ],

  "2>1": [
    [0,0],
    [-1,0],
    [-1,1],
    [0,-2],
    [-1,-2]
  ],

  "2>3": [
    [0,0],
    [1,0],
    [1,1],
    [0,-2],
    [1,-2]
  ],

  "3>2": [
    [0,0],
    [-1,0],
    [-1,-1],
    [0,2],
    [-1,2]
  ],

  "3>0": [
    [0,0],
    [-1,0],
    [-1,-1],
    [0,2],
    [-1,2]
  ],

  "0>3": [
    [0,0],
    [1,0],
    [1,1],
    [0,-2],
    [1,-2]
  ]

};


const KICKS_I = {

  "0>1": [
    [0,0],
    [-2,0],
    [1,0],
    [-2,-1],
    [1,2]
  ],

  "1>0": [
    [0,0],
    [2,0],
    [-1,0],
    [2,1],
    [-1,-2]
  ],

  "1>2": [
    [0,0],
    [-1,0],
    [2,0],
    [-1,2],
    [2,-1]
  ],

  "2>1": [
    [0,0],
    [1,0],
    [-2,0],
    [1,-2],
    [-2,1]
  ],

  "2>3": [
    [0,0],
    [2,0],
    [-1,0],
    [2,1],
    [-1,-2]
  ],

  "3>2": [
    [0,0],
    [-2,0],
    [1,0],
    [-2,-1],
    [1,2]
  ],

  "3>0": [
    [0,0],
    [1,0],
    [-2,0],
    [1,-2],
    [-2,1]
  ],

  "0>3": [
    [0,0],
    [-1,0],
    [2,0],
    [-1,2],
    [2,-1]
  ]

};


export function createPiece(
  type
) {

  return {

    type,

    rotation: 0,

    x:
      type === "I"
        ? 3
        : 3,

    y:
      type === "I"
        ? -1
        : -1

  };

}


export function cells(
  piece
) {

  const shape =
    SHAPES[
      piece.type
    ][
      piece.rotation
    ];

  const result = [];

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
        shape[y][x]
      ) {

        result.push({

          x:
            piece.x + x,

          y:
            piece.y + y

        });

      }

    }

  }

  return result;

}


export function clonePiece(
  piece
) {

  return {
    ...piece
  };

}


export function rotatePiece(
  piece,
  direction
) {

  const from =
    piece.rotation;

  const to =
    (
      from +
      direction +
      4
    ) % 4;


  const key =
    `${from}>${to}`;


  const kicks =
    piece.type === "I"
      ? KICKS_I[key]
      : KICKS_NORMAL[key];


  return {

    ...piece,

    rotation: to,

    kicks:
      kicks || [[0,0]]

  };

}


export function getShape(
  type,
  rotation = 0
) {

  return SHAPES[type][rotation];

}


export function shuffleBag() {

  const bag =
    TYPES.slice();

  for (
    let i = bag.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );

    [
      bag[i],
      bag[j]
    ] =
    [
      bag[j],
      bag[i]
    ];

  }

  return bag;

}


export function createRandomizer() {

  const queue = [];

  function refill() {

    queue.push(
      ...shuffleBag()
    );

  }

  function next() {

    if (
      queue.length <
      7
    ) {

      refill();

    }

    return queue.shift();

  }

  function peek(
    count
  ) {

    while (
      queue.length <
      count
    ) {

      refill();

    }

    return queue
      .slice(
        0,
        count
      );

  }

  return {

    next,

    peek,

    getQueue() {

      return queue.slice();

    }

  };

}
