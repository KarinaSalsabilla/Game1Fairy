var scenePlay = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { key: "scenePlay" });
    },
    init: function () {
        this.backgroundImages = [];
    },
    preload: function () {
        this.load.setBaseURL('assets/');
        this.load.image("background", "images/BG.png");
        this.load.image("background1", "images/bg1.jpeg");
        this.load.image("background2", "images/bg2.jpeg");
        this.load.image("background3", "images/bg3.jpeg");
        this.load.image("background4", "images/bg4.jpeg");
        this.load.image("background5", "images/bg5.jpeg");
        this.load.image("btn_play", "images/ButtonPlay.png");
        this.load.image("gameover", "images/GameOver.png");
        this.load.image("coin", "images/Koin.png");
        this.load.image("enemy1", "images/Musuh01.png");
        this.load.image("enemy2", "images/Musuh02.png");
        this.load.image("enemy3", "images/Musuh03.png");
        this.load.image("coin_panel", "images/PanelCoin.png");
        this.load.image("ground", "images/Tile50.png");
        this.load.audio("snd_coin", "audio/koin.mp3");
        this.load.audio("snd_lose", "audio/kalah.mp3");
        this.load.audio("snd_jump", "audio/lompat.mp3");
        this.load.audio("snd_leveling", "audio/ganti_level.mp3");
        this.load.audio("snd_walk", "audio/jalan.mp3");
        this.load.audio("snd_touch", "audio/touch.mp3");
        this.load.audio("music_play", "audio/music_play.mp3");
        this.load.spritesheet("char", "images/CharaSpriteAnim.png", {
            frameWidth: 44.8,
            frameHeight: 93
        });
    },

    create: function () {
        // Fungsi untuk mengatur background dengan scaling yang tepat
        const setBackgroundWithScale = (textureKey) => {
            // Hapus background sebelumnya jika ada
            if (this.backgroundImage) {
                this.backgroundImage.destroy();
            }

            // Dapatkan ukuran asli gambar
            const originalWidth = this.textures.get(textureKey).getSourceImage().width;
            const originalHeight = this.textures.get(textureKey).getSourceImage().height;

            // Hitung scaling untuk memenuhi layar sambil mempertahankan aspek rasio
            const scaleX = this.game.config.width / originalWidth;
            const scaleY = this.game.config.height / originalHeight;
            const scale = Math.max(scaleX, scaleY);

            // Buat background baru
            this.backgroundImage = this.add.image(
                this.game.config.width / 2,
                this.game.config.height / 2,
                textureKey
            )
                .setScale(scale)
                .setOrigin(0.5)
                .setDepth(-1); // Pastikan background berada di belakang elemen lain

            return this.backgroundImage;
        };
        //variabel yang digunakan sebagai penentu
        //level yang sedang aktif sekaligus
        //mengisikannya dengan nilai "1"
        this.currentLevel = 1; // Ubah menjadi properti this agar bisa diakses dari fungsi lain

        //variabel utuk menentukan apabila game sudah dimulai atau belum
        this.gameStarted = false;

        // sound efek
        //menampung sound yang nanti dibunyikan ketika karakter menabrak koin
        this.snd_coin = this.sound.add('snd_coin');
        //menampung sound yang nanti dibunyikan ketika karakter melompat
        this.snd_jump = this.sound.add('snd_jump');
        //menampung sound yang nanti dibunyikan ketika terjadi pergantian level
        this.snd_leveling = this.sound.add('snd_leveling');
        //menampung sound yang nanti dibunyikan ketika karakter menabrak musuh
        this.snd_lose = this.sound.add('snd_lose');
        //menampung sound yang nanti dibunyikan ketika ada tombol yang ditekan
        this.snd_touch = this.sound.add("snd_touch");
        //melakukan inialisasi pada variabel pembantu

        //sound karakter berjalan
        //menampung sound yang nanti dibunyikan ketika karakter bergerak
        this.snd_walk = this.sound.add("snd_walk");
        //membuat sound supaya bisa dimainkan secara terus menerus
        this.snd_walk.loop = true;
        //mengatur volume dari sound menjadi 0
        this.snd_walk.setVolume(0);
        //memainkan sound berjalan untuk pertama kali
        this.snd_walk.play();

        //musik
        //menampung musik yang nanti dibunyikan ketika tombol play ditekan
        this.music_play = this.sound.add('music_play');
        //membuat musik supaya bisa dimainkan secara terus menerus
        this.music_play.loop = true;

        let layoutSize = {
            'w': 1024, // Tambahkan ukuran layout yang diharapkan
            'h': 768
        };

        X_POSITION = {
            'LEFT': 0,
            'CENTER': this.game.canvas.width / 2,
            'RIGHT': this.game.canvas.width,
        }
        Y_POSITION = {
            'TOP': 0,
            'CENTER': this.game.canvas.height / 2,
            'BOTTOM': this.game.canvas.height,
        }
        relativeSize = {
            'w': ((this.game.canvas.width - layoutSize.w) / 2),
            'h': ((this.game.canvas.height - layoutSize.h) / 2),
        }

        //menampung scene yang sedang aktif
        //ke dalam variabel 'activeScene'
        var activeScene = this;

        // Menambahkan SATU background saja dulu, yang nanti akan diubah
        // Background default level 1
        this.backgroundImage = this.add.image(0, 0, "background1")
            .setOrigin(0) // posisi dari kiri atas
            .setDisplaySize(this.game.config.width, this.game.config.height); // skala ke layar


        //membuat tampilan koin
        //menambahkan panel koin
        var coinPanel = this.add.image(X_POSITION.CENTER, 30, 'coin_panel');
        coinPanel.setDepth(10);
        //menambahkan tampilan teks koin
        var coinText = this.add.text(X_POSITION.CENTER, 30, '0', {
            fontFamily: 'Verdana, Arial',
            fontSize: '37px',
            color: '#adadad',
        })
        coinText.setOrigin(0.5);
        coinText.setDepth(10);

        //membuat tampilan sebelum game dimulai
        //menambahkan lapisan gelap denan menggunakan objek rectangle
        //(sebuah persegi dengan posisi, ukuran dan warna tertentu)
        var darkenLayer = this.add.rectangle(X_POSITION.CENTER, Y_POSITION.CENTER, this.game.canvas.width, this.game.canvas.height, 0x000000, 0.5);
        darkenLayer.setDepth(10);
        //mengatur tingkatan transparansi dari lapisan gelap
        darkenLayer.alpha = 0.25;
        //menambahkan tampilan tombol play
        var buttonPlay = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, "btn_play");
        buttonPlay.setDepth(10);

        buttonPlay.setInteractive();
        buttonPlay.on('pointerdown', function (pointer) {
            this.setTint(0x5a5a5a);
        });
        buttonPlay.on('pointerup', function (pointer) {
            //memainkan sound efek
            activeScene.snd_touch.play();
            //memainkan musik
            activeScene.music_play.play();
            //mengubah tampilan agar jadi terang
            this.clearTint();

            //animasi untuk menghilangkan tampilan tombol Play
            //dengan mnegubah ukurannya menjadi 0 selama 250 ms
            activeScene.tweens.add({
                targets: this,
                ease: 'Back.In',
                duration: 250,
                scaleX: 0,
                scaleY: 0,
            });

            //animasi untuk menghilangkan tampilan lapisan gelap
            //dengan mengubah transparasinya menjadi 0 selama 250 ms
            //dengan jeda sebelum animasi 150 ms
            activeScene.tweens.add({
                delay: 150,
                targets: darkenLayer,
                duration: 250,
                alpha: 0,
                onComplete: function () {
                    //mengubah nilai variabel menjadi true
                    //sehingga status game terdeteksi sudah dimulai
                    activeScene.gameStarted = true;
                    //melanjutkan jeda sistem physics yang terjadi semua pergerakan yang terjadi karena physiscs
                    activeScene.physics.resume();
                }
            });
        });
        buttonPlay.on('pointerout', function (pointer) {
            this.clearTint();
        });

        //membuat variabel untuk menampung sprite yang nantinya akan diambil datanya
        let groundTemp = this.add.image(0, 0, 'ground').setVisible(false);
        //membuat variabel untuk menampung ukuran dari tiao gambar pijakan untuk nantinya digunakan membantu menentukan posisi2 dari tiap pijakan yang akan ditambahkan ke dalam game
        let groundSize = { 'width': groundTemp.width, 'height': groundTemp.height };

        //membuat group physics yang nantinya akan digunakan menampung pijakan pijakan yang tidak akan bisa bergerak
        this.platforms = this.physics.add.staticGroup(); // Ubah menjadi properti this agar bisa diakses dari fungsi lain

        //menambah sprite karakter dengan physics ke dalam game
        this.player = this.physics.add.sprite(100, 500, 'char');

        //menambahkan animasi berlari 'left'
        this.anims.create({
            //nama animasi lef
            key: 'left',
            //menentukan frame tampilan dari aset spritesheet bernama 'chara', dan dengan urutan binngkai gambar pertama sampai keempat
            frames: this.anims.generateFrameNumbers('char', { start: 0, end: 3 }),
            //menentukan perpindahan kecepatan tampilan dari bingkai 1 ke selanjutnya
            frameRate: 12,
            //menentukan animasi diulang terus-menerus (-1 untuk terus menerus)
            repeat: -1
        });

        //menambahkan animasi berlari dengan menghadap ke
        //arah kanan ke dalam game, dengan nama 'right'
        this.anims.create({
            //memberikan nama animasi dengan 'right'
            key: 'right',
            //menentukan frame tampilan dari aset spritesheet bernama 'chara',
            //dan dengan urutan bingkai gambar ke-enam sampai ke-sembilan
            frames: this.anims.generateFrameNumbers('char', { start: 5, end: 8 }),
            //menentukan kecepatan perpindahan tampilan dari bingai 1 ke selanjutnya
            frameRate: 12,
            //menentukan animasi diulang terus-menerus (-1 untuk terus-menerus)
            repeat: - 1
        });

        //menambahkan animasi menghadap ke arah depan ke
        //arah game, dengan nama animasi 'front'
        this.anims.create({
            //memberi nama animasi dengan 'front'
            key: 'front',
            //menentukan frame tampilan dari aset spritesheet bernama 'chara',
            //dan dengan urutan bingkai gambar ke 5 saja
            frames: [{ key: 'char', frame: 4 }],
            //menentukan kecepatan perpindahan tampilan dari bingkai 1 ke selanjutnya
            frameRate: 20
        });

        //menambahkan deteksi tubrukan antara karakter berdasarkan hukum
        //fisika dengan group pijakan (yang mewakili semua pijakan)
        this.physics.add.collider(this.player, this.platforms);
        //membuat objek partikel berdasarkan aset gambar yang sudah ada
        //kemudian menampungnya di dalam varianel 'partikelCoin'
        let partikelCoin = this.add.particles('coin');

        //membuat emmiter atau penyebar partikel menampungnya ke dalam
        //variabel dengan nama emmiterCoin
        this.emmiterCoin = partikelCoin.createEmitter({
            //mengatur kecepatan persebaran dari partikel
            //secara acak
            speed: { min: 150, max: 250 },
            //mengatur gaya gravitasi berdasarkan titik x dan y
            gravity: { x: 0, y: 200 },
            //mengatur ukuran dari partikel yang
            //terlihat dengan nilai ketika
            //muncul: '1' dan ketika akan menghilang,
            //nilai ukuran partikel : '0'
            scale: { start: 1, end: 0 },
            //mengatur lama tampilan dari
            //tiap partikel yang disebar
            lifespan: { min: 200, max: 300 },
            //mengatur banyaknya jumlah partikel yang
            //disebarkan setiap kali partikel disebar
            quantity: { min: 5, max: 15 },
        });
        //mengatur partikel untuk pertama kali
        //ketika game dijalankan
        this.emmiterCoin.setPosition(-100, -100);
        //menyebarkan partikel untuk pertama kali
        //ketika game dijalankan
        this.emmiterCoin.explode();

        //mengatur daya tarik dari bagaian bawah untuk karakter
        //menjadi 800 agar lebih cepat jatuh
        this.player.setGravity(0, 800);
        //membuat karakter memantul dengan toleransi pantulan sebesar 0.2
        this.player.setBounce(0.2);

        //menambahkan deteksi input tombol arah pada keyboard
        this.cursors = this.input.keyboard.createCursorKeys();
        //mengaktifkan proteksi agar karakter tidak bisa bergerak ke luar dari area kayar
        this.player.setCollideWorldBounds(true);

        //membuat variabel untuk menampungkoin
        var coin = 0
        this.countCoin = 0; // Ubah menjadi properti this agar bisa diakses dari fungsi collectCoin

        //membuat grup physics penampung sprite koin yang muncul
        //di dalam game dengan menambahkan konfigurasi
        //untuk menentukan jumlah dari koin dan menentukan
        //posisi awal kemunculan koin
        this.coins = this.physics.add.group({ // Ubah menjadi properti this agar bisa diakses dari fungsi lain
            //menentukan nama aset gambar yang akan ditambahkan sebagai sprite koin
            key: 'coin',
            //menentukan jumlah pengulangan pembuatan koin (scr default dibuat 1)
            repeat: 9,
            //buat setiap koin yang dibuat akan memantul dengan besaran toleransi acak
            setXY: { x: 60 + relativeSize.w, y: -100, stepX: 100 },
        });

        //membuat koin baru sekaligus membuat koin bisa memantul
        //berdasarkan elastisitas yang ditentukan secara acak
        this.coins.children.iterate(function (child) {
            //membuat setiap koin yang dibuat akan memantul dengan
            //toleransi yang diacak mulai dari 0.2 s/d 0.3
            child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.3));
        });

        // menambahkan deteksi tubrukan antara koin dengan pijakan berdasarkan hukum fisika
        this.physics.add.collider(this.coins, this.platforms);

        // Membuat grup physics untuk musuh
        this.enemies = this.physics.add.group();

        //fungsi untuk menampilkan translasi jika sedang berganti level
        var newLevelTransition = function () {
            //menambahkan tampilan teks keterangan
            var levelTransitionText = activeScene.add.text(X_POSITION.CENTER, Y_POSITION.CENTER, 'Level ' + activeScene.currentLevel, {
                fontFamily: 'Verdana, Arial',
                fontSize: '40px',
                color: '#ffffff'
            });

            levelTransitionText.setOrigin(0.5);
            levelTransitionText.setDepth(10);
            levelTransitionText.alpha = 0;

            // Memainkan sound efek level up
            activeScene.snd_leveling.play();

            //animasi untuk menyembunyikan teks ganti level dengan menggunakan tween
            activeScene.tweens.add({
                targets: levelTransitionText,
                duration: 1000,
                alpha: 1,
                yoyo: true,
                onComplete: function () {
                    //menghapus dan menghilangkan teks transisi level
                    levelTransitionText.destroy();
                }
            });

            //animasi untuk menyembunyikan background gelap-transparan dengan menggunakan tween
            activeScene.tweens.add({
                delay: 2000,
                targets: darkenLayer,
                duration: 250,
                alpha: 0,
                onComplete: function () {
                    //mengubah nilai variabel 'gamestarted' menjadi 'true' kembali
                    activeScene.gameStarted = true;
                    //melanjutkan jeda sistem physics yang terjadi
                    activeScene.physics.resume();
                }
            });
        };

        //fungsi untuk membuat tampilan area bermain
        //berdasarkan level yang sedang aktif
        var prepareWorld = function () {
            //memastikan untuk membersihkan group yang digunakan untuk menampung pijakan2 yang mungkin sudah pernah dibuat
            activeScene.platforms.clear(true, true);

            if (activeScene.currentLevel === 1) {
                setBackgroundWithScale('background1');
            } else if (activeScene.currentLevel === 2) {
                setBackgroundWithScale('background2');
            } else if (activeScene.currentLevel === 3) {
                setBackgroundWithScale('background3');
            } else if (activeScene.currentLevel === 4) {
                setBackgroundWithScale('background4');
            } else if (activeScene.currentLevel >= 5) {
                setBackgroundWithScale('background5');
            }

            //menampilkan koin baru sekaligus membuat koin bisa memantul
            //berdasarkan elastisitas yang ditentukan secara acak
            activeScene.coins.children.iterate(function (child) {
                //membuat setiap koin yang dibuat akan memantul dengan
                //toleransi yang diacak mulai dari 0.2 - 0.3
                child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.3));
                //mengaktifkan hukum fisika pada koin supaya
                //dapat terkena efek gravitasi dan kemudian turun
                child.enableBody(true, child.x, -100, true, true);
            });

            //membuat 9 buah pijakan yang tersusun rapi, letaknya berada di tepi bawah
            //dan menampungnya ke dalam variabel group penampung dengan nama 'platforms
            activeScene.platforms.create(X_POSITION.CENTER - groundSize.width * 4, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
            activeScene.platforms.create(X_POSITION.CENTER - groundSize.width * 3, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
            activeScene.platforms.create(X_POSITION.CENTER - groundSize.width * 2, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
            activeScene.platforms.create(X_POSITION.CENTER - groundSize.width, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
            activeScene.platforms.create(X_POSITION.CENTER, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
            activeScene.platforms.create(X_POSITION.CENTER + groundSize.width, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
            activeScene.platforms.create(X_POSITION.CENTER + groundSize.width * 2, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
            activeScene.platforms.create(X_POSITION.CENTER + groundSize.width * 3, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
            activeScene.platforms.create(X_POSITION.CENTER + groundSize.width * 4, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');

            //sedang aktif adalah level "1"
            if (activeScene.currentLevel == 1) {
                //membuat pijakan-pijakan tambahan yang posisinya tersebar di layar
                activeScene.platforms.create(groundSize.width / 2 + relativeSize.w, 384, 'ground');
                activeScene.platforms.create(400 + relativeSize.w, 424, 'ground');
                activeScene.platforms.create(1024 - groundSize.width / 2 + relativeSize.w, 480, 'ground');
                activeScene.platforms.create(600 + relativeSize.w, 584, 'ground');
            }
            else if (activeScene.currentLevel == 2) {
                // membuat pijakan-pijakan tambahan untuk level 2 yang posisinya tersebar di layar
                activeScene.platforms.create(80 + relativeSize.w, 284, 'ground');
                activeScene.platforms.create(230 + relativeSize.w, 184, 'ground');
                activeScene.platforms.create(390 + relativeSize.w, 284, 'ground');
                activeScene.platforms.create(990 + relativeSize.w, 360, 'ground');
                activeScene.platforms.create(620 + relativeSize.w, 430, 'ground');
                activeScene.platforms.create(900 + relativeSize.w, 570, 'ground');
            }
            else {
                //melakukan pengecekan jika level
                //sedang aktif adalah selain level "1" dan level "2"
                //membuat pijakan tambahan untuk level 3
                activeScene.platforms.create(80 + relativeSize.w, 230, 'ground');
                activeScene.platforms.create(230 + relativeSize.w, 230, 'ground');
                activeScene.platforms.create(1040 + relativeSize.w, 280, 'ground');
                activeScene.platforms.create(600 + relativeSize.w, 340, 'ground');
                activeScene.platforms.create(400 + relativeSize.w, 420, 'ground');
                activeScene.platforms.create(930 + relativeSize.w, 430, 'ground');
                activeScene.platforms.create(820 + relativeSize.w, 570, 'ground');
                activeScene.platforms.create(512 + relativeSize.w, 590, 'ground');
                activeScene.platforms.create(0 + relativeSize.w, 570, 'ground');

                //melakukan pengecekan terhadap level yang sedang aktif,
                //jika level lebih dari 2, maka akan muncul musuh
                //di setiap pertambahan levelnya
                if (activeScene.currentLevel > 3) {
                    //menentukan posisi horizontal (titik x) dari musuh yang akan muncul secara acak
                    //dari titik 100 sampai di lebar layar dikurangi 100.
                    var x = Phaser.Math.Between(100, activeScene.game.canvas.width - 100);
                    //membuat musuh baru yang akan muncul karena level lebih dari 2
                    var enemy = activeScene.enemies.create(x, -100, 'enemy' + Phaser.Math.Between(1, 3));
                    enemy.setBounce(1);
                    enemy.setCollideWorldBounds(true);
                    //memberikan nilai percepatan untuk membuat musuh langsung bergerak
                    //secara acak ketika muncul
                    enemy.setVelocity(Phaser.Math.Between(-200, 200), 20);
                    //membuat supaya efek gravitasi tidak berlaku pada sprite musuh,
                    //sehingga bisa bergerak bebas seperti balon
                    enemy.allowGravity = false;
                }
            }
        };

        // Mendefinisikan fungsi collectCoin di sini, sebelum digunakan sebagai callback
        var collectCoin = function (player, coin) {
            //memainkan sound efek koin ketika terjadi
            //tubrukan antara karakter dengan koin
            activeScene.snd_coin.play();

            //mengatur posisi dari emitter supaya berpindah ke
            //titik posisi dari koin yang menabrak karakter
            activeScene.emmiterCoin.setPosition(coin.x, coin.y);
            //mulai untuk menyebarkan partikel
            activeScene.emmiterCoin.explode();

            //menambahkan nilai sebanyak 10 koin baru ke dalam variabel 'countCoin'
            activeScene.countCoin += 10;
            //menampilkan jumlah koin pada teks dengan nama 'coinText'
            coinText.setText(activeScene.countCoin);
            //menghentikan dan menonaktifkan body(physics) yang terdapat pada objek star.
            //parameter 1, 'true' untuk menonaktifkan body (physics) yang terdapat pada objek
            //parameter 2, 'true' untuk menyembunyikan objek
            coin.disableBody(true, true);

            if (activeScene.coins.countActive(true) === 0) {
                //menambahkan nilai level sekarang sebanyak 1
                activeScene.currentLevel++;
                //mengatur volume sound efek berjalan menjadi 0
                activeScene.snd_walk.setVolume(0);
                //mengubah nilai variabel 'gamestarter' menjadi false
                activeScene.gameStarted = false;
                //menjeda semua pergerakan yang terjadi karena physics
                activeScene.physics.pause();
                //menjalankan animasi untuk membuat tampilan
                //dari karakter menjadi menghadap ke depan
                activeScene.player.anims.play('front');
                //animasi untuk memunculkan background gelap-transparan dengan menggunakan tween
                activeScene.tweens.add({
                    targets: darkenLayer,
                    duration: 250,
                    alpha: 1,
                    onComplete: function () {
                        //memanggil fungsi untuk membuat tampilan
                        //area bermain dengan level yang baru setelah
                        //layar hitam terlihat
                        prepareWorld();
                        //memanggil fungsi untuk menjalankan
                        //animasi transisi ketika level berganti
                        newLevelTransition();
                    }
                });
            }
        }

        //melakukan pengecekan jika karakter utama
        //melewati obbjek koin, maka fungsi dengan
        //nama 'collectCoin' akan terpanggil
        this.physics.add.overlap(this.player, this.coins, collectCoin, null, this);

        //mempersiapkan area bermain untuk pertama kali dengan
        //memanggil fungsi 'prepareWorld'
        prepareWorld();

        //membuat setiap musuh yang ada di grup 'enemmies
        //bisa bertabrakan dengan setiap pijakan yang ada
        //di grup 'platform' berdasarkan hukum fisika
        this.physics.add.collider(this.enemies, this.platforms);

        //fungsi untuk mendeteksi ketika terjadi tubrukan antara musuh dengan karakter utama
        var hitEnemy = function (player, enemy) {
            //menjeda semua pergerakan yang terjadi karena physics
            activeScene.physics.pause();
            //membuat karakter berubah warna menjadi merah
            activeScene.player.setTint(0xff0000);
            //memainkan sound efek kalah
            activeScene.snd_lose.play();
            // Stop the walking sound
            activeScene.snd_walk.setVolume(0);

            // Stop the background music
            activeScene.music_play.stop();

            // Wait a short time before transitioning to the game over scene
            activeScene.time.delayedCall(1000, function () {
                // Switch to the game over scene, passing the current score
                activeScene.scene.start('sceneGameOver', { score: activeScene.countCoin });
            });
        }
        //melakukan pengecekan jika karakter utama melewati objek musuh,
        //maka fungsi dengan nama 'hitEnemy' akan terpanggil
        this.physics.add.collider(this.player, this.enemies, hitEnemy, null, this);

        //menjeda semua pergerakan yang terjadi karena hukum fisika
        this.physics.pause();
    },
    update: function () {
        //melakukan pengecekan apabila kondisi game
        //sudah dimulai atau belum
        if (!this.gameStarted) {
            //apabila kondisi game belum dimulai, maka kode program yang ada di bawahnya tidak akan dijalankan
            return;
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            //memberikan nilai percepatan dengan nilai '-620' ke karakter utama
            //untuk menggerakkannya ke arah atas dgn bantuan hukum fisika (lompat)
            this.player.setVelocityY(-650);
            this.snd_jump.play();
        }
        //mendeteksi apabila tombol arah kanan
        //pada keyboard ditekan
        if (this.cursors.right.isDown) {
            //memberikan nilai percepatan dengan nilai '200' ke karakter utama
            //untuk menggerakkan karakter ke arah kanan dgn bantuan hukum fisika
            this.player.setVelocityX(200);
            //menganimasikan karakter berlari ke arah kanan
            this.player.anims.play('right', true);
            this.snd_walk.setVolume(1);
        }
        else if (this.cursors.left.isDown) {
            //memberikan nilai percepatan dengan nilai '-200' ke karakter utama
            //untuk menggerakkan karakter ke arah kiri dgn bantuan hukum fisika
            this.player.setVelocityX(-200);
            //menganimasikan karakter berlari ke arah kanan
            this.player.anims.play('left', true);
            this.snd_walk.setVolume(1);
        }
        //mendeteksi apabila tidak ada tombol arah
        //pada keyboard yang ditekan
        else {
            //memberikan nilai percepatan dengan nilai '0' ke karakter untuk
            //membuat karakter tidak bergerak dgn bantuan hukum fisika
            this.player.setVelocityX(0);
            //menganimasikan karakter untuk menghadap ke depan
            this.player.anims.play('front');
            this.snd_walk.setVolume(0);
        }
    }
});