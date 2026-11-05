<template>
  <div
    :class="[
      isEmbedded
        ? 'w-full flex flex-col space-y-4'
        : 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto'
    ]"
    @click.self="!isEmbedded && $emit('close')"
  >
    <div
      :class="[
        isEmbedded
          ? 'w-full flex flex-col text-slate-100'
          : 'w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col text-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto'
      ]"
    >
      <!-- Modal Header (When not embedded in Sandbox) -->
      <div v-if="!isEmbedded" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl border flex items-center justify-center shadow-inner shrink-0"
            :class="[
              isFailed
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : currentMode === 'encrypt'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
            ]"
          >
            <span class="text-lg">{{ isFailed ? '⚠️' : currentMode === 'encrypt' ? '🔒' : '🔓' }}</span>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-base font-bold text-slate-100">
                {{ currentMode === 'encrypt' ? 'Visualisasi Alur Lengkap Enkripsi AES-256-GCM' : 'Visualisasi Alur Lengkap Dekripsi AES-256-GCM' }}
              </h3>
              <span class="text-[10px] font-semibold tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase">
                AES-256-GCM
              </span>
              <span class="text-[10px] font-semibold tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
                14 Putaran • 60 Word
              </span>
            </div>
            <p class="text-xs text-slate-400">
              Semua tahapan kriptografi dari Derivasi Kunci, Key Expansion, Transformasi State Matrix 14 Putaran, hingga Tag GMAC.
            </p>
          </div>

        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="$emit('close')"
            class="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-2 rounded-xl transition-all cursor-pointer shrink-0"
            title="Tutup (Esc)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Sequential Pipeline Roadmap Banner -->
      <div class="mb-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-300">
              🗺️ Urutan Alur Kriptografi AES-256-GCM
            </span>
            <span class="text-[10px] font-mono text-slate-500">
              (NIST SP 800-38D & FIPS 197)
            </span>
          </div>

          <!-- View Mode Switch: Stepper vs All Stages -->
          <div class="flex items-center gap-1.5 self-start sm:self-auto bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <span class="text-slate-400 text-[11px] px-1 font-medium">Tampilan:</span>
            <button
              type="button"
              @click="viewMode = 'stepper'"
              class="px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer text-xs"
              :class="viewMode === 'stepper' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'"
            >
              Fokus Bertahap
            </button>
            <button
              type="button"
              @click="viewMode = 'all'"
              class="px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer text-xs"
              :class="viewMode === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'"
            >
              Semua Tahap Sekaligus
            </button>
          </div>
        </div>

        <!-- 8 Pipeline Stages Navigation Tabs -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 select-none">
          <button
            v-for="stg in pipelineStages"
            :key="stg.id"
            type="button"
            @click="currentStage = stg.id"
            class="p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group"
            :class="[
              currentStage === stg.id
                ? 'bg-indigo-950/80 border-indigo-400 shadow-md ring-1 ring-indigo-400/40'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
            ]"
          >
            <div class="flex items-center justify-between text-[10px] mb-1">
              <span class="font-bold uppercase tracking-wider" :class="currentStage === stg.id ? 'text-indigo-300' : 'text-slate-500'">
                Tahap {{ stg.id }}
              </span>
              <span class="text-xs">{{ stg.icon }}</span>
            </div>
            <div class="text-xs font-semibold leading-tight" :class="currentStage === stg.id ? 'text-white' : 'text-slate-300 group-hover:text-white'">
              {{ stg.title }}
            </div>
            <div class="text-[10px] text-slate-500 mt-1 truncate">
              {{ stg.subtitle }}
            </div>
          </button>
        </div>
      </div>

      <!-- Playback & Controls Toolbar -->
      <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-3 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <!-- Play / Pause / Step Controls -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            @click="togglePlay"
            class="px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            :class="[
              isPlaying
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500'
            ]"
          >
            <span>{{ isPlaying ? '⏸ Jeda Tur' : isCompleted ? '▶ Ulangi Tur' : '▶ Mulai Tur Alur' }}</span>
          </button>

          <!-- Step navigation -->
          <button
            type="button"
            @click="prevStage"
            :disabled="currentStage <= 1"
            class="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Tahap Sebelumnya"
          >
            ◀
          </button>
          <button
            type="button"
            @click="nextStage"
            :disabled="currentStage >= 8"
            class="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Tahap Berikutnya"
          >
            ▶
          </button>

          <button
            type="button"
            @click="restartAnimation"
            class="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            title="Mulai Ulang Animasi & Pipeline"
          >
            <span>↻</span> Reset
          </button>
        </div>

        <!-- Speed Selector -->
        <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <span class="text-slate-400 shrink-0 font-medium">Kecepatan:</span>
          <div class="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              v-for="spd in speedOptions"
              :key="spd.label"
              type="button"
              @click="speedMs = spd.ms"
              class="px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer"
              :class="speedMs === spd.ms ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'"
            >
              {{ spd.label }}
            </button>
          </div>
        </div>

        <!-- Progress Indicator -->
        <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span class="font-mono text-slate-300 font-semibold">
            Tahap {{ currentStage }} dari 8
          </span>
          <div class="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-300"
              :style="{ width: `${(currentStage / 8) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- STAGE CONTAINER (Controlled by currentStage in Stepper mode, or all shown in 'all' mode) -->
      <div class="space-y-6">

        <!-- ========================================================================= -->
        <!-- TAHAP 1: KEY DERIVATION FUNCTION (SHA-256)                                -->
        <!-- ========================================================================= -->
        <section
          v-if="viewMode === 'all' || currentStage === 1"
          class="rounded-2xl border border-indigo-500/25 bg-indigo-950/15 p-4 sm:p-5 transition-all"
        >
          <div class="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/20 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                  1
                </span>
                <h4 class="text-sm font-bold text-indigo-200 uppercase tracking-wide">
                  {{ keyDerivationMode === 'PBKDF2' ? 'Derivasi Kunci PBKDF2-HMAC-SHA-256' : 'Mode kompatibilitas kunci lama: SHA-256' }}
                </h4>
              </div>
              <p class="text-xs text-slate-400 mt-1">
                {{ keyDerivationMode === 'PBKDF2'
                  ? 'Password dan salt acak 16 byte diproses 600.000 kali oleh PBKDF2-HMAC-SHA-256. Hasilnya kunci 256-bit; salt boleh disimpan bersama ciphertext.'
                  : 'Catatan lama dibuat sebelum PBKDF2: password UTF-8 di-hash sekali dengan SHA-256. Format ini tetap bisa dibuka, tetapi lebih mudah ditebak bila password lemah.' }}
              </p>
            </div>
            <span class="self-start sm:self-auto px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-[11px] font-mono font-semibold text-indigo-300">
              {{ keyDerivationMode === 'PBKDF2' ? 'Password + Salt ➔ PBKDF2 ➔ 256-bit Key' : 'Password ➔ SHA-256 lama ➔ 256-bit Key' }}
            </span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Left: Passphrase & UTF-8 Bytes -->
            <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div class="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Passphrase Pengguna</span>
              <span class="text-slate-500 font-mono">{{ utf8KeyBytes.length }} Byte UTF-8</span>
              </div>
              <div class="p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-indigo-300 break-all select-all">
                {{ keyString || '(Kunci kosong - masukkan password pada input)' }}
              </div>

              <div class="pt-2 border-t border-slate-800/80">
                <span class="text-[11px] font-semibold text-slate-400 block mb-1">
                  Representasi Byte UTF-8:
                </span>
                <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 font-mono text-[10px]">
                  <span
                    v-for="(b, idx) in utf8KeyBytes"
                    :key="idx"
                    class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                    :title="`Byte UTF-8 ke-${idx}: 0x${byteToHex(b)}`"
                  >
                    {{ byteToHex(b) }}
                  </span>
                </div>
                <p class="text-[10px] text-slate-500 leading-relaxed">
                  Setiap byte di atas menjadi kunci HMAC. Password tidak digabung langsung dengan salt.
                </p>
              </div>
            </div>

            <!-- Right: 256-bit Hash Output & w[0..7] -->
            <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div class="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Output Kunci Simetris Master (32 Byte / 256 Bit)</span>
                <span class="text-emerald-400 font-mono">256-bit Key</span>
              </div>
              <div class="p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-emerald-300 break-all select-all">
                {{ keyBytesHex || 'Menghitung digest SHA-256...' }}
              </div>
              <div v-if="keyBytesHex" class="grid grid-cols-8 gap-1 font-mono text-[9px]">
                <div
                  v-for="(b, idx) in masterKeyBytes"
                  :key="idx"
                  class="rounded bg-slate-900 border border-emerald-500/20 p-1 text-center"
                  :title="`Byte ${idx}: 0x${byteToHex(b)}`"
                >
                  <span class="block text-slate-500">{{ idx.toString(16).padStart(2, '0') }}</span>
                  <span class="text-emerald-200">{{ byteToHex(b) }}</span>
                </div>
              </div>

              <!-- Division into first 8 words w[0..7] -->
              <div class="pt-2 border-t border-slate-800/80">
                <span class="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Partisi Awal ke 8 Word (w[0] s/d w[7]) untuk Key Expansion:
                </span>
                <div class="grid grid-cols-4 sm:grid-cols-8 gap-1.5 font-mono text-[10px]">
                  <div
                    v-for="i in 8"
                    :key="i"
                    class="p-1 rounded bg-slate-900/90 border border-indigo-500/30 text-center flex flex-col"
                  >
                    <span class="text-[9px] text-indigo-400 font-bold">w[{{ i - 1 }}]</span>
                    <span class="text-slate-200 text-[10px] truncate" :title="getWordHex(i - 1)">
                      {{ getWordHex(i - 1) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-2">
            <div class="flex items-center justify-between gap-2 text-xs font-semibold text-slate-300">
              <span>Salt publik, berbeda untuk setiap enkripsi</span>
              <span class="font-mono text-cyan-300">{{ keyDerivationMode === 'PBKDF2' ? '16 byte / 128 bit' : 'tidak ada pada format lama' }}</span>
            </div>
            <div class="p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-cyan-200 break-all">
              {{ saltHex || 'Tidak tersedia' }}
            </div>
            <div v-if="keyDerivationMode === 'PBKDF2' && saltBytes.length" class="grid grid-cols-8 gap-1 font-mono text-[9px]">
              <div
                v-for="(b, idx) in saltBytes"
                :key="idx"
                class="rounded bg-slate-900 border border-cyan-500/20 p-1 text-center"
                :title="`Byte salt ${idx}: 0x${byteToHex(b)}`"
              >
                <span class="block text-slate-500">{{ idx.toString(16).padStart(2, '0') }}</span>
                <span class="text-cyan-200">{{ byteToHex(b) }}</span>
              </div>
            </div>
            <div v-if="keyDerivationMode === 'PBKDF2' && pbkdf2FirstBlockInput.length" class="space-y-1">
              <span class="text-[10px] font-semibold text-slate-400">Input HMAC pertama: salt || INT₃₂_BE(1)</span>
              <div class="grid grid-cols-10 gap-1 font-mono text-[9px]">
                <div
                  v-for="(b, idx) in pbkdf2FirstBlockInput"
                  :key="idx"
                  class="rounded border p-1 text-center"
                  :class="idx < 16 ? 'bg-slate-900 border-cyan-500/20 text-cyan-200' : 'bg-amber-950/50 border-amber-500/30 text-amber-200'"
                  :title="idx < 16 ? `Byte salt ${idx}` : 'Byte counter blok PBKDF2'"
                >
                  {{ byteToHex(b) }}
                </div>
              </div>
            </div>
            <p class="text-[11px] leading-relaxed text-slate-400">
              Salt bukan password dan tidak perlu dirahasiakan. Salt membuat password yang sama menghasilkan kunci berbeda serta menghambat tabel tebakan yang dibuat sebelumnya. PBKDF2 mengulang kerja hash agar setiap tebakan password lebih mahal; ini tidak menambah kekuatan password lemah secara ajaib. SHA-256 sekali saja (format catatan lama) tidak memberi perlambatan ini.
            </p>
          </div>

          <div class="mt-3 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3.5 space-y-3">
            <h5 class="text-xs font-bold text-indigo-200">Bagaimana byte password dan salt menjadi master key?</h5>
            <template v-if="keyDerivationMode === 'PBKDF2'">
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 text-[11px] font-mono text-center">
                <div class="flex-1 rounded-lg bg-slate-950 border border-indigo-500/20 p-2 text-indigo-200">
                  Password UTF-8<br><span class="text-slate-400">kunci HMAC</span>
                </div>
                <span class="text-slate-500">+</span>
                <div class="flex-1 rounded-lg bg-slate-950 border border-cyan-500/20 p-2 text-cyan-200">
                  Salt 16 byte || 00 00 00 01<br><span class="text-slate-400">input HMAC pertama (blok 1)</span>
                </div>
                <span class="text-slate-500">→</span>
                <div class="flex-1 rounded-lg bg-slate-950 border border-amber-500/20 p-2 text-amber-200">
                  U₁ = HMAC-SHA-256(password, salt || 00000001)
                </div>
              </div>
              <p class="text-[11px] text-slate-300 leading-relaxed">
                PBKDF2 menghitung U₂ = HMAC(password, U₁), lalu mengulang rantai itu sampai 600.000 putaran. Hasil setiap U di-XOR bersama (T₁ = U₁ ⊕ U₂ ⊕ … ⊕ U₆₀₀₀₀₀); 32 byte T₁ inilah master key AES-256 yang ditampilkan di atas. Jadi password dan salt tidak sekadar ditempel menjadi kunci.
              </p>
            </template>
            <p v-else class="text-[11px] text-slate-300 leading-relaxed">
              Catatan format lama tidak memiliki salt: seluruh byte UTF-8 password langsung di-hash sekali dengan SHA-256. Digest 32 byte-nya menjadi master key; format baru menggunakan PBKDF2-HMAC-SHA-256.
            </p>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- TAHAP 2: AES-256 KEY EXPANSION (60 WORDS & 15 ROUND KEYS)                  -->
        <!-- ========================================================================= -->
        <section
          v-if="viewMode === 'all' || currentStage === 2"
          class="rounded-2xl border border-violet-500/25 bg-violet-950/15 p-4 sm:p-5 transition-all"
        >
          <div class="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-violet-500/20 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300">
                  2
                </span>
                <h4 class="text-sm font-bold text-violet-200 uppercase tracking-wide">
                  AES-256 Key Expansion (Pembangkitan 60 Word & 15 Subkunci)
                </h4>
              </div>
              <p class="text-xs text-slate-400 mt-1">
                Kunci master 256-bit diperluas menjadi 60 word (240 byte) menghasilkan 15 Round Key (K₀ s/d K₁₄) untuk 14 putaran transformasi AES.
              </p>
            </div>
            <span class="self-start sm:self-auto px-2.5 py-1 rounded-full bg-violet-950/80 border border-violet-500/40 text-[11px] font-mono font-semibold text-violet-300">
              {{ roundKeys.length }} Round Keys • 60 Words
            </span>
          </div>

          <!-- Word Type Legend -->
          <div class="flex flex-wrap items-center gap-2 text-[10px] mb-3 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <span class="text-slate-400 font-bold uppercase tracking-wider">Aturan Pembangkitan:</span>
            <span class="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30 font-medium">
              w[0..7]: Kunci Master Langsung
            </span>
            <span class="px-2 py-0.5 rounded bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-500/30 font-medium">
              i % 8 == 0: RotWord + SubWord + Rcon + w[i-8]
            </span>
            <span class="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-medium">
              i % 8 == 4: SubWord + w[i-8] (Khas AES-256)
            </span>
            <span class="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-medium">
              Lainnya: w[i-8] ⊕ w[i-1]
            </span>
          </div>

          <p class="mb-3 rounded-xl border border-violet-500/20 bg-violet-950/20 p-3 text-[11px] leading-relaxed text-slate-300">
            <strong class="text-violet-200">Cara membacanya:</strong>
            master key 32 byte dari Tahap 1 dibagi menjadi 8 word awal (masing-masing 4 byte). AES lalu membangkitkan word berikutnya satu per satu hingga 60 word; setiap 4 word berurutan membentuk satu Round Key 16 byte. Round Key inilah yang dipakai AES pada tiap putaran, bukan untuk mengenkripsi password atau plaintext secara langsung.
          </p>

          <!-- 60-Word Selector Grid -->
          <div class="mb-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Pilih Word untuk Inspeksi Kalkulasi Aljabar:</span>
              <span class="font-mono text-violet-300">Word Terpilih: w[{{ selectedWordIndex }}]</span>
            </div>
            <div class="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto p-1 font-mono text-[10px]">
              <button
                v-for="wStep in wordSteps"
                :key="wStep.index"
                type="button"
                @click="selectedWordIndex = wStep.index"
                class="p-1.5 rounded border transition-all text-center cursor-pointer flex flex-col items-center justify-center"
                :class="[
                  selectedWordIndex === wStep.index
                    ? 'ring-2 ring-violet-400 border-violet-400 bg-violet-900/60 font-bold text-white'
                    : getWordBadgeClass(wStep.index)
                ]"
              >
                <span>w[{{ wStep.index }}]</span>
                <span class="text-[9px] opacity-80">{{ formatWordCompact(wStep.resultWord) }}</span>
              </button>
            </div>
          </div>

          <!-- Selected Word Detailed Math Breakdown Card -->
          <div v-if="selectedWordStep" class="bg-slate-950/90 border border-violet-500/30 rounded-xl p-4 space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold font-mono text-violet-300">
                  Rincian Pembentukan w[{{ selectedWordStep.index }}]
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase" :class="getWordTypeBadge(selectedWordStep.index).style">
                  {{ getWordTypeBadge(selectedWordStep.index).label }}
                </span>
              </div>
              <span class="font-mono text-xs text-slate-400">
                Digunakan pada Round Key K{{ Math.floor(selectedWordStep.index / 4) }}
              </span>
            </div>

            <!-- Mathematical Formula -->
            <div class="p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono text-indigo-300 flex items-center gap-2">
              <span class="text-slate-400 font-sans font-medium text-[11px]">Rumus:</span>
              <span class="font-bold">{{ getWordFormula(selectedWordStep.index) }}</span>
            </div>

            <!-- Step by Step Operands Breakdown -->
            <div v-if="!selectedWordStep.initial" class="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-3 space-y-2">
              <div class="text-[11px] font-semibold text-emerald-200">
                XOR dilakukan per byte untuk membentuk w[{{ selectedWordStep.index }}]
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
                <div
                  v-for="byteIndex in 4"
                  :key="byteIndex"
                  class="rounded-lg border border-slate-800 bg-slate-950/80 p-2 text-center"
                >
                  <span class="block text-slate-500">Byte {{ byteIndex - 1 }}</span>
                  <span class="text-slate-300">{{ byteToHex(selectedWordStep.baseWord[byteIndex - 1]) }}</span>
                  <span class="text-violet-300"> ⊕ </span>
                  <span class="text-slate-300">{{ byteToHex(selectedWordStep.tempWord[byteIndex - 1]) }}</span>
                  <span class="text-slate-500"> = </span>
                  <span class="font-bold text-emerald-300">{{ byteToHex(selectedWordStep.resultWord[byteIndex - 1]) }}</span>
                </div>
              </div>
              <p class="text-[10px] text-slate-400">
                XOR membandingkan bit pada posisi yang sama: bit sama menjadi 0, bit berbeda menjadi 1.
              </p>
            </div>

            <div v-if="selectedWordStep.initial" class="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
              Word awal ini disalin langsung dari master key 256-bit Tahap 1 pada offset byte {{ selectedWordStep.index * 4 }} s/d {{ selectedWordStep.index * 4 + 3 }}:
              <div class="mt-2 text-sm font-bold text-emerald-400 tracking-wider">
                {{ formatWord(selectedWordStep.resultWord) }}
              </div>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <!-- Left Column: Pre-transformations -->
              <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-2">
                <div class="text-[11px] font-sans font-bold text-slate-300 border-b border-slate-800 pb-1">
                  1. Input & Transformasi Word Sebelumnya
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Input w[{{ selectedWordStep.index - 1 }}]:</span>
                  <span class="text-slate-200 font-bold">{{ formatWord(selectedWordStep.previousWord) }}</span>
                </div>
                <div v-if="selectedWordStep.rotatedWord" class="flex justify-between text-cyan-300">
                  <span>RotWord (geser 1 byte kiri):</span>
                  <span class="font-bold">{{ formatWord(selectedWordStep.rotatedWord) }}</span>
                </div>
                <div v-if="selectedWordStep.substitutedWord" class="flex justify-between text-cyan-300">
                  <span>SubWord (AES S-Box):</span>
                  <span class="font-bold">{{ formatWord(selectedWordStep.substitutedWord) }}</span>
                </div>
                <div v-if="selectedWordStep.rconValue !== null" class="flex justify-between text-amber-300">
                  <span>XOR Round Constant (Rcon):</span>
                  <span class="font-bold">[{{ byteToHex(selectedWordStep.rconValue) }}, 00, 00, 00]</span>
                </div>
                <div class="flex justify-between text-violet-300 border-t border-slate-800 pt-1">
                  <span>Hasil Nilai Temp:</span>
                  <span class="font-bold">{{ formatWord(selectedWordStep.tempWord) }}</span>
                </div>
              </div>

              <!-- Right Column: Final XOR -->
              <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-2">
                <div class="text-[11px] font-sans font-bold text-slate-300 border-b border-slate-800 pb-1">
                  2. Kombinasi XOR dengan w[{{ selectedWordStep.index - 8 }}]
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Base Word w[{{ selectedWordStep.index - 8 }}]:</span>
                  <span class="text-slate-200 font-bold">{{ formatWord(selectedWordStep.baseWord) }}</span>
                </div>
                <div class="flex justify-between text-violet-300">
                  <span>Temp Word Operan:</span>
                  <span class="font-bold">{{ formatWord(selectedWordStep.tempWord) }}</span>
                </div>
                <div class="p-2 bg-slate-950 border border-emerald-500/40 rounded-lg mt-2">
                  <div class="text-[10px] text-slate-400 font-sans">Hasil Akhir w[{{ selectedWordStep.index }}]:</div>
                  <div class="text-sm font-bold text-emerald-400 tracking-wider">
                    {{ formatWord(selectedWordStep.resultWord) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 15 Round Keys Overview Table -->
          <div class="mt-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Daftar 15 Round Key (K₀ s/d K₁₄) untuk AES-256:</span>
              <span class="text-slate-500 font-mono">16 Byte (128 Bit) per Subkunci</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 font-mono text-[11px]">
              <div
                v-for="(rKey, rIdx) in roundKeys"
                :key="rIdx"
                class="p-2 rounded-lg border bg-slate-900/70 border-slate-800 flex flex-col justify-between"
              >
                <div class="flex items-center justify-between text-[10px] text-violet-300 font-bold mb-1">
                  <span>Round Key K{{ rIdx }}</span>
                  <span class="text-slate-500 text-[9px]">w[{{ rIdx * 4 }}..{{ rIdx * 4 + 3 }}]</span>
                </div>
                <div class="text-slate-300 text-[10px] break-all leading-tight">
                  {{ formatRoundKeyHex(rKey) }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- TAHAP 3: SETUP NONCE (IV), COUNTER BLOCKS & HASH SUBKEY H                  -->
        <!-- ========================================================================= -->
        <section
          v-if="viewMode === 'all' || currentStage === 3"
          class="rounded-2xl border border-cyan-500/25 bg-cyan-950/15 p-4 sm:p-5 transition-all"
        >
          <div class="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-300">
                  3
                </span>
                <h4 class="text-sm font-bold text-cyan-200 uppercase tracking-wide">
                  Setup Nonce (IV), Blok Counter J₀ & Hash Subkey H
                </h4>
              </div>
              <p class="text-xs text-slate-400 mt-1">
                GCM menggunakan IV 96-bit untuk membentuk counter blok awal J₀, counter blok data CBᵢ, dan menurunkan Hash Subkey H untuk integritas GMAC.
              </p>
            </div>
            <span class="self-start sm:self-auto px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono font-semibold text-cyan-300">
              NIST GCM Block Construction
            </span>
          </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <!-- Nonce / IV 96-bit -->
            <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 font-mono text-xs">
              <div class="flex items-center justify-between text-[11px] text-cyan-300 font-bold">
                <span>1. Initialization Vector (IV)</span>
                <span class="text-slate-500">96-bit (12B)</span>
              </div>
              <div class="p-2 bg-slate-900 border border-slate-800 rounded-lg text-cyan-200 break-all">
                {{ ivHex || 'IV Acak CSPRNG' }}
              </div>
              <p class="text-[10px] text-slate-400 font-sans leading-relaxed">
                Pembangkitan acak dengan CSPRNG. Standar NIST SP 800-38D melarang keras pengulangan IV pada kunci yang sama.
              </p>
            </div>

            <!-- Hash Subkey H = AES_K(0^128) -->
            <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 font-mono text-xs">
              <div class="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                <span>2. Hash Subkey H</span>
                <span class="text-slate-500">AES_K(0¹²⁸)</span>
              </div>
              <div class="p-2 bg-slate-900 border border-slate-800 rounded-lg text-amber-200 break-all">
                {{ pipelineDetails ? Array.from(pipelineDetails.H, byteToHex).join('') : 'Menghitung...' }}
              </div>
              <p class="text-[10px] text-slate-400 font-sans leading-relaxed">
                Hasil enkripsi AES-256 terhadap 16 byte nol. Berfungsi sebagai pengali pada Galois Field GF(2¹²⁸) untuk GHASH.
              </p>
            </div>

            <!-- Initial Counter J0 -->
            <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 font-mono text-xs">
              <div class="flex items-center justify-between text-[11px] text-emerald-300 font-bold">
                <span>3. Pre-Counter Blok J₀</span>
                <span class="text-slate-500">IV || 0³¹1</span>
              </div>
              <div class="p-2 bg-slate-900 border border-slate-800 rounded-lg text-emerald-200 break-all">
                {{ pipelineDetails ? Array.from(pipelineDetails.J0, byteToHex).join('') : 'Menghitung...' }}
              </div>
              <p class="text-[10px] text-slate-400 font-sans leading-relaxed">
                Penggabungan 12-byte IV dengan counter 32-bit `00 00 00 01`. Digunakan untuk mengenkripsi GMAC Tag akhir (S₀ = AES_K(J₀)).
              </p>
            </div>
          </div>

          <div class="mt-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2 text-xs">
            <div class="flex items-center justify-between text-[11px] text-violet-300 font-bold">
              <span>4. AAD (data tambahan terautentikasi)</span>
              <span class="text-slate-500">opsional</span>
            </div>
            <div class="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
              AAD tidak digunakan pada catatan ini (0 byte)
            </div>
            <p class="text-[10px] text-slate-400 leading-relaxed">
              AAD tidak disembunyikan, tetapi ikut diperiksa oleh tag. Contohnya ID catatan atau header. Jika AAD berubah, tag harus gagal. Aplikasi ini saat ini tidak mengirim AAD.
            </p>
          </div>

          <div class="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 space-y-3">
            <h5 class="text-xs font-bold text-cyan-200">Penjelasan sederhana Tahap 3</h5>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300 leading-relaxed">
              <p>
                <strong class="text-cyan-200">IV / Nonce:</strong>
                angka unik 12 byte untuk setiap enkripsi dengan kunci yang sama. IV bukan rahasia; saat dekripsi, IV dari data terenkripsi digunakan kembali.
              </p>
              <p>
                <strong class="text-amber-200">Hash Subkey H:</strong>
                dibuat dengan mengenkripsi 16 byte nol memakai kunci. H bukan untuk menyamarkan isi catatan, melainkan dipakai GHASH untuk membantu memeriksa integritas data.
              </p>
              <p>
                <strong class="text-emerald-200">J₀:</strong>
                gabungan IV dan penanda `00000001`. J₀ menjadi dasar counter GCM sekaligus dipakai untuk membuat bagian kunci pada tag autentikasi.
              </p>
              <p>
                <strong class="text-violet-200">AAD:</strong>
                metadata opsional yang tetap diperiksa meski tidak disembunyikan. Contohnya ID catatan; aplikasi ini belum menggunakannya.
              </p>
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">
              <strong class="text-slate-200">Counter data:</strong>
              AES mengolah CB₁, CB₂, dan seterusnya untuk menghasilkan keystream. Data pertama memakai J₀ + 1 (counter 2); keystream lalu di-XOR dengan plaintext saat enkripsi atau ciphertext saat dekripsi.
            </p>
          </div>

          <!-- Data Counters Progression -->
          <div class="mt-3 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Rangkaian Counter Blok Data untuk Mode CTR (CB₁, CB₂, ...):</span>
              <span class="text-slate-500 font-mono">Counter increment per blok 16-byte</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
              <div
                v-for="(cb, cbIdx) in (pipelineDetails ? pipelineDetails.counterBlocks : [])"
                :key="cbIdx"
                class="p-2 rounded-lg border bg-slate-900/80 border-slate-800 flex flex-col justify-between"
              >
                <div class="flex items-center justify-between text-[10px] text-cyan-300 font-bold mb-1">
                  <span>CB{{ cbIdx + 1 }} (Counter {{ cb.counterValue }})</span>
                  <span class="text-slate-500 text-[9px]">Blok Data {{ cbIdx + 1 }}</span>
                </div>
                <div class="text-slate-200 text-[10px] break-all leading-tight">
                  {{ Array.from(cb.counterBlock, byteToHex).join('') }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- TAHAP 4: AES-256 CORE ENGINE (14 ROUNDS STATE MATRIX TRANSFORMATIONS)      -->
        <!-- ========================================================================= -->
        <section
          v-if="viewMode === 'all' || currentStage === 4"
          class="rounded-2xl border border-sky-500/25 bg-sky-950/15 p-4 sm:p-5 transition-all"
        >
          <div class="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-500/20 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-xs font-bold text-sky-300">
                  4
                </span>
                <h4 class="text-sm font-bold text-sky-200 uppercase tracking-wide">
                  AES-256 Engine: Alur Standar & Matriks State (14 Putaran)
                </h4>
              </div>
              <p class="text-xs text-slate-400 mt-1">
                AES mengacak satu blok 16 byte melalui 14 putaran. Dalam GCM, enkripsi maupun dekripsi data memakai AES dengan arah enkripsi untuk membuat keystream; dekripsi hanya membalik XOR, bukan menjalankan InvAES.
              </p>
            </div>

            <!-- View Toggle for Tahap 4: Diagram vs Matrices vs Both -->
            <div class="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs self-start sm:self-auto">
              <button
                type="button"
                @click="aesSubView = 'diagram'"
                class="px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer text-xs flex items-center gap-1.5"
                :class="aesSubView === 'diagram' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'"
              >
                <span>📊</span>
                <span>Bagan Alur (aes-256.jpg)</span>
              </button>
              <button
                type="button"
                @click="aesSubView = 'matrices'"
                class="px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer text-xs flex items-center gap-1.5"
                :class="aesSubView === 'matrices' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'"
              >
                <span>🔢</span>
                <span>Matriks State 4×4</span>
              </button>
              <button
                type="button"
                @click="aesSubView = 'split'"
                class="px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer text-xs flex items-center gap-1.5"
                :class="aesSubView === 'split' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'"
              >
                <span>📑</span>
                <span>Keduanya</span>
              </button>
            </div>
          </div>

          <!-- ========================================================================= -->
          <!-- BAGAN ALUR ARSITEKTUR AES (BERDASARKAN aes-256.jpg)                       -->
          <!-- ========================================================================= -->
          <div
            v-if="aesSubView === 'diagram' || aesSubView === 'split'"
            class="mb-5 bg-slate-950/90 border border-sky-500/30 rounded-2xl p-4 sm:p-5 space-y-4"
          >
            <!-- Diagram Header & Badges -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                  <span class="text-sky-400">❖</span> Bagan Alur Algoritma AES (FIPS 197)
                </span>
                <span class="text-[10px] bg-sky-950/80 border border-sky-500/40 text-sky-300 px-2 py-0.5 rounded-full font-mono">
                  Referensi: aes-256.jpg
                </span>
              </div>
              <div class="text-[11px] text-slate-400">
                Klik bagian putaran atau kotak operasi untuk inspeksi detail & rumus matematis
              </div>
            </div>

            <!-- Side-by-side: Encryption vs Decryption -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <!-- Divider line on large screens -->
              <div class="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-800 -translate-x-1/2 pointer-events-none"></div>

              <!-- ================= COLUMN 1: ENCRYPTION ================= -->
              <div class="space-y-3.5 flex flex-col items-center">
                <!-- Column Header -->
                <div class="w-full text-center pb-2 border-b border-emerald-500/20">
                  <div class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-1.5">
                    <span>🔒</span> Encryption (Enkripsi)
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">
                    Proses transformasi Plain Text menjadi Cipher Text (14 Putaran)
                  </div>
                </div>

                <!-- Input: Plain Text -->
                <div class="w-44 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono text-xs font-bold text-slate-200 shadow">
                  Plain Text
                </div>

                <!-- Arrow Down -->
                <div class="text-slate-500 text-xs font-bold leading-none">↓</div>

                <!-- 1st Round (Round 0) -->
                <div
                  class="w-full max-w-sm rounded-xl border p-2.5 transition-all cursor-pointer relative"
                  :class="[
                    activeAesRound === 0
                      ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  ]"
                  @click="activeAesRound = 0"
                >
                  <div class="flex items-center justify-between text-[10px] mb-1.5">
                    <span class="font-bold text-slate-400 uppercase">1st Round (Round 0)</span>
                    <span v-if="activeAesRound === 0" class="text-emerald-400 font-semibold text-[9px] animate-pulse">● Aktif di Matriks</span>
                  </div>
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-semibold shrink-0">
                      <span>RoundKey (K₀)</span>
                      <span>➔</span>
                    </div>
                    <button
                      type="button"
                      @click.stop="selectOperation('AddRoundKey')"
                      class="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs text-center hover:bg-emerald-600/30 transition-all cursor-pointer"
                      :class="selectedOperation === 'AddRoundKey' ? 'ring-2 ring-emerald-400' : ''"
                    >
                      AddRoundKey
                    </button>
                  </div>
                </div>

                <!-- Arrow Down -->
                <div class="text-slate-500 text-xs font-bold leading-none">↓</div>

                <!-- Repeat Nr - 1 Round (Round 1 to 13) -->
                <div
                  class="w-full max-w-sm rounded-xl border p-3 transition-all cursor-pointer relative space-y-2"
                  :class="[
                    activeAesRound >= 1 && activeAesRound <= 13
                      ? 'bg-sky-950/40 border-sky-400 ring-2 ring-sky-400/40 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  ]"
                  @click="activeAesRound = (activeAesRound >= 1 && activeAesRound <= 13) ? activeAesRound : 1"
                >
                  <div class="flex items-center justify-between text-[10px] border-b border-slate-800/80 pb-1">
                    <span class="font-bold text-sky-300 uppercase">
                      Repeat Nr - 1 Round (Putaran 1 – 13)
                    </span>
                    <span v-if="activeAesRound >= 1 && activeAesRound <= 13" class="text-sky-400 font-mono font-bold text-[10px] animate-pulse">
                      ● Aktif: R{{ activeAesRound }}
                    </span>
                  </div>

                  <!-- Stacked Transformation Blocks -->
                  <div class="space-y-1.5 font-mono text-xs">
                    <button
                      type="button"
                      @click.stop="selectOperation('SubBytes')"
                      class="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700/80 text-sky-200 text-center hover:border-sky-500/60 transition-all font-semibold cursor-pointer"
                      :class="selectedOperation === 'SubBytes' ? 'ring-2 ring-sky-400 bg-sky-950/70 border-sky-400' : ''"
                    >
                      SubBytes
                    </button>
                    <button
                      type="button"
                      @click.stop="selectOperation('ShiftRows')"
                      class="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700/80 text-sky-200 text-center hover:border-sky-500/60 transition-all font-semibold cursor-pointer"
                      :class="selectedOperation === 'ShiftRows' ? 'ring-2 ring-sky-400 bg-sky-950/70 border-sky-400' : ''"
                    >
                      ShiftRows
                    </button>
                    <button
                      type="button"
                      @click.stop="selectOperation('MixColumns')"
                      class="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700/80 text-sky-200 text-center hover:border-sky-500/60 transition-all font-semibold cursor-pointer"
                      :class="selectedOperation === 'MixColumns' ? 'ring-2 ring-sky-400 bg-sky-950/70 border-sky-400' : ''"
                    >
                      MixColumns
                    </button>
                    <div class="flex items-center gap-1.5">
                      <span class="text-[9px] font-mono text-sky-400 font-semibold shrink-0">RoundKey ➔</span>
                      <button
                        type="button"
                        @click.stop="selectOperation('AddRoundKey')"
                        class="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-center hover:bg-emerald-600/30 transition-all font-bold cursor-pointer"
                        :class="selectedOperation === 'AddRoundKey' ? 'ring-2 ring-emerald-400' : ''"
                      >
                        AddRoundKey
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Arrow Down -->
                <div class="text-slate-500 text-xs font-bold leading-none">↓</div>

                <!-- Last Round (Round 14) -->
                <div
                  class="w-full max-w-sm rounded-xl border p-3 transition-all cursor-pointer relative space-y-2"
                  :class="[
                    activeAesRound === 14
                      ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  ]"
                  @click="activeAesRound = 14"
                >
                  <div class="flex items-center justify-between text-[10px] border-b border-slate-800/80 pb-1">
                    <span class="font-bold text-amber-300 uppercase">
                      Last Round (Putaran 14)
                    </span>
                    <span class="text-[9px] text-amber-400/80 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                      Tanpa MixColumns
                    </span>
                  </div>

                  <!-- Stacked Transformation Blocks -->
                  <div class="space-y-1.5 font-mono text-xs">
                    <button
                      type="button"
                      @click.stop="selectOperation('SubBytes')"
                      class="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700/80 text-amber-200 text-center hover:border-amber-500/60 transition-all font-semibold cursor-pointer"
                      :class="selectedOperation === 'SubBytes' ? 'ring-2 ring-amber-400' : ''"
                    >
                      SubBytes
                    </button>
                    <button
                      type="button"
                      @click.stop="selectOperation('ShiftRows')"
                      class="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700/80 text-amber-200 text-center hover:border-amber-500/60 transition-all font-semibold cursor-pointer"
                      :class="selectedOperation === 'ShiftRows' ? 'ring-2 ring-amber-400' : ''"
                    >
                      ShiftRows
                    </button>
                    <div class="flex items-center gap-1.5">
                      <span class="text-[9px] font-mono text-amber-400 font-semibold shrink-0">RoundKey ➔</span>
                      <button
                        type="button"
                        @click.stop="selectOperation('AddRoundKey')"
                        class="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-center hover:bg-emerald-600/30 transition-all font-bold cursor-pointer"
                        :class="selectedOperation === 'AddRoundKey' ? 'ring-2 ring-emerald-400' : ''"
                      >
                        AddRoundKey
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Arrow Down -->
                <div class="text-slate-500 text-xs font-bold leading-none">↓</div>

                <!-- Output: Cipher Text -->
                <div class="w-44 py-1.5 px-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-center font-mono text-xs font-bold text-emerald-300 shadow">
                  Cipher Text
                </div>
              </div>

              <!-- ================= COLUMN 2: DECRYPTION ================= -->
              <div class="space-y-3.5 flex flex-col items-center">
                <!-- Column Header -->
                <div class="w-full text-center pb-2 border-b border-indigo-500/20">
                  <div class="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center justify-center gap-1.5">
                    <span>🔓</span> Decryption (Dekripsi)
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">
                    Proses rekonstruksi Cipher Text menjadi Plain Text (Operasi Invers)
                  </div>
                </div>

                <!-- Input: Cipher Text -->
                <div class="w-44 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono text-xs font-bold text-slate-200 shadow">
                  Cipher Text
                </div>

                <!-- Arrow Down -->
                <div class="text-slate-500 text-xs font-bold leading-none">↓</div>

                <!-- 1st Round -->
                <div
                  class="w-full max-w-sm rounded-xl border p-2.5 transition-all bg-slate-900/80 border-slate-800 hover:border-slate-700"
                >
                  <div class="flex items-center justify-between text-[10px] mb-1.5">
                    <span class="font-bold text-slate-400 uppercase">1st Round</span>
                    <span class="text-[9px] text-indigo-400 font-mono">RoundKey* K₁₄</span>
                  </div>
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1 text-[10px] font-mono text-indigo-400 font-semibold shrink-0">
                      <span>RoundKey*</span>
                      <span>➔</span>
                    </div>
                    <button
                      type="button"
                      @click="selectOperation('AddRoundKey')"
                      class="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-xs text-center hover:bg-indigo-600/30 transition-all cursor-pointer"
                      :class="selectedOperation === 'AddRoundKey' ? 'ring-2 ring-indigo-400' : ''"
                    >
                      AddRoundKey
                    </button>
                  </div>
                </div>

                <!-- Arrow Down -->
                <div class="text-slate-500 text-xs font-bold leading-none">↓</div>

                <!-- Repeat Nr - 1 Round -->
                <div
                  class="w-full max-w-sm rounded-xl border p-3 transition-all bg-slate-900/80 border-slate-800 hover:border-slate-700 space-y-2"
                >
                  <div class="flex items-center justify-between text-[10px] border-b border-slate-800/80 pb-1">
                    <span class="font-bold text-indigo-300 uppercase">
                      Repeat Nr - 1 Round (13 Putaran)
                    </span>
                    <span class="text-[9px] text-slate-500 font-mono">
                      Subkunci K₁₃ .. K₁
                    </span>
                  </div>

                  <!-- Stacked Inverted Blocks -->
                  <div class="space-y-1.5 font-mono text-xs">
                    <button
                      type="button"
                      @click="selectOperation('InvShiftRows')"
                      class="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700/80 text-indigo-200 text-center hover:border-indigo-500/60 transition-all font-semibold cursor-pointer"
                      :class="selectedOperation === 'InvShiftRows' ? 'ring-2 ring-indigo-400 bg-indigo-950/70 border-indigo-400' : ''"
                    >
                      InvShiftRows
                    </button>
                    <button
                      type="button"
                      @click="selectOperation('InvSubBytes')"
                      class="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700/80 text-indigo-200 text-center hover:border-indigo-500/60 transition-all font-semibold cursor-pointer"
                      :class="selectedOperation === 'InvSubBytes' ? 'ring-2 ring-indigo-400 bg-indigo-950/70 border-indigo-400' : ''"
                    >
                      InvSubBytes
                    </button>
                    <div class="flex items-center gap-1.5">
                      <span class="text-[9px] font-mono text-indigo-400 font-semibold shrink-0">RoundKey* ➔</span>
                      <button
                        type="button"
                        @click="selectOperation('AddRoundKey')"
                        class="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-center hover:bg-indigo-600/30 transition-all font-bold cursor-pointer"
                        :class="selectedOperation === 'AddRoundKey' ? 'ring-2 ring-indigo-400' : ''"
                      >
                        AddRoundKey
                      </button>
                    </div>
                    <button
                      type="button"
                      @click="selectOperation('InvMixColumns')"
                      class="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700/80 text-indigo-200 text-center hover:border-indigo-500/60 transition-all font-semibold cursor-pointer"
                      :class="selectedOperation === 'InvMixColumns' ? 'ring-2 ring-indigo-400 bg-indigo-950/70 border-indigo-400' : ''"
                    >
                      InvMixColumns
                    </button>
                  </div>
                </div>

                <!-- Arrow Down -->
                <div class="text-slate-500 text-xs font-bold leading-none">↓</div>

                <!-- Last Round -->
                <div
                  class="w-full max-w-sm rounded-xl border p-3 transition-all bg-slate-900/80 border-slate-800 hover:border-slate-700 space-y-2"
                >
                  <div class="flex items-center justify-between text-[10px] border-b border-slate-800/80 pb-1">
                    <span class="font-bold text-amber-300 uppercase">
                      Last Round (Putaran Final)
                    </span>
                    <span class="text-[9px] text-amber-400/80 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                      Tanpa InvMixColumns
                    </span>
                  </div>

                  <!-- Stacked Inverted Blocks -->
                  <div class="space-y-1.5 font-mono text-xs">
                    <button
                      type="button"
                      @click="selectOperation('InvShiftRows')"
                      class="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700/80 text-amber-200 text-center hover:border-amber-500/60 transition-all font-semibold cursor-pointer"
                      :class="selectedOperation === 'InvShiftRows' ? 'ring-2 ring-amber-400' : ''"
                    >
                      InvShiftRows
                    </button>
                    <button
                      type="button"
                      @click="selectOperation('InvSubBytes')"
                      class="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700/80 text-amber-200 text-center hover:border-amber-500/60 transition-all font-semibold cursor-pointer"
                      :class="selectedOperation === 'InvSubBytes' ? 'ring-2 ring-amber-400' : ''"
                    >
                      InvSubBytes
                    </button>
                    <div class="flex items-center gap-1.5">
                      <span class="text-[9px] font-mono text-amber-400 font-semibold shrink-0">RoundKey* ➔</span>
                      <button
                        type="button"
                        @click="selectOperation('AddRoundKey')"
                        class="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-center hover:bg-indigo-600/30 transition-all font-bold cursor-pointer"
                        :class="selectedOperation === 'AddRoundKey' ? 'ring-2 ring-indigo-400' : ''"
                      >
                        AddRoundKey
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Arrow Down -->
                <div class="text-slate-500 text-xs font-bold leading-none">↓</div>

                <!-- Output: Plain Text -->
                <div class="w-44 py-1.5 px-3 rounded-xl bg-slate-900 border border-indigo-500/40 text-center font-mono text-xs font-bold text-indigo-300 shadow">
                  Plain Text
                </div>

                <!-- Footnote from aes-256.jpg -->
                <div class="text-[10px] text-slate-500 italic text-center pt-1">
                  * RoundKey Added in reverse order (Urutan K₁₄ ➔ K₀)
                </div>
              </div>
            </div>

            <!-- Detail Explanation Card for Selected AES Operation -->
            <div v-if="activeOperationData" class="mt-4 p-4 rounded-xl border border-sky-500/30 bg-slate-900/90 space-y-2 text-xs">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 font-mono text-[10px] font-semibold border border-sky-500/40">
                    Operasi Terpilih
                  </span>
                  <span class="font-bold text-slate-100 text-sm">
                    {{ activeOperationData.title }}
                  </span>
                </div>
                <span class="text-[10px] text-sky-400 font-mono">
                  {{ activeOperationData.category }}
                </span>
              </div>
              <p class="text-slate-300 leading-relaxed text-xs">
                {{ activeOperationData.desc }}
              </p>
              <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-sky-300 flex items-center justify-between">
                <span>Prinsip / Formula:</span>
                <span class="text-slate-200 font-bold">{{ activeOperationData.formula }}</span>
              </div>
            </div>

            <!-- Project Context Note -->
            <div class="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
              <span class="text-base text-amber-400 shrink-0">💡</span>
              <div class="leading-relaxed">
                <strong class="text-slate-200">Bagaimana Secret Notes Memanfaatkan Alur Ini:</strong>
                Aplikasi ini mengimplementasikan mode <span class="text-sky-300 font-semibold">AES-256-GCM (Galois/Counter Mode)</span>. Pada mode ini, engine enkripsi AES (kolom kiri) memproses Counter Block (CB₁, CB₂, ...) untuk menghasilkan Keystream. Keystream ini kemudian di-XOR dengan catatan pengguna. Karena operasi XOR bersifat simetris (<span class="font-mono text-emerald-400">P ⊕ K = C</span> dan <span class="font-mono text-emerald-400">C ⊕ K = P</span>), dekripsi data di browser juga memanfaatkan Keystream yang sama secara instan!
              </div>
            </div>
          </div>

          <!-- ========================================================================= -->
          <!-- INSPEKSI MATRIKS STATE 4×4 DINAMIS                                       -->
          <!-- ========================================================================= -->
          <div v-if="aesSubView === 'matrices' || aesSubView === 'split'" class="space-y-3">
            <!-- Counter Block Target Selector -->
            <div class="flex flex-wrap items-center gap-2 text-xs mb-3 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span class="text-slate-400 font-semibold">Pilih Blok Masukan AES:</span>
              <button
                v-for="(cb, cbIdx) in (pipelineDetails ? pipelineDetails.counterBlocks : [])"
                :key="`sel-cb-${cbIdx}`"
                type="button"
                @click="selectedTraceIndex = cbIdx"
                class="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer"
                :class="selectedTraceIndex === cbIdx ? 'bg-sky-600 text-white shadow' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'"
              >
                CB{{ cbIdx + 1 }} (Counter {{ cb.counterValue }})
              </button>
              <button
                type="button"
                @click="selectedTraceIndex = -1"
                class="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer"
                :class="selectedTraceIndex === -1 ? 'bg-amber-600 text-white shadow' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'"
              >
                J₀ (Pre-Counter Tag)
              </button>
              <button
                type="button"
                @click="selectedTraceIndex = -2"
                class="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer"
                :class="selectedTraceIndex === -2 ? 'bg-violet-600 text-white shadow' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'"
              >
                0¹²⁸ (Hash Subkey H)
              </button>
            </div>

            <!-- Round Selector Bar (R0 s/d R14) -->
            <div class="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin select-none">
              <button
                v-for="rNum in 15"
                :key="rNum - 1"
                type="button"
                @click="activeAesRound = rNum - 1"
                class="shrink-0 px-2.5 py-1 rounded-lg font-mono text-xs transition-all cursor-pointer border"
                :class="[
                  activeAesRound === rNum - 1
                    ? 'border-sky-400 bg-sky-600 text-white font-bold shadow-md ring-1 ring-sky-400/40'
                    : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                ]"
              >
                R{{ rNum - 1 }}
              </button>
            </div>

          <!-- Active Round State & Step Cards -->
          <div v-if="currentActiveRoundTrace" class="bg-slate-950/90 border border-sky-500/30 rounded-xl p-4 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold font-mono text-sky-300">
                  Putaran AES {{ currentActiveRoundTrace.round }}
                </span>
                <span class="text-[10px] text-slate-400">
                  {{ currentActiveRoundTrace.round === 0 ? '• Initial AddRoundKey (K₀)' : currentActiveRoundTrace.round === 14 ? '• Putaran Final (Tanpa MixColumns)' : '• Putaran Utama Standar' }}
                </span>
              </div>
              <span class="text-[10px] font-mono text-slate-500">Matriks State 4 Baris × 4 Kolom</span>
            </div>

            <!-- Steps in this Round -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div
                v-for="step in currentActiveRoundTrace.steps"
                :key="step.name"
                class="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div class="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
                    <span>{{ step.name }}</span>
                    <span class="text-[9px] text-sky-400 uppercase font-semibold">4×4</span>
                  </div>
                  <p class="text-[10px] text-slate-400 leading-tight mb-2">
                    {{ getStepDescription(step.name) }}
                  </p>
                </div>

                <!-- 4x4 State Grid Representation -->
                <div class="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800/80">
                  <template v-for="row in 4" :key="row">
                    <span
                      v-for="col in 4"
                      :key="`${row}-${col}`"
                      class="p-1 rounded bg-slate-900 text-center font-mono text-[10px] font-bold text-sky-300"
                    >
                      {{ byteToHex(step.state[(row - 1) + (col - 1) * 4]) }}
                    </span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        <!-- ========================================================================= -->
        <!-- TAHAP 5: CTR STREAM XOR (DATA ENCRYPTION / DECRYPTION)                     -->
        <!-- ========================================================================= -->
        <section
          v-if="viewMode === 'all' || currentStage === 5"
          class="rounded-2xl border border-emerald-500/25 bg-emerald-950/15 p-4 sm:p-5 transition-all"
        >
          <div class="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-300">
                  5
                </span>
                <h4 class="text-sm font-bold text-emerald-200 uppercase tracking-wide">
                  Enkripsi / Dekripsi Mode Counter (CTR Stream XOR)
                </h4>
              </div>
              <p class="text-xs text-slate-400 mt-1">
                Keystream yang dihasilkan AES di-XOR dengan data byte per byte. Operasi XOR bersifat simetris: P ⊕ S = C, dan C ⊕ S = P.
              </p>
            </div>
            <span class="self-start sm:self-auto px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono font-semibold text-emerald-300">
              Stream Cipher Bitwise XOR
            </span>
          </div>

          <!-- Active Block Selector -->
          <div class="flex items-center gap-2 text-xs mb-3 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 overflow-x-auto">
            <span class="text-slate-400 font-semibold shrink-0">Pilih Blok Data:</span>
            <button
              v-for="(cb, cbIdx) in (pipelineDetails ? pipelineDetails.counterBlocks : [])"
              :key="`ctr-b-${cbIdx}`"
              type="button"
              @click="activeDataBlockIndex = cbIdx"
              class="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer shrink-0"
              :class="activeDataBlockIndex === cbIdx ? 'bg-emerald-600 text-white shadow' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'"
            >
              Blok {{ cbIdx + 1 }}
            </button>
          </div>

          <!-- Byte by Byte XOR Comparison Table -->
          <div v-if="currentDataBlock" class="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3.5 space-y-3">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-slate-800 pb-2">
              <span>Tabel Transformasi XOR Byte per Byte (Blok {{ activeDataBlockIndex + 1 }}):</span>
              <span class="font-mono text-emerald-400">{{ currentMode === 'encrypt' ? 'Plaintext ⊕ Keystream = Ciphertext' : 'Ciphertext ⊕ Keystream = Plaintext' }}</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-[11px]">
              <div
                v-for="bIdx in 16"
                :key="bIdx"
                class="p-2 rounded-lg border bg-slate-900/80 border-slate-800 flex flex-col justify-between space-y-1"
              >
                <div class="text-[9px] text-slate-500 font-bold border-b border-slate-800 pb-0.5 flex justify-between">
                  <span>Byte {{ bIdx - 1 }}</span>
                  <span>{{ (bIdx - 1).toString(16).padStart(2, '0').toUpperCase() }}</span>
                </div>
                <!-- Input byte -->
                <div class="flex justify-between items-center text-[10px]">
                  <span class="text-slate-400">In:</span>
                  <span class="font-bold text-slate-200">
                    {{ getDataByteHex(currentDataBlock, bIdx - 1, 'in') }}
                  </span>
                </div>
                <!-- Keystream byte -->
                <div class="flex justify-between items-center text-[10px]">
                  <span class="text-sky-400">Key:</span>
                  <span class="font-bold text-sky-300">
                    {{ byteToHex(currentDataBlock.keystream[bIdx - 1]) }}
                  </span>
                </div>
                <!-- Result byte -->
                <div class="flex justify-between items-center text-[10px] border-t border-slate-800 pt-1">
                  <span class="text-emerald-400">Out:</span>
                  <span class="font-bold text-emerald-300">
                    {{ getDataByteHex(currentDataBlock, bIdx - 1, 'out') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-3 text-[11px] leading-relaxed text-slate-300">
            <strong class="text-emerald-200">Cara membaca:</strong>
            setiap Counter Block diproses AES untuk menghasilkan keystream; keystream bukan bagian dari password dan dipakai untuk satu blok data (maksimal 16 byte). Jika blok terakhir lebih pendek, hanya byte yang tersedia yang di-XOR—AES-GCM tidak menambahkan padding ke plaintext/ciphertext. Tanda <span class="font-mono text-slate-100">—</span> pada tabel berarti byte itu memang tidak ada.
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- TAHAP 6: GHASH (DATA INTEGRITY ACCUMULATOR)                              -->
        <!-- ========================================================================= -->
        <section
          v-if="viewMode === 'all' || currentStage === 6"
          class="rounded-2xl border border-fuchsia-500/25 bg-fuchsia-950/15 p-4 sm:p-5 transition-all"
        >
          <div class="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-fuchsia-500/20 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-fuchsia-600/30 border border-fuchsia-500/40 flex items-center justify-center text-xs font-bold text-fuchsia-300">
                  6
                </span>
                <h4 class="text-sm font-bold text-fuchsia-200 uppercase tracking-wide">
                  GHASH: merangkum ciphertext untuk pemeriksaan integritas
                </h4>
              </div>
              <p class="text-xs text-slate-400 mt-1">
                GHASH memproses blok AAD (jika ada), ciphertext, lalu panjang keduanya. Nilai ini belum menjadi tag sampai ditutupi dengan AES_K(J₀) pada tahap berikutnya.
              </p>
            </div>
            <span class="self-start sm:self-auto px-2.5 py-1 rounded-full bg-fuchsia-950/80 border border-fuchsia-500/40 text-[11px] font-mono font-semibold text-fuchsia-300">
              Galois Field GF(2¹²⁸) Multiplier
            </span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Left: GHASH Iterations -->
            <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div class="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Rangkaian Evaluasi Polinomial GHASH:</span>
                <span class="font-mono text-fuchsia-300">P(x) = x¹²⁸ + x⁷ + x² + x + 1</span>
              </div>

              <div class="space-y-2 max-h-56 overflow-y-auto p-1 font-mono text-[11px]">
                <div
                  v-for="(gStep, gIdx) in (pipelineDetails ? pipelineDetails.ghashSteps : [])"
                  :key="gIdx"
                  class="p-2 rounded-lg border bg-slate-900 border-slate-800 space-y-1"
                >
                  <div class="flex items-center justify-between text-[10px] text-fuchsia-300 font-bold">
                    <span>{{ gStep.name }}</span>
                    <span class="text-slate-500">{{ gStep.description }}</span>
                  </div>
                  <div class="flex justify-between text-[10px] text-slate-400">
                    <span>State Y:</span>
                    <span class="text-slate-200 font-bold break-all">{{ Array.from(gStep.stateY, byteToHex).join('') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <h5 class="text-xs font-bold text-fuchsia-300">Cara membaca proses GHASH</h5>
              <p class="text-xs text-slate-300 leading-relaxed">
                Bayangkan setiap blok data sebagai halaman yang dimasukkan ke mesin sidik jari. Mesin meng-XOR blok dengan hasil sebelumnya, lalu mengalikannya dengan H dalam GF(2¹²⁸). Urutan blok dan panjang data ikut dihitung, jadi perubahan ciphertext, AAD, atau batas datanya mengubah hasil.
              </p>
              <div class="rounded-lg border border-slate-800 bg-slate-900 p-3 font-mono text-xs text-fuchsia-200">
                Yᵢ = (Yᵢ₋₁ ⊕ Xᵢ) • H
              </div>
              <p class="text-[11px] text-slate-400 leading-relaxed">
                XOR di sini adalah penjumlahan bit tanpa carry. Perkalian bukan perkalian bilangan biasa: hasilnya direduksi oleh polinomial tetap agar selalu 128 bit. Nilai GHASH saja belum cukup untuk membuktikan siapa pembuatnya; kunci rahasia ikut mengunci hasilnya pada tahap 7.
              </p>
              <div class="text-[10px] text-slate-500">
                Tahap ini hanya memperlihatkan jejak edukasi. Verifikasi keamanan sebenarnya tetap dilakukan oleh Web Crypto API.
              </div>
            </div>
          </div>
        </section>

        <section
          v-if="viewMode === 'all' || currentStage === 7"
          class="rounded-2xl border border-pink-500/25 bg-pink-950/15 p-4 sm:p-5 transition-all"
        >
          <div class="mb-4 border-b border-pink-500/20 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-pink-600/30 border border-pink-500/40 flex items-center justify-center text-xs font-bold text-pink-300">7</span>
              <h4 class="text-sm font-bold text-pink-200 uppercase tracking-wide">Tag autentikasi dan paket keluaran</h4>
            </div>
            <p class="mt-1 text-xs leading-relaxed text-slate-400">
              GHASH ditutup dengan nilai AES khusus dari J₀. Tag 16 byte ini seperti segel: penerima menghitung ulang tag yang sama untuk memastikan kunci, IV, ciphertext, dan AAD (bila ada) cocok.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div class="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3 font-mono text-xs">
              <div class="text-pink-300 font-bold">Tag = GHASHₕ(AAD, C) ⊕ AESₖ(J₀)</div>
              <div class="flex justify-between gap-3 text-slate-400"><span>GHASH akhir</span><span class="text-slate-200 break-all">{{ pipelineDetails ? Array.from(pipelineDetails.ghashFinal, byteToHex).join('') : 'Menghitung...' }}</span></div>
              <div class="flex justify-between gap-3 text-slate-400"><span>S₀ = AESₖ(J₀)</span><span class="text-cyan-300 break-all">{{ pipelineDetails ? Array.from(pipelineDetails.S0, byteToHex).join('') : 'Menghitung...' }}</span></div>
              <div class="rounded-lg border border-pink-500/40 bg-slate-900 p-3">
                <div class="text-[10px] text-slate-400 font-sans">Tag autentikasi, 16 byte (128 bit)</div>
                <div class="mt-1 break-all text-sm font-bold tracking-wider text-pink-300">{{ pipelineDetails ? Array.from(pipelineDetails.computedTag, byteToHex).join('') : 'Menghitung...' }}</div>
              </div>
              <p class="text-[11px] font-sans leading-relaxed text-slate-400">
                IV dan tag tidak perlu dirahasiakan. Password/kunci tetap rahasia. IV, ciphertext, dan tag harus tersedia bersama agar data dapat dibuka dan diperiksa.
              </p>
              <div class="rounded-lg border border-pink-500/20 bg-pink-950/20 p-3 text-[11px] leading-relaxed text-slate-300">
                <strong class="text-pink-200">Tag bukan enkripsi:</strong>
                tag tidak menyembunyikan isi. Tag adalah pemeriksa integritas berbasis kunci; saat dekripsi, tag yang diterima harus cocok dengan hasil hitung ulang sebelum plaintext boleh dipakai.
              </div>
            </div>

            <div class="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2 font-mono text-xs">
              <div class="font-bold text-slate-300">{{ currentMode === 'encrypt' ? 'Paket yang dihasilkan aplikasi' : 'Paket yang diterima aplikasi' }}</div>
              <div class="rounded-lg bg-slate-900 p-2 text-cyan-200 break-all">Salt: {{ saltHex || 'tidak ada (catatan lama)' }}</div>
              <div class="rounded-lg bg-slate-900 p-2 text-emerald-200 break-all">IV: {{ ivHex || 'belum tersedia' }}</div>
              <div class="rounded-lg bg-slate-900 p-2 text-slate-200 break-all">Ciphertext: {{ pipelineDetails ? Array.from(pipelineDetails.effectiveCiphertext, byteToHex).join('') || '(kosong)' : 'Menghitung...' }}</div>
              <div class="rounded-lg bg-slate-900 p-2 text-pink-200 break-all">
                {{ currentMode === 'encrypt' ? 'Tag' : 'Tag diterima' }}:
                {{ pipelineDetails
                  ? Array.from(currentMode === 'encrypt' ? pipelineDetails.computedTag : (pipelineDetails.receivedTag || []), byteToHex).join('') || 'tidak tersedia'
                  : 'Menghitung...' }}
              </div>
              <p class="text-[11px] font-sans leading-relaxed text-slate-400">
                Web Crypto API menggabungkan ciphertext dan tag di satu buffer Base64. Backend hanya menyimpan data terenkripsi dan salt; backend tidak menerima password maupun plaintext.
              </p>
            </div>
          </div>
        </section>

        <section
          v-if="viewMode === 'all' || currentStage === 8"
          class="rounded-2xl border border-amber-500/25 bg-amber-950/15 p-4 sm:p-5 transition-all"
        >
          <div class="mb-4 border-b border-amber-500/20 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-xs font-bold text-amber-300">8</span>
              <h4 class="text-sm font-bold text-amber-200 uppercase tracking-wide">Dekripsi aman: verifikasi dulu, baru buka</h4>
            </div>
            <p class="mt-1 text-xs leading-relaxed text-slate-400">
              AES-GCM memeriksa tag sebelum mengembalikan plaintext. Jika password salah atau ada satu bit yang berubah, hasil ditolak dan isi catatan tidak boleh dipakai.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <ol class="space-y-2 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-xs leading-relaxed text-slate-300 list-decimal list-inside">
              <li>Ambil salt, IV, ciphertext, dan tag yang diterima.</li>
              <li>Bangun ulang kunci dari password dan salt; hitung ulang H, J₀, dan tag.</li>
              <li>Bandingkan tag yang dihitung dengan tag tersimpan.</li>
              <li>Hanya jika cocok, AES-CTR meng-XOR ciphertext dengan keystream untuk memperoleh plaintext.</li>
            </ol>
            <div class="space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-xs">
              <div class="flex justify-between gap-3 text-slate-400"><span>Tag diterima</span><span class="break-all text-slate-200">{{ pipelineDetails && pipelineDetails.receivedTag ? Array.from(pipelineDetails.receivedTag, byteToHex).join('') : 'tidak tersedia' }}</span></div>
              <div class="flex justify-between gap-3 text-slate-400"><span>Tag dihitung ulang</span><span class="break-all text-pink-300">{{ pipelineDetails ? Array.from(pipelineDetails.computedTag, byteToHex).join('') : 'Menghitung...' }}</span></div>
              <div
                class="rounded-lg border p-3 font-sans"
                :class="isTagVerified ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' : 'border-rose-500/40 bg-rose-950/30 text-rose-300'"
              >
                <div class="font-bold">{{ isTagVerified ? '✓ Tag cocok — plaintext boleh dipakai' : '🔒 Tag belum valid — plaintext ditolak' }}</div>
                <p class="mt-1 text-[11px] leading-relaxed text-slate-400">
                  {{ isTagVerified ? 'Plaintext di bawah ini berasal dari dekripsi yang tag-nya telah lolos.' : 'Tidak ada plaintext yang ditampilkan. Web Crypto API menolak dekripsi bila password salah, tag tidak cocok, atau data berubah.' }}
                </p>
                <div v-if="isTagVerified" class="mt-2 rounded bg-slate-900 p-2 break-all text-slate-100">{{ plaintext || '(plaintext kosong)' }}</div>
              </div>
              <p class="text-[10px] leading-relaxed text-slate-500">
                Kesamaan yang ditampilkan di sini adalah jejak edukasi JavaScript, bukan pemeriksa keamanan produksi. Pemeriksaan sungguhan dilakukan oleh <code>crypto.subtle.decrypt()</code>.
              </p>
            </div>
          </div>
        </section>

      </div>

      <!-- Footer & Complete Button -->
      <div class="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Semua alur kriptografi AES-256-GCM siap dieksplorasi.</span>
        </div>

        <button
          type="button"
          @click="proceed"
          class="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-emerald-600/25 ring-2 ring-emerald-400/30"
        >
          <span>Lanjutkan / Selesai</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import {
  byteToHex,
  splitIntoBlocks,
  parseEncryptedPayload,
  base64ToBuffer,
  getAes256KeySchedule,
  computeGcmPipelineDetails,
  AES_SBOX,
  AES_RCON
} from '../composables/useCrypto';

const props = defineProps({
  mode: {
    type: String,
    default: 'encrypt',
  },
  plaintext: {
    type: String,
    default: 'Hello World, this is my secret note',
  },
  ciphertext: {
    type: String,
    default: '',
  },
  iv: {
    type: String,
    default: '',
  },
  salt: {
    type: String,
    default: '',
  },
  keyString: {
    type: String,
    default: '',
  },
  isFailed: {
    type: Boolean,
    default: false,
  },
  isEmbedded: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['complete', 'close']);

const currentMode = ref(props.mode);
const viewMode = ref('stepper'); // 'stepper' or 'all'
const currentStage = ref(1); // 1 to 8
const isPlaying = ref(false);
const isCompleted = ref(false);
const speedMs = ref(1200);

// Key Expansion details
const roundKeys = ref([]);
const wordSteps = ref([]);
const keyBytesHex = ref('');
const keyDerivationMode = ref('PBKDF2');
const selectedWordIndex = ref(8); // default to word 8 to show non-trivial step immediately

// AES-256 Engine details
const activeAesRound = ref(0);
const selectedTraceIndex = ref(0); // 0, 1, ... for CB_i, -1 for J0, -2 for H (0^128)
const activeDataBlockIndex = ref(0);
const aesSubView = ref('diagram'); // 'diagram', 'matrices', 'split'
const selectedOperation = ref('SubBytes');

const operationExplanations = {
  SubBytes: {
    title: 'SubBytes (Substitusi Byte)',
    category: 'Non-linear Confusion (Enkripsi)',
    desc: 'Setiap byte dari matriks State 4×4 digantikan dengan byte padanannya dari tabel Rijndael S-Box (16×16). Tabel ini dirancang menggunakan invers multiplikatif pada GF(2⁸) dan transformasi afinitas bit. Tujuannya adalah menciptakan efek konfusi (confusion) non-linear yang mematahkan analisis statistik dan korelasi matematis.',
    formula: "S'[r, c] = S-Box( S[r, c] )",
  },
  ShiftRows: {
    title: 'ShiftRows (Pergeseran Baris)',
    category: 'Linear Diffusion (Enkripsi)',
    desc: 'Setiap baris matriks State 4×4 digeser secara siklis ke kiri dengan pergeseran berbeda: Baris 0 tidak digeser (0 byte), Baris 1 digeser 1 byte ke kiri, Baris 2 digeser 2 byte ke kiri, dan Baris 3 digeser 3 byte ke kiri. Memastikan byte pada satu kolom menyebar ke kolom lain pada putaran berikutnya.',
    formula: 'Row 0: 0 geser | Row 1: ◄ 1 byte | Row 2: ◄ 2 byte | Row 3: ◄ 3 byte',
  },
  MixColumns: {
    title: 'MixColumns (Pencampuran Kolom)',
    category: 'Linear Diffusion (Enkripsi)',
    desc: 'Setiap kolom matriks State dikalikan dengan matriks polinomial tetap pada Galois Field GF(2⁸). Bersama ShiftRows, ini menghasilkan efek longsoran (avalanche effect) maksimal: perubahan 1 bit pada masukan akan merubah rata-rata 50% bit keluaran. PENTING: Sesuai bagan aes-256.jpg, MixColumns ditiadakan pada Putaran Terakhir (Round 14)!',
    formula: "State'[0..3, c] = Matrix_C × State[0..3, c] pada GF(2⁸)",
  },
  AddRoundKey: {
    title: 'AddRoundKey (Kombinasi Subkunci Putaran)',
    category: 'Key Whitening & Injection',
    desc: 'Setiap byte dari matriks State 4×4 di-XOR langsung dengan byte subkunci (RoundKey) putaran bersangkutan yang dihasilkan dari Key Expansion. Pada Enkripsi dimulai dari K₀ (Round 0) hingga K₁₄ (Round 14). Pada Dekripsi standar, subkunci diterapkan dalam urutan terbalik (*reverse order*) dari K₁₄ turun ke K₀.',
    formula: 'State[r, c] = State[r, c] ⊕ RoundKey[r, c]',
  },
  InvShiftRows: {
    title: 'InvShiftRows (Invers Pergeseran Baris)',
    category: 'Linear Diffusion (Dekripsi)',
    desc: 'Operasi kebalikan dari ShiftRows. Setiap baris matriks State digeser secara siklis ke kanan: Baris 0 tidak digeser, Baris 1 digeser 1 byte ke kanan, Baris 2 digeser 2 byte ke kanan, dan Baris 3 digeser 3 byte ke kanan untuk merekonstruksi susunan posisi kolom asli.',
    formula: 'Row 0: 0 geser | Row 1: ► 1 byte | Row 2: ► 2 byte | Row 3: ► 3 byte',
  },
  InvSubBytes: {
    title: 'InvSubBytes (Invers Substitusi Byte)',
    category: 'Non-linear Confusion (Dekripsi)',
    desc: 'Operasi kebalikan dari SubBytes. Setiap byte matriks State dipetakan balik menggunakan tabel Inverse S-Box untuk mengembalikan nilai byte ke kondisi sebelum transformasi non-linear.',
    formula: "State[r, c] = Inv-S-Box( State'[r, c] )",
  },
  InvMixColumns: {
    title: 'InvMixColumns (Invers Pencampuran Kolom)',
    category: 'Linear Diffusion (Dekripsi)',
    desc: 'Operasi kebalikan dari MixColumns. Setiap kolom matriks State dikalikan dengan invers matriks polinomial pada Galois Field GF(2⁸). Seperti pada enkripsi, operasi ini ditiadakan pada Putaran Terakhir Dekripsi!',
    formula: "State[0..3, c] = InvMatrix_D × State'[0..3, c] pada GF(2⁸)",
  },
};

const activeOperationData = computed(() => operationExplanations[selectedOperation.value] || operationExplanations.SubBytes);

function selectOperation(op) {
  selectedOperation.value = op;
}

// Pipeline calculated details
const pipelineDetails = ref(null);

const speedOptions = [
  { label: '0.5x', ms: 2000 },
  { label: '1.0x', ms: 1200 },
  { label: '2.0x', ms: 600 },
  { label: '3.0x', ms: 300 },
];

let playTimer = null;
let pipelineGeneration = 0;

const pipelineStages = [
  { id: 1, title: 'Derivasi Kunci', subtitle: 'Salt + PBKDF2 ➔ 256-bit', icon: '🔑' },
  { id: 2, title: 'Key Expansion', subtitle: '60 Word & 15 Subkunci', icon: '🧬' },
  { id: 3, title: 'Persiapan GCM', subtitle: 'IV, AAD, H & J₀', icon: '⏱️' },
  { id: 4, title: 'AES-256 Engine', subtitle: '14 Putaran Matriks State', icon: '🔄' },
  { id: 5, title: 'CTR Keystream XOR', subtitle: 'Enkripsi/Dekripsi Data', icon: '⚡' },
  { id: 6, title: 'GHASH', subtitle: 'Sidik jari ciphertext', icon: '🧮' },
  { id: 7, title: 'Tag & Output', subtitle: 'Segel 128-bit', icon: '🛡️' },
  { id: 8, title: 'Verifikasi & Buka', subtitle: 'Tag dulu, plaintext setelahnya', icon: '🔓' },
];

const utf8KeyBytes = computed(() => {
  if (!props.keyString) return [];
  return Array.from(new TextEncoder().encode(props.keyString));
});

const ivHex = computed(() => {
  if (!props.iv) return '';
  try {
    const buf = new Uint8Array(base64ToBuffer(props.iv));
    return Array.from(buf, byteToHex).join('');
  } catch (e) {
    return '';
  }
});

const saltHex = computed(() => {
  if (!props.salt) return '';
  try {
    return Array.from(new Uint8Array(base64ToBuffer(props.salt)), byteToHex).join('');
  } catch {
    return '';
  }
});

const saltBytes = computed(() => {
  if (!props.salt) return [];
  try {
    const bytes = new Uint8Array(base64ToBuffer(props.salt));
    return bytes.length === 16 ? Array.from(bytes) : [];
  } catch {
    return [];
  }
});

const pbkdf2FirstBlockInput = computed(() =>
  saltBytes.value.length === 16 ? [...saltBytes.value, 0, 0, 0, 1] : []
);

const masterKeyBytes = computed(() =>
  keyBytesHex.value.match(/.{2}/g)?.map((byte) => Number.parseInt(byte, 16)) || []
);

const isTagVerified = computed(() =>
  !props.isFailed && pipelineDetails.value?.tagMatches === true
);

const selectedWordStep = computed(() => {
  if (!wordSteps.value.length) return null;
  return wordSteps.value[selectedWordIndex.value] || null;
});

const currentActiveRoundTrace = computed(() => {
  if (!pipelineDetails.value) return null;
  let trace = null;
  if (selectedTraceIndex.value === -1) {
    trace = pipelineDetails.value.traceJ0;
  } else if (selectedTraceIndex.value === -2) {
    trace = pipelineDetails.value.traceH;
  } else {
    const cb = pipelineDetails.value.counterBlocks[selectedTraceIndex.value] || pipelineDetails.value.counterBlocks[0];
    trace = cb ? cb.trace : null;
  }
  if (!trace || !trace[activeAesRound.value]) return null;
  return trace[activeAesRound.value];
});

const currentDataBlock = computed(() => {
  if (!pipelineDetails.value || !pipelineDetails.value.counterBlocks.length) return null;
  return pipelineDetails.value.counterBlocks[activeDataBlockIndex.value] || pipelineDetails.value.counterBlocks[0];
});

function getWordHex(index) {
  if (!wordSteps.value[index]) return '....';
  return wordSteps.value[index].resultWord.map(byteToHex).join('');
}

function formatWord(word) {
  if (!word) return '';
  return word.map(byteToHex).join(' ');
}

function formatWordCompact(word) {
  if (!word) return '';
  return word.map(byteToHex).join('');
}

function formatRoundKeyHex(rKey) {
  if (!rKey) return '';
  return Array.from(rKey, byteToHex).join(' ');
}

function getWordBadgeClass(index) {
  if (index < 8) return 'bg-blue-950/40 border-blue-500/20 text-blue-300';
  if (index % 8 === 0) return 'bg-fuchsia-950/40 border-fuchsia-500/20 text-fuchsia-300';
  if (index % 8 === 4) return 'bg-cyan-950/40 border-cyan-500/20 text-cyan-300';
  return 'bg-emerald-950/40 border-emerald-500/20 text-emerald-300';
}

function getWordTypeBadge(index) {
  if (index < 8) return { label: 'Kunci Master Langsung', style: 'bg-blue-950 text-blue-300 border border-blue-500/40' };
  if (index % 8 === 0) return { label: 'RotWord + SubWord + Rcon + w[i-8]', style: 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40' };
  if (index % 8 === 4) return { label: 'SubWord + w[i-8] (Khas AES-256)', style: 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' };
  return { label: 'Direct XOR (w[i-8] ⊕ w[i-1])', style: 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' };
}

function getWordFormula(index) {
  if (index < 8) return `w[${index}] = K[${index * 4} .. ${index * 4 + 3}] (Kunci Master hasil derivasi)`;
  if (index % 8 === 0) {
    const rconIdx = index / 8;
    return `w[${index}] = w[${index - 8}] ⊕ SubWord(RotWord(w[${index - 1}])) ⊕ Rcon[${rconIdx}]`;
  }
  if (index % 8 === 4) {
    return `w[${index}] = w[${index - 8}] ⊕ SubWord(w[${index - 1}])`;
  }
  return `w[${index}] = w[${index - 8}] ⊕ w[${index - 1}]`;
}

function getStepDescription(stepName) {
  if (stepName.includes('AddRoundKey')) {
    return 'Operasi XOR bitwise antara State 4×4 dengan Subkey putaran bersangkutan.';
  }
  if (stepName === 'SubBytes') {
    return 'Substitusi non-linear setiap byte State dengan nilai pemetaan tabel S-Box.';
  }
  if (stepName === 'ShiftRows') {
    return 'Pergeseran baris siklis ke kiri: Baris 0 (0), Baris 1 (1), Baris 2 (2), Baris 3 (3).';
  }
  if (stepName === 'MixColumns') {
    return 'Perkalian matriks polinomial pada Galois Field GF(2⁸) mencampur tiap kolom.';
  }
  return '';
}

function getDataByteHex(block, offset, dir) {
  if (!block) return '··';
  const chunk = currentMode.value === 'encrypt'
    ? (dir === 'in' ? block.plainChunk : block.cipherChunk)
    : (dir === 'in' ? block.cipherChunk : block.plainChunk);
  if (offset >= chunk.length) return '—';
  if (dir === 'out' && currentMode.value === 'decrypt' && !isTagVerified.value) return '••';
  return byteToHex(chunk[offset]);
}

async function computePipeline() {
  const generation = ++pipelineGeneration;
  const effectiveKeyStr = props.keyString || 'default-secret-key-123';
  try {
    const schedule = await getAes256KeySchedule(effectiveKeyStr, props.salt);
    if (generation !== pipelineGeneration) return;
    roundKeys.value = schedule.roundKeys;
    wordSteps.value = schedule.wordSteps;
    keyBytesHex.value = Array.from(schedule.keyBytes, byteToHex).join('');
    keyDerivationMode.value = schedule.legacy ? 'SHA-256' : 'PBKDF2';

    let ivBytes = null;
    if (props.iv) {
      try {
        const decoded = new Uint8Array(base64ToBuffer(props.iv));
        if (decoded.length === 12) ivBytes = decoded;
      } catch (e) {}
    }
    if (!ivBytes) {
      ivBytes = new Uint8Array(12).fill(0x1a);
    }

    const encoder = new TextEncoder();
    const plainBytes = encoder.encode(props.plaintext || '');

    let cipherBytes = null;
    let tagBytes = null;
    if (props.ciphertext) {
      const parsed = parseEncryptedPayload(props.ciphertext);
      cipherBytes = parsed.cipherBytes;
      tagBytes = parsed.tagBytes;
    }

    const details = computeGcmPipelineDetails({
      keyBytes: schedule.keyBytes,
      ivBytes,
      plaintextBytes: plainBytes,
      ciphertextBytes: cipherBytes,
      tagBytes,
    });

    if (generation !== pipelineGeneration) return;
    pipelineDetails.value = details;
  } catch (err) {
    console.error('Error computing pipeline details:', err);
  }
}

function nextStage() {
  if (currentStage.value < 8) {
    currentStage.value++;
  } else {
    isCompleted.value = true;
    isPlaying.value = false;
    clearTimeout(playTimer);
  }
}

function prevStage() {
  if (currentStage.value > 1) {
    currentStage.value--;
  }
}

function togglePlay() {
  if (isCompleted.value) {
    restartAnimation();
    return;
  }
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    runTourStep();
  } else {
    clearTimeout(playTimer);
  }
}

function runTourStep() {
  clearTimeout(playTimer);
  if (!isPlaying.value) return;

  playTimer = setTimeout(() => {
    if (!isPlaying.value) return;
    if (currentStage.value < 8) {
      currentStage.value++;
      runTourStep();
    } else {
      isCompleted.value = true;
      isPlaying.value = false;
    }
  }, speedMs.value);
}

function restartAnimation() {
  clearTimeout(playTimer);
  currentStage.value = 1;
  activeAesRound.value = 0;
  selectedWordIndex.value = 8;
  selectedTraceIndex.value = 0;
  isCompleted.value = false;
  isPlaying.value = true;
  runTourStep();
}

function proceed() {
  clearTimeout(playTimer);
  emit('complete');
  emit('close');
}

function handleKeydown(e) {
  if (e.key === 'Escape' && !props.isEmbedded) {
    emit('close');
  }
}

watch(
  () => [props.plaintext, props.ciphertext, props.keyString, props.iv, props.salt, props.mode],
  () => {
    currentMode.value = props.mode;
    computePipeline();
  }
);

onMounted(() => {
  if (!props.isEmbedded) {
    window.addEventListener('keydown', handleKeydown);
  }
  computePipeline();
});

onUnmounted(() => {
  if (!props.isEmbedded) {
    window.removeEventListener('keydown', handleKeydown);
  }
  clearTimeout(playTimer);
});
</script>
