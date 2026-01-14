<template>
  <div class="mechanic-entry">
    <span class="mech-name" v-html="formattedName"></span>
    <div class="mech-text" v-html="formattedText"></div>
    <div v-if="mechanic.notes && mechanic.notes.length > 0" class="mech-notes">
      <strong>Design Note:</strong> {{ formattedNotes }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { replaceSymbols } from '@/utils/manaSymbols'

const props = defineProps({
  mechanic: {
    type: Object,
    required: true
  }
})

const formattedName = computed(() => replaceSymbols(props.mechanic.name))
const formattedText = computed(() =>
  props.mechanic.text.map(l => replaceSymbols(l)).join(' ')
)
const formattedNotes = computed(() =>
  props.mechanic.notes?.map(n => replaceSymbols(n)).join(' ') || ''
)
</script>
