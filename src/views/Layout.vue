<template>
  <div>
    <el-container>
      <el-header>
        <ElRow class="mt-2">
          <el-col :span="3">
            <ElInput v-model="videoId" class="pe-2" />
          </el-col>
          <el-col :span="3">
            <el-select v-model="noteType" placeholder="Note Type" class="pe-2">
              <el-option v-for="item in noteTypeOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-button type="success" @click="getLessonData">Load Lesson</el-button>
          </el-col>
          <el-col :span="3">
            <el-button type="primary" v-bind:loading="importingLRData" @click="importLRData">
              Import LR Data</el-button>
          </el-col>
        </ElRow>
      </el-header>
      <el-container>
        <el-main>

        </el-main>
        <el-aside style="background-color: aqua;height: 100%;"></el-aside>
      </el-container>
    </el-container>
  </div>
</template>
<script lang="ts" setup>
import ajax from '@/libs/ajax';
import {
  ElContainer,
  ElHeader,
  ElMain,
  ElAside, ElRow, ElCol, ElSelect, ElInputNumber, ElButton, ElOption, ElMessage, ElInput
} from 'element-plus';
import { ref } from 'vue';
import AnkiResponseModel from '@/models/response/AnkiResponseModel'
import LessonWord from '@/models/word/LessonWord'
import moment from 'moment';

const videoId = ref<string>("81504327")
const noteType = ref<number>(0)
const importingLRData = ref(false)
const lessonWord = ref<LessonWord[]>([])

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

const importLRData = () => {
  importingLRData.value = true
  ajax.post("/import-lr-data").then(res => {
    importingLRData.value = false
    if (res.status == 200) {
      showSuccessAlert('Import Data Successful ^-^')
    }
  }).catch(res => {
    importingLRData.value = false
    console.log(res)
    showErrorAlert('Import Data Fail :(')
  })
}

const getLessonData = () => {
  // get lesson info
  // ajax.get(`/lesson?vid=${videoId.value}`).then((res)=>{
  //   console.log(res)
  // }).catch(res=>{

  // })

  ajax.get<AnkiResponseModel>(`/lesson-words?vid=${videoId.value}`)
    .then(res => {
      if (res.data.error != null) {
        showErrorAlert(res.data.error)
        return
      }
    
      if(res.data.result != null){
        res.data?.result.forEach((item: any)=> {
          lessonWord.value.push({
            AudioFileName: item["fields"]["Audio clip media filename"].value as string,
            Context: item["fields"].Context.value as string,
            ContextTranslation: item["fields"]["Context translation"].value as string,
            DateCreated: moment(item["fields"]["Date created"].value as string,"YYYY-MM-DD hh:mm").toDate(),
            IPA: item["fields"]["IPA"].value,
            Lemma: item["fields"]["Lemma"].value,
            NextImageFileName: item["fields"]["Next Image media filename"].value,
            PrevImageFileName: item["fields"]["Previous Image media filename"].value,
            Word: item["fields"]["Word"].value,
            WordDefinition: item["fields"]["Word definition"].value,
            NoteId: item.noteId
          })
        })
      }
      
    })
    .catch(res => {
      console.log(res)
    })


}

const showErrorAlert = (message: string) => {
  ElMessage({
    message: message,
    type: 'error',
  })
}
const showSuccessAlert = (message: string) => {
  ElMessage({
    message: message,
    type: 'success',
  })
}
</script>

<style>
body {
  font-family: Arial, Helvetica, sans-serif;
}
</style>