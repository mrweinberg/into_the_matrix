<template>
  <BaseModal :show="show" title="" @close="$emit('close')" :full-width="true">
    <DeckBuilder :initial-pool="pool" />
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'
import DeckBuilder from '@/components/deck/DeckBuilder.vue'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  pool: {
    type: Array,
    required: true
  }
})

defineEmits(['close', 'view-card'])
</script>

<style scoped>
</style>
