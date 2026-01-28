<template>
  <BaseModal :show="show" title="PLAYTEST" @close="handleClose" size="large">
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
        <div class="status-item">
          <span class="status-label">Battlefield:</span>
          <span class="status-value battlefield-count">{{ battlefieldSize }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Graveyard:</span>
          <span class="status-value graveyard-count">{{ graveyardSize }}</span>
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

      <!-- Main Play Area -->
      <div class="play-area">
        <!-- Battlefield Zone -->
        <div class="zone battlefield-zone">
          <h3 class="zone-header">Battlefield ({{ battlefieldSize }})</h3>
          <div class="zone-cards battlefield-cards">
            <div
              v-for="(card, index) in battlefield"
              :key="card.playtestId"
              class="zone-card"
              @click="showCardMenu('battlefield', index, $event)"
            >
              <CardItem :card="card" :clickable="false" />
            </div>
            <div v-if="battlefield.length === 0" class="empty-zone">
              Play cards from your hand
            </div>
          </div>
        </div>

        <!-- Graveyard Zone (Collapsible) -->
        <div class="zone graveyard-zone" :class="{ expanded: graveyardExpanded }">
          <h3 class="zone-header graveyard-header" @click="graveyardExpanded = !graveyardExpanded">
            <span class="graveyard-toggle">{{ graveyardExpanded ? '▼' : '►' }}</span>
            Graveyard ({{ graveyardSize }})
          </h3>
          <div v-if="graveyardExpanded" class="zone-cards graveyard-cards">
            <div
              v-for="(card, index) in graveyard"
              :key="card.playtestId"
              class="zone-card graveyard-card"
              @click="showCardMenu('graveyard', index, $event)"
            >
              <CardItem :card="card" :clickable="false" />
            </div>
            <div v-if="graveyard.length === 0" class="empty-zone">
              Empty
            </div>
          </div>
        </div>
      </div>

      <!-- Hand Display -->
      <div class="hand-area">
        <h3 class="hand-header">Hand ({{ handSize }})</h3>
        <div class="hand-cards" :class="{ 'selection-mode': needsToBottom }">
          <div
            v-for="(card, index) in hand"
            :key="card.playtestId"
            class="hand-card"
            :class="{ selectable: needsToBottom || hasKept }"
            @click="handleHandCardClick(index, $event)"
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

      <!-- Context Menu -->
      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
        @mouseleave="hideContextMenu"
      >
        <template v-if="contextMenu.zone === 'hand'">
          <button class="menu-item" @click="handlePlayCard">▶ Play</button>
          <button class="menu-item" @click="handleDiscardCard">✕ Discard</button>
        </template>
        <template v-else-if="contextMenu.zone === 'battlefield'">
          <button class="menu-item" @click="handleDestroyCard">☠ Destroy</button>
          <button class="menu-item" @click="handleBounceCard">↩ Return to Hand</button>
        </template>
        <template v-else-if="contextMenu.zone === 'graveyard'">
          <button class="menu-item" @click="handleReturnFromGraveyard">↑ Return to Hand</button>
        </template>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { watch, ref, reactive } from 'vue'
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
  battlefield,
  graveyard,
  mulliganCount,
  hasKept,
  cardsToBottomRemaining,
  librarySize,
  handSize,
  battlefieldSize,
  graveyardSize,
  needsToBottom,
  startPlaytest,
  mulligan,
  keepHand,
  putOnBottom,
  drawStep,
  playCard,
  destroyCard,
  discardFromHand,
  bounceToHand,
  returnFromGraveyard,
  reset,
  endPlaytest
} = usePlaytest()

const graveyardExpanded = ref(false)
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  zone: '',
  cardIndex: -1
})

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
  graveyardExpanded.value = false
}

function handleHandCardClick(index, event) {
  if (needsToBottom.value) {
    putOnBottom(index)
  } else if (hasKept.value) {
    showCardMenu('hand', index, event)
  }
}

function showCardMenu(zone, index, event) {
  event.stopPropagation()
  contextMenu.visible = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.zone = zone
  contextMenu.cardIndex = index
}

function hideContextMenu() {
  contextMenu.visible = false
}

function handlePlayCard() {
  playCard(contextMenu.cardIndex)
  hideContextMenu()
}

function handleDiscardCard() {
  discardFromHand(contextMenu.cardIndex)
  hideContextMenu()
}

function handleDestroyCard() {
  destroyCard(contextMenu.cardIndex)
  hideContextMenu()
}

function handleBounceCard() {
  bounceToHand(contextMenu.cardIndex)
  hideContextMenu()
}

function handleReturnFromGraveyard() {
  returnFromGraveyard(contextMenu.cardIndex)
  hideContextMenu()
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
  gap: 12px;
  min-height: 400px;
  position: relative;
}

.playtest-status {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 255, 65, 0.2);
  border-radius: 4px;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Courier New', monospace;
}

.status-label {
  color: #888;
  font-size: 0.85rem;
}

.status-value {
  color: var(--matrix-green);
  font-size: 1.1rem;
  font-weight: bold;
}

.status-value.mulligan-count { color: #ff6b6b; }
.status-value.battlefield-count { color: #0cf; }
.status-value.graveyard-count { color: #a0a0a0; }

.playtest-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.mulligan-btn {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}
.mulligan-btn:hover:not(:disabled) { background: rgba(255, 107, 107, 0.4); }
.mulligan-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.keep-btn, .draw-btn {
  background: rgba(0, 255, 65, 0.2);
  color: var(--matrix-green);
  border: 1px solid var(--matrix-green);
}
.keep-btn:hover, .draw-btn:hover:not(:disabled) { background: rgba(0, 255, 65, 0.4); }
.draw-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.reset-btn {
  background: rgba(100, 100, 100, 0.2);
  color: #aaa;
  border: 1px solid #666;
}
.reset-btn:hover { background: rgba(100, 100, 100, 0.4); color: #fff; border-color: #888; }

.bottom-mode {
  text-align: center;
  padding: 10px;
  background: rgba(255, 200, 0, 0.1);
  border: 1px solid rgba(255, 200, 0, 0.4);
  border-radius: 4px;
}
.bottom-instruction {
  color: #ffc800;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  margin: 0;
}

/* Play Area with Battlefield and Graveyard */
.play-area {
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 100px;
}

.zone {
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
}

.battlefield-zone {
  flex: 1;
  background: rgba(0, 200, 255, 0.05);
  border: 1px solid rgba(0, 200, 255, 0.2);
}

.graveyard-zone {
  width: 200px;
  background: rgba(100, 100, 100, 0.1);
  border: 1px solid rgba(100, 100, 100, 0.3);
  flex-shrink: 0;
}
.graveyard-zone.expanded {
  width: 300px;
}

.zone-header {
  color: var(--matrix-green);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  margin: 0;
  padding: 6px 10px;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
  background: rgba(0,0,0,0.3);
}

.graveyard-header {
  cursor: pointer;
  color: #aaa;
  display: flex;
  align-items: center;
  gap: 6px;
}
.graveyard-header:hover { color: #fff; }
.graveyard-toggle { font-size: 0.7rem; }

.zone-cards {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px;
  overflow-y: auto;
  align-content: flex-start;
}

.battlefield-cards {
  min-height: 120px;
}

.graveyard-cards {
  max-height: 200px;
}

.zone-card {
  width: 180px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.zone-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 255, 65, 0.3);
}

/* Compact card style for playtest */
.zone-card :deep(.card) {
  height: auto;
}
.zone-card :deep(.card-header) {
  padding: 5px 8px;
}
.zone-card :deep(.card-name) {
  font-size: 0.8em;
}
.zone-card :deep(.mana-cost) {
  font-size: 0.9em;
}
.zone-card :deep(.art-container) {
  min-height: 80px;
  max-height: 80px;
}
.zone-card :deep(.type-line) {
  padding: 3px 8px;
  font-size: 0.7em;
}
.zone-card :deep(.text-box) {
  padding: 6px 8px;
  font-size: 0.7em;
  line-height: 1.25;
}
.zone-card :deep(.pt-box) {
  bottom: 5px;
  right: 5px;
  padding: 2px 5px;
  font-size: 0.8em;
}
.zone-card :deep(.card[data-pt="yes"] .text-box) {
  padding-bottom: 25px;
}

.graveyard-card {
  opacity: 0.7;
}
.graveyard-card:hover { opacity: 1; }

.empty-zone {
  color: #555;
  font-style: italic;
  font-size: 0.8rem;
  padding: 20px;
  text-align: center;
  width: 100%;
}

/* Hand Area */
.hand-area {
  display: flex;
  flex-direction: column;
}

.hand-header {
  color: var(--matrix-green);
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  margin: 0 0 8px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
}

.hand-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.hand-cards.selection-mode {
  background: rgba(255, 200, 0, 0.05);
  border: 1px dashed rgba(255, 200, 0, 0.3);
}

.hand-card {
  position: relative;
  width: 200px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.hand-card:hover { transform: translateY(-4px); }
.hand-card.selectable { cursor: pointer; }
.hand-card.selectable:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 20px rgba(0, 255, 65, 0.3);
}

/* Compact card style for hand */
.hand-card :deep(.card) {
  height: auto;
}
.hand-card :deep(.card-header) {
  padding: 5px 8px;
}
.hand-card :deep(.card-name) {
  font-size: 0.8em;
}
.hand-card :deep(.mana-cost) {
  font-size: 0.9em;
}
.hand-card :deep(.art-container) {
  min-height: 90px;
  max-height: 90px;
}
.hand-card :deep(.type-line) {
  padding: 3px 8px;
  font-size: 0.7em;
}
.hand-card :deep(.text-box) {
  padding: 6px 8px;
  font-size: 0.7em;
  line-height: 1.25;
}
.hand-card :deep(.pt-box) {
  bottom: 5px;
  right: 5px;
  padding: 2px 5px;
  font-size: 0.8em;
}
.hand-card :deep(.card[data-pt="yes"] .text-box) {
  padding-bottom: 25px;
}

.select-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 200, 0, 0.1);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 15px;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 8px;
}
.hand-card.selectable:hover .select-overlay { opacity: 1; }
.select-hint {
  background: rgba(0, 0, 0, 0.8);
  color: #ffc800;
  padding: 3px 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
}

.empty-hand {
  color: #555;
  text-align: center;
  padding: 30px;
  font-style: italic;
  font-family: 'Courier New', monospace;
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid var(--matrix-green);
  border-radius: 4px;
  padding: 4px 0;
  z-index: 1000;
  min-width: 140px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}

.menu-item {
  display: block;
  width: 100%;
  padding: 8px 14px;
  background: none;
  border: none;
  color: #ccc;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.menu-item:hover {
  background: rgba(0, 255, 65, 0.2);
  color: var(--matrix-green);
}

/* Responsive */
@media (max-width: 900px) {
  .play-area { flex-direction: column; }
  .graveyard-zone { width: 100%; }
  .graveyard-zone.expanded { width: 100%; }
  .hand-card { width: 160px; }
  .zone-card { width: 140px; }
}
</style>

