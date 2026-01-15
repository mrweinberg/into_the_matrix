<template>
  <div class="terminal-header">
    <div class="terminal-controls">
      <span class="control-dot red"></span>
      <span class="control-dot yellow"></span>
      <span class="control-dot green"></span>
    </div>
    <div class="terminal-title">ZION MAINFRAME // CARD DATABASE v4.5.0</div>
    <div class="terminal-status">
      <span class="status-indicator"></span>
      CONNECTED
    </div>
  </div>
</template>

<style scoped>
.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
  border: 1px solid var(--matrix-green);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 10px 15px;
}

.terminal-controls {
  display: flex;
  gap: 6px;
}

.control-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.control-dot.red { background: #ff5f56; }
.control-dot.yellow { background: #ffbd2e; }
.control-dot.green { background: #27ca40; }

.terminal-title {
  color: var(--matrix-green);
  font-size: 0.85rem;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.terminal-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #0f0;
  font-size: 0.75rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: #0f0;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 5px #0f0; }
  50% { opacity: 0.5; box-shadow: 0 0 2px #0f0; }
}
</style>
