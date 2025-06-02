class Level extends Phaser.Scene {
    constructor() {
        super({ key: 'level' });
        this.fontLoaded = false;
    }

    preload() {
        // Memuat gambar latar belakang, platform, dan bintang
        this.load.image('background2', 'assets/bg2.jpeg');
        this.load.image('back', 'assets/back.png');
        this.load.image('levelpemain', 'assets/level.png');
        this.load.audio("musicButton", 'assets/audio/fx_touch.mp3'); // bukan 'musicOn'
        this.load.audio("musicClick", 'assets/audio/buttonClick.mp3'); // bukan 'musicOn'
    }

    create() {
        // localStorage.clear();

        // Cek sound state saat scene dimulai
        this.checkSoundState();
        
        // Event listener untuk perubahan sound state
        this.game.registry.events.on('soundStateChanged', this.onSoundStateChanged, this);

        // Atur gambar di tengah koordinat
        var background = this.add.image(400, 300, 'background2');
        // Untuk menutupi seluruh layar (cover mode)
        let scaleX = this.cameras.main.width / background.width;
        let scaleY = this.cameras.main.height / background.height;
        let scale = Math.max(scaleX, scaleY); // Gunakan max bukan min untuk menutupi seluruh area
        background.setScale(scale);

        // Buat elemen teks tersembunyi untuk memicu loading font
        const hiddenText = this.add.text(0, 0, 'Loading Font...', {
            fontFamily: 'SuperShiny',
            fontSize: '10px'
        });
        hiddenText.setVisible(false);

        // Ambil musicButton global yang sedang berjalan dari sceneMenu
        this.musicButton = this.game.registry.get('global_musicButton');
        this.musicClick = this.sound.add('musicClick');

        // Jika tidak ada, buat baru (fallback)
        if (!this.musicButton) {
            this.musicButton = this.sound.add('musicButton');
        }

        // Gunakan timer untuk memastikan font sudah dimuat
        this.time.delayedCall(500, this.createGameTitle, [], this);
    }

    // Method untuk cek dan set sound state
    checkSoundState() {
        const soundEnabled = this.game.registry.get('soundEnabled');
        if (soundEnabled !== undefined) {
            if (soundEnabled) {
                this.sound.volume = 1;
            } else {
                this.sound.volume = 0;
            }
        }
    }

    // Method yang dipanggil ketika sound state berubah
    onSoundStateChanged(enabled) {
        if (enabled) {
            this.sound.volume = 1;
            console.log('Level scene: Sound enabled');
        } else {
            this.sound.volume = 0;
            console.log('Level scene: Sound disabled');
        }
    }

    // Method untuk play sound dengan cek state
    playSound(sound) {
        if (this.game.registry.get('soundEnabled') && sound) {
            sound.play();
        }
    }

    createGameTitle() {
        // Ambil level yang sudah dibuka dari localStorage (default ke 1)
        let unlockedLevel = parseInt(localStorage.getItem('unlockedLevel')) || 1;

        // Log untuk debug
        console.log('Unlocked level:', unlockedLevel);

        // Judul game
        let judulGame = this.add.text(this.game.config.width / 2, 50, 'Level', {
            fontFamily: 'SuperShiny',
            fontSize: '80px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 6,
        });
        judulGame.setOrigin(0.5, 0);

        // Tombol kembali
        let buttonplay = this.add.image(100, 40, 'back');
        buttonplay.setScale(0.4);
        buttonplay.setInteractive({ useHandCursor: true });
        buttonplay.on('pointerover', () => {
            this.tweens.add({
                targets: buttonplay,
                scale: 0.45,
                duration: 100,
                ease: 'Power2'
            });
        });

        buttonplay.on('pointerout', () => {
            this.tweens.add({
                targets: buttonplay,
                scale: 0.4,
                duration: 100,
                ease: 'Power2'
            });
        });

        buttonplay.on('pointerdown', () => {
            // Gunakan playSound method yang sudah cek state
            this.playSound(this.musicClick);

            if (this.musicButton && this.musicButton.isPlaying) {
                this.musicButton.stop();
            }

            // Hapus juga dari game registry
            this.game.registry.remove('global_musicButton');

            this.tweens.add({
                targets: buttonplay,
                scale: 0.35,
                duration: 100,
                yoyo: true,
                ease: 'Power2',
                onComplete: () => {
                    this.cameras.main.fadeOut(800, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start('sceneMenu');
                    });
                }
            });
        });

        // Definisikan spacing yang lebih besar agar tombol tidak terlalu dekat
        const spacingX = 250; // Sebelumnya 200
        const spacingY = 250; // Sebelumnya 200
        const startXTop = this.game.config.width / 2 - spacingX;
        const startXBottom = this.game.config.width / 2 - spacingX / 2;
        const topY = 250;
        const bottomY = topY + spacingY;

        // Aktifkan ini untuk debugging
        const showHitboxes = false;

        // Untuk setiap level, buat tombol secara independen
        for (let i = 0; i < 5; i++) {
            // Tentukan posisi berdasarkan indeks
            let x, y;
            if (i < 3) {
                x = startXTop + i * spacingX;
                y = topY;
            } else {
                x = startXBottom + (i - 3) * spacingX;
                y = bottomY;
            }

            // Level saat ini
            const levelNum = i + 1;
            const isUnlocked = levelNum <= unlockedLevel;

            // Buat tombol level
            let levelButton = this.add.image(x, y, 'levelpemain').setScale(0.6);

            // Jika level terkunci, buat lebih gelap
            if (!isUnlocked) {
                levelButton.setTint(0x555555);
            }

            // Tambahkan teks level
            let levelText = this.add.text(x, y, `${levelNum}`, {
                fontFamily: 'SuperShiny',
                fontSize: '50px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
            }).setOrigin(0.5);

            // PENTING: Nonaktifkan interaksi pada teks agar tidak menghalangi klik
            levelText.input = null;

            // Hanya jika level terbuka, buat interaktif
            if (isUnlocked) {
                // Simpan angka level secara eksplisit sebagai properti
                levelButton.currentLevel = levelNum;

                // KUNCI SOLUSI: Gunakan input handler Phaser, bukan event pointer
                levelButton.setInteractive({ useHandCursor: true })
                    .on('pointerover', function () {
                        // Effect hover
                        this.setTint(0xdddddd);
                        console.log(`Hovering level ${this.currentLevel}`);
                    })
                    .on('pointerout', function () {
                        // Kembalikan ke normal
                        this.clearTint();
                    })
                    .on('pointerdown', function () {
                        const level = this.currentLevel;
                        const scene = this.scene;

                        // Gunakan playSound method yang sudah cek state
                        scene.playSound(scene.musicClick);

                        console.log(`Level ${level} button clicked!`);

                        // Animasi feedback
                        scene.tweens.add({
                            targets: this,
                            scale: 0.75,
                            duration: 100,
                            yoyo: true,
                            ease: 'Power2',
                            onComplete: () => {
                                // Simpan level saat ini
                                localStorage.setItem('currentLevel', level);
                                scene.registry.set('currentLevel', level);

                                // Konfirmasi level yang akan dibuka
                                console.log(`Opening level ${level}`);

                                // Transisi
                                scene.cameras.main.fadeOut(500, 0, 0, 0);
                                scene.cameras.main.once('camerafadeoutcomplete', () => {
                                    scene.scene.start(`level${level}`);
                                });
                            }
                        });
                    });

                // Debug: tampilkan area klik jika diperlukan
                if (showHitboxes) {
                    // Dapatkan dimensi tombol
                    const buttonWidth = levelButton.displayWidth;
                    const buttonHeight = levelButton.displayHeight;

                    // Buat grafik untuk menunjukkan hitbox
                    const hitboxGraphic = this.add.graphics();
                    hitboxGraphic.lineStyle(2, 0xff0000);
                    hitboxGraphic.strokeRect(
                        x - buttonWidth / 2,
                        y - buttonHeight / 2,
                        buttonWidth,
                        buttonHeight
                    );

                    // Tambahkan teks debug
                    this.add.text(x, y + buttonHeight / 2 + 10, `Level ${levelNum}`, {
                        fontSize: '14px',
                        color: '#ff0000'
                    }).setOrigin(0.5, 0);
                }
            }
        }
    }

    // Cleanup saat scene berakhir
    destroy() {
        this.game.registry.events.off('soundStateChanged', this.onSoundStateChanged, this);
        super.destroy();
    }
}