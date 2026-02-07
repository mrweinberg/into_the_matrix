<template>
  <div class="stats-row">
    <div class="stat-display">
      <span class="stat-value">{{ stats?.totalCards || '---' }}</span>
      <span class="stat-label">CARDS</span>
    </div>
    <div class="stat-display">
      <span class="stat-value">{{ stats?.creatureStats?.total || '---' }}</span>
      <span class="stat-label">CREATURES</span>
    </div>
    <div class="stat-display">
      <span class="stat-value">{{ stats?.dfcCount || '---' }}</span>
      <span class="stat-label">TRANSFORMS</span>
    </div>
    <div class="stat-display">
      <span class="stat-value">{{ stats?.averageCMC || '---' }}</span>
      <span class="stat-label">AVG MV</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
}

.stat-display {
  flex: 1;
  text-align: center;
  padding: 15px 10px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.stat-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--matrix-green), transparent);
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--matrix-green);
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.65rem;
  color: #666;
  margin-top: 6px;
  letter-spacing: 2px;
}

@media (max-width: 600px) {
  .stats-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style>
