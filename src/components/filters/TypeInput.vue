<template>
  <div class="filter-group">
    <label class="filter-label">Type / Subtype</label>
    <input
      type="text"
      class="search-input"
      placeholder="e.g. Artifact, Human, Vehicle"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    >
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>
