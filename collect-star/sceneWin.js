class SceneWin extends Phaser.Scene {
    constructor() {
        super({ key: 'sceneWin' }); // Pastikan key sesuai dengan yang dipanggil di Game.js
        this.fontLoaded = false;
    }

    preload() {
        // Memuat gambar latar belakang
        this.load.image('background3', 'assets/bg3.jpeg');
        this.load.image('buttonmenu', 'assets/buttonhome.png');
        this.load.image('buttonlanjut', 'assets/buttonlanjut.png');
        this.load.image('panel', 'assets/panelskor.png');
        this.load.audio('soundWin', 'assets/audio/win.wav');
    }

    create() {

        // localStorage.clear();
        this.sound.stopAll();
        // Cek sound state saat scene dimulai
        this.checkSoundState();
        // Event listener untuk perubahan sound state
        this.game.registry.events.on('soundStateChanged', this.onSoundStateChanged, this);

        // Dapatkan level saat ini dari registry atau localStorage
        const currentLevel = parseInt(localStorage.getItem('currentLevel')) || this.registry.get('currentLevel') || 1;

        // PENTING: Update unlockedLevel di localStorage setiap kali pemain menyelesaikan level
        // Dapatkan level terbuka tertinggi dari localStorage
        let unlockedLevel = parseInt(localStorage.getItem('unlockedLevel')) || 1;

        // Jika level yang baru saja diselesaikan membuka level baru, update unlockedLevel
        if (currentLevel >= unlockedLevel) {
            // Buka level berikutnya
            localStorage.setItem('unlockedLevel', currentLevel + 1);
            console.log('Unlocked level updated to:', currentLevel + 1);
        }

        // Atur gambar di tengah koordinat
        var background = this.add.image(400, 300, 'background3');
        // Untuk menutupi seluruh layar (cover mode)
        let scaleX = this.cameras.main.width / background.width;
        let scaleY = this.cameras.main.height / background.height;
        let scale = Math.max(scaleX, scaleY); // Gunakan max bukan min untuk menutupi seluruh area
        background.setScale(scale);

         this.soundWin = this.sound.add('soundWin', { loop: true, volume: 1 });
        if (this.game.registry.get('soundEnabled')) {
            this.soundWin.play();
        }
        // Tambahkan text kemenangan
        document.fonts.load('10pt "SuperPixel"').then(() => {
            const winText = this.add.text(400, 150, 'Level Complete!', {
                fontFamily: 'SuperPixel',
                fontSize: '50px',
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
        const score = this.registry.get('score') || 0;
        const scoreText = this.add.text(panel.x, panel.y, 'Star : ' + score, {
            fontFamily: 'SuperShiny',
            fontSize: '40px',
            color: '#000000',
            stroke: '#ffffff',
        });
        scoreText.setOrigin(0.6);

        let buttonlanjut = this.add.image(500, 450, 'buttonlanjut');
        buttonlanjut.setScale(0.4);

        let buttonplay = this.add.image(300, 450, 'buttonmenu');
        buttonplay.setScale(0.4);

        buttonlanjut.setOrigin(0.5);
        buttonlanjut.setInteractive({ useHandCursor: true });

        // Efek hover
        buttonlanjut.on('pointerover', () => {
            this.tweens.add({
                targets: buttonlanjut,
                scale: 0.45, // Lebih besar dari 0.4
                duration: 100,
                ease: 'Power2'
            });
        });
        buttonlanjut.on('pointerout', () => {
            this.tweens.add({
                targets: buttonlanjut,
                scale: 0.4,
                duration: 100,
                ease: 'Power2'
            });
        });

        // Klik untuk lanjut ke level berikutnya
        buttonlanjut.on('pointerdown', () => {
            this.tweens.add({
                targets: buttonlanjut,
                scale: 0.38,
                duration: 50,
                yoyo: true,
                ease: 'Power1',
                onComplete: () => {
                    // Hentikan soundWin
                    this.soundWin.stop();

                    // Ambil dan mainkan musicButton dari game registry (sound dari sceneMenu)
                // Play musicButton dengan cek sound state
                    const musicButton = this.game.registry.get('global_musicButton');
                    this.playSound(musicButton);

                    const currentLevel = parseInt(localStorage.getItem('currentLevel')) || this.registry.get('currentLevel') || 1;
                    const nextLevel = currentLevel + 1;
                    const maxLevel = 5;

                    // Simpan level selanjutnya
                    this.registry.set('currentLevel', nextLevel);
                    localStorage.setItem('currentLevel', nextLevel);

                    if (nextLevel > maxLevel) {
                        this.scene.start('level'); // kembali ke menu level
                    } else {
                        this.scene.start('level' + nextLevel);
                    }
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
                    // Hentikan soundWin
                    this.soundWin.stop();

                    // Ambil dan mainkan musicButton dari game registry (sound dari sceneMenu)
            // Play musicButton dengan cek sound state
                    const musicButton = this.game.registry.get('global_musicButton');
                    this.playSound(musicButton);

                    // Transisi ke scene level (menu level)
                    this.scene.start('level');
                }
            });
        });

        this.events.on('shutdown', () => {
            if (this.soundWin && this.soundWin.isPlaying) {
                this.soundWin.stop();
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