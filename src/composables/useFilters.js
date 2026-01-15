import { ref, computed } from 'vue'
import { determineColorClass, getCardColors, calculateCMC } from '@/utils/cardUtils'

export function useFilters(cards) {
  const searchText = ref('')
  const rarity = ref('All')
  const typeText = ref('')
  const activeColors = ref([])
  const activeMVs = ref([])

  const filteredCards = computed(() => {
    return cards.value.filter(card => {
      if (card.isBackFace) return false

      const searchLower = searchText.value.toLowerCase()
      const matchSearch = searchLower === '' ||
        card.name.toLowerCase().includes(searchLower) ||
        card.text.join(' ').toLowerCase().includes(searchLower)

      const matchRarity = rarity.value === 'All' || card.rarity === rarity.value

      const typeLower = typeText.value.toLowerCase()
      const matchType = typeLower === '' ||
        card.type.toLowerCase().includes(typeLower)

      // Complex Color Logic
      // 1. Exclusive categories check (Land, Artifact)
      // 2. Color subset check (W, U, Gold)

      let matchColor = true

      const exclusiveTypes = ['Land', 'Artifact']
      const activeExclusive = activeColors.value.filter(c => exclusiveTypes.includes(c))
      const activeBasic = activeColors.value.filter(c => !exclusiveTypes.includes(c) && c !== 'Gold')
      const wantsGold = activeColors.value.includes('Gold')

      // Case 1: Exclusive Type Selected (Land or Artifact)
      // If mulitple exclusive types selected (unlikely via UI but possible), we just need to match ONE of them?
      // Or usually exclusive implies strict mode. Let's follow determineColorClass for these.
      if (activeExclusive.length > 0) {
        const cardClass = determineColorClass(card)
        matchColor = activeExclusive.includes(cardClass)
        // If "Gold" or colors are ALSO selected, should we filter further?
        // Usually Land/Artifact toggles are standalone buttons.
        // Let's assume if Land is selected, we only show Lands.
        // If Land AND W selected? Maybe W Lands?
        // User asked for "Multicolor toggle to work with other toggles".
        // Let's allow Basic Colors to refine Exclusive types if needed, 
        // e.g. Artifact + W = White Artifacts.
        // But currently determineColorClass returns "Artifact" OR "W".
        // So a White Artifact returns ???
        // CardUtils: if colorsFound=0 -> Artifact. If W -> W.
        // So determineColorClass is mutually exclusive.
        // Thus if valid logic is to be supported, we should check type directly.
        // Re-reading cardUtils:
        // if type includes land -> Land
        // if colors > 1 -> Gold
        // if colors == 0 -> Artifact
        // else -> Color

        // So a White Artifact (colors=1) returns 'W'.
        // If I select 'Artifact', standard logic expects 'Artifact' class (colorless).
        // Let's stick to existing exclusive behavior for Land/Artifact unless user asks.
        // Existing behavior: matchColor = activeColors.includes(cardColor).
        // So if I select Artifact, I see colorless artifacts.
        // If I select W, I see White Artifacts (because they return W).
      }
      // Case 2: No Exclusive (Colors / Gold)
      // Case 2: No Exclusive (Colors / Gold)
      else if (activeBasic.length > 0 || wantsGold) {
        const cardColors = getCardColors(card)
        const isGold = cardColors.length > 1

        // Check 1: Gold Constraint
        if (wantsGold && !isGold) return false

        // Check 2: Color Logic
        if (activeBasic.length > 0) {
          if (wantsGold) {
            // SUPERSET Logic: "Includes all cards including the colors selected"
            // The card keys must include ALL selected activeBasic keys.
            // Example active=[U], Gold=True. Card=UB (Active U in Card UB? Yes). Result: Show.
            // Example active=[W,U], Gold=True. Card=WUB (Active W,U in Card WUB? Yes). Result: Show.
            const isSuperset = activeBasic.every(c => cardColors.includes(c))
            if (!isSuperset) return false
          } else {
            // SUBSET Logic: "W, U -> see only W, U, WU cards"
            // The card keys must be completely contained in activeBasic keys.
            // Example active=[W,U]. Card=W (in WU? Yes). Card=WU (in WU? Yes). Card=WUB (in WU? No).
            const isSubset = cardColors.length > 0 && cardColors.every(c => activeBasic.includes(c))

            // Edge case: Colorless cards shouldn't match color filter unless specifically handled?
            // Currently isSubset checks cardColors.length > 0.
            if (!isSubset) return false
          }
        }
      }
      // Case 3: Nothing selected
      else {
        matchColor = true
      }

      // Mana Value filter
      let matchMV = true
      if (activeMVs.value.length > 0) {
        const cmc = calculateCMC(card.cost)
        const cmcKey = cmc >= 5 ? '5+' : cmc.toString()
        matchMV = activeMVs.value.includes(cmcKey)
      }

      return matchSearch && matchRarity && matchType && matchColor && matchMV
    })
  })

  function toggleColor(color) {
    // Exclusive categories that CLEAR others when selected?
    // User wants Gold to mix.
    // Let's keep Land and Artifact exclusive for now as they represent "Types" vs "Colors".
    const exclusive = ['Land', 'Artifact']

    // If clicking an exclusive type
    if (exclusive.includes(color)) {
      if (activeColors.value.includes(color)) {
        activeColors.value = []
      } else {
        // Clear all filters, set this exclusive one
        activeColors.value = [color]
      }
      return
    }

    // If clicking a Basic Color or Gold
    // First, clear any exclusive types (Land/Artifact) if strictly switching?
    // Or just remove them.
    const hasExclusive = activeColors.value.some(c => exclusive.includes(c))
    if (hasExclusive) {
      // If we were in Land mode, and click W -> Switch to W (clear Land)
      activeColors.value = [color]
      return
    }

    // Standard Toggle
    const index = activeColors.value.indexOf(color)
    if (index > -1) {
      activeColors.value.splice(index, 1)
    } else {
      activeColors.value.push(color)
    }
  }

  function toggleMV(mv) {
    const index = activeMVs.value.indexOf(mv)
    if (index > -1) {
      activeMVs.value.splice(index, 1)
    } else {
      activeMVs.value.push(mv)
    }
  }

  function resetFilters() {
    searchText.value = ''
    rarity.value = 'All'
    typeText.value = ''
    activeColors.value = []
    activeMVs.value = []
  }

  return {
    searchText,
    rarity,
    typeText,
    activeColors,
    activeMVs,
    filteredCards,
    toggleColor,
    toggleMV,
    resetFilters
  }
}
