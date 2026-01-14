<template>
  <div class="app">
    <h1>{{ setInfo.title }}</h1>

    <Dashboard
      :visible-count="filteredCards.length"
      :mechanics="setInfo.mechanics"
      v-model:search-text="searchText"
      v-model:rarity="rarity"
      v-model:type-text="typeText"
      v-model:active-color="activeColor"
      @toggle-color="toggleColor"
      @open-booster="openBooster"
      @start-draft="startDraft"
      @open-notes="showNotes = true"
    />

    <div class="filter-status">
      SHOWING <strong>{{ filteredCards.length }}</strong> / {{ totalCards }} DATA ENTRIES
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { useFilters } from '@/composables/useFilters'
import { useBooster } from '@/composables/useBooster'
import { useDraft } from '@/composables/useDraft'
import { sortCards } from '@/utils/cardUtils'

import Dashboard from '@/components/layout/Dashboard.vue'
import CardGallery from '@/components/cards/CardGallery.vue'
import BoosterModal from '@/components/modals/BoosterModal.vue'
import CardDetailModal from '@/components/modals/CardDetailModal.vue'
import NotesModal from '@/components/modals/NotesModal.vue'
import DraftModal from '@/components/modals/DraftModal.vue'

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

// Sorted cards for filtering
const sortedCards = computed(() => sortCards(cardStore.frontFaceCards))

// Filters
const {
  searchText,
  rarity,
  typeText,
  activeColor,
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

// Notes modal state
const showNotes = ref(false)

function openBooster() {
  booster.openPack()
}

function startDraft() {
  draft.startDraft()
}

function openCardDetail(card) {
  selectedCard.value = card
  showCardDetail.value = true
  viewingFromPack.value = false
  viewingFromDraft.value = false
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
}
</script>

<style>
.app {
  min-height: 100vh;
}
</style>
