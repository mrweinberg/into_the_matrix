<template>
  <div class="actions-container">
    <!-- Resume Pool Banner -->
    <div v-if="hasSavedPool" class="resume-banner">
      <div class="resume-info">
        <span class="resume-icon">&#9654;</span>
        <span class="resume-text">
          {{ poolType === 'draft' ? 'Draft' : 'Sealed' }} pool saved
          <span class="resume-details">
            ({{ savedPool?.length || 0 }} cards{{ deckCardCount > 0 ? ', ' + deckCardCount + ' in deck' : '' }})
          </span>
        </span>
      </div>
      <div class="resume-actions">
        <button class="resume-btn" @click="$emit('resume-pool')">RESUME</button>
        <button class="clear-pool-btn" @click="clearPool">×</button>
      </div>
    </div>

    <!-- Simulation Protocols -->
    <div class="actions-section">
      <h3 class="section-title">
        <span class="title-icon">&gt;</span> SIMULATION PROTOCOLS
      </h3>
      <div class="action-grid">
        <button class="action-btn action-primary" @click="$emit('open-booster')">
          <span class="btn-icon">&#9635;</span>
          <span class="btn-text">Open Pack</span>
          <span class="btn-hint">Single booster</span>
        </button>
        <button class="action-btn action-primary" @click="$emit('start-draft')">
          <span class="btn-icon">&#9638;</span>
          <span class="btn-text">Draft Mode</span>
          <span class="btn-hint">3-pack simulation</span>
        </button>
        <button class="action-btn action-primary" @click="$emit('generate-sealed')">
          <span class="btn-icon">&#9641;</span>
          <span class="btn-text">Sealed Pool</span>
          <span class="btn-hint">6-pack deck builder</span>
        </button>
      </div>
    </div>

    <!-- System Access -->
    <div class="info-section">
      <h3 class="section-title">
        <span class="title-icon">&gt;</span> SYSTEM ACCESS
      </h3>
      <div class="info-grid">
        <button class="action-btn action-secondary" @click="$emit('open-stats')">
          <span class="btn-icon">&#9632;</span>
          <span class="btn-text">Set Analytics</span>
        </button>
        <button class="action-btn action-secondary" @click="$emit('open-notes')">
          <span class="btn-icon">&#9633;</span>
          <span class="btn-text">Design Notes</span>
        </button>
        <button class="action-btn action-secondary" @click="$emit('open-print-proxies')">
          <span class="btn-icon">&#9113;</span>
          <span class="btn-text">Print Proxies</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSavedPool } from '@/composables/useSavedPool'

defineEmits(['open-booster', 'start-draft', 'generate-sealed', 'open-stats', 'open-notes', 'resume-pool', 'open-print-proxies'])

const { savedPool, poolType, clearPool, hasSavedPool: hasSavedPoolFn, getDeckCardCount } = useSavedPool()

const hasSavedPool = computed(() => hasSavedPoolFn())
const deckCardCount = computed(() => getDeckCardCount())
</script>

<style scoped>
/* Resume Banner */
.resume-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 20px;
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid var(--matrix-green);
  border-radius: 4px;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0%, 100% { border-color: var(--matrix-green); }
  50% { border-color: rgba(0, 255, 65, 0.5); }
}

.resume-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.resume-icon {
  color: var(--matrix-green);
  font-size: 1rem;
}

.resume-text {
  color: var(--matrix-green);
  font-size: 0.85rem;
  letter-spacing: 1px;
}

.resume-actions {
  display: flex;
  gap: 8px;
}

.resume-btn {
  padding: 6px 16px;
  background: var(--matrix-green);
  border: none;
  color: #000;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.2s;
}

.resume-btn:hover {
  background: #fff;
  box-shadow: 0 0 10px var(--matrix-green);
}

.clear-pool-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: 1px solid #666;
  color: #888;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.2s;
}

.clear-pool-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.section-title {
  margin: 0 0 15px 0;
  font-size: 0.8rem;
  color: #888;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: var(--matrix-green);
}

.actions-section {
  margin-bottom: 20px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 18px 12px;
  border: 1px solid var(--matrix-green);
  border-radius: 4px;
  background: rgba(0, 255, 65, 0.05);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.action-btn:hover {
  background: rgba(0, 255, 65, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 255, 65, 0.2);
}

.action-btn.action-primary .btn-icon {
  font-size: 1.8rem;
  color: var(--matrix-green);
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.action-btn.action-secondary {
  padding: 12px;
  flex-direction: row;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-color: #444;
}

.action-btn.action-secondary:hover {
  border-color: var(--matrix-green);
}

.action-btn.action-secondary .btn-icon {
  font-size: 1rem;
  color: #888;
}

.action-btn.action-secondary:hover .btn-icon {
  color: var(--matrix-green);
}

.btn-text {
  font-size: 0.85rem;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
}

.btn-hint {
  font-size: 0.65rem;
  color: #666;
}

.action-btn.action-secondary .btn-text {
  font-size: 0.75rem;
  color: #aaa;
}

.action-btn.action-secondary:hover .btn-text {
  color: #fff;
}

@media (max-width: 1000px) {
  .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .action-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
