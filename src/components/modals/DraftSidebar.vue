<template>
  <div class="draft-pool-sidebar">
    <h3>YOUR POOL ({{ pool.length }})</h3>
    <ul class="pool-list">
      <li
        v-for="card in pool"
        :key="card.id"
        @mouseenter="$emit('hover', card)"
        @mouseleave="$emit('hover-end')"
      >
        {{ card.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  pool: {
    type: Array,
    required: true
  }
})

defineEmits(['hover', 'hover-end'])
</script>
