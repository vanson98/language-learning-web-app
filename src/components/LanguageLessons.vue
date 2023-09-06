<template>
  <div>Xin chao Son den voi view</div>
  <button @click="count++">You clicked me {{ count }} times :#.</button>
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
import { axios} from "axios";
const lessonContent = ref("");

const count = ref(0);
</script>
