export class GameScene extends Phaser.Scene {  
    constructor() {
        super('GAME');
    } 

    init(data) {
        console.log(data);
        console.log("I GOT IT");

    }

    preload() {
        
    }

    create() {
        this.add.image(0, 0, "background_load").setOrigin(0);
    }
}