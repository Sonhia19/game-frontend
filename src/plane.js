class Plane extends Phaser.GameObjects.Sprite {  
    constructor(config) {
        super(config.scene, config.x, config.y, "plane");
        config.scene.add.existing(this);
    } 
}