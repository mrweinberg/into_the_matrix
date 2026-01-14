<template>
  <BaseModal :show="show" title="CARD VIEW" @close="$emit('close')">
    <div class="single-view">
      <CardDFC
        v-if="card?.hasBackFace && backCard"
        :card="card"
        :back-card="backCard"
        :clickable="false"
      />
      <CardItem
        v-else-if="card"
        :card="card"
        :clickable="false"
      />
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import BaseModal from './BaseModal.vue'
import CardItem from '@/components/cards/CardItem.vue'
import CardDFC from '@/components/cards/CardDFC.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  card: {
    type: Object,
    default: null
  }
})

defineEmits(['close'])

const cardStore = useCardStore()

const backCard = computed(() =>
  props.card?.hasBackFace ? cardStore.getBackFace(props.card) : null
)
</script>
