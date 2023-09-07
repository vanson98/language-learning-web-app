<template>
  <div>Input content</div>
  <button>Import</button>
  <el-input
    v-model="lessonContent"
    :autosize="{ minRows: 2, maxRows: 4 }"
    type="textarea"
    placeholder="Input your content here"
  ></el-input>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElInput } from "element-plus";
const lessonContent = ref("");

const count = ref(0);
</script>
