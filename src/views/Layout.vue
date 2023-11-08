<template>
  <div>
    <el-container>
      <el-main>
        <div>
          <router-view />
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script lang="ts" setup>
import { ElContainer, ElHeader, ElMain } from 'element-plus';
</script>

<style>
body {
  font-family: Arial, Helvetica, sans-serif;
}
</style>