<template>
  <main class="popup-money-flow">
    <div class="popup-scale">
      <MoneyFlowApp />
    </div>
  </main>
</template>

<script setup lang="ts">
import MoneyFlowApp from '~/money-flow/App.vue'
</script>

<style scoped>
.popup-money-flow {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.popup-scale {
  transform: scale(0.85);
  transform-origin: top center;
}
</style>
