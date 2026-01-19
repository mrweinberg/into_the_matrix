import { describe, it, expect, beforeEach } from 'vitest'
import { useFilters } from '@/composables/useFilters'
import { ref } from 'vue'

describe('useFilters', () => {
    // Mock card data
    const mockCards = ref([
        { id: 'C01', name: 'White Knight', cost: '{1}{W}', type: 'Creature — Human Knight', rarity: 'Common', isBackFace: false, text: ['First strike'] },
        { id: 'C02', name: 'Blue Wizard', cost: '{2}{U}', type: 'Creature — Human Wizard', rarity: 'Common', isBackFace: false, text: ['Draw a card'] },
        { id: 'C03', name: 'Black Rogue', cost: '{1}{B}', type: 'Creature — Human Rogue', rarity: 'Common', isBackFace: false, text: ['Deathtouch'] },
        { id: 'U01', name: 'Red Dragon', cost: '{4}{R}{R}', type: 'Creature — Dragon', rarity: 'Uncommon', isBackFace: false, text: ['Flying', 'Haste'] },
        { id: 'U02', name: 'Green Giant', cost: '{5}{G}', type: 'Creature — Giant', rarity: 'Uncommon', isBackFace: false, text: ['Trample'] },
        { id: 'R01', name: 'Gold Champion', cost: '{1}{W}{U}', type: 'Creature — Human Champion', rarity: 'Rare', isBackFace: false, text: ['Vigilance'] },
        { id: 'R02', name: 'Colorless Golem', cost: '{4}', type: 'Artifact Creature — Golem', rarity: 'Rare', isBackFace: false, text: [] },
        { id: 'L01', name: 'Forest', cost: '', type: 'Basic Land — Forest', rarity: 'Land', isBackFace: false, text: ['{T}: Add {G}.'] },
        { id: 'B01', name: 'Back Face', cost: '', type: 'Creature', rarity: 'Common', isBackFace: true, text: [] },
    ])

    describe('searchText filter', () => {
        it('filters cards by name', () => {
            const { searchText, filteredCards } = useFilters(mockCards)

            searchText.value = 'Knight'

            expect(filteredCards.value.length).toBe(1)
            expect(filteredCards.value[0].name).toBe('White Knight')
        })

        it('filters cards by text (case insensitive)', () => {
            const { searchText, filteredCards } = useFilters(mockCards)

            searchText.value = 'dragon'

            expect(filteredCards.value.length).toBe(1)
            expect(filteredCards.value[0].name).toBe('Red Dragon')
        })

        it('returns all cards when search is empty', () => {
            const { searchText, filteredCards } = useFilters(mockCards)

            searchText.value = ''

            // Should exclude back faces
            expect(filteredCards.value.length).toBe(8)
        })
    })

    describe('rarity filter', () => {
        it('filters by specific rarity', () => {
            const { rarity, filteredCards } = useFilters(mockCards)

            rarity.value = 'Uncommon'

            expect(filteredCards.value.length).toBe(2)
            expect(filteredCards.value.every(c => c.rarity === 'Uncommon')).toBe(true)
        })

        it('shows all when rarity is "All"', () => {
            const { rarity, filteredCards } = useFilters(mockCards)

            rarity.value = 'All'

            expect(filteredCards.value.length).toBe(8)
        })
    })

    describe('typeText filter', () => {
        it('filters by type', () => {
            const { typeText, filteredCards } = useFilters(mockCards)

            typeText.value = 'Human'

            expect(filteredCards.value.length).toBe(4) // Knight, Wizard, Rogue, Champion
        })

        it('matches partial type strings', () => {
            const { typeText, filteredCards } = useFilters(mockCards)

            typeText.value = 'Artifact'

            expect(filteredCards.value.length).toBe(1)
            expect(filteredCards.value[0].name).toBe('Colorless Golem')
        })
    })

    describe('toggleColor', () => {
        it('toggles a color on', () => {
            const { activeColors, toggleColor } = useFilters(mockCards)

            toggleColor('W')

            expect(activeColors.value).toContain('W')
        })

        it('toggles a color off when already active', () => {
            const { activeColors, toggleColor } = useFilters(mockCards)

            toggleColor('W')
            toggleColor('W')

            expect(activeColors.value).not.toContain('W')
        })

        it('allows multiple colors to be selected', () => {
            const { activeColors, toggleColor } = useFilters(mockCards)

            toggleColor('W')
            toggleColor('U')

            expect(activeColors.value).toContain('W')
            expect(activeColors.value).toContain('U')
        })

        it('clears other colors when selecting Land', () => {
            const { activeColors, toggleColor } = useFilters(mockCards)

            toggleColor('W')
            toggleColor('Land')

            expect(activeColors.value).toEqual(['Land'])
        })

        it('clears exclusive type when selecting a color', () => {
            const { activeColors, toggleColor } = useFilters(mockCards)

            toggleColor('Land')
            toggleColor('W')

            expect(activeColors.value).toEqual(['W'])
        })
    })

    describe('color filtering logic', () => {
        it('filters to single color cards', () => {
            const { activeColors, toggleColor, filteredCards } = useFilters(mockCards)

            toggleColor('W')

            expect(filteredCards.value.every(c => c.cost.includes('{W}'))).toBe(true)
        })

        it('filters to Artifact (colorless) cards', () => {
            const { toggleColor, filteredCards } = useFilters(mockCards)

            toggleColor('Artifact')

            expect(filteredCards.value.length).toBe(1)
            expect(filteredCards.value[0].name).toBe('Colorless Golem')
        })

        it('filters to Land cards', () => {
            const { toggleColor, filteredCards } = useFilters(mockCards)

            toggleColor('Land')

            expect(filteredCards.value.length).toBe(1)
            expect(filteredCards.value[0].name).toBe('Forest')
        })
    })

    describe('resetFilters', () => {
        it('resets all filters to default', () => {
            const { searchText, rarity, activeColors, toggleColor, resetFilters, filteredCards } = useFilters(mockCards)

            searchText.value = 'Dragon'
            rarity.value = 'Rare'
            toggleColor('R')

            resetFilters()

            expect(searchText.value).toBe('')
            expect(rarity.value).toBe('All')
            expect(activeColors.value).toEqual([])
            expect(filteredCards.value.length).toBe(8)
        })
    })

    describe('back face exclusion', () => {
        it('always excludes back faces from results', () => {
            const { filteredCards } = useFilters(mockCards)

            const backFaces = filteredCards.value.filter(c => c.isBackFace)

            expect(backFaces.length).toBe(0)
        })
    })
})
