// Game.js (class Level2 dengan perbaikan untuk restart game)
class Level2 extends Phaser.Scene {
    constructor() {
        super({ key: 'level2' });
    }

    preload() {
        // Memuat gambar latar belakang, platform, dan bintang
        this.load.image('background4', 'assets/bg4.png');
        this.load.image('ground2', 'assets/platform2.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('musuh01', 'assets/musuh01.png');
        // Memuat gambar untuk partikel emitter
        this.load.image('particle', 'assets/particle.png');
        // Memuat sprite pemain sebagai gambar statis untuk menghindari masalah animasi
        this.load.image('player', 'assets/dude.png');
    }

    create() {
        // Debug: Cetak scene yang tersedia
        console.log('Level2 scene created');

        // Simpan level saat ini di registry untuk digunakan saat restart
        this.registry.set('currentLevel', 2);
        localStorage.setItem('currentLevel', 2); // <== tambahkan ini


        // Pastikan keyboard input bekerja
        this.input.keyboard.enabled = true;

        // Background
        this.cursors = this.input.keyboard.createCursorKeys();

        const background = this.add.image(400, 300, 'background4');
        background.setDisplaySize(800, 600);

        // Untuk menutupi seluruh layar (cover mode)
        let scaleX = this.cameras.main.width / background.width;
        let scaleY = this.cameras.main.height / background.height;
        let scale = Math.max(scaleX, scaleY);
        background.setScale(scale);

        // Menambahkan grup musuh dengan physics - Menggunakan group biasa bukan staticGroup
        this.musuh = this.physics.add.group();

        // Membuat musuh individual dengan physics body yang lebih tepat
        this.createEnemy(740, 560);
        this.createEnemy(550, 130);
        this.createEnemy(600, 560);

        // Platforms
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(300, 508, 'ground2').setScale(0.40).refreshBody();
        this.platforms.create(320, 280, 'ground2').setScale(0.40).refreshBody();
        this.platforms.create(70, 420, 'ground2').setScale(0.40).refreshBody();
        this.platforms.create(550, 330, 'ground2').setScale(0.40).refreshBody();
        this.platforms.create(750, 220, 'ground2').setScale(0.40).refreshBody();

        // Player - menggunakan gambar statis alih-alih spritesheet
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setScale(0.2);
        this.player.setBounce(0.2);
        this.player.body.setSize(200, 480).setOffset(100, 30);
        this.player.setCollideWorldBounds(true);

        // Stars
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 12,
            setXY: { x: 40, y: 0, stepX: 60 }
        });

        this.stars.children.iterate((child) => {
            child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.9));
            child.setScale(0.1);
        });

        // Score
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0',
            { fontSize: '32px', fill: '#000000',    fontStyle: 'bold' }
        );
        this.scoreText.setShadow(2, 2, '#fff', 2);

        this.platforms.children.iterate((platform) => {
            platform.body.setSize(140, 70).setOffset(20, 10);
        });

        // Flag untuk mengontrol status permainan
        this.gameActive = true;

        // Colliders
        this.platformCollider = this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        // Collider antara musuh dan platform agar musuh tidak jatuh
        this.physics.add.collider(this.musuh, this.platforms);

        // Tambahkan collision antara player dan musuh
        this.physics.add.collider(this.player, this.musuh, this.hitEnemy, null, this);

        // Siapkan particle emitter
        this.createParticleEmitter();

        // Debug: Tambahkan hotkey untuk transisi ke sceneWin (untuk testing)
        this.input.keyboard.on('keydown-W', () => {
            console.log('Forcing transition to win scene');
            this.showWinScene();
        });
    }

    // Fungsi untuk membuat musuh dengan hitbox yang lebih konsisten
    createEnemy(x, y) {
        const enemy = this.musuh.create(x, y, 'musuh01');
        enemy.setScale(0.25);
        enemy.body.setImmovable(true); // Membuat musuh tidak bergerak saat berbenturan

        // Mengatur hitbox dengan ukuran yang lebih sesuai
        enemy.body.setSize(160, 200).setOffset(200, 100);

        // Menghilangkan gravity agar musuh tidak jatuh
        enemy.body.setAllowGravity(false);

        return enemy;
    }

    // Membuat particle emitter
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
        // Hanya update jika permainan masih aktif
        if (!this.gameActive || !this.player || !this.player.body) {
            return;
        }

        // Pergerakan horizontal
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.setFlipX(false);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.setFlipX(true);
        }
        else {
            this.player.setVelocityX(0);
        }

        // Melompat menggunakan anak panah ke atas
        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-295);
            this.platformCollider.active = true;
            this.canDropThrough = true;
        }

        // Turun melewati platform
        if (this.cursors.down.isDown && this.player.body.touching.down) {
            this.platformCollider.active = true;
            this.canDropThrough = false;
            this.player.setVelocityY(20);
            this.time.delayedCall(300, () => {
                this.platformCollider.active = true;
                this.time.delayedCall(200, () => {
                    this.canDropThrough = true;
                }, [], this);
            }, [], this);
        }
    }

    collectStar(player, star) {
        // Jangan kumpulkan bintang jika permainan tidak aktif
        if (!this.gameActive) return;

        star.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        // Simpan skor dalam registry
        this.registry.set('score', this.score);
        this.registry.set('finalScore', this.score);

        // Debug: Cetak jumlah bintang yang masih aktif
        console.log('Stars remaining:', this.stars.countActive(true));

        if (this.stars.countActive(true) === 0) {
            console.log('All stars collected! Transitioning to win scene...');
            this.showWinScene();
        }
    }

    hitEnemy(player, enemy) {
        console.log('Player hit enemy! Transitioning to game over...');

        // Hindari multiple call dan hanya jalankan jika game masih aktif
        if (!this.gameActive || !player.visible) {
            return;
        }

        // Set game tidak aktif untuk menghentikan update
        this.gameActive = false;

        // Nonaktifkan keyboard input
        this.input.keyboard.enabled = false;
        player.setVelocity(0);

        this.emitter.setPosition(player.x, player.y);
        this.emitter.start(true, 800, null, 30);

        player.setVisible(false);

        // Simpan skor akhir di registry
        this.registry.set('finalScore', this.score);

        // Tambahkan delay sebelum fadeOut untuk mencegah bug collision
        this.time.delayedCall(300, () => {
            this.cameras.main.fadeOut(1000, 255, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                // Hentikan semua input dan physics sebelum beralih scene
                this.physics.pause();
                this.input.keyboard.removeAllKeys();
                this.registry.set('lastLevel', 2);
                // Mulai scene game over
                this.scene.start('sceneGameOver');
            });
        });
    }

    showWinScene() {
        console.log('showWinScene called, transitioning to sceneWin');

        // Set game tidak aktif
        this.gameActive = false;

        // Pastikan skor tersimpan di registry
        this.registry.set('score', this.score);
        this.registry.set('finalScore', this.score);

        console.log('Score saved in registry:', this.score);

        // Hentikan semua input dan physics
        this.physics.pause();
        this.input.keyboard.enabled = false;

        // Menampilkan efek sebelum pindah ke scene kemenangan
        this.cameras.main.fadeOut(1000, 255, 255, 255);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            // Debug: Pastikan event ini terpanggil
            console.log('Fade out complete, starting sceneWin');

            // Pindah ke scene kemenangan
            this.scene.start('sceneWin');
        });
    }
}