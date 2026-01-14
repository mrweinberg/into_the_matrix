import { ref, computed } from 'vue'
import { determineColorClass } from '@/utils/cardUtils'

export function useFilters(cards) {
  const searchText = ref('')
  const rarity = ref('All')
  const typeText = ref('')
  const activeColor = ref(null)

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

      const cardColor = determineColorClass(card)
      const matchColor = activeColor.value ? cardColor === activeColor.value : true

      return matchSearch && matchRarity && matchType && matchColor
    })
  })

  function toggleColor(color) {
    activeColor.value = activeColor.value === color ? null : color
  }

  function resetFilters() {
    searchText.value = ''
    rarity.value = 'All'
    typeText.value = ''
    activeColor.value = null
  }

  return {
    searchText,
    rarity,
    typeText,
    activeColor,
    filteredCards,
    toggleColor,
    resetFilters
  }
}
