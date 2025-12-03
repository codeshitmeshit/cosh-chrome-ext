<template>
  <section class="about-panel">
    <h2 class="about-title">关于</h2>
    <div class="about-content">
      <p class="author-info">作者：<span class="author-name">cosh</span></p>
    </div>
    <div class="cosh-content">
      <p class="cosh-info">
        <strong>chrome 插件 v1.0.0</strong>
      </p>
      <p class="cosh-info">
        在money_flow基础上进行了适配与优化。<br />
        将原本的 Web应用 改造成了 Chrome插件，<br />
        并在体验和功能上做了一些改进，再次感谢 money_flow
        源项目提供的灵感与基础实现。
      </p>
    </div>
    <!-- 这个放在最后面，相当于footer区域 -->
    <div class="thanks-content">
      <h2 class="thanks-title">鸣谢</h2>
      <p class="thanks-info">
        感谢
        <span class="author-name">
          <a
            href="https://github.com/MoePlayer/money_flow"
            target="_blank"
            rel="noopener noreferrer"
          >
            money_flow 源项目（GitHub）
          </a>
        </span>
        提供了灵感与基础实现。
      </p>
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

.thanks-info {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.thanks-content {
  padding: 12px 0 0;
  margin-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
}

.cosh-content {
  padding: 12px 0 0;
  margin-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
}

.cosh-info {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}
</style>
