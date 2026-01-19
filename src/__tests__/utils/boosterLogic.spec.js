import { describe, it, expect } from 'vitest'
import { generateBoosterPackData, sortPackByRarity } from '@/utils/boosterLogic'

// Mock card data for testing
const mockCards = []
const rarities = ['Common', 'Uncommon', 'Rare', 'Mythic']
const colors = ['W', 'U', 'B', 'R', 'G']

// Generate mock cards
for (let i = 0; i < 200; i++) {
    const rarity = rarities[i % 4]
    const color = colors[i % 5]
    mockCards.push({
        id: `${rarity[0]}${i.toString().padStart(3, '0')}`,
        name: `Test Card ${i}`,
        cost: `{1}{${color}}`,
        type: 'Creature — Human',
        rarity,
        isBackFace: false,
    })
}

describe('generateBoosterPackData', () => {
    it('generates a valid booster pack', () => {
        const pack = generateBoosterPackData(mockCards)
        // Pack size is typically 14-15 depending on land slot
        expect(pack.length).toBeGreaterThanOrEqual(14)
        expect(pack.length).toBeLessThanOrEqual(15)
    })

    it('contains at least 1 rare or mythic', () => {
        const pack = generateBoosterPackData(mockCards)
        const rareOrMythic = pack.filter(c => c.rarity === 'Rare' || c.rarity === 'Mythic')
        expect(rareOrMythic.length).toBeGreaterThanOrEqual(1)
    })

    it('contains commons', () => {
        const pack = generateBoosterPackData(mockCards)
        const commons = pack.filter(c => c.rarity === 'Common')
        expect(commons.length).toBeGreaterThan(0)
    })

    it('contains uncommons', () => {
        const pack = generateBoosterPackData(mockCards)
        const uncommons = pack.filter(c => c.rarity === 'Uncommon')
        expect(uncommons.length).toBeGreaterThan(0)
    })

    it('excludes back faces', () => {
        const cardsWithBackFace = [
            ...mockCards,
            { id: 'B001', name: 'Back Face', rarity: 'Common', isBackFace: true }
        ]
        const pack = generateBoosterPackData(cardsWithBackFace)
        const backFaces = pack.filter(c => c.isBackFace)
        expect(backFaces.length).toBe(0)
    })
})

describe('sortPackByRarity', () => {
    it('sorts cards with rares/mythics first', () => {
        const unsortedPack = [
            { name: 'Common1', rarity: 'Common' },
            { name: 'Rare1', rarity: 'Rare' },
            { name: 'Uncommon1', rarity: 'Uncommon' },
            { name: 'Mythic1', rarity: 'Mythic' },
        ]
        const sorted = sortPackByRarity(unsortedPack)
        expect(sorted[0].rarity).toBe('Mythic')
        expect(sorted[1].rarity).toBe('Rare')
    })
})
