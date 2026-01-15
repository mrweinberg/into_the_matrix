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
    />
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import DeckBuilder from '@/components/deck/DeckBuilder.vue'
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

defineExpose({
  deckBuilderRef
})
</script>

<style scoped>
</style>
