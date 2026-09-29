<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
    <div class="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-100 truncate max-w-md">{{ note.title }}</h3>
            <span class="text-xs text-emerald-400 font-medium">Decrypted (In-Memory Only)</span>
          </div>
        </div>

        <!-- Lock button & Close -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="$emit('lock')"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-1.5 transition-all active:scale-95"
            title="Lock and clear plaintext from memory"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Lock</span>
          </button>
          <button
            type="button"
            @click="$emit('lock')"
            class="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Plaintext Content -->
      <div class="p-6 overflow-y-auto flex-1">
        <div class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-slate-200 text-sm whitespace-pre-wrap leading-relaxed select-text font-sans">
          {{ plaintext }}
        </div>
      </div>

      <!-- Footer Info and Actions -->
      <div class="px-6 py-3.5 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div>
          <span>Last modified: {{ formatDate(note.updated_at || note.created_at) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="$emit('edit', { note, plaintext })"
            class="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <span>✏️</span> Edit
          </button>
          <button
            type="button"
            @click="$emit('delete', note)"
            class="px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
          >
            <span>🗑️</span> Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  note: {
    type: Object,
    required: true,
  },
  plaintext: {
    type: String,
    required: true,
  },
});

defineEmits(['lock', 'edit', 'delete']);

function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
</script>
