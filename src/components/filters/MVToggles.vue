<template>
  <div class="filter-group">
    <label class="filter-label">MV</label>
    <div class="mv-toggles">
      <div
        v-for="mv in mvOptions"
        :key="mv"
        :class="['mv-btn', { active: active.includes(mv) }]"
        @click="$emit('toggle', mv)"
      >
        {{ mv }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  active: {
    type: Array,
    default: () => []
  }
})

defineEmits(['toggle'])

const mvOptions = ['0', '1', '2', '3', '4', '5+']
</script>

<style scoped>
.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-weight: bold;
  color: var(--matrix-green);
  min-width: 45px;
}

.mv-toggles {
  display: flex;
  gap: 4px;
}

.mv-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: #888;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  font-weight: bold;
}

.mv-btn:hover {
  border-color: var(--matrix-green);
  color: var(--matrix-green);
}

.mv-btn.active {
  background: rgba(0, 255, 65, 0.2);
  border-color: var(--matrix-green);
  color: var(--matrix-green);
}
</style>
