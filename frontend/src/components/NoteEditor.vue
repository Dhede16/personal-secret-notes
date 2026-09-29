<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
    <div class="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">{{ isEditing ? '✏️' : '📝' }}</span>
          <h3 class="text-lg font-bold text-slate-100">
            {{ isEditing ? 'Edit Secret Note' : 'New Secret Note' }}
          </h3>
        </div>
        <button
          type="button"
          @click="$emit('cancel')"
          class="text-slate-400 hover:text-slate-200 p-1"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto space-y-4 flex-1">
        <!-- Title -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Title
          </label>
          <input
            type="text"
            v-model="title"
            placeholder="e.g. Catatan Kuliah, Private Keys..."
            required
            class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>

        <!-- Content -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Secret Content
          </label>
          <textarea
            v-model="content"
            rows="6"
            placeholder="Tulis catatan rahasia di sini..."
            required
            class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm leading-relaxed transition-all resize-y"
          ></textarea>
        </div>

        <!-- Encryption Key -->
        <div class="pt-2 border-t border-slate-800">
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔐 Encryption Key</span>
              <span class="text-[10px] text-indigo-400 font-normal lowercase">(used for AES-256-GCM)</span>
            </label>
          </div>
          <div class="relative">
            <input
              :type="showKey ? 'text' : 'password'"
              v-model="key"
              placeholder="Enter strong passphrase / key"
              autocomplete="off"
              required
              class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-mono tracking-wider pr-10 transition-all"
            />
            <button
              type="button"
              @click="showKey = !showKey"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
            >
              <svg v-if="!showKey" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            </button>
          </div>
          <p class="text-[11px] text-slate-400 mt-1.5">
            Key will never be stored or transmitted to the server. Remember it to decrypt later.
          </p>
        </div>

        <!-- Validation Error Message -->
        <div v-if="localError" class="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2 text-rose-400 text-xs">
          <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ localError }}</span>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            @click="$emit('cancel')"
            :disabled="isSaving"
            class="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSaving"
            class="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-lg shadow-indigo-950 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <svg v-if="isSaving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>{{ isSaving ? 'Encrypting & Saving...' : (isEditing ? 'Update Note' : 'Save Note') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  initialNote: {
    type: Object,
    default: null,
  },
  initialPlaintext: {
    type: String,
    default: '',
  },
  initialKey: {
    type: String,
    default: '',
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['save', 'cancel']);

const isEditing = Boolean(props.initialNote);
const title = ref(props.initialNote?.title || '');
const content = ref(props.initialPlaintext || '');
const key = ref(props.initialKey || '');
const showKey = ref(false);
const localError = ref('');

function handleSubmit() {
  localError.value = '';
  if (!title.value.trim()) {
    localError.value = 'Title cannot be empty.';
    return;
  }
  if (!content.value.trim()) {
    localError.value = 'Content cannot be empty.';
    return;
  }
  if (!key.value.trim()) {
    localError.value = 'Encryption key cannot be empty.';
    return;
  }

  emit('save', {
    id: props.initialNote?.id || null,
    title: title.value.trim(),
    content: content.value,
    key: key.value,
  });
}
</script>
