var sceneMenu = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function sceneMenu() {
        Phaser.Scene.call(this, { key: 'sceneMenu' });
    },

    init: function () {
        // Mendefinisikan ukuran layar
        this.gameWidth = window.innerWidth;
        this.gameHeight = window.innerHeight;

    },

    preload: function () {
        // Load asset
        this.load.image('title_game', 'assets/title_game.png');
        this.load.image('bg_start', 'assets/bg_start.png');
        this.load.image('btn_play', 'assets/btn_play.png');
        this.load.image('panel_skor', 'assets/panel_skor.png');
        this.load.audio('snd_ambience', 'assets/ambience.mp3');
        this.load.audio('snd_touch', 'assets/touch.mp3');
        this.load.audio('snd_transisi_menu', 'assets/transisi_menu.mp3')
        this.load.spritesheet('sps_mummy', 'assets/mummy37x45.png', { frameWidth: 37, frameHeight: 45 });

    },

    create: function () {
        X_POSITION = {
            LEFT: 0,
            CENTER: game.canvas.width / 2,
            RIGHT: game.canvas.width,
        }
        Y_POSITION = {
            TOP: 0,
            CENTER: game.canvas.height / 2,
            BOTTOM: game.canvas.height,
        }

        this.anims.create({
            key: 'walk', // Tambahkan key 'walk' di sini
            frames: this.anims.generateFrameNumbers('sps_mummy', { start: 0, end: 17 }), // Tentukan range frame
            frameRate: 16,
            repeat: -1
        });

        const mummyAnimation = this.anims.create({
            frame: this.anims.generateFrameNumbers("sps_mummy"),
            frameRate: 16,
        })
        const sprite = this.add.sprite(500, 768 / 2 + 180, "sps_mummy").setScale(3).setDepth(10);
        sprite.play({ key: "walk"});


        // mengisikan variabel global dengan musik latar jika
        //variabel snd_ambience masih kosong
        if (snd_ambience == null) {
            snd_ambience = this.sound.add('snd_ambience');
            snd_ambience.loop = true;
            snd_ambience.setVolume(0.35);
            snd_ambience.play();
        }

        this.snd_touch = this.sound.add('snd_touch');
        var snd_transisi = this.sound.add('snd_transisi_menu');

        // Memastikan game menyesuaikan dengan ukuran layar
        this.scale.setGameSize(this.gameWidth, this.gameHeight);

        // Background - menutupi seluruh layar
        var bgStart = this.add.image(X_POSITION.CENTER,Y_POSITION.CENTER, 'bg_start');
        bgStart.setDisplaySize(this.gameWidth, this.gameHeight);

        // Judul game - di tengah atas
        this.titleGame = this.add.image(this.gameWidth / 2, 200, 'title_game');
        this.titleGame.setDepth(10);
        this.titleGame.setScale(1.2);

        // Setting posisi awal judul untuk animasi
        this.titleGame.y -= 100;

        // Panel highscore - diposisikan tepat di bawah judul
        var panelHighscore = this.add.image(this.gameWidth / 2, 380, 'panel_skor');
        panelHighscore.setScale(1);
        panelHighscore.setAlpha(0.9);



        // Mendapatkan highscore
        let highscore = localStorage["highscore"] || 0;

        // Text highscore dengan format dan style yang lebih rapi
        var textHighscore = this.add.text(panelHighscore.x + 25, panelHighscore.y, "HIGHSCORE: " + highscore, {
            fontFamily: 'Arial',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ff732e',
            stroke: '#000000',
            strokeThickness: 4
        });
        textHighscore.setOrigin(0.5);

        // Button Play - di tengah bawah dengan posisi yang tepat
        var btnPlay = this.add.image(this.gameWidth / 2, 560, 'btn_play');
        btnPlay.setScale(1.1);

        // Setup efek hover & klik untuk button
        this.setupButtonInteractions(btnPlay);

        // Animasi judul game yang lebih halus
        //menambahkan animasi judul game

        this.tweens.add({
            targets: this.titleGame,
            ease: 'Bounce.easeOut',
            y: 200,
            duration: 1000,
            delay: 500,
            onComplete: function () {
                snd_transisi.play();
            }
        });

        // Animasi button play muncul dengan efek zoom
        btnPlay.setScale(0);
        this.tweens.add({
            targets: btnPlay,
            scaleX: 1.1,
            scaleY: 1.1,
            ease: 'Back.easeOut',
            duration: 750,
            delay: 1200
        });

        // Animasi pulsing untuk button agar lebih menarik
        this.tweens.add({
            targets: btnPlay,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 2000
        });

        // Glow effect untuk panel highscore
        this.tweens.add({
            targets: panelHighscore,
            alpha: 0.7,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 1500
        });
    },

    setupButtonInteractions: function (btnPlay) {
        var btnClicked = false;

        // Mouse over button
        this.input.on('gameobjectover', function (pointer, gameObject) {
            if (gameObject === btnPlay) {
                btnPlay.setTint(0xcccccc);
                // Sementara hentikan animasi pulsing
                this.tweens.killTweensOf(btnPlay);
                btnPlay.setScale(1.2);
            }
        }, this);

        // Mouse keluar dari button
        this.input.on('gameobjectout', function (pointer, gameObject) {
            if (gameObject === btnPlay) {
                btnPlay.setTint(0xffffff);
                btnPlay.setScale(1.1);

                // Restart animasi pulsing
                this.tweens.add({
                    targets: btnPlay,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }, this);

        // Mouse klik button
        this.input.on('gameobjectdown', function (pointer, gameObject) {
            if (gameObject === btnPlay) {
                btnPlay.setTint(0x616161);
                btnPlay.setScale(0.9);
                btnClicked = true;

                // Stop animasi pulsing
                this.tweens.killTweensOf(btnPlay);
            }
        }, this);

        // Mouse lepas klik pada button
        this.input.on('gameobjectup', function (pointer, gameObject) {
            if (gameObject === btnPlay && btnClicked) {
                btnPlay.setTint(0xffffff);

                // Efek transisi sebelum pindah scene
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', function () {
                    this.scene.start('scenePlay');
                    this.snd_touch.play();
                }, this);
            }
        }, this);

        // Mouse lepas klik di mana saja
        this.input.on('pointerup', function () {
            btnClicked = false;
        }, this);

        // Aktifkan interaksi button
        btnPlay.setInteractive();
    },

    update: function () {
        // Update logic jika diperlukan
    }
});