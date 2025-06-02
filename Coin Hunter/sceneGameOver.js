var sceneGameOver = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { key: "sceneGameOver" });
    },

    // Terima data skor dari scene sebelumnya
    init: function (data) {
        // Ambil skor dari parameter data
        this.score = data.score || 0;
                // Hapus highScore sementara
        //   localStorage.removeItem('highScore');

        // Simpan lastScore ke localStorage jika perlu
        localStorage.setItem('lastScore', this.score);

        // Ambil high score dari localStorage
        this.highScore = parseInt(localStorage.getItem('highScore') || 0);

        // Update high score jika perlu
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }

        // Ambil status sound
        this.soundOn = localStorage.getItem('sound_enabled') !== '0'; // default true
    },

    preload: function () {
        this.load.image("BG", "assets/images/bg.jpeg");
        this.load.image("bgOver", "assets/images/GameOver.png");
        this.load.image("ButtonPlay", "assets/images/ButtonPlay.png");
        this.load.audio("snd_gameover", "assets/audio/kalah.mp3");
        this.load.audio("snd_touchshooter", "assets/audio/touch.mp3");
    },

    create: function () {
        // Stop semua suara
        this.sound.stopAll();

        // Tambahkan sound
        this.snd_gameover = this.sound.add("snd_gameover");
        this.snd_touch = this.sound.add("snd_touchshooter");

        // Mainkan suara game over jika diaktifkan
        if (this.soundOn) {
            this.snd_gameover.play({ loop: true });
        }

        // Tambahkan background
        this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, 'BG')
            .setDisplaySize(this.game.canvas.width, this.game.canvas.height);

        // Tambahkan lapisan gelap transparan
        this.add.rectangle(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2,
            this.game.canvas.width,
            this.game.canvas.height,
            0x000000,
            0.5
        );

        // Gambar tulisan "Game Over"
        this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2 - 150, 'bgOver');

        // Tampilkan skor
        this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, 'SCORE : ' + this.score, {
            fontFamily: 'Verdana, Arial',
            fontSize: '40px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Tampilkan high score
        this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2 + 50, 'HIGH SCORE : ' + this.highScore, {
            fontFamily: 'Verdana, Arial',
            fontSize: '32px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Tambahkan tombol "Main Lagi"
        let btnPlayAgain = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2 + 250, 'ButtonPlay')
            .setInteractive()
            .setScale(0.8);

        btnPlayAgain.on('pointerdown', () => {
            if (this.soundOn) this.snd_touch.play();
            if (this.snd_gameover.isPlaying) this.snd_gameover.stop();
            this.scene.start('scenePlay');
        });
    }
});
