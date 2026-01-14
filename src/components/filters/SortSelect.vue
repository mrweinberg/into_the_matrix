<template>
  <div class="filter-group">
    <label class="filter-label">Sort By</label>
    <select
      class="filter-select"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="color">Color</option>
      <option value="name">Name</option>
      <option value="code">Collector Number</option>
      <option value="rarity">Rarity</option>
      <option value="mana">Mana Value</option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: 'color'
  }
})

defineEmits(['update:modelValue'])
</script>
