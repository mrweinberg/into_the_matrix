<template>
  <div class="dfc-wrapper">
    <CardItem :card="card" :clickable="clickable" @click="handleClick" @edit-note="handleEditNote" />
    <div class="transform-icon">⇄</div>
    <CardItem :card="backCard" :clickable="clickable" @click="handleClick" @edit-note="handleEditNote" />
  </div>
</template>

<script setup>
import CardItem from './CardItem.vue'

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  backCard: {
    type: Object,
    required: true
  },
  clickable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click', 'edit-note'])

function handleClick() {
  emit('click', props.card)
}

function handleEditNote(card) {
  emit('edit-note', card)
}
</script>
