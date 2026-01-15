<template>
  <div class="results-bar">
    <div class="results-text">
      <span class="prompt">&gt;</span>
      QUERY RESULTS: <strong>{{ count }}</strong> RECORDS FOUND
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    required: true
  }
})
</script>

<style scoped>
.results-bar {
  background: rgba(0, 255, 65, 0.05);
  border: 1px solid var(--matrix-green);
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 12px 20px;
}

.results-text {
  color: var(--matrix-green);
  font-size: 0.85rem;
  letter-spacing: 1px;
}

.results-text strong {
  color: #fff;
  text-shadow: 0 0 10px var(--matrix-green);
}

.prompt {
  color: var(--matrix-green);
  margin-right: 8px;
}
</style>
