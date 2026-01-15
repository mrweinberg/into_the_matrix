import { computed } from 'vue'
import { getCardColors, calculateCMC } from '@/utils/cardUtils'

// Color pair definitions with Matrix-themed archetype names
export const COLOR_PAIRS = [
  { id: 'WU', colors: ['W', 'U'], name: 'System Infiltration', guildName: 'Azorius' },
  { id: 'UB', colors: ['U', 'B'], name: 'Agent Control', guildName: 'Dimir' },
  { id: 'BR', colors: ['B', 'R'], name: 'Sentinel Aggro', guildName: 'Rakdos' },
  { id: 'RG', colors: ['R', 'G'], name: 'Bio-Electric Power', guildName: 'Gruul' },
  { id: 'GW', colors: ['G', 'W'], name: 'Zion Resistance', guildName: 'Selesnya' },
  { id: 'WB', colors: ['W', 'B'], name: 'Lifesucking Exiles', guildName: 'Orzhov' },
  { id: 'UR', colors: ['U', 'R'], name: 'Code Modification', guildName: 'Izzet' },
  { id: 'BG', colors: ['B', 'G'], name: 'Harvester Operations', guildName: 'Golgari' },
  { id: 'RW', colors: ['R', 'W'], name: 'Armed and Ready', guildName: 'Boros' },
  { id: 'GU', colors: ['G', 'U'], name: 'System Mastery', guildName: 'Simic' }
]

// Archetype descriptions (parsed from design notes)
export const ARCHETYPE_DESCRIPTIONS = {
  'WU': 'This archetype focuses on the Jack-in and Eject mechanics to gain value from transitioning between the Real World and the Matrix, allowing a flexible approach to both offense and defense.',
  'UB': 'A classic control shell that utilizes Digital creatures and the Override mechanic to possess and neutralize opponent threats.',
  'BR': 'An aggressive artifact-centric deck that focuses on Robot tribal to push through. It rewards you for sacrificing artifacts for value and using Energy to burn out opponents.',
  'RG': 'This deck focuses on generating large amounts of Energy {E} and spending it on massive "Real World" threats like Beasts and Vehicles. It aims to overwhelm the board with high-power creatures and trampling damage.',
  'GW': 'A "go-wide" strategy that boosts Non-Digital (Human) creatures. It utilizes Vigilance and Lifelink to stabilize the board and punish the Machines for attacking into Zion\'s defenses.',
  'WB': 'This archetype revolves around an attrition based strategy utilizing the Merovingian\'s exiles enabling you to gain life and utilize that lifegain.',
  'UR': 'A spells-matter and high-tech deck that uses Energy to power your spells or pay off casting them. It features Humans and Programs that grow or trigger abilities whenever you cast noncreature spells.',
  'BG': 'This archetype focuses on the graveyard and the recycling of resources. It uses Robot and Ooze creatures to gain value from death triggers and spends Energy to return threats to the battlefield.',
  'RW': 'The premier Vehicle and Equipment deck. It leverages Gun tokens and specialized Pilots to create a highly efficient, fast-moving combat force that rewards aggressive play.',
  'GU': 'A midrange deck that uses Energy and flash threats to manipulate the battlefield and protect its creatures. It\'s a reactive value town.'
}

// Keywords to track for each archetype
const TRACKED_KEYWORDS = [
  { name: 'Digital', pattern: /\bDigital\b/i },
  { name: 'Jack-in', pattern: /\bJack-in\b/i },
  { name: 'Eject', pattern: /\bEject\b/i },
  { name: 'Override', pattern: /\bOverride\b/i },
  { name: 'Energy', pattern: /\{E\}/i },
  { name: 'Flying', pattern: /\bFlying\b/i },
  { name: 'Vigilance', pattern: /\bVigilance\b/i },
  { name: 'Lifelink', pattern: /\bLifelink\b/i },
  { name: 'Haste', pattern: /\bHaste\b/i },
  { name: 'Trample', pattern: /\bTrample\b/i },
  { name: 'Flash', pattern: /\bFlash\b/i },
  { name: 'Menace', pattern: /\bMenace\b/i }
]

/**
 * Check if a card belongs to a color pair
 * A card belongs if it:
 * - Is exactly those two colors (gold card)
 * - Is mono-colored in one of those colors
 * - Is colorless (artifacts/lands can go in any deck)
 */
export function cardBelongsToPair(card, colors) {
  const cardColors = getCardColors(card)

  // Colorless cards belong to all pairs (but we'll filter them out for display usually)
  if (cardColors.length === 0) {
    // Skip basic lands for archetype analysis
    if (card.type?.toLowerCase().includes('basic land')) return false
    return true
  }

  // Card must only contain colors from the pair
  const pairSet = new Set(colors)
  for (const color of cardColors) {
    if (!pairSet.has(color)) {
      return false
    }
  }

  return true
}

/**
 * Get keyword counts for a set of cards
 */
export function getKeywordCounts(cards) {
  const counts = {}

  TRACKED_KEYWORDS.forEach(({ name, pattern }) => {
    let count = 0
    cards.forEach(card => {
      const textToSearch = [
        ...(card.text || []),
        card.type || '',
        card.displayType || ''
      ].join(' ')

      if (pattern.test(textToSearch)) {
        count++
      }
    })
    if (count > 0) {
      counts[name] = count
    }
  })

  return counts
}

/**
 * Get mana curve for a set of cards
 */
export function getManaCurve(cards) {
  const curve = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6+': 0 }

  cards.forEach(card => {
    // Skip lands
    if (card.type?.toLowerCase().includes('land')) return

    const cmc = calculateCMC(card.cost)
    if (cmc >= 6) {
      curve['6+']++
    } else {
      curve[cmc.toString()]++
    }
  })

  return curve
}

/**
 * Get creature type breakdown for a set of cards
 */
export function getCreatureTypes(cards) {
  const types = {}

  cards.forEach(card => {
    const type = card.displayType || card.type || ''
    if (!type.toLowerCase().includes('creature')) return

    // Extract subtypes after the dash
    const match = type.match(/—\s*(.+)/)
    if (match) {
      const subtypes = match[1].split(/\s+/)
      subtypes.forEach(subtype => {
        // Filter out common words that aren't creature types
        if (subtype.length > 2 && !['and', 'the'].includes(subtype.toLowerCase())) {
          types[subtype] = (types[subtype] || 0) + 1
        }
      })
    }
  })

  // Sort by count and return top types
  return Object.fromEntries(
    Object.entries(types)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  )
}

/**
 * Main composable for archetype analysis
 */
export function useArchetypeAnalysis(allCards) {
  const getCardsForPair = (pairId) => {
    const pair = COLOR_PAIRS.find(p => p.id === pairId)
    if (!pair) return []

    return allCards.value
      .filter(card => !card.isBackFace)
      .filter(card => cardBelongsToPair(card, pair.colors))
  }

  const getArchetypeData = (pairId) => {
    const pair = COLOR_PAIRS.find(p => p.id === pairId)
    if (!pair) return null

    const cards = getCardsForPair(pairId)

    // Filter to just the on-color cards (not colorless) for better analysis
    const onColorCards = cards.filter(card => {
      const colors = getCardColors(card)
      return colors.length > 0
    })

    return {
      id: pair.id,
      name: pair.name,
      guildName: pair.guildName,
      colors: pair.colors,
      description: ARCHETYPE_DESCRIPTIONS[pair.id] || '',
      cards: cards,
      onColorCards: onColorCards,
      cardCount: cards.length,
      onColorCount: onColorCards.length,
      keywords: getKeywordCounts(cards),
      manaCurve: getManaCurve(cards),
      creatureTypes: getCreatureTypes(cards)
    }
  }

  const allArchetypes = computed(() => {
    return COLOR_PAIRS.map(pair => getArchetypeData(pair.id))
  })

  return {
    colorPairs: COLOR_PAIRS,
    getCardsForPair,
    getArchetypeData,
    allArchetypes,
    getKeywordCounts,
    getManaCurve,
    getCreatureTypes
  }
}
