<template>
  <main class="popup-shell">
    <aside class="popup-sidebar">
      <div class="sidebar-main">
        <button
          v-for="item in mainMenuItems"
          :key="item.key"
          class="sidebar-item"
          :class="{ active: activePanel === item.key }"
          type="button"
          @click="handleMenuClick(item.key)"
        >
          <span class="sidebar-icon">{{ item.icon }}</span>
        </button>
      </div>
      <div class="sidebar-footer">
        <button
          class="sidebar-item"
          :class="{ active: activePanel === 'about' }"
          type="button"
          @click="handleMenuClick('about')"
        >
          <span class="sidebar-icon">ℹ️</span>
        </button>
      </div>
    </aside>

    <section ref="contentRef" class="popup-content">
      <div class="popup-scale">
        <MoneyFlowApp v-if="activePanel === 'moneyFlow'" />
        <SettingsPanel v-else-if="activePanel === 'settings'" />
        <AboutPanel v-else-if="activePanel === 'about'" />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import MoneyFlowApp from '~/views/money-flow/App.vue'
import SettingsPanel from '~/components/SettingsPanel.vue'
import AboutPanel from '~/components/AboutPanel.vue'

type PanelKey = 'moneyFlow' | 'settings' | 'about'

const activePanel = ref<PanelKey>('moneyFlow')
const contentRef = ref<HTMLElement | null>(null)

const mainMenuItems: Array<{ key: PanelKey; icon: string }> = [
  {
    key: 'moneyFlow',
    icon: '💰'
  },
  {
    key: 'settings',
    icon: '⚙️'
  }
]

const scrollToTop = () => {
  nextTick(() => {
    if (contentRef.value) {
      contentRef.value.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
    // 同时滚动 window 和 document 到顶部（兼容性处理）
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  })
}

const handleMenuClick = (key: PanelKey) => {
  activePanel.value = key
  scrollToTop()
}
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

.sidebar-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
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
