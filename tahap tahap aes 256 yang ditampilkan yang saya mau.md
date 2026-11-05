# AES-256-GCM: Panduan Lengkap Tiap Tahap

Nov 4, 2026 · @Dhede

AES-256-GCM mengubah plaintext menjadi ciphertext dan tag lewat delapan tahap, dan setiap tahap di bawah ini dijelaskan beserta alasannya.

## Gambaran besar

AES-256-GCM adalah **AEAD** (*Authenticated Encryption with Associated Data*): ia menyembunyikan isi pesan **dan** membuktikan bahwa pesan tidak diubah. Ia tersusun dari tiga komponen.

| Komponen | Fungsi | Alasan dipakai |
| --- | --- | --- |
| **AES-256** (block cipher) | Mengacak 16 byte memakai key 32 byte | Aman, cepat (ada instruksi hardware AES-NI), dan menjadi standar |
| **CTR** (counter mode) | Mengubah AES menjadi *stream cipher* untuk **kerahasiaan** | Tanpa padding, tiap blok bisa diproses paralel |
| **GHASH** | Menghitung *authentication tag* untuk **keaslian dan integritas** | Mendeteksi perubahan sekecil satu bit |

**Mengapa tidak cukup AES dengan mode ECB atau CBC?**

- **ECB**: blok plaintext yang sama menghasilkan blok ciphertext yang sama, sehingga pola data bocor.
- **CBC**: hanya menyembunyikan isi. Ciphertext bisa diubah tanpa terdeteksi, dan implementasi dengan padding rentan *padding oracle attack*.
- **GCM**: menyembunyikan isi sekaligus mendeteksi setiap perubahan.

**Input dan output**

|  | Isi |
| --- | --- |
| **Input** | Key 32 byte (256 bit); IV/nonce 12 byte (96 bit); plaintext; AAD (opsional, data yang tidak dienkripsi tetapi keasliannya harus terjamin, misalnya header atau ID pengguna) |
| **Output** | Ciphertext (panjangnya **sama persis** dengan plaintext) dan tag 16 byte |

**Delapan tahap secara ringkas**

1. Derivasi kunci menjadi key 256-bit
2. Key expansion menjadi 15 round key
3. IV, AAD, hash subkey H, dan counter awal J₀
4. Mesin AES-256 (14 ronde)
5. Enkripsi CTR
6. GHASH
7. Authentication tag dan output
8. Dekripsi: verifikasi tag, lalu CTR

Tahap 4 bukan langkah yang berdiri sendiri: mesin AES dipanggil oleh tahap 3 (menghitung H), tahap 5 (membuat keystream), dan tahap 7 (menghitung E\_K(J₀)).

## Tahap 1: Derivasi kunci menjadi key 256-bit

AES-256 membutuhkan key **tepat 32 byte yang acak**. Jika key berasal dari password, password itu harus diubah dulu lewat fungsi derivasi kunci (KDF).

**Langkah-langkahnya**

1. Buat **salt** acak 16 byte dengan CSPRNG (di Python: `os.urandom(16)`).
2. Jalankan KDF dengan input password dan salt, minta output **32 byte**.
   - PBKDF2-HMAC-SHA256 dengan jumlah iterasi tinggi (OWASP menyarankan 600.000), atau
   - Argon2id (lebih baik terhadap serangan GPU).
3. Simpan **salt** bersama ciphertext. Salt tidak rahasia; password dan key tidak boleh disimpan.

**Alasan tiap keputusan**

- **Mengapa tidak memakai password langsung?** Password pendek, mudah ditebak, dan panjangnya tidak pas 32 byte.
- **Mengapa bukan SHA-256 saja?** SHA-256 dirancang cepat, sehingga penyerang bisa mencoba miliaran tebakan per detik. PBKDF2 dan Argon2 sengaja dibuat lambat (iterasi atau memori besar) agar *brute force* mahal.
- **Mengapa memakai salt?** Salt membuat dua pengguna dengan password sama menghasilkan key berbeda, dan menggagalkan serangan *rainbow table* (tabel hash yang dihitung lebih dulu).
- **Mengapa salt harus acak dan unik?** Salt yang bisa ditebak atau dipakai ulang mengembalikan kelemahan yang ingin dicegah.
- **Mengapa output 32 byte?** Itu persis ukuran key AES-256.

Jika key sudah berupa 32 byte acak dari CSPRNG, tahap ini tidak diperlukan karena key itu sudah punya entropi penuh.

## Tahap 2: Key expansion (1 key menjadi 15 round key)

Key 32 byte (8 word, satu word = 4 byte) diperluas menjadi **60 word**, yaitu **15 round key × 16 byte**. Ini cukup untuk AddRoundKey awal (1) ditambah 14 ronde (14).

**Aturan menghitung word W\[i\], untuk i = 8 sampai 59**

| Kondisi | Rumus |
| --- | --- |
| i mod 8 = 0 | W\[i\] = W\[i−8\] ⊕ SubWord(RotWord(W\[i−1\])) ⊕ Rcon\[i/8\] |
| i mod 8 = 4 (khusus AES-256) | W\[i\] = W\[i−8\] ⊕ SubWord(W\[i−1\]) |
| lainnya | W\[i\] = W\[i−8\] ⊕ W\[i−1\] |

W\[0\] sampai W\[7\] adalah key asli.

**Arti operasi**

- **RotWord**: memutar 4 byte satu word satu posisi ke kiri, misalnya \[a, b, c, d\] menjadi \[b, c, d, a\].
- **SubWord**: tiap byte diganti lewat tabel S-Box.
- **Rcon**: konstanta ronde (01, 02, 04, 08, 10, 20, 40 untuk AES-256) yang di-XOR ke byte pertama word.

**Alasan tiap bagian**

- **Mengapa butuh banyak round key?** Jika semua ronde memakai key yang sama atau mirip, struktur matematika AES lebih mudah diserang (*slide attack*, *related-key attack*).
- **Mengapa ada SubWord?** S-Box memasukkan sifat non-linear ke dalam round key, sehingga round key tidak bisa dihitung mundur dengan persamaan linear.
- **Mengapa ada RotWord?** Memutar byte menyebarkan pengaruh satu byte key ke posisi lain dalam word berikutnya.
- **Mengapa ada Rcon?** Konstanta berbeda tiap ronde mematahkan simetri antar ronde, sehingga dua ronde tidak pernah memakai round key yang tampak sama.
- **Mengapa AES-256 punya SubWord tambahan (i mod 8 = 4)?** Key 256-bit lebih panjang, dan pencampuran ekstra di tengah setiap kelompok 8 word menjaga key schedule tetap sulit dianalisis.
- **Mengapa dihitung sekali di awal?** Round key hanya bergantung pada key, jadi cukup dihitung satu kali lalu dipakai untuk semua blok.

## Tahap 3: IV, AAD, hash subkey H, dan counter awal J₀

Tahap ini menyiapkan semua nilai bantu sebelum data disentuh. Ada empat nilai.

**3.1 IV (nonce) 12 byte**

Buat 12 byte acak dengan CSPRNG untuk **setiap** enkripsi. IV tidak rahasia dan disimpan di samping ciphertext.

- *Mengapa 12 byte?* Ini ukuran yang dirancang khusus untuk GCM. Dengan 96 bit, counter awal bisa dibentuk langsung tanpa hitungan tambahan. Ukuran lain memaksa GCM menjalankan GHASH untuk membentuk J₀, yang lebih lambat dan lebih rumit.
- *Mengapa harus unik?* IV yang sama dengan key yang sama membuat keystream berulang, dan itu membocorkan isi pesan serta kunci autentikasi (lihat bagian kesalahan fatal).
- *Mengapa boleh tidak rahasia?* Keamanan GCM bertumpu pada key, bukan pada IV. IV hanya perlu berbeda.

**3.2 AAD (opsional)**

Data yang ingin dijamin keasliannya tetapi tidak perlu disembunyikan, misalnya header atau ID pengguna.

- *Mengapa ada?* AAD ikut di-hash, sehingga jika AAD diubah, tag gagal diverifikasi dan data pendamping tidak bisa dipalsukan atau dipindahkan ke pesan lain.

**3.3 Hash subkey H**

```latex
H = E_K(0^{128})
```

H adalah hasil enkripsi AES atas satu blok berisi 128 bit nol.

- *Mengapa dari key utama?* GHASH butuh kunci rahasia sendiri. Daripada meminta key kedua, GCM menurunkannya dari K. Tanpa K, H tidak bisa ditebak.
- *Mengapa blok nol?* Input tetap yang tidak bergantung pada pesan, sehingga H cukup dihitung sekali per key.

**3.4 Counter awal J₀ (untuk IV 96 bit)**

```latex
J_0 = IV \parallel 0x00000001
```

J₀ adalah IV (12 byte) ditambah counter 32-bit bernilai 1.

- *Mengapa ada counter 32-bit?* Counter yang bertambah membuat input AES berbeda untuk tiap blok, dan itulah yang menjamin keystream tidak berulang.
- *Mengapa J₀ dipisahkan dari data?* J₀ dipakai khusus untuk menutupi tag (tahap 7). Enkripsi data dimulai dari counter 2. Jika J₀ juga dipakai untuk data, satu keystream akan dipakai dua kali dan itu membocorkan informasi.
- *Bagaimana counter bertambah?* Operasi inc32 hanya menaikkan 4 byte terakhir; 12 byte IV tetap.

## Tahap 4: Mesin AES-256 (14 ronde)

Di GCM, AES hanya dipakai sebagai fungsi **E\_K(blok 16 byte) → blok 16 byte yang tampak acak**. Fungsi ini dipanggil di tahap 3, 5, dan 7. GCM tidak pernah memakai arah dekripsi AES.

**4.1 State dan jumlah ronde**

Blok 16 byte disusun menjadi matriks **4×4 byte** bernama *state*, diisi per kolom: empat byte pertama mengisi kolom pertama, dan seterusnya. AES-256 memakai **14 ronde** (AES-128 memakai 10, AES-192 memakai 12).

- *Mengapa banyak ronde?* Satu transformasi saja belum cukup acak. Pengulangan membuat efek *confusion* dan *diffusion* (konsep Shannon) menumpuk sampai tidak ada pola tersisa. Key lebih panjang butuh ronde lebih banyak agar margin keamanannya terjaga.

**4.2 Alur satu blok**

1. **AddRoundKey awal**: XOR state dengan round key ke-0.
2. **Ronde 1 sampai 13**: SubBytes, ShiftRows, MixColumns, AddRoundKey.
3. **Ronde 14 (terakhir)**: SubBytes, ShiftRows, AddRoundKey (tanpa MixColumns).

**4.3 Empat operasi, cara kerja, dan alasannya**

| Operasi | Cara kerja | Alasan |
| --- | --- | --- |
| **SubBytes** | Tiap byte diganti lewat tabel S-Box: invers perkalian di GF(2⁸), lalu transformasi affine | Satu-satunya operasi **non-linear** di AES. Tanpa itu, AES hanya rangkaian operasi linear yang bisa diselesaikan sebagai persamaan aljabar. Menghasilkan *confusion* |
| **ShiftRows** | Baris 0 tidak bergeser; baris 1 bergeser 1 posisi ke kiri, baris 2 sebanyak 2, baris 3 sebanyak 3 | Tanpa ini, tiap kolom diproses terpisah selamanya. ShiftRows menyebarkan byte satu kolom ke kolom lain |
| **MixColumns** | Tiap kolom (4 byte) dikalikan matriks tetap di GF(2⁸) | Menyebarkan pengaruh satu byte ke empat byte dalam kolom. Bersama ShiftRows, setelah 2 ronde satu byte input sudah memengaruhi seluruh 16 byte (*diffusion*) |
| **AddRoundKey** | XOR state dengan round key | Satu-satunya tempat key masuk. XOR dipilih karena cepat dan *reversible* |

**4.4 Contoh dengan angka nyata**

- **SubBytes**: byte `0x53` diganti menjadi `0xED` oleh S-Box.
- **MixColumns**: kolom `[db, 13, 53, 45]` menjadi `[8e, 4d, a1, bc]`. Perkalian dilakukan di GF(2⁸) dengan polinomial pereduksi x⁸ + x⁴ + x³ + x + 1, sehingga hasilnya tetap satu byte.
- **ShiftRows** pada baris 1 yang berisi `[a, b, c, d]` menghasilkan `[b, c, d, a]`.

**4.5 Mengapa ronde terakhir tanpa MixColumns?**

MixColumns di ronde terakhir tidak menambah keamanan, karena penyerang bisa membalikkannya tanpa key. Menghilangkannya juga membuat struktur dekripsi AES simetris dengan enkripsi.

Hasil seluruh proses ini adalah E\_K(x), yang dipakai sebagai "kotak hitam" pada tahap berikutnya.

## Tahap 5: Enkripsi CTR (plaintext menjadi ciphertext)

Plaintext dipotong menjadi blok 16 byte: P₁, P₂, …, Pₙ. Blok terakhir boleh lebih pendek.

**Langkah-langkahnya**

1. Mulai counter dari `IV ‖ 00000002` (J₀ sudah dipakai untuk tag).
2. Untuk tiap blok i, enkripsi counter dengan AES untuk mendapat keystream:

```latex
S_i = E_K(\text{counter}_i)
```

3. XOR keystream dengan plaintext:

```latex
C_i = P_i \oplus S_i
```

4. Naikkan counter 1 (inc32) lalu ulangi untuk blok berikutnya.
5. Untuk blok terakhir yang pendek, ambil keystream **sebanyak byte plaintext saja** (dipotong). Tidak ada padding.

**Alasan tiap bagian**

- **Mengapa XOR dengan keystream?** Itu setara *one-time pad* yang aman selama keystream tidak berulang. XOR juga *self-inverse*, sehingga dekripsi memakai operasi yang sama.
- **Mengapa counter berbeda tiap blok?** Blok plaintext yang sama menghasilkan ciphertext berbeda, jadi tidak ada kebocoran pola seperti pada ECB.
- **Mengapa tanpa padding?** Ukuran ciphertext sama dengan plaintext, dan tidak ada celah *padding oracle*.
- **Mengapa tiap blok independen?** Blok bisa diproses paralel dan diakses acak, sehingga cepat di CPU modern dengan AES-NI.
- **Mengapa dimulai dari counter 2?** Counter 1 (J₀) disimpan untuk menutupi tag, agar tidak ada keystream yang dipakai dua kali.

**Contoh mini** (angka keystream hanya ilustrasi)

Huruf `H` = `0x48`. Misal byte keystream = `0x3A`, maka ciphertext = `0x48 ⊕ 0x3A = 0x72`. Saat dekripsi, `0x72 ⊕ 0x3A = 0x48`, kembali ke `H`.

## Tahap 6: GHASH (sidik jari data)

GHASH meringkas AAD dan ciphertext menjadi satu nilai 128 bit yang bergantung pada rahasia H. Ini yang membuat perubahan sekecil satu bit bisa terdeteksi.

**Langkah-langkahnya**

1. Susun data yang akan di-hash:

```latex
X = \text{AAD}_{pad} \parallel C_{pad} \parallel \text{len(AAD)}_{64} \parallel \text{len}(C)_{64}
```

AAD dan ciphertext masing-masing di-padding nol sampai kelipatan 16 byte. Dua blok terakhir adalah panjang AAD dan panjang ciphertext dalam **bit**, masing-masing 8 byte.

2. Proses blok demi blok (tiap blok 128 bit), dengan Y₀ = 0:

```latex
Y_i = (Y_{i-1} \oplus X_i) \cdot H
```

3. Nilai Y terakhir adalah hasil GHASH.

**Tentang perkalian di GF(2¹²⁸)**

- Operasi "·" adalah perkalian polinomial biner modulo polinomial `x¹²⁸ + x⁷ + x² + x + 1`.
- Penjumlahan di sini adalah XOR, dan hasilnya selalu tetap 128 bit.
- GCM memakai urutan bit "terbalik" (bit paling kiri dianggap pangkat terendah), sehingga implementasi harus mengikuti konvensi standar GCM.

**Alasan tiap bagian**

- **Mengapa yang di-hash adalah ciphertext, bukan plaintext?** Ini pola *encrypt-then-MAC*: penerima bisa memeriksa keaslian **sebelum** mendekripsi, sehingga data jahat tidak pernah diproses.
- **Mengapa AAD ikut di-hash?** Agar data pendamping terlindungi dan terikat pada ciphertext ini.
- **Mengapa ada blok panjang di akhir?** Mencegah ambiguitas, misalnya menggeser byte antara AAD dan ciphertext yang menghasilkan hash sama.
- **Mengapa padding nol?** Agar setiap bagian berakhir tepat di batas blok 128 bit.
- **Mengapa dikalikan dengan H secara berantai?** Ini evaluasi polinomial di titik rahasia H. Mengubah satu bit di blok mana pun mengubah hasil akhir secara tak terduga, sementara penyerang tanpa H tidak bisa menghitung hash yang valid.
- **Mengapa GF(2¹²⁸)?** Perkaliannya sangat efisien di hardware (instruksi `PCLMULQDQ`).

## Tahap 7: Authentication tag dan output

Tag adalah GHASH yang ditutupi dengan keystream dari J₀, sehingga tag hanya bisa dibuat oleh pihak yang memegang key.

**Langkah-langkahnya**

1. Hitung tag:

```latex
\text{Tag} = \text{GHASH} \oplus E_K(J_0)
```

2. Ambil tag penuh 16 byte.
3. Kemas output: `IV (12) ‖ Ciphertext ‖ Tag (16)`, ditambah AAD jika dipakai (boleh disimpan terpisah).

**Alasan tiap bagian**

- **Mengapa GHASH ditutupi E\_K(J₀)?** GHASH sendirian bisa membocorkan H jika penyerang memegang banyak pasangan data dan hash. E\_K(J₀) unik per IV, sehingga tag tampak acak bagi pihak luar dan terikat pada IV tertentu.
- **Mengapa tag 16 byte penuh?** Tag lebih pendek memperbesar peluang tebakan tag yang benar. 16 byte memberi 128 bit perlindungan keaslian.
- **Mengapa IV, ciphertext, dan tag disimpan bersama?** Penerima membutuhkan ketiganya untuk dekripsi, dan ketiganya tidak rahasia. Yang rahasia hanya key.
- **Mengapa AAD tidak perlu dikirim di dalam output?** AAD sudah diketahui atau tersimpan di tempat lain (misalnya ID pengguna di database); yang penting nilainya sama saat verifikasi.

## Tahap 8: Dekripsi (ciphertext kembali menjadi plaintext)

Urutan dekripsi **terbalik** dari enkripsi: tag diperiksa lebih dulu, baru ciphertext didekripsi.

**Langkah-langkahnya**

1. **Pisahkan komponen**: ambil IV, ciphertext, tag, dan AAD (jika ada). Jika key berasal dari password, jalankan lagi tahap 1 dengan salt yang tersimpan.
2. **Turunkan ulang nilai bantu**: round key (tahap 2), lalu `H = E_K(0¹²⁸)` dan `J₀ = IV ‖ 00000001` (tahap 3).
3. **Hitung ulang tag** dari ciphertext yang diterima:

```latex
\text{Tag}' = \text{GHASH}_H(\text{AAD}, C) \oplus E_K(J_0)
```

4. **Bandingkan Tag' dengan tag yang diterima**, secara *constant-time*.
   - Cocok: lanjut ke langkah 5.
   - Tidak cocok: **tolak total**, jangan keluarkan plaintext sedikit pun.
5. **Dekripsi dengan CTR**, sama persis dengan enkripsi, counter mulai dari `IV ‖ 00000002`:

```latex
P_i = C_i \oplus E_K(\text{counter}_i)
```

6. Hasilnya adalah plaintext asli.

**Alasan tiap bagian**

- **Mengapa nilai bantu dihitung ulang?** Pengirim dan penerima memiliki K dan IV yang sama, sehingga semuanya bisa diturunkan tanpa dikirim.
- **Mengapa tag diperiksa sebelum dekripsi?** Ketidakcocokan berarti ciphertext, IV, atau AAD diubah, atau key salah. Mengeluarkan plaintext "sebagian" bisa dimanfaatkan penyerang (*chosen-ciphertext attack*).
- **Mengapa perbandingan harus constant-time?** Perbandingan biasa berhenti di byte pertama yang berbeda, dan selisih waktunya bisa membocorkan sedikit demi sedikit tag yang benar.
- **Mengapa dekripsi memakai E\_K, bukan fungsi dekripsi AES?** XOR bersifat *self-inverse*: (P ⊕ S) ⊕ S = P. Karena itu GCM tidak pernah memakai InvCipher, yang menyederhanakan implementasi dan mempercepat.

## Ringkasan: enkripsi dan dekripsi berdampingan

Perbedaan utamanya ada pada urutan: enkripsi menghitung CTR dulu lalu tag, dekripsi memverifikasi tag dulu lalu CTR.

| Langkah | Enkripsi | Dekripsi |
| --- | --- | --- |
| 1 | Derivasi key (KDF + salt) | Derivasi key dengan salt tersimpan |
| 2 | Key expansion | Key expansion |
| 3 | `H = E_K(0)`, `J₀ = IV ‖ 1` | `H = E_K(0)`, `J₀ = IV ‖ 1` |
| 4 | `Cᵢ = Pᵢ ⊕ E_K(IV ‖ i+1)` | `Tag' = GHASH(AAD, C) ⊕ E_K(J₀)` |
| 5 | `Tag = GHASH(AAD, C) ⊕ E_K(J₀)` | Cek `Tag' == Tag`; jika tidak cocok, **tolak** |
| 6 | Output: IV, C, Tag | `Pᵢ = Cᵢ ⊕ E_K(IV ‖ i+1)` |

## Kesalahan fatal yang harus dihindari

Kesalahan paling berbahaya adalah memakai ulang IV dengan key yang sama; sisanya menyangkut batas pemakaian dan cara memperlakukan tag.

1. **Jangan pernah memakai IV yang sama dengan key yang sama dua kali.** Keystream sama berarti `C₁ ⊕ C₂ = P₁ ⊕ P₂`, sehingga isi pesan bocor. Penyerang juga bisa memulihkan H dan **memalsukan tag**, jadi seluruh jaminan keaslian runtuh.
2. **Batasi jumlah enkripsi per key.** Dengan IV acak 96-bit, sebaiknya tidak lebih dari sekitar 2³² enkripsi per key agar peluang tabrakan IV tetap sangat kecil. Ganti key secara berkala.
3. **Batasi ukuran satu pesan.** Maksimal sekitar 64 GiB per pesan, karena counter hanya 32 bit.
4. **Selalu verifikasi tag sebelum memakai plaintext.** Library modern melakukannya otomatis dan melempar error bila tag salah.
5. **Jangan memakai key dari password secara langsung.** Gunakan KDF (PBKDF2 atau Argon2) dengan salt.
6. **Simpan IV dan tag bersama ciphertext.** Contoh format: `IV (12) ‖ Ciphertext ‖ Tag (16)`.

## Contoh kode dan urutan belajar

Kode berikut menjalankan kedelapan tahap lewat library `cryptography`: KDF, salt, IV acak, enkripsi, tag, dan verifikasi otomatis saat dekripsi.

```python
import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def derive_key(password: bytes, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32,
                     salt=salt, iterations=600_000)
    return kdf.derive(password)          # 32 byte = key AES-256

def encrypt(password: bytes, plaintext: bytes, aad: bytes = None) -> bytes:
    salt = os.urandom(16)                # salt acak, unik per enkripsi
    key = derive_key(password, salt)
    iv = os.urandom(12)                  # nonce 12 byte, unik per enkripsi
    ct = AESGCM(key).encrypt(iv, plaintext, aad)   # ciphertext + tag 16 byte
    return salt + iv + ct                # salt(16) | iv(12) | ciphertext | tag(16)

def decrypt(password: bytes, blob: bytes, aad: bytes = None) -> bytes:
    salt, iv, ct = blob[:16], blob[16:28], blob[28:]
    key = derive_key(password, salt)
    return AESGCM(key).decrypt(iv, ct, aad)        # InvalidTag jika data diubah
```

**Urutan belajar yang disarankan**

1. Pahami XOR dan keystream (CTR) dulu, karena ini inti kerahasiaan.
2. Pelajari struktur ronde AES (SubBytes, ShiftRows, MixColumns, AddRoundKey).
3. Pelajari key expansion.
4. Pelajari GHASH dan GF(2¹²⁸); pahami konsepnya dulu, bagian ini paling matematis.
5. Jalankan kode di atas, lalu ubah satu byte ciphertext dan lihat dekripsi ditolak dengan `InvalidTag`.
