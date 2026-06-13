<template>
  <n-config-provider>
    <n-message-provider>
      <AppHeader />
      <router-view />
      <AppFooter />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import Icon from './components/Icon.vue'
</script>
