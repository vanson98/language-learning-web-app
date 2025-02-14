<template>
  <router-view></router-view>
</template>

<script lang="ts" setup>
import { useUserInfoStore } from './store/UserStore';

  const userStore = useUserInfoStore()
  userStore.fetchUserInfo()
</script>

<style></style>
