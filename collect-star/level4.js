class Level4 extends Phaser.Scene {
    constructor() {
        super({ key: 'level4' });
    }

    preload() {
        this.load.image('background5', 'assets/bg6.png');
        this.load.image('ground3', 'assets/platform3.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('musuh02', 'assets/musuh02.png');
        this.load.image('particle', 'assets/particle.png');
        this.load.image('player', 'assets/dude.png');
        this.load.spritesheet('bird', 'assets/burung.png', {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create() {
        this.registry.set('currentLevel', 4);
        localStorage.setItem('currentLevel', 4); // <== tambahkan ini

        this.maxBirds = 5;

        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('bird', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.input.keyboard.enabled = true;
        this.cursors = this.input.keyboard.createCursorKeys();

        const background = this.add.image(400, 300, 'background5');
        background.setDisplaySize(800, 600);
        let scaleX = this.cameras.main.width / background.width;
        let scaleY = this.cameras.main.height / background.height;
        let scale = Math.max(scaleX, scaleY);
        background.setScale(scale);

        this.musuh = this.physics.add.group();
        this.createEnemy(220, 240);
        this.createEnemy(690, 360);
        this.createEnemy(530, 420);

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 400, 'ground3').setScale(0.40).refreshBody();
        this.platforms.create(50, 390, 'ground3').setScale(0.40).refreshBody();
        this.platforms.create(220, 520, 'ground3').setScale(0.40).refreshBody();
        this.platforms.create(560, 300, 'ground3').setScale(0.40).refreshBody();
        this.platforms.create(730, 240, 'ground3').setScale(0.40).refreshBody();

        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setScale(0.2);
        this.player.setBounce(0.2);
        this.player.body.setSize(200, 480).setOffset(100, 30);
        this.player.setCollideWorldBounds(true);

        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 13,
            setXY: { x: 40, y: 0, stepX: 58 }
        });
        this.stars.children.iterate(child => {
            child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.9));
            child.setScale(0.1);
        });

        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px', fill: '#000', fontStyle: 'bold'
        }).setShadow(2, 2, '#fff', 2);


        this.platforms.children.iterate(platform => {
            platform.body.setSize(120, 60).setOffset(50, 50);
        });

        this.gameActive = true;


        this.platformCollider = this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.collider(this.musuh, this.platforms);
        this.physics.add.collider(this.player, this.musuh, this.hitEnemy, null, this);

        this.createParticleEmitter();

        // Tambahkan burung terbang - dengan konfigurasi khusus untuk grup
        this.birds = this.physics.add.group({
            allowGravity: false,  // Nonaktifkan gravitasi untuk seluruh grup
            collideWorldBounds: false  // Tidak dibatasi oleh batas dunia
        });

        this.spawnBird(200, 80);
        this.spawnBird(600, 50);
        this.spawnBird(400, 120);

        // Tambahkan collision player dan burung
        this.physics.add.collider(this.player, this.birds, this.hitEnemy, null, this);

        // Spawn burung berkala
        this.time.addEvent({
            delay: 4000,
            callback: () => this.spawnBird(850, Phaser.Math.Between(30, 150)),
            callbackScope: this,
            loop: true
        });

        this.input.keyboard.on('keydown-W', () => {
            this.showWinScene();
        });
    }

    createEnemy(x, y) {
        const enemy = this.musuh.create(x, y, 'musuh02');
        enemy.setScale(0.2);
        enemy.body.setImmovable(true);
        enemy.body.setSize(200, 300).setOffset(120, 70);
        enemy.body.setAllowGravity(false);
        return enemy;
    }

    spawnBird(x, y) {
        // Cek jumlah burung aktif
        if (this.birds.countActive(true) >= this.maxBirds) return;

        if (x === undefined) x = Phaser.Math.Between(0, 800);
        if (y === undefined) y = Phaser.Math.Between(30, 150);

        const bird = this.birds.create(x, y, 'bird');
        bird.setScale(1.4);
        bird.play('fly');
        bird.setFlipX(false);

        bird.body.setAllowGravity(false);
        bird.body.setSize(32, 32);
        bird.body.setOffset(16, 16);

        const arahKanan = Phaser.Math.Between(0, 1) === 1;
        bird.setVelocityX(arahKanan ? Phaser.Math.Between(80, 140) : Phaser.Math.Between(-140, -80));
        bird.setFlipX(!arahKanan);
        bird.setVelocityY(Phaser.Math.Between(-30, 30));

        this.tweens.add({
            targets: bird,
            y: Phaser.Math.Clamp(y + Phaser.Math.Between(-30, 30), 30, 150),
            yoyo: true,
            duration: 1500,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return bird;
    }




    createParticleEmitter() {
        this.emitter = this.add.particles('particle').createEmitter({
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 800,
            blendMode: 'ADD',
            on: false
        });
    }

    update() {
        if (!this.gameActive || !this.player || !this.player.body) return;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.setFlipX(false);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.setFlipX(true);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-284);
        }

        if (this.cursors.down.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(20);
        }

        // Burung hanya bergerak ke kiri, hapus kalau sudah keluar layar
        this.birds.children.iterate(bird => {
            if (!bird || !bird.active) return;

            if (bird.x < -100 || bird.x > 900) {
                bird.destroy(); // Ini penting agar jumlah burung bisa berkurang
                return;
            }

            if (bird.x <= 0) {
                bird.setVelocityX(Phaser.Math.Between(80, 140));
                bird.setFlipX(false);
            } else if (bird.x >= 800) {
                bird.setVelocityX(Phaser.Math.Between(-140, -80));
                bird.setFlipX(true);
            }

            if (bird.y > 150) {
                bird.y = 150;
                bird.setVelocityY(-30);
            } else if (bird.y < 30) {
                bird.y = 30;
                bird.setVelocityY(30);
            }
        });

    }



    collectStar(player, star) {
        if (!this.gameActive) return;

        star.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        this.registry.set('score', this.score);
        this.registry.set('finalScore', this.score);

        if (this.stars.countActive(true) === 0) {
            this.showWinScene();
        }
    }

    hitEnemy(player, enemy) {
        if (!this.gameActive || !player.visible) return;

        this.gameActive = false;
        this.input.keyboard.enabled = false;
        player.setVelocity(0);

        this.emitter.setPosition(player.x, player.y);
        this.emitter.start(true, 800, null, 30);
        player.setVisible(false);

        this.registry.set('finalScore', this.score);

        this.time.delayedCall(300, () => {
            this.cameras.main.fadeOut(1000, 255, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.physics.pause();
                this.input.keyboard.removeAllKeys();
                this.registry.set('lastLevel', 4);
                this.scene.start('sceneGameOver');
            });
        });
    }

    showWinScene() {
        this.gameActive = false;
        this.registry.set('score', this.score);
        this.registry.set('finalScore', this.score);

        this.physics.pause();
        this.input.keyboard.enabled = false;

        this.cameras.main.fadeOut(1000, 255, 255, 255);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('sceneWin');
        });
    }
}