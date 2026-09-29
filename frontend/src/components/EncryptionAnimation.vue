<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
    <div class="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col text-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-100 flex items-center gap-2">
              Proses Enkripsi Data
              <span class="text-[10px] font-semibold tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
                AES-256-GCM
              </span>
            </h3>
            <p class="text-xs text-slate-400">Transformasi teks asli menjadi data terenkripsi bertingkat</p>
          </div>
        </div>

        <span class="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
          Langkah {{ Math.min(activeStep, 4) }}/4
        </span>
      </div>

      <!-- Step-by-Step Vertical Pipeline -->
      <div class="space-y-3 relative font-sans text-sm">
        <!-- Step 1: Plaintext Input -->
        <div
          class="transition-all duration-300 rounded-xl border p-3.5"
          :class="[
            activeStep >= 1
              ? 'bg-slate-800/80 border-slate-700 opacity-100'
              : 'bg-slate-900/40 border-slate-800/60 opacity-40'
          ]"
        >
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-2">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                :class="activeStep > 1 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : activeStep === 1 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 animate-pulse' : 'bg-slate-800 text-slate-500'"
              >
                <span v-if="activeStep > 1">✓</span>
                <span v-else>1</span>
              </div>
              <span class="font-semibold text-xs uppercase tracking-wider text-slate-200">1. Input Plaintext (Teks Asli)</span>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">UTF-8 String</span>
          </div>
          <p class="text-xs text-slate-400 mb-2 pl-8">
            Teks dibaca dari memori browser klien dan diubah ke byte stream (UTF-8).
          </p>
          <div class="ml-8 font-mono text-xs bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-emerald-400 break-all min-h-[2.25rem]">
            {{ streamPlaintext || 'Menunggu input teks...' }}
          </div>
        </div>

        <!-- Vertical Connector 1 -->
        <div class="flex justify-center py-0.5">
          <div
            class="h-4 w-0.5 transition-colors duration-300 flex items-center justify-center"
            :class="activeStep >= 2 ? 'bg-emerald-500/70' : 'bg-slate-800'"
          >
            <div v-if="activeStep === 1" class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
          </div>
        </div>

        <!-- Step 2: Key Derivation & Random IV -->
        <div
          class="transition-all duration-300 rounded-xl border p-3.5"
          :class="[
            activeStep >= 2
              ? 'bg-slate-800/80 border-slate-700 opacity-100'
              : 'bg-slate-900/40 border-slate-800/60 opacity-40'
          ]"
        >
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-2">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                :class="activeStep > 2 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : activeStep === 2 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 animate-pulse' : 'bg-slate-800 text-slate-500'"
              >
                <span v-if="activeStep > 2">✓</span>
                <span v-else>2</span>
              </div>
              <span class="font-semibold text-xs uppercase tracking-wider text-slate-200">2. Derivasi Kunci & Pembuatan IV Acak</span>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">SHA-256 + 96-bit IV</span>
          </div>
          <p class="text-xs text-slate-400 mb-2 pl-8">
            Password di-hash menjadi 256-bit CryptoKey, dan sistem menghasilkan 12-byte IV acak agar hasil enkripsi selalu unik.
          </p>
          <div class="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div class="bg-slate-950/80 border border-slate-800 rounded-lg p-2">
              <div class="text-[10px] text-slate-500 mb-0.5">KUNCI 256-BIT (SHA-256):</div>
              <div class="text-indigo-300 truncate">{{ activeStep >= 2 ? simulatedKeyHash : '································' }}</div>
            </div>
            <div class="bg-slate-950/80 border border-slate-800 rounded-lg p-2">
              <div class="text-[10px] text-slate-500 mb-0.5">RANDOM IV (12-BYTE):</div>
              <div class="text-cyan-300 truncate">{{ activeStep >= 2 ? simulatedIv : '················' }}</div>
            </div>
          </div>
        </div>

        <!-- Vertical Connector 2 -->
        <div class="flex justify-center py-0.5">
          <div
            class="h-4 w-0.5 transition-colors duration-300 flex items-center justify-center"
            :class="activeStep >= 3 ? 'bg-emerald-500/70' : 'bg-slate-800'"
          >
            <div v-if="activeStep === 2" class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
          </div>
        </div>

        <!-- Step 3: AES-256-GCM Engine -->
        <div
          class="transition-all duration-300 rounded-xl border p-3.5"
          :class="[
            activeStep >= 3
              ? 'bg-slate-800/80 border-slate-700 opacity-100'
              : 'bg-slate-900/40 border-slate-800/60 opacity-40'
          ]"
        >
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-2">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                :class="activeStep > 3 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : activeStep === 3 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 animate-pulse' : 'bg-slate-800 text-slate-500'"
              >
                <span v-if="activeStep > 3">✓</span>
                <span v-else>3</span>
              </div>
              <span class="font-semibold text-xs uppercase tracking-wider text-slate-200">3. Enkripsi Galois/Counter Mode (GCM)</span>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">Authenticated Crypto</span>
          </div>
          <p class="text-xs text-slate-400 mb-2 pl-8">
            Algoritma mengenkripsi blok data secara simetris dan menghasilkan 128-bit Authentication Tag untuk proteksi integritas anti-tamper.
          </p>
          <div class="ml-8 bg-indigo-950/40 border border-indigo-500/30 rounded-lg p-2.5 flex items-center justify-between gap-2 text-xs font-mono text-indigo-300">
            <div class="flex items-center gap-2">
              <svg v-if="activeStep === 3" class="w-4 h-4 animate-spin text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <svg v-else-if="activeStep > 3" class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span class="truncate">
                {{ activeStep === 3 ? 'Mengenkripsi blok cipher & menyusun GMAC Tag...' : activeStep > 3 ? 'Blok terenkripsi & Authentication Tag tervalidasi' : 'Siap melakukan komputasi enkripsi' }}
              </span>
            </div>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-500/30 shrink-0">128-bit Tag</span>
          </div>
        </div>

        <!-- Vertical Connector 3 -->
        <div class="flex justify-center py-0.5">
          <div
            class="h-4 w-0.5 transition-colors duration-300 flex items-center justify-center"
            :class="activeStep >= 4 ? 'bg-emerald-500/70' : 'bg-slate-800'"
          >
            <div v-if="activeStep === 3" class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
          </div>
        </div>

        <!-- Step 4: Ciphertext Output -->
        <div
          class="transition-all duration-300 rounded-xl border p-3.5"
          :class="[
            activeStep >= 4
              ? 'bg-slate-800/80 border-slate-700 opacity-100'
              : 'bg-slate-900/40 border-slate-800/60 opacity-40'
          ]"
        >
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-2">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                :class="isFinished ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : activeStep === 4 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 animate-pulse' : 'bg-slate-800 text-slate-500'"
              >
                <span v-if="isFinished">✓</span>
                <span v-else>4</span>
              </div>
              <span class="font-semibold text-xs uppercase tracking-wider text-slate-200">4. Output Ciphertext (Base64)</span>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">Terenkripsi Total</span>
          </div>
          <p class="text-xs text-slate-400 mb-2 pl-8">
            Data terenkripsi siap dikirim dan disimpan ke database server tanpa pernah membocorkan isi catatan.
          </p>
          <div class="ml-8 font-mono text-xs bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-amber-400 break-all min-h-[2.25rem]">
            {{ streamCiphertext || 'Menunggu hasil enkripsi...' }}
          </div>
        </div>
      </div>

      <!-- Footer Action & Completion Notice -->
      <div class="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-xs">
          <div v-if="isFinished" class="flex items-center gap-1.5 text-emerald-400 font-medium animate-in fade-in duration-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>Enkripsi Selesai! Data aman untuk disimpan.</span>
          </div>
          <div v-else class="flex items-center gap-2 text-slate-400">
            <svg class="w-3.5 h-3.5 animate-spin text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>Memproses tahapan kriptografi...</span>
          </div>
        </div>

        <!-- Tombol Lanjutkan -->
        <button
          type="button"
          @click="proceed"
          class="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          :class="[
            isFinished
              ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-emerald-600/25 ring-2 ring-emerald-400/30'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
          ]"
        >
          <span>{{ isFinished ? 'Lanjutkan' : 'Lewati & Lanjutkan' }}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  plaintext: {
    type: String,
    required: true,
  },
  ciphertext: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['complete']);

const activeStep = ref(1);
const isFinished = ref(false);
const streamPlaintext = ref('');
const streamCiphertext = ref('');
const simulatedKeyHash = ref('');
const simulatedIv = ref('');

function generateRandomHex(length) {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

onMounted(async () => {
  const plainSample = props.plaintext.length > 36 ? props.plaintext.slice(0, 36) + '...' : props.plaintext;
  const cipherSample = props.ciphertext.length > 44 ? props.ciphertext.slice(0, 44) + '...' : props.ciphertext;

  // Step 1: Plaintext stream
  activeStep.value = 1;
  for (let i = 1; i <= plainSample.length; i++) {
    streamPlaintext.value = plainSample.slice(0, i);
    await new Promise((r) => setTimeout(r, 22));
  }
  await new Promise((r) => setTimeout(r, 250));

  // Step 2: Key & IV generation
  activeStep.value = 2;
  simulatedKeyHash.value = generateRandomHex(32) + '...';
  simulatedIv.value = generateRandomHex(16) + '...';
  await new Promise((r) => setTimeout(r, 450));

  // Step 3: AES-256-GCM computation
  activeStep.value = 3;
  await new Promise((r) => setTimeout(r, 550));

  // Step 4: Ciphertext output stream
  activeStep.value = 4;
  for (let i = 1; i <= cipherSample.length; i++) {
    streamCiphertext.value = cipherSample.slice(0, i);
    await new Promise((r) => setTimeout(r, 16));
  }
  await new Promise((r) => setTimeout(r, 250));

  isFinished.value = true;
});

function proceed() {
  emit('complete');
}
</script>

