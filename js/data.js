/**
 * js/data.js
 * Seed data untuk TopoNix SMKN 1 Bojonegoro
 * Mencakup Materi 5 Topologi, Bank Soal 3 Tingkat Kesulitan, Proyek GPL, Lencana, dan Akun Demo.
 */

export const INITIAL_SETTINGS = {
  schoolName: 'SMKN 1 Bojonegoro',
  subjectName: 'Informatika — Kelas X',
  kkm: 75,
  xpRules: {
    readMaterial: 25,
    runMaterialSim: 15,
    simulatorPass: 35,
    quizCorrect: 10,
    quizPassBonus: 30,
    gplStageComplete: 120
  },
  levels: [
    { level: 1, name: 'Kabel Pemula', minXp: 0 },
    { level: 2, name: 'Teknisi LAN', minXp: 120 },
    { level: 3, name: 'Perancang Jaringan', minXp: 280 },
    { level: 4, name: 'Arsitek Topologi', minXp: 500 },
    { level: 5, name: 'Administrator Jaringan', minXp: 780 },
    { level: 6, name: 'Master Infrastruktur SMK', minXp: 1100 }
  ]
};

export const BADGE_DEFINITIONS = [
  {
    id: 'penjelajah-materi',
    name: 'Penjelajah Materi',
    icon: '📘',
    description: 'Membaca seluruh 5 materi topologi jaringan.',
    xpBonus: 40
  },
  {
    id: 'penyusun-star',
    name: 'Penyusun Topologi Star',
    icon: '⭐',
    description: 'Berhasil merancang & memvalidasi topologi Star di Network Simulator.',
    xpBonus: 25
  },
  {
    id: 'arsitek-mesh',
    name: 'Arsitek Mesh',
    icon: '🕸️',
    description: 'Berhasil menyusun topologi Mesh penuh di Network Simulator.',
    xpBonus: 35
  },
  {
    id: 'detektif-kerusakan',
    name: 'Detektif Kerusakan',
    icon: '🔍',
    description: 'Menguji simulasi putus kabel/perangkat mati untuk membandingkan ketahanan jaringan.',
    xpBonus: 25
  },
  {
    id: 'kuis-sempurna',
    name: 'Kuis Sempurna',
    icon: '💯',
    description: 'Meraih nilai 100 pada salah satu sesi kuis topologi.',
    xpBonus: 40
  },
  {
    id: 'juara-gpl',
    name: 'Juara Proyek GPL',
    icon: '🏆',
    description: 'Menyelesaikan seluruh tahapan proyek Gamified Project Learning.',
    xpBonus: 80
  }
];

export const INITIAL_TOPOLOGIES = [
  {
    id: 'bus',
    name: 'Topologi Bus',
    tagline: 'Satu jalur kabel utama (backbone) yang digunakan bersama',
    cableType: 'Kabel Koaksial + Terminator 50 Ohm',
    pengertian:
      'Topologi Bus menghubungkan seluruh komputer dan perangkat dalam satu saluran kabel utama (backbone) secara linear. Setiap ujung kabel utama wajib dipasangi terminator untuk menyerap sinyal agar tidak memantul kembali.',
    caraKerja:
      'Saat satu komputer mengirim data, sinyal disiarkan (broadcast) ke sepanjang kabel utama. Semua perangkat memeriksa alamat tujuan pada paket; hanya perangkat dengan alamat tujuan yang sesuai yang menerima data, sementara yang lain mengabaikannya. Karena hanya ada satu jalur, transmisi bergantian menggunakan mekanisme deteksi tabrakan (CSMA/CD).',
    kelebihan: [
      'Hemat kabel karena semua node menumpang pada satu jalur backbone.',
      'Biaya instalasi awal paling murah dan sederhana.',
      'Mudah menambah perangkat baru selama kapasitas kabel mencukupi.'
    ],
    kekurangan: [
      'Jika kabel backbone putus di satu titik, seluruh jaringan lumpuh total.',
      'Kepadatan lalu lintas tinggi (collision) saat banyak PC mengirim bersamaan.',
      'Sulit melacak lokasi gangguan/kerusakan kabel pada jaringan besar.'
    ],
    contohPenerapan:
      'Cocok untuk jaringan praktikum sementara berjumlah kecil atau studi perbandingan jaringan klasik sebelum migrasi ke Switch.',
    presetGraph: {
      nodes: [
        { id: 't1', type: 'router', label: 'Terminator-L', x: 70, y: 165, offline: false },
        { id: 'pc1', type: 'pc', label: 'PC-1', x: 180, y: 80, offline: false },
        { id: 'pc2', type: 'pc', label: 'PC-2', x: 320, y: 80, offline: false },
        { id: 'pc3', type: 'pc', label: 'PC-3', x: 460, y: 80, offline: false },
        { id: 't2', type: 'router', label: 'Terminator-R', x: 570, y: 165, offline: false },
        { id: 'j1', type: 'hub', label: 'Tap-1', x: 180, y: 165, offline: false },
        { id: 'j2', type: 'hub', label: 'Tap-2', x: 320, y: 165, offline: false },
        { id: 'j3', type: 'hub', label: 'Tap-3', x: 460, y: 165, offline: false }
      ],
      links: [
        { id: 'l1', from: 't1', to: 'j1', broken: false, backbone: true },
        { id: 'l2', from: 'j1', to: 'j2', broken: false, backbone: true },
        { id: 'l3', from: 'j2', to: 'j3', broken: false, backbone: true },
        { id: 'l4', from: 'j3', to: 't2', broken: false, backbone: true },
        { id: 'l5', from: 'j1', to: 'pc1', broken: false, backbone: false },
        { id: 'l6', from: 'j2', to: 'pc2', broken: false, backbone: false },
        { id: 'l7', from: 'j3', to: 'pc3', broken: false, backbone: false }
      ]
    }
  },
  {
    id: 'star',
    name: 'Topologi Star',
    tagline: 'Seluruh perangkat terpusat ke satu Switch atau Hub',
    cableType: 'Kabel UTP (Cat5e/Cat6) + Konektor RJ-45',
    pengertian:
      'Topologi Star (Bintang) menghubungkan setiap komputer langsung ke satu perangkat pusat berupa Switch atau Hub. Bentuk fisiknya menyerupai bintang dengan titik kontrol di tengah.',
    caraKerja:
      'Ketika PC-1 ingin mengirim data ke PC-3, paket dikirim terlebih dahulu ke Switch pusat. Switch membaca alamat MAC tujuan dan meneruskan paket hanya ke port PC-3 (berbeda dengan Hub yang menyiarkan ke semua port). Jika satu kabel PC putus, hanya PC tersebut yang terputus sementara perangkat lain tetap bekerja normal.',
    kelebihan: [
      'Gangguan pada satu kabel atau satu PC tidak memengaruhi komputer lain.',
      'Deteksi kerusakan dan manajemen port sangat mudah dari Switch pusat.',
      'Performa tinggi dan minim tabrakan data bila memakai Switch.'
    ],
    kekurangan: [
      'Bergantung penuh pada perangkat pusat (Switch/Hub); jika pusat mati, seluruh jaringan mati.',
      'Membutuhkan lebih banyak panjang kabel dibanding topologi Bus.',
      'Biaya perangkat tambahan (Switch/Hub) lebih tinggi.'
    ],
    contohPenerapan:
      'Standar utama pada Lab Komputer TKJ/RPL SMKN 1 Bojonegoro, ruang guru, dan perkantoran modern.',
    presetGraph: {
      nodes: [
        { id: 'sw1', type: 'switch', label: 'Switch-Pusat', x: 320, y: 165, offline: false },
        { id: 'pc1', type: 'pc', label: 'PC-1', x: 140, y: 75, offline: false },
        { id: 'pc2', type: 'pc', label: 'PC-2', x: 500, y: 75, offline: false },
        { id: 'pc3', type: 'pc', label: 'PC-3', x: 140, y: 255, offline: false },
        { id: 'srv1', type: 'server', label: 'Server-Lab', x: 500, y: 255, offline: false }
      ],
      links: [
        { id: 's1', from: 'sw1', to: 'pc1', broken: false },
        { id: 's2', from: 'sw1', to: 'pc2', broken: false },
        { id: 's3', from: 'sw1', to: 'pc3', broken: false },
        { id: 's4', from: 'sw1', to: 'srv1', broken: false }
      ]
    }
  },
  {
    id: 'ring',
    name: 'Topologi Ring',
    tagline: 'Perangkat terhubung melingkar membentuk cincin tertutup',
    cableType: 'Kabel UTP / Fiber Optic (Token Ring / FDDI)',
    pengertian:
      'Topologi Ring (Cincin) menghubungkan setiap perangkat tepat ke dua perangkat tetangganya hingga membentuk lintasan melingkar tertutup tanpa ujung.',
    caraKerja:
      'Data bergerak searah (atau dua arah pada dual-ring) mengelilingi cincin dengan bantuan sinyal kontrol bernama Token. Hanya komputer yang memegang Token yang berhak mengirim data, sehingga bebas tabrakan (collision). Tiap node bertindak sebagai repeater yang meneruskan paket hingga sampai ke alamat tujuan.',
    kelebihan: [
      'Aliran data teratur dan bebas tabrakan karena memakai mekanisme Token Passing.',
      'Kecepatan transfer stabil bahkan saat beban jaringan cukup tinggi.',
      'Tidak memerlukan perangkat Switch/Hub pusat.'
    ],
    kekurangan: [
      'Pada single-ring, putusnya satu kabel atau matinya satu node memutus seluruh sirkuit.',
      'Menambah atau melepas komputer memerlukan pemutusan sementara cincin.',
      'Penelusuran gangguan lebih rumit dibanding topologi Star.'
    ],
    contohPenerapan:
      'Jaringan backbone metro Fiber Optic (dual-ring SDH/SONET) dan sistem kontrol industri yang membutuhkan waktu akses terprediksi.',
    presetGraph: {
      nodes: [
        { id: 'pc1', type: 'pc', label: 'Node-A', x: 320, y: 55, offline: false },
        { id: 'pc2', type: 'pc', label: 'Node-B', x: 485, y: 155, offline: false },
        { id: 'pc3', type: 'pc', label: 'Node-C', x: 410, y: 270, offline: false },
        { id: 'pc4', type: 'pc', label: 'Node-D', x: 230, y: 270, offline: false },
        { id: 'pc5', type: 'pc', label: 'Node-E', x: 155, y: 155, offline: false }
      ],
      links: [
        { id: 'r1', from: 'pc1', to: 'pc2', broken: false },
        { id: 'r2', from: 'pc2', to: 'pc3', broken: false },
        { id: 'r3', from: 'pc3', to: 'pc4', broken: false },
        { id: 'r4', from: 'pc4', to: 'pc5', broken: false },
        { id: 'r5', from: 'pc5', to: 'pc1', broken: false }
      ]
    }
  },
  {
    id: 'mesh',
    name: 'Topologi Mesh',
    tagline: 'Setiap perangkat memiliki banyak jalur langsung (redundansi tinggi)',
    cableType: 'UTP / Fiber Optic Point-to-Point',
    pengertian:
      'Topologi Mesh (Jala) menghubungkan perangkat secara langsung satu sama lain. Pada Full Mesh untuk n perangkat, jumlah kabel yang dibutuhkan adalah n(n-1)/2 sehingga setiap node terhubung ke semua node lainnya.',
    caraKerja:
      'Paket data dapat dikirim langsung melalui jalur khusus (dedicated link) atau dialihkan melalui rute alternatif jika ada kabel yang putus. Sifat redundansi ini menjamin ketersediaan tinggi (high availability) dan keamanan pengiriman karena lalu lintas tidak melewati perangkat yang tidak berkepentingan.',
    kelebihan: [
      'Toleransi kesalahan sangat tinggi: bila satu kabel putus, data otomatis lewat jalur alternatif.',
      'Bandwidth terdedikasi dan privasi/keamanan transmisi lebih baik.',
      'Tidak terjadi kemacetan pada satu titik pusat.'
    ],
    kekurangan: [
      'Kebutuhan kabel dan port I/O sangat banyak (rumus Full Mesh: n(n-1)/2).',
      'Biaya perangkat dan instalasi paling mahal.',
      'Konfigurasi dan perawatan kompleks bila skala node besar.'
    ],
    contohPenerapan:
      'Interkoneksi antar Router inti (Core Router), Data Center, dan server Ujian CBT SMKN 1 Bojonegoro yang tidak boleh putus koneksi.',
    presetGraph: {
      nodes: [
        { id: 'srv1', type: 'server', label: 'Core-1', x: 320, y: 55, offline: false },
        { id: 'r1', type: 'router', label: 'Core-2', x: 480, y: 165, offline: false },
        { id: 'r2', type: 'router', label: 'Core-3', x: 405, y: 270, offline: false },
        { id: 'r3', type: 'router', label: 'Core-4', x: 235, y: 270, offline: false },
        { id: 'pc1', type: 'pc', label: 'Monitor-PC', x: 160, y: 165, offline: false }
      ],
      links: [
        { id: 'm1', from: 'srv1', to: 'r1', broken: false },
        { id: 'm2', from: 'srv1', to: 'r2', broken: false },
        { id: 'm3', from: 'srv1', to: 'r3', broken: false },
        { id: 'm4', from: 'srv1', to: 'pc1', broken: false },
        { id: 'm5', from: 'r1', to: 'r2', broken: false },
        { id: 'm6', from: 'r1', to: 'r3', broken: false },
        { id: 'm7', from: 'r1', to: 'pc1', broken: false },
        { id: 'm8', from: 'r2', to: 'r3', broken: false },
        { id: 'm9', from: 'r2', to: 'pc1', broken: false },
        { id: 'm10', from: 'r3', to: 'pc1', broken: false }
      ]
    }
  },
  {
    id: 'tree',
    name: 'Topologi Tree',
    tagline: 'Gabungan hierarkis dari beberapa jaringan Star yang bertingkat',
    cableType: 'Fiber Optic (Backbone) + UTP (Distribusi ke PC)',
    pengertian:
      'Topologi Tree (Pohon) adalah kombinasi hierarkis antara topologi Bus/Backbone dan topologi Star. Terdapat perangkat akar (Root/Core Switch atau Router) di tingkat teratas yang membawahi beberapa Switch distribusi, lalu tiap Switch distribusi melayani kelompok PC.',
    caraKerja:
      'Komunikasi antar PC dalam satu cabang ditangani langsung oleh Switch cabang tersebut. Jika PC dari Lab A ingin mengakses Server di cabang lain atau Internet, paket naik ke perangkat Root/Core lalu diteruskan turun ke cabang tujuan. Struktur ini memudahkan segmentasi VLAN dan manajemen gedung bertingkat.',
    kelebihan: [
      'Sangat skalabel untuk jaringan sekolah atau gedung bertingkat.',
      'Isolasi kerusakan mudah per cabang/departemen.',
      'Mendukung pengelolaan terpusat (Router/Core Switch) dan perluasan jaringan bertahap.'
    ],
    kekurangan: [
      'Jika perangkat Root (akar) mengalami gangguan, komunikasi antar cabang terhenti.',
      'Memerlukan kabel backbone yang andal dan biaya perangkat lebih tinggi.',
      'Perawatan konfigurasi hierarki membutuhkan administrator terlatih.'
    ],
    contohPenerapan:
      'Infrastruktur jaringan kampus SMKN 1 Bojonegoro: Router Utama menghubungkan Switch Lab TKJ, Switch Lab RPL, dan Switch Ruang TU.',
    presetGraph: {
      nodes: [
        { id: 'root', type: 'router', label: 'Core-Router', x: 320, y: 50, offline: false },
        { id: 'swA', type: 'switch', label: 'Switch-TKJ', x: 170, y: 150, offline: false },
        { id: 'swB', type: 'switch', label: 'Switch-RPL', x: 470, y: 150, offline: false },
        { id: 'pc1', type: 'pc', label: 'PC-TKJ-1', x: 95, y: 260, offline: false },
        { id: 'pc2', type: 'pc', label: 'PC-TKJ-2', x: 245, y: 260, offline: false },
        { id: 'pc3', type: 'pc', label: 'PC-RPL-1', x: 395, y: 260, offline: false },
        { id: 'srv', type: 'server', label: 'Server-Sekolah', x: 545, y: 260, offline: false }
      ],
      links: [
        { id: 't1', from: 'root', to: 'swA', broken: false },
        { id: 't2', from: 'root', to: 'swB', broken: false },
        { id: 't3', from: 'swA', to: 'pc1', broken: false },
        { id: 't4', from: 'swA', to: 'pc2', broken: false },
        { id: 't5', from: 'swB', to: 'pc3', broken: false },
        { id: 't6', from: 'swB', to: 'srv', broken: false }
      ]
    }
  }
];

export const INITIAL_QUIZ_QUESTIONS = [
  // BUS
  {
    id: 'q-bus-1',
    topic: 'bus',
    difficulty: 'mudah',
    question: 'Komponen wajib yang dipasang di kedua ujung kabel utama (backbone) pada topologi Bus untuk menyerap sinyal pantulan adalah...',
    options: ['Repeater', 'Terminator', 'Switch', 'Access Point'],
    answerIndex: 1,
    explanation: 'Terminator 50 Ohm dipasang di kedua ujung kabel koaksial topologi Bus agar sinyal tidak memantul balik dan mengganggu transmisi.'
  },
  {
    id: 'q-bus-2',
    topic: 'bus',
    difficulty: 'mudah',
    question: 'Jenis kabel yang secara klasik digunakan sebagai jalur backbone pada topologi Bus adalah...',
    options: ['Kabel Koaksial (Coaxial)', 'Kabel HDMI', 'Kabel VGA', 'Kabel USB-C'],
    answerIndex: 0,
    explanation: 'Topologi Bus klasik menggunakan kabel koaksial (Thinnet RG-58) dengan konektor T-BNC.'
  },
  {
    id: 'q-bus-3',
    topic: 'bus',
    difficulty: 'sedang',
    question: 'Apa dampak paling fatal jika kabel backbone topologi Bus putus di bagian tengah?',
    options: [
      'Hanya satu komputer terdekat yang mati',
      'Kecepatan jaringan meningkat dua kali lipat',
      'Seluruh komunikasi jaringan terhenti total karena sinyal memantul',
      'Switch otomatis memindah jalur ke backup'
    ],
    answerIndex: 2,
    explanation: 'Pada topologi Bus, semua node berbagi satu jalur backbone; bila putus di tengah, impedansi hilang dan sinyal memantul sehingga seluruh segmen gagal berkomunikasi.'
  },
  {
    id: 'q-bus-4',
    topic: 'bus',
    difficulty: 'sedang',
    question: 'Mengapa lalu lintas pada topologi Bus rentan mengalami tabrakan data (collision) saat komputer bertambah banyak?',
    options: [
      'Karena menggunakan Switch managed',
      'Karena seluruh perangkat berbagi satu domain tabrakan pada kabel tunggal',
      'Karena setiap komputer memiliki dua kartu jaringan',
      'Karena Token terus berpindah terlalu cepat'
    ],
    answerIndex: 1,
    explanation: 'Semua perangkat di Bus berada dalam satu collision domain yang sama sehingga sinyal yang dikirim bersamaan saling bertabrakan.'
  },
  {
    id: 'q-bus-5',
    topic: 'bus',
    difficulty: 'sulit',
    question: 'Seorang teknisi SMKN 1 Bojonegoro mendapati seluruh PC di lab lama (topologi Bus) tidak bisa ping satu sama lain setelah kabel digeser. Langkah pemeriksaan paling logis pertama kali adalah...',
    options: [
      'Mengganti seluruh monitor PC',
      'Memeriksa sambungan kabel backbone dan terminator di kedua ujungnya',
      'Menambah Router di tiap PC',
      'Mengubah IP menjadi publik'
    ],
    answerIndex: 1,
    explanation: 'Kegagalan total pada topologi Bus paling sering disebabkan kabel backbone terlepas/putus atau salah satu terminator lepas.'
  },

  // STAR
  {
    id: 'q-star-1',
    topic: 'star',
    difficulty: 'mudah',
    question: 'Perangkat pusat yang paling umum digunakan pada topologi Star modern adalah...',
    options: ['Terminator', 'Switch', 'Modem dial-up', 'Konektor BNC'],
    answerIndex: 1,
    explanation: 'Topologi Star modern menggunakan Switch sebagai pusat distribusi karena mampu meneruskan frame berdasarkan MAC address secara efisien.'
  },
  {
    id: 'q-star-2',
    topic: 'star',
    difficulty: 'mudah',
    question: 'Kelebihan utama topologi Star dibandingkan Bus adalah...',
    options: [
      'Tidak membutuhkan kabel sama sekali',
      'Jika satu kabel PC putus, komputer lain tetap dapat berkomunikasi',
      'Tidak memerlukan perangkat penghubung di tengah',
      'Hanya memakai kabel koaksial'
    ],
    answerIndex: 1,
    explanation: 'Setiap PC memiliki jalur kabel UTP khusus ke Switch sehingga gangguan pada satu jalur tidak memengaruhi PC lainnya.'
  },
  {
    id: 'q-star-3',
    topic: 'star',
    difficulty: 'sedang',
    question: 'Apa perbedaan utama penggunaan Switch dibanding Hub sebagai pusat topologi Star?',
    options: [
      'Hub lebih cepat dari Switch',
      'Switch mengirim data langsung ke port MAC tujuan, sedangkan Hub menyiarkan ke semua port',
      'Hub tidak memerlukan daya listrik',
      'Switch hanya bekerja untuk topologi Ring'
    ],
    answerIndex: 1,
    explanation: 'Switch membaca tabel MAC sehingga mengurangi collision dan menjaga efisiensi bandwidth, berbeda dengan Hub yang mem-broadcast ke semua port.'
  },
  {
    id: 'q-star-4',
    topic: 'star',
    difficulty: 'sedang',
    question: 'Titik kelemahan tunggal (Single Point of Failure) pada topologi Star terletak pada...',
    options: [
      'Salah satu kabel UTP milik siswa',
      'Perangkat pusat (Switch/Hub)',
      'Kartu jaringan di salah satu PC',
      'Printer jaringan'
    ],
    answerIndex: 1,
    explanation: 'Jika Switch/Hub pusat mati atau kehilangan daya, seluruh komunikasi antar perangkat dalam bintang ikut terhenti.'
  },
  {
    id: 'q-star-5',
    topic: 'star',
    difficulty: 'sulit',
    question: 'Di Lab TKJ (topologi Star, 24 PC + 1 Switch), hanya PC-07 yang gagal terkoneksi sementara PC-01 sampai PC-24 lainnya lancar. Kesimpulan paling tepat adalah...',
    options: [
      'Switch pusat rusak total',
      'Server utama mati',
      'Gangguan bersifat lokal pada kabel UTP PC-07, konektor RJ-45, atau port Switch nomor 7',
      'Terjadi putus kabel backbone'
    ],
    answerIndex: 2,
    explanation: 'Karena 23 PC lain normal, Switch bekerja baik. Masalah terisolasi pada jalur point-to-point PC-07 ke port Switch.'
  },

  // RING
  {
    id: 'q-ring-1',
    topic: 'ring',
    difficulty: 'mudah',
    question: 'Bentuk koneksi fisik antar komputer pada topologi Ring menyerupai...',
    options: ['Garis lurus terbuka', 'Cincin melingkar tertutup', 'Pohon bercabang', 'Jala penuh'],
    answerIndex: 1,
    explanation: 'Setiap node terhubung ke tepat dua node tetangga sehingga membentuk lintasan melingkar tertutup.'
  },
  {
    id: 'q-ring-2',
    topic: 'ring',
    difficulty: 'mudah',
    question: 'Sinyal kendali khusus yang berputar mengelilingi topologi Ring untuk memberi giliran kirim data disebut...',
    options: ['Beacon', 'Token', 'Ping', 'Terminator'],
    answerIndex: 1,
    explanation: 'Mekanisme Token Passing memastikan hanya node pemegang Token yang boleh mengirim data.'
  },
  {
    id: 'q-ring-3',
    topic: 'ring',
    difficulty: 'sedang',
    question: 'Mengapa pada topologi Single-Ring, matinya satu komputer dapat menghentikan komunikasi seluruh cincin?',
    options: [
      'Karena setiap komputer juga berfungsi sebagai penerus/repeater sinyal ke node berikutnya',
      'Karena Switch pusat ikut mati',
      'Karena tidak ada kabel yang terhubung',
      'Karena Token menjadi terlalu berat'
    ],
    answerIndex: 0,
    explanation: 'Pada Single-Ring, setiap node meneruskan sinyal ke tetangganya; bila satu node mati, aliran sinyal cincin terputus.'
  },
  {
    id: 'q-ring-4',
    topic: 'ring',
    difficulty: 'sedang',
    question: 'Keunggulan metode Token Passing pada topologi Ring dibandingkan Bus CSMA/CD adalah...',
    options: [
      'Lebih hemat listrik',
      'Bebas tabrakan data (collision-free) karena ada giliran kirim yang pasti',
      'Tidak membutuhkan kabel antar komputer',
      'Dapat bekerja tanpa alamat MAC'
    ],
    answerIndex: 1,
    explanation: 'Karena hanya pemegang Token yang mengirim data, tidak terjadi tabrakan antar paket.'
  },
  {
    id: 'q-ring-5',
    topic: 'ring',
    difficulty: 'sulit',
    question: 'Untuk mengatasi kelemahan Single-Ring yang lumpuh saat satu kabel putus, jaringan backbone Fiber Optic modern menerapkan...',
    options: [
      'Pemasangan Terminator 50 Ohm',
      'Dual-Ring (cincin ganda berlawanan arah) seperti FDDI/SONET',
      'Penghapusan alamat IP',
      'Mengganti semua kabel menjadi koaksial'
    ],
    answerIndex: 1,
    explanation: 'Dual-Ring menyediakan cincin cadangan berlawanan arah sehingga saat satu jalur putus, sinyal berbalik membentuk lintasan utuh.'
  },

  // MESH
  {
    id: 'q-mesh-1',
    topic: 'mesh',
    difficulty: 'mudah',
    question: 'Ciri paling menonjol dari topologi Full Mesh adalah...',
    options: [
      'Setiap perangkat terhubung langsung ke semua perangkat lain',
      'Semua perangkat terhubung ke satu Switch',
      'Hanya memakai satu kabel utama',
      'Tidak memiliki jalur cadangan'
    ],
    answerIndex: 0,
    explanation: 'Pada Full Mesh, setiap node memiliki tautan langsung point-to-point ke setiap node lainnya.'
  },
  {
    id: 'q-mesh-2',
    topic: 'mesh',
    difficulty: 'mudah',
    question: 'Alasan utama topologi Mesh dipilih untuk jaringan server kritis/backbone adalah...',
    options: [
      'Biaya kabel paling murah',
      'Keandalan dan toleransi kesalahan (redundansi jalur) sangat tinggi',
      'Pemasangan paling mudah untuk 100 PC',
      'Tidak membutuhkan kartu jaringan'
    ],
    answerIndex: 1,
    explanation: 'Jalur alternatif ganda membuat komunikasi tetap berjalan meski ada kabel yang terputus.'
  },
  {
    id: 'q-mesh-3',
    topic: 'mesh',
    difficulty: 'sedang',
    question: 'Jika ada 5 router yang dihubungkan dengan topologi Full Mesh, berapa total kabel point-to-point yang dibutuhkan?',
    options: ['5 kabel', '8 kabel', '10 kabel', '15 kabel'],
    answerIndex: 2,
    explanation: 'Rumus Full Mesh = n(n - 1) / 2. Untuk n = 5: 5 × 4 / 2 = 10 kabel.'
  },
  {
    id: 'q-mesh-4',
    topic: 'mesh',
    difficulty: 'sedang',
    question: 'Mengapa topologi Full Mesh jarang diterapkan langsung pada 40 komputer siswa dalam satu ruang lab?',
    options: [
      'Karena kecepatannya terlalu lambat',
      'Karena membutuhkan 780 kabel dan 39 port NIC di tiap PC (sangat mahal & tidak praktis)',
      'Karena tidak bisa mengirim file besar',
      'Karena hanya mendukung sistem operasi Linux'
    ],
    answerIndex: 1,
    explanation: '40(39)/2 = 780 kabel dan 39 port per PC — tidak efisien dari sisi biaya dan perangkat keras.'
  },
  {
    id: 'q-mesh-5',
    topic: 'mesh',
    difficulty: 'sulit',
    question: 'Sebuah sekolah ingin menghubungkan 4 gedung inti dengan toleransi putus 1 kabel tanpa mematikan layanan, namun anggaran terbatas. Solusi terbaik adalah...',
    options: [
      'Partial Mesh (menghubungkan jalur redundan hanya pada titik kritis)',
      'Topologi Bus dengan satu koaksial',
      'Single-Ring tanpa cadangan',
      'Melepas semua kabel dan memakai flashdisk'
    ],
    answerIndex: 0,
    explanation: 'Partial Mesh menyeimbangkan keandalan redundansi pada node vital dengan efisiensi jumlah kabel.'
  },

  // TREE
  {
    id: 'q-tree-1',
    topic: 'tree',
    difficulty: 'mudah',
    question: 'Topologi Tree merupakan penggabungan bertingkat antara topologi...',
    options: [
      'Ring dan Mesh',
      'Bus (backbone) dan Star',
      'Mesh penuh dan Token Ring',
      'Wireless saja'
    ],
    answerIndex: 1,
    explanation: 'Topologi Tree menggabungkan beberapa segmen topologi Star yang dihubungkan secara hierarkis ke tulang punggung (backbone/Root).'
  },
  {
    id: 'q-tree-2',
    topic: 'tree',
    difficulty: 'mudah',
    question: 'Perangkat pada level teratas dalam hierarki topologi Tree disebut...',
    options: ['Leaf node', 'Root / Core device', 'Terminator', 'Client PC'],
    answerIndex: 1,
    explanation: 'Root/Core device (Router atau Core Switch) berada di puncak hierarki dan menghubungkan seluruh cabang Switch distribusi.'
  },
  {
    id: 'q-tree-3',
    topic: 'tree',
    difficulty: 'sedang',
    question: 'Di SMKN 1 Bojonegoro, Switch Lab TKJ dan Switch Lab RPL terhubung ke satu Core Router. Jika Switch Lab RPL mati, kondisi yang terjadi adalah...',
    options: [
      'PC di Lab TKJ masih bisa saling berkomunikasi lokal, sedangkan Lab RPL terputus',
      'Seluruh gedung termasuk Lab TKJ ikut mati total',
      'Core Router otomatis rusak',
      'PC Lab RPL langsung tersambung lewat udara'
    ],
    answerIndex: 0,
    explanation: 'Pada topologi Tree, gangguan pada Switch cabang hanya mengisolasi cabang tersebut; cabang lain tetap berjalan.'
  },
  {
    id: 'q-tree-4',
    topic: 'tree',
    difficulty: 'sedang',
    question: 'Kapan topologi Tree menjadi pilihan lebih tepat dibanding satu Star besar?',
    options: [
      'Ketika hanya ada 2 komputer di satu meja',
      'Ketika jaringan tersebar di beberapa ruangan/lantai dengan kebutuhan ekspansi terstruktur',
      'Ketika ingin menghapus semua Switch',
      'Ketika tidak ada perangkat pusat'
    ],
    answerIndex: 1,
    explanation: 'Topologi Tree memudahkan pengelompokan tiap ruangan/lantai dengan Switch cabang masing-masing.'
  },
  {
    id: 'q-tree-5',
    topic: 'tree',
    difficulty: 'sulit',
    question: 'Pada topologi Tree 3 tingkat (Core Router -> 2 Switch Lantai -> masing-masing 4 PC), komponen yang menjadi risiko gangguan lintas-lantai terbesar adalah...',
    options: [
      'Satu PC di Lantai 1',
      'Kabel menuju PC-3',
      'Core Router atau kabel uplink antar Core Router dan Switch Lantai',
      'Terminator di ujung PC'
    ],
    answerIndex: 2,
    explanation: 'Jika Core Router bermasalah, komunikasi lintas cabang/lantai akan terputus meskipun komunikasi internal satu Switch lantai masih berjalan.'
  }
];

export const INITIAL_GPL_PROJECTS = [
  {
    id: 'gpl-1',
    stage: 1,
    title: 'Misi 1: Jaringan Lab Praktik TKJ SMKN 1 Bojonegoro',
    scenario:
      'Kepala Bengkel TKJ meminta rancangan jaringan untuk 4 komputer praktik dan 1 Server Materi agar kerusakan pada satu kabel komputer tidak mengganggu komputer praktikum lainnya.',
    targetTopology: 'star',
    minDevices: { pc: 3, switchOrHub: 1, totalNodes: 4 },
    xpReward: 120,
    badgeUnlock: 'penyusun-star',
    deliverables: [
      'Bangun topologi Star dengan 1 perangkat pusat (Switch/Hub) dan minimal 3 perangkat akhir (PC/Server).',
      'Lakukan validasi topologi hingga berstatus VALID.',
      'Uji pengiriman paket data lalu tulis catatan singkat mengapa topologi ini aman jika 1 kabel PC putus.'
    ]
  },
  {
    id: 'gpl-2',
    stage: 2,
    title: 'Misi 2: Jaringan Sirkuit Ruang Tata Usaha (Tanpa Switch Pusat)',
    scenario:
      'Ruang Tata Usaha sementara membutuhkan koneksi melingkar antar 4 workstation tanpa perangkat Switch pusat menggunakan mekanisme aliran token berurutan.',
    targetTopology: 'ring',
    minDevices: { pc: 4, switchOrHub: 0, totalNodes: 4 },
    xpReward: 140,
    badgeUnlock: null,
    deliverables: [
      'Susun minimal 4 perangkat PC/Node membentuk satu cincin tertutup (tiap node tepat terhubung ke 2 tetangga).',
      'Validasi struktur topologi Ring.',
      'Simulasikan pemutusan 1 kabel dan jelaskan dampaknya pada laporan proyek.'
    ]
  },
  {
    id: 'gpl-3',
    stage: 3,
    title: 'Misi 3: Backbone Server Ujian CBT High-Availability',
    scenario:
      'Saat Ujian Akhir Semester berbasis CBT di SMKN 1 Bojonegoro, 4 node inti (Server & Router) wajib tetap terhubung satu sama lain meskipun salah satu kabel antar perangkat terputus.',
    targetTopology: 'mesh',
    minDevices: { pc: 0, switchOrHub: 0, totalNodes: 4 },
    xpReward: 160,
    badgeUnlock: 'arsitek-mesh',
    deliverables: [
      'Bangun topologi Full Mesh untuk minimal 4 node (setiap node terhubung langsung ke semua node lainnya).',
      'Validasi topologi Mesh di simulator.',
      'Uji putus 1 kabel dan buktikan paket tetap menemukan jalur alternatif.'
    ]
  },
  {
    id: 'gpl-4',
    stage: 4,
    title: 'Misi Final: Integrasi Jaringan Gedung Utama SMKN 1 Bojonegoro',
    scenario:
      'Rancang arsitektur jaringan kampus bertingkat: 1 Core Router di puncak terhubung ke minimal 2 Switch Cabang (Lab TKJ & Lab RPL), dan masing-masing Switch melayani minimal 2 PC/Server.',
    targetTopology: 'tree',
    minDevices: { pc: 4, switchOrHub: 2, totalNodes: 7 },
    xpReward: 220,
    badgeUnlock: 'juara-gpl',
    deliverables: [
      'Rancang topologi Tree 3 tingkat (Core Router/Switch -> 2 Switch Distribusi -> min. 4 End Devices).',
      'Validasi hierarki topologi Tree tanpa loop.',
      'Kirim laporan analisis kelebihan segmentasi antar gedung untuk dinilai oleh Guru.'
    ]
  }
];

export const INITIAL_USERS = [
  {
    id: 'u-siswa-1',
    username: 'rizky',
    password: '123',
    name: 'Ahmad Rizky Pratama',
    role: 'siswa',
    kelas: 'X TKJ 1',
    xp: 295,
    hideOnLeaderboard: false,
    readMaterials: ['bus', 'star', 'ring'],
    simulatedMaterials: ['bus', 'star'],
    validatedTopologies: ['bus', 'star'],
    testedFaultSim: true,
    unlockedBadges: ['penyusun-star', 'detektif-kerusakan'],
    xpHistory: [
      { id: 'xh-1', date: '2026-11-20 08:15', source: 'Membaca Materi Topologi Bus', xp: 25 },
      { id: 'xh-2', date: '2026-11-20 08:25', source: 'Simulasi Materi Bus & Uji Putus Kabel', xp: 40 },
      { id: 'xh-3', date: '2026-11-21 09:10', source: 'Membaca Materi Topologi Star', xp: 25 },
      { id: 'xh-4', date: '2026-11-21 09:20', source: 'Validasi Simulator Topologi Star', xp: 35 },
      { id: 'xh-5', date: '2026-11-22 10:05', source: 'Kuis Topologi Star (Skor 80)', xp: 50 },
      { id: 'xh-6', date: '2026-11-23 13:30', source: 'Selesai Misi GPL Tahap 1', xp: 120 }
    ]
  },
  {
    id: 'u-siswa-2',
    username: 'salsa',
    password: '123',
    name: 'Salsabila Putri Rahayu',
    role: 'siswa',
    kelas: 'X TKJ 1',
    xp: 440,
    hideOnLeaderboard: false,
    readMaterials: ['bus', 'star', 'ring', 'mesh'],
    simulatedMaterials: ['bus', 'star', 'ring'],
    validatedTopologies: ['bus', 'star', 'ring'],
    testedFaultSim: true,
    unlockedBadges: ['penyusun-star', 'detektif-kerusakan', 'kuis-sempurna'],
    xpHistory: [
      { id: 'xh-21', date: '2026-11-20 10:00', source: 'Kuis Topologi Bus (Skor 100)', xp: 120 },
      { id: 'xh-22', date: '2026-11-21 11:15', source: 'Validasi Simulator Star & Ring', xp: 70 },
      { id: 'xh-23', date: '2026-11-22 14:00', source: 'Selesai Misi GPL Tahap 1 & 2', xp: 250 }
    ]
  },
  {
    id: 'u-siswa-3',
    username: 'dimas',
    password: '123',
    name: 'Dimas Wahyu Saputra',
    role: 'siswa',
    kelas: 'X RPL 1',
    xp: 165,
    hideOnLeaderboard: false,
    readMaterials: ['bus', 'star'],
    simulatedMaterials: ['bus'],
    validatedTopologies: ['bus'],
    testedFaultSim: false,
    unlockedBadges: [],
    xpHistory: [
      { id: 'xh-31', date: '2026-11-22 08:40', source: 'Membaca Materi Bus & Star', xp: 50 },
      { id: 'xh-32', date: '2026-11-22 09:05', source: 'Kuis Topologi Bus (Skor 60 - Perlu Penguatan)', xp: 30 },
      { id: 'xh-33', date: '2026-11-23 11:20', source: 'Kuis Topologi Star (Skor 80)', xp: 85 }
    ]
  },
  {
    id: 'u-siswa-4',
    username: 'nadia',
    password: '123',
    name: 'Nadia Kusuma Wardani',
    role: 'siswa',
    kelas: 'X TKJ 2',
    xp: 560,
    hideOnLeaderboard: false,
    readMaterials: ['bus', 'star', 'ring', 'mesh', 'tree'],
    simulatedMaterials: ['bus', 'star', 'ring', 'mesh', 'tree'],
    validatedTopologies: ['bus', 'star', 'ring', 'mesh'],
    testedFaultSim: true,
    unlockedBadges: ['penjelajah-materi', 'penyusun-star', 'arsitek-mesh', 'detektif-kerusakan'],
    xpHistory: [
      { id: 'xh-41', date: '2026-11-21 13:00', source: 'Menyelesaikan Seluruh 5 Materi', xp: 165 },
      { id: 'xh-42', date: '2026-11-22 15:20', source: 'Validasi Simulator Mesh & Ring', xp: 105 },
      { id: 'xh-43', date: '2026-11-24 09:30', source: 'Selesai Misi GPL 1, 2, dan 3', xp: 290 }
    ]
  },
  {
    id: 'u-guru-1',
    username: 'guru',
    password: '123',
    name: 'Siti Aminah, S.Kom.',
    role: 'guru',
    kelas: 'Guru Informatika',
    xp: 0,
    hideOnLeaderboard: true,
    readMaterials: [],
    simulatedMaterials: [],
    validatedTopologies: [],
    testedFaultSim: false,
    unlockedBadges: [],
    xpHistory: []
  },
  {
    id: 'u-admin-1',
    username: 'admin',
    password: '123',
    name: 'Administrator Lab TKJ',
    role: 'admin',
    kelas: 'Admin Sistem',
    xp: 0,
    hideOnLeaderboard: true,
    readMaterials: [],
    simulatedMaterials: [],
    validatedTopologies: [],
    testedFaultSim: false,
    unlockedBadges: [],
    xpHistory: []
  }
];

export const INITIAL_QUIZ_RESULTS = [
  {
    id: 'qr-1',
    userId: 'u-siswa-1',
    topic: 'bus',
    difficulty: 'mudah',
    score: 60,
    correct: 3,
    total: 5,
    passed: false,
    date: '2026-11-20 08:40'
  },
  {
    id: 'qr-2',
    userId: 'u-siswa-1',
    topic: 'star',
    difficulty: 'sedang',
    score: 80,
    correct: 4,
    total: 5,
    passed: true,
    date: '2026-11-22 10:05'
  },
  {
    id: 'qr-3',
    userId: 'u-siswa-2',
    topic: 'bus',
    difficulty: 'sedang',
    score: 100,
    correct: 5,
    total: 5,
    passed: true,
    date: '2026-11-20 10:00'
  },
  {
    id: 'qr-4',
    userId: 'u-siswa-3',
    topic: 'bus',
    difficulty: 'mudah',
    score: 60,
    correct: 3,
    total: 5,
    passed: false,
    date: '2026-11-22 09:05'
  },
  {
    id: 'qr-5',
    userId: 'u-siswa-3',
    topic: 'star',
    difficulty: 'mudah',
    score: 80,
    correct: 4,
    total: 5,
    passed: true,
    date: '2026-11-23 11:20'
  },
  {
    id: 'qr-6',
    userId: 'u-siswa-4',
    topic: 'mesh',
    difficulty: 'sulit',
    score: 90,
    correct: 4,
    total: 4,
    passed: true,
    date: '2026-11-24 08:50'
  }
];

export const INITIAL_GPL_SUBMISSIONS = [
  {
    id: 'sub-1',
    projectId: 'gpl-1',
    userId: 'u-siswa-1',
    submittedAt: '2026-11-23 13:30',
    notes: 'Saya menggunakan 1 Switch pusat dan 4 PC/Server agar jika 1 kabel UTP putus, 3 perangkat lain tetap bisa ping ke Server.',
    graph: INITIAL_TOPOLOGIES[1].presetGraph,
    validationSummary: 'Topologi Star valid (1 Switch pusat, 4 end devices).',
    status: 'reviewed',
    teacherScore: 90,
    teacherComment: 'Rancangan sangat rapi dan analisis isolasi kerusakan sudah tepat! Lanjutkan ke Misi 2.'
  },
  {
    id: 'sub-2',
    projectId: 'gpl-1',
    userId: 'u-siswa-2',
    submittedAt: '2026-11-22 14:00',
    notes: 'Topologi Star Lab TKJ terhubung ke Switch-Pusat dengan kabel UTP point-to-point.',
    graph: INITIAL_TOPOLOGIES[1].presetGraph,
    validationSummary: 'Topologi Star valid (1 Switch pusat, 4 end devices).',
    status: 'submitted',
    teacherScore: null,
    teacherComment: ''
  }
];

export const INITIAL_FEEDBACKS = [
  {
    id: 'fb-1',
    fromName: 'Siti Aminah, S.Kom.',
    targetType: 'class',
    targetValue: 'X TKJ 1',
    title: 'Pengingat Praktikum Topologi Star & Ring',
    message: 'Anak-anak kelas X TKJ 1, pastikan menyelesaikan kuis Topologi Bus dan Star di atas KKM (75) sebelum hari Jumat, lalu coba fitur Putus Kabel pada Network Simulator.',
    date: '2026-11-23 07:30',
    readBy: []
  },
  {
    id: 'fb-2',
    fromName: 'Siti Aminah, S.Kom.',
    targetType: 'student',
    targetValue: 'u-siswa-1',
    title: 'Umpan Balik Misi GPL 1 & Kuis Bus',
    message: 'Bagus Ahmad Rizky! Proyek Lab Star sudah dinilai 90. Untuk topik Bus yang masih skor 60, silakan baca ulang bagian Terminator dan ulangi kuis tingkat Mudah.',
    date: '2026-11-23 15:10',
    readBy: []
  }
];
