<template>
  <div class="print-card" :data-color="colorClass" :data-mode="displayMode">
    <div class="print-card-header">
      <span class="print-card-name">{{ card.name }}</span>
      <span class="print-mana-cost" v-html="formattedCost"></span>
    </div>

    <div v-if="displayMode === 'art'" class="print-art-container">
      <img :src="imagePath" :alt="card.name" />
    </div>

    <div class="print-type-line">
      <span class="type-text">
        <i v-if="card.colorIndicator" :class="colorIndicatorClass"></i>
        {{ card.displayType }}
      </span>
      <span class="print-rarity">{{ cleanId }}</span>
    </div>

    <div class="print-text-box">
      <div class="print-oracle-text">
        <p v-for="(line, i) in card.text" :key="i" v-html="formatText(line)"></p>
      </div>
      <template v-if="card.flavor">
        <div class="print-flavor-separator"></div>
        <div class="print-flavor-text" v-html="formatText(card.flavor)"></div>
      </template>
    </div>

    <div v-if="card.pt" class="print-pt-box">{{ card.pt }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { replaceSymbols } from '@/utils/manaSymbols'
import { determineColorClass } from '@/utils/cardUtils'

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  displayMode: {
    type: String,
    default: 'art' // 'art' or 'text'
  }
})

const colorClass = computed(() => determineColorClass(props.card))
const formattedCost = computed(() => replaceSymbols(props.card.cost || ''))
const imagePath = computed(() => `matrix_art_output/${props.card.fileName}`)
const cleanId = computed(() => (props.card.id || '').replace(/[\[\]]/g, ''))
const colorIndicatorClass = computed(() =>
  props.card.colorIndicator ? `ms ms-ci ms-ci-${props.card.colorIndicator}` : ''
)

function formatText(text) {
  if (!text) return ''
  let formatted = replaceSymbols(text)
  formatted = formatted.replace(/\((.*?)\)/g, '<i>($1)</i>')
  return formatted
}
</script>
