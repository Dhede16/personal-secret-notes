<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
    <div class="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col text-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <span class="text-xl">🔬</span>
          </div>
          <div>
            <h2 class="text-base font-bold text-white flex items-center gap-2">
              AES-256-GCM Interactive Visualizer Sandbox
              <span class="text-[10px] font-semibold tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
                128-bit Blocks
              </span>
            </h2>
            <p class="text-xs text-slate-400">
              Eksplorasi visual konsep blok 16-byte, IV, dan GMAC Authentication Tag
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors"
          title="Tutup Sandbox"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Sandbox Configuration Form -->
      <div class="p-6 space-y-4 border-b border-slate-800 bg-slate-950/40">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Plaintext Input -->
          <div class="sm:col-span-2 space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Plaintext Sample (Teks Uji Coba)
            </label>
            <input
              v-model="inputPlaintext"
              type="text"
              class="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Masukkan teks yang ingin divisualisasikan..."
              @input="recomputeCrypto"
            />
          </div>

          <!-- Secret Key Input -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Encryption Key
            </label>
            <input
              v-model="inputKey"
              type="text"
              class="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Kunci enkripsi..."
              @input="recomputeCrypto"
            />
          </div>
        </div>
      </div>

      <!-- Live Block Visualizer Embedded -->
      <div class="p-6">
        <CryptoBlockVisualizer
          :key="recomputeTrigger"
          :mode="activeMode"
          :plaintext="inputPlaintext"
          :ciphertext="computedCiphertext"
          :iv="computedIv"
          :allow-mode-switch="true"
          @complete="onComplete"
          @close="$emit('close')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCrypto } from '../composables/useCrypto';
import CryptoBlockVisualizer from './CryptoBlockVisualizer.vue';

defineEmits(['close']);

const { encryptNote } = useCrypto();

const inputPlaintext = ref('Hello World, this is my secret note');
const inputKey = ref('secret-password-123');
const activeMode = ref('encrypt');
const computedCiphertext = ref('');
const computedIv = ref('');
const recomputeTrigger = ref(0);

async function recomputeCrypto() {
  if (!inputPlaintext.value || !inputKey.value) return;
  try {
    const result = await encryptNote(inputPlaintext.value, inputKey.value);
    computedCiphertext.value = result.ciphertext;
    computedIv.value = result.iv;
    recomputeTrigger.value++;
  } catch (e) {
    // ignore temporary input validation
  }
}

function onComplete() {
  // sandbox complete handler
}

onMounted(() => {
  recomputeCrypto();
});
</script>
