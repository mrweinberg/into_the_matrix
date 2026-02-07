function getRandom(arr, count) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
}

export function generateBoosterPackData(allCards) {
  const lands = allCards.filter(c => c.rarity === "Land" && !c.isBackFace)
  const commons = allCards.filter(c => c.rarity === "Common" && !c.isBackFace)
  const uncommons = allCards.filter(c => c.rarity === "Uncommon" && !c.isBackFace)
  const rares = allCards.filter(c => c.rarity === "Rare" && !c.isBackFace)
  const mythics = allCards.filter(c => c.rarity === "Mythic" && !c.isBackFace)

  const pack = []

  // 8 commons
  if (commons.length) pack.push(...getRandom(commons, 8))
  // 3 uncommons
  if (uncommons.length) pack.push(...getRandom(uncommons, 3))

  // Rare/Mythic slot (13% mythic chance)
  if (Math.random() > 0.87 && mythics.length > 0) {
    pack.push(...getRandom(mythics, 1))
  } else if (rares.length > 0) {
    pack.push(...getRandom(rares, 1))
  }

  // Two Wildcard slots
  for (let i = 0; i < 2; i++) {
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
  }

  return pack
}

export const rarityWeights = { Mythic: 4, Rare: 3, Uncommon: 2, Common: 1, Land: 0 }

export function sortPackByRarity(pack) {
  return [...pack].sort((a, b) => rarityWeights[b.rarity] - rarityWeights[a.rarity])
}

export function generateSealedPool(allCards) {
  let pool = []
  for (let i = 0; i < 6; i++) {
    pool.push(...generateBoosterPackData(allCards))
  }
  return pool
}
