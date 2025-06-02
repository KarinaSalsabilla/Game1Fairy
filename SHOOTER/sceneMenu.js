var sceneMenu = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function () {
            Phaser.Scene.call(this, { key: 'sceneMenu' });
        },
    init: function () { },
    preload: function () {
        this.load.image("BGPlay", "assets/BGPlay.png");
        this.load.image("Title", "assets/Title.png");
        this.load.image("ButtonPlay", "assets/ButtonPlay.png");
        this.load.image("ButtonSoundOn", "assets/ButtonSoundOn.png");
        this.load.image("ButtonSoundOff", "assets/ButtonSoundOff.png");
        this.load.image("ButtonMusicOn", "assets/ButtonMusicOn.png");
        this.load.image("ButtonMusicOff", "assets/ButtonMusicOff.png");
        this.load.audio("snd_menu", "assets/music_menu.mp3");
        this.load.audio("snd_touchshooter", "assets/fx_touch.mp3");
        this.load.image("Cloud", "assets/cloud.png");

    },
    create: function () {

        var snd_menu = null;
        //melakukan pengisian nilai untuk variabel global
        X_POSITION = {
            "LEFT": 0,
            "CENTER": game.canvas.width / 2,
            "RIGHT": game.canvas.width,
        };
        Y_POSITION = {
            "TOP": 0,
            "CENTER": game.canvas.height / 2,
            "BOTTOM": game.canvas.height,
        };


        if (snd_touch == null) {
            //jika nilai dari variabel 'snd_touch' masih 'null' maka 
            //akan dilakukan pengisian ulang nilai variabel dengan 
            //nilai sound yang sesunggguhnya,yakni aset sound
            //dengan nama 'snd_touchshooter'
            snd_touch = this.sound.add("snd_touchshooter");
        }


        //membuat tampilan
        //menambahkan backdrop
        this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, 'BGPlay');
        //menambahkan judul game
        var titleGame = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER - 150, 'Title');
        //menambahkan tombol play

        var buttonPlay = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER + 150, "ButtonPlay");
        //menjadikan tombol play bisa dikenai interaksi (klik, hover mouse)
        buttonPlay.setInteractive();

        //menambahkan tombol ON ke tampilan Menu
        var buttonSound = this.add.image(X_POSITION.RIGHT - 70, Y_POSITION.BOTTOM - 70, "ButtonSoundOn");
        buttonSound.setInteractive();

        //mengambil data dari database dengan key 'sound_enabled' lalu
        //menampungnya di dalam variabel 'soundState'
        let soundState = localStorage['sound_enabled'] || 1;
        //mengecek nilai yang ditampung dari variabel 'soundState'
        if (soundState == 0) {
            //jika nilai dari soundState adalah 0
            //semua kode program di bawah ini akan dijalankan
            //mengubah tampilan dari tombol sound dari tampilan
            //On menjadi tampilan Off
            buttonSound.setTexture("ButtonSoundOff");
            //mengubah volume dari sound snd_touch menjadi 0
            //jika tampilan tombol sound adalah off
            snd_touch.setVolume(0);
        }



        //menambahkan deteksi input klik mouse dan pergerakan pada mouse
        this.input.on('gameobjectover', function (pointer, gameObject) {
            //melakukan cek jika game objek yang sedang terkena
            //deteksi listener 'gameobjectover' adalah buttonPlay
            if (gameObject == buttonPlay) {
                buttonPlay.setTint(0x999999);
            }
            if (gameObject == buttonSound) {
                buttonSound.setTint(0x999999);
            }

        }, this);


        this.input.on('gameobjectout', function (pointer, gameObject) {
            //melakukan cek jika game objek yang sedang terkena
            //deteksi listener 'gameobjectup' adalah buttonPlay
            if (gameObject == buttonPlay) {
                buttonPlay.setTint(0xffffff);
            }
            if (gameObject == buttonSound) {
                buttonSound.setTint(0xffffff);
            }

        }, this);

        this.input.on('gameobjectdown', function (pointer, gameObject) {
            //melakukan cek jika game objek yang sedang terkena
            //deteksi listener 'gameobjectdown' adalah buttonPlay
            if (gameObject == buttonSound) {
                buttonSound.setTint(0x999999);
            }

        }, this);

        this.input.on('gameobjectup', (pointer, gameObject) => {
            if (gameObject == buttonPlay) {

                buttonPlay.setTint(0xffffff);
                snd_touch.play(); // efek suara

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
                        if (snd_menu) {
                            snd_menu.stop();
                        }
                        this.scene.start("scenePilihHero");
                    }
                });

            }

            if (gameObject == buttonSound) {
                //mengambil data dari database dengan key 'sound_enabled' lalu
                //menampungnya di dalam variabel 'soundState'
                let isSoundActive = localStorage['sound_enabled'] || 1;
                //mengecek nilai yang ditampung dari variabel 'soundState'
                if (isSoundActive == 0) {
                    //jika nilai dari soundState adalah 1
                    //semua kode program di bawah ini akan dijalankan
                    //mengubah tampilan dari tombol sound dari tampilan
                    //On menjadi tampilan Off
                    buttonSound.setTexture("ButtonSoundOn");
                    //mengubah volume dari sound snd_touch menjadi 0
                    //jika tampilan tombol sound adalah off
                    snd_touch.setVolume(1);
                    // Mengubah volume dari sound snd_menu juga
                    if (snd_menu) {
                        snd_menu.setVolume(1);
                    }
                    localStorage['sound_enabled'] = 1;
                }
                else {
                    //jika nilai dari soundState adalah 0
                    //semua kode program di bawah ini akan dijalankan
                    //mengubah tampilan dari tombol sound dari tampilan
                    //Off menjadi tampilan On
                    buttonSound.setTexture("ButtonSoundOff");
                    //mengubah volume dari sound snd_touch menjadi 1
                    //jika tampilan tombol sound adalah on
                    snd_touch.setVolume(0);
                    // Mengubah volume dari sound snd_menu juga
                    if (snd_menu) {
                        snd_menu.setVolume(0);
                    }
                    localStorage['sound_enabled'] = 0;
                }
                //mengubah warna dari tombol sound menjadi warna putih
                buttonSound.setTint(0xffffff);
                snd_touch.play(); //memanggil sound efek saat tombol play ditekan
            }

        }, this);

        if (snd_menu == null) {
            snd_menu = this.sound.add("snd_menu", {
                loop: true // supaya musik mengulang terus
            });

            // Memainkan musik dan mengatur volume sesuai dengan pengaturan sound
            let isSoundActive = localStorage['sound_enabled'] || 1;
            snd_menu.play();

            // Mengatur volume awal musik berdasarkan pengaturan sound
            if (isSoundActive == 0) {
                snd_menu.setVolume(0);
            } else {
                snd_menu.setVolume(1);
            }
        }

    },
    update: function () {

    },
});