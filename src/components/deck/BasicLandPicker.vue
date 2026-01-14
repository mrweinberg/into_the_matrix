<template>
  <div class="basic-land-picker">
    <div v-for="type in landTypes" :key="type" class="land-btn-group">
      <button class="land-btn" @click="$emit('add', type)">
        <i :class="getIcon(type)"></i>
      </button>
      <div class="land-count">
        <button class="small-btn" @click="$emit('remove', type)" :disabled="counts[type] === 0">-</button>
        <span>{{ counts[type] }}</span>
      </div>
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
  gap: 15px;
  justify-content: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 65, 0.1);
}

.land-btn-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.land-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 2rem;
  transition: transform 0.2s;
}

.land-btn:hover {
  transform: scale(1.1);
}

.land-count {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Courier New', monospace;
  color: var(--matrix-green);
}

.small-btn {
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid var(--matrix-green);
  color: var(--matrix-green);
  width: 20px;
  height: 20px;
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
