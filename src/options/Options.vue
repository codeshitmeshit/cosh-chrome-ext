<template>
  <main class="px-4 py-10 text-center text-gray-700 dark:text-gray-200">
    <carbon-settings class="icon-btn mx-2 text-2xl" />
    <div>选项</div>
    <p class="my-2 opacity-50">
      这是扩展的选项页面
    </p>

    <input
      id="input"
      v-model="storageDemo"
      placeholder="同步 Storage 信息"
      aria-label="同步 Storage 信息"
      type="text"
      autocomplete="false"
      p="x-4 y-2"
      w="250px"
      text="center"
      bg="transparent"
      border="~ rounded gray-200 dark:gray-700"
      outline="none active:none"
    >

    <Footer />

    <div class="mt-4">
      由 Vite 强力驱动 <pixelarticons-zap class="align-middle" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { storageDemo } from '~/logic/storage'
</script>
