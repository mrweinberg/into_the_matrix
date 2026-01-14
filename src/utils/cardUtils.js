export function determineColorClass(card) {
  let colorsFound = 0
  if (card.cost.includes("{W}")) colorsFound++
  if (card.cost.includes("{U}")) colorsFound++
  if (card.cost.includes("{B}")) colorsFound++
  if (card.cost.includes("{R}")) colorsFound++
  if (card.cost.includes("{G}")) colorsFound++

  if (card.type.toLowerCase().includes("land")) return "Land"
  if (colorsFound > 1) return "Gold"
  if (colorsFound === 0) return "Artifact"

  if (card.cost.includes("{W}")) return "W"
  if (card.cost.includes("{U}")) return "U"
  if (card.cost.includes("{B}")) return "B"
  if (card.cost.includes("{R}")) return "R"
  if (card.cost.includes("{G}")) return "G"

  return "Artifact"
}

export function calculateCMC(cost) {
  if (!cost) return 0
  let cmc = 0
  const symbols = cost.match(/{[^{}]+}/g) || []
  symbols.forEach(sym => {
    const inner = sym.replace(/[{}]/g, '')
    if (!isNaN(parseInt(inner))) {
      cmc += parseInt(inner)
    } else if (!inner.includes('X')) {
      cmc += 1
    }
  })
  return cmc
}

export function getCardColorIdentity(card) {
  if (card.type.toLowerCase().includes('land')) return 7
  let w = card.cost.includes('{W}') || (card.colorIndicator?.includes('w'))
  let u = card.cost.includes('{U}') || (card.colorIndicator?.includes('u'))
  let b = card.cost.includes('{B}') || (card.colorIndicator?.includes('b'))
  let r = card.cost.includes('{R}') || (card.colorIndicator?.includes('r'))
  let g = card.cost.includes('{G}') || (card.colorIndicator?.includes('g'))

  // Check for hybrid mana
  if (card.cost.match(/{[WUBRG]\/[WUBRG]}/)) {
    if (card.cost.includes('W')) w = true
    if (card.cost.includes('U')) u = true
    if (card.cost.includes('B')) b = true
    if (card.cost.includes('R')) r = true
    if (card.cost.includes('G')) g = true
  }

  const count = (w ? 1 : 0) + (u ? 1 : 0) + (b ? 1 : 0) + (r ? 1 : 0) + (g ? 1 : 0)
  if (count > 1) return 5  // Gold
  if (count === 0) return 6 // Colorless
  if (w) return 0
  if (u) return 1
  if (b) return 2
  if (r) return 3
  if (g) return 4
  return 6
}

export function getCardColors(card) {
  const colors = new Set()

  if (card.cost) {
    // Check standard symbols
    if (card.cost.includes('{W}')) colors.add('W')
    if (card.cost.includes('{U}')) colors.add('U')
    if (card.cost.includes('{B}')) colors.add('B')
    if (card.cost.includes('{R}')) colors.add('R')
    if (card.cost.includes('{G}')) colors.add('G')

    // Check hybrid symbols, e.g. {W/U}, {2/R}, {G/P}
    // We iterate over all bracketed groups and check their contents
    const symbols = card.cost.match(/{[^{}]+}/g) || []
    symbols.forEach(sym => {
      // Remove braces
      const inner = sym.replace(/[{}]/g, '')
      // Check for slash indicating hybrid or phyrexian
      if (inner.includes('/')) {
        if (inner.includes('W')) colors.add('W')
        if (inner.includes('U')) colors.add('U')
        if (inner.includes('B')) colors.add('B')
        if (inner.includes('R')) colors.add('R')
        if (inner.includes('G')) colors.add('G')
      }
    })
  }

  if (card.colorIndicator) {
    if (card.colorIndicator.includes('w')) colors.add('W')
    if (card.colorIndicator.includes('u')) colors.add('U')
    if (card.colorIndicator.includes('b')) colors.add('B')
    if (card.colorIndicator.includes('r')) colors.add('R')
    if (card.colorIndicator.includes('g')) colors.add('G')
  }
  return Array.from(colors)
}

const raritySort = { Mythic: 0, Rare: 1, Uncommon: 2, Common: 3, Land: 4 }

export function sortCards(cards, criteria = 'color', direction = 'asc') {
  const multiplier = direction === 'desc' ? -1 : 1

  return [...cards].sort((a, b) => {
    let result = 0

    switch (criteria) {
      case 'name':
        result = a.name.localeCompare(b.name)
        break
      case 'code':
        result = a.id.localeCompare(b.id)
        break
      case 'rarity': {
        const rA = raritySort[a.rarity] !== undefined ? raritySort[a.rarity] : (raritySort[a.rarity?.replace(/^\w/, c => c.toUpperCase())] || 3)
        const rB = raritySort[b.rarity] !== undefined ? raritySort[b.rarity] : (raritySort[b.rarity?.replace(/^\w/, c => c.toUpperCase())] || 3)
        if (rA !== rB) result = rA - rB
        break
      }
      case 'mana': {
        const mvA = calculateCMC(a.cost)
        const mvB = calculateCMC(b.cost)
        if (mvA !== mvB) result = mvA - mvB
        break
      }
      case 'color':
      default: {
        const cA = getCardColorIdentity(a)
        const cB = getCardColorIdentity(b)
        if (cA !== cB) {
          result = cA - cB
        } else {
          // Secondary sort for color is usually Rarity then CMC then Name
          // These secondary sorts should typically ALWAYS be consistently ordered,
          // OR they should flip with the primary sort?
          // Usually primary sort flips, secondary sort stays same or flips too.
          // Let's apply multiplier to the WHOLE result for now.
          const rA = raritySort[a.rarity] || 3
          const rB = raritySort[b.rarity] || 3
          if (rA !== rB) {
            result = rA - rB
          } else {
            const mvA = calculateCMC(a.cost)
            const mvB = calculateCMC(b.cost)
            if (mvA !== mvB) result = mvA - mvB
          }
        }
        break
      }
    }

    if (result === 0) {
      // Tie-breaker: Name (always ascending usually, but let's follow direction for consistency)
      result = a.name.localeCompare(b.name)
    }

    return result * multiplier
  })
}
