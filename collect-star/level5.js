class Level5 extends Phaser.Scene {
    constructor() {
        super({ key: 'level5' });
    }

    preload() {
        this.load.image('background8', 'assets/bg9.png');
        this.load.image('ground5', 'assets/platform5.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('musuh05', 'assets/musuh05.png');
        this.load.image('particle', 'assets/particle.png');
        this.load.image('player', 'assets/dude.png');
        this.load.spritesheet('bird', 'assets/burung.png', {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create() {
        this.registry.set('currentLevel', 5);
        localStorage.setItem('currentLevel', 5);

        this.maxBirds = 3;

        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('bird', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.input.keyboard.enabled = true;
        this.cursors = this.input.keyboard.createCursorKeys();

        const background = this.add.image(400, 300, 'background8');
        background.setDisplaySize(800, 600);
        let scale = Math.max(this.cameras.main.width / background.width, this.cameras.main.height / background.height);
        background.setScale(scale);

        this.musuh = this.physics.add.group();
        this.createEnemy(220, 240);
        this.createEnemy(580, 300);

        this.platforms = this.physics.add.staticGroup();
        [
            [200, 500],
            [140, 180],
            [600, 500],
            [680, 180]
        ].forEach(([x, y]) => {
            this.platforms.create(x, y, 'ground5').setScale(0.4).refreshBody();
        });

        this.movingPlatform = this.physics.add.image(400, 300, 'ground5').setScale(0.4);
        Object.assign(this.movingPlatform.body, {
            immovable: true,
            allowGravity: false
        });
        this.movingPlatform.body.setFriction(1, 1);
        this.movingPlatform.body.setSize(370, 250).setOffset(100, 120);
        this.movingPlatform.prevY = this.movingPlatform.y;

        this.tweens.add({
            targets: this.movingPlatform,
            y: '+=100',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setScale(0.2);
        this.player.setBounce(0.2);
        this.player.body.setSize(200, 480).setOffset(100, 30);
        this.player.setCollideWorldBounds(true);

        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 14,
            setXY: { x: 80, y: 0, stepX: 48 }
        });
        this.stars.children.iterate(child => {
            child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.2));
            child.setScale(0.1);
        });

        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px', fill: '#000', fontStyle: 'bold'
        }).setShadow(2, 2, '#fff', 2);

        this.platforms.children.iterate(platform => {
            platform.body.setSize(150, 70).setOffset(40, 70);
        });

        this.gameActive = true;

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.movingPlatform, this.rideMovingPlatform, null, this);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.stars, this.movingPlatform, this.starOnMovingPlatform, null, this);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.collider(this.musuh, this.platforms);
        this.physics.add.collider(this.musuh, this.movingPlatform);
        this.physics.add.collider(this.player, this.musuh, this.hitEnemy, null, this);

        this.createParticleEmitter();

        this.birds = this.physics.add.group({
            allowGravity: false,
            collideWorldBounds: false
        });

        [
            [200, 80],
            [600, 50],
            [400, 120]
        ].forEach(([x, y]) => this.spawnBird(x, y));

        this.physics.add.collider(this.player, this.birds, this.hitEnemy, null, this);

        this.time.addEvent({
            delay: 6000,
            callback: () => this.spawnBird(850, Phaser.Math.Between(30, 150)),
            callbackScope: this,
            loop: true
        });

        this.input.keyboard.on('keydown-W', () => this.showWinScene());
    }

    rideMovingPlatform(player, platform) {
        if (
            player.body.bottom <= platform.body.top + 10 &&
            player.body.velocity.y >= 0 &&
            player.body.position.x + player.body.width > platform.body.position.x &&
            player.body.position.x < platform.body.position.x + platform.body.width
        ) {
            this.ridingPlatform = platform;
        }
    }

    starOnMovingPlatform(star, platform) {
        if (
            star.body.bottom <= platform.body.top + 10 &&
            star.body.velocity.y >= 0 &&
            star.body.position.x + star.body.width > platform.body.position.x &&
            star.body.position.x < platform.body.position.x + platform.body.width
        ) {
            star.isOnMovingPlatform = true;
        }
    }

    createEnemy(x, y) {
        const enemy = this.musuh.create(x, y, 'musuh05');
        enemy.setScale(0.2);
        enemy.body.setImmovable(true);
        enemy.body.setSize(200, 300).setOffset(120, 70);
        enemy.body.setAllowGravity(false);
        return enemy;
    }

    spawnBird(x, y) {
        if (this.birds.countActive(true) >= this.maxBirds) return;

        const bird = this.birds.create(x, y, 'bird');
        bird.setScale(1.4);
        bird.play('fly');
        bird.setFlipX(false);
        bird.body.setAllowGravity(false);
        bird.body.setSize(32, 32);
        bird.body.setOffset(16, 16);

        const right = Phaser.Math.Between(0, 1) === 1;
        bird.setVelocityX(right ? Phaser.Math.Between(80, 140) : Phaser.Math.Between(-140, -80));
        bird.setFlipX(!right);
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
        if (!this.gameActive || !this.player?.body) return;

        const { left, right, up, down } = this.cursors;

        if (left.isDown) {
            this.player.setVelocityX(-160);
            this.player.setFlipX(false);
        } else if (right.isDown) {
            this.player.setVelocityX(160);
            this.player.setFlipX(true);
        } else {
            this.player.setVelocityX(0);
        }

        if (up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-285);
        }

        const deltaY = this.movingPlatform.y - this.movingPlatform.prevY;

        // Pergerakan sinkron dengan platform
        if (this.ridingPlatform === this.movingPlatform && this.player.body.blocked.down && !up.isDown) {
            this.player.y += deltaY;
            this.player.body.y += deltaY;
            this.player.body.velocity.y = 0;
        } else {
            this.ridingPlatform = null;
        }

        this.stars.children.iterate(star => {
            if (!star.active || !star.isOnMovingPlatform) return;
            star.y += deltaY;
            star.body.y += deltaY;
        });

        this.movingPlatform.prevY = this.movingPlatform.y;

        this.birds.children.iterate(bird => {
            if (!bird?.active) return;

            if (bird.x < -100 || bird.x > 900) bird.disableBody(true, true);
            if (bird.x <= 0) {
                bird.setVelocityX(Phaser.Math.Between(80, 140));
                bird.setFlipX(false);
            } else if (bird.x >= 800) {
                bird.setVelocityX(Phaser.Math.Between(-140, -80));
                bird.setFlipX(true);
            }

            if (bird.y > 150) bird.setVelocityY(-30);
            else if (bird.y < 30) bird.setVelocityY(30);
        });
    }

    collectStar(player, star) {
        if (!this.gameActive) return;

        star.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        this.registry.set('score', this.score);
        this.registry.set('finalScore', this.score);

        if (this.stars.countActive(true) === 0) this.showWinScene();
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
                this.registry.set('lastLevel', 5);
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
