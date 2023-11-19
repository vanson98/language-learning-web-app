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
      <el-main>
        <el-carousel type="card" :autoplay="false" :loop="false" height="500px" ref="carouselRef"
          @change="onCarouseChange">
          <el-carousel-item v-for="(item, index) in lessonWords" :key="item.NoteId" :name="item.NoteId">
            <el-card class="word-card-box">
              <h3>{{ item.Lemma }}</h3>
              <div class="m-1">
                <el-tag v-for="tag in item.Tags" :key="tag" effect="dark">{{ tag }}</el-tag>
              </div>
              <p v-html="item.IPA" class="mb-2"></p>
              <p v-html="item.WordDefinition"></p>
              <hr>
              <p v-html="item.Context"></p>
              <hr>
              <p v-html="item.ContextTranslation" class="word-ctx-translation"></p>
              <input autofocus :id="'input-word_' + index" class="w-100">
            </el-card>
          </el-carousel-item>
        </el-carousel>
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
  ElAside, ElRow, ElCol, ElSelect, ElInputNumber, ElButton, ElOption, ElMessage, ElInput,
  ElCarousel, ElCarouselItem, ElCard, ElTag
} from 'element-plus';
import { ref } from 'vue';
import AnkiResponseModel from '@/models/response/AnkiResponseModel'
import LessonWord from '@/models/word/LessonWord'
import moment from 'moment';

const videoId = ref<string>("70274007")
const noteType = ref<number>(0)
const importingLRData = ref(false)
const lessonWords = ref<LessonWord[]>([])
const carouselRef = ref()
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

      if (res.data.result != null) {
        res.data?.result.forEach((item: any) => {
          lessonWords.value.push({
            AudioFileName: item["fields"]["Audio clip media filename"].value as string,
            Context: item["fields"].Context.value as string,
            ContextTranslation: item["fields"]["Context translation"].value as string,
            DateCreated: moment(item["fields"]["Date created"].value as string, "YYYY-MM-DD hh:mm").toDate(),
            IPA: item["fields"]["IPA"].value,
            Lemma: item["fields"]["Lemma"].value,
            NextImageFileName: item["fields"]["Next Image media filename"].value,
            PrevImageFileName: item["fields"]["Previous Image media filename"].value,
            Word: item["fields"]["Word"].value,
            WordDefinition: item["fields"]["Word definition"].value,
            NoteId: item.noteId,
            Tags: item.tags
          })
        })
      }
      console.log(lessonWords.value)
    })
    .catch(res => {
      console.log(res)
    })


}

window.addEventListener('keyup', (e) => {
  if (e.key == 'Enter' && carouselRef.value != null) {
    carouselRef.value.next()
  }

});

const onCarouseChange = (activeIndex: any, oldActiveIndex: any) => {
  document.getElementById("input-word_" + activeIndex)?.focus()
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

.word-card-box {
  width: 500px;
  margin: auto;
}

.word-card-box h3 {
  margin: 0;
}
</style>