<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
    <!-- Navbar / Header -->
    <header class="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <span class="text-xl">🔐</span>
          </div>
          <div>
            <h1 class="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Secret Notes
              <span class="text-[10px] font-semibold tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
                AES-256-GCM
              </span>
            </h1>
            <p class="text-xs text-slate-400 hidden sm:block">Zero-Knowledge Client-Side Encryption</p>
          </div>
        </div>

        <!-- Add Note Button -->
        <button
          type="button"
          @click="openCreateModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Note</span>
        </button>
      </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
      <!-- Banner / Info -->
      <div class="mb-8 p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div class="flex items-center gap-2.5">
          <span class="text-indigo-400 text-base">🛡️</span>
          <span>
            Encryption & Decryption occur strictly in your browser. Keys and plaintext content never touch the backend server.
          </span>
        </div>
        <div class="text-slate-500 shrink-0">
          {{ notes.length }} {{ notes.length === 1 ? 'Note' : 'Notes' }} stored
        </div>
      </div>

      <!-- Global Error Banner -->
      <div v-if="globalError" class="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-rose-400 text-sm">
        <div class="flex items-center gap-2">
          <span>⚠️</span>
          <span>{{ globalError }}</span>
        </div>
        <button type="button" @click="loadNotes" class="underline hover:text-rose-300 font-medium">Retry</button>
      </div>

      <!-- Note Cards Grid or States -->
      <div v-if="isLoadingNotes" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg class="w-8 h-8 animate-spin text-indigo-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <p class="text-sm font-medium">Loading encrypted notes...</p>
      </div>

      <div v-else-if="notes.length === 0" class="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-3xl p-8 text-center">
        <div class="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl mb-4 shadow-inner">
          🔒
        </div>
        <h2 class="text-base font-bold text-slate-200 mb-1">No Secret Notes Yet</h2>
        <p class="text-xs text-slate-400 max-w-sm mb-6">
          Create your first secret note. It will be encrypted with AES-256-GCM right in your browser.
        </p>
        <button
          type="button"
          @click="openCreateModal"
          class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-2"
        >
          <span>➕</span> Create First Note
        </button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <NoteCard
          v-for="note in notes"
          :key="note.id"
          :note="note"
          @open="handleOpenNote"
          @edit="handleEditNote"
          @delete="handleDeleteNote"
        />
      </div>
    </main>

    <!-- Modals & Overlays -->

    <!-- Note Editor (Create / Edit) -->
    <NoteEditor
      v-if="showEditor"
      :initial-note="editingNote"
      :initial-plaintext="editingPlaintext"
      :initial-key="editingKey"
      :is-saving="isSavingNote"
      @save="handleSaveNote"
      @cancel="closeEditor"
    />

    <!-- Key Dialog (Password prompt for decryption) -->
    <KeyDialog
      v-if="keyDialogNote"
      :note="keyDialogNote"
      :is-decrypting="isDecrypting"
      :error-message="keyDialogError"
      @decrypt="handleKeySubmit"
      @cancel="closeKeyDialog"
    />

    <!-- Note Viewer (Decrypted view) -->
    <NoteViewer
      v-if="viewingNote"
      :note="viewingNote"
      :plaintext="viewingPlaintext"
      :decryption-failed="viewingFailed"
      @lock="handleLockNote"
      @edit="handleEditFromViewer"
      @delete="handleDeleteNote"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirm
      v-if="deleteTargetNote"
      :note-title="deleteTargetNote.title"
      :is-deleting="isDeleting"
      @confirm="executeDelete"
      @cancel="deleteTargetNote = null"
    />

    <!-- Encryption Animation Overlay -->
    <EncryptionAnimation
      v-if="encryptionAnim"
      :plaintext="encryptionAnim.plaintext"
      :ciphertext="encryptionAnim.ciphertext"
      @complete="onEncryptionAnimComplete"
    />

    <!-- Decryption Animation Overlay -->
    <DecryptionAnimation
      v-if="decryptionAnim"
      :ciphertext="decryptionAnim.ciphertext"
      :plaintext="decryptionAnim.plaintext"
      :is-failed="decryptionAnim.isFailed"
      @complete="onDecryptionAnimComplete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from './services/api';
import { useCrypto, generateScrambledText } from './composables/useCrypto';
import NoteCard from './components/NoteCard.vue';
import NoteEditor from './components/NoteEditor.vue';
import KeyDialog from './components/KeyDialog.vue';
import NoteViewer from './components/NoteViewer.vue';
import DeleteConfirm from './components/DeleteConfirm.vue';
import EncryptionAnimation from './components/EncryptionAnimation.vue';
import DecryptionAnimation from './components/DecryptionAnimation.vue';

const { encryptNote, decryptNote } = useCrypto();

// Reactive State
const notes = ref([]);
const isLoadingNotes = ref(true);
const globalError = ref('');

// Editor State
const showEditor = ref(false);
const editingNote = ref(null);
const editingPlaintext = ref('');
const editingKey = ref('');
const isSavingNote = ref(false);

// Key Dialog & Decryption State
const keyDialogNote = ref(null);
const keyDialogMode = ref('view'); // 'view' or 'edit'
const isDecrypting = ref(false);
const keyDialogError = ref('');

// Viewer State (Decrypted In-Memory Only)
const viewingNote = ref(null);
const viewingPlaintext = ref('');
const viewingKey = ref('');
const viewingFailed = ref(false);

// Delete State
const deleteTargetNote = ref(null);
const isDeleting = ref(false);

// Animation Overlays
const encryptionAnim = ref(null);
const pendingSaveAction = ref(null);

const decryptionAnim = ref(null);
const pendingDecryptAction = ref(null);

// Fetch notes on mount
onMounted(() => {
  loadNotes();
});

async function loadNotes() {
  isLoadingNotes.value = true;
  globalError.value = '';
  try {
    notes.value = await api.getNotes();
  } catch (err) {
    globalError.value = 'Unable to connect to the server.';
  } finally {
    isLoadingNotes.value = false;
  }
}

// ------------------- Create / Edit Flow -------------------
function openCreateModal() {
  editingNote.value = null;
  editingPlaintext.value = '';
  editingKey.value = '';
  showEditor.value = true;
}

function closeEditor() {
  showEditor.value = false;
  editingNote.value = null;
  editingPlaintext.value = '';
  editingKey.value = '';
}

async function handleSaveNote({ id, title, content, key }) {
  isSavingNote.value = true;
  try {
    // Encrypt client-side
    const { ciphertext, iv } = await encryptNote(content, key);

    // Close editor modal and trigger animation
    showEditor.value = false;

    pendingSaveAction.value = async () => {
      try {
        if (id) {
          const updated = await api.updateNote(id, { title, ciphertext, iv });
          const index = notes.value.findIndex((n) => n.id === id);
          if (index !== -1) {
            notes.value[index] = updated;
          }
          // If this note was open in viewer, update its metadata
          if (viewingNote.value && viewingNote.value.id === id) {
            viewingNote.value = updated;
            viewingPlaintext.value = content;
            viewingKey.value = key;
            viewingFailed.value = false;
          }
        } else {
          const created = await api.createNote({ title, ciphertext, iv });
          notes.value.unshift(created);
        }
      } catch (err) {
        globalError.value = err.message || 'Unable to save note.';
      } finally {
        isSavingNote.value = false;
        closeEditor();
      }
    };

    encryptionAnim.value = {
      plaintext: content,
      ciphertext: ciphertext,
    };
  } catch (err) {
    alert(err.message || 'Encryption failed.');
    isSavingNote.value = false;
  }
}

function onEncryptionAnimComplete() {
  encryptionAnim.value = null;
  if (pendingSaveAction.value) {
    const action = pendingSaveAction.value;
    pendingSaveAction.value = null;
    action();
  }
}

// ------------------- Decrypt / View Flow -------------------
function handleOpenNote(note) {
  keyDialogNote.value = note;
  keyDialogMode.value = 'view';
  keyDialogError.value = '';
}

function handleEditNote(note) {
  keyDialogNote.value = note;
  keyDialogMode.value = 'edit';
  keyDialogError.value = '';
}

function closeKeyDialog() {
  keyDialogNote.value = null;
  keyDialogError.value = '';
  isDecrypting.value = false;
}

async function handleKeySubmit(key) {
  if (!keyDialogNote.value) return;
  isDecrypting.value = true;
  keyDialogError.value = '';

  const targetNote = keyDialogNote.value;
  const mode = keyDialogMode.value;

  try {
    // Decrypt client-side
    const decrypted = await decryptNote(targetNote.ciphertext, targetNote.iv, key);

    // Decryption successful! Close key dialog and trigger animation
    closeKeyDialog();

    pendingDecryptAction.value = () => {
      if (mode === 'edit') {
        editingNote.value = targetNote;
        editingPlaintext.value = decrypted;
        editingKey.value = key;
        showEditor.value = true;
      } else {
        viewingNote.value = targetNote;
        viewingPlaintext.value = decrypted;
        viewingKey.value = key;
        viewingFailed.value = false;
      }
    };

    decryptionAnim.value = {
      ciphertext: targetNote.ciphertext,
      plaintext: decrypted,
      isFailed: false,
    };
  } catch (err) {
    // When decryption fails (wrong key): still open the note with scrambled text & failed state
    const scrambled = generateScrambledText(targetNote.ciphertext, key);
    closeKeyDialog();

    pendingDecryptAction.value = () => {
      viewingNote.value = targetNote;
      viewingPlaintext.value = scrambled;
      viewingKey.value = '';
      viewingFailed.value = true;
    };

    decryptionAnim.value = {
      ciphertext: targetNote.ciphertext,
      plaintext: scrambled,
      isFailed: true,
    };
  } finally {
    isDecrypting.value = false;
  }
}

function onDecryptionAnimComplete() {
  decryptionAnim.value = null;
  if (pendingDecryptAction.value) {
    const action = pendingDecryptAction.value;
    pendingDecryptAction.value = null;
    action();
  }
}

// ------------------- Lock Flow -------------------
function handleLockNote() {
  // Wipe decrypted data from in-memory state
  viewingNote.value = null;
  viewingPlaintext.value = '';
  viewingKey.value = '';
  viewingFailed.value = false;
}

// ------------------- Edit from Viewer -------------------
function handleEditFromViewer({ note, plaintext }) {
  const currentKey = viewingKey.value;
  handleLockNote();
  editingNote.value = note;
  editingPlaintext.value = plaintext;
  editingKey.value = currentKey;
  showEditor.value = true;
}

// ------------------- Delete Flow -------------------
function handleDeleteNote(note) {
  deleteTargetNote.value = note;
}

async function executeDelete() {
  if (!deleteTargetNote.value) return;
  isDeleting.value = true;
  const targetId = deleteTargetNote.value.id;

  try {
    await api.deleteNote(targetId);
    notes.value = notes.value.filter((n) => n.id !== targetId);
    if (viewingNote.value && viewingNote.value.id === targetId) {
      handleLockNote();
    }
    deleteTargetNote.value = null;
  } catch (err) {
    alert(err.message || 'Unable to delete note.');
  } finally {
    isDeleting.value = false;
  }
}
</script>
