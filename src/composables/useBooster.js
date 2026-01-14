import { ref } from 'vue'
import { generateBoosterPackData, sortPackByRarity } from '@/utils/boosterLogic'

export function useBooster(allCards) {
  const currentPack = ref([])
  const isOpen = ref(false)

  function openPack() {
    currentPack.value = sortPackByRarity(generateBoosterPackData(allCards.value))
    isOpen.value = true
  }

  function closePack() {
    isOpen.value = false
  }

  return {
    currentPack,
    isOpen,
    openPack,
    closePack
  }
}
