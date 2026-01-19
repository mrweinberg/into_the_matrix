import { describe, it, expect } from 'vitest'
import { calculateCMC, determineColorClass, getCardColors, sortCards } from '@/utils/cardUtils'

describe('calculateCMC', () => {
    it('calculates CMC for simple costs', () => {
        expect(calculateCMC('{1}{W}')).toBe(2)
        expect(calculateCMC('{2}{U}{U}')).toBe(4)
        expect(calculateCMC('{B}')).toBe(1)
    })

    it('handles generic mana', () => {
        expect(calculateCMC('{5}')).toBe(5)
        expect(calculateCMC('{10}')).toBe(10)
    })

    it('handles X costs', () => {
        expect(calculateCMC('{X}{R}{R}')).toBe(2)
    })

    it('handles empty/null cost', () => {
        expect(calculateCMC('')).toBe(0)
        expect(calculateCMC(null)).toBe(0)
    })

    it('handles hybrid mana', () => {
        expect(calculateCMC('{W/U}{W/U}')).toBe(2)
        // {2/W} contains '2' which parses as 2 generic mana in our implementation
        expect(calculateCMC('{2/W}')).toBe(2)
    })
})

describe('determineColorClass', () => {
    it('detects single colors', () => {
        expect(determineColorClass({ cost: '{W}', type: 'Creature' })).toBe('W')
        expect(determineColorClass({ cost: '{1}{U}', type: 'Instant' })).toBe('U')
        expect(determineColorClass({ cost: '{2}{B}{B}', type: 'Sorcery' })).toBe('B')
    })

    it('detects multicolor as Gold', () => {
        expect(determineColorClass({ cost: '{W}{U}', type: 'Creature' })).toBe('Gold')
        expect(determineColorClass({ cost: '{1}{B}{R}{G}', type: 'Enchantment' })).toBe('Gold')
    })

    it('detects colorless as Artifact', () => {
        expect(determineColorClass({ cost: '{3}', type: 'Artifact Creature' })).toBe('Artifact')
        expect(determineColorClass({ cost: '{0}', type: 'Artifact' })).toBe('Artifact')
    })

    it('detects lands', () => {
        expect(determineColorClass({ cost: '', type: 'Land' })).toBe('Land')
        expect(determineColorClass({ cost: '', type: 'Basic Land — Forest' })).toBe('Land')
    })
})

describe('getCardColors', () => {
    it('extracts colors from mana cost', () => {
        expect(getCardColors({ cost: '{W}{U}' })).toEqual(expect.arrayContaining(['W', 'U']))
        expect(getCardColors({ cost: '{1}{R}' })).toEqual(['R'])
    })

    it('handles hybrid mana', () => {
        const colors = getCardColors({ cost: '{W/U}' })
        expect(colors).toContain('W')
        expect(colors).toContain('U')
    })

    it('uses colorIndicator for back faces', () => {
        const colors = getCardColors({ cost: '', colorIndicator: 'wu' })
        expect(colors).toContain('W')
        expect(colors).toContain('U')
    })

    it('returns empty array for colorless', () => {
        expect(getCardColors({ cost: '{3}' })).toEqual([])
    })
})

describe('sortCards', () => {
    const cards = [
        { id: 'C01', name: 'Beta Card', cost: '{2}{W}', type: 'Creature', rarity: 'Common' },
        { id: 'R02', name: 'Alpha Card', cost: '{1}{U}', type: 'Instant', rarity: 'Rare' },
        { id: 'U03', name: 'Gamma Card', cost: '{3}{B}{B}', type: 'Sorcery', rarity: 'Uncommon' },
    ]

    it('sorts by name', () => {
        const sorted = sortCards(cards, 'name')
        expect(sorted[0].name).toBe('Alpha Card')
        expect(sorted[1].name).toBe('Beta Card')
    })

    it('sorts by mana value', () => {
        const sorted = sortCards(cards, 'mana')
        expect(sorted[0].cost).toBe('{1}{U}') // CMC 2
        expect(sorted[1].cost).toBe('{2}{W}') // CMC 3
    })

    it('respects sort direction', () => {
        const asc = sortCards(cards, 'name', 'asc')
        const desc = sortCards(cards, 'name', 'desc')
        expect(asc[0].name).toBe('Alpha Card')
        expect(desc[0].name).toBe('Gamma Card')
    })
})
