import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sortCards } from '@/utils/cardUtils'

export const useCardStore = defineStore('cards', () => {
  const cards = ref([])
  const designNotes = ref('')
  const setInfo = ref({
    title: 'INTO THE MATRIX',
    cardCount: '0',
    mechanics: []
  })
  const isLoaded = ref(false)

  const frontFaceCards = computed(() =>
    cards.value.filter(c => !c.isBackFace)
  )

  const sortedCards = computed(() =>
    sortCards(frontFaceCards.value)
  )

  async function loadData() {
    try {
      const [cardsData, notesData, setInfoData] = await Promise.all([
        import('@/data/cards.json'),
        import('@/data/notes.json'),
        import('@/data/setInfo.json')
      ])

      cards.value = cardsData.default
      designNotes.value = notesData.default
      setInfo.value = setInfoData.default
      isLoaded.value = true
    } catch (error) {
      console.error('Failed to load card data:', error)
    }
  }

  function getCardById(id, backFace = false) {
    return cards.value.find(c => c.id === id && c.isBackFace === backFace)
  }

  function getBackFace(card) {
    if (!card.hasBackFace) return null
    return cards.value.find(c => c.id === card.id && c.isBackFace)
  }

  return {
    cards,
    designNotes,
    setInfo,
    isLoaded,
    frontFaceCards,
    sortedCards,
    loadData,
    getCardById,
    getBackFace
  }
})
