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

const raritySort = { Mythic: 0, Rare: 1, Uncommon: 2, Common: 3, Land: 4 }

export function sortCards(cards) {
  return [...cards].sort((a, b) => {
    const cA = getCardColorIdentity(a)
    const cB = getCardColorIdentity(b)
    if (cA !== cB) return cA - cB

    const rA = raritySort[a.rarity] || 3
    const rB = raritySort[b.rarity] || 3
    if (rA !== rB) return rA - rB

    const mvA = calculateCMC(a.cost)
    const mvB = calculateCMC(b.cost)
    if (mvA !== mvB) return mvA - mvB

    return a.name.localeCompare(b.name)
  })
}
