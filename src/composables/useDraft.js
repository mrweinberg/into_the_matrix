import { reactive, computed, toRefs } from 'vue'
import { generateBoosterPackData } from '@/utils/boosterLogic'
import { calculateCMC, determineColorClass } from '@/utils/cardUtils'
import { DraftBot } from '@/utils/draftBots'

export function useDraft(allCards) {
  const state = reactive({
    active: false,
    round: 1,
    pick: 1,
    packs: [],
    pool: [],
    bots: [], // Array of 7 DraftBot instances
    isReviewingPool: false,
    isOpen: false
  })

  // ... (computeds remain same) ...
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
    state.bots = []
    state.isReviewingPool = false
    state.isOpen = true

    // Initialize 7 bots
    for (let i = 0; i < 7; i++) {
      state.bots.push(new DraftBot(i))
    }

    // Generate 8 packs (User + 7 Bots)
    // Index 0 is User's pack
    for (let i = 0; i < 8; i++) {
      state.packs.push(generateBoosterPackData(allCards.value))
    }
  }

  function pickCard(cardId) {
    const cardIndex = state.packs[0].findIndex(c => c.id === cardId)
    if (cardIndex === -1) return

    // 1. User picks card
    state.pool.push(state.packs[0][cardIndex])
    state.packs[0].splice(cardIndex, 1)

    // 2. Bots pick from their packs (indices 1-7)
    // Each bot corresponds to the pack at that index initially?
    // Actually, packs rotate. We need to know WHICH bot is holding WHICH pack.
    // Simplification: 
    // - In a real draft, seated players are fixed, packs move.
    // - Let's say: 
    //   Index 0 is ALWAYS the pack the User is looking at.
    //   Indices 1-7 are packs held by Bots 1-7 (relative to user).
    //   When we rotate, we shift the arrays.

    // So, Bot 1 (state.bots[0]) is currently holding state.packs[1]
    // Bot 2 (state.bots[1]) is holding state.packs[2]
    // ...
    // Bot 7 (state.bots[6]) is holding state.packs[7]

    for (let i = 1; i < 8; i++) {
      const botIndex = i - 1 // Bot 0 handles Pack 1, etc.
      const pack = state.packs[i]
      if (pack.length > 0) {
        // Bot analyzes pack and picks
        const pickedIndex = state.bots[botIndex].pick(pack)
        if (pickedIndex !== -1) {
          pack.splice(pickedIndex, 1)
        }
      }
    }

    // 3. Rotate packs
    if (state.round === 2) {
      // Pass Right: User passes to Bot 7 (Index 7), Bot 1 passes to User
      // Array shift: [0, 1, 2, ... 7] -> [1, 2, ... 7, 0] ?
      // If User (0) passes right, they pass to the person on their right (7?). 
      // And receive from person on left (1?).
      // Let's standardise: 
      // Pack 0 goes to 7. Pack 1 goes to 0. Pack 2 goes to 1.
      // JS Array: unshift/pop moves Right. shift/push moves Left.

      // Let's visualize: 
      // [P0, P1, P2]
      // pop() removes P2. unshift(P2) -> [P2, P0, P1]
      // Now User holds P2 (from right?), Bot 1 holds P0. 
      // This is passing TO THE LEFT player (receiving from Right).

      // Round 2 is Pass Right (Receive from Left).
      // So we want the pack FROM index 7 to come to 0. 
      // [P0, P1... P7] -> [P7, P0, ... P6]
      // This is accomplished by pop() and unshift(). 

      const last = state.packs.pop()
      state.packs.unshift(last)
    } else {
      // Round 1/3: Pass Left (Receive from Right).
      // User passes P0 to Bot 1.
      // User receives P1 from Bot 1? No, User receives from Bot 7?
      // Standard: 1 -> 2 -> ... -> 8 -> 1
      // User (Pos 1) passes to Pos 2. Pos 8 passes to User.

      // Array: [P0, P1, ... P7]
      // shift() removes P0. push(P0). -> [P1, ... P7, P0]
      // Now User has P1. Bot 7 has P0. 
      // This matches "Passing Left" (pack moves to lower index? No, pack moves to higher index/next player).

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
        // Re-generate packs for new round
        // Note: Bots keep their state/pool/archetypes!
        for (let i = 0; i < 8; i++) {
          state.packs.push(generateBoosterPackData(allCards.value))
        }
      }
    }
  }

  function endDraft() {
    state.active = false
    state.isReviewingPool = true
    // Log bot archetypes for debugging/curiosity
    console.log("Draft Ended. Bot Results:")
    state.bots.forEach((bot, idx) => {
      console.log(`Bot ${idx + 1}: ${bot.archetype.join('/')} (${bot.pool.length} cards)`)
    })
  }

  function closeDraft() {
    state.isOpen = false
    state.active = false
    state.isReviewingPool = false
    state.bots = [] // Reset bots
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
