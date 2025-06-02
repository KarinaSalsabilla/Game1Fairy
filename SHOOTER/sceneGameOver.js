var sceneGameOver = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { key: "sceneGameOver" });
    },
    init: function (data) {
        // localStorage.clear();

        // Ambil skor terakhir dari localStorage atau dari data yang dikirim scene sebelumnya
        this.score = data && data.score ? data.score : parseInt(localStorage.getItem('lastScore') || 0);
        
        // Simpan skor terakhir ke localStorage
        localStorage.setItem('lastScore', this.score);

        // Ambil high score dari localStorage
        this.highScore = parseInt(localStorage.getItem('highScore') || 0);

        // Update high score jika skor saat ini lebih tinggi
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }

        // Ambil status sound on/off dari localStorage
        this.soundOn = localStorage.getItem('sound_enabled') !== '0';
        // default true
    },
    preload: function () {
        this.load.image("BGPlay", "assets/BGPlay.png");
        this.load.image("ButtonPlay", "assets/ButtonPlay.png");
        this.load.image("ButtonMenu", "assets/ButtonMenu.png");
        this.load.audio("snd_gameover", "assets/music_gameover.mp3");
        this.load.audio("snd_touchshooter", "assets/fx_touch.mp3");
        this.load.image("Cloud", "assets/cloud.png");
    },
    create: function () {
        // Stop semua suara yang masih aktif (termasuk musik dari menu)
        this.sound.stopAll();

        // Posisi tengah layar
        const centerX = this.game.canvas.width / 2;
        const centerY = this.game.canvas.height / 2;

        // Background
        this.add.image(centerX, centerY, 'BGPlay')
            .setDisplaySize(this.game.canvas.width, this.game.canvas.height);

        // Sound
        this.snd_gameover = this.sound.add("snd_gameover");
        this.snd_touch = this.sound.add("snd_touchshooter");

        // Tambahkan awan untuk transisi masuk
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
                if (this.soundOn) {
                    this.snd_gameover.play({ loop: true });
                }
            }
        });

        // Teks "GAME OVER"
        this.add.text(centerX, centerY - 100, 'GAME OVER', {
            fontFamily: 'Verdana, Arial',
            fontSize: '80px',
            color: '#ffffff',
            stroke: '#ff0000',
            strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5);

        // Skor saat ini
        this.add.text(centerX, centerY, 'SCORE : ' + this.score, {
            fontFamily: 'Verdana, Arial',
            fontSize: '40px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // High score
        this.add.text(centerX, centerY + 50, 'HIGH SCORE : ' + this.highScore, {
            fontFamily: 'Verdana, Arial',
            fontSize: '32px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Tombol Menu
        let btnMenu = this.add.image(centerX - 62, centerY + 180, 'ButtonMenu')
            .setInteractive()
            .setScale(1.4);

        btnMenu.on('pointerdown', () => {
            if (this.soundOn) this.snd_touch.play();
            if (this.snd_gameover.isPlaying) this.snd_gameover.stop();
            
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
        let btnPlayAgain = this.add.image(centerX + 62, centerY + 180, 'ButtonPlay')
            .setInteractive()
            .setScale(0.8);

        btnPlayAgain.on('pointerdown', () => {
            if (this.soundOn) this.snd_touch.play();
            if (this.snd_gameover.isPlaying) this.snd_gameover.stop();
            
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