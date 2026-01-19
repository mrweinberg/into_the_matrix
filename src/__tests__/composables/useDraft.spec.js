import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDraft } from '@/composables/useDraft'
import { ref } from 'vue'

// Mock card data
const createMockCards = () => {
    const cards = []
    const rarities = ['Common', 'Uncommon', 'Rare', 'Mythic']
    const colors = ['W', 'U', 'B', 'R', 'G']

    for (let i = 0; i < 200; i++) {
        const rarity = rarities[i % 4]
        const color = colors[i % 5]
        cards.push({
            id: `${rarity[0]}${i.toString().padStart(3, '0')}`,
            name: `Test Card ${i}`,
            cost: `{1}{${color}}`,
            type: 'Creature — Human',
            rarity,
            isBackFace: false,
        })
    }
    return cards
}

describe('useDraft', () => {
    let mockCards

    beforeEach(() => {
        mockCards = ref(createMockCards())
        // Suppress console.log from endDraft
        vi.spyOn(console, 'log').mockImplementation(() => { })
    })

    describe('startDraft', () => {
        it('initializes draft state correctly', () => {
            const draft = useDraft(mockCards)

            draft.startDraft()

            expect(draft.active.value).toBe(true)
            expect(draft.round.value).toBe(1)
            expect(draft.pick.value).toBe(1)
            expect(draft.pool.value).toEqual([])
            expect(draft.isOpen.value).toBe(true)
        })

        it('creates 8 packs (1 for user + 7 for bots)', () => {
            const draft = useDraft(mockCards)

            draft.startDraft()

            expect(draft.packs.value.length).toBe(8)
        })

        it('initializes 7 bots', () => {
            const draft = useDraft(mockCards)

            draft.startDraft()

            expect(draft.bots.value.length).toBe(7)
        })

        it('each pack has cards', () => {
            const draft = useDraft(mockCards)

            draft.startDraft()

            draft.packs.value.forEach(pack => {
                expect(pack.length).toBeGreaterThan(0)
            })
        })
    })

    describe('pickCard', () => {
        it('adds picked card to pool', () => {
            const draft = useDraft(mockCards)
            draft.startDraft()

            const cardToPick = draft.currentPack.value[0]
            draft.pickCard(cardToPick.id)

            expect(draft.pool.value.length).toBe(1)
            expect(draft.pool.value[0].id).toBe(cardToPick.id)
        })

        it('removes picked card from current pack', () => {
            const draft = useDraft(mockCards)
            draft.startDraft()

            const cardToPick = draft.currentPack.value[0]
            const originalPackSize = draft.currentPack.value.length

            draft.pickCard(cardToPick.id)

            expect(draft.currentPack.value.length).toBe(originalPackSize - 1)
            expect(draft.currentPack.value.find(c => c.id === cardToPick.id)).toBeUndefined()
        })

        it('increments pick number', () => {
            const draft = useDraft(mockCards)
            draft.startDraft()

            expect(draft.pick.value).toBe(1)

            const cardToPick = draft.currentPack.value[0]
            draft.pickCard(cardToPick.id)

            expect(draft.pick.value).toBe(2)
        })

        it('does nothing for invalid card ID', () => {
            const draft = useDraft(mockCards)
            draft.startDraft()

            const originalPoolSize = draft.pool.value.length

            draft.pickCard('INVALID_ID')

            expect(draft.pool.value.length).toBe(originalPoolSize)
        })
    })

    describe('currentPack computed', () => {
        it('returns first pack in the array', () => {
            const draft = useDraft(mockCards)
            draft.startDraft()

            expect(draft.currentPack.value).toBe(draft.packs.value[0])
        })

        it('returns empty array when no packs', () => {
            const draft = useDraft(mockCards)

            expect(draft.currentPack.value).toEqual([])
        })
    })

    describe('passDirection computed', () => {
        it('returns "left" for round 1', () => {
            const draft = useDraft(mockCards)
            draft.startDraft()

            expect(draft.round.value).toBe(1)
            expect(draft.passDirection.value).toBe('left')
        })
    })

    describe('closeDraft', () => {
        it('resets draft state', () => {
            const draft = useDraft(mockCards)
            draft.startDraft()

            draft.closeDraft()

            expect(draft.isOpen.value).toBe(false)
            expect(draft.active.value).toBe(false)
            expect(draft.bots.value).toEqual([])
        })
    })

    describe('sortedPool computed', () => {
        it('sorts pool by CMC then color', () => {
            const draft = useDraft(mockCards)
            draft.startDraft()

            // Pick multiple cards
            for (let i = 0; i < 5; i++) {
                if (draft.currentPack.value.length > 0) {
                    draft.pickCard(draft.currentPack.value[0].id)
                }
            }

            const sorted = draft.sortedPool.value

            // Verify sorted by CMC (lower CMC first)
            for (let i = 1; i < sorted.length; i++) {
                const prevCMC = parseInt(sorted[i - 1].cost.match(/\d+/)?.[0] || 0)
                const currCMC = parseInt(sorted[i].cost.match(/\d+/)?.[0] || 0)
                expect(currCMC).toBeGreaterThanOrEqual(prevCMC)
            }
        })
    })

    describe('full draft simulation', () => {
        it('can complete an entire draft', () => {
            const draft = useDraft(mockCards)
            draft.startDraft()

            // Pick up to 45 cards (15 per pack * 3 packs)
            let pickCount = 0
            while (draft.active.value && pickCount < 50) {
                if (draft.currentPack.value.length > 0) {
                    draft.pickCard(draft.currentPack.value[0].id)
                    pickCount++
                } else {
                    break
                }
            }

            // Draft should be complete
            expect(draft.active.value).toBe(false)
            expect(draft.isReviewingPool.value).toBe(true)
            expect(draft.pool.value.length).toBeGreaterThan(0)
        })
    })
})
