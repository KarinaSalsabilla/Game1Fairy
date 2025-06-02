var scenePlay = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function scenePlay() {
        Phaser.Scene.call(this, { key: 'scenePlay' });
    },

    preload: function () {
        this.load.image('chara', 'assets/chara.png');
        this.load.image('fg_loop_back', 'assets/fg_loop_back.png');
        this.load.image('fg_loop', 'assets/fg_loop.png');
        this.load.image('obstc', 'assets/obstc.png');
        this.load.image('panel_skor', 'assets/panel_skor.png');
        this.load.audio('snd_dead', 'assets/dead.mp3');
        this.load.audio('snd_klik_1', 'assets/klik_1.mp3');
        this.load.audio('snd_klik_2', 'assets/klik_2.mp3');
        this.load.audio('snd_klik_3', 'assets/klik_3.mp3');
    },

    create: function () {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        this.snd_dead = this.sound.add('snd_dead');
        this.snd_click = [
            this.sound.add('snd_klik_1'),
            this.sound.add('snd_klik_2'),
            this.sound.add('snd_klik_3')
        ];
        this.snd_click.forEach(s => s.setVolume(0.5));

        this.backgound = [];
        this.timerHalangan = 0;
        this.halangan = [];
        this.isGameRunning = false;

        // Ukuran latar belakang yang proporsional
        const bgTemp = this.add.image(0, 0, 'fg_loop_back');
        const bgWidth = Math.max(width, height * (bgTemp.width / bgTemp.height));
        const bgHeight = Math.max(height, width * (bgTemp.height / bgTemp.width));
        bgTemp.destroy(); // gambar sementara, hapus

        var bg_x = width / 2;

        for (let i = 0; i < 2; i++) {
            const BG = this.add.image(bg_x, height / 2, 'fg_loop_back');
            const FG = this.add.image(bg_x, height / 2, 'fg_loop');

            BG.setDisplaySize(bgWidth, bgHeight);
            FG.setDisplaySize(bgWidth, bgHeight);

            BG.setData('kecepatan', 2);
            FG.setData('kecepatan', 4);
            FG.setDepth(2);

            this.backgound.push([BG, FG]);
            bg_x += bgWidth;
        }

        this.chara = this.add.image(130, height / 2, 'chara');
        this.chara.setDepth(3);
        this.chara.setScale(0);

        this.tweens.add({
            delay: 250,
            targets: this.chara,
            ease: 'Back.Out',
            duration: 500,
            scaleX: 1,
            scaleY: 1,
            onComplete: () => {
                this.isGameRunning = true;
            }
        });

        this.input.on('pointerup', () => {
            if (!this.isGameRunning) return;
            this.snd_click[Math.floor(Math.random() * 3)].play();
            this.charaTweens = this.tweens.add({
                targets: this.chara,
                ease: 'Power1',
                duration: 750,
                y: this.chara.y + 200
            });
        });

        this.score = 0;
        this.panel_score = this.add.image(width / 2, 60, 'panel_skor');
        this.panel_score.setOrigin(0.5).setDepth(10).setAlpha(0.8);

        this.label_score = this.add.text(this.panel_score.x + 25, this.panel_score.y, this.score);
        this.label_score.setOrigin(0.5).setDepth(10).setFontSize(30).setTint(0xff732e);

        this.gameover = () => {
            const highScore = localStorage["highscore"] || 0;
            if (this.score > highScore) {
                localStorage["highscore"] = this.score;
            }
            this.scene.start("sceneMenu");
        };
    },

    update: function () {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        if (this.isGameRunning) {
            for (let i = 0; i < this.backgound.length; i++) {
                const bg = this.backgound[i][0];
                const fg = this.backgound[i][1];

                bg.x -= bg.getData('kecepatan');
                fg.x -= fg.getData('kecepatan');

                if (bg.x <= -bg.displayWidth / 2) {
                    bg.x += bg.displayWidth * 2;
                }
                if (fg.x <= -fg.displayWidth / 2) {
                    fg.x += fg.displayWidth * 2;
                }
            }

            this.chara.y -= 5;

            if (this.chara.y < 0) {
                this.isGameRunning = false;
                this.snd_dead.play();
                if (this.charaTweens) this.charaTweens.stop();

                this.charaTweens = this.tweens.add({
                    targets: this.chara,
                    ease: 'Elastic.easeOut',
                    duration: 2000,
                    alpha: 0,
                    onComplete: () => this.gameover()
                });
            }

            if (this.chara.y > height - 130) {
                this.chara.y = height - 130;
            }

            if (this.timerHalangan == 0) {
                const acak_y = Math.floor(Math.random() * (height - 140) + 60);
                const halanganBaru = this.add.image(width + 200, acak_y, 'obstc');
                halanganBaru.setOrigin(0, 0);
                halanganBaru.setData("status_aktif", true);
                halanganBaru.setData("kecepatan", Math.floor(Math.random() * 5 + 15));
                halanganBaru.setDepth(5);
                this.halangan.push(halanganBaru);
                this.timerHalangan = Math.floor(Math.random() * 10 + 20);
            }

            for (let i = this.halangan.length - 1; i >= 0; i--) {
                this.halangan[i].x -= this.halangan[i].getData("kecepatan");
                if (this.halangan[i].x < -200) {
                    this.halangan[i].destroy();
                    this.halangan.splice(i, 1);
                }
            }

            this.timerHalangan--;

            for (let i = this.halangan.length - 1; i >= 0; i--) {
                if (this.chara.x > this.halangan[i].x + 50 && this.halangan[i].getData("status_aktif")) {
                    this.halangan[i].setData("status_aktif", false);
                    this.score++;
                    this.label_score.setText(this.score);
                }
            }

            for (let i = this.halangan.length - 1; i >= 0; i--) {
                if (this.chara.getBounds().contains(this.halangan[i].x, this.halangan[i].y)) {
                    this.halangan[i].setData("status_aktif", false);
                    this.isGameRunning = false;
                    this.snd_dead.play();
                    if (this.charaTweens) this.charaTweens.stop();
                    this.charaTweens = this.tweens.add({
                        targets: this.chara,
                        ease: 'Elastic.easeOut',
                        duration: 2000,
                        alpha: 0,
                        onComplete: () => this.gameover()
                    });
                    break;
                }
            }
        }
    }
});
