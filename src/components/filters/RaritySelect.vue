<template>
  <div class="filter-group">
    <label class="filter-label">Rarity</label>
    <select
      class="filter-select"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="All">All Rarities</option>
      <option value="Common">Common</option>
      <option value="Uncommon">Uncommon</option>
      <option value="Rare">Rare</option>
      <option value="Mythic">Mythic</option>
      <option value="Land">Basic Land</option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: 'All'
  }
})

defineEmits(['update:modelValue'])
</script>
