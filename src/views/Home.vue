<template>
  <div>
    <el-container>
      <el-header style="height: 8vh;">
        <el-row class="mt-2">
          <el-col :span="3">
            <ElInput v-model="videoId" class="pe-2" />
          </el-col>
          <el-col :span="3">
            <el-select v-model="selectNoteType" placeholder="Note Type" class="pe-2">
              <el-option v-for="item in noteTypeOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <!-- <el-col :span="3">
            <el-button type="success" @click="getLessonData">Load Lesson</el-button>
          </el-col> -->
          <!-- <el-col :span="3">
            <el-button type="primary" @click="openSearchPhraseDialog">Search Phrase</el-button>
          </el-col> -->
          <el-col :span="2">
            <el-button type="danger" v-bind:loading="importingLRData" @click="importLRData">
              Import LR Data</el-button>
          </el-col>

        </el-row>
      </el-header>
      <el-main style="height: 90vh;">
        <ReviewLessonWord v-if="selectNoteType == 0" :video-id="videoId">
        </ReviewLessonWord>
        <ReviewLessonPhrase v-if="selectNoteType == 1" :video-id="videoId">
        </ReviewLessonPhrase>
      </el-main>
    </el-container>
  </div>
</template>
<script lang="ts" setup>
import ajax from '@/libs/ajax';
import {
  ElContainer,
  ElHeader,
  ElMain,
  ElRow, ElCol, ElSelect, ElButton, ElOption, ElMessage, ElInput,
} from 'element-plus';
import { ref } from 'vue';
import ReviewLessonWord from './components/ReviewLessonWord.vue'
import ReviewLessonPhrase from './components/ReviewLessonPhrase.vue';


const videoId = ref<string>("70274007")
const selectNoteType = ref<number>(0)
const importingLRData = ref(false)


const noteTypeOptions = [
  {
    value: 0,
    label: 'Words'
  },
  {
    value: 1,
    label: "Phrase"
  }
]

const importLRData = () => {
  importingLRData.value = true
  ajax.post("/import-lr-data").then(res => {
    importingLRData.value = false
    if (res.status == 200) {
      ElMessage({
        type: 'success',
        message: 'Import Data Successful ^-^',
      })
    }
  }).catch(res => {
    importingLRData.value = false
    ElMessage({
      type: 'success',
      message: 'Import Data Fail :(',
    })
  })
}

// const openSearchPhraseDialog = () => {
//   searchPhraseDialogVisible.value = true
// }


</script>

<style>
body {
  font-family: Arial, Helvetica, sans-serif;
}

.ql-editor {
  font-size: 18px;
}

.word-card-box {
  width: 500px;
  margin: auto;
}

.word-card-box h3 {
  margin: 0;
}

.card-images {
  display: flex;
  justify-content: space-between;
  grid-gap: 7px;
}

.card-images img {
  width: 50%;
}
</style>