export class LoadScene extends Phaser.Scene {  
    constructor() {
        super('LOAD');
    } 

    init() {
        
    }

    preload() {
        webSocket.connect();

        this.load.image("background_load", "./assets/background-load.jpg");
        this.load.image("background_menu", "./assets/background-menu.jpg");

        this.load.audio("landing_sound", "./assets/landing-sound.mp3");

        let progressBar = this.add.graphics({
            fillStyle: {
                color: 0xFFFFFF
            }
        })

        this.load.on("progress", (percent)=> {

            progressBar.fillRect(0, this.game.renderer.height / 2,
                this.game.renderer.width * percent, 50);
            console.log(percent);
        })

        this.load.on("complete", (percent)=> {
            console.log("done");
        })
        
    }

    create() {
        this.scene.start("MENU", "hello from LOAD scene");
    }
}