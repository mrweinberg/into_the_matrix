<template>
  <BaseModal :show="show" title="CARD CHANGELOG" @close="$emit('close')">
    <div
      class="changelog-container markdown-body"
      v-html="parsedChangelog"
      @mouseover="onHover"
      @mouseout="onHoverEnd"
    ></div>
  </BaseModal>
  <Teleport to="body">
    <div v-if="hoverCard" class="changelog-hover-preview" :style="previewStyle">
      <HoverPreview :card="hoverCard" />
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { marked } from 'marked'
import BaseModal from './BaseModal.vue'
import HoverPreview from './HoverPreview.vue'
import { useCardStore } from '@/stores/cardStore'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])

const cardStore = useCardStore()
const changelogContent = ref('')
const hoverCard = ref(null)
const previewX = ref(0)
const previewY = ref(0)

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

const parsedChangelog = computed(() => {
  const raw = changelogContent.value || ''
  const stripped = raw.replace(/^#\s+.*\n+/, '')
  const html = marked.parse(stripped)
  // Wrap [C001]-style card IDs in hoverable spans
  return html.replace(
    /\[([CURM]\d+)\]/g,
    '<span class="changelog-card-ref" data-card-id="$1">[$1]</span>'
  )
})

const previewStyle = computed(() => ({
  left: `${previewX.value}px`,
  top: `${previewY.value}px`
}))

function onHover(e) {
  const target = e.target.closest('.changelog-card-ref')
  if (!target) return
  const cardId = target.dataset.cardId
  if (!cardId) return
  const card = cardStore.getCardById(cardId)
  if (!card) return
  hoverCard.value = card
  const rect = target.getBoundingClientRect()
  previewX.value = rect.right + 8
  previewY.value = rect.top
}

function onHoverEnd(e) {
  const related = e.relatedTarget
  if (related && related.closest && related.closest('.changelog-card-ref')) return
  hoverCard.value = null
}
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

.changelog-container :deep(.changelog-card-ref) {
  color: var(--matrix-green);
  cursor: pointer;
  border-bottom: 1px dotted var(--matrix-green);
}

.changelog-container :deep(.changelog-card-ref:hover) {
  color: #00ff41;
  text-shadow: 0 0 6px rgba(0, 255, 65, 0.4);
}

</style>

<style>
.changelog-hover-preview {
  position: fixed;
  z-index: 1200;
  pointer-events: none;
  width: 280px;
  transform: translateY(-50%);
}

@media (max-width: 900px) {
  .changelog-hover-preview {
    display: none;
  }
}
</style>
