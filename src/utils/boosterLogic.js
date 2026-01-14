function getRandom(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export function generateBoosterPackData(allCards) {
  const lands = allCards.filter(c => c.rarity === "Land" && !c.isBackFace)
  const commons = allCards.filter(c => c.rarity === "Common" && !c.isBackFace)
  const uncommons = allCards.filter(c => c.rarity === "Uncommon" && !c.isBackFace)
  const rares = allCards.filter(c => c.rarity === "Rare" && !c.isBackFace)
  const mythics = allCards.filter(c => c.rarity === "Mythic" && !c.isBackFace)

  const pack = []

  // 1 land
  if (lands.length) pack.push(...getRandom(lands, 1))
  // 7 commons
  if (commons.length) pack.push(...getRandom(commons, 7))
  // 3 uncommons
  if (uncommons.length) pack.push(...getRandom(uncommons, 3))

  // Rare/Mythic slot (13% mythic chance)
  if (Math.random() > 0.87 && mythics.length > 0) {
    pack.push(...getRandom(mythics, 1))
  } else if (rares.length > 0) {
    pack.push(...getRandom(rares, 1))
  }

  // Wildcard slot
  const wildcardRoll = Math.random()
  if (wildcardRoll > 0.95 && mythics.length > 0) {
    pack.push(...getRandom(mythics, 1))
  } else if (wildcardRoll > 0.85 && rares.length > 0) {
    pack.push(...getRandom(rares, 1))
  } else if (wildcardRoll > 0.60 && uncommons.length > 0) {
    pack.push(...getRandom(uncommons, 1))
  } else if (commons.length > 0) {
    pack.push(...getRandom(commons, 1))
  }

  return pack
}

export const rarityWeights = { Mythic: 4, Rare: 3, Uncommon: 2, Common: 1, Land: 0 }

export function sortPackByRarity(pack) {
  return [...pack].sort((a, b) => rarityWeights[b.rarity] - rarityWeights[a.rarity])
}
