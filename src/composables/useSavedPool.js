import { ref } from 'vue'

const STORAGE_KEY = 'itm_saved_pool'

// Shared state across the app
const savedPool = ref(null)
const savedDeck = ref(null) // Cards in the deck
const savedBasicLands = ref(null) // Basic land counts
const poolType = ref(null) // 'draft' or 'sealed'
const poolMetadata = ref(null) // Additional info like draft round/pick

// Load from localStorage on init
function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      savedPool.value = data.pool
      savedDeck.value = data.deck || null
      savedBasicLands.value = data.basicLands || null
      poolType.value = data.type
      poolMetadata.value = data.metadata
    }
  } catch (e) {
    console.warn('Failed to load saved pool:', e)
  }
}

// Save to localStorage
function saveToStorage() {
  try {
    if (savedPool.value && savedPool.value.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        pool: savedPool.value,
        deck: savedDeck.value,
        basicLands: savedBasicLands.value,
        type: poolType.value,
        metadata: poolMetadata.value,
        savedAt: Date.now()
      }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (e) {
    console.warn('Failed to save pool:', e)
  }
}

// Initialize on first import
loadFromStorage()

export function useSavedPool() {
  function savePool(pool, type, deckState = null) {
    if (!pool || pool.length === 0) return

    savedPool.value = [...pool]
    poolType.value = type

    // Save deck state if provided
    if (deckState) {
      savedDeck.value = deckState.mainDeck ? [...deckState.mainDeck] : null
      savedBasicLands.value = deckState.basicLands ? { ...deckState.basicLands } : null
    } else {
      savedDeck.value = null
      savedBasicLands.value = null
    }

    saveToStorage()
  }

  function clearPool() {
    savedPool.value = null
    savedDeck.value = null
    savedBasicLands.value = null
    poolType.value = null
    poolMetadata.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  function hasSavedPool() {
    return savedPool.value && savedPool.value.length > 0
  }

  function getDeckCardCount() {
    let count = savedDeck.value?.length || 0
    if (savedBasicLands.value) {
      count += Object.values(savedBasicLands.value).reduce((a, b) => a + b, 0)
    }
    return count
  }

  return {
    savedPool,
    savedDeck,
    savedBasicLands,
    poolType,
    poolMetadata,
    savePool,
    clearPool,
    hasSavedPool,
    getDeckCardCount
  }
}
