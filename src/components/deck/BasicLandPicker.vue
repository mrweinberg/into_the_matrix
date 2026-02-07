<template>
  <div class="basic-land-picker">
    <div v-for="type in landTypes" :key="type" class="land-btn-group">
      <i :class="getIcon(type)" class="land-icon"></i>
      <button class="small-btn" @click="$emit('remove', type)" :disabled="counts[type] === 0">-</button>
      <span class="land-count">{{ counts[type] }}</span>
      <button class="small-btn" @click="$emit('add', type)">+</button>
    </div>
  </div>
</template>

<script setup>
const landTypes = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest']

defineProps({
  counts: {
    type: Object,
    required: true
  }
})

defineEmits(['add', 'remove'])

function getIcon(type) {
  switch (type) {
    case 'Plains': return 'ms ms-w ms-cost ms-shadow'
    case 'Island': return 'ms ms-u ms-cost ms-shadow'
    case 'Swamp': return 'ms ms-b ms-cost ms-shadow'
    case 'Mountain': return 'ms ms-r ms-cost ms-shadow'
    case 'Forest': return 'ms ms-g ms-cost ms-shadow'
    default: return ''
  }
}
</script>

<style scoped>
.basic-land-picker {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  padding: 3px 5px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 65, 0.1);
}

.land-btn-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 8px;
  gap: 3px;
}

.land-icon {
  font-size: 1.1rem;
}

.land-count {
  font-family: 'Courier New', monospace;
  color: var(--matrix-green);
  font-size: 0.85rem;
  min-width: 1ch;
  text-align: center;
}

.small-btn {
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid var(--matrix-green);
  color: var(--matrix-green);
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 3px;
}

.small-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
