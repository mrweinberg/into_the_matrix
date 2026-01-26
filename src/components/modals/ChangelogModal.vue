<template>
  <BaseModal :show="show" title="CARD CHANGELOG" @close="$emit('close')">
    <div class="changelog-container markdown-body" v-html="parsedChangelog"></div>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { marked } from 'marked'
import BaseModal from './BaseModal.vue'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])

const changelogContent = ref('')

onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}card_changelog.md`)
    if (response.ok) {
      changelogContent.value = await response.text()
    } else {
      changelogContent.value = '# Changelog not found\n\nCould not load the changelog file.'
    }
  } catch (error) {
    changelogContent.value = '# Error loading changelog\n\n' + error.message
  }
})

const parsedChangelog = computed(() => marked.parse(changelogContent.value || ''))
</script>

<style scoped>
.changelog-container {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;
}

.changelog-container::-webkit-scrollbar {
  width: 8px;
}

.changelog-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.changelog-container::-webkit-scrollbar-thumb {
  background: var(--matrix-green);
  border-radius: 4px;
}

.changelog-container::-webkit-scrollbar-thumb:hover {
  background: #00ff41;
}
</style>
