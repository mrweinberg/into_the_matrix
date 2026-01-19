import { describe, it, expect } from 'vitest'
import { replaceSymbols } from '@/utils/manaSymbols'

describe('replaceSymbols', () => {
    describe('basic mana symbols', () => {
        it('replaces {W} with white mana icon', () => {
            const result = replaceSymbols('{W}')
            expect(result).toContain('ms-w')
            expect(result).toContain('ms-cost')
        })

        it('replaces {U} with blue mana icon', () => {
            expect(replaceSymbols('{U}')).toContain('ms-u')
        })

        it('replaces {B} with black mana icon', () => {
            expect(replaceSymbols('{B}')).toContain('ms-b')
        })

        it('replaces {R} with red mana icon', () => {
            expect(replaceSymbols('{R}')).toContain('ms-r')
        })

        it('replaces {G} with green mana icon', () => {
            expect(replaceSymbols('{G}')).toContain('ms-g')
        })

        it('replaces {C} with colorless mana icon', () => {
            expect(replaceSymbols('{C}')).toContain('ms-c')
        })
    })

    describe('generic mana', () => {
        it('replaces {1} with generic mana icon', () => {
            expect(replaceSymbols('{1}')).toContain('ms-1')
        })

        it('replaces {5} with generic mana icon', () => {
            expect(replaceSymbols('{5}')).toContain('ms-5')
        })

        it('replaces {10} with generic mana icon', () => {
            expect(replaceSymbols('{10}')).toContain('ms-10')
        })
    })

    describe('special symbols', () => {
        it('replaces {E} with energy icon', () => {
            expect(replaceSymbols('{E}')).toContain('ms-e')
        })

        it('replaces {T} with tap icon', () => {
            expect(replaceSymbols('{T}')).toContain('ms-tap')
        })

        it('replaces {Q} with untap icon', () => {
            expect(replaceSymbols('{Q}')).toContain('ms-untap')
        })

        it('replaces {X} with X icon', () => {
            expect(replaceSymbols('{X}')).toContain('ms-x')
        })

        it('replaces {S} with snow mana icon', () => {
            expect(replaceSymbols('{S}')).toContain('ms-s')
        })
    })

    describe('hybrid mana', () => {
        it('replaces {W/U} with hybrid icon', () => {
            const result = replaceSymbols('{W/U}')
            expect(result).toContain('ms-wu')
        })

        it('replaces {B/R} with hybrid icon', () => {
            expect(replaceSymbols('{B/R}')).toContain('ms-br')
        })
    })

    describe('phyrexian mana', () => {
        it('replaces {W/P} with phyrexian white icon', () => {
            expect(replaceSymbols('{W/P}')).toContain('ms-pw')
        })

        it('replaces {R/P} with phyrexian red icon', () => {
            expect(replaceSymbols('{R/P}')).toContain('ms-pr')
        })
    })

    describe('twobrid mana', () => {
        it('replaces {2/W} with twobrid white icon', () => {
            expect(replaceSymbols('{2/W}')).toContain('ms-2w')
        })

        it('replaces {2/U} with twobrid blue icon', () => {
            expect(replaceSymbols('{2/U}')).toContain('ms-2u')
        })
    })

    describe('complex costs', () => {
        it('handles multiple symbols in one string', () => {
            const result = replaceSymbols('{2}{W}{W}')
            expect(result).toContain('ms-2')
            expect(result).toContain('ms-w')
            // Should have multiple icons
            expect(result.match(/ms-cost/g).length).toBe(3)
        })

        it('handles mixed symbol types', () => {
            const result = replaceSymbols('{1}{W/U}{T}: Create a token.')
            expect(result).toContain('ms-1')
            expect(result).toContain('ms-wu')
            expect(result).toContain('ms-tap')
            expect(result).toContain('Create a token.')
        })
    })

    describe('edge cases', () => {
        it('returns empty string for null input', () => {
            expect(replaceSymbols(null)).toBe('')
        })

        it('returns empty string for undefined input', () => {
            expect(replaceSymbols(undefined)).toBe('')
        })

        it('returns empty string for empty input', () => {
            expect(replaceSymbols('')).toBe('')
        })

        it('leaves non-symbol text unchanged', () => {
            expect(replaceSymbols('Draw a card.')).toBe('Draw a card.')
        })
    })
})
