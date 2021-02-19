/** @type {import("../typings/phaser")}  */

import { LoadScene } from './scenes/LoadScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { WebSocketClient } from './client/WebSocketClient.js';

var webSocket = new WebSocketClient();
var users = {};

var config = {
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 500,
        height: 500,
    },
    scene: [
        LoadScene, MenuScene, GameScene
    ]
};

var game = new Phaser.Game(config);
console.log(webSocket);
game.scene.start('LoadScene', webSocket);