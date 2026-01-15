<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="modal-overlay"
        :class="{ 'draft-mode': variant === 'draft', 'full-width-mode': fullWidth }"
        @click.self="$emit('close')"
      >
        <div class="modal-content" :class="{ 'full-width-content': fullWidth }">
          <button class="close-modal" @click="$emit('close')">&times;</button>
          <h2 v-if="title || $slots.title" class="modal-title">
            <slot name="title">{{ title }}</slot>
          </h2>
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'draft'].includes(v)
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])
</script>
