import { determineColorClass } from '@/utils/cardUtils'

export class DraftBot {
    constructor(id) {
        this.id = id
        this.pool = []
        // Map of color ('W', 'U', 'B', 'R', 'G') to count of cards picked
        this.colors = { W: 0, U: 0, B: 0, R: 0, G: 0 }
        this.archetype = [] // Top 2 colors
    }

    // Returns the index of the card to pick from the pack
    pick(pack) {
        if (!pack || pack.length === 0) return -1

        let bestScore = -1
        let bestIndex = -1

        pack.forEach((card, index) => {
            const score = this.evaluateCard(card)
            // Add a tiny random variance to break ties
            const finalScore = score + (Math.random() * 0.1)

            if (finalScore > bestScore) {
                bestScore = finalScore
                bestIndex = index
            }
        })

        // If we picked a card, add it to our pool and update our state
        if (bestIndex !== -1) {
            this.updateState(pack[bestIndex])
        }

        return bestIndex
    }

    evaluateCard(card) {
        // 1. Base Score by Rarity (Power Level approximation)
        let score = 0
        switch (card.rarity) {
            case 'Mythic': score = 4.5; break
            case 'Rare': score = 4.0; break
            case 'Uncommon': score = 2.5; break
            case 'Common': score = 1.0; break
            case 'Land': score = 0.5; break // Basic lands usually low prio unless fixing
            default: score = 1.0
        }

        // 2. Color Bias
        // If we have an established archetype (picked >= 3 cards), prioritize on-color cards
        const cardColors = this.getCardColors(card)

        // Penalize multicolored cards if we aren't in those colors early on
        if (cardColors.length > 1 && this.pool.length < 5) {
            score -= 0.5
        }

        // Bonus for matching our top colors
        if (this.pool.length > 0) {
            const matchCount = cardColors.filter(c => this.archetype.includes(c)).length
            if (matchCount > 0) {
                // Higher bonus as we get deeper into the draft
                const commitmentFactor = Math.min(this.pool.length / 10, 2.0)
                score += (matchCount * 1.5 * commitmentFactor)
            }
        }

        // Fixed Color value (Lands usually don't have coloridentity valid for this unless checked properly)
        // For now simplistic check
        return score
    }

    updateState(card) {
        this.pool.push(card)

        // Update color counts
        const cardColors = this.getCardColors(card)
        cardColors.forEach(c => {
            if (this.colors[c] !== undefined) {
                this.colors[c]++
            }
        })

        // Recalculate Archetype (Top 2 colors)
        this.archetype = Object.entries(this.colors)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([color]) => color)
    }

    getCardColors(card) {
        const colorClass = determineColorClass(card)
        if (colorClass === 'Gold' || colorClass === 'Multicolor') {
            // Simplistic parsing of mana cost for gold cards if not explicitly tagged
            // Ideally we'd use card.colors or parse cost. 
            // Assuming 'cost' exists e.g., "{1}{W}{U}"
            const found = []
            if (card.cost.includes('{W}')) found.push('W')
            if (card.cost.includes('{U}')) found.push('U')
            if (card.cost.includes('{B}')) found.push('B')
            if (card.cost.includes('{R}')) found.push('R')
            if (card.cost.includes('{G}')) found.push('G')
            return found
        }
        if (this.colors[colorClass] !== undefined) {
            return [colorClass]
        }
        return []
    }
}
