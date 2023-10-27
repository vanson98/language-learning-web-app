<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <el-input v-model:model-value="noteId" placeholder="Please input Note Id"></el-input>
    </el-col>
    <el-col :span="6">
      <el-button type="primary"  @click="getNote">Get Lesson</el-button>
    </el-col>
    <el-col :span="6">
      <el-input v-model="searchPhrase"></el-input>
    </el-col>
    <el-col :span="6">
      <el-button type="primary">Search Phrase</el-button>
    </el-col>
    
  </el-row>
  <div>
     <h4 v-html="lessonName"></h4>
  </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
import { ElButton, ElCol, ElInput, ElRow } from 'element-plus';
import ajax from '@/libs/ajax';
const noteId = ref<number>(1695944403453)
const lessonName = ref<string>();
const searchPhrase = ref<string>();

const getNote = () => {
  ajax.get("/note?id="+noteId.value).then(response => {
    lessonName.value = response.data.result[0].fields["Lesson Name"].value 
  })
}

</script>
  