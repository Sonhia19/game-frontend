// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/init.js":[function(require,module,exports) {
var config = {
  type: Phaser.AUTO,
  parent: 'content',
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 500
      }
    }
  },
  scene: {
    key: 'main',
    preload: preload,
    create: create,
    update: update
  }
};
var game = new Phaser.Game(config);
var path;
var turrets;
var enemies;
var bullets;
var bullets2;
var plane;
var speed;
var cursors;
var lastFired = 0;
var reach;
var enemies;
var ENEMY_SPEED = 1 / 10000;
var BULLET_DAMAGE = 25;
var map = [[0, -1, 0, 0, 0, 0, 0, 0, 0, 0], [0, -1, 0, 0, 0, 0, 0, 0, 0, 0], [0, -1, -1, -1, -1, -1, -1, -1, 0, 0], [0, 0, 0, 0, 0, 0, 0, -1, 0, 0], [0, 0, 0, 0, 0, 0, 0, -1, 0, 0], [0, 0, 0, 0, 0, 0, 0, -1, 0, 0], [0, 0, 0, 0, 0, 0, 0, -1, 0, 0], [0, 0, 0, 0, 0, 0, 0, -1, 0, 0]];

function preload() {
  this.load.atlas('sprites', 'assets/spritesheet.png', 'assets/spritesheet.json');
  this.load.image('bullet', 'assets/Bullet3.png');
  this.load.image("plane", "./assets/avion_1.png");
  this.load.image("bulletTorret", "./assets/bullet.png");
}

var Enemy = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize: function Enemy(scene) {
    Phaser.GameObjects.Image.call(this, scene, 0, 0, 'sprites', 'enemy');
    this.follower = {
      t: 0,
      vec: new Phaser.Math.Vector2()
    };
    this.hp = 0;
  },
  startOnPath: function startOnPath() {
    this.follower.t = 0;
    this.hp = 100;
    path.getPoint(this.follower.t, this.follower.vec);
    this.setPosition(this.follower.vec.x, this.follower.vec.y);
  },
  receiveDamage: function receiveDamage(damage) {
    this.hp -= damage; // if hp drops below 0 we deactivate this enemy

    if (this.hp <= 0) {
      this.setActive(false);
      this.setVisible(false);
    }
  },
  update: function update(time, delta) {
    this.follower.t += ENEMY_SPEED * delta;
    path.getPoint(this.follower.t, this.follower.vec);
    this.setPosition(this.follower.vec.x, this.follower.vec.y);

    if (this.follower.t >= 1) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
});

function getEnemy(x, y, distance) {
  var enemyUnits = enemies.getChildren();

  for (var i = 0; i < enemyUnits.length; i++) {
    if (enemyUnits[i].active && Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) < distance) return enemyUnits[i];
  }

  return false;
}

var Turret = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize: function Turret(scene) {
    Phaser.GameObjects.Image.call(this, scene, 0, 0, 'sprites', 'turret');
    this.nextTic = 0;
  },
  place: function place(i, j) {
    this.y = i;
    this.x = j;
    this.setActive(true);
    this.setVisible(true); // map[i][j] = 1;            
  },
  fire: function fire() {
    if (plane != null) {
      var angle = Phaser.Math.Angle.Between(this.x, this.y, plane.x, plane.y);

      if (Phaser.Math.Distance.Between(this.x, this.y, plane.x, plane.y) < 200) {
        addBulletTorret(this.x, this.y, angle);
      }

      this.angle = (angle + Math.PI / 2) * Phaser.Math.RAD_TO_DEG;
    } // var enemy = getEnemy(this.x, this.y, 200);
    // if(enemy) {
    //     var angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
    //     addBullet(this.x, this.y, angle);
    //     this.angle = (angle + Math.PI/2) * Phaser.Math.RAD_TO_DEG;
    // }

  },
  update: function update(time, delta) {
    if (time > this.nextTic) {
      this.fire();
      this.nextTic = time + 1500;
    }
  }
});
var Bullet = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize: function Bullet(scene) {
    Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
    this.speed = Phaser.Math.GetSpeed(400, 1);
  },
  fire: function fire(x, y) {
    this.setPosition(x, y - 20);
    this.setActive(true);
    this.setVisible(true);
  },
  update: function update(time, delta) {
    this.y -= this.speed * delta;

    if (this.y < reach) {
      this.destroy(); //this.setVisible(false);
    } // this.lifespan -= delta;
    // this.x += this.dx * (this.speed * delta);
    // this.y += this.dy * (this.speed * delta);
    // if (this.lifespan <= 0)
    // {
    //     this.setActive(false);
    //     this.setVisible(false);
    // }

  }
});
var BulletTorret = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize: function Bullet(scene) {
    Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bulletTorret');
    this.incX = 0;
    this.incY = 0;
    this.lifespan = 0;
    this.speed = Phaser.Math.GetSpeed(600, 1);
  },
  fireTorret: function fireTorret(x, y, angle) {
    this.setActive(true);
    this.setVisible(true); //  Bullets fire from the middle of the screen to the given x/y

    this.setPosition(x, y); //  we don't need to rotate the bullets as they are round
    //    this.setRotation(angle);

    this.dx = Math.cos(angle);
    this.dy = Math.sin(angle);
    this.lifespan = 1000;
  },
  update: function update(time, delta) {
    this.lifespan -= delta;
    this.x += this.dx * (this.speed * delta);
    this.y += this.dy * (this.speed * delta);

    if (this.lifespan <= 0) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
});

function create() {
  var graphics = this.add.graphics();
  path = this.add.path(0, 450);
  path.lineTo(800, 450);
  graphics.lineStyle(3, 0xffffff, 1); // visualize the path

  path.draw(graphics);
  var graphics = this.add.graphics(); // the path for our enemies
  // parameters are the start x and y of our path

  path = this.add.path(0, 150);
  path.lineTo(800, 150);
  graphics.lineStyle(3, 0xffffff, 1); // visualize the path

  path.draw(graphics);
  enemies = this.physics.add.group({
    classType: Enemy,
    runChildUpdate: true
  });
  turrets = this.add.group({
    classType: Turret,
    runChildUpdate: true
  });
  bullets = this.physics.add.group({
    classType: Bullet,
    runChildUpdate: true
  });
  bullets2 = this.add.group({
    classType: BulletTorret,
    runChildUpdate: true
  });
  plane = new Plane({
    scene: this,
    x: game.config.width / 2,
    y: game.config.height / 2
  });
  var largo = 50;
  var ancho = largo * plane.height / plane.width;
  plane.displayWidth = largo;
  plane.displayHeight = ancho;
  this.nextEnemy = 0;
  this.physics.add.overlap(enemies, bullets, damageEnemy);
  cursors = this.input.keyboard.createCursorKeys();
  placeTurret(100, 100);
  placeTurret(100, 300);
  placeTurret(100, 500);
  speed = Phaser.Math.GetSpeed(100, 1);
}

function damageEnemy(enemy, bullet) {
  // only if both enemy and bullet are alive
  if (enemy.active === true && bullet.active === true) {
    // we remove the bullet right away
    bullet.destroy(); // decrease the enemy hp with BULLET_DAMAGE

    enemy.receiveDamage(BULLET_DAMAGE);
  }
}

function drawLines(graphics) {
  graphics.lineStyle(1, 0x0000ff, 0.8);

  for (var i = 0; i < 8; i++) {
    graphics.moveTo(0, i * 64);
    graphics.lineTo(640, i * 64);
  }

  for (var j = 0; j < 10; j++) {
    graphics.moveTo(j * 64, 0);
    graphics.lineTo(j * 64, 512);
  }

  graphics.strokePath();
}

function update(time, delta) {
  if (cursors.left.isDown) {
    plane.x -= speed * delta;
  } else if (cursors.right.isDown) {
    plane.x += speed * delta;
  }

  if (cursors.up.isDown) {
    plane.y -= speed * delta;
  } else if (cursors.down.isDown) {
    plane.y += speed * delta;
  }

  if (cursors.space.isDown && time > lastFired) {
    var bullet = bullets.get();

    if (bullet) {
      var size = plane.height;
      var position = plane.y;
      reach = position - size / 5;
      console.log(reach);
      bullet.fire(plane.x, plane.y);
      lastFired = time + 150;
    }
  }

  if (time > this.nextEnemy) {
    var enemy = enemies.get();

    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.startOnPath();
      this.nextEnemy = time + 2000;
    }
  }
}

function canPlaceTurret(i, j) {
  //return map[i][j] === 0;
  return true;
}

function placeTurret(i, j) {
  if (canPlaceTurret(i, j)) {
    var turret = turrets.get();

    if (turret) {
      turret.place(i, j);
    }
  }
}

function addBullet(x, y) {
  var bullet = bullets.get();

  if (bullet) {
    bullet.fire(x, y);
  }
}

function addBulletTorret(x, y, angle) {
  var bullet = bullets2.get();

  if (bullet) {
    bullet.fireTorret(x, y, angle);
  }
}
},{}],"../../../../../../Program Files/nodejs/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "50869" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../../Program Files/nodejs/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/init.js"], null)
//# sourceMappingURL=/init.8f656928.js.map