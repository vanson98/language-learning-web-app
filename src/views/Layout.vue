<template>
  <div>
    <el-container>
      <el-header>
        <ElRow class="mt-2">
          <el-col :span="3">
            <ElInputNumber v-model="lessonId" type="number"/>
          </el-col>
          <el-col :span="3">
            <el-select v-model="noteType" placeholder="Note Type" class="me-2">
              <el-option 
                v-for="item in noteTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                >
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-button type="success" @click="getLessonNotes">Load Lesson</el-button>
          </el-col>
          <el-col :span="3">
            <el-button type="primary">Import LR Data</el-button>
          </el-col>
        </ElRow>
      </el-header>
      <el-container>
        <el-main>
          <el-table></el-table>
        </el-main>
        <el-aside style="background-color: aqua;height: 100%;"></el-aside>
      </el-container>
    </el-container>
  </div>
</template>
<script lang="ts" setup>
import ajax from '@/libs/ajax';
import { ElContainer, ElHeader, ElMain, ElAside, ElRow, ElCol, ElSelect, ElInputNumber, ElButton, ElOption, ElTable } from 'element-plus';
import { ref } from 'vue';

const lessonId = ref<number>()
const noteType = ref<number>(0)

const noteTypeOptions = [
  {
    value: 0,
    label: 'Words'
  },
  {
    value: 1,
    label: "LR Phrase"
  },
  {
    value: 2,
    label: "Phrase"
  }
]

const getLessonNotes = () =>{
  if(noteType.value == 0){
    ajax.get(`/lesson-words?lessonId=${lessonId.value}`)
    .then(res=>{
      console.log(res.data)
    })
    .catch(res=>{
      console.log(res)
    })
  }
 
}

</script>

<style>
body {
  font-family: Arial, Helvetica, sans-serif;
}
</style>