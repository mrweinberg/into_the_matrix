<template>
  <div class="mechanics-content">
    <div
      v-for="mechanic in visibleMechanics"
      :key="mechanic.name"
      class="mechanic-item"
      :class="{ active: activeMechanic === mechanic.originalIndex }"
      @click="toggleMechanic(mechanic.originalIndex)"
    >
      <div class="mechanic-header">
        <span class="mechanic-name" v-html="formatMechanic(mechanic.name)"></span>
        <span class="mechanic-toggle">{{ activeMechanic === mechanic.originalIndex ? '×' : '+' }}</span>
      </div>
      <div v-if="activeMechanic === mechanic.originalIndex" class="mechanic-details">
        <p class="mechanic-text" v-html="formatMechanic(mechanic.text.join(' '))"></p>
        <p v-if="mechanic.notes?.length" class="mechanic-note">
          {{ mechanic.notes.join(' ') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { replaceSymbols } from '@/utils/manaSymbols'

const props = defineProps({
  mechanics: {
    type: Array,
    required: true
  }
})

const activeMechanic = ref(null)

const visibleMechanics = computed(() => {
  if (activeMechanic.value === null) {
    return props.mechanics.map((m, i) => ({ ...m, originalIndex: i }))
  }
  const mech = props.mechanics[activeMechanic.value]
  return mech ? [{ ...mech, originalIndex: activeMechanic.value }] : []
})

function toggleMechanic(index) {
  activeMechanic.value = activeMechanic.value === index ? null : index
}

function formatMechanic(text) {
  return replaceSymbols(text)
}
</script>

<style scoped>
.mechanics-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 5px;
}

.mechanics-content::-webkit-scrollbar {
  width: 4px;
}

.mechanics-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.mechanics-content::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 65, 0.3);
  border-radius: 2px;
}

.mechanic-item {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 255, 65, 0.15);
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.2s;
}

.mechanic-item:hover {
  border-color: rgba(0, 255, 65, 0.4);
}

.mechanic-item.active {
  border-color: var(--matrix-green);
  background: rgba(0, 255, 65, 0.05);
}

.mechanic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
}

.mechanic-name {
  color: var(--matrix-green);
  font-size: 0.85rem;
  font-weight: bold;
}

.mechanic-toggle {
  color: var(--matrix-green);
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.mechanic-details {
  padding: 12px 14px 14px;
  border-top: 1px solid rgba(0, 255, 65, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.mechanic-text {
  margin: 0;
  font-size: 0.85rem;
  color: #ccc;
  line-height: 1.6;
}

.mechanic-note {
  margin: 10px 0 0;
  font-size: 0.8rem;
  color: #888;
  font-style: italic;
  padding-top: 10px;
  border-top: 1px dashed #444;
  line-height: 1.5;
}
</style>
