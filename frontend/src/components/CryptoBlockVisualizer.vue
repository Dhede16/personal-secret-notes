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
          : 'w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col text-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200'
      ]"
    >
      <!-- Header (Hidden when isEmbedded because parent modal has its own header) -->
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
                {{ currentMode === 'encrypt' ? 'Visualisasi Enkripsi Blok' : 'Visualisasi Dekripsi Blok' }}
              </h3>
              <span class="text-[10px] font-semibold tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase">
                AES-256-GCM
              </span>
              <span class="text-[10px] font-semibold tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
                Blok 128-bit (16 Byte)
              </span>
            </div>
            <p class="text-xs text-slate-400">
              {{ currentMode === 'encrypt' ? 'Representasi edukatif transformasi data per blok 16 byte dengan Web Crypto API' : 'Rekonstruksi data per blok 16 byte dengan verifikasi tag integritas' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Mode Toggle (If in standalone interactive sandbox mode) -->
          <div v-if="allowModeSwitch" class="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              @click="switchMode('encrypt')"
              class="px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              :class="currentMode === 'encrypt' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'"
            >
              🔒 Encrypt
            </button>
            <button
              type="button"
              @click="switchMode('decrypt')"
              class="px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              :class="currentMode === 'decrypt' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'"
            >
              🔓 Decrypt
            </button>
          </div>

          <!-- Close X button -->
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

      <!-- Controls & Progress Toolbar -->
      <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-3 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <!-- Play / Pause / Restart Controls -->
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
            <span>{{ isPlaying ? '⏸ Jeda' : isCompleted ? '▶ Ulangi' : '▶ Mulai' }}</span>
          </button>
          <button
            type="button"
            @click="restartAnimation"
            class="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            title="Mulai Ulang Animasi"
          >
            <span>↻</span> Restart
          </button>
        </div>

        <!-- Speed Slider -->
        <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <span class="text-slate-400 shrink-0 font-medium">Kecepatan:</span>
          <div class="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
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

        <!-- Block Progress Indicator -->
        <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span class="font-mono text-slate-300 font-semibold">
            Blok {{ activeBlockIndex + 1 }} / {{ totalBlocks }}
          </span>
          <div class="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r transition-all duration-300"
              :class="currentMode === 'encrypt' ? 'from-emerald-500 to-teal-400' : 'from-indigo-500 to-cyan-400'"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Main Interactive Block Pipeline -->
      <div class="space-y-4">
        <!-- Top Card: Source Data Stream Overview -->
        <div class="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
          <div class="flex items-center justify-between text-xs mb-1.5">
            <span class="text-slate-400 font-semibold uppercase tracking-wider">
              {{ currentMode === 'encrypt' ? '1. Plaintext Input (Teks Asli)' : '1. Ciphertext Payload & Nonce' }}
            </span>
            <span class="font-mono text-[11px] text-slate-500">
              {{ currentMode === 'encrypt' ? `${plainBytesLength} Byte • ${blocks.length} Blok (16B/blok)` : `${cipherBytesLength} Byte Data + 16B Auth Tag` }}
            </span>
          </div>
          <div class="font-mono text-xs text-slate-300 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 break-all max-h-20 overflow-y-auto">
            <template v-if="currentMode === 'encrypt'">
              <span class="text-emerald-400">{{ plaintext || 'Tidak ada teks' }}</span>
            </template>
            <template v-else>
              <div class="flex flex-col gap-1">
                <div><span class="text-slate-500 text-[10px]">CIPHERTEXT (BASE64):</span> <span class="text-amber-400">{{ ciphertext }}</span></div>
                <div v-if="iv"><span class="text-slate-500 text-[10px]">IV (96-BIT):</span> <span class="text-cyan-400">{{ iv }}</span></div>
              </div>
            </template>
          </div>
        </div>

        <!-- Block Carousel / Grid Navigation Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          <button
            v-for="(block, idx) in blocks"
            :key="idx"
            type="button"
            @click="selectBlock(idx)"
            class="px-2.5 py-1.5 rounded-lg border text-xs font-mono shrink-0 transition-all cursor-pointer flex items-center gap-1.5"
            :class="[
              activeBlockIndex === idx
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-1 ring-indigo-400/30'
                : block.status === 'completed'
                ? 'bg-slate-950 border-emerald-500/40 text-emerald-400'
                : block.status === 'processing'
                ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300 animate-pulse'
                : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300'
            ]"
          >
            <span>{{ block.isAuthTag ? '🏷️ Tag' : `Blok ${idx + 1}` }}</span>
            <span v-if="block.status === 'completed'" class="text-[10px]">✓</span>
            <span v-else-if="block.status === 'processing'" class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
          </button>
        </div>

        <!-- Active Focus Stage: Vertical Block Transformation -->
        <div
          v-if="currentBlock"
          class="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 transition-all duration-300 shadow-inner"
          :class="[
            currentBlock.status === 'processing' ? 'border-indigo-500/60 ring-1 ring-indigo-500/20' : ''
          ]"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-indigo-300">
                {{ currentBlock.isAuthTag ? 'Authentication Tag (GMAC)' : `Transformasi Blok ${activeBlockIndex + 1} / ${blocks.length}` }}
              </span>
              <span
                class="text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase"
                :class="[
                  currentBlock.status === 'completed'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : currentBlock.status === 'processing'
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                ]"
              >
                Status: {{ currentBlock.status }}
              </span>
            </div>
            <span class="text-xs font-mono text-slate-400">16-Byte Chunk (128 bits)</span>
          </div>

          <!-- Vertical Layout -->
          <div class="flex flex-col items-center gap-2">
            <!-- Source Block Card -->
            <div class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs">
              <div class="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span class="font-bold text-slate-300">
                  {{ currentMode === 'encrypt' ? `Plaintext Block ${activeBlockIndex + 1}` : `Cipher Block ${activeBlockIndex + 1}` }}
                </span>
                <span class="text-[10px] text-slate-500">
                  {{ currentBlock.bytes.length }} / 16 Bytes terisi
                </span>
              </div>

              <!-- 16-slot Byte Table Representation -->
              <div class="grid grid-cols-8 sm:grid-cols-16 gap-1 text-center select-none overflow-x-auto">
                <div
                  v-for="slotIdx in 16"
                  :key="slotIdx"
                  class="flex flex-col rounded border p-1 transition-all"
                  :class="[
                    slotIdx - 1 < currentBlock.bytes.length
                      ? 'bg-slate-950 border-slate-700 text-slate-200'
                      : 'bg-slate-950/30 border-slate-800/40 text-slate-600'
                  ]"
                >
                  <!-- Hex Offset Header -->
                  <span class="text-[9px] text-slate-500 font-bold border-b border-slate-800/80 pb-0.5 mb-0.5">
                    {{ (slotIdx - 1).toString(16).toUpperCase().padStart(2, '0') }}
                  </span>
                  <!-- Hex Byte Value -->
                  <span
                    class="text-[11px] font-bold"
                    :class="[
                      slotIdx - 1 < currentBlock.bytes.length
                        ? currentMode === 'encrypt' ? 'text-emerald-400' : 'text-amber-400'
                        : 'text-slate-700'
                    ]"
                  >
                    {{ slotIdx - 1 < currentBlock.bytes.length ? byteToHex(currentBlock.bytes[slotIdx - 1]) : '··' }}
                  </span>
                  <!-- Character / ASCII representation -->
                  <span
                    class="text-[10px] truncate"
                    :class="slotIdx - 1 < currentBlock.bytes.length ? 'text-cyan-300' : 'text-slate-700'"
                  >
                    {{ slotIdx - 1 < currentBlock.bytes.length ? formatCharDisplay(currentBlock.bytes[slotIdx - 1]) : ' ' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Animated Down Flow Connector 1 -->
            <div class="flex flex-col items-center py-1 text-indigo-400">
              <div
                class="w-0.5 h-4 transition-colors"
                :class="currentBlock.status !== 'idle' ? 'bg-indigo-500' : 'bg-slate-800'"
              ></div>
              <svg class="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            <!-- Central AES-256-GCM Core Box -->
            <div
              class="w-full max-w-md bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border rounded-xl p-3 text-center transition-all duration-300"
              :class="[
                currentBlock.status === 'processing'
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                  : 'border-slate-800'
              ]"
            >
              <div class="flex items-center justify-center gap-2 mb-1">
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  :class="currentBlock.status === 'processing' ? 'bg-indigo-500 text-white animate-spin' : 'bg-slate-800 text-indigo-400'"
                >
                  {{ currentBlock.status === 'processing' ? '⚙️' : currentMode === 'encrypt' ? '🔐' : '🔓' }}
                </div>
                <span class="text-xs font-bold text-slate-100">
                  {{ currentMode === 'encrypt' ? 'AES-256-GCM Enkripsi Core' : 'AES-256-GCM Dekripsi Core' }}
                </span>
              </div>
              <p class="text-[11px] text-slate-400">
                {{
                  currentBlock.isAuthTag
                    ? 'Menyusun 128-bit Authentication Tag (GMAC) untuk integritas anti-tamper'
                    : currentBlock.status === 'processing'
                    ? `Memproses 128-bit blok data simetris (Counter ${activeBlockIndex + 1})`
                    : currentBlock.status === 'completed'
                    ? 'Transformasi blok 128-bit selesai'
                    : 'Menunggu pemrosesan blok...'
                }}
              </p>
            </div>

            <!-- Animated Down Flow Connector 2 -->
            <div class="flex flex-col items-center py-1 text-indigo-400">
              <div
                class="w-0.5 h-4 transition-colors"
                :class="currentBlock.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-800'"
              ></div>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            <!-- Target Output Block Card -->
            <div
              class="w-full bg-slate-900 border rounded-xl p-3 font-mono text-xs transition-colors"
              :class="[
                currentBlock.status === 'completed'
                  ? (isFailed ? 'border-rose-500/50 bg-rose-950/20' : 'border-emerald-500/50 bg-emerald-950/10')
                  : 'border-slate-800'
              ]"
            >
              <div class="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span class="font-bold" :class="currentBlock.status === 'completed' ? (isFailed ? 'text-rose-400' : 'text-emerald-300') : 'text-slate-400'">
                  {{ currentMode === 'encrypt' ? `Cipher Block ${activeBlockIndex + 1}` : (isFailed ? `Output Acak / Gagal Blok ${activeBlockIndex + 1}` : `Plaintext Block ${activeBlockIndex + 1}`) }}
                </span>
                <span v-if="currentBlock.status === 'completed'" class="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span>✓</span> Selesai
                </span>
                <span v-else class="text-[10px] text-slate-500">
                  Menunggu eksekusi...
                </span>
              </div>

              <!-- 16-slot Byte Target Table -->
              <div class="grid grid-cols-8 sm:grid-cols-16 gap-1 text-center select-none overflow-x-auto">
                <div
                  v-for="slotIdx in 16"
                  :key="slotIdx"
                  class="flex flex-col rounded border p-1 transition-all"
                  :class="[
                    currentBlock.status === 'completed' && slotIdx - 1 < currentBlock.resultBytes.length
                      ? (isFailed ? 'bg-rose-950/60 border-rose-800/60' : 'bg-slate-950 border-slate-700')
                      : 'bg-slate-950/30 border-slate-800/40 text-slate-600'
                  ]"
                >
                  <!-- Hex Offset Header -->
                  <span class="text-[9px] text-slate-500 font-bold border-b border-slate-800/80 pb-0.5 mb-0.5">
                    {{ (slotIdx - 1).toString(16).toUpperCase().padStart(2, '0') }}
                  </span>
                  <!-- Hex Byte Value -->
                  <span
                    class="text-[11px] font-bold"
                    :class="[
                      currentBlock.status === 'completed' && slotIdx - 1 < currentBlock.resultBytes.length
                        ? (isFailed ? 'text-rose-400' : currentMode === 'encrypt' ? 'text-amber-400' : 'text-emerald-400')
                        : 'text-slate-700'
                    ]"
                  >
                    {{
                      currentBlock.status === 'completed' && slotIdx - 1 < currentBlock.resultBytes.length
                        ? byteToHex(currentBlock.resultBytes[slotIdx - 1])
                        : '··'
                    }}
                  </span>
                  <!-- Char representation -->
                  <span
                    class="text-[10px] truncate"
                    :class="currentBlock.status === 'completed' && slotIdx - 1 < currentBlock.resultBytes.length ? (isFailed ? 'text-rose-300' : 'text-cyan-300') : 'text-slate-700'"
                  >
                    {{
                      currentBlock.status === 'completed' && slotIdx - 1 < currentBlock.resultBytes.length
                        ? formatCharDisplay(currentBlock.resultBytes[slotIdx - 1])
                        : ' '
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Technical Parameters Breakdown & Educational Disclaimer -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <!-- Parameter Specs -->
          <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5 font-mono">
            <div class="text-[11px] font-sans font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <span>⚙️</span> Parameter Kriptografi
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Algoritma:</span>
              <span class="text-indigo-300 font-semibold">AES-256-GCM</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Panjang Kunci (Key):</span>
              <span class="text-indigo-300 font-semibold">256-bit (SHA-256 KDF)</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Ukuran Blok (Block Size):</span>
              <span class="text-emerald-300 font-semibold">128-bit (16 Byte)</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>IV / Nonce Acak:</span>
              <span class="text-cyan-300 font-semibold">96-bit (12 Byte)</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Authentication Tag:</span>
              <span class="text-amber-300 font-semibold">128-bit (16 Byte GMAC)</span>
            </div>
          </div>

          <!-- Educational Disclaimer Box -->
          <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 space-y-2 flex flex-col justify-center">
            <div class="flex items-start gap-2">
              <span class="text-indigo-400 text-sm shrink-0">💡</span>
              <p class="leading-relaxed text-[11px]">
                <strong class="text-slate-200">Konsep Blok AES:</strong> AES selalu beroperasi pada blok 128-bit (16 byte). Angka 256 pada AES-256 adalah panjang kunci enkripsi.
              </p>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-400 text-sm shrink-0">🔒</span>
              <p class="leading-relaxed text-[11px]">
                <strong class="text-slate-200">Native Web Crypto:</strong> Enkripsi dieksekusi terpadu via <code class="text-emerald-300">crypto.subtle</code> di browser klien tanpa pengiriman kunci ke server.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Action & Completion Notice -->
      <div class="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-xs">
          <div v-if="isCompleted && !isFailed" class="flex items-center gap-1.5 text-emerald-400 font-semibold animate-in fade-in duration-300">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>
              {{ currentMode === 'encrypt' ? `✓ Enkripsi Selesai (${blocks.length} blok diproses)` : '✓ Dekripsi Berhasil (Teks asli terpulihkan)' }}
            </span>
          </div>
          <div v-else-if="isCompleted && isFailed" class="flex items-center gap-1.5 text-rose-400 font-semibold animate-in fade-in duration-300">
            <span>⚠️ Tag Mismatch! Kunci salah, payload acak ditampilkan.</span>
          </div>
          <div v-else class="flex items-center gap-2 text-slate-400">
            <svg class="w-3.5 h-3.5 animate-spin text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>Memproses blok kriptografi {{ activeBlockIndex + 1 }} dari {{ totalBlocks }}...</span>
          </div>
        </div>

        <!-- Action Button -->
        <button
          type="button"
          @click="proceed"
          class="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          :class="[
            isCompleted && !isFailed
              ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-emerald-600/25 ring-2 ring-emerald-400/30'
              : isCompleted && isFailed
              ? 'bg-rose-600 hover:bg-rose-500 active:scale-95 text-white shadow-rose-600/25 ring-2 ring-rose-400/30'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
          ]"
        >
          <span>{{ isCompleted ? (isFailed ? 'Buka Catatan (Acak)' : 'Lanjutkan') : 'Lewati & Lanjutkan' }}</span>
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
import { byteToHex, splitIntoBlocks, parseEncryptedPayload, base64ToBuffer, useCrypto } from '../composables/useCrypto';

const props = defineProps({
  mode: {
    type: String,
    default: 'encrypt', // 'encrypt' or 'decrypt'
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
  isFailed: {
    type: Boolean,
    default: false,
  },
  allowModeSwitch: {
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
const isPlaying = ref(true);
const isCompleted = ref(false);
const activeBlockIndex = ref(0);
const speedMs = ref(800); // default speed

const speedOptions = [
  { label: '0.5x', ms: 1400 },
  { label: '1.0x', ms: 800 },
  { label: '2.0x', ms: 400 },
  { label: '3.0x', ms: 200 },
];

let timer = null;

// Block models
const blocks = ref([]);
const plainBytesLength = ref(0);
const cipherBytesLength = ref(0);

const totalBlocks = computed(() => blocks.value.length || 1);
const currentBlock = computed(() => blocks.value[activeBlockIndex.value] || null);
const progressPercent = computed(() => {
  if (totalBlocks.value === 0) return 0;
  const completedCount = blocks.value.filter((b) => b.status === 'completed').length;
  return Math.min(100, Math.round((completedCount / totalBlocks.value) * 100));
});

// Format characters for clear display (spaces as '_' in visual representation, unprintable as '.')
function formatCharDisplay(byte) {
  if (byte === 32) return '_'; // visually show space as requested in section 1
  if (byte >= 33 && byte <= 126) return String.fromCharCode(byte);
  return '·';
}

function initBlocks() {
  clearTimeout(timer);
  const encoder = new TextEncoder();
  const rawPlainBytes = encoder.encode(props.plaintext || '');
  plainBytesLength.value = rawPlainBytes.length;

  const { cipherBytes, tagBytes, rawBytes } = parseEncryptedPayload(props.ciphertext || '');
  cipherBytesLength.value = cipherBytes.length;

  const plainChunks = splitIntoBlocks(rawPlainBytes, 16);
  const cipherChunks = splitIntoBlocks(cipherBytes, 16);

  const blockCount = Math.max(plainChunks.length, cipherChunks.length, 1);
  const newBlocks = [];

  for (let i = 0; i < blockCount; i++) {
    const pChunk = plainChunks[i] || new Uint8Array(0);
    const cChunk = cipherChunks[i] || new Uint8Array(pChunk.length);

    if (currentMode.value === 'encrypt') {
      newBlocks.push({
        index: i,
        status: 'idle', // idle, active, processing, completed
        bytes: pChunk,
        resultBytes: cChunk,
        isAuthTag: false,
      });
    } else {
      newBlocks.push({
        index: i,
        status: 'idle',
        bytes: cChunk,
        resultBytes: pChunk,
        isAuthTag: false,
      });
    }
  }

  // If Auth Tag is available and valid in encrypt mode or decrypt mode
  if (tagBytes && tagBytes.length > 0) {
    newBlocks.push({
      index: blockCount,
      status: 'idle',
      bytes: tagBytes,
      resultBytes: tagBytes,
      isAuthTag: true,
    });
  }

  blocks.value = newBlocks;
  activeBlockIndex.value = 0;
  isCompleted.value = false;
  isPlaying.value = true;

  // Check prefers-reduced-motion
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Complete immediately if reduced motion is preferred
    completeAllBlocks();
    return;
  }

  runStep();
}

function runStep() {
  clearTimeout(timer);
  if (!isPlaying.value) return;

  const idx = activeBlockIndex.value;
  if (idx >= blocks.value.length) {
    isCompleted.value = true;
    isPlaying.value = false;
    return;
  }

  const block = blocks.value[idx];
  block.status = 'active';

  // Step A: Active to Processing
  timer = setTimeout(() => {
    if (!isPlaying.value) return;
    block.status = 'processing';

    // Step B: Processing to Completed
    timer = setTimeout(() => {
      if (!isPlaying.value) return;
      block.status = 'completed';

      if (idx + 1 < blocks.value.length) {
        activeBlockIndex.value = idx + 1;
        timer = setTimeout(runStep, Math.max(80, speedMs.value * 0.2));
      } else {
        isCompleted.value = true;
        isPlaying.value = false;
      }
    }, Math.max(120, speedMs.value * 0.5));
  }, Math.max(100, speedMs.value * 0.35));
}

function togglePlay() {
  if (isCompleted.value) {
    restartAnimation();
    return;
  }
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    runStep();
  } else {
    clearTimeout(timer);
  }
}

function restartAnimation() {
  initBlocks();
}

function selectBlock(idx) {
  activeBlockIndex.value = idx;
}

function completeAllBlocks() {
  clearTimeout(timer);
  blocks.value.forEach((b) => {
    b.status = 'completed';
  });
  if (blocks.value.length > 0) {
    activeBlockIndex.value = blocks.value.length - 1;
  }
  isCompleted.value = true;
  isPlaying.value = false;
}

function proceed() {
  completeAllBlocks();
  emit('complete');
}

function switchMode(newMode) {
  if (currentMode.value === newMode) return;
  currentMode.value = newMode;
  initBlocks();
}

watch(() => props.ciphertext, () => {
  initBlocks();
});

onMounted(() => {
  initBlocks();
});

onUnmounted(() => {
  clearTimeout(timer);
});
</script>
