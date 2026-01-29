// Create object contructors for "elements" in Canvas, and run them.

var O = document.getElementById("Opacity");
var octx = O.getContext("2d");
var I = document.getElementById("InGame");
var ictx = I.getContext("2d");
var P = document.getElementById("Pause");
var pctx = P.getContext("2d");
var M = document.getElementById("Menu");
var mctx = M.getContext("2d");
var L = document.getElementById("Levels");
var lctx = L.getContext("2d");
[O, I, P, M, L].forEach(function (canvas) {
  canvas.width = Math.floor(unit * mapSize[0]);
  canvas.height = Math.floor(unit * mapSize[1]);
});

var pmI = new Image();
pmI.src = "assets/pausediv.png";
var mmI = new Image();
mmI.src = "assets/maindiv.png";
var button1I = new Image();
button1I.src = "assets/buttons1.png";
var mouseCoor = [0, 0];

var selectedLevel = 1;

function Menu(type, img, x, y, w, h, canvas, context) {
  this.displayed = false;
  this.type = type;
  this.img = img;
  this.sizes = [x, y, w, h];
  this.children = [];
  this.canvas = canvas;
  this.ctx = context;
  this.init();
}
Menu.prototype.init = function () {
  switch (this.type) {
    // type, img, cx, cy, cw, ch, x, y, w, h, nx, ny, canvas, context
    case "pause":
      this.children.push(
        new Button(
          "closeP",
          button1I,
          288,
          0,
          144,
          144,
          13.5,
          0,
          unit / 2,
          unit / 2,
          432,
          0,
          P,
          pctx,
        ),
      );
      this.children.push(
        new Button(
          "play",
          button1I,
          0,
          0,
          144,
          144,
          12.375,
          3.75,
          unit / 2,
          unit / 2,
          144,
          0,
          P,
          pctx,
        ),
      );
      this.children.push(
        new Button(
          "restart",
          button1I,
          0,
          144,
          144,
          216,
          12.3125,
          4.375,
          unit / 2,
          unit * 0.75,
          144,
          144,
          P,
          pctx,
        ),
      );
      this.children.push(
        new Button(
          "menu",
          button1I,
          0,
          360,
          216,
          216,
          12.25,
          5.125,
          unit * 0.75,
          unit * 0.75,
          216,
          360,
          P,
          pctx,
        ),
      );
      break;
    case "main":
      this.children.push(
        new Button(
          "playM",
          button1I,
          0,
          576,
          576,
          288,
          10.5,
          6,
          unit * 2,
          unit,
          0,
          864,
          M,
          mctx,
        ),
      );
      break;
  }
};
Menu.prototype.open = function () {
  this.displayed = true;
  paused = true;
  pauseButton.close();
  var s = this.sizes;
  clear(this.ctx);
  this.ctx.drawImage(this.img, s[0] * unit, s[1] * unit, s[2], s[3]);
  this.children.forEach(function (button) {
    button.open();
  });
  if (this.type === "pause") this.animate(true);
};
Menu.prototype.animate = function (direction) {
  var m = this;
  switch (m.type) {
    case "pause":
      if (direction) {
        m.canvas.style.transitionDuration = "0s";
        m.canvas.style.marginLeft = unit * 3 + "px";
        setTimeout(function () {
          m.canvas.style.transitionDuration = "0.25s";
          m.canvas.style.marginLeft = "0px";
        }, 20);
      } else {
        m.canvas.style.transitionDuration = "0.25s";
        m.canvas.style.marginLeft = unit * 3 + "px";
      }
      break;
    case "main":
      break;
  }
};
Menu.prototype.close = function () {
  var m = this;
  switch (m.type) {
    case "pause":
      pauseButton.open();
      m.animate(false);
      setTimeout(function () {
        m.displayed = false;
        m.children.forEach(function (button) {
          button.close();
        });
        paused = false;
        clear(m.ctx);
        m.canvas.style.transitionDuration = "0s";
        m.canvas.style.marginLeft = "0px";
      }, 250);
      break;
    case "main":
      pauseButton.open();
      m.displayed = false;
      m.children.forEach(function (button) {
        button.close();
      });
      paused = false;
      clear(m.ctx);
      console.log("asdfasdf");
      break;
  }
};

function Button(
  type,
  img,
  cx,
  cy,
  cw,
  ch,
  x,
  y,
  w,
  h,
  nx,
  ny,
  canvas,
  context,
) {
  this.displayed = false;
  this.hover = false;
  this.type = type;
  this.img = img;
  this.sizes = [cx, cy, cw, ch, x, y, w, h, nx, ny];
  this.canvas = canvas;
  this.ctx = context;
}
Button.prototype.open = function () {
  this.displayed = true;
  var s = this.sizes;
  console.log(this.type);
  this.ctx.drawImage(
    this.img,
    s[0],
    s[1],
    s[2],
    s[3],
    s[4] * unit,
    s[5] * unit,
    s[6],
    s[7],
  );
  this.checkHover(mouseCoor);
};
Button.prototype.close = function () {
  if (!this.displayed) return;
  this.displayed = false;
  this.hover = false;
  var s = this.sizes;
  this.ctx.clearRect(s[4] * unit, s[5] * unit, s[6], s[7]);
};
Button.prototype.checkHover = function ([x, y]) {
  if (!this.displayed) return;
  var s = this.sizes;
  if (!this.hover) {
    if (
      x > s[4] * unit &&
      x < s[4] * unit + s[6] &&
      y > s[5] * unit &&
      y < s[5] * unit + s[7]
    ) {
      this.hover = true;
      this.ctx.clearRect(s[4] * unit, s[5] * unit, s[6], s[7]);
      this.ctx.drawImage(
        this.img,
        s[8],
        s[9],
        s[2],
        s[3],
        s[4] * unit,
        s[5] * unit,
        s[6],
        s[7],
      );
    }
  } else {
    if (
      !(
        x > s[4] * unit &&
        x < s[4] * unit + s[6] &&
        y > s[5] * unit &&
        y < s[5] * unit + s[7]
      )
    ) {
      this.hover = false;
      this.ctx.clearRect(s[4] * unit, s[5] * unit, s[6], s[7]);
      this.ctx.drawImage(
        this.img,
        s[0],
        s[1],
        s[2],
        s[3],
        s[4] * unit,
        s[5] * unit,
        s[6],
        s[7],
      );
    }
  }
};
Button.prototype.click = function () {
  if (!this.hover || !this.displayed) return;
  switch (this.type) {
    case "pause":
      if (!pauseMenu.displayed) pauseMenu.open();
      return true;
    case "closeP":
      pauseMenu.close();
      return true;
    case "playM":
      mainMenu.close();
      levels.endLevel();
      levels.startLevel(selectedLevel);
      return true;
    case "play":
      pauseMenu.close();
      return true;
    case "restart":
      pauseMenu.close();
      setTimeout(function () {
        var currLevel = levels.endLevel();
        levels.startLevel(currLevel);
      }, 251);
      return true;
    case "menu":
      pauseMenu.close();
      mainMenu.open();
      return true;
  }
  return false;
};

var pauseButton = new Button(
  "pause",
  button1I,
  288,
  144,
  144,
  144,
  13.375,
  0.125,
  unit / 2,
  unit / 2,
  432,
  144,
  I,
  ictx,
);
var pauseMenu = new Menu(
  "pause",
  pmI,
  mapSize[0] - 3,
  0,
  unit * 3,
  unit * mapSize[1],
  P,
  pctx,
);
var mainMenu = new Menu(
  "main",
  mmI,
  0,
  0,
  unit * mapSize[0],
  unit * mapSize[1],
  M,
  mctx,
);

button1I.onload = function () {
  //pauseMenu.open();
  //mainMenu.open();
  pauseButton.open();
};

document.addEventListener("mousemove", function (event) {
  mouseCoor[0] = event.clientX - window.innerWidth / 2 + unit * 7;
  mouseCoor[1] = event.clientY - window.innerHeight / 2 + unit * 4;
  pauseButton.checkHover(mouseCoor);
  pauseMenu.children.forEach(function (button) {
    button.checkHover(mouseCoor);
  });
  mainMenu.children.forEach(function (button) {
    button.checkHover(mouseCoor);
  });
});
document.addEventListener("click", function (event) {
  if (pauseButton.click()) return;
  pauseMenu.children.forEach(function (button) {
    if (button.click()) return;
  });
  mainMenu.children.forEach(function (button) {
    if (button.click()) return;
  });
});
