<template>
  <BaseModal :show="show" title="PLAYTEST" @close="handleClose">
    <div class="playtest-container">
      <!-- Status Bar -->
      <div class="playtest-status">
        <div class="status-item">
          <span class="status-label">Library:</span>
          <span class="status-value">{{ librarySize }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Hand:</span>
          <span class="status-value">{{ handSize }}</span>
        </div>
        <div class="status-item" v-if="mulliganCount > 0">
          <span class="status-label">Mulligans:</span>
          <span class="status-value mulligan-count">{{ mulliganCount }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="playtest-actions">
        <template v-if="!hasKept">
          <button
            class="action-btn mulligan-btn"
            @click="handleMulligan"
            :disabled="mulliganCount >= 6"
            :title="mulliganCount >= 6 ? 'Cannot mulligan further' : `Draw ${7 - mulliganCount - 1} cards`"
          >
            Mulligan to {{ 7 - mulliganCount - 1 }}
          </button>
          <button class="action-btn keep-btn" @click="handleKeep">
            Keep Hand
          </button>
        </template>
        <template v-else-if="!needsToBottom">
          <button
            class="action-btn draw-btn"
            @click="handleDraw"
            :disabled="librarySize === 0"
          >
            Draw Card
          </button>
        </template>
        <button class="action-btn reset-btn" @click="handleReset">
          New Game
        </button>
      </div>

      <!-- Bottom Cards Mode -->
      <div v-if="needsToBottom" class="bottom-mode">
        <p class="bottom-instruction">
          Select {{ cardsToBottomRemaining }} card{{ cardsToBottomRemaining > 1 ? 's' : '' }} to put on bottom of library
        </p>
      </div>

      <!-- Hand Display -->
      <div class="hand-area">
        <h3 class="hand-header">Hand ({{ handSize }})</h3>
        <div class="hand-cards" :class="{ 'selection-mode': needsToBottom }">
          <div
            v-for="(card, index) in hand"
            :key="card.playtestId"
            class="hand-card"
            :class="{ selectable: needsToBottom }"
            @click="handleCardClick(index)"
          >
            <CardItem :card="card" :clickable="false" />
            <div v-if="needsToBottom" class="select-overlay">
              <span class="select-hint">Click to bottom</span>
            </div>
          </div>
        </div>
        <div v-if="hand.length === 0" class="empty-hand">
          No cards in hand
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { watch } from 'vue'
import BaseModal from './BaseModal.vue'
import CardItem from '@/components/cards/CardItem.vue'
import { usePlaytest } from '@/composables/usePlaytest'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  deck: {
    type: Array,
    default: () => []
  },
  basicLands: {
    type: Object,
    default: () => ({})
  },
  basicLandCards: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const {
  hand,
  mulliganCount,
  hasKept,
  cardsToBottomRemaining,
  librarySize,
  handSize,
  needsToBottom,
  startPlaytest,
  mulligan,
  keepHand,
  putOnBottom,
  drawStep,
  reset,
  endPlaytest
} = usePlaytest()

// Start playtest when modal opens with deck data
watch(() => props.show, (newShow) => {
  if (newShow && props.deck.length > 0) {
    startPlaytest(props.deck, props.basicLands, props.basicLandCards)
  }
}, { immediate: true })

function handleMulligan() {
  mulligan()
}

function handleKeep() {
  keepHand()
}

function handleDraw() {
  drawStep()
}

function handleReset() {
  reset()
}

function handleCardClick(index) {
  if (needsToBottom.value) {
    putOnBottom(index)
  }
}

function handleClose() {
  endPlaytest()
  emit('close')
}
</script>

<style scoped>
.playtest-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 400px;
}

.playtest-status {
  display: flex;
  gap: 24px;
  justify-content: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 255, 65, 0.2);
  border-radius: 4px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Courier New', monospace;
}

.status-label {
  color: #888;
  font-size: 0.9rem;
}

.status-value {
  color: var(--matrix-green);
  font-size: 1.2rem;
  font-weight: bold;
}

.status-value.mulligan-count {
  color: #ff6b6b;
}

.playtest-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px 20px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.mulligan-btn {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.mulligan-btn:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.4);
}

.mulligan-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.keep-btn {
  background: rgba(0, 255, 65, 0.2);
  color: var(--matrix-green);
  border: 1px solid var(--matrix-green);
}

.keep-btn:hover {
  background: rgba(0, 255, 65, 0.4);
}

.draw-btn {
  background: rgba(0, 255, 65, 0.2);
  color: var(--matrix-green);
  border: 1px solid var(--matrix-green);
}

.draw-btn:hover:not(:disabled) {
  background: rgba(0, 255, 65, 0.4);
}

.draw-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.reset-btn {
  background: rgba(100, 100, 100, 0.2);
  color: #aaa;
  border: 1px solid #666;
}

.reset-btn:hover {
  background: rgba(100, 100, 100, 0.4);
  color: #fff;
  border-color: #888;
}

.bottom-mode {
  text-align: center;
  padding: 12px;
  background: rgba(255, 200, 0, 0.1);
  border: 1px solid rgba(255, 200, 0, 0.4);
  border-radius: 4px;
}

.bottom-instruction {
  color: #ffc800;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  margin: 0;
}

.hand-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hand-header {
  color: var(--matrix-green);
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
}

.hand-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  min-height: 200px;
}

.hand-cards.selection-mode {
  background: rgba(255, 200, 0, 0.05);
  border: 1px dashed rgba(255, 200, 0, 0.3);
}

.hand-card {
  position: relative;
  width: 180px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.hand-card:hover {
  transform: translateY(-4px);
}

.hand-card.selectable {
  cursor: pointer;
}

.hand-card.selectable:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 20px rgba(255, 200, 0, 0.3);
}

.select-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 200, 0, 0.1);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 20px;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 8px;
}

.hand-card.selectable:hover .select-overlay {
  opacity: 1;
}

.select-hint {
  background: rgba(0, 0, 0, 0.8);
  color: #ffc800;
  padding: 4px 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
}

.empty-hand {
  color: #555;
  text-align: center;
  padding: 40px;
  font-style: italic;
  font-family: 'Courier New', monospace;
}

/* Responsive */
@media (max-width: 800px) {
  .hand-card {
    width: 140px;
  }

  .playtest-status {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
