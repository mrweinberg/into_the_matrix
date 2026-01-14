<template>
  <div class="mechanics-grid">
    <MechanicEntry
      v-for="(mechanic, index) in mechanics"
      :key="index"
      :mechanic="mechanic"
    />
  </div>
</template>

<script setup>
import MechanicEntry from './MechanicEntry.vue'

defineProps({
  mechanics: {
    type: Array,
    required: true
  }
})
</script>
