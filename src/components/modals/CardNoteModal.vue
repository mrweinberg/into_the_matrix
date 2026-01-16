<template>
  <BaseModal :show="show" title="EDIT NOTE" @close="handleClose" size="small">
    <div class="note-editor">
      <div class="card-info" v-if="card">
        <span class="card-name">{{ card.name }}</span>
        <span class="card-type">{{ card.displayType || card.type }}</span>
      </div>

      <div class="badge-picker">
        <span class="badge-label">Badge:</span>
        <button
          v-for="b in badges"
          :key="b.value"
          class="badge-btn"
          :class="{ active: selectedBadge === b.value }"
          @click="selectedBadge = b.value"
        >
          {{ b.icon }}
        </button>
        <button
          class="badge-btn"
          :class="{ active: selectedBadge === null }"
          @click="selectedBadge = null"
        >
          None
        </button>
      </div>

      <textarea
        v-model="noteText"
        class="note-textarea"
        placeholder="Add your note here... (design feedback, balance notes, etc.)"
        rows="5"
      ></textarea>

      <div class="note-actions">
        <button class="action-btn delete-btn" @click="handleDelete" :disabled="!existingNote">
          Delete Note
        </button>
        <button class="action-btn save-btn" @click="handleSave">
          Save Note
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { useCardNotes } from '@/composables/useCardNotes'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  card: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const { getNote, setNote, deleteNote } = useCardNotes()

const noteText = ref('')
const selectedBadge = ref(null)

const badges = [
  { value: 'red', icon: '🔴' },
  { value: 'yellow', icon: '🟡' },
  { value: 'green', icon: '🟢' },
  { value: 'blue', icon: '🔵' }
]

const existingNote = computed(() => props.card ? getNote(props.card.id) : null)

// Load existing note when card changes
watch(() => props.card, (newCard) => {
  if (newCard) {
    const note = getNote(newCard.id)
    if (note) {
      noteText.value = note.text
      selectedBadge.value = note.badge
    } else {
      noteText.value = ''
      selectedBadge.value = null
    }
  }
}, { immediate: true })

function handleSave() {
  if (props.card) {
    setNote(props.card.id, noteText.value, selectedBadge.value)
  }
  emit('close')
}

function handleDelete() {
  if (props.card) {
    deleteNote(props.card.id)
  }
  emit('close')
}

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.note-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  border-left: 3px solid var(--matrix-green);
}

.card-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff;
}

.card-type {
  font-size: 0.85rem;
  color: #888;
}

.badge-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-label {
  color: #888;
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
}

.badge-btn {
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.15s;
}

.badge-btn:hover {
  border-color: #666;
}

.badge-btn.active {
  border-color: var(--matrix-green);
  background: rgba(0, 255, 65, 0.1);
}

.note-textarea {
  width: 100%;
  padding: 12px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 4px;
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 100px;
}

.note-textarea:focus {
  outline: none;
  border-color: var(--matrix-green);
}

.note-textarea::placeholder {
  color: #555;
}

.note-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.action-btn {
  padding: 10px 20px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background: rgba(0, 255, 65, 0.2);
  color: var(--matrix-green);
  border: 1px solid var(--matrix-green);
  flex: 1;
}

.save-btn:hover {
  background: rgba(0, 255, 65, 0.4);
}

.delete-btn {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.delete-btn:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.3);
}

.delete-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
