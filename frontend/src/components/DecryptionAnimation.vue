<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
    <div class="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col text-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-100 flex items-center gap-2">
              Proses Dekripsi Data
              <span class="text-[10px] font-semibold tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase">
                AES-256-GCM
              </span>
            </h3>
            <p class="text-xs text-slate-400">Verifikasi integritas & pemulihan teks asli secara bertahap</p>
          </div>
        </div>

        <span class="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
          Langkah {{ Math.min(activeStep, 4) }}/4
        </span>
      </div>

      <!-- Step-by-Step Vertical Pipeline -->
      <div class="space-y-3 relative font-sans text-sm">
        <!-- Step 1: Ciphertext Input -->
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
                :class="activeStep > 1 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40' : activeStep === 1 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 animate-pulse' : 'bg-slate-800 text-slate-500'"
              >
                <span v-if="activeStep > 1">✓</span>
                <span v-else>1</span>
              </div>
              <span class="font-semibold text-xs uppercase tracking-wider text-slate-200">1. Input Ciphertext & IV</span>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">Payload Base64</span>
          </div>
          <p class="text-xs text-slate-400 mb-2 pl-8">
            Data acak terenkripsi dimuat dari server ke browser klien tanpa pernah didekripsi di sisi server.
          </p>
          <div class="ml-8 font-mono text-xs bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-amber-400 break-all min-h-[2.25rem]">
            {{ streamCiphertext || 'Memuat ciphertext...' }}
          </div>
        </div>

        <!-- Vertical Connector 1 -->
        <div class="flex justify-center py-0.5">
          <div
            class="h-4 w-0.5 transition-colors duration-300 flex items-center justify-center"
            :class="activeStep >= 2 ? 'bg-indigo-500/70' : 'bg-slate-800'"
          >
            <div v-if="activeStep === 1" class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></div>
          </div>
        </div>

        <!-- Step 2: Key Derivation & IV Matching -->
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
                :class="activeStep > 2 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40' : activeStep === 2 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 animate-pulse' : 'bg-slate-800 text-slate-500'"
              >
                <span v-if="activeStep > 2">✓</span>
                <span v-else>2</span>
              </div>
              <span class="font-semibold text-xs uppercase tracking-wider text-slate-200">2. Derivasi Kunci & Ekstraksi IV</span>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">Verifikasi Kunci</span>
          </div>
          <p class="text-xs text-slate-400 mb-2 pl-8">
            Kunci yang dimasukkan di-hash dengan SHA-256 untuk merekonstruksi 256-bit CryptoKey dan dicocokkan dengan Initialization Vector (IV).
          </p>
          <div class="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div class="bg-slate-950/80 border border-slate-800 rounded-lg p-2">
              <div class="text-[10px] text-slate-500 mb-0.5">STATUS KUNCI KRIPTO:</div>
              <div class="text-indigo-300 flex items-center gap-1">
                <span v-if="activeStep >= 2" class="text-emerald-400">● 256-bit Key Siap</span>
                <span v-else class="text-slate-500">Menunggu derivasi...</span>
              </div>
            </div>
            <div class="bg-slate-950/80 border border-slate-800 rounded-lg p-2">
              <div class="text-[10px] text-slate-500 mb-0.5">STATUS IV (96-BIT):</div>
              <div class="text-cyan-300 flex items-center gap-1">
                <span v-if="activeStep >= 2" class="text-cyan-400">● IV Terbaca</span>
                <span v-else class="text-slate-500">Menunggu ekstraksi...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Vertical Connector 2 -->
        <div class="flex justify-center py-0.5">
          <div
            class="h-4 w-0.5 transition-colors duration-300 flex items-center justify-center"
            :class="activeStep >= 3 ? 'bg-indigo-500/70' : 'bg-slate-800'"
          >
            <div v-if="activeStep === 2" class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></div>
          </div>
        </div>

        <!-- Step 3: AES-256-GCM Authentication & Decrypt -->
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
              <span class="font-semibold text-xs uppercase tracking-wider text-slate-200">3. Validasi Autentikasi GCM (Anti-Tamper)</span>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">128-bit Tag Check</span>
          </div>
          <p class="text-xs text-slate-400 mb-2 pl-8">
            Memeriksa keaslian tag kriptografi. Jika kunci salah atau data telah diubah 1 bit pun, proses akan ditolak otomatis.
          </p>
          <div class="ml-8 bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-2.5 flex items-center justify-between gap-2 text-xs font-mono text-emerald-300">
            <div class="flex items-center gap-2">
              <svg v-if="activeStep === 3" class="w-4 h-4 animate-spin text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <svg v-else-if="activeStep > 3" class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span class="truncate">
                {{ activeStep === 3 ? 'Memvalidasi Authentication Tag GMAC...' : activeStep > 3 ? 'Integritas Terverifikasi & Tag Cocok 100%' : 'Menunggu validasi blok cipher' }}
              </span>
            </div>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 shrink-0">Authentic</span>
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

        <!-- Step 4: Plaintext Output -->
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
              <span class="font-semibold text-xs uppercase tracking-wider text-slate-200">4. Output Plaintext (Teks Asli Terpulihkan)</span>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">Dekripsi Berhasil</span>
          </div>
          <p class="text-xs text-slate-400 mb-2 pl-8">
            Blok data berhasil didekripsi menjadi teks asli di memori browser dan siap dibaca atau diedit.
          </p>
          <div class="ml-8 font-mono text-xs bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-emerald-400 break-all min-h-[2.25rem]">
            {{ streamPlaintext || 'Menunggu pemulihan teks...' }}
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
            <span>Dekripsi Selesai! Catatan berhasil dibuka.</span>
          </div>
          <div v-else class="flex items-center gap-2 text-slate-400">
            <svg class="w-3.5 h-3.5 animate-spin text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>Memverifikasi dan mendekripsi catatan...</span>
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
  ciphertext: {
    type: String,
    required: true,
  },
  plaintext: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['complete']);

const activeStep = ref(1);
const isFinished = ref(false);
const streamCiphertext = ref('');
const streamPlaintext = ref('');

onMounted(async () => {
  const cipherSample = props.ciphertext.length > 44 ? props.ciphertext.slice(0, 44) + '...' : props.ciphertext;
  const plainSample = props.plaintext.length > 36 ? props.plaintext.slice(0, 36) + '...' : props.plaintext;

  // Step 1: Display Ciphertext stream
  activeStep.value = 1;
  for (let i = 1; i <= cipherSample.length; i++) {
    streamCiphertext.value = cipherSample.slice(0, i);
    await new Promise((r) => setTimeout(r, 16));
  }
  await new Promise((r) => setTimeout(r, 250));

  // Step 2: Key & IV Matching
  activeStep.value = 2;
  await new Promise((r) => setTimeout(r, 450));

  // Step 3: GCM Authentication verification & decrypt
  activeStep.value = 3;
  await new Promise((r) => setTimeout(r, 550));

  // Step 4: Plaintext reveal stream
  activeStep.value = 4;
  for (let i = 1; i <= plainSample.length; i++) {
    streamPlaintext.value = plainSample.slice(0, i);
    await new Promise((r) => setTimeout(r, 22));
  }
  await new Promise((r) => setTimeout(r, 250));

  isFinished.value = true;
});

function proceed() {
  emit('complete');
}
</script>

