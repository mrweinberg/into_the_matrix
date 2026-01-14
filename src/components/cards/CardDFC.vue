<template>
  <div class="dfc-wrapper">
    <CardItem :card="card" :clickable="clickable" @click="handleClick" />
    <div class="transform-icon">⇄</div>
    <CardItem :card="backCard" :clickable="clickable" @click="handleClick" />
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

const emit = defineEmits(['click'])

function handleClick() {
  emit('click', props.card)
}
</script>
