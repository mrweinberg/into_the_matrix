<template>
  <div class="app">
    <h1>{{ setInfo.title }}</h1>

    <Dashboard
      :visible-count="filteredCards.length"
      :mechanics="setInfo.mechanics"
      v-model:search-text="searchText"
      v-model:rarity="rarity"
      v-model:type-text="typeText"
      v-model:active-colors="activeColors"
      @toggle-color="toggleColor"
      @open-booster="openBooster"
      @start-draft="startDraft"
      @generate-sealed="generateSealed"
      @open-notes="showNotes = true"
    />

    <div class="filter-status">
      <span>SHOWING <strong>{{ filteredCards.length }}</strong> / {{ totalCards }} DATA ENTRIES</span>
      <div class="sort-controls">
        <SortSelect v-model="sortBy" />
        <button class="btn-sort-dir" @click="toggleSortDirection" :title="'Sort ' + (sortDirection === 'asc' ? 'Descending' : 'Ascending')">
          <i :class="sortDirection === 'asc' ? 'ms ms-planeswalker' : 'ms ms-planeswalker ms-b'"></i>
          {{ sortDirection === 'asc' ? 'ASC' : 'DESC' }}
        </button>
      </div>
    </div>

    <CardGallery
      :cards="filteredCards"
      @card-click="openCardDetail"
    />

    <!-- Booster Pack Modal -->
    <BoosterModal
      :show="booster.isOpen.value"
      :pack="booster.currentPack.value"
      @close="booster.closePack()"
      @view-card="openCardDetailFromPack"
    />

    <!-- Card Detail Modal -->
    <CardDetailModal
      :show="showCardDetail"
      :card="selectedCard"
      @close="closeCardDetail"
    />

    <!-- Design Notes Modal -->
    <NotesModal
      :show="showNotes"
      :notes="designNotes"
      @close="showNotes = false"
    />

    <!-- Draft Modal -->
    <DraftModal
      :show="draft.isOpen.value"
      :active="draft.active.value"
      :is-reviewing-pool="draft.isReviewingPool.value"
      :round="draft.round.value"
      :pick="draft.pick.value"
      :current-pack="draft.currentPack.value"
      :pool="draft.pool.value"
      :sorted-pool="draft.sortedPool.value"
      @close="draft.closeDraft()"
      @pick="draft.pickCard"
      @download="draft.downloadDeck()"
      @view-card="openCardDetailFromDraft"
    />

    <!-- Sealed Pool Modal -->
    <SealedModal
      :show="showSealedPool"
      :pool="sealedPool"
      @close="showSealedPool = false"
      @view-card="openCardDetailFromSealed"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCardStore } from '@/stores/cardStore'

import { useFilters } from '@/composables/useFilters'
import { useBooster } from '@/composables/useBooster'
import { useDraft } from '@/composables/useDraft'
import { generateSealedPool } from '@/utils/boosterLogic'
import { sortCards } from '@/utils/cardUtils'
import SortSelect from '@/components/filters/SortSelect.vue'

import Dashboard from '@/components/layout/Dashboard.vue'
import CardGallery from '@/components/cards/CardGallery.vue'

import DraftModal from '@/components/modals/DraftModal.vue'
import SealedModal from '@/components/modals/SealedModal.vue'

const cardStore = useCardStore()

// Load data on mount
onMounted(async () => {
  await cardStore.loadData()
})

// Computed properties from store
const setInfo = computed(() => cardStore.setInfo)
const designNotes = computed(() => cardStore.designNotes)
const allCards = computed(() => cardStore.cards)
const totalCards = computed(() => cardStore.frontFaceCards.length)
const sortBy = ref('color')
const sortDirection = ref('asc')

function toggleSortDirection() {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}

// Sorted cards for filtering
const sortedCards = computed(() => sortCards(cardStore.frontFaceCards, sortBy.value, sortDirection.value))

// Filters
const {
  searchText,
  rarity,
  typeText,
  activeColors,
  filteredCards,
  toggleColor
} = useFilters(sortedCards)

// Booster pack
const booster = useBooster(allCards)

// Draft
const draft = useDraft(allCards)

// Card detail modal state
const showCardDetail = ref(false)
const selectedCard = ref(null)
const viewingFromPack = ref(false)
const viewingFromDraft = ref(false)
const viewingFromSealed = ref(false)

// Sealed pool state
const showSealedPool = ref(false)
const sealedPool = ref([])

// Notes modal state
const showNotes = ref(false)

function openBooster() {
  booster.openPack()
}

function startDraft() {
  draft.startDraft()
}

function generateSealed() {
  sealedPool.value = generateSealedPool(allCards.value)
  showSealedPool.value = true
}

function openCardDetail(card) {
  selectedCard.value = card
  showCardDetail.value = true
  viewingFromPack.value = false
  viewingFromDraft.value = false
  viewingFromSealed.value = false
}

function openCardDetailFromPack(card) {
  selectedCard.value = card
  showCardDetail.value = true
  viewingFromPack.value = true
  booster.closePack()
}

function openCardDetailFromDraft(card) {
  selectedCard.value = card
  showCardDetail.value = true
  viewingFromDraft.value = true
}

function openCardDetailFromSealed(card) {
  selectedCard.value = card
  showCardDetail.value = true
  viewingFromSealed.value = true
  showSealedPool.value = false // Temporarily hide to show modal
}

function closeCardDetail() {
  showCardDetail.value = false
  selectedCard.value = null

  // Return to pack/draft view if we came from there
  if (viewingFromPack.value) {
    booster.isOpen.value = true
    viewingFromPack.value = false
  }
  if (viewingFromDraft.value && draft.isReviewingPool.value) {
    viewingFromDraft.value = false
  }
  if (viewingFromSealed.value) {
    showSealedPool.value = true
    viewingFromSealed.value = false
  }
}
</script>

<style>
.app {
  min-height: 100vh;
}

.filter-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--matrix-green);
  border-top: 1px solid var(--matrix-green);
  color: var(--matrix-green);
  font-family: 'Courier New', monospace;
  margin-bottom: 20px;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-sort-dir {
  background: transparent;
  border: 1px solid var(--matrix-green);
  color: var(--matrix-green);
  padding: 5px 10px;
  cursor: pointer;
  font-family: inherit;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-sort-dir:hover {
  background: var(--matrix-green);
  color: #000;
}
</style>
