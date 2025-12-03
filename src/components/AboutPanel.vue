<template>
  <section class="about-panel">
    <h2 class="about-title">关于</h2>
    <div class="about-content">
      <p class="author-info">作者：<span class="author-name">cosh</span></p>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AboutPanel'
})
</script>

<style scoped>
.about-panel {
  min-width: 280px;
  padding: 16px 12px;
  color: #ffffff;
  text-align: left;
}

.about-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.about-content {
  padding: 8px 0;
}

.author-info {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.author-name {
  font-weight: 600;
  color: #00d9ff;
}
</style>


