<template>
  <BaseModal :show="show" title="DESIGN NOTES & ARCHETYPES" @close="$emit('close')">
    <div class="markdown-body" v-html="parsedNotes"></div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  }
})

defineEmits(['close'])

const parsedNotes = computed(() => marked.parse(props.notes || ''))
</script>
