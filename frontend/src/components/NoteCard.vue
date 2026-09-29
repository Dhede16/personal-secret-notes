<template>
  <div
    @click="$emit('open', note)"
    class="group relative bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
  >
    <!-- Card Header -->
    <div class="flex items-start justify-between gap-3 mb-3">
      <h3 class="font-bold text-slate-100 group-hover:text-indigo-300 transition-colors text-base line-clamp-2">
        {{ note.title }}
      </h3>

      <!-- 3-Dots Menu -->
      <div class="relative shrink-0" @click.stop>
        <button
          type="button"
          @click="toggleMenu"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Options"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="isMenuOpen"
          class="absolute right-0 mt-1 w-36 bg-slate-800 border border-slate-700/80 rounded-xl shadow-xl py-1 z-20"
        >
          <button
            type="button"
            @click="handleEdit"
            class="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-700/70 flex items-center gap-2 transition-colors"
          >
            <span>✏️</span> Edit
          </button>
          <button
            type="button"
            @click="handleDelete"
            class="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
          >
            <span>🗑️</span> Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Encrypted Content Preview Placeholder -->
    <div class="my-3 py-3 px-3.5 bg-slate-950/60 rounded-xl border border-slate-800/60 flex items-center gap-2.5 text-xs text-slate-400 font-mono">
      <svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span class="truncate">🔒 Encrypted content</span>
    </div>

    <!-- Card Footer -->
    <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/40">
      <span>{{ formatDate(note.created_at || note.updated_at) }}</span>
      <span class="text-[10px] font-semibold uppercase tracking-wider text-indigo-400/80 bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-500/20">
        AES-256
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  note: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['open', 'edit', 'delete']);

const isMenuOpen = ref(false);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function handleEdit() {
  isMenuOpen.value = false;
  emit('edit', props.note);
}

function handleDelete() {
  isMenuOpen.value = false;
  emit('delete', props.note);
}

function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

function handleClickOutside() {
  if (isMenuOpen.value) {
    isMenuOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>
