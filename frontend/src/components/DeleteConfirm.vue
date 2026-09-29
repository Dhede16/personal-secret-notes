<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
    <div class="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl">
      <div class="flex items-center gap-3 mb-4 text-rose-400">
        <div class="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-100">Delete Note</h3>
          <p class="text-xs text-slate-400">Irreversible action</p>
        </div>
      </div>

      <p class="text-slate-300 text-sm mb-6 leading-relaxed">
        Are you sure you want to delete <span class="text-white font-semibold break-all">"{{ noteTitle }}"</span>? This action cannot be undone.
      </p>

      <div class="flex justify-end gap-3">
        <button
          type="button"
          @click="$emit('cancel')"
          :disabled="isDeleting"
          class="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="$emit('confirm')"
          :disabled="isDeleting"
          class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 active:scale-95 shadow-lg shadow-rose-900/40 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <svg v-if="isDeleting" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>{{ isDeleting ? 'Deleting...' : 'Delete' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  noteTitle: {
    type: String,
    required: true,
  },
  isDeleting: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['confirm', 'cancel']);
</script>
