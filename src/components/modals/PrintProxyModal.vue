<template>
  <BaseModal :show="show" title="" @close="$emit('close')" :full-width="true">
    <div class="print-proxy-container">
      <!-- Controls Header -->
      <div class="print-controls no-print">
        <div class="print-mode-toggle">
          <button :class="{ active: displayMode === 'art' }" @click="displayMode = 'art'">
            With Art
          </button>
          <button :class="{ active: displayMode === 'text' }" @click="displayMode = 'text'">
            Text Only
          </button>
        </div>
        <div class="print-info">
          <strong>{{ totalCards }}</strong> cards / <strong>{{ pageCount }}</strong> pages
        </div>
        <button class="print-btn" :disabled="totalCards === 0" @click="handlePrint">
          PRINT
        </button>
      </div>

      <!-- Card Selector (Dashboard Mode Only) -->
      <div v-if="mode === 'dashboard'" class="print-card-selector no-print">
        <div class="selector-available">
          <div class="selector-header">Available Cards (click to add)</div>
          <div class="selector-grid">
            <div
              v-for="card in availableCards"
              :key="card.id"
              class="selector-card"
              @click="addCard(card)"
            >
              <span class="selector-card-name">{{ card.name }}</span>
              <span class="selector-card-cost" v-html="formatCost(card.cost)"></span>
            </div>
          </div>
        </div>
        <div class="selector-selected">
          <div class="selector-header">Selected ({{ totalCards }})</div>
          <div v-if="selectedCards.length === 0" class="empty-selection">
            Click cards to add them
          </div>
          <div v-for="item in selectedCards" :key="item.card.id" class="selected-card-row">
            <div class="selected-card-info">
              <span class="selected-card-name">{{ item.card.name }}</span>
            </div>
            <div class="quantity-controls">
              <button @click="decreaseQuantity(item.card.id)">-</button>
              <span class="quantity-value">{{ item.quantity }}</span>
              <button @click="increaseQuantity(item.card.id)">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Deck Mode: Show cards from deck -->
      <div v-if="mode === 'deck' && selectedCards.length > 0" class="print-card-selector no-print">
        <div class="selector-selected" style="width: 100%; max-width: 600px; margin: 0 auto;">
          <div class="selector-header">Deck Cards ({{ totalCards }})</div>
          <div v-for="item in selectedCards" :key="item.card.id" class="selected-card-row">
            <div class="selected-card-info">
              <span class="selected-card-name">{{ item.card.name }}</span>
            </div>
            <div class="quantity-controls">
              <button @click="decreaseQuantity(item.card.id)">-</button>
              <span class="quantity-value">{{ item.quantity }}</span>
              <button @click="increaseQuantity(item.card.id)">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Print Preview Area (in modal) -->
      <div class="print-preview no-print">
        <PrintProxyGrid
          v-if="expandedCards.length > 0"
          :cards="expandedCards"
          :display-mode="displayMode"
        />
        <div v-else class="empty-selection" style="padding: 60px; text-align: center;">
          <p>No cards selected for printing.</p>
          <p v-if="mode === 'dashboard'">Click cards above to add them to your print list.</p>
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- Teleport print content to body for clean printing -->
  <Teleport to="body">
    <div v-if="show && expandedCards.length > 0" class="print-only-container">
      <PrintProxyGrid
        :cards="expandedCards"
        :display-mode="displayMode"
      />
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import PrintProxyGrid from '@/components/print/PrintProxyGrid.vue'
import { useCardStore } from '@/stores/cardStore'
import { replaceSymbols } from '@/utils/manaSymbols'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'dashboard' // 'dashboard' or 'deck'
  },
  initialCards: {
    type: Array,
    default: () => []
  }
})

defineEmits(['close'])

const cardStore = useCardStore()
const displayMode = ref('art')
const selectedCards = ref([])

// Helper to check if a card is a basic land
function isBasicLand(card) {
  const type = (card.type || card.displayType || '').toLowerCase()
  return type.includes('basic land')
}

// Available cards for dashboard mode (excluding basic lands)
const availableCards = computed(() => {
  return cardStore.frontFaceCards.filter(card => !isBasicLand(card))
})

// Initialize selected cards when modal opens or initialCards changes
watch(
  () => [props.show, props.initialCards],
  ([show, cards]) => {
    if (show && props.mode === 'deck' && cards.length > 0) {
      // Group cards by name and count quantities
      const grouped = new Map()
      cards.filter(card => !isBasicLand(card)).forEach(card => {
        if (!grouped.has(card.name)) {
          grouped.set(card.name, { card, quantity: 0 })
        }
        grouped.get(card.name).quantity++
      })
      selectedCards.value = Array.from(grouped.values())
    } else if (show && props.mode === 'dashboard') {
      // Reset for dashboard mode
      selectedCards.value = []
    }
  },
  { immediate: true }
)

// Reset when modal closes
watch(
  () => props.show,
  (show) => {
    if (!show) {
      displayMode.value = 'art'
    }
  }
)

// Expand selected cards into individual card entries (including DFC back faces)
const expandedCards = computed(() => {
  const expanded = []
  selectedCards.value.forEach(({ card, quantity }) => {
    for (let i = 0; i < quantity; i++) {
      // Add front face
      expanded.push({ ...card })
      // Add back face if it's a DFC
      if (card.hasBackFace) {
        const backFace = cardStore.getBackFace(card)
        if (backFace) {
          expanded.push({ ...backFace })
        }
      }
    }
  })
  return expanded
})

const totalCards = computed(() => expandedCards.value.length)
const pageCount = computed(() => Math.ceil(totalCards.value / 9))

// Dashboard mode: add card to selection
function addCard(card) {
  const existing = selectedCards.value.find(item => item.card.id === card.id)
  if (existing) {
    existing.quantity++
  } else {
    selectedCards.value.push({ card, quantity: 1 })
  }
}

function increaseQuantity(cardId) {
  const item = selectedCards.value.find(i => i.card.id === cardId)
  if (item) {
    item.quantity++
  }
}

function decreaseQuantity(cardId) {
  const index = selectedCards.value.findIndex(i => i.card.id === cardId)
  if (index !== -1) {
    if (selectedCards.value[index].quantity > 1) {
      selectedCards.value[index].quantity--
    } else {
      selectedCards.value.splice(index, 1)
    }
  }
}

function formatCost(cost) {
  return replaceSymbols(cost || '')
}

function handlePrint() {
  setTimeout(() => {
    window.print()
  }, 100)
}
</script>
