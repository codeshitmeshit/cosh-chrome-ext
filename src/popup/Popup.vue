<template>
  <main class="popup-shell">
    <aside class="popup-sidebar">
      <button
        v-for="item in menuItems"
        :key="item.key"
        class="sidebar-item"
        :class="{ active: activePanel === item.key }"
        type="button"
        @click="activePanel = item.key"
      >
        <span class="sidebar-icon">{{ item.icon }}</span>
      </button>
    </aside>

    <section class="popup-content">
      <div class="popup-scale">
        <MoneyFlowApp v-if="activePanel === 'moneyFlow'" />
        <SettingsPanel v-else-if="activePanel === 'settings'" />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MoneyFlowApp from '~/views/money-flow/App.vue'
import SettingsPanel from '~/components/SettingsPanel.vue'

type PanelKey = 'moneyFlow' | 'settings'

const activePanel = ref<PanelKey>('moneyFlow')

const menuItems: Array<{ key: PanelKey; icon: string }> = [
  {
    key: 'moneyFlow',
    icon: '💰'
  },
  {
    key: 'settings',
    icon: '⚙️'
  }
]
</script>

<style scoped>
.popup-shell {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
}

.popup-sidebar {
  width: 56px;
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.4);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.sidebar-item {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;
}

.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.sidebar-item.active {
  background: linear-gradient(135deg, #8a2be2, #00d9ff);
  color: #ffffff;
  box-shadow: 0 0 12px rgba(0, 217, 255, 0.5);
}

.sidebar-icon {
  font-size: 18px;
  line-height: 1;
}

.popup-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.popup-scale {
  transform: scale(0.85);
  transform-origin: top center;
}
</style>
