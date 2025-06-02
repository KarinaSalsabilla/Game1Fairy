class Level3 extends Phaser.Scene {
    constructor() {
        super({ key: 'level3' });
        this.ridingPlatform = null;
    }

    preload() {
        this.load.image('background6', 'assets/bg8.jpeg');
        this.load.image('ground4', 'assets/platform4.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('musuh03', 'assets/musuh03.png');
        this.load.image('particle', 'assets/particle.png');
        this.load.image('player', 'assets/dude.png');
        this.load.spritesheet('bird', 'assets/burung.png', {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create() {

        this.registry.set('currentLevel', 3);
        localStorage.setItem('currentLevel', 3); // <== tambahkan ini

        this.input.keyboard.enabled = true;
        this.cursors = this.input.keyboard.createCursorKeys();

        const background = this.add.image(400, 300, 'background6');
        background.setDisplaySize(800, 600);
        let scaleX = this.cameras.main.width / background.width;
        let scaleY = this.cameras.main.height / background.height;
        let scale = Math.max(scaleX, scaleY);
        background.setScale(scale);

        this.musuh = this.physics.add.group();
        this.createEnemy(290, 200);
        this.createEnemy(660, 400);
        this.createEnemy(425, 500);

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(300, 420, 'ground4').setScale(0.40).refreshBody();
        this.platforms.create(100, 480, 'ground4').setScale(0.40).refreshBody();
        this.platforms.create(520, 350, 'ground4').setScale(0.40).refreshBody();
        this.platforms.create(500, 130, 'ground4').setScale(0.40).refreshBody();

        this.movingPlatform = this.physics.add.image(730, 200, 'ground4').setScale(0.40);
        this.movingPlatform.body.setImmovable(true);
        this.movingPlatform.body.allowGravity = false;
        this.movingPlatform.body.setFriction(1, 1);
        this.movingPlatform.body.setSize(420, 200).setOffset(60, 120);
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
            repeat: 13,
            setXY: { x: 40, y: 0, stepX: 58 }
        });
        this.stars.children.iterate(child => {
            child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.2));
            child.setScale(0.1);
            child.body.setSize(450, 450);
            child.isOnMovingPlatform = false;
        });

        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px', fill: '#000', fontStyle: 'bold'
        }).setShadow(2, 2, '#fff', 2);

        this.platforms.children.iterate(platform => {
            platform.body.setSize(140, 60).setOffset(50, 70);
        });

        this.gameActive = true;

        this.physics.add.collider(this.player, this.platforms);
        this.platformCollider = this.physics.add.collider(
            this.player,
            this.movingPlatform,
            this.rideMovingPlatform,
            null,
            this
        );

        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(
            this.stars,
            this.movingPlatform,
            this.starOnMovingPlatform,
            null,
            this
        );

        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.collider(this.musuh, this.platforms);
        this.physics.add.collider(this.musuh, this.movingPlatform);
        this.physics.add.collider(this.player, this.musuh, this.hitEnemy, null, this);

        this.createParticleEmitter();

        // this.birds = this.physics.add.group({
        //     allowGravity: false,
        //     collideWorldBounds: false
        // });

        this.input.keyboard.on('keydown-W', () => {
            this.showWinScene();
        });
    }

    rideMovingPlatform(player, platform) {
        if (player.body.bottom <= platform.body.top + 10 &&
            player.body.velocity.y >= 0 &&
            player.body.position.x + player.body.width > platform.body.position.x &&
            player.body.position.x < platform.body.position.x + platform.body.width) {
            this.ridingPlatform = platform;
            player.body.blocked.down = true;
            player.body.touching.down = true;
        }
    }

    starOnMovingPlatform(star, platform) {
        if (star.body.bottom <= platform.body.top + 10 &&
            star.body.velocity.y >= 0 &&
            star.body.position.x + star.body.width > platform.body.position.x &&
            star.body.position.x < platform.body.position.x + platform.body.width) {
            star.isOnMovingPlatform = true;
            star.platformRef = platform;
            star.body.velocity.y = 0;
        }
    }

    createEnemy(x, y) {
        const enemy = this.musuh.create(x, y, 'musuh03');
        enemy.setScale(0.2);
        enemy.body.setImmovable(true);
        enemy.body.setSize(250, 300).setOffset(120, 70);
        enemy.body.setAllowGravity(false);
        return enemy;
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
            this.player.setVelocityY(-285);
            this.ridingPlatform = null;
        }

        if (this.cursors.down.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(20);
        }

        if (this.movingPlatform) {
            const deltaY = this.movingPlatform.y - this.movingPlatform.prevY;

            // Sinkronisasi player
            if (this.ridingPlatform === this.movingPlatform &&
                this.player.body.blocked.down &&
                !this.cursors.up.isDown) {
                this.player.y += deltaY;
                this.player.body.position.y += deltaY;
                this.player.body.velocity.y = 0;
            }

            // Sinkronisasi bintang
            this.stars.children.iterate(star => {
                if (star.active && star.isOnMovingPlatform) {
                    const onPlatform =
                        star.body.position.x + star.body.width > this.movingPlatform.body.position.x &&
                        star.body.position.x < this.movingPlatform.body.position.x + this.movingPlatform.body.width &&
                        Math.abs(star.body.bottom - this.movingPlatform.body.top) < 20;

                    if (onPlatform) {
                        star.y += deltaY;
                        star.body.position.y += deltaY;
                        star.body.velocity.y = 0;
                    } else {
                        star.isOnMovingPlatform = false;
                    }
                }
            });

            this.movingPlatform.prevY = this.movingPlatform.y;
        }

        this.physics.world.collide(this.player, this.movingPlatform, this.rideMovingPlatform, null, this);
        this.physics.world.collide(this.stars, this.movingPlatform, this.starOnMovingPlatform, null, this);
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
                this.registry.set('lastLevel', 3);
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
