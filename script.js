// Basic run-down of the game and it's functions
var mapSize = [12, 8];

var unit = Math.floor(window.innerHeight / mapSize[1] / 8) * 8;
if (window.innerWidth / mapSize[0] < window.innerHeight / mapSize[1])
  unit = Math.floor(window.innerWidth / mapSize[0] / 8) * 8;
document.body.style.setProperty("--unit", unit + "px");
document.body.style.setProperty("--mapX", unit * mapSize[0] + "px");
document.body.style.setProperty("--mapY", unit * mapSize[1] + "px");
var C = document.getElementById("Canvas");
var ctx = C.getContext("2d");
C.width = Math.floor(unit * mapSize[0]);
C.height = Math.floor(unit * mapSize[1]);
var F = document.getElementById("FrontCanvas");
var fctx = F.getContext("2d");
F.width = Math.floor(unit * mapSize[0]);
F.height = Math.floor(unit * mapSize[1]);
var A = document.getElementById("AntCanvas");
var actx = A.getContext("2d");
A.width = Math.floor(unit * mapSize[0]);
A.height = Math.floor(unit * mapSize[1]);

var backI = new Image();
backI.src = "assets/back.png";
var exit1 = new Image();
exit1.src = "assets/exit1.png";
var exit2 = new Image();
exit2.src = "assets/exit2.png";
var anti1 = new Image();
anti1.src = "assets/ants1.png";
var anti2 = new Image();
anti2.src = "assets/ants2.png";
var anti3 = new Image();
anti3.src = "assets/ants3.png";
var anti4 = new Image();
anti4.src = "assets/ants4.png";
var metal = new Image();
metal.src = "assets/metal.png";

var raf;
var animationSpeed = 10;
var frame = 0;
var paused = false;

// block = 1; gate = 2; antBlock = 3; two antBlocks = 4;
var currentMap = [];

function clear(context) {
  var size = [context.canvas.width, context.canvas.height];
  context.clearRect(0, 0, size[0], size[1]);
}

function Ant(id) {
  this.direction = 0; // right = 0, left = 1;
  this.height = 1; // normal = 1, above = 0;
  this.coor = [0, 0];
  this.action = 2;
  this.id = id;
  this.alive = false;
  this.block = false;
  this.carrying = false; // true if ant on top.
  this.falling = false;
  this.physics = [0, 0]; // [velocity, offset (from position including height.)];
  this.climbing = 0; // up = 0, down = 1;
}
Ant.prototype.enter = function () {
  this.coor = [0, levels.locations.entrance[1] + 1];
  this.direction = 0;
  this.height = 1;
  this.action = 0;
  this.alive = true;
};
Ant.prototype.draw = function (type) {
  if (!this.alive) return;
  var info = [];
  // image, cropx, cropy, croph, placex, placey, placeh
  switch (type) {
    case 0:
      info = [
        anti1,
        0,
        144 * (Czar.frame % 4),
        144,
        ((Czar.frame % 8) * unit) / 8 + this.coor[0] * unit - unit,
        this.coor[1] * unit + (this.height * unit) / 2,
        unit / 2,
      ];
      break;
    case 1:
      info = [
        anti1,
        288,
        144 * (Czar.frame % 4),
        144,
        ((Czar.frame % 8) * -unit) / 8 + this.coor[0] * unit + unit,
        this.coor[1] * unit + (this.height * unit) / 2,
        unit / 2,
      ];
      break;
    case 2:
      info = [
        anti1,
        576 + this.direction * 288,
        144 * Math.floor((Czar.frame % 8) / 2),
        144,
        this.coor[0] * unit,
        this.coor[1] * unit + (this.height * unit) / 2,
        unit / 2,
      ];
      break;
    case 3:
      if (Czar.frame % 8 === 2) {
        currentMap[this.coor[1] * mapSize[0] + this.coor[0]] =
          3 + (this.height * -1 + 1);
      }
      info = [
        anti1,
        0 + this.direction * 288,
        576 + 144 * Math.floor((Czar.frame % 8) / 2),
        144,
        this.coor[0] * unit,
        this.coor[1] * unit + (this.height * unit) / 2,
        unit / 2,
      ];
      break;
    case 4:
      info = [
        anti1,
        576 + this.direction * 288,
        576 + 144 * Math.floor((Czar.frame % 8) / 6),
        144,
        this.coor[0] * unit,
        this.coor[1] * unit + (this.height * unit) / 2,
        unit / 2,
      ];
      if (this.carrying) info[2] += 288;
      break;
    case 5:
      if (Czar.frame % 8 === 2) this.block = false;
      info = [
        anti1,
        0 + this.direction * 288,
        1008 - 144 * Math.floor((Czar.frame % 8) / 2),
        144,
        this.coor[0] * unit,
        this.coor[1] * unit + (this.height * unit) / 2,
        unit / 2,
      ];
      break;
    case 6:
      info = [
        anti2,
        this.climbing * 576 + 288 * Math.floor((Czar.frame % 8) / 4),
        288 * (Czar.frame % 4),
        288,
        this.coor[0] * unit - unit,
        this.coor[1] * unit +
          (this.height * unit) / 2 -
          (this.climbing * unit) / 2,
        unit,
      ];
      if (!this.climbing) {
        var n = Czar.frame % 8;
        // 0, 1, 3, 5, 8, 11, 14, 16
        if (!n) break;
        if (n < 4) info[4] += (unit * (n * 2 - 1)) / 16;
        else if (n < 7) info[4] += (unit * (n * 3 - 4)) / 16;
        else info[4] += unit;
      } else {
        var n = Czar.frame % 8;
        // 2, 4, 6, 8, 9, 11, 14, 16
        if (n < 4 || n > 6) info[4] += (unit * (n * 2)) / 16;
        else info[4] += (unit * (n * 2 - 1)) / 16;
      }
      break;
    case 7:
      info = [
        anti3,
        this.climbing * 576 + 288 * Math.floor((Czar.frame % 8) / 4),
        288 * (Czar.frame % 4),
        288,
        this.coor[0] * unit + unit,
        this.coor[1] * unit +
          (this.height * unit) / 2 -
          (this.climbing * unit) / 2,
        unit,
      ];
      if (!this.climbing) {
        var n = Czar.frame % 8;
        // 0, 1, 3, 5, 8, 11, 14, 16
        if (!n) break;
        if (n < 4) info[4] -= (unit * (n * 2 - 1)) / 16;
        else if (n < 7) info[4] -= (unit * (n * 3 - 4)) / 16;
        else info[4] -= unit;
      } else {
        var n = Czar.frame % 8;
        // 2, 4, 6, 8, 9, 11, 14, 16
        if (n < 4 || n > 6) info[4] -= (unit * (n * 2)) / 16;
        else info[4] -= (unit * (n * 2 - 1)) / 16;
      }
      break;
    case 8:
      // cropx, cropy, croph, offsetx, offsety
      var fallInfo = this.fallPhysics(Czar.frame % 8);
      info = [
        anti4,
        fallInfo[0],
        fallInfo[1],
        fallInfo[2],
        this.coor[0] * unit -
          unit * fallInfo[3] +
          unit * fallInfo[3] * this.direction * 2,
        this.coor[1] * unit +
          (fallInfo[4] / 16) * unit +
          (this.height * unit) / 2,
        unit,
      ];
      if (fallInfo[3]) {
        // adjust info[4] accordingly
        var n = (Czar.frame % 8) + 1;
        if (!this.direction) info[4] += ((n * 3) / 16) * unit;
        else info[4] -= ((n * 3) / 16) * unit;
      }
      break;
  }
  actx.drawImage(
    info[0],
    info[1],
    info[2],
    288,
    info[3],
    info[4],
    info[5],
    unit,
    info[6],
  );
};
Ant.prototype.look = function () {
  var info = [];
  // 9 numbers long, middle is this ant.
  for (var y = this.coor[1] - 1; y <= this.coor[1] + 1; y++) {
    for (var x = this.coor[0] - 1; x <= this.coor[0] + 1; x++) {
      if (x < 0 || x >= mapSize[0] || y < 0 || y >= mapSize[1]) info.push(-1);
      else info.push(currentMap[y * mapSize[0] + x]);
    }
  }
  return info;
};
Ant.prototype.checkAbove = function () {
  // returns true if an ant is above, false otherwise;
  var coor = [this.coor[0], this.coor[1]];
  var aboveh = this.height * -1 + 1;
  if (aboveh) coor[1]--;
  if (Czar.findAnt(coor, this.id, aboveh).length > 0) return true;
  return false;
};
Ant.prototype.fallPhysics = function (frame) {
  if (!this.falling || !this.alive) return;

  // change everything based on this.direction

  var info = this.look();
  if (!this.physics[0]) {
    if (frame === 4) {
      this.physics[0] = 2;
      this.physics[1] = 4;
    }
    return [
      Math.floor(frame / 4) * 288 + this.direction * 576,
      (frame % 4) * 288,
      288,
      1,
      this.physics[1],
    ];
  } else {
    // already falling
    this.physics[1] += this.physics[0];
    if (this.physics[0] < 8) this.physics[0] += 2;
    if (this.physics[1] > 7) {
      this.physics[1] -= 8;
      if (this.height) this.coor[1]++;
      this.height = this.height * -1 + 1;
    }
    if (
      (!this.height && info[7] === 3) ||
      (this.height && (info[7] === 1 || info[7] === 4))
    ) {
      // ant is about to land on solid ground!
      this.falling = false;
      this.physics = [0, 0];
      this.action = 2;
      return [288 + this.direction * 576, 864, 288, 0, 0];
    } else if (info[4] === -1) this.end();
    return [
      288 + this.direction * 576,
      Math.floor(frame / 3 + 1) * 288,
      288,
      0,
      this.physics[1],
    ];
  }
};
Ant.prototype.act = function (type, dir) {
  if (!(Czar.frame % 8) || !this.alive) return;
  var info = this.look();
  switch (type) {
    case 0: // walk right
      if (this.block || this.falling) return 0;
      if (
        (this.height && info[5] === 0 && (info[8] === 1 || info[8] === 4)) ||
        (!this.height && info[5] === 3)
      ) {
        this.coor[0]++;
      } else return 0;
      this.action = type;
      this.direction = type;
      return 1;
      break;
    case 1: // walk left
      if (this.block || this.falling) return 0;
      if (
        (this.height && info[3] === 0 && (info[6] === 1 || info[6] === 4)) ||
        (!this.height && info[3] === 3)
      ) {
        this.coor[0]--;
      } else return 0;
      this.action = type;
      this.direction = type;
      return 1;
      break;
    case 2: // rest
      if (this.block || this.falling) return 0;
      this.action = type;
      this.direction = dir !== undefined ? dir : this.direction;
      return 1;
      break;
    case 3: // become AntBlock
      if (this.block || this.falling) return 0;
      if (
        (info[7] === 1 || info[7] === 4) &&
        (info[4] !== 3 || (!this.height && info[4] === 3))
      ) {
        this.action = type;
        this.block = true;
        return 1;
      } else return 0;
      break;
    case 4: // stay AntBlock
      if (!this.block || this.falling) return 0;
      this.action = type;
      this.carrying = this.checkAbove();
      return 1;
      break;
    case 5: // escape AntBlock
      if (!this.block || this.falling || this.action !== 4) return 0;
      this.carrying = this.checkAbove();
      if (this.carrying) return 0;
      this.action = type;
      this.action = type;
      this.block = false;
      currentMap[this.coor[1] * mapSize[0] + this.coor[0]] =
        0 + (this.height * -1 + 1) * 3;
      return 1;
      break;
    case 6: // climb right
      if (this.block || this.falling) return 0;
      if (this.height) {
        // normal level
        if (info[5] === 3) {
          // climb onto ant
          this.climbing = 0;
        } else if (info[8] === 3 && info[5] === 0) {
          // climb down onto ant
          this.climbing = 1;
          this.coor[1]++;
        } else return 0;
      } else {
        if (
          (info[5] === 1 || info[5] === 4) &&
          info[1] === 0 &&
          info[2] === 0
        ) {
          // climb up onto block
          this.climbing = 0;
          this.coor[1]--;
        } else if ((info[8] === 1 || info[8] === 4) && info[5] === 0) {
          // climb down onto block
          this.climbing = 1;
        } else return 0;
      }
      this.direction = 0;
      this.coor[0]++;
      this.height = this.height * -1 + 1;
      this.action = type;
      return 1;
      break;
    case 7: // climb left
      if (this.block || this.falling) return 0;
      if (this.height) {
        // normal level
        if (info[3] === 3) {
          // climb onto ant
          this.climbing = 0;
        } else if (info[6] === 3 && info[3] === 0) {
          // climb down onto ant
          this.climbing = 1;
          this.coor[1]++;
        } else return 0;
      } else {
        if (
          (info[3] === 1 || info[3] === 4) &&
          info[1] === 0 &&
          info[0] === 0
        ) {
          // climb up onto block
          this.climbing = 0;
          this.coor[1]--;
        } else if ((info[6] === 1 || info[6] === 4) && info[3] === 0) {
          // climb down onto block
          this.climbing = 1;
        } else return 0;
      }
      this.direction = 1;
      this.coor[0]--;
      this.height = this.height * -1 + 1;
      this.action = type;
      return 1;
      break;
    case 8: // drop down
      if (this.block) return 0;
      if (!this.direction) {
        // right
        if (
          (this.height && info[8] === 0 && info[5] === 0) ||
          (!this.height && info[5] === 0 && (info[8] === 0 || info[8] === 3))
        )
          this.coor[0]++;
        else return 0;
      } else {
        // left
        if (
          (this.height && info[6] === 0 && info[3] === 0) ||
          (!this.height && info[3] === 0 && (info[6] === 0 || info[6] === 3))
        )
          this.coor[0]--;
        else return 0;
      }
      this.action = type;
      this.falling = true;
      return 1;
      break;
  }
};
Ant.prototype.end = function () {
  console.log("dead ant lool");
  this.alive = false;
};

var Czar = {
  ants: [],
  frame: 0,
  entering: true,
  running: false,
  commands: [
    [
      0, 0, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
      4, 4, 4, 4, 5, 1, 0, 2, 1, 0, 0, 1, 1,
    ],
    [
      -1, 0, 2, 2, 6, 6, 0, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
      4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    ],
    [
      -1, -1, 0, 2, 2, 2, 2, 6, 6, 6, 6, 0, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
      4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
      4, 4, 4, 4,
    ],
    [
      -1, -1, -1, 0, 2, 2, 2, 2, 2, 6, 6, 6, 2, 6, 6, 2, 7, 2, 2, 6, 6, 0, 2, 2,
      1, 0, 1, 0, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 8, 8, 3, 4, 4, 4, 4, 4, 5,
    ],
    [
      -1, -1, -1, -1, 0, 2, 6, 6, 6, 2, 2, 2, 0, 1, 1, 0, 0, 7, 7, 2, 6, 6, 6,
      6, 6, 2, 0, 2, 2, 0, 2, 2, 2, 2, 1, 2, 0, 2, 2, 2, 8, 8, 8, 2, 2, 6, 2, 0,
    ],
    [
      -1, -1, -1, -1, -1, 0, 2, 2, 2, 2, 2, 2, 2, 6, 6, 2, 2, 2, 2, 1, 3, 4, 4,
      4, 4, 4, 4, 4, 4, 4,
    ],
    [
      -1, -1, -1, -1, -1, -1, 0, 2, 2, 2, 2, 2, 2, 2, 6, 6, 2, 7, 3, 4, 4, 4, 4,
      4, 4, 4, 4, 4,
    ],
    [
      -1, -1, -1, -1, -1, -1, -1, 0, 2, 2, 2, 6, 6, 6, 6, 2, 2, 2, 6, 7, 2, 7,
      7, 7, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    ],
  ],
  init: function () {
    this.running = true;
    this.entering = true;
    for (var i = 0; i < levels.levels[levels.current][1]; i++) {
      this.ants.push(new Ant(i));
      if (!i) this.ants[i].enter();
    }
  },
  end: function () {
    this.ants.forEach(function (ant) {
      ant.end();
    });
    this.ants = [];
    this.running = false;
    this.entering = true;
    this.frame = 0;
  },
  newFrame: function () {
    clear(actx);
    this.frame++;
    this.ants.map((ant) => {
      ant.draw(ant.action);
    });
    if (!((this.frame + 1) % 8)) this.delegate();
  },
  delegate: function () {
    if (this.entering && Math.floor(this.frame / 8) >= this.ants.length)
      this.entering = false;
    for (var i = 0; i < levels.levels[levels.current][1]; i++) {
      var success = 0;
      if (!this.ants[i].alive) {
        if (Math.floor(this.frame / 8) + 1 === i) this.ants[i].enter();
        success = 1;
      }
      if (!success && !this.ants[i].falling) {
        if (Math.floor(this.frame / 8 < this.commands[i].length)) {
          this.ants[i].act(this.commands[i][Math.floor(this.frame / 8)]);
          success = 1;
        }
      }
      while (!success && !this.ants[i].falling) {
        var rand = Math.floor(Math.random() * 9);
        if (rand === 2 && Math.random() > 0.5)
          var dir = Math.floor(Math.random() * 2);
        success = this.ants[i].act(rand, dir);
      }
    }
  },
  findAnt: function (coor, exclude, height) {
    // returns list of ants (actual, not by id)
    var toReturn = [];
    this.ants.forEach(function (ant) {
      if (
        ant.id !== exclude &&
        ant.coor[0] === coor[0] &&
        ant.coor[1] === coor[1] &&
        ant.height === height &&
        ant.alive
      )
        toReturn.push(ant);
    });
    return toReturn;
  },
};

var levels = {
  current: 0,
  levels: [],
  locations: {},
  running: false, // if running level rn
  closed: false, // if entrance is closed
  startLevel: function (index) {
    if (index >= this.levels.length) return 0;
    this.current = index;
    this.running = true;
    this.closed = false;
    //ctx.drawImage(backI, 0, 0, unit * mapSize[0], unit * mapSize[1]);
    var blocks = this.levels[index][0];
    for (var n = 0; n < blocks.length; n++) {
      switch (blocks[n]) {
        case 1:
          var adj = ["r", "l", "u", "d"];
          adj[0] = (n + 1) % mapSize[0] && blocks[n + 1] !== 1 ? 0 : 1;
          adj[1] = n % mapSize[0] && blocks[n - 1] !== 1 ? 0 : 1;
          adj[2] = n >= mapSize[0] && blocks[n - mapSize[0]] !== 1 ? 0 : 1;
          adj[3] =
            n < mapSize[0] * (mapSize[1] - 1) && blocks[n + mapSize[0]] !== 1
              ? 0
              : 1;
          ctx.drawImage(
            metal,
            (adj[0] + 2 * adj[1]) * 288,
            (adj[3] + 2 * adj[2]) * 288,
            288,
            288,
            (n % mapSize[0]) * unit,
            Math.floor(n / mapSize[0]) * unit,
            unit,
            unit,
          );

          var cor = [];
          if (
            adj[1] &&
            adj[2] &&
            n >= mapSize[0] &&
            n % mapSize[0] &&
            blocks[n - mapSize[0] - 1] !== 1
          )
            cor.push([0, 0]); //tl
          if (
            adj[0] &&
            adj[2] &&
            n >= mapSize[0] &&
            (n + 1) % mapSize[0] &&
            blocks[n - mapSize[0] + 1] !== 1
          )
            cor.push([1, (unit * 7) / 8]); //tr
          if (
            adj[0] &&
            adj[3] &&
            n < mapSize[0] * (mapSize[1] - 1) &&
            (n + 1) % mapSize[0] &&
            blocks[n + mapSize[0] + 1] !== 1
          )
            cor.push([3, (unit * 7) / 8]); //br
          if (
            adj[1] &&
            adj[3] &&
            n < mapSize[0] * (mapSize[1] - 1) &&
            n % mapSize[0] &&
            blocks[n + mapSize[0] - 1] !== 1
          )
            cor.push([2, 0]); //bl
          for (var i = 0; i < cor.length; i++) {
            ctx.drawImage(
              metal,
              1152,
              cor[i][0] * 288,
              36,
              288,
              (n % mapSize[0]) * unit + cor[i][1],
              Math.floor(n / mapSize[0]) * unit,
              unit / 8,
              unit,
            );
          }
          break;
        case 2:
          if (!(n % mapSize[0]))
            this.locations.entrance = [0, Math.floor(n / mapSize[0])];
          else
            this.locations.exit = [mapSize[0] - 1, Math.floor(n / mapSize[0])];
          break;
      }
    }
    //Czar.init();
    currentMap = blocks.map((v) => {
      return v;
    });
    animate();
    return 1;
  },
  endLevel: function () {
    this.running = false;
    frame = 0;
    window.cancelAnimationFrame(raf);
    clear(ctx);
    clear(fctx);
    Czar.end();
    clear(actx);
    var currLevel = this.current;
    this.current = -1;
    return currLevel;
  },
  newFrame: function (type) {
    var loc = this.locations[type];
    var frm = Math.floor(frame / animationSpeed);
    switch (type) {
      case "entrance":
        if (Czar.entering) {
          fctx.clearRect(loc[0] * unit, loc[1] * unit, unit, unit * 2);
          fctx.drawImage(
            exit1,
            (frm % 4) * 288,
            0,
            288,
            576,
            loc[0] * unit,
            loc[1] * unit,
            unit,
            unit * 2,
          );
          break;
        } else if (!this.closed) {
          var Cfrm = (Czar.frame % 8) + 1;
          if (Cfrm === 8) Cfrm = 0;
          if (Cfrm === 4) {
            this.closed = true;
            break;
          } else if (Cfrm < 4) {
            fctx.clearRect(loc[0] * unit, loc[1] * unit, unit, unit * 2);
            fctx.drawImage(
              exit2,
              288 * Cfrm,
              0,
              288,
              576,
              loc[0] * unit,
              loc[1] * unit,
              unit,
              unit * 2,
            );
          }
        }
        break;
      case "exit":
        fctx.clearRect(loc[0] * unit, loc[1] * unit, unit, unit * 2);
        fctx.drawImage(
          exit1,
          (frm % 4) * 288,
          576,
          288,
          576,
          loc[0] * unit,
          loc[1] * unit,
          unit,
          unit * 2,
        );
        break;
    }
  },
};

// [[level], #ofAnts]
levels.levels.push([
  [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0,
    0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 2, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 2, 0, 0, 0,
    1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1,
  ],
  8,
]);
// levels.levels.push([
//   [
//     2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//     0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0,
//     0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1,
//     1, 1, 1, 1, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1,
//     1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
//   ],
//   5,
// ]);

function animate() {
  if (!paused && !(frame % animationSpeed)) {
    if (frame === animationSpeed * 8) Czar.init();
    if (Czar.running && frame > 0) Czar.newFrame();
    //if (frame % (animationSpeed * 2) === animationSpeed) every second one.
    if (levels.running)
      Object.keys(levels.locations).forEach(function (key) {
        levels.newFrame(key);
      });
  }
  frame++;
  raf = window.requestAnimationFrame(animate);
}

metal.onload = function () {
  levels.startLevel(0);
};
