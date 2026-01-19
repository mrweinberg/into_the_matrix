import { describe, it, expect, beforeEach } from 'vitest'
import { useDeckBuilder } from '@/composables/useDeckBuilder'

describe('useDeckBuilder', () => {
    const mockPool = [
        { id: 'C01', name: 'Card One', cost: '{1}{W}', type: 'Creature', rarity: 'Common' },
        { id: 'C02', name: 'Card Two', cost: '{2}{U}', type: 'Instant', rarity: 'Common' },
        { id: 'U01', name: 'Card Three', cost: '{3}{B}', type: 'Sorcery', rarity: 'Uncommon' },
    ]

    describe('addToDeck', () => {
        it('moves card from pool to deck', () => {
            const { pool, mainDeck, addToDeck } = useDeckBuilder([...mockPool])

            expect(pool.value.length).toBe(3)
            expect(mainDeck.value.length).toBe(0)

            addToDeck('C01')

            expect(pool.value.length).toBe(2)
            expect(mainDeck.value.length).toBe(1)
            expect(mainDeck.value[0].id).toBe('C01')
        })

        it('does nothing if card not found', () => {
            const { pool, mainDeck, addToDeck } = useDeckBuilder([...mockPool])

            addToDeck('NONEXISTENT')

            expect(pool.value.length).toBe(3)
            expect(mainDeck.value.length).toBe(0)
        })
    })

    describe('removeFromDeck', () => {
        it('moves card from deck back to pool', () => {
            const { pool, mainDeck, addToDeck, removeFromDeck } = useDeckBuilder([...mockPool])

            addToDeck('C01')
            expect(mainDeck.value.length).toBe(1)

            removeFromDeck(0)

            expect(mainDeck.value.length).toBe(0)
            expect(pool.value.length).toBe(3)
        })
    })

    describe('basicLands', () => {
        it('adds basic lands', () => {
            const { basicLands, addBasicLand } = useDeckBuilder([])

            expect(basicLands.value.Plains).toBe(0)

            addBasicLand('Plains')
            addBasicLand('Plains')

            expect(basicLands.value.Plains).toBe(2)
        })

        it('removes basic lands', () => {
            const { basicLands, addBasicLand, removeBasicLand } = useDeckBuilder([])

            addBasicLand('Island')
            addBasicLand('Island')
            removeBasicLand('Island')

            expect(basicLands.value.Island).toBe(1)
        })

        it('does not go below zero', () => {
            const { basicLands, removeBasicLand } = useDeckBuilder([])

            removeBasicLand('Forest')

            expect(basicLands.value.Forest).toBe(0)
        })
    })

    describe('totalMainCount', () => {
        it('counts deck cards plus basic lands', () => {
            const { addToDeck, addBasicLand, totalMainCount } = useDeckBuilder([...mockPool])

            addToDeck('C01')
            addToDeck('C02')
            addBasicLand('Plains')
            addBasicLand('Plains')
            addBasicLand('Island')

            expect(totalMainCount.value).toBe(5)
        })
    })

    describe('initialization with existing deck', () => {
        it('restores deck state', () => {
            const existingDeck = [{ id: 'C01', name: 'Card One' }]
            const existingLands = { Plains: 3, Island: 2, Swamp: 0, Mountain: 0, Forest: 0 }

            const { mainDeck, basicLands, totalMainCount } = useDeckBuilder(
                [mockPool[1], mockPool[2]], // Pool without C01
                existingDeck,
                existingLands
            )

            expect(mainDeck.value.length).toBe(1)
            expect(basicLands.value.Plains).toBe(3)
            expect(totalMainCount.value).toBe(6)
        })
    })
})
