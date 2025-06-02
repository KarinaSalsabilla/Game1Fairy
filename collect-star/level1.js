// Game.js (class Game dengan modifikasi)
class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'level1' });
    }

    preload() {
        // Memuat gambar latar belakang, platform, dan bintang
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');

        // Memuat sprite pemain sebagai gambar statis untuk menghindari masalah animasi
        this.load.image('player', 'assets/dude.png');
    }

    create() {
        // Background
        this.cursors = this.input.keyboard.createCursorKeys();

        const background = this.add.image(400, 300, 'sky');
        background.setDisplaySize(800, 600);

        // Platforms
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(300, 508, 'ground').setScale(0.40).refreshBody();
        this.platforms.create(500, 398, 'ground').setScale(0.40).refreshBody();
        this.platforms.create(90, 390, 'ground').setScale(0.40).refreshBody();
        this.platforms.create(700, 290, 'ground').setScale(0.40).refreshBody();

        // Player - menggunakan gambar statis alih-alih spritesheet
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setScale(0.2); // Memperbesar pemain
        this.player.setBounce(0.2);
        this.player.body.setSize(200, 500).setOffset(100, 10);
        this.player.setCollideWorldBounds(true);

        // Stars
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate((child) => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.9));
            child.setScale(0.1); // Mengatur ukuran bintang menjadi lebih kecil
        });

        // Score
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0',
            { fontSize: '32px', fill: '#fff' }
        );
        this.scoreText.setShadow(2, 2, '#000', 2);

        this.platforms.children.iterate((platform) => {
            platform.body.setSize(150, 75).setOffset(40, 60);
        });

        // Colliders
        this.platformCollider = this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

    }

    update() {
        if (!this.player || !this.player.body) {
            return;
        }

        // Pergerakan horizontal
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.setFlipX(false); // Mengubah tampilan pemain menjadi menghadap kiri
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.setFlipX(true); // Mengubah tampilan pemain menjadi menghadap kanan
        }
        else {
            this.player.setVelocityX(0);
        }

        // Melompat menggunakan anak panah ke atas
        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-265);
            this.platformCollider.active = true;
            this.canDropThrough = true; //Lompatan standar
        }

        // Turun melewati platform
        if (this.cursors.down.isDown && this.player.body.touching.down) {
            // Nonaktifkan collider antara player dan platform
            this.platformCollider.active = true;
            this.canDropThrough = false;

            // Berikan sedikit dorongan ke bawah
            this.player.setVelocityY(20);

            // Aktifkan kembali collider setelah 300ms
            this.time.delayedCall(300, () => {
                this.platformCollider.active = true;

                // Izinkan pemain turun lagi setelah 500ms
                this.time.delayedCall(200, () => {
                    this.canDropThrough = true;
                }, [], this);

            }, [], this);
        }
    }

    collectStar(player, star) {
        star.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        // Simpan skor dalam registry agar bisa diakses oleh scene lain
        this.registry.set('score', this.score);

        if (this.stars.countActive(true) === 0) {
            // Jika semua bintang sudah dikumpulkan, tampilkan scene kemenangan
            this.showWinScene();
        }
    }
    
    showWinScene() {
        // Menampilkan efek sebelum pindah ke scene kemenangan
        this.cameras.main.fadeOut(1000, 255, 255, 255);
        
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            // Pindah ke scene kemenangan
            this.scene.start('sceneWin');
        });
    }
}