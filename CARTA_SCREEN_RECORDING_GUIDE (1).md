# CARTA: Screen Recording Guide untuk 7 Video X

*Dokumen ini untuk dikasih ke dev yang akan melakukan screen recording. Baca semuanya dari atas sampai bawah dulu, termasuk bagian istilah dasar, sebelum mulai rekam apapun. Kalau ada istilah yang tidak familiar di tengah instruksi, kembali ke bagian istilah dasar di bawah ini.*

---

## PERINGATAN UTAMA, BACA INI DULU

**Semua yang tampil di layar harus dalam Bahasa Inggris. Tanpa kecuali.**

Ini bukan saran, ini syarat wajib. Kalau ada satu kata Bahasa Indonesia yang kelihatan di video (di browser, di TradingView, di menu Chrome, di nama file, di mana pun), video itu tidak bisa dipakai dan harus direkam ulang. Jadi cek dulu sebelum tombol record ditekan, bukan sesudah.

Yang harus dicek sebelum SETIAP video di bawah ini:

1. **Bahasa TradingView.** Buka tradingview.com, lihat pojok kanan atas. Kalau ada ikon bendera atau pemilih bahasa, pastikan itu di-set ke English. Cara paling gampang untuk pastikan: cek URL di address bar. Kalau URL-nya `id.tradingview.com`, itu versi Bahasa Indonesia, ganti ke `www.tradingview.com`. Kalau masih ada teks Bahasa Indonesia di menu manapun setelah itu, klik foto profil di pojok kanan atas, cari opsi Language di situ, pilih English.
2. **Bahasa Chrome.** Buka `chrome://settings/languages`, pastikan English ada di urutan paling atas.
3. **Bahasa sistem operasi (Windows/Mac).** Kalau OS di-set ke Bahasa Indonesia, kadang beberapa dialog sistem (seperti file picker saat pilih folder) ikut muncul dalam Bahasa Indonesia. Kalau ini terjadi, ganti dulu display language OS ke English sebelum rekam video 7 (yang ada proses buka file explorer/finder).
4. **Bersihkan tab dan bookmark bar.** Sebelum rekam, tutup tab-tab lain yang ga perlu kelihatan, dan kalau bookmark bar isinya ada judul-judul dalam Bahasa Indonesia, sembunyikan dulu (`Ctrl+Shift+B` di Chrome untuk toggle bookmark bar on/off).

Cek ulang empat poin ini di awal setiap sesi recording, bukan cuma sekali di awal hari.

---

## BAGIAN 0: Istilah Dasar yang Perlu Kamu Tahu Dulu

Bagian ini khusus untuk kamu yang belum familiar dengan trading atau TradingView. Baca ini dulu sebelum lanjut ke instruksi video, karena istilah-istilah ini akan dipakai berulang kali di bawah.

### Candlestick (lilin harga)
Chart yang dipakai TradingView berbentuk kumpulan batang kecil yang disebut candlestick (lilin). Setiap satu candlestick mewakili pergerakan harga dalam satu periode waktu tertentu. Kalau candlestick-nya berwarna hijau, artinya harga di periode itu ditutup lebih tinggi dari harga pembukaannya (harga naik). Kalau merah, artinya harga ditutup lebih rendah dari pembukaannya (harga turun). Chart CARTA dan TradingView isinya ratusan candlestick berjejer dari kiri ke kanan, membentuk pola naik turun.

### Timeframe (kerangka waktu)
Timeframe menentukan satu candlestick itu mewakili periode berapa lama. Kalau timeframe-nya "1D" (Daily), berarti satu candlestick itu mewakili pergerakan harga dalam satu hari penuh. CARTA menganalisa berdasarkan timeframe Daily, jadi setiap kali instruksi bilang "set timeframe ke Daily", itu artinya kamu harus pastikan chart menampilkan satu candlestick per satu hari, bukan per jam atau per menit.

### Support dan Resistance (level dukungan dan tahanan)
Ini konsep paling penting yang perlu kamu pahami secara visual sebelum rekam Video 3. Lihat diagram di bawah ini dulu.

![Support and Resistance Diagram](CARTA_SR_diagram.png)

**Resistance** adalah level harga di mana candlestick berulang kali mencoba naik ke atas level itu, tapi berulang kali gagal dan malah balik turun lagi. Bayangkan seperti ada langit-langit tak terlihat yang menahan harga supaya tidak naik lebih tinggi. Di diagram di atas, garis oranye putus-putus adalah resistance, dan lingkaran-lingkaran kecil menandai titik-titik di mana harga "menyentuh" level itu lalu gagal menembusnya.

**Support** adalah kebalikannya: level harga di mana candlestick berulang kali mencoba turun ke bawah level itu, tapi berulang kali gagal dan malah balik naik lagi. Seperti ada lantai tak terlihat yang menahan harga supaya tidak jatuh lebih dalam. Di diagram, garis biru putus-putus adalah support.

Yang perlu kamu cari di chart asli: minimal dua titik (idealnya tiga) di mana harga menyentuh area yang kurang lebih sama, lalu berbalik arah. Itu levelnya. Tidak perlu presisi sampai ke desimal, cukup kelihatan jelas secara visual bahwa ada beberapa candlestick yang "mentok" di sekitar harga yang sama.

### Indikator (Indicator)
Indikator adalah alat bantu hitung yang ditampilkan di atas atau di bawah chart untuk membaca kondisi pasar. Kamu tidak perlu paham cara kerja matematikanya, cukup tahu nama-nama berikut karena akan disebut di instruksi video:
- **RSI**: muncul sebagai grafik kecil terpisah di bagian bawah chart, biasanya berbentuk garis yang naik turun antara angka 0 sampai 100.
- **MACD**: sama seperti RSI, muncul di panel terpisah di bawah chart utama, biasanya berbentuk garis dan batang-batang kecil.
- **Bollinger Bands**: berbeda dari dua di atas, ini muncul langsung menempel di atas candlestick di chart utama, berbentuk seperti dua garis melengkung (pita) yang mengapit harga dari atas dan bawah.
- **EMA**: juga muncul langsung di chart utama, berbentuk satu garis halus yang mengikuti pergerakan harga.

Jadi kalau kamu menambahkan RSI atau MACD, cari perubahannya di bagian BAWAH chart utama (akan muncul panel baru). Kalau kamu menambahkan Bollinger Bands atau EMA, cari perubahannya LANGSUNG DI ATAS candlestick yang sudah ada.

### Signal, Confidence Score, dan Trade Setup
Ini istilah yang dipakai di panel CARTA sendiri, bukan TradingView:
- **Signal**: kesimpulan CARTA soal arah yang mungkin diambil, berupa salah satu dari tiga kata: BUY, SELL, atau NEUTRAL.
- **Confidence score**: angka persentase yang menunjukkan seberapa yakin CARTA dengan signal itu. Semakin tinggi persentasenya, semakin kuat sinyalnya.
- **Trade Setup**: rincian angka seperti area entry (harga masuk), stop loss (batas rugi), dan target/take profit (T1, T2, T3), biasanya disertai grade A, B, atau C sebagai kualitas setup-nya.

### Market Cap
Market cap adalah total nilai sebuah coin di pasar (harga per coin dikali jumlah coin yang beredar). CARTA hanya mencakup coin dengan market cap di atas $100 juta. Untuk video 5, kamu perlu cari coin dengan market cap di BAWAH itu, cara ceknya ada di instruksi Video 5.

### USDT pair
Ini cuma istilah untuk pasangan trading, contohnya "BTCUSDT" artinya kamu melihat harga Bitcoin dihargakan dalam USDT (semacam mata uang digital yang nilainya disamakan dengan dolar Amerika). Semua contoh coin di panduan ini pakai format seperti ini.

---

## Persiapan Umum Sebelum Semua Recording

- **Chrome, bukan browser lain.** Extension CARTA itu format Manifest V3, dibuat untuk Chrome. Kalau mau pakai Edge atau Brave itu juga bisa karena basisnya Chromium, tapi untuk konsistensi visual, pakai Chrome biasa saja.
- **Jangan pakai mode Incognito.** Extension itu default-nya nonaktif di Incognito kecuali di-allow manual. Kalau lupa di-set, extension CARTA ga akan muncul sama sekali dan hasil recording sia-sia. Pakai jendela Chrome biasa.
- **Resolusi layar minimal 1920x1080.** Ini supaya teks di panel CARTA (angka, label indikator, dll) masih kebaca jelas waktu videonya diperkecil buat feed X.
- **Zoom level browser di 100%.** Cek dengan `Ctrl+0` (reset zoom) sebelum recording. Kalau ke-zoom in/out, layout panel bisa keliatan aneh.
- **Tema TradingView: gelap (dark theme).** Ini bukan wajib, tapi CARTA punya nuansa trading terminal jadi dark theme kemungkinan besar bakal lebih match sama branding-nya (orange accent bakal lebih nendang di background gelap). Kalau mau coba versi light theme juga silakan, tinggal bandingkan mana yang lebih match sama warna CARTA di panel-nya.
- **Sembunyikan info sensitif.** Kalau ada portfolio/watchlist pribadi yang kebuka di tab lain, tutup dulu. Video ini representasi publik CARTA, jangan sampai ada data pribadi ke-capture ga sengaja.
- **Rekam tiap video sebagai satu take utuh kalau bisa.** Lebih gampang buat proses editing nanti kalau motion-nya natural dan continuous, bukan potongan-potongan.
- **Cara cek apakah akun TradingView yang dipakai itu benar-benar free tier (Basic plan).** Ini penting khusus untuk Video 4. Cara paling gampang tanpa perlu bongkar menu pengaturan: coba tambahkan 2 indikator ke chart kosong, lalu coba tambahkan indikator ketiga. Kalau muncul semacam notifikasi atau penolakan, berarti akun itu memang di plan gratis dan aman dipakai untuk Video 4. Kalau indikator ketiga berhasil ditambahkan tanpa halangan, berarti akun itu sudah pakai plan berbayar, dan kamu perlu pakai akun lain (atau bikin akun baru tanpa login) khusus untuk Video 4.
- **Kalau tampilan yang kamu lihat sedikit berbeda dari yang dijelaskan di panduan ini** (misal posisi tombol geser sedikit, atau nama tombol sedikit beda), jangan panik. TradingView kadang update tampilannya. Cari tombol atau menu dengan nama atau fungsi yang paling mendekati deskripsi di panduan, itu kemungkinan besar yang dimaksud.

---

## VIDEO 1: Panel Tour, "CARTA Already Called It"

### Kenapa video ini penting
Ini adalah video paling dasar yang nunjukin CARTA benar-benar bekerja, bukan mockup. Fungsinya sebagai bukti visual pertama yang paling banyak orang bakal lihat.

### Yang harus disiapkan
Sebelum recording, buka dulu beberapa chart coin secara manual (bukan direkam), cek panel CARTA di masing-masing, dan pilih satu coin yang punya sinyal paling jelas, entah itu BUY atau SELL dengan confidence score yang tinggi (lihat penjelasan Signal dan Confidence Score di Bagian 0 kalau lupa artinya). Jangan pilih coin yang lagi NEUTRAL dengan confidence rendah, itu kurang punya daya tarik visual.

### Flow step-by-step
1. Buka TradingView, cari coin yang sudah dipilih di langkah persiapan (misal `BINANCE:BTCUSDT`). Cara cari coin: klik ikon kaca pembesar di pojok kiri atas chart (biasanya ada tulisan simbol coin yang lagi aktif di sebelahnya), ketik nama coin di kotak yang muncul, klik hasil yang sesuai.
2. Pastikan timeframe di-set ke Daily (klik dropdown interval di toolbar atas chart, biasanya bertuliskan angka seperti "1D", pilih "1D" atau "D" dari daftar yang muncul).
3. Begitu chart kebuka dan panel CARTA muncul, diamkan kursor dulu di area **Signal** (bagian yang nunjukin BUY/SELL/NEUTRAL beserta confidence score-nya). Tahan 2-3 detik supaya penonton video sempat baca.
4. Geser fokus ke bagian **S/R Levels** di panel. Tahan sebentar di angka-angka support dan resistance yang ditampilkan.
5. Lanjut ke bagian **Indicators**. Arahkan kursor secara perlahan ke 2-3 indikator yang ditampilkan (RSI, MACD, EMA, dll) satu per satu, biar penonton bisa lihat status masing-masing (above/below, crossover, dll).
6. Lanjut ke bagian **Trade Setup**. Tahan di area entry zone, stop loss, dan target (T1/T2/T3), serta grade setup-nya (A/B/C).
7. Terakhir, berhenti di bagian **CARTA's Call**, yaitu narasi 2-3 kalimat dari CARTA soal kondisi chart itu. Ini bagian paling penting untuk ditahan lama, minimal 4-5 detik, karena banyak penonton bakal pause video buat baca teks ini.
8. Tutup video dengan tampilan chart dan panel secara penuh selama 2-3 detik terakhir.

### Estimasi durasi
30 sampai 45 detik.

### Ide caption
"this is what was already on the chart when we opened it."

---

## VIDEO 2: Symbol Switching, "The Chart Never Waits"

### Kenapa video ini penting
Ini nunjukin klaim paling kuat dari CARTA secara langsung: begitu ganti coin, analisa langsung ada, tidak ada proses loading atau nunggu AI mikir.

### Yang harus disiapkan
Siapkan daftar 4-5 coin populer yang mau dipakai buat switching, contoh: BTCUSDT, ETHUSDT, SOLUSDT, BNBUSDT, XRPUSDT. Pastikan semuanya sudah tercover di CARTA (cek dulu manual sebelum rekam, artinya buka satu-satu dulu dan pastikan panel CARTA muncul dengan data lengkap, bukan pesan "belum tercover").

### Flow step-by-step
1. Buka chart coin pertama, tunggu sampai panel CARTA benar-benar selesai muncul.
2. Klik ikon kaca pembesar (symbol search) di pojok kiri atas chart, atau langsung ketik simbol coin berikutnya selagi kursor fokus di area chart (TradingView otomatis membuka kotak pencarian simbol begitu kamu mulai mengetik huruf apapun ketika chart sedang jadi fokus).
3. Ketik simbol coin kedua, misalnya "ETHUSDT", lalu Enter.
4. Begitu chart baru kebuka, arahkan kursor ke panel CARTA yang sudah ter-update, tahan sebentar.
5. Ulangi proses ini untuk 3-4 coin berikutnya secara berurutan dalam satu take yang sama, jangan berhenti rekam di antara pergantian coin.
6. Usahakan tempo pergantian konsisten, jangan terlalu buru-buru di satu coin lalu lambat di coin lain.

### Catatan
Take ini nanti kemungkinan besar akan dipercepat sedikit di proses editing supaya iramanya terasa cepat dan punchy, jadi kamu tidak perlu buru-buru saat rekam, cukup rekam dengan tempo natural dan biarkan proses speed-up dilakukan belakangan.

### Estimasi durasi
20 sampai 30 detik (sebelum speed up di editing).

### Ide caption
"switched coins five times. panel never had to catch up."

---

## VIDEO 3: Manual vs CARTA, "We Drew It By Hand First"

### Kenapa video ini penting
Ini video paling kuat secara konsep karena nunjukin secara visual kerja manual yang biasa dilakukan trader (gambar S/R pakai tangan) dibandingkan sama apa yang CARTA sudah sediakan. Tapi ini juga video paling teknis untuk direkam, ikuti detail di bawah dengan hati-hati. Kalau kamu belum baca penjelasan Support dan Resistance di Bagian 0, baca dulu sebelum lanjut, karena seluruh video ini bergantung sama konsep itu.

### PENTING, baca sebelum rekam video ini
Tidak ada jaminan angka S/R yang CARTA tampilkan bakal persis sama dengan garis yang kamu gambar manual, karena itu tergantung data live saat rekaman berlangsung. Jadi sebelum take final, coba dulu di 2-3 coin berbeda, lihat mana yang levelnya paling terlihat align secara visual antara hasil gambar manual dan level dari CARTA. Baru rekam take final di coin yang hasilnya paling meyakinkan. Jangan langsung take di percobaan pertama.

### Flow step-by-step
1. Buka chart sebuah coin, set ke timeframe Daily.
2. Sebelum membuka atau fokus ke panel CARTA, cari dulu di chart itu: lihat sepanjang candlestick yang tampil, cari area harga di mana ada minimal 2 candlestick (idealnya 3) yang puncaknya kurang lebih mentok di ketinggian yang sama, lalu tiap kali harga sampai situ dia balik turun lagi. Itu calon resistance kamu. Lakukan hal yang sama untuk mencari support: cari area harga di mana ada minimal 2 candlestick yang dasarnya kurang lebih di kedalaman yang sama, lalu tiap kali harga sampai situ dia balik naik lagi. Lihat lagi diagram di Bagian 0 kalau butuh contoh visual.
3. Kalau susah menemukan pola yang jelas di satu coin, coba zoom out chart (scroll mouse ke bawah di atas area chart, atau geser slider zoom di pojok kanan bawah) supaya kamu lihat rentang waktu lebih panjang, biasanya pola support/resistance lebih jelas kelihatan kalau melihat beberapa bulan candlestick sekaligus, bukan cuma beberapa minggu.
4. Setelah menemukan titik resistance yang kamu anggap paling jelas, arahkan kursor tepat ke titik harga itu (posisikan kursor sejajar dengan puncak candlestick yang mentok tadi), lalu tekan `Alt+H` (Windows) atau `Option+H` (Mac). Garis horizontal otomatis muncul persis di titik itu.
5. Ulangi untuk titik support: arahkan kursor ke titik harga dasar candlestick yang sudah diidentifikasi, tekan `Alt+H` lagi.
6. Opsional tapi disarankan untuk kejelasan video: beri label di masing-masing garis. Klik kanan pada garis, pilih Settings, buka tab Text, centang kotak Text, ketik "Resistance" atau "Support" di kotak yang muncul.
7. Diamkan tampilan ini selama beberapa detik, biar penonton sempat lihat proses manual ini butuh usaha dan observasi.
8. Sekarang arahkan fokus ke panel CARTA yang ada di layar yang sama. Highlight dengan kursor bagian **S/R Levels** di panel.
9. Kalau angka dari CARTA dekat atau match dengan garis yang sudah digambar manual, arahkan kursor bolak-balik sebentar antara garis manual dan angka di panel CARTA supaya penonton menangkap perbandingannya.
10. Akhiri dengan tampilan penuh: garis manual yang sudah digambar dan panel CARTA terlihat bersamaan di layar.

### Kalau hasilnya tidak cocok
Ini normal, tidak semua coin punya pola support/resistance yang rapi setiap saat. Kalau di satu coin hasilnya tidak meyakinkan, hapus garis yang sudah digambar (klik kanan garis, pilih Remove, atau klik garis lalu tekan tombol Delete di keyboard) dan coba coin lain. Tidak masalah kalau butuh coba 3-4 coin sebelum ketemu yang pas.

### Estimasi durasi
30 sampai 40 detik.

### Ide caption
"we drew the levels by hand first. then we opened CARTA."

---

## VIDEO 4: Indicator Limit, "7 Indicators, 2 Slots"

### Kenapa video ini penting
Ini video yang paling langsung nunjukin batasan nyata yang dialami trader di TradingView versi gratis, dikontraskan sama apa yang CARTA sudah kerjakan duluan.

### Fakta yang harus benar
TradingView versi gratis (Basic plan) membatasi maksimal **2 indikator per chart**. Ini yang harus tampil di video, jangan sampai salah coba nambah lebih dari 2.

### Yang harus disiapkan
Pastikan akun TradingView yang dipakai untuk demo memang di plan gratis (Basic). Cara cek ada di bagian "Persiapan Umum" di atas.

### Flow step-by-step
1. Buka chart sebuah coin dengan timeframe Daily, chart masih kosong tanpa indikator tambahan.
2. Cari tombol berlabel **Indicators** di baris toolbar bagian atas chart (biasanya ada di deretan tombol/ikon di atas area candlestick, tulisannya persis "Indicators"). Klik tombol itu.
3. Di kotak pencarian yang muncul, ketik "RSI", klik hasil pertama untuk menambahkannya ke chart. RSI akan muncul sebagai panel baru di bagian BAWAH chart utama (lihat penjelasan di Bagian 0 kalau lupa).
4. Buka lagi dialog Indicators (klik tombol yang sama), ketik "Bollinger Bands", klik untuk menambahkan yang kedua. Bollinger Bands akan muncul LANGSUNG DI ATAS candlestick di chart utama, berbentuk dua garis melengkung yang mengapit harga.
5. Sekarang sudah di titik limit (2 indikator). Coba tambah satu lagi, misalnya buka dialog Indicators lagi, ketik "MACD" dan coba klik untuk menambahkannya.
6. Di titik ini TradingView akan menampilkan semacam notifikasi atau pop-up yang bilang limitnya sudah tercapai (bentuk persisnya bisa berupa toast notification kecil di pojok layar atau modal di tengah layar, tergantung versi TradingView saat ini). Tangkap momen ini di layar, karena ini bukti visual paling kuat buat video ini. Kalau ternyata tidak muncul notifikasi apapun dan MACD tetap tidak bisa ditambahkan begitu saja (chart tidak berubah), itu juga tanda kamu sudah kena limit, cukup tunjukkan chart yang tetap di 2 indikator sebagai buktinya.
7. Tutup dialog itu, lalu pindahkan fokus kamera ke panel CARTA di sisi lain layar yang sudah menampilkan semua indikator (RSI, MACD, EMA, Bollinger, ATR, Volume, dan lainnya) lengkap dengan interpretasinya masing-masing.
8. Tahan tampilan panel CARTA ini selama beberapa detik sebagai penutup.

### Estimasi durasi
25 sampai 35 detik.

### Ide caption
"tradingview free plan gives you two indicator slots. CARTA already read seven."

---

## VIDEO 5: Uncharted Territory, "CARTA Doesn't Guess"

### Kenapa video ini penting
Ini video soal kejujuran produk, yang justru jadi trust signal. CARTA ngaku terus terang kalau ada coin yang belum tercover, bukannya asal ngarang jawaban.

### Yang harus disiapkan
Cari satu coin dengan market cap di bawah $100 juta. Caranya: buka `coingecko.com` di tab terpisah (tab ini tidak perlu ikut direkam), ketik nama coin di kotak pencarian di bagian atas halaman, klik coin yang muncul, lihat angka di sebelah label "Market Cap" di halaman detail coin itu. Kalau angkanya di bawah $100,000,000, coin itu bisa dipakai. Pastikan coin itu juga punya pair USDT yang bisa dicari di TradingView.

### Flow step-by-step
1. Mulai dari chart coin yang SUDAH tercover CARTA (market cap di atas $100 juta), biarkan panel CARTA full muncul dengan data lengkap selama beberapa detik.
2. Pindah simbol ke coin kecil yang sudah dicek di luar cakupan CARTA (cara pindah simbol sama seperti di Video 2: klik ikon kaca pembesar atau langsung ketik nama coin).
3. Tangkap di layar pesan yang muncul dari CARTA (kemungkinan berupa keterangan bahwa coin itu belum masuk cakupan analisa). Catat persis kata-katanya di panel untuk referensi nanti, karena ini teks asli dari produk, bukan sesuatu yang perlu direka-reka.
4. Tahan tampilan ini sebentar supaya jelas terbaca.
5. Pindah kembali ke coin yang tercover di awal, sebagai penutup yang menunjukkan kontras.

### Estimasi durasi
20 sampai 25 detik.

### Ide caption
"CARTA doesn't guess. if it hasn't mapped the coin yet, it tells you straight."

---

## VIDEO 6: Landing Page Scroll-Through

### Kenapa video ini penting
Video ini untuk nunjukin sisi visual dan craft dari brand CARTA secara keseluruhan, bukan cuma fitur teknis.

### Flow step-by-step
1. Buka `https://www.cartatrade.tech/` di tab baru, mulai dari paling atas halaman.
2. Tahan 2-3 detik di bagian hero, biar headline utama dan tiga angka statistik (150+ coin, 4h refresh, $100M+ marketcap filter) sempat terbaca.
3. Scroll perlahan dan konsisten ke bagian "The Problem", tahan sebentar di daftar masalah yang ditampilkan.
4. Lanjut scroll ke bagian yang menjelaskan CARTA sebagai AI agent yang jalan lewat Claude, tahan sebentar di bagian ini karena menyebut nama Claude secara eksplisit.
5. Lanjut scroll ke bagian **Coverage**, yaitu tabel berisi daftar coin dengan harga, perubahan 24 jam, sinyal, dan confidence score. Ini bagian paling menarik secara visual karena kelihatan seperti data yang hidup, jadi perlambat scroll di bagian ini, atau kalau tabelnya bisa di-scroll sendiri secara internal, scroll sedikit di dalam tabelnya untuk menunjukkan lebih banyak baris data.
6. Lanjut scroll ke bagian Features (Signal, S/R Levels, Indicators, Trade Setup, CARTA's Call, Auto-detect), dengan tempo lebih cepat karena ini bagian yang lebih ringkas.
7. Lanjut scroll ke bagian "The Territory", yaitu bagian lore dengan kutipan manifesto CARTA. Tahan agak lama di sini, sekitar 3-4 detik, karena ada kutipan yang cukup kuat secara emosional dan bagus untuk jadi momen visual yang diam sejenak.
8. Akhiri scroll di bagian paling bawah, yaitu bagian install dengan tombol "Download CARTA – Free".

### Estimasi durasi
25 sampai 35 detik total. Jangan terlalu lama, video landing page yang kepanjangan biasanya kehilangan penonton di X.

### Ide caption
Tidak wajib pakai caption panjang, cukup sesuatu yang singkat seperti "the map, mapped out" atau langsung dorong ke link tanpa banyak teks tambahan.

---

## VIDEO 7: Cara Install Extension di Chrome

### Kenapa video ini penting
Ini video paling fungsional dari semuanya, tujuannya supaya orang yang lihat video ini di X bisa langsung ikuti dan install CARTA sendiri tanpa bingung.

### Flow step-by-step, sangat detail
1. Buka Chrome, kunjungi `https://www.cartatrade.tech/`.
2. Scroll ke bagian install (atau klik tombol "Add to Chrome" di hero yang akan otomatis mengarahkan ke bagian itu).
3. Klik tombol **"Download CARTA – Free"**. File .zip akan otomatis terdownload, biasanya muncul sebagai bar kecil di bagian bawah jendela Chrome.
4. Klik file .zip yang baru terdownload itu (baik dari bar download di Chrome atau dari folder Downloads).
5. **Windows**: klik kanan pada file .zip, pilih "Extract All...", pilih lokasi folder tujuan (sarankan Desktop atau Documents, folder yang gampang diingat dan TIDAK akan dihapus nanti), klik "Extract".
   **Mac**: cukup double-click file .zip, akan otomatis membuat folder baru hasil ekstrak di lokasi yang sama.
6. **Penting untuk disebutkan di video atau di caption**: folder hasil ekstrak ini harus tetap ada dan tidak boleh dihapus atau dipindahkan setelah instalasi, karena Chrome membaca file extension langsung dari folder itu. Kalau folder dihapus, CARTA akan berhenti bekerja.
7. Buka tab baru di Chrome, ketik `chrome://extensions` di address bar, tekan Enter.
8. Di pojok kanan atas halaman itu, cari toggle switch bertuliskan **"Developer mode"**, klik untuk mengaktifkannya. Begitu aktif, tiga tombol baru akan muncul: "Load unpacked", "Pack extension", dan "Update".
9. Klik tombol **"Load unpacked"**. Sebuah jendela file picker akan terbuka.
10. Di jendela file picker itu, cari dan klik folder hasil ekstrak dari langkah 5 (klik pada foldernya, jangan masuk ke dalam folder dan pilih file di dalamnya), lalu klik "Select Folder" (Windows) atau "Open" (Mac).
11. CARTA sekarang akan muncul sebagai kartu baru di halaman extensions, lengkap dengan ikon dan nama CARTA.
12. Opsional tapi bagus untuk ditunjukkan: klik ikon puzzle piece di pojok kanan atas toolbar Chrome (dekat address bar), cari CARTA di daftar yang muncul, klik ikon pin di sebelahnya supaya CARTA muncul permanen di toolbar Chrome.
13. Buka tab baru, kunjungi tradingview.com, buka chart pair apapun yang diakhiri USDT dengan market cap di atas $100 juta (misalnya BTCUSDT).
14. Panel CARTA akan otomatis muncul dalam beberapa detik.
15. Kalau di titik ini panel CARTA belum muncul, refresh tab TradingView-nya (`Ctrl+R` di Windows, `Cmd+R` di Mac), karena kadang extension yang baru saja di-load butuh refresh dulu di tab yang sudah terbuka sebelumnya.

### Estimasi durasi
45 detik sampai 1 menit 15 detik. Ini video paling panjang dari semuanya karena memang instruksional, itu wajar.

### Ide caption
"install takes about a minute. here's the whole thing."

---

## Ringkasan Prioritas

Kalau waktu terbatas dan tidak semua 7 video bisa selesai sekaligus, urutan prioritas yang disarankan:

1. Video 7 (cara install), karena ini fungsional dan akan terus relevan dipakai berulang kali di berbagai post.
2. Video 1 (panel tour), karena ini bukti paling dasar bahwa CARTA benar-benar bekerja.
3. Video 3 (manual vs CARTA), karena ini konsep paling kuat secara storytelling.
4. Video 6 (landing page), karena ini menunjukkan keseriusan produk secara visual.
5. Video 2 (symbol switching), video 4 (indicator limit), dan video 5 (uncharted) bisa menyusul belakangan sebagai variasi konten tambahan.

## Kalau Bingung di Tengah Jalan

- Kalau lupa arti sebuah istilah, kembali ke Bagian 0 di atas.
- Kalau tombol atau menu yang disebutkan di panduan tidak persis sama posisinya, cari yang namanya atau fungsinya paling mendekati, TradingView kadang sedikit mengubah tata letak.
- Kalau panel CARTA tidak muncul sama sekali di satu chart, coba refresh halaman dulu (`Ctrl+R` / `Cmd+R`) sebelum menyimpulkan ada yang salah.
- Kalau ragu apakah sesuatu di layar sudah benar dalam Bahasa Inggris atau belum, screenshot dan tanya dulu sebelum lanjut rekam video penuh.

## Referensi Cepat Shortcut TradingView

- Horizontal Line: `Alt+H` (Windows) / `Option+H` (Mac)
- Trend Line: `Alt+T` (Windows) / `Option+T` (Mac)
- Buka dialog Indicators: klik tombol "Indicators" di toolbar atas chart
- Ganti timeframe: klik dropdown interval di toolbar atas chart (contoh tampilan: "1D"), atau ketik huruf "D" lalu Enter selagi fokus di area chart
- Buka symbol search: klik ikon kaca pembesar di toolbar atas chart, atau langsung ketik simbol coin selagi fokus di area chart
- Hapus garis yang sudah digambar: klik kanan garis lalu pilih Remove, atau klik garis lalu tekan Delete
