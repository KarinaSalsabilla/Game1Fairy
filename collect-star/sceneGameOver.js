class SceneGameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'sceneGameOver' });
        this.fontLoaded = false;
    }

    preload() {
        // Memuat gambar latar belakang
        this.load.image('background7', 'assets/bg5.png');
        this.load.image('buttonmenu', 'assets/buttonhome.png');
        this.load.image('buttonUlang', 'assets/buttonulang.png');
        this.load.image('panel', 'assets/panelskor.png');
        this.load.audio('losemusic', 'assets/audio/lose.wav');
    }

    create() {
        this.sound.stopAll();

        // Cek sound state saat scene dimulai
        this.checkSoundState();
        // Event listener untuk perubahan sound state
        this.game.registry.events.on('soundStateChanged', this.onSoundStateChanged, this);

        // Debug: Log untuk memastikan scene berhasil dimuat
        console.log('SceneGameOver created');

        // Atur gambar di tengah koordinat
        var background = this.add.image(400, 300, 'background7');
        // Untuk menutupi seluruh layar (cover mode)
        let scaleX = this.cameras.main.width / background.width;
        let scaleY = this.cameras.main.height / background.height;
        let scale = Math.max(scaleX, scaleY); // Gunakan max bukan min untuk menutupi seluruh area
        background.setScale(scale);

        // Sound lose dengan cek state
        this.soundlose = this.sound.add('losemusic', { loop: true, volume: 1 });
        if (this.game.registry.get('soundEnabled')) {
            this.soundlose.play();
        }

        // Tambahkan text kemenangan
        document.fonts.load('10pt "SuperPixel"').then(() => {
            const winText = this.add.text(400, 150, 'Game Over!', {
                fontFamily: 'SuperPixel',
                fontSize: '80px',
                color: '#000000',
                stroke: '#ffffff',
                strokeThickness: 3,
            });
            winText.setOrigin(0.5);
            winText.setShadow(3, 3, '#000000', 5);
        });

        const panel = this.add.image(400, 300, 'panel');
        panel.setOrigin(0.5);
        panel.setScale(0.6);

        // Tampilkan score
        const score = this.registry.get('finalScore') || 0; // Gunakan finalScore untuk konsistensi
        const scoreText = this.add.text(panel.x, panel.y, 'Star : ' + score, {
            fontFamily: 'SuperShiny',
            fontSize: '40px',
            color: '#000000',
            stroke: '#ffffff',
        });
        scoreText.setOrigin(0.6);

        let ButtonUlang = this.add.image(500, 450, 'buttonUlang');
        ButtonUlang.setScale(0.4);

        let buttonplay = this.add.image(300, 450, 'buttonmenu');
        buttonplay.setScale(0.4);

        ButtonUlang.setOrigin(0.5);
        ButtonUlang.setInteractive({ useHandCursor: true });

        // Efek hover
        ButtonUlang.on('pointerover', () => {
            this.tweens.add({
                targets: ButtonUlang,
                scale: 0.45, // Lebih besar dari 0.4
                duration: 100,
                ease: 'Power2'
            });
        });
        ButtonUlang.on('pointerout', () => {
            this.tweens.add({
                targets: ButtonUlang,
                scale: 0.4,
                duration: 100,
                ease: 'Power2'
            });
        });

        // Klik untuk lanjut ke level berikutnya (PERBAIKAN)
        ButtonUlang.on('pointerdown', () => {
            this.tweens.add({
                targets: ButtonUlang,
                scale: 0.38,
                duration: 50,
                yoyo: true,
                ease: 'Power1',
                onComplete: () => {
                    this.soundlose.stop();

                    // Play musicButton dengan cek sound state
                    const musicButton = this.game.registry.get('global_musicButton');
                    this.playSound(musicButton);

                    console.log('Restart button clicked, restarting level');

                    // Reset game state sebelum memulai level baru
                    this.resetGameState();

                    // Menggunakan registry yang benar atau default ke level 2
                    const currentLevel = this.registry.get('lastLevel') || 2;
                    console.log('Restarting level:', currentLevel);

                    // Pastikan input keyboard di-reset
                    this.input.keyboard.resetKeys();

                    // Lakukan transisi dengan fade
                    this.cameras.main.fadeOut(500, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                        // Restart scene level
                        this.scene.start('level' + currentLevel);
                    });
                }
            });
        });

        // BUTTON ANIMASII
        buttonplay.setOrigin(0.5);
        buttonplay.setInteractive({ useHandCursor: true });

        // Efek hover
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

        // Klik untuk kembali ke menu level
        buttonplay.on('pointerdown', () => {
            this.tweens.add({
                targets: buttonplay,
                scale: 0.38,
                duration: 50,
                yoyo: true,
                ease: 'Power1',
                onComplete: () => {
                    this.soundlose.stop();

                    // Play musicButton dengan cek sound state
                    const musicButton = this.game.registry.get('global_musicButton');
                    this.playSound(musicButton);

                    console.log('Menu button clicked, returning to level menu');

                    // Reset game state sebelum kembali ke menu
                    this.resetGameState();

                    // Pastikan input keyboard di-reset
                    this.input.keyboard.resetKeys();

                    // Transisi ke scene level (menu level)
                    this.cameras.main.fadeOut(500, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                        this.scene.start('level');
                    });
                }
            });
        });

        this.events.on('shutdown', () => {
            if (this.soundlose && this.soundlose.isPlaying) {
                this.soundlose.stop();
            }
        });
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
            // Resume lose music jika ada dan sedang tidak playing
            if (this.soundlose && !this.soundlose.isPlaying) {
                this.soundlose.resume();
            }
            console.log('GameOver scene: Sound enabled');
        } else {
            this.sound.volume = 0;
            // Pause lose music jika ada dan sedang playing
            if (this.soundlose && this.soundlose.isPlaying) {
                this.soundlose.pause();
            }
            console.log('GameOver scene: Sound disabled');
        }
    }

    // Method untuk play sound dengan cek state
    playSound(sound) {
        if (this.game.registry.get('soundEnabled') && sound) {
            sound.play();
        }
    }

    // Fungsi untuk mereset state game
    resetGameState() {
        // Reset skor untuk permainan baru
        this.registry.set('score', 0);

        // Reset flag lain yang mungkin diperlukan
        this.registry.set('gameActive', true);
    }

    // Cleanup saat scene berakhir
    destroy() {
        this.game.registry.events.off('soundStateChanged', this.onSoundStateChanged, this);
        super.destroy();
    }
}