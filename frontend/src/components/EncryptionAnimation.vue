<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
    <div class="w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
      <!-- Title -->
      <div class="flex items-center gap-2 mb-6">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <h3 class="text-lg font-semibold text-slate-100">Encrypting Note</h3>
      </div>

      <!-- Vertical Pipeline Animation -->
      <div class="w-full flex flex-col items-center space-y-3 font-mono text-sm">
        <!-- Plaintext phase -->
        <div class="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-left">
          <div class="text-xs text-slate-400 uppercase tracking-wider mb-1 font-sans">Plaintext</div>
          <div class="text-emerald-400 break-all min-h-[1.5rem]">{{ currentPlaintext || '...' }}</div>
        </div>

        <!-- Arrow Down -->
        <div class="text-slate-500 animate-bounce">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        <!-- AES-256-GCM Node -->
        <div class="w-full bg-indigo-950/60 border border-indigo-500/40 rounded-lg p-2.5 flex items-center justify-center gap-2 text-indigo-300">
          <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span class="font-semibold text-xs tracking-wider">AES-256-GCM + Random IV</span>
        </div>

        <!-- Arrow Down -->
        <div class="text-slate-500 animate-bounce">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        <!-- Ciphertext phase -->
        <div class="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-left">
          <div class="text-xs text-slate-400 uppercase tracking-wider mb-1 font-sans">Ciphertext (Base64)</div>
          <div class="text-amber-400 break-all min-h-[1.5rem]">{{ currentCiphertext || '...' }}</div>
        </div>
      </div>

      <!-- Completion Indicator -->
      <div class="mt-6 flex items-center gap-2 text-sm font-medium transition-all" :class="isComplete ? 'text-emerald-400 opacity-100' : 'text-slate-500 opacity-50'">
        <svg v-if="isComplete" class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ isComplete ? '✓ Encryption Complete' : 'Processing Cryptographic Layers...' }}</span>
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

const currentPlaintext = ref('');
const currentCiphertext = ref('');
const isComplete = ref(false);

onMounted(async () => {
  const plainSample = props.plaintext.length > 24 ? props.plaintext.slice(0, 24) + '...' : props.plaintext;
  const cipherSample = props.ciphertext.length > 32 ? props.ciphertext.slice(0, 32) + '...' : props.ciphertext;

  // Step 1: Plaintext stream
  for (let i = 1; i <= plainSample.length; i++) {
    currentPlaintext.value = plainSample.slice(0, i);
    await new Promise((r) => setTimeout(r, 20));
  }

  await new Promise((r) => setTimeout(r, 120));

  // Step 2: Ciphertext stream
  for (let i = 1; i <= cipherSample.length; i++) {
    currentCiphertext.value = cipherSample.slice(0, i);
    await new Promise((r) => setTimeout(r, 15));
  }

  await new Promise((r) => setTimeout(r, 200));
  isComplete.value = true;

  await new Promise((r) => setTimeout(r, 450));
  emit('complete');
});
</script>
