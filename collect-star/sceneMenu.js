class sceneMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'sceneMenu' });
        this.fontLoaded = false;
    }

    preload() {
        this.load.image('bg', 'assets/bg1.jpeg');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('fairy', 'assets/fairy.png');
        this.load.image('ButtonPlay', 'assets/buttonplay.png');
        this.load.image('buttonOn', 'assets/buttonOn.png');
        this.load.image('buttonOff', 'assets/buttonOff.png');
        this.load.audio('musicMenu', 'assets/audio/music_menu.mp3');
        this.load.audio('musicButton', 'assets/audio/button.m4a');
        this.load.audio('musicOn', 'assets/audio/fx_touch.mp3');
    }

    create() {
        // Inisialisasi global sound state jika belum ada
        if (!this.game.registry.has('soundEnabled')) {
            this.game.registry.set('soundEnabled', true);
        }

        // Background full screen
        const background = this.add.image(400, 300, 'bg');
        const scaleX = this.cameras.main.width / background.width;
        const scaleY = this.cameras.main.height / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);

        // Sound - buat global sound yang dapat diakses lintas scene
        // Cek apakah musicButton sudah ada di game registry
        if (!this.game.registry.get('global_musicButton')) {
            this.musicButton = this.sound.add('musicButton', { 
                loop: false, 
                volume: 1 
            });
            // Simpan ke game registry agar bisa diakses lintas scene
            this.game.registry.set('global_musicButton', this.musicButton);
        } else {
            // Jika sudah ada, ambil dari registry
            this.musicButton = this.game.registry.get('global_musicButton');
        }

        this.musicOn = this.sound.add('musicOn');
        
        // Cek apakah menu music sudah ada
        if (!this.menuMusic || !this.menuMusic.isPlaying) {
            this.menuMusic = this.sound.add('musicMenu', { loop: true, volume: 1 });
            // Hanya play jika sound enabled
            if (this.game.registry.get('soundEnabled')) {
                this.menuMusic.play({ seek: 6 });
            }
        }

        // Tombol Musik
        const buttonOn = this.add.image(680, 500, 'buttonOn').setScale(0.3);
        const buttonOff = this.add.image(680, 500, 'buttonOff').setScale(0.3);
        
        // Set initial visibility berdasarkan sound state
        const soundEnabled = this.game.registry.get('soundEnabled');
        buttonOn.setVisible(soundEnabled);
        buttonOff.setVisible(!soundEnabled);

        buttonOn.setInteractive({ useHandCursor: true });
        buttonOff.setInteractive({ useHandCursor: true });

        // Hover efek untuk buttonOn
        buttonOn.on('pointerover', () => {
            this.tweens.add({ targets: buttonOn, scale: 0.35, duration: 100 });
        });
        buttonOn.on('pointerout', () => {
            this.tweens.add({ targets: buttonOn, scale: 0.3, duration: 100 });
        });
        buttonOn.on('pointerdown', () => {
            this.tweens.add({
                targets: buttonOn,
                scale: 0.25,
                duration: 100,
                yoyo: true,
                ease: 'Power2',
                onComplete: () => {
                    // Play sound effect jika enabled
                    if (this.game.registry.get('soundEnabled')) {
                        this.musicOn.play();
                    }
                    
                    // Disable sound globally
                    this.game.registry.set('soundEnabled', false);
                    this.toggleAllSounds(false);
                    // Emit event untuk memberi tahu scene lain
                    this.game.registry.events.emit('soundStateChanged', false);
                    
                    buttonOn.setVisible(false);
                    buttonOff.setVisible(true);
                }
            });
        });

        // Hover efek untuk buttonOff
        buttonOff.on('pointerover', () => {
            this.tweens.add({ targets: buttonOff, scale: 0.35, duration: 100 });
        });
        buttonOff.on('pointerout', () => {
            this.tweens.add({ targets: buttonOff, scale: 0.3, duration: 100 });
        });
        buttonOff.on('pointerdown', () => {
            this.tweens.add({
                targets: buttonOff,
                scale: 0.25,
                duration: 100,
                yoyo: true,
                ease: 'Power2',
                onComplete: () => {
                    // Enable sound globally
                    this.game.registry.set('soundEnabled', true);
                    this.toggleAllSounds(true);
                    // Emit event untuk memberi tahu scene lain
                    this.game.registry.events.emit('soundStateChanged', true);
                    
                    // Play sound effect setelah enable
                    this.musicOn.play();
                    
                    buttonOn.setVisible(true);
                    buttonOff.setVisible(false);
                }
            });
        });

        // Trigger font load (SuperShiny)
        const hiddenText = this.add.text(0, 0, 'Loading Font...', {
            fontFamily: 'SuperShiny',
            fontSize: '10px'
        });
        hiddenText.setVisible(false);

        // Delay untuk memastikan font dimuat
        this.time.delayedCall(500, this.createGameTitle, [], this);
    }

    // Method untuk mengontrol semua sound di scene ini
    toggleAllSounds(enabled) {
        if (enabled) {
            // Resume semua sound di scene ini
            if (this.menuMusic && !this.menuMusic.isPlaying) {
                this.menuMusic.play();
            }
            // Set volume normal
            this.sound.volume = 1;
        } else {
            // Pause/stop semua sound di scene ini
            if (this.menuMusic && this.menuMusic.isPlaying) {
                this.menuMusic.pause();
            }
            // Set volume ke 0 untuk memastikan tidak ada sound
            this.sound.volume = 0;
        }
    }

    createGameTitle() {
        // Judul Game
        const judulGame = this.add.text(this.game.config.width / 2, 50, 'FANTASTIC GAME', {
            fontFamily: 'SuperShiny',
            fontSize: '80px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 6,
        });
        judulGame.setOrigin(0.5, 0);

        // Gambar peri
        const fairy = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'fairy');
        fairy.setScale(0.4);

        // Animasi naik-turun & kiri-kanan
        this.tweens.add({
            targets: fairy,
            y: fairy.y - 20,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: fairy,
            x: fairy.x + 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Tombol Play
        const buttonplay = this.add.image(this.game.config.width / 2, 500, 'ButtonPlay');
        buttonplay.setScale(0.4);
        buttonplay.setInteractive({ useHandCursor: true });

        buttonplay.on('pointerover', () => {
            this.tweens.add({ targets: buttonplay, scale: 0.45, duration: 100 });
        });

        buttonplay.on('pointerout', () => {
            this.tweens.add({ targets: buttonplay, scale: 0.4, duration: 100 });
        });

        buttonplay.on('pointerdown', () => {
            // Mainkan musicButton hanya jika sound enabled
            if (this.game.registry.get('soundEnabled')) {
                this.musicButton.play();
            }
            
            this.tweens.add({
                targets: buttonplay,
                scale: 0.35,
                duration: 100,
                yoyo: true,
                ease: 'Power2',
                onComplete: () => {
                    this.cameras.main.fadeOut(800, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        if (this.menuMusic) {
                            this.menuMusic.stop();
                        }
                        this.scene.start('level');
                    });
                }
            });
        });
    }
}