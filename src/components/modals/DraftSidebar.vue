<template>
  <div class="draft-pool-sidebar">
    <div class="sidebar-header">
      <h3>YOUR POOL ({{ pool.length }})</h3>
      <select v-model="sortBy" class="sort-select">
        <option value="pick">Pick Order</option>
        <option value="color">Color</option>
        <option value="mv">Mana Value</option>
        <option value="type">Type</option>
        <option value="name">Name</option>
      </select>
    </div>
    <ul class="pool-list">
      <li
        v-for="group in groupedPool"
        :key="group.key"
        @mouseenter="$emit('hover', group.card)"
        @mouseleave="$emit('hover-end')"
      >
        <span v-if="sortBy === 'color'" class="color-pip" :class="group.colorClass"></span>
        <span v-if="sortBy === 'mv'" class="mv-badge">{{ group.mv }}</span>
        <span v-if="sortBy === 'type'" class="type-badge">{{ group.typeAbbrev }}</span>
        <span v-if="sortBy === 'pick'" class="pick-badge">#{{ group.pickNumber }}</span>
        <span class="card-name">{{ group.name }}</span>
        <span v-if="group.count > 1" class="card-count">×{{ group.count }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { calculateCMC, getCardColorIdentity, determineColorClass } from '@/utils/cardUtils'

const props = defineProps({
  pool: {
    type: Array,
    required: true
  }
})

defineEmits(['hover', 'hover-end'])

const sortBy = ref('pick')

const COLOR_ORDER = ['W', 'U', 'B', 'R', 'G', 'Gold', 'Artifact', 'Land']
const TYPE_ORDER = ['Creature', 'Planeswalker', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Land', 'Other']
const TYPE_ABBREV = {
  Creature: 'CRE',
  Planeswalker: 'PW',
  Instant: 'INS',
  Sorcery: 'SOR',
  Artifact: 'ART',
  Enchantment: 'ENC',
  Land: 'LND',
  Other: '???'
}

function getColorSortKey(card) {
  const colorClass = determineColorClass(card)
  const index = COLOR_ORDER.indexOf(colorClass)
  return index >= 0 ? index : 99
}

function getTypeCategory(card) {
  const type = card.type?.toLowerCase() || ''
  if (type.includes('creature')) return 'Creature'
  if (type.includes('planeswalker')) return 'Planeswalker'
  if (type.includes('instant')) return 'Instant'
  if (type.includes('sorcery')) return 'Sorcery'
  if (type.includes('artifact')) return 'Artifact'
  if (type.includes('enchantment')) return 'Enchantment'
  if (type.includes('land')) return 'Land'
  return 'Other'
}

function getTypeSortKey(card) {
  const category = getTypeCategory(card)
  const index = TYPE_ORDER.indexOf(category)
  return index >= 0 ? index : 99
}

const groupedPool = computed(() => {
  // First, annotate cards with their pick order
  const annotated = props.pool.map((card, index) => {
    const typeCategory = getTypeCategory(card)
    return {
      card,
      pickNumber: index + 1,
      mv: calculateCMC(card.cost),
      colorIdentity: getCardColorIdentity(card),
      colorClass: determineColorClass(card).toLowerCase(),
      typeCategory,
      typeAbbrev: TYPE_ABBREV[typeCategory]
    }
  })

  // Sort based on selected criteria
  let sorted
  switch (sortBy.value) {
    case 'color':
      sorted = [...annotated].sort((a, b) => {
        const colorDiff = getColorSortKey(a.card) - getColorSortKey(b.card)
        if (colorDiff !== 0) return colorDiff
        return a.card.name.localeCompare(b.card.name)
      })
      break
    case 'mv':
      sorted = [...annotated].sort((a, b) => {
        const mvDiff = a.mv - b.mv
        if (mvDiff !== 0) return mvDiff
        return a.card.name.localeCompare(b.card.name)
      })
      break
    case 'type':
      sorted = [...annotated].sort((a, b) => {
        const typeDiff = getTypeSortKey(a.card) - getTypeSortKey(b.card)
        if (typeDiff !== 0) return typeDiff
        return a.card.name.localeCompare(b.card.name)
      })
      break
    case 'name':
      sorted = [...annotated].sort((a, b) => a.card.name.localeCompare(b.card.name))
      break
    case 'pick':
    default:
      sorted = annotated
      break
  }

  // Group by name (for count display) while preserving sort order
  const groups = new Map()
  for (const item of sorted) {
    const name = item.card.name
    if (groups.has(name)) {
      groups.get(name).count++
    } else {
      groups.set(name, {
        key: `${name}-${item.pickNumber}`,
        name,
        card: item.card,
        count: 1,
        pickNumber: item.pickNumber,
        mv: item.mv,
        colorClass: item.colorClass,
        typeAbbrev: item.typeAbbrev
      })
    }
  }

  return Array.from(groups.values())
})
</script>
