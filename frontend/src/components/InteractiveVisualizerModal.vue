<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col text-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] overflow-hidden"
    >
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
            <span class="text-lg sm:text-xl">🔬</span>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-sm sm:text-base font-bold text-white">
                AES-256-GCM Interactive Visualizer Sandbox
              </h2>
              <span class="text-[10px] font-semibold tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
                128-bit Blocks
              </span>
            </div>
            <p class="text-xs text-slate-400">
              Eksplorasi visual konsep pembagian blok 16-byte, IV, dan GMAC Authentication Tag
            </p>
          </div>
        </div>

        <!-- Close Button (X) -->
        <button
          type="button"
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-2 rounded-xl transition-all cursor-pointer shrink-0"
          title="Tutup Panel (Esc)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="p-4 sm:p-6 overflow-y-auto space-y-4">
        <!-- Sandbox Input Controls -->
        <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-300">
              ⚙️ Parameter Input Uji Coba
            </span>

            <!-- Mode Switcher -->
            <div class="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                @click="setMode('encrypt')"
                class="px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                :class="activeMode === 'encrypt' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'"
              >
                🔒 Mode Enkripsi
              </button>
              <button
                type="button"
                @click="setMode('decrypt')"
                class="px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                :class="activeMode === 'decrypt' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'"
              >
                🔓 Mode Dekripsi
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <!-- Plaintext Input -->
            <div class="sm:col-span-2 space-y-1">
              <label class="block text-xs font-semibold text-slate-300">
                {{ activeMode === 'encrypt' ? 'Plaintext (Teks Catatan)' : 'Plaintext Terdekripsi' }}
              </label>
              <input
                v-model="inputPlaintext"
                type="text"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Masukkan teks yang ingin dienkripsi / didekripsi..."
                @input="recomputeCrypto"
              />
            </div>

            <!-- Secret Key Input -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-300">
                Encryption Key (Password)
              </label>
              <input
                v-model="inputKey"
                type="text"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Kunci enkripsi..."
                @input="recomputeCrypto"
              />
            </div>
          </div>
        </div>

        <!-- Live Visualizer Pipeline -->
        <CryptoBlockVisualizer
          :key="recomputeTrigger"
          :mode="activeMode"
          :plaintext="inputPlaintext"
          :ciphertext="computedCiphertext"
          :iv="computedIv"
          :is-embedded="true"
          @complete="onComplete"
          @close="$emit('close')"
        />
      </div>

      <!-- Modal Footer -->
      <div class="px-5 py-3.5 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <span class="text-xs text-slate-400">
          Gunakan tombol di samping untuk menutup panel visualizer kapan saja.
        </span>
        <button
          type="button"
          @click="$emit('close')"
          class="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white active:scale-95 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow"
        >
          <span>✕</span>
          <span>Tutup Panel</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useCrypto } from '../composables/useCrypto';
import CryptoBlockVisualizer from './CryptoBlockVisualizer.vue';

const emit = defineEmits(['close']);

const { encryptNote } = useCrypto();

const inputPlaintext = ref('Hello World, this is my secret note');
const inputKey = ref('secret-password-123');
const activeMode = ref('encrypt');
const computedCiphertext = ref('');
const computedIv = ref('');
const recomputeTrigger = ref(0);

function setMode(mode) {
  activeMode.value = mode;
  recomputeCrypto();
}

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
  // Automatically close panel upon completing the flow if triggered from the proceed button
  emit('close');
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  recomputeCrypto();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>
