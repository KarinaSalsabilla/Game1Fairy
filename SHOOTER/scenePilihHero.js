var scenePilihHero = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { key: "scenePilihHero" });
    },
    init: function () { },
    preload: function () {
        ;
        this.load.image("BGPilihPesawat", "assets/BGPilihPesawat.png");
        this.load.image("ButtonMenu", "assets/ButtonMenu.png");
        this.load.image("ButtonNext", "assets/ButtonNext.png");
        this.load.image("ButtonPrev", "assets/ButtonPrev.png");
        this.load.image("Pesawat1", "assets/Pesawat1.png");
        this.load.image("Pesawat2", "assets/Pesawat2.png");
        this.load.image("Cloud", "assets/cloud.png");
        this.load.audio("snd_pilihHero", "assets/pilihHero.mp3");

    },
    create: function () {

        // Awalnya awan menutupi layar
        let cloud = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "Cloud");
        cloud.setScale(2); // Sama seperti saat transisi keluar
        cloud.setAlpha(1);
        cloud.setDepth(100); // Pastikan di atas segalanya

        // Fade out untuk membuka scene
        this.tweens.add({
            targets: cloud,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                cloud.destroy(); // Hapus awan setelah selesai
            }
        });

        // menambahkan backdrop atau latar untuk scene pilih pesawat hero
        this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, "BGPilihPesawat");

        // memutar musik background scene pilih hero
        this.bgmPilihHero = this.sound.add("snd_pilihHero", { loop: true });
        let isSoundActive = localStorage['sound_enabled'] || 1;
        this.bgmPilihHero.setVolume(isSoundActive == 1 ? 1 : 0);
        this.bgmPilihHero.play();

        // menambahkan tombol menu
        var buttonMenu = this.add.image(50, 50, "ButtonMenu");
        // menambahkan tombol next
        var buttonNext = this.add.image(X_POSITION.CENTER + 250, Y_POSITION.CENTER, "ButtonNext");
        // menambahkan tombol prev
        var buttonPrevious = this.add.image(X_POSITION.CENTER - 250, Y_POSITION.CENTER, "ButtonPrev");
        // menambahkan pesawat hero berdasarkan dengan hero yang sedang aktif
        var heroShip = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, "Pesawat" + (currentHero + 1));

        // membuat tombol menu bisa dikenal interaksi
        buttonMenu.setInteractive();
        buttonNext.setInteractive();
        buttonPrevious.setInteractive();
        heroShip.setInteractive();

        // event listener 'gameobjectover'
        this.input.on('gameobjectover', function (pointer, gameObject) {
            if (gameObject == buttonMenu) {
                buttonMenu.setTint(0x999999);
            }
            if (gameObject == buttonNext) {
                buttonNext.setTint(0x999999);
            }
            if (gameObject == buttonPrevious) {
                buttonPrevious.setTint(0x999999);
            }
            if (gameObject == heroShip) {
                heroShip.setTint(0x999999);
            }
        }, this);

        this.input.on('gameobjectdown', function (pointer, gameObject) {
            if (gameObject == buttonMenu) {
                buttonMenu.setTint(0x999999);
            }
            if (gameObject == buttonNext) {
                buttonNext.setTint(0x999999);
            }
            if (gameObject == buttonPrevious) {
                buttonPrevious.setTint(0x999999);
            }
            if (gameObject == heroShip) {
                heroShip.setTint(0x999999);
            }
        }, this);

        this.input.on('gameobjectout', function (pointer, gameObject) {
            if (gameObject == buttonMenu) {
                buttonMenu.setTint(0xffffff);
            }
            if (gameObject == buttonNext) {
                buttonNext.setTint(0xffffff);
            }
            if (gameObject == buttonPrevious) {
                buttonPrevious.setTint(0xffffff);
            }
            if (gameObject == heroShip) {
                heroShip.setTint(0xffffff);
            }
        }, this);

        this.input.on('gameobjectup', function (pointer, gameObject) {
            if (snd_touch) {
                let isSoundActive = localStorage['sound_enabled'] || 1;
                snd_touch.setVolume(isSoundActive == 1 ? 1 : 0);
            }

            if (gameObject == buttonMenu) {
                buttonMenu.setTint(0xffffff);
                snd_touch.play();

                // menghentikan musik pilih hero sebelum pindah scene
                // Tambahkan awan untuk transisi
                let cloud = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, "Cloud");
                cloud.setScale(2); // perbesar agar menutupi layar
                cloud.setAlpha(0); // awan awalnya transparan
                cloud.depth = 10; // pastikan di atas

                // Fade in awan, lalu pindah scene
                this.tweens.add({
                    targets: cloud,
                    alpha: 1,
                    duration: 1000,
                    onComplete: () => {
                        if (this.bgmPilihHero) {
                            this.bgmPilihHero.stop();
                        }
                        this.scene.start("sceneMenu");
                    }
                });
            }
            if (gameObject == buttonNext) {
                snd_touch.play();
                buttonNext.setTint(0xffffff);
                currentHero++;
                if (currentHero >= countHero) {
                    currentHero = 0;
                }
                heroShip.setTexture("Pesawat" + (currentHero + 1));
            }
            if (gameObject == buttonPrevious) {
                snd_touch.play();
                buttonPrevious.setTint(0xffffff);
                currentHero--;
                if (currentHero < 0) {
                    currentHero = (countHero - 1);
                }
                heroShip.setTexture("Pesawat" + (currentHero + 1));
            }

            if (gameObject == heroShip) {
                heroShip.setTint(0xffffff);
                snd_touch.play();

                // Tambahkan awan untuk transisi
                let cloud = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, "Cloud");
                cloud.setScale(2); // perbesar agar menutupi layar
                cloud.setAlpha(0); // awan awalnya transparan
                cloud.depth = 10; // pastikan di atas

                // Fade in awan, lalu pindah scene
                this.tweens.add({
                    targets: cloud,
                    alpha: 1,
                    duration: 1000,
                    onComplete: () => {
                        // menghentikan musik pilih hero sebelum pindah scene
                        if (this.bgmPilihHero) {
                            this.bgmPilihHero.stop();
                        }

                        this.scene.start("scenePlay");
                    }
                });

            }

        }, this);
    },

    update: function () { },

});
