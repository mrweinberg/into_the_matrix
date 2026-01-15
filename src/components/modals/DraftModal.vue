<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="modal-overlay"
        :class="{ 'draft-mode': !isReviewingPool }"
        @click.self="handleClose"
      >
        <div class="modal-content">
          <button class="close-modal" @click="handleClose">&times;</button>

          <!-- Draft in progress -->
          <template v-if="active">
            <h2 class="modal-title">
              DRAFT: PACK {{ round }} / PICK {{ pick }}
            </h2>
            <div class="pack-grid">
              <template v-for="card in currentPack" :key="card.id">
                <CardDFC
                  v-if="card.hasBackFace"
                  :card="card"
                  :back-card="getBackFace(card)"
                  @click="pickCard(card.id)"
                />
                <CardItem
                  v-else
                  :card="card"
                  @click="pickCard(card.id)"
                />
              </template>
            </div>
          </template>

          <!-- Draft complete - reviewing pool -->
          <template v-else-if="isReviewingPool">
            <h2 class="modal-title">
              DECK BUILDER
            </h2>
            <div class="deck-builder-container">
              <DeckBuilder
                :initial-pool="sortedPool"
                ref="deckBuilderRef"
                @open-playtest="onOpenPlaytest"
              />
            </div>
          </template>
        </div>

        <!-- Sidebar shown during draft -->
        <DraftSidebar
          v-if="active"
          :pool="pool"
          @hover="hoverCard = $event"
          @hover-end="hoverCard = null"
        />

        <!-- Hover preview -->
        <HoverPreview v-if="active" :card="hoverCard" />
      </div>
    </Transition>
  </Teleport>

  <PlaytestModal
    :show="showPlaytest"
    :deck="playtestData.deck"
    :basic-lands="playtestData.basicLands"
    :basic-land-cards="playtestData.basicLandCards"
    @close="showPlaytest = false"
  />
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import CardItem from '@/components/cards/CardItem.vue'
import CardDFC from '@/components/cards/CardDFC.vue'
import DraftSidebar from './DraftSidebar.vue'
import HoverPreview from './HoverPreview.vue'
import DeckBuilder from '@/components/deck/DeckBuilder.vue'
import PlaytestModal from './PlaytestModal.vue'

const props = defineProps({
  show: Boolean,
  active: Boolean,
  isReviewingPool: Boolean,
  round: Number,
  pick: Number,
  currentPack: Array,
  pool: Array,
  sortedPool: Array
})

const emit = defineEmits(['close', 'pick', 'download', 'view-card'])

const cardStore = useCardStore()
const hoverCard = ref(null)
const deckBuilderRef = ref(null)

// Playtest modal state
const showPlaytest = ref(false)
const playtestData = reactive({
  deck: [],
  basicLands: {},
  basicLandCards: {}
})

function getBackFace(card) {
  return cardStore.getBackFace(card)
}

function pickCard(cardId) {
  emit('pick', cardId)
}

function handleClose() {
  emit('close')
}

function downloadDeck() {
  if (deckBuilderRef.value) {
    deckBuilderRef.value.exportDeck()
  } else {
    emit('download')
  }
}

function viewCard(card) {
  emit('view-card', card)
}

function onOpenPlaytest(data) {
  playtestData.deck = data.mainDeck || []
  playtestData.basicLands = data.basicLands || {}
  playtestData.basicLandCards = data.basicLandCards || {}
  showPlaytest.value = true
}
</script>

