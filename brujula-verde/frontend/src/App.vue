<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade-page" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
auth.restaurarSesion()
</script>

<style>
.fade-page-enter-active,
.fade-page-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.fade-page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>