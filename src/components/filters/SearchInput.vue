<template>
  <div class="filter-group">
    <label class="filter-label">General Search</label>
    <input
      type="text"
      class="search-input"
      placeholder="Name, text, etc..."
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
