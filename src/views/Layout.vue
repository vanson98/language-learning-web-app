<template>
  <div>
    <el-container>
      <el-header>
        <menu-component></menu-component>
      </el-header>
      <el-main>
        <div>
          <router-view />
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script lang="ts" setup>
import MenuComponent from '@/components/MenuComponent.vue';
import { ElContainer, ElHeader, ElMain } from 'element-plus';
</script>

<style>
body {
  font-family: Arial, Helvetica, sans-serif;
}
</style>