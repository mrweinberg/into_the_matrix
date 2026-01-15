import { ref, computed } from 'vue'
import { calculateCMC } from '@/utils/cardUtils'

export function useDeckBuilder(initialPool = [], initialDeck = null, initialBasicLands = null) {
    // initialPool should already have deck cards filtered out when restoring
    const pool = ref([...initialPool])
    const mainDeck = ref(initialDeck ? [...initialDeck] : [])
    const basicLands = ref(initialBasicLands ? { ...initialBasicLands } : {
        Plains: 0,
        Island: 0,
        Swamp: 0,
        Mountain: 0,
        Forest: 0
    })

    const basicLandCards = {
        Plains: { id: 'PL', name: 'Plains', type: 'Basic Land — Plains', displayType: 'Basic Land — Plains', rarity: 'Land', cost: '', cmc: 0, colorIndicator: 'w', fileName: 'plains.jpg' },
        Island: { id: 'IS', name: 'Island', type: 'Basic Land — Island', displayType: 'Basic Land — Island', rarity: 'Land', cost: '', cmc: 0, colorIndicator: 'u', fileName: 'island.jpg' },
        Swamp: { id: 'SW', name: 'Swamp', type: 'Basic Land — Swamp', displayType: 'Basic Land — Swamp', rarity: 'Land', cost: '', cmc: 0, colorIndicator: 'b', fileName: 'swamp.jpg' },
        Mountain: { id: 'MO', name: 'Mountain', type: 'Basic Land — Mountain', displayType: 'Basic Land — Mountain', rarity: 'Land', cost: '', cmc: 0, colorIndicator: 'r', fileName: 'mountain.jpg' },
        Forest: { id: 'FO', name: 'Forest', type: 'Basic Land — Forest', displayType: 'Basic Land — Forest', rarity: 'Land', cost: '', cmc: 0, colorIndicator: 'g', fileName: 'forest.jpg' }
    }

    const addToDeck = (cardId) => {
        const cardIndex = pool.value.findIndex(c => c.id === cardId)
        if (cardIndex !== -1) {
            mainDeck.value.push(pool.value[cardIndex])
            pool.value.splice(cardIndex, 1)
        }
    }

    const removeFromDeck = (cardIndex) => {
        const card = mainDeck.value[cardIndex]
        pool.value.push(card)
        mainDeck.value.splice(cardIndex, 1)
    }

    const addBasicLand = (type) => {
        if (basicLands.value[type] !== undefined) {
            basicLands.value[type]++
        }
    }

    const removeBasicLand = (type) => {
        if (basicLands.value[type] > 0) {
            basicLands.value[type]--
        }
    }

    const groupedPool = computed(() => {
        const groups = new Map()
        pool.value.forEach(card => {
            if (!groups.has(card.name)) {
                groups.set(card.name, { ...card, count: 0, ids: [] })
            }
            const g = groups.get(card.name)
            g.count++
            g.ids.push(card.id)
        })
        return Array.from(groups.values())
    })

    const deckByCMC = computed(() => {
        const groups = {
            '0': [],
            '1': [],
            '2': [],
            '3': [],
            '4': [],
            '5+': [],
            'Lands': []
        }

        // Helper to group items within a category
        const groupItems = (items) => {
            const grouped = new Map()
            items.forEach(item => {
                const key = item.isBasic ? item.type : item.name
                if (!grouped.has(key)) {
                    grouped.set(key, { ...item, count: 0, deckIndexes: [] })
                }
                const g = grouped.get(key)
                g.count++
                if (!item.isBasic) g.deckIndexes.push(item.deckIndex)
            })
            return Array.from(grouped.values())
        }

        const rawGroups = {
            '0': [], '1': [], '2': [], '3': [], '4': [], '5+': [], 'Lands': []
        }

        // Add normal cards
        mainDeck.value.forEach((card, index) => {
            const isLand = card.type.toLowerCase().includes('land')
            if (isLand) {
                rawGroups['Lands'].push({ ...card, deckIndex: index })
            } else {
                const cmc = calculateCMC(card.cost)
                const key = cmc >= 5 ? '5+' : cmc.toString()
                if (rawGroups[key]) {
                    rawGroups[key].push({ ...card, deckIndex: index })
                } else {
                    rawGroups['5+'].push({ ...card, deckIndex: index })
                }
            }
        })

        // Add basic lands to Lands group
        Object.entries(basicLands.value).forEach(([type, count]) => {
            for (let i = 0; i < count; i++) {
                rawGroups['Lands'].push({ ...basicLandCards[type], isBasic: true, type })
            }
        })

        // Group the results
        Object.keys(groups).forEach(key => {
            groups[key] = groupItems(rawGroups[key])
        })

        return groups
    })

    const totalMainCount = computed(() => {
        const basicsCount = Object.values(basicLands.value).reduce((a, b) => a + b, 0)
        return mainDeck.value.length + basicsCount
    })

    const exportDeck = () => {
        const counts = new Map()

        // Count non-basic cards
        mainDeck.value.forEach(c => {
            counts.set(c.name, (counts.get(c.name) || 0) + 1)
        })

        // Add basics
        Object.entries(basicLands.value).forEach(([type, count]) => {
            if (count > 0) {
                counts.set(type, (counts.get(type) || 0) + count)
            }
        })

        let text = ''
        counts.forEach((count, name) => {
            text += `${count} ${name}\n`
        })

        const blob = new Blob([text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'matrix-deck.txt'
        a.click()
        URL.revokeObjectURL(url)
    }

    return {
        pool,
        groupedPool,
        mainDeck,
        basicLands,
        addToDeck,
        removeFromDeck,
        addBasicLand,
        removeBasicLand,
        deckByCMC,
        totalMainCount,
        exportDeck
    }
}
