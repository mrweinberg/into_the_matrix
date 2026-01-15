import { ref, computed } from 'vue'

export function usePlaytest() {
  const library = ref([])
  const hand = ref([])
  const battlefield = ref([])
  const graveyard = ref([])
  const mulliganCount = ref(0)
  const hasKept = ref(false)
  const cardsToBottomRemaining = ref(0)
  const isActive = ref(false)

  // Store the original deck for reset
  const originalDeck = ref([])

  const librarySize = computed(() => library.value.length)
  const handSize = computed(() => hand.value.length)
  const battlefieldSize = computed(() => battlefield.value.length)
  const graveyardSize = computed(() => graveyard.value.length)
  const needsToBottom = computed(() => hasKept.value && cardsToBottomRemaining.value > 0)

  // Fisher-Yates shuffle
  function shuffle(array) {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  function startPlaytest(deck, basicLands, basicLandCards) {
    // Build the full deck including basic lands
    const fullDeck = [...deck]

    // Expand basic lands into individual card objects
    if (basicLands && basicLandCards) {
      Object.entries(basicLands).forEach(([type, count]) => {
        for (let i = 0; i < count; i++) {
          fullDeck.push({ ...basicLandCards[type], playtestId: `basic-${type}-${i}` })
        }
      })
    }

    // Add unique playtest IDs to all cards for tracking
    originalDeck.value = fullDeck.map((card, index) => ({
      ...card,
      playtestId: card.playtestId || `card-${index}`
    }))

    // Reset state
    mulliganCount.value = 0
    hasKept.value = false
    cardsToBottomRemaining.value = 0
    hand.value = []
    battlefield.value = []
    graveyard.value = []

    // Shuffle and draw initial hand
    library.value = shuffle(originalDeck.value)
    drawCards(7)
    isActive.value = true
  }

  function drawCards(count) {
    const toDraw = Math.min(count, library.value.length)
    for (let i = 0; i < toDraw; i++) {
      hand.value.push(library.value.shift())
    }
  }

  function mulligan() {
    if (mulliganCount.value >= 6) return // Can't mulligan to 0

    mulliganCount.value++

    // Return hand to library and reshuffle
    library.value = shuffle([...library.value, ...hand.value])
    hand.value = []

    // Draw 7 cards (will put cards on bottom after keeping)
    drawCards(7)
  }

  function keepHand() {
    hasKept.value = true
    cardsToBottomRemaining.value = mulliganCount.value
  }

  function putOnBottom(cardIndex) {
    if (cardsToBottomRemaining.value <= 0) return
    if (cardIndex < 0 || cardIndex >= hand.value.length) return

    const card = hand.value.splice(cardIndex, 1)[0]
    library.value.push(card)
    cardsToBottomRemaining.value--
  }

  function drawStep() {
    if (library.value.length === 0) return
    drawCards(1)
  }

  // Zone transition functions
  function playCard(cardIndex) {
    if (cardIndex < 0 || cardIndex >= hand.value.length) return
    const card = hand.value.splice(cardIndex, 1)[0]
    battlefield.value.push(card)
  }

  function destroyCard(cardIndex) {
    if (cardIndex < 0 || cardIndex >= battlefield.value.length) return
    const card = battlefield.value.splice(cardIndex, 1)[0]
    graveyard.value.push(card)
  }

  function discardFromHand(cardIndex) {
    if (cardIndex < 0 || cardIndex >= hand.value.length) return
    const card = hand.value.splice(cardIndex, 1)[0]
    graveyard.value.push(card)
  }

  function bounceToHand(cardIndex) {
    if (cardIndex < 0 || cardIndex >= battlefield.value.length) return
    const card = battlefield.value.splice(cardIndex, 1)[0]
    hand.value.push(card)
  }

  function returnFromGraveyard(cardIndex) {
    if (cardIndex < 0 || cardIndex >= graveyard.value.length) return
    const card = graveyard.value.splice(cardIndex, 1)[0]
    hand.value.push(card)
  }

  function reset() {
    mulliganCount.value = 0
    hasKept.value = false
    cardsToBottomRemaining.value = 0
    hand.value = []
    battlefield.value = []
    graveyard.value = []
    library.value = shuffle([...originalDeck.value])
    drawCards(7)
  }

  function endPlaytest() {
    isActive.value = false
    library.value = []
    hand.value = []
    battlefield.value = []
    graveyard.value = []
    originalDeck.value = []
    mulliganCount.value = 0
    hasKept.value = false
    cardsToBottomRemaining.value = 0
  }

  return {
    library,
    hand,
    battlefield,
    graveyard,
    mulliganCount,
    hasKept,
    cardsToBottomRemaining,
    isActive,
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
  }
}

