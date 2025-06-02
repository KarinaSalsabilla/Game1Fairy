var sceneGameWin = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { key: "sceneGameWin" });
    },
    init: function () {
        // localStorage.clear();

        // Ambil skor terakhir dari localStorage
        this.score = parseInt(localStorage.getItem('lastScore') || 0);

        // Ambil high score dari localStorage
        this.highScore = parseInt(localStorage.getItem('highScore') || 0);

        // Update high score jika skor saat ini lebih tinggi
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }

        // Ambil status sound on/off dari localStorage
        this.soundOn = localStorage.getItem('sound_enabled') !== '0';
    },
    preload: function () {
        this.load.image("BGPlay", "assets/BGPlay.png");
        this.load.image("ButtonPlay", "assets/ButtonPlay.png");
        this.load.image("ButtonMenu", "assets/ButtonMenu.png");
        this.load.audio("snd_win", "assets/fx_win.mp3"); // Gunakan nama snd_win
        this.load.audio("snd_touchshooter", "assets/fx_touch.mp3");
        this.load.image("Cloud", "assets/cloud.png")
    },
    create: function () {
        // Stop semua suara yang masih aktif (termasuk musik dari menu)
        this.sound.stopAll();

        const centerX = this.game.canvas.width / 2;
        const centerY = this.game.canvas.height / 2;

        // Background
        this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, 'BGPlay')
            .setDisplaySize(this.game.canvas.width, this.game.canvas.height);

        // Sound
        this.snd_win = this.sound.add("snd_win");
        this.snd_touch = this.sound.add("snd_touchshooter");


        let cloudIn = this.add.image(centerX, centerY, "Cloud");
        cloudIn.setScale(2); // perbesar agar menutupi layar
        cloudIn.setAlpha(1); // awan awalnya menutupi seluruh layar
        cloudIn.depth = 10; // pastikan di atas

        // Fade out awan saat scene dimulai
        this.tweens.add({
            targets: cloudIn,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                cloudIn.destroy(); // hapus awan setelah transisi selesai

                // Mainkan sound hanya jika soundOn true
                // Mainkan sound hanya jika soundOn true
                if (this.soundOn) {
                    this.snd_win.play({ loop: true });
                }

            }
        });


        // Teks "GAME COMPLETED!"
        this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2 - 100, 'GAME COMPLETED!', {
            fontFamily: 'Verdana, Arial',
            fontSize: '60px',
            color: '#ffffff',
            stroke: '#FFA500',
            strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5);

        // Skor saat ini
        this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, 'SCORE : ' + this.score, {
            fontFamily: 'Verdana, Arial',
            fontSize: '40px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // High score
        this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2 + 50, 'HIGH SCORE : ' + this.highScore, {
            fontFamily: 'Verdana, Arial',
            fontSize: '32px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Tombol Menu
        let btnMenu = this.add.image(this.game.canvas.width / 2 - 62, this.game.canvas.height / 2 + 180, 'ButtonMenu')
            .setInteractive()
            .setScale(1.4);

        btnMenu.on('pointerdown', () => {
            if (this.soundOn) this.snd_touch.play();
            if (this.snd_win.isPlaying) this.snd_win.stop();
            // Tambahkan awan untuk transisi keluar
            let cloudOut = this.add.image(centerX, centerY, "Cloud");
            cloudOut.setScale(2); // perbesar agar menutupi layar
            cloudOut.setAlpha(0); // awan awalnya transparan
            cloudOut.depth = 10; // pastikan di atas

            // Fade in awan, lalu pindah scene
            this.tweens.add({
                targets: cloudOut,
                alpha: 1,
                duration: 1000,
                onComplete: () => {
                    this.scene.start('sceneMenu');
                }
            });
        });

        // Tombol Main Lagi
        let btnPlayAgain = this.add.image(this.game.canvas.width / 2 + 62, this.game.canvas.height / 2 + 180, 'ButtonPlay')
            .setInteractive()
            .setScale(0.8);

        btnPlayAgain.on('pointerdown', () => {
            if (this.soundOn) this.snd_touch.play();
            if (this.snd_win.isPlaying) this.snd_win.stop();

            // Tambahkan awan untuk transisi keluar
            let cloudOut = this.add.image(centerX, centerY, "Cloud");
            cloudOut.setScale(2); // perbesar agar menutupi layar
            cloudOut.setAlpha(0); // awan awalnya transparan
            cloudOut.depth = 10; // pastikan di atas

            // Fade in awan, lalu pindah scene
            this.tweens.add({
                targets: cloudOut,
                alpha: 1,
                duration: 1000,
                onComplete: () => {
                    this.scene.start('scenePlay');
                }
            });
        });
    }
});
