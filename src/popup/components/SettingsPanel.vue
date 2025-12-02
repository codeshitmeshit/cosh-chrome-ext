<template>
  <section class="settings-panel">
    <h2 class="settings-title">Settings</h2>
    <p class="settings-desc">hello world（这里是设置页的预留入口）</p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SettingsPanel'
})
</script>

<style scoped>
.settings-panel {
  min-width: 280px;
  padding: 16px 12px;
  color: #ffffff;
  text-align: left;
}

.settings-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.settings-desc {
  margin: 0;
  font-size: 13px;
  opacity: 0.8;
}
</style>


