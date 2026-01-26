<template>
  <div class="app">
    <h1>{{ setInfo.title }}</h1>

    <Dashboard
      :visible-count="filteredCards.length"
      :mechanics="setInfo.mechanics"
      :stats="setInfo.stats"
      v-model:search-text="searchText"
      v-model:rarity="rarity"
      v-model:type-text="typeText"
      v-model:active-colors="activeColors"
      v-model:active-m-vs="activeMVs"
      @toggle-color="toggleColor"
      @toggle-mv="toggleMV"
      @reset-filters="resetFilters"
      @open-booster="openBooster"
      @start-draft="startDraft"
      @generate-sealed="generateSealed"
      @open-notes="showNotes = true"
      @open-stats="showStats = true"
      @resume-pool="resumePool"
      @open-print-proxies="openPrintProxiesFromDashboard"
      @open-archetypes="showArchetypes = true"
      @open-notes-manager="showNotesManager = true"
      @open-changelog="showChangelog = true"
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
      @edit-note="openCardNote"
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
      @close="closeDraft"
      @pick="draft.pickCard"
      @download="draft.downloadDeck()"
      @view-card="openCardDetailFromDraft"
    />

    <!-- Sealed Pool Modal -->
    <SealedModal
      :show="showSealedPool"
      :pool="sealedPool"
      :initial-deck="sealedInitialDeck"
      :initial-basic-lands="sealedInitialBasicLands"
      @close="closeSealed"
      @view-card="openCardDetailFromSealed"
      @open-print-proxies="openPrintProxiesFromDeck"
    />

    <!-- Set Stats Modal -->
    <SetStatsModal
      :show="showStats"
      :stats="setInfo.stats"
      @close="showStats = false"
    />

    <!-- Print Proxy Modal -->
    <PrintProxyModal
      :show="showPrintProxy"
      :mode="printProxyMode"
      :initial-cards="printProxyInitialCards"
      @close="showPrintProxy = false"
    />

    <!-- Archetype Analysis Modal -->
    <ArchetypeModal
      :show="showArchetypes"
      @close="showArchetypes = false"
      @view-card="openCardDetailFromArchetype"
    />

    <!-- Card Note Editor Modal -->
    <CardNoteModal
      :show="showCardNote"
      :card="cardNoteTarget"
      @close="showCardNote = false"
    />

    <!-- Notes Manager Modal -->
    <NotesManagerModal
      :show="showNotesManager"
      @close="showNotesManager = false"
      @edit-card="openCardNote"
    />

    <!-- Changelog Modal -->
    <ChangelogModal
      :show="showChangelog"
      @close="showChangelog = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCardStore } from '@/stores/cardStore'

import { useFilters } from '@/composables/useFilters'
import { useBooster } from '@/composables/useBooster'
import { useDraft } from '@/composables/useDraft'
import { useSavedPool } from '@/composables/useSavedPool'
import { generateSealedPool } from '@/utils/boosterLogic'
import { sortCards } from '@/utils/cardUtils'
import SortSelect from '@/components/filters/SortSelect.vue'

import Dashboard from '@/components/layout/Dashboard.vue'
import CardGallery from '@/components/cards/CardGallery.vue'

import BoosterModal from '@/components/modals/BoosterModal.vue'
import CardDetailModal from '@/components/modals/CardDetailModal.vue'
import NotesModal from '@/components/modals/NotesModal.vue'
import DraftModal from '@/components/modals/DraftModal.vue'
import SealedModal from '@/components/modals/SealedModal.vue'
import SetStatsModal from '@/components/modals/SetStatsModal.vue'
import PrintProxyModal from '@/components/modals/PrintProxyModal.vue'
import ArchetypeModal from '@/components/modals/ArchetypeModal.vue'
import CardNoteModal from '@/components/modals/CardNoteModal.vue'
import NotesManagerModal from '@/components/modals/NotesManagerModal.vue'
import ChangelogModal from '@/components/modals/ChangelogModal.vue'

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
  activeMVs,
  filteredCards,
  toggleColor,
  toggleMV,
  resetFilters
} = useFilters(sortedCards)

// Booster pack
const booster = useBooster(allCards)

// Draft
const draft = useDraft(allCards)

// Saved pool for resuming
const { savedPool, savedDeck, savedBasicLands, poolType, savePool } = useSavedPool()

// Card detail modal state
const showCardDetail = ref(false)
const selectedCard = ref(null)
const viewingFromPack = ref(false)
const viewingFromDraft = ref(false)
const viewingFromSealed = ref(false)
const viewingFromArchetype = ref(false)

// Sealed pool state
const showSealedPool = ref(false)
const sealedPool = ref([])

// Notes modal state
const showNotes = ref(false)

// Stats modal state
const showStats = ref(false)

// Archetypes modal state
const showArchetypes = ref(false)

// Card notes modal state
const showCardNote = ref(false)
const cardNoteTarget = ref(null)
const showNotesManager = ref(false)
const showChangelog = ref(false)

// Print proxy modal state
const showPrintProxy = ref(false)
const printProxyMode = ref('dashboard')
const printProxyInitialCards = ref([])

function openBooster() {
  booster.openPack()
}

function startDraft() {
  draft.startDraft()
}

function generateSealed() {
  sealedPool.value = generateSealedPool(allCards.value)
  // Clear any previous deck state when generating new pool
  sealedInitialDeck.value = null
  sealedInitialBasicLands.value = null
  showSealedPool.value = true
}

// Track initial deck state for sealed restoration
const sealedInitialDeck = ref(null)
const sealedInitialBasicLands = ref(null)

function resumePool() {
  if (poolType.value === 'draft') {
    // Restore draft pool - open in review mode
    draft.pool.value = [...savedPool.value]
    draft.isOpen.value = true
    draft.active.value = false
    draft.isReviewingPool.value = true
  } else if (poolType.value === 'sealed') {
    // Restore sealed pool with deck state
    // savedPool contains the FULL pool (remaining + deck cards)
    // We need to filter out deck cards to get just the remaining pool
    const deckCardIds = new Set((savedDeck.value || []).map(c => c.id))
    const remainingPool = savedPool.value.filter(c => !deckCardIds.has(c.id))

    sealedPool.value = remainingPool
    sealedInitialDeck.value = savedDeck.value ? [...savedDeck.value] : null
    sealedInitialBasicLands.value = savedBasicLands.value ? { ...savedBasicLands.value } : null
    showSealedPool.value = true
  }
}

function closeDraft(deckState) {
  // Save the pool and deck state before closing if there are cards
  if (draft.pool.value.length > 0) {
    savePool(draft.pool.value, 'draft', deckState)
  }
  draft.closeDraft()
}

function closeSealed() {
  // Saving is now handled automatically by SealedModal on state changes
  // Clear initial deck state
  sealedInitialDeck.value = null
  sealedInitialBasicLands.value = null
  showSealedPool.value = false
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

function openCardDetailFromArchetype(card) {
  selectedCard.value = card
  showCardDetail.value = true
  viewingFromArchetype.value = true
  showArchetypes.value = false // Temporarily hide to show modal
}

function openCardNote(card) {
  cardNoteTarget.value = card
  showCardNote.value = true
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
  if (viewingFromArchetype.value) {
    showArchetypes.value = true
    viewingFromArchetype.value = false
  }
}

function openPrintProxiesFromDashboard() {
  printProxyMode.value = 'dashboard'
  printProxyInitialCards.value = []
  showPrintProxy.value = true
}

function openPrintProxiesFromDeck(cards) {
  printProxyMode.value = 'deck'
  printProxyInitialCards.value = cards
  showPrintProxy.value = true
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
