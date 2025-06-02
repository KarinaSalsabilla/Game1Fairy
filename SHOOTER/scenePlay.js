var scenePlay = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { key: "scenePlay" });
    },
    init: function () {

    },
    preload: function () {
        this.load.image("BG1", "assets/BG1.png");
        this.load.image("BG2", "assets/BG2.png");
        this.load.image("BG3", "assets/BG3.png");
        this.load.image("GroundTransisi", "assets/Transisi.png");
        this.load.image("Pesawat1", "assets/Pesawat1.png");
        this.load.image("Pesawat2", "assets/Pesawat2.png");
        this.load.image("Peluru", "assets/Peluru.png");
        this.load.image("EfekLedakan", "assets/EfekLedakan.png");
        this.load.image("cloud", "assets/cloud.png");
        this.load.image("Musuh1", "assets/Musuh1.png");
        this.load.image("Musuh2", "assets/Musuh2.png");
        this.load.image("Musuh3", "assets/Musuh3.png");
        this.load.image("MusuhBos", "assets/MusuhBos.png");
        this.load.image("PeluruBos", "assets/PeluruBos.png");
        this.load.audio("snd_shoot", "assets/music_menu.mp3");
        this.load.audio("snd_explode", "assets/fx_explode.mp3");
        this.load.audio("snd_play", "assets/music_play.mp3");
    },
    create: function () {
        // Initialize boss-related variables
        this.boss = null;
        this.bossSpawned = false;
        this.bossBullets = [];
        this.bossShootingTimer = null;
        this.bossMovementTimer = null;

        //sound efek 
        //menambahkan variabel sound efek menembak
        this.snd_shoot = this.sound.add("snd_shoot");
        //menambahkan variabel sound efek meledak
        this.snd_explode = this.sound.add("snd_explode");

        // Dengan kode ini:
        this.snd_play = this.sound.add("snd_play");

        // Memeriksa status sound dari localStorage
        let isSoundActive = localStorage['sound_enabled'] || 1;

        // Memainkan musik ke dalam game
        this.snd_play.play({
            loop: true,
        });

        // Mengatur volume awal musik dan efek suara berdasarkan pengaturan sound
        if (isSoundActive == 0) {
            this.snd_play.setVolume(0);
            this.snd_shoot.setVolume(0);
            this.snd_explode.setVolume(0);
        } else {
            this.snd_play.setVolume(1);
            this.snd_shoot.setVolume(1);
            this.snd_explode.setVolume(1);
        }
        //membuat variabel penampung score
        //menambahkan nilai 0 sebagai nilai awal pengisi variabel skor
        this.scoreValue = 0;
        // Define constants for positions
        const X_POSITION = {
            LEFT: 0,
            CENTER: this.game.canvas.width / 2,
            RIGHT: this.game.canvas.width
        };

        const Y_POSITION = {
            TOP: 0,
            CENTER: this.game.canvas.height / 2,
            BOTTOM: this.game.canvas.height
        };

        // FIX: Add heroShip BEFORE any callbacks that use it
        //menambahkan pesawat hero ke dalam scene
        this.heroShip = this.add.image(X_POSITION.CENTER, Y_POSITION.BOTTOM - 200, "Pesawat" + (currentHero + 1));
        this.heroShip.setDepth(4);
        this.heroShip.setScale(0.35);

        // membuat sabuah class dengan nama Bullet yang nantinya
        // akan digunakan berulang ulang untuk membuat objek peluru
        var Bullet = new Phaser.Class({
            Extends: Phaser.GameObjects.Image,
            initialize:
                //fungsi utama di dalam class 'Bullet' yang digunakan untuk membuat dan menambahkan sprite peluru
                // ke dalam game. terdapat parameter 'scene' dan 'x' yang digunakan 
                //untuk menentukan parent dan posisi awal dari peluru
                function Bullet(scene, x, y) {
                    Phaser.GameObjects.Image.call(this, scene, x, y, "Peluru");
                    this.setDepth(4);
                    this.setScale(0.5);
                    //menentukan kecepatan pergerakan dari peluru yang ditampung
                    //di dalam class, yakni 20000 piksel tiap detik
                    this.speed = Phaser.Math.GetSpeed(3000, 1);
                    this.setActive(true);
                    this.setVisible(true);
                },

            // fungsi tambahan dengan nama 'move' yang nantinya
            //akan digunakan untuk menggerakkan peluru
            move: function () {
                //memindahkan posisi 'y' peluru untuk
                //membuat peluru dapat bergerak naik
                this.y -= this.speed;
                //melakukan pengecekan batas untuk
                //bergerak paling atas untuk peluru
                if (this.y < -50) {
                    //mengganti status dari objek peluru menjadi
                    //tidak aktif(hanya menandai saja)
                    this.setActive(false);
                    this.setVisible(false);
                }
            }
        });

        // menambahkan sebuah variabel array dengan nama 'arrMusuh' untuk
        // nantinya akan digunakan untuk menampung musuh musuh yang
        //sudah ditambahkan ke dalam game
        this.arrBullets = [];

        //menambahkan fungsi yang akan terpanggil setiap 1/4 detik sekali(250 mili detik)
        this.time.addEvent({
            delay: 250,
            callback: function () {
                // FIX: Check if heroShip exists before accessing it
                if (this.heroShip && this.heroShip.active) {
                    //menambahkan peluru ke dalam game dengan memanggil fungsi addBullet
                    //setiap kode program yang ada di dalam sini
                    //akan terpanggil setiap 1/4 detik

                    //menambahkan peluru sekalipun menampung peluru baru ke dalam array 'arrPeluru'
                    //berdasarkan class template dengan nama 'Bullet' yang sudah diuat sebelumnya       
                    this.arrBullets.push(this.add.existing(new Bullet(this, this.heroShip.x, this.heroShip.y - 30, 3000)));

                    this.snd_shoot.play();
                }
            },
            callbackScope: this, loop: true
        });

        //menambahkan beberapa titik posisi untuk membuat pola kiri A
        let pointA = [];
        pointA.push(new Phaser.Math.Vector2(-200, 100));
        pointA.push(new Phaser.Math.Vector2(250, 200));
        pointA.push(new Phaser.Math.Vector2(200, (Y_POSITION.BOTTOM + 200) / 2));
        pointA.push(new Phaser.Math.Vector2(200, Y_POSITION.BOTTOM + 200));
        //menambahkan beberapa titik posisi untuk membuat pola kanan A
        let pointB = [];
        pointB.push(new Phaser.Math.Vector2(900, 100));
        pointB.push(new Phaser.Math.Vector2(550, 200));
        pointB.push(new Phaser.Math.Vector2(500, (Y_POSITION.BOTTOM + 200) / 2));
        pointB.push(new Phaser.Math.Vector2(500, Y_POSITION.BOTTOM + 200));
        //menambahkan beberapa titik posisi untuk membuat pola kanan B
        let pointC = []; // Fixed case to match reference later
        pointC.push(new Phaser.Math.Vector2(900, 100));
        pointC.push(new Phaser.Math.Vector2(550, 200));
        pointC.push(new Phaser.Math.Vector2(400, (Y_POSITION.BOTTOM + 200) / 2));
        pointC.push(new Phaser.Math.Vector2(0, Y_POSITION.BOTTOM + 200));

        //menambahkan beberapa titik posisi untuk membuat pola kiri B
        let pointD = [];
        pointD.push(new Phaser.Math.Vector2(-200, 100));
        pointD.push(new Phaser.Math.Vector2(550, 200));
        pointD.push(new Phaser.Math.Vector2(650, (Y_POSITION.BOTTOM + 200) / 2));
        pointD.push(new Phaser.Math.Vector2(0, Y_POSITION.BOTTOM + 200));

        //menampung pola-pola yang sudah ditambahkan
        // kedalam sebuah array bernama 'points'
        var points = [];
        points.push(pointA);
        points.push(pointB);
        points.push(pointC);
        points.push(pointD);

        //membuat sebuah class dengan nama Enemy yang nantinya akan 
        //digunakan berulang ulang untuk membuat objek musuh
        var Enemy = new Phaser.Class({
            Extends: Phaser.GameObjects.Image,
            initialize:
                //fungsi utama di dalam class 'enemy' yang digunakan untuk membuat dan menambahkan sprite musuh
                // ke dalam game. terdapat parameter 'scene' dan 'idxpath' yang digunakan 
                //untuk menentukan parent dan urutan pola pergerakan dari musuh
                function Enemy(scene, idxPath) {
                    Phaser.GameObjects.Image.call(this, scene);
                    this.setTexture("Musuh" + Phaser.Math.Between(1, 3));
                    this.setDepth(4);
                    this.setScale(0.35);
                    this.curve = new Phaser.Curves.Spline(points[idxPath]);
                    //menambahkan sprite musuh ke dalam scene
                    scene.add.existing(this);

                    //membuat musuh bergerak sesuai dengan pola atau path
                    //'sesuai indexPath' yang disertakan dalam parameter
                    //selama 3 detik
                    let lastEnemyCreated = this;
                    this.path = { t: 0, vec: new Phaser.Math.Vector2() };
                    scene.tweens.add({
                        targets: this.path,
                        t: 1,
                        duration: 3000,
                        onComplete: function () {
                            if (lastEnemyCreated) {
                                lastEnemyCreated.setActive(false);
                            }
                        }
                    });
                },
            // Moved the move function outside the initialize function
            move: function () {
                this.curve.getPoint(this.path.t, this.path.vec);
                this.x = this.path.vec.x;
                this.y = this.path.vec.y;
            }
        });

        //menamahkan sebuah variabel array dengan nama 'arrEnemy' untuk
        //yang nantinya akan digunakan untuk menampung musuh musuh
        //yang sudah ditambahkan ke dalam game
        this.arrEnemies = [];

        //membuat objek partikel berdasarkan aset gambar yang sudah ada
        //kemudian menampungnya di dalam variabel 'partikelExplode'
        let partikelExplode = this.add.particles("EfekLedakan");
        //membuat partikel menjadi berada di urutan
        //lapisan yang berada di atasnya pesawat hero maupun musuh
        partikelExplode.setDepth(4);

        //membuat emitter pertama dan menampungnya ke dalam
        //variabel emiterExplode1 untuk nanti diakses kembali
        this.emitterExplode1 = partikelExplode.createEmitter({
            //mengatur kecepatan dari penyebaran partikel
            speed: { min: -800, max: 800 },
            //mengatur kemiringan dari setiap partikel yang
            //disebar secara acak,dari kemiringan 0 sampai 360
            angle: { min: 0, max: 360 },
            //mengatur ukuran dari setiap partikel yang disebar
            //dari awal kemunculan 0.8 sampai 0 ketika keluar
            scale: { start: 0.8, end: 0 },
            //menentukan mode penampilan di layar
            blendMode: 'SCREEN',
            //menentukan lamanya tiap partikel tampil
            lifespan: 200,
            //menentukan warna dasar dari partikel
            tint: 0xffa500

        });

        //mengatur posisi dari partikel,karena ini di fungsi create
        //jadi disembunyikan dulu dititik podidi yang tidak terlihat layar
        this.emitterExplode1.setPosition(-100, -100);
        //memerintahkan agar emitter menjalankan tugasnya pertama kali
        this.emitterExplode1.explode();

        //membuat emitter pertama dan menampungnya ke dalam
        //variabel emiterExplode2 untuk nanti diakses kembali
        this.emitterExplode2 = partikelExplode.createEmitter({
            //mengatur kecepatan dari penyebaran partikel
            speed: { min: -800, max: 800 },
            //mengatur kemiringan dari setiap partikel yang
            //disebar secara acak,dari kemiringan 0 sampai 360
            angle: { min: 0, max: 360 },
            //mengatur ukuran dari setiap partikel yang disebar
            //dari awal kemunculan 0.8 sampai 0 ketika keluar
            scale: { start: 0.8, end: 0 },
            //menentukan mode penampilan di layar
            blendMode: 'SCREEN',
            //menentukan lamanya tiap partikel tampil
            lifespan: 200,
            //menentukan warna dasar dari partikel
            tint: 0xffa500

        });

        //mengatur posisi dari partikel,karena ini di fungsi create
        //jadi disembunyikan dulu dititik posisi yang tidak terlihat layar
        this.emitterExplode2.setPosition(-100, -100);
        //memerintahkan agar emitter menjalankan tugasnya pertama kali
        this.emitterExplode2.explode();

        //Menambahkan fungsi yang akan terpanggil setiap 1/4 detik sekali(250 mili detik)
        this.time.addEvent({

            delay: 250,
            callback: function () {
                //menambahkan musuh ke dalam game dengan memanggil fungsi addEnemy
                //setiap kode program yang ada di dalam sini
                //akan terpanggil setiap 1/4 detik
                //melakukan pengecekan jika jumlah musuh yang tampil masih dibawah 3
                if (this.arrEnemies.length < 3) {
                    //menambahkan musuh sekalipun menampung musuh baru ke dalam array 'arrMusuh'
                    //berdasarkan class template dengan nama 'Enemy' yang sudah diuat sebelumnya
                    this.arrEnemies.push(new Enemy(this, Phaser.Math.Between(0, points.length - 1)));
                }
            },
            callbackScope: this,
            loop: true

        });

        // BOSS FUNCTIONS - Define these before calling them

        // Function untuk memulai tembakan boss
        this.startBossShooting = function () {
            if (!this.boss || !this.boss.active) return;

            this.bossShootingTimer = this.time.addEvent({
                delay: 1000, // Boss menembak setiap 1 detik
                callback: () => {
                    if (!this.boss || !this.boss.active) return;

                    // Buat peluru boss
                    let bullet = this.add.image(this.boss.x, this.boss.y + 50, "PeluruBos");
                    bullet.setDepth(4);
                    bullet.setScale(0.5);

                    // Tambahkan ke array
                    this.bossBullets.push(bullet);

                    // Efek suara (opsional)
                    this.snd_shoot.play();
                },
                callbackScope: this,
                loop: true
            });
        };

       //Menambahkan fungsi yang akan terpanggil setiap 1/4 detik sekali(250 mili detik)
this.time.addEvent({
    delay: 250,
    callback: function () {
        // PERBAIKAN: Tetap spawn musuh biasa meskipun boss sudah muncul
        // Tapi dengan frekuensi yang lebih rendah dan kondisi yang lebih flexible
        
        let maxEnemies, spawnChance;
        
        if (this.bossSpawned && this.boss && this.boss.active) {
            // Jika boss masih hidup, kurangi spawn rate musuh kecil
            maxEnemies = 2; // Maksimal 2 musuh kecil
            spawnChance = 0.6; // 60% kemungkinan spawn
        } else if (this.bossSpawned && (!this.boss || !this.boss.active)) {
            // Jika boss sudah mati atau belum ada, kembali ke normal
            maxEnemies = 3;
            spawnChance = 1; // 100% kemungkinan spawn
        } else {
            // Sebelum boss spawn, gunakan setting normal
            maxEnemies = 3;
            spawnChance = 1; // 100% kemungkinan spawn
        }
        
        // Spawn musuh dengan mempertimbangkan kondisi di atas
        if (this.arrEnemies.length < maxEnemies && Math.random() < spawnChance) {
            this.arrEnemies.push(new Enemy(this, Phaser.Math.Between(0, points.length - 1)));
        }
    },
    callbackScope: this,
    loop: true
});

// TAMBAHAN: Buat fungsi helper untuk mengatur spawn rate
this.updateEnemySpawnRate = function() {
    // Fungsi ini bisa dipanggil ketika status boss berubah
    // untuk mengatur ulang spawn rate musuh kecil
    if (this.enemySpawnTimer) {
        this.enemySpawnTimer.remove();
    }
    
    let delay, maxEnemies, spawnChance;
    
    if (this.bossSpawned && this.boss && this.boss.active) {
        delay = 400; // Lebih lambat ketika boss ada
        maxEnemies = 2;
        spawnChance = 0.7;
    } else {
        delay = 250; // Normal speed
        maxEnemies = 3;
        spawnChance = 1;
    }
    
    this.enemySpawnTimer = this.time.addEvent({
        delay: delay,
        callback: function () {
            if (this.arrEnemies.length < maxEnemies && Math.random() < spawnChance) {
                this.arrEnemies.push(new Enemy(this, Phaser.Math.Between(0, points.length - 1)));
            }
        },
        callbackScope: this,
        loop: true
    });
};

        // Function untuk memulai pergerakan boss
        this.startBossMovement = function () {
            this.bossMovementTimer = this.time.addEvent({
                delay: 50, // Update setiap 50ms untuk pergerakan smooth
                callback: () => {
                    if (!this.boss || !this.boss.active || !this.boss.getData('canMove')) return;

                    let currentX = this.boss.x;
                    let direction = this.boss.getData('moveDirection');
                    let speed = this.boss.getData('moveSpeed');

                    // Hitung posisi baru
                    let newX = currentX + (direction * speed);

                    // Cek batas kiri dan kanan (dengan margin 100 pixel dari tepi)
                    if (newX <= 100) {
                        newX = 100;
                        this.boss.setData('moveDirection', 1); // Balik arah ke kanan
                    } else if (newX >= this.game.canvas.width - 100) {
                        newX = this.game.canvas.width - 100;
                        this.boss.setData('moveDirection', -1); // Balik arah ke kiri
                    }

                    // Update posisi boss
                    this.boss.x = newX;
                },
                callbackScope: this,
                loop: true
            });
        };

     // PERBAIKAN pada function spawnBoss - tambahkan di akhir callback animasi:
this.spawnBoss = function () {
    // Create the boss properly
    this.boss = this.add.image(this.game.canvas.width / 2, -100, "MusuhBos");
    this.boss.setDepth(4);
    this.boss.setScale(0.7);

    // IMPORTANT: Explicitly set boss properties
    this.boss.setActive(true);
    this.boss.setVisible(true);

    // Set HP data with proper method
    this.boss.setData('hp', 30);
    this.boss.setData('maxHp', 30);

    // Tambahkan properti untuk pergerakan boss
    this.boss.setData('moveDirection', 1); // 1 = kanan, -1 = kiri
    this.boss.setData('moveSpeed', 2); // Kecepatan pergerakan
    this.boss.setData('canMove', false); // Boss belum bisa bergerak sampai animasi masuk selesai

    // Debug to verify HP was set
    console.log("Boss spawned with HP:", this.boss.getData('hp'));

    // Animasi bos masuk ke layar
    this.tweens.add({
        targets: this.boss,
        y: 100,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => {
            // Update health bar after animation completes
            this.updateBossHealthBar();
            this.startBossShooting(); // Mulai menembak setelah masuk
            
            // PENTING: Aktifkan pergerakan boss setelah animasi masuk selesai
            this.boss.setData('canMove', true);
            this.startBossMovement(); // Mulai pergerakan boss
            
            // PERBAIKAN: Update spawn rate musuh kecil setelah boss muncul
            this.updateEnemySpawnRate();
        }
    });
};

        // Buat container untuk health bar boss
        this.bossHealthContainer = this.add.container(this.game.canvas.width / 2, 30);
        this.bossHealthContainer.setDepth(10); // Pastikan tampil di atas semua elemen

        // Buat background untuk health bar (abu-abu gelap)
        this.bossHealthBg = this.add.graphics();
        this.bossHealthBg.fillStyle(0x333333, 0.8);
        this.bossHealthBg.fillRoundedRect(-250, -15, 500, 30, 5);
        this.bossHealthContainer.add(this.bossHealthBg);

        // Buat bar nyawa utama (merah)
        this.bossHealthBar = this.add.graphics();
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRoundedRect(-245, -10, 490, 20, 3);
        this.bossHealthContainer.add(this.bossHealthBar);

        // Tambahkan ikon untuk boss
        this.bossIcon = this.add.image(-280, 0, "MusuhBos");
        this.bossIcon.setScale(0.2);
        this.bossHealthContainer.add(this.bossIcon);

        // Tambahkan teks nyawa boss
        this.bossHealthText = this.add.text(0, 0, "30/30", {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            fontWeight: 'bold'
        });
        this.bossHealthText.setOrigin(0.5);
        this.bossHealthContainer.add(this.bossHealthText);

        // Hide the health bar initially
        this.bossHealthContainer.setVisible(false);

        // Function untuk update health bar boss
        this.updateBossHealthBar = function () {
            if (!this.boss || !this.boss.active) return;

            // Show the health bar when boss appears
            this.bossHealthContainer.setVisible(true);

            // Pastikan nilai hp dan maxHp ada
            const hp = this.boss.getData('hp') || 0;
            const maxHp = this.boss.getData('maxHp') || 30;
            const hpPercent = Phaser.Math.Clamp(hp / maxHp, 0, 1);

            // Kemudian update tampilan health bar seperti biasa
            this.bossHealthText.setText(`${hp}/${maxHp}`);
            this.bossHealthBar.clear();

            // Warna berdasarkan HP
            let barColor;
            if (hpPercent > 0.6) {
                barColor = 0x00ff00; // Hijau
            } else if (hpPercent > 0.3) {
                barColor = 0xffff00; // Kuning
            } else {
                barColor = 0xff0000; // Merah
            }

            this.bossHealthBar.fillStyle(barColor, 1);
            this.bossHealthBar.fillRoundedRect(-245, -10, 490 * hpPercent, 20, 3);

            // Efek getaran jika terkena damage
            if (this._lastHp && this._lastHp > hp) {
                this.tweens.add({
                    targets: this.bossHealthContainer,
                    x: this.game.canvas.width / 2 + 5,
                    duration: 50,
                    yoyo: true,
                    repeat: 3
                });
            }

            // Simpan HP terakhir
            this._lastHp = hp;
        }

        //mengaktifkan deteksi mouse atau touch pada layar
        this.input.on("pointermove", function (pointer, currentlyOver) {

            // kode program ketika terdeteksi pergerakan mouse atau touch pada layar
            // membuat variabel penampung posisi baru yang akan dituju oleh pesawat hero
            //sekaligus mengisi variabel nilai tiap variabel dengan posisi hero terakhir
            let movementX = this.heroShip.x;
            let movementY = this.heroShip.y;


            //melakukan pengecekan pergerakan mouse pointer untuk menentukan gerak
            //pesawat hero secara vertikal supaya tetap berada di dalam area layar
            if (pointer.x > 70 && pointer.x < X_POSITION.RIGHT - 70) {
                movementX = pointer.x;
            }
            else {
                if (pointer.x <= 70) {
                    movementX = 70;
                } else {
                    movementX = (X_POSITION.RIGHT - 70); // Fixed typo: movemontX -> movementX
                }
            }

            if (pointer.y > 70 && pointer.y < Y_POSITION.BOTTOM - 70) {
                movementY = pointer.y;
            } else {
                if (pointer.y <= 70) {
                    movementY = 70;
                } else {
                    movementY = (Y_POSITION.BOTTOM - 70);
                }

            }

            //menentukan jarak anatara titik hero dengan titik tujuan gerak
            let a = this.heroShip.x - movementX;
            let b = this.heroShip.y - movementY;
            //menentukan durasi meluncur berdasarkan jarak yang sudah didapat
            let durationToMove = Math.sqrt(a * a + b * b) * 0.8;
            //animasi meluncur ke titik kooordinat posisi pointer
            this.tweens.add({
                targets: this.heroShip,
                x: movementX,
                y: movementY,
                duration: durationToMove,
            })

            //memindahkan posisi pesawat hero ke posisi baru yang dituju
            // yang sudah ditentukan dalam pengecekan
            this.heroShip.x = movementX;
            this.heroShip.y = movementY;

            console.log(pointer);
            console.log("pointer.x : " + pointer.x + " pointer.y : " + pointer.y);
        }, this);

        //menyiapkan pendeteksi event untuk tombol arah keyboard
        this.cursorKeyListener = this.input.keyboard.createCursorKeys();
        // menentukan index atau urutan tekstur/gambar background secara acak dari 1 sampai 3
        this.lastBgIndex = Phaser.Math.Between(1, 3);

        // membuat penampung data ukuran gambar background pada lapisan paling bawah sendiri
        this.bgBottomSize = { "width": 768, 'height': 1664 };

        // array untuk menampung semua background lapisan bawah
        this.arrBgBottom = [];

        // fungsi dengan parameter posisi x dan posisi y untuk membuat background pada lapisan paling bawah sendiri
        this.createBGBottom = function (xPos, yPos) {
            let bgBottom = this.add.image(xPos, yPos, 'BG' + this.lastBgIndex);
            bgBottom.setData('kecepatan', 3);
            bgBottom.setDepth(1);
            bgBottom.flipX = Phaser.Math.Between(0, 1);
            this.arrBgBottom.push(bgBottom);

            // menambahkan background transisi di posisi paling atas background apabila
            // index/urutan tekstur background sebelumnya berbeda dengan background baru
            // yang akan ditambahkan
            let newBgIndex = Phaser.Math.Between(1, 3);
            if (newBgIndex != this.lastBgIndex) {
                let bgBottomAdditon = this.add.image(xPos, yPos - this.bgBottomSize.height / 2, "GroundTransisi");
                bgBottomAdditon.setData("kecepatan", 3);
                bgBottomAdditon.setData('tambahan', true);
                bgBottomAdditon.setDepth(2);
                bgBottomAdditon.flipX = Phaser.Math.Between(0, 1);
                this.arrBgBottom.push(bgBottomAdditon);
            }

            // menampung index/urutan tekstur background yang baru saja dibuat
            // untuk dibandingkan pada penambahan background berikutnya
            this.lastBgIndex = newBgIndex;
        };

        // fungsi untuk menentukan posisi dari background paling bawah sendiri,
        // jadi untuk membuat background baru tinggal memanggil fungsi ini
        this.addBGBottom = function () {
            if (this.arrBgBottom.length > 0) {
                let lastBG = this.arrBgBottom[this.arrBgBottom.length - 1];

                if (lastBG.getData('tambahan')) {
                    lastBG = this.arrBgBottom[this.arrBgBottom.length - 2];
                }

                this.createBGBottom(this.game.canvas.width / 2, lastBG.y - this.bgBottomSize.height);
            } else {
                this.createBGBottom(this.game.canvas.width / 2, this.game.canvas.height - this.bgBottomSize.height / 2);
            }
        };

        // membuat 3 background pada lapisan paling bawah sendiri
        // dengan cukup memanggil fungsi "addBGBottom" sebanyak 3 kali
        this.addBGBottom();
        this.addBGBottom();
        this.addBGBottom();

        //membuat background pada lapisan bagian atas
        //membuat penampung data ukuran gambar awan
        this.bgCloudSize = { 'width': 768, 'height': 1962 };

        //array untuk menampung semua background lapisan atas
        this.arrBgTop = [];

        //fungsi dengan parameter posisi x dan posisi y untuk membuat
        //background pada lapisan paling atas sendiri, yakni awan
        this.createBGTop = function (xPos, yPos) {
            var bgTop = this.add.image(xPos, yPos, 'cloud');
            bgTop.setData("kecepatan", 6);
            bgTop.setDepth(5);
            bgTop.flipX = Phaser.Math.Between(0, 1);
            bgTop.setAlpha(Phaser.Math.Between(4, 7) / 10);
            this.arrBgTop.push(bgTop);
        };

        //fungsi untuk menentukan posisi dari background paling atas sendiri,
        //jadi untuk membuat background paling atas baru, tinggal panggil fungsi ini
        this.addBGTop = function () {
            if (this.arrBgTop.length > 0) {
                let lastBG = this.arrBgTop[this.arrBgTop.length - 1];
                this.createBGTop(this.game.canvas.width / 2, lastBG.y - this.bgCloudSize.height * Phaser.Math.Between(1, 4));
            } else {
                this.createBGTop(this.game.canvas.width / 2, -this.bgCloudSize.height);
            }
        };

        //membuat 1 background pada lapisan paling atas
        //dengan cukup memanggil fungsi "addBGTop' sebanyak 1 kali
        this.addBGTop();

        //membuat tampilan skor
        this.scoreLabel = this.add.text(this.game.canvas.width / 2, 80, '0', {
            //menentukan jenis font yang akan ditampilkan
            fontFamily: 'Verdana, Arial',
            //menentukan ukuran teks
            fontSize: '70px',
            //menentukan warna teks
            color: '#ffffff',
            //menentukan warna dari garis tepi teks
            stroke: '#5c5c5c',
            //menentukan ketebalan dari garis tepi teks
            strokeThickness: 2
        });

        //menentukan titik tumpu dari teks (0.5 berarti di tengah)
        this.scoreLabel.setOrigin(0.5);
        //mengatur posisi di lapisan ke berapa akan tampil
        this.scoreLabel.setDepth(100);

        this.scene.get('sceneGameOver') || this.scene.add('sceneGameOver', sceneGameOver, false);

        this.bossSpawned = false;

    },



    update: function () {
        // Spawn boss ketika score mencapai 10 dan belum spawn
        if (this.scoreValue >= 10 && !this.bossSpawned) {
            this.bossSpawned = true;

            // Hapus semua musuh yang ada
            for (let i = 0; i < this.arrEnemies.length; i++) {
                this.arrEnemies[i].destroy();
            }
            this.arrEnemies = [];

            // Spawn boss
            this.spawnBoss();
        }

        // Update posisi peluru
        for (let i = 0; i < this.arrBullets.length; i++) {
            if (this.arrBullets[i].active) {
                this.arrBullets[i].move();
            }
        }

        // Bersihkan peluru yang tidak aktif
        for (let i = 0; i < this.arrBullets.length; i++) {
            if (!this.arrBullets[i].active) {
                this.arrBullets[i].destroy();
                this.arrBullets.splice(i, 1);
                i--;
            }
        }

       
            // Update musuh biasa dan cek collision
            for (let i = 0; i < this.arrEnemies.length; i++) {
                if (!this.arrEnemies[i].active) {
                    this.arrEnemies[i].destroy();
                    this.arrEnemies.splice(i, 1);
                    i--;
                    continue;
                }

                this.arrEnemies[i].move();

                // Cek collision hero dengan musuh
                if (this.checkCollision(this.heroShip, this.arrEnemies[i])) {
                    this.emitterExplode1.setPosition(this.heroShip.x, this.heroShip.y);
                    this.emitterExplode1.explode(20);
                    this.snd_explode.play();
                    localStorage.setItem('lastScore', this.scoreValue);
                    this.snd_play.stop();
                    this.scene.start('sceneGameOver');
                    return;
                }

                // Cek collision peluru dengan musuh
                for (let j = 0; j < this.arrBullets.length; j++) {
                    if (this.arrBullets[j].active && this.checkCollision(this.arrBullets[j], this.arrEnemies[i])) {
                        this.arrBullets[j].setActive(false);
                        this.arrEnemies[i].setActive(false);
                        this.emitterExplode1.setPosition(this.arrEnemies[i].x, this.arrEnemies[i].y);
                        this.emitterExplode1.explode(20);
                        this.snd_explode.play();
                        this.scoreValue += 1;
                        this.scoreLabel.setText(this.scoreValue.toString());

                        this.arrEnemies[i].destroy();
                        this.arrEnemies.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
        

        // PERBAIKAN 6: Perbaiki handling peluru boss
        if (this.bossBullets && this.bossBullets.length > 0) {
            for (let i = 0; i < this.bossBullets.length; i++) {
                let bullet = this.bossBullets[i];

                // Pastikan bullet masih ada
                if (!bullet || !bullet.active) {
                    this.bossBullets.splice(i, 1);
                    i--;
                    continue;
                }

                bullet.y += 5;

                if (bullet.y > this.game.canvas.height + 50) {
                    bullet.destroy();
                    this.bossBullets.splice(i, 1);
                    i--;
                    continue;
                }

                // Cek collision peluru boss dengan hero
                if (this.checkCollision(bullet, this.heroShip)) {
                    this.emitterExplode1.setPosition(this.heroShip.x, this.heroShip.y);
                    this.emitterExplode1.explode(20);
                    this.snd_explode.play();
                    localStorage.setItem('lastScore', this.scoreValue);
                    this.snd_play.stop();
                    this.scene.start('sceneGameOver');
                    return;
                }
            }
        }

        // Update logic boss
        if (this.boss && this.boss.active) {
            // Cek collision boss dengan hero
            if (this.checkCollision(this.heroShip, this.boss)) {
                this.emitterExplode1.setPosition(this.heroShip.x, this.heroShip.y);
                this.emitterExplode1.explode(20);
                this.snd_explode.play();
                localStorage.setItem('lastScore', this.scoreValue);
                this.snd_play.stop();
                this.scene.start('sceneGameOver');
                return;
            }

            // Cek collision peluru hero dengan boss
            for (let j = 0; j < this.arrBullets.length; j++) {
                if (this.arrBullets[j].active && this.checkCollision(this.arrBullets[j], this.boss)) {
                    this.arrBullets[j].setActive(false);

                    // Kurangi HP boss
                    let hp = this.boss.getData('hp') || 0;
                    if (hp > 0) {
                        this.boss.setData('hp', hp - 1);
                        this.updateBossHealthBar();

                        // Efek ledakan kecil
                        this.emitterExplode2.setPosition(this.arrBullets[j].x, this.arrBullets[j].y);
                        this.emitterExplode2.explode(10);
                        this.snd_explode.play();

                        // Tambah skor
                        this.scoreValue += 5;
                        this.scoreLabel.setText(this.scoreValue.toString());

                        // Jika boss kalah
                        if (this.boss.getData('hp') <= 0) {
                            this.boss.setActive(false);

                            // PERBAIKAN 7: Bersihkan timer boss
                            if (this.bossMovementTimer) {
                                this.bossMovementTimer.remove();
                                this.bossMovementTimer = null;
                            }
                            if (this.bossShootingTimer) {
                                this.bossShootingTimer.remove();
                                this.bossShootingTimer = null;
                            }

                            // Efek ledakan besar
                            this.emitterExplode1.setPosition(this.boss.x, this.boss.y);
                            this.emitterExplode1.explode(30);

                            // Hapus boss
                            this.boss.destroy();
                            this.boss = null;

                            // Sembunyikan health bar
                            if (this.bossHealthContainer) {
                                this.bossHealthContainer.setVisible(false);
                            }

                            localStorage.setItem('lastScore', this.scoreValue);
                            this.snd_play.stop();
                            this.scene.start('sceneGameWin');
                            return;
                        }
                    }
                }
            }
        }

        // Update background bawah
        for (let i = 0; i < this.arrBgBottom.length; i++) {
            this.arrBgBottom[i].y += this.arrBgBottom[i].getData('kecepatan');
            if (this.arrBgBottom[i].y > this.game.canvas.height + this.bgBottomSize.height / 2) {
                if (this.arrBgBottom[i].getData('tambahan')) {
                    this.arrBgBottom[i].destroy();
                    this.arrBgBottom.splice(i, 1);
                    i--;
                } else {
                    this.arrBgBottom[i].destroy();
                    this.arrBgBottom.splice(i, 1);
                    i--;
                    this.addBGBottom();
                }
            }
        }

        // Update background atas
        for (let i = 0; i < this.arrBgTop.length; i++) {
            this.arrBgTop[i].y += this.arrBgTop[i].getData('kecepatan');
            if (this.arrBgTop[i].y > this.game.canvas.height + this.bgCloudSize.height / 2) {
                this.arrBgTop[i].destroy();
                this.arrBgTop.splice(i, 1);
                i--;
                this.addBGTop();
            }
        }

        // Kontrol keyboard
        if (this.cursorKeyListener.left.isDown && this.heroShip.x > 70) {
            this.heroShip.x -= 10;
        }
        if (this.cursorKeyListener.right.isDown && this.heroShip.x < this.game.canvas.width - 70) {
            this.heroShip.x += 10;
        }
        if (this.cursorKeyListener.up.isDown && this.heroShip.y > 70) {
            this.heroShip.y -= 10;
        }
        if (this.cursorKeyListener.down.isDown && this.heroShip.y < this.game.canvas.height - 70) {
            this.heroShip.y += 10;
        }
    },


    // Replace or update your checkCollision function (around line 812):
    checkCollision: function (object1, object2) {
        if (!object1 || !object2 || !object1.active || !object2.active) {
            return false;
        }

        let dx = object1.x - object2.x;
        let dy = object1.y - object2.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        let scale1 = object1.scale || 1;
        let scale2 = object2.scale || 1;

        let extraRadius = 0;
        if (object1.texture.key === "Peluru" && object2.texture.key === "MusuhBos") {
            extraRadius = 20;
        }

        let object1Radius = Math.max(object1.width, object1.height) * scale1 * 0.3;
        let object2Radius = Math.max(object2.width, object2.height) * scale2 * 0.3;

        return distance < (object1Radius + object2Radius + extraRadius);
    }
});