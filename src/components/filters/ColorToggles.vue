<template>
  <div class="filter-group">
    <label class="filter-label">Color</label>
    <div class="color-toggles">
      <div
        v-for="color in colors"
        :key="color.id"
        :class="['color-btn', color.class, { active: active.includes(color.id) }]"
        @click="$emit('toggle', color.id)"
      >
        <i :class="color.icon"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  active: {
    type: Array, // Changed from String
    default: () => []
  }
})

defineEmits(['toggle'])

const colors = [
  { id: 'W', class: 'cb-w', icon: 'ms ms-w ms-cost' },
  { id: 'U', class: 'cb-u', icon: 'ms ms-u ms-cost' },
  { id: 'B', class: 'cb-b', icon: 'ms ms-b ms-cost' },
  { id: 'R', class: 'cb-r', icon: 'ms ms-r ms-cost' },
  { id: 'G', class: 'cb-g', icon: 'ms ms-g ms-cost' },
  { id: 'Gold', class: 'cb-gold', icon: 'ms ms-multicolor ms-cost' }, // Changed to ms-multicolor
  { id: 'Artifact', class: 'cb-art', icon: 'ms ms-artifact ms-cost' },
  { id: 'Land', class: 'cb-land', icon: 'ms ms-land ms-cost' }
]
</script>
