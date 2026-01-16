<template>
  <BaseModal :show="show" title="CARD NOTES MANAGER" @close="handleClose" size="large">
    <div class="notes-manager">
      <!-- Header Stats & Actions -->
      <div class="manager-header">
        <div class="stats">
          <span class="stat-item">
            <span class="stat-value">{{ noteCount }}</span>
            <span class="stat-label">notes</span>
          </span>
        </div>
        <div class="header-actions">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search notes..."
          />
          <button class="action-btn export-btn" @click="handleExport" :disabled="noteCount === 0">
            Export JSON
          </button>
          <button class="action-btn clear-btn" @click="confirmClearAll" :disabled="noteCount === 0">
            Clear All
          </button>
        </div>
      </div>

      <!-- Notes List -->
      <div class="notes-list" v-if="filteredNotes.length > 0">
        <div
          v-for="note in filteredNotes"
          :key="note.cardId"
          class="note-item"
        >
          <div class="note-badge" v-if="note.badge">
            {{ getBadgeIcon(note.badge) }}
          </div>
          <div class="note-content">
            <div class="note-card-name">{{ getCardName(note.cardId) }}</div>
            <div class="note-text">{{ note.text }}</div>
            <div class="note-meta">
              {{ formatDate(note.updatedAt) }}
            </div>
          </div>
          <div class="note-actions">
            <button class="icon-btn edit-btn" @click="editNote(note.cardId)" title="Edit note">
              ✏️
            </button>
            <button class="icon-btn delete-btn" @click="removeNote(note.cardId)" title="Delete note">
              🗑️
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p v-if="searchQuery">No notes match "{{ searchQuery }}"</p>
        <p v-else>No notes yet. Right-click any card to add a note.</p>
      </div>

      <!-- Confirm Clear Dialog -->
      <div v-if="showClearConfirm" class="confirm-overlay">
        <div class="confirm-dialog">
          <p>Are you sure you want to delete all {{ noteCount }} notes?</p>
          <div class="confirm-actions">
            <button class="action-btn cancel-btn" @click="showClearConfirm = false">Cancel</button>
            <button class="action-btn danger-btn" @click="handleClearAll">Delete All</button>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { useCardNotes } from '@/composables/useCardNotes'
import { useCardStore } from '@/stores/cardStore'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'edit-card'])

const { allNotes, noteCount, exportNotes, deleteNote, clearAllNotes } = useCardNotes()
const cardStore = useCardStore()

const searchQuery = ref('')
const showClearConfirm = ref(false)

const filteredNotes = computed(() => {
  if (!searchQuery.value) {
    return allNotes.value.sort((a, b) => b.updatedAt - a.updatedAt)
  }
  
  const query = searchQuery.value.toLowerCase()
  return allNotes.value.filter(note => {
    const cardName = getCardName(note.cardId).toLowerCase()
    const noteText = note.text.toLowerCase()
    return cardName.includes(query) || noteText.includes(query)
  }).sort((a, b) => b.updatedAt - a.updatedAt)
})

function getCardName(cardId) {
  const card = cardStore.getCardById(cardId)
  return card ? card.name : cardId
}

function getBadgeIcon(badge) {
  const icons = { red: '🔴', yellow: '🟡', green: '🟢', blue: '🔵' }
  return icons[badge] || ''
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function editNote(cardId) {
  const card = cardStore.getCardById(cardId)
  if (card) {
    emit('edit-card', card)
  }
}

function removeNote(cardId) {
  deleteNote(cardId)
}

function handleExport() {
  exportNotes()
}

function confirmClearAll() {
  showClearConfirm.value = true
}

function handleClearAll() {
  clearAllNotes()
  showClearConfirm.value = false
}

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.notes-manager {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 400px;
  position: relative;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
}

.stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--matrix-green);
}

.stat-label {
  color: #888;
  font-size: 0.85rem;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 4px;
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  width: 200px;
}

.search-input:focus {
  outline: none;
  border-color: var(--matrix-green);
}

.action-btn {
  padding: 8px 14px;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn {
  background: rgba(0, 255, 65, 0.1);
  color: var(--matrix-green);
  border: 1px solid var(--matrix-green);
}

.export-btn:hover:not(:disabled) {
  background: rgba(0, 255, 65, 0.3);
}

.clear-btn {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.clear-btn:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.3);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Notes List */
.notes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 500px;
  overflow-y: auto;
}

.note-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 255, 65, 0.1);
  border-radius: 4px;
  transition: border-color 0.2s;
}

.note-item:hover {
  border-color: rgba(0, 255, 65, 0.3);
}

.note-badge {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.note-content {
  flex: 1;
  min-width: 0;
}

.note-card-name {
  font-weight: bold;
  color: #fff;
  margin-bottom: 4px;
}

.note-text {
  color: #ccc;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.note-meta {
  color: #666;
  font-size: 0.75rem;
  margin-top: 6px;
}

.note-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.icon-btn {
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.15s;
}

.icon-btn:hover {
  border-color: #666;
  background: rgba(255, 255, 255, 0.1);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  font-style: italic;
  padding: 40px;
}

/* Confirm Dialog */
.confirm-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 4px;
}

.confirm-dialog {
  background: #1a1a1a;
  border: 1px solid #ff6b6b;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
}

.confirm-dialog p {
  color: #fff;
  margin-bottom: 20px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.cancel-btn {
  background: rgba(100, 100, 100, 0.2);
  color: #aaa;
  border: 1px solid #666;
}

.cancel-btn:hover {
  background: rgba(100, 100, 100, 0.4);
}

.danger-btn {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.danger-btn:hover {
  background: rgba(255, 107, 107, 0.4);
}
</style>
