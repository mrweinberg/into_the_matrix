<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="modal-overlay"
        :class="{ 'draft-mode': variant === 'draft' }"
        @click.self="$emit('close')"
      >
        <div class="modal-content">
          <button class="close-modal" @click="$emit('close')">&times;</button>
          <h2 class="modal-title">
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
  }
})

defineEmits(['close'])
</script>
