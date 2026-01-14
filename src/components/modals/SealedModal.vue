<template>
  <BaseModal :show="show" title="SEALED POOL GENERATED" @close="$emit('close')">
    <div class="control-bar seal-header">
      <button class="download-btn" @click="handleDownload">
        Download List
      </button>
    </div>
    <DeckBuilder ref="builderRef" :initial-pool="pool" />
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import BaseModal from './BaseModal.vue'
import DeckBuilder from '@/components/deck/DeckBuilder.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  pool: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'view-card'])
const cardStore = useCardStore()
const builderRef = ref(null)

function getBackFace(card) {
  return cardStore.getBackFace(card)
}

function handleDownload() {
  if (builderRef.value) {
    builderRef.value.exportDeck()
  }
}

function viewCard(card) {
  emit('view-card', card)
}
</script>

<style scoped>
.seal-header {
  display: flex;
  justify-content: center;
  padding: 10px;
  background: transparent;
  border: none;
}

.download-btn {
  font-size: 0.9em;
  padding: 8px 16px;
  cursor: pointer;
  background: var(--matrix-green);
  color: #000;
  border: none;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.download-btn:hover {
  background: #fff;
}
</style>
