import { reactive, computed, toRefs } from 'vue'
import { generateBoosterPackData } from '@/utils/boosterLogic'
import { calculateCMC, determineColorClass } from '@/utils/cardUtils'

export function useDraft(allCards) {
  const state = reactive({
    active: false,
    round: 1,
    pick: 1,
    packs: [],
    pool: [],
    isReviewingPool: false,
    isOpen: false
  })

  const currentPack = computed(() => state.packs[0] || [])

  const passDirection = computed(() =>
    state.round === 2 ? 'right' : 'left'
  )

  const sortedPool = computed(() => {
    return [...state.pool].sort((a, b) => {
      const cmcA = calculateCMC(a.cost)
      const cmcB = calculateCMC(b.cost)
      if (cmcA !== cmcB) return cmcA - cmcB
      return determineColorClass(a).localeCompare(determineColorClass(b))
    })
  })

  function startDraft() {
    state.active = true
    state.round = 1
    state.pick = 1
    state.packs = []
    state.pool = []
    state.isReviewingPool = false
    state.isOpen = true

    for (let i = 0; i < 8; i++) {
      state.packs.push(generateBoosterPackData(allCards.value))
    }
  }

  function pickCard(cardId) {
    const cardIndex = state.packs[0].findIndex(c => c.id === cardId)
    if (cardIndex === -1) return

    // Add picked card to pool
    state.pool.push(state.packs[0][cardIndex])
    state.packs[0].splice(cardIndex, 1)

    // Simulate AI picks from other packs
    for (let i = 1; i < 8; i++) {
      if (state.packs[i].length > 0) {
        const randomIdx = Math.floor(Math.random() * state.packs[i].length)
        state.packs[i].splice(randomIdx, 1)
      }
    }

    // Rotate packs based on round direction
    if (state.round === 2) {
      const last = state.packs.pop()
      state.packs.unshift(last)
    } else {
      const first = state.packs.shift()
      state.packs.push(first)
    }

    state.pick++

    // Check for round/draft end
    if (state.packs[0].length === 0) {
      if (state.round === 3) {
        endDraft()
      } else {
        state.round++
        state.pick = 1
        state.packs = []
        for (let i = 0; i < 8; i++) {
          state.packs.push(generateBoosterPackData(allCards.value))
        }
      }
    }
  }

  function endDraft() {
    state.active = false
    state.isReviewingPool = true
  }

  function closeDraft() {
    state.isOpen = false
    state.active = false
    state.isReviewingPool = false
  }

  function downloadDeck() {
    const text = state.pool.map(c => `1 ${c.name}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'matrix-draft-deck.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    ...toRefs(state),
    currentPack,
    passDirection,
    sortedPool,
    startDraft,
    pickCard,
    endDraft,
    closeDraft,
    downloadDeck
  }
}
