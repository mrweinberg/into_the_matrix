<template>
  <BaseModal :show="show" title="" @close="handleClose" :full-width="true">
    <DeckBuilder
      :key="deckBuilderKey"
      ref="deckBuilderRef"
      :initial-pool="pool"
      :initial-deck="initialDeck"
      :initial-basic-lands="initialBasicLands"
      @state-change="onStateChange"
      @open-print-proxies="onOpenPrintProxies"
      @open-playtest="onOpenPlaytest"
    />
  </BaseModal>

  <PlaytestModal
    :show="showPlaytest"
    :deck="playtestData.deck"
    :basic-lands="playtestData.basicLands"
    :basic-land-cards="playtestData.basicLandCards"
    @close="showPlaytest = false"
  />
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import BaseModal from './BaseModal.vue'
import DeckBuilder from '@/components/deck/DeckBuilder.vue'
import PlaytestModal from './PlaytestModal.vue'
import { useSavedPool } from '@/composables/useSavedPool'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  pool: {
    type: Array,
    required: true
  },
  initialDeck: {
    type: Array,
    default: null
  },
  initialBasicLands: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'view-card', 'open-print-proxies'])

const { savePool } = useSavedPool()

const deckBuilderRef = ref(null)

// Playtest modal state
const showPlaytest = ref(false)
const playtestData = reactive({
  deck: [],
  basicLands: {},
  basicLandCards: {}
})

// Key to force DeckBuilder re-initialization when pool/deck changes
const deckBuilderKey = computed(() => {
  const poolIds = (props.pool || []).map(c => c.id).join(',')
  const deckIds = (props.initialDeck || []).map(c => c.id).join(',')
  return `${poolIds}-${deckIds}`
})

// Save state whenever it changes
function onStateChange(state) {
  if (!state) return

  // Combine pool and deck to get the full original pool
  const fullPool = [...(state.pool || []), ...(state.mainDeck || [])]
  if (fullPool.length > 0) {
    savePool(fullPool, 'sealed', {
      mainDeck: state.mainDeck || [],
      basicLands: state.basicLands || {}
    })
  }
}

function handleClose() {
  emit('close')
}

function onOpenPrintProxies(cards) {
  emit('open-print-proxies', cards)
}

function onOpenPlaytest(data) {
  playtestData.deck = data.mainDeck || []
  playtestData.basicLands = data.basicLands || {}
  playtestData.basicLandCards = data.basicLandCards || {}
  showPlaytest.value = true
}

defineExpose({
  deckBuilderRef
})
</script>

<style scoped>
</style>
