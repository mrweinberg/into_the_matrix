<template>
  <div
    class="card"
    :data-color="colorClass"
    :data-pt="card.pt ? 'yes' : 'no'"
    @click="handleClick($event)"
    @contextmenu.prevent="handleRightClick"
  >
    <!-- Note Indicator -->
    <div v-if="noteInfo" class="note-indicator" :title="noteInfo.text">
      {{ getBadgeIcon(noteInfo.badge) || '📝' }}
    </div>
    
    <div class="card-header">
      <span class="card-name">{{ card.name }}</span>
      <span class="mana-cost" v-html="formattedCost"></span>
    </div>
    <div class="art-container">
      <div class="art-missing">Loading...<br>{{ card.fileName }}</div>
      <img
        :src="imagePath"
        :alt="card.name"
        loading="lazy"
        @load="onImageLoad"
        @error="onImageError"
      >
    </div>
    <div class="type-line">
      <span>
        <i v-if="card.colorIndicator" :class="colorIndicatorClass"></i>
        {{ card.displayType }}
      </span>
      <span :class="rarityClass" :title="card.rarity">{{ cleanId }}</span>
    </div>
    <div class="text-box">
      <div class="oracle-text">
        <p v-for="(line, i) in card.text" :key="i" v-html="formatText(line)"></p>
      </div>
      <template v-if="card.flavor">
        <div class="flavor-separator"></div>
        <div class="flavor-text" v-html="formatText(card.flavor)"></div>
      </template>
    </div>
    <div v-if="card.pt" class="pt-box">{{ card.pt }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { replaceSymbols } from '@/utils/manaSymbols'
import { determineColorClass } from '@/utils/cardUtils'
import { useCardNotes } from '@/composables/useCardNotes'

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  clickable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click', 'edit-note'])

const { getNote } = useCardNotes()

const imageLoaded = ref(false)

const colorClass = computed(() => determineColorClass(props.card))
const formattedCost = computed(() => replaceSymbols(props.card.cost))
const imagePath = computed(() => `matrix_art_output/${props.card.fileName}`)
const cleanId = computed(() => props.card.id.replace(/[\[\]]/g, ''))
const rarityClass = computed(() => `rarity-symbol rarity-${props.card.rarity}`)
const colorIndicatorClass = computed(() =>
  props.card.colorIndicator ? `ms ms-ci ms-ci-${props.card.colorIndicator}` : ''
)

const noteInfo = computed(() => getNote(props.card.id))

function getBadgeIcon(badge) {
  if (!badge) return null
  const icons = { red: '🔴', yellow: '🟡', green: '🟢', blue: '🔵' }
  return icons[badge] || null
}

function formatText(text) {
  if (!text) return ''
  // First replace mana symbols
  let formated = replaceSymbols(text)
  // Then replace parenthetical text with italics
  // We use a non-greedy match for content inside parentheses: \((.*?)\)
  formated = formated.replace(/\((.*?)\)/g, '<i>($1)</i>')
  return formated
}

function handleClick(event) {
  if (props.clickable) {
    // Command-click (Mac) or Ctrl-click (Windows) opens notes modal
    if (event.metaKey || event.ctrlKey) {
      emit('edit-note', props.card)
    } else {
      emit('click', props.card)
    }
  }
}

function handleRightClick() {
  emit('edit-note', props.card)
}

function onImageLoad(e) {
  imageLoaded.value = true
  e.target.style.zIndex = '2'
}

function onImageError(e) {
  e.target.style.display = 'none'
}
</script>

<style scoped>
.note-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.7);
  padding: 2px 4px;
  border-radius: 3px;
  cursor: pointer;
}
</style>

