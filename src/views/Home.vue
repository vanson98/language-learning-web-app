<template>
  <div>
    <el-container>
      <el-header>
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
          <el-col :span="3">
            <el-button type="success" @click="getLessonData">Load Lesson</el-button>
          </el-col>
          <el-col :span="3">
            <el-button type="primary" @click="openSearchPhraseDialog">Search Phrase</el-button>
          </el-col>
          <el-col :span="3">
            <el-button type="danger" v-bind:loading="importingLRData" @click="importLRData">
              Import LR Data</el-button>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <ReviewLessonWordSlider v-if="selectNoteType == 0" :carousel-ref-fun="carouselRefFn" :lesson-words="lessonWords"
          @on-slice-change="playCardAudio">
        </ReviewLessonWordSlider>
        <ReviewLessonPhraseSlider v-if="selectNoteType == 1" :lesson-phrases="lessonPhrases"
          :carousel-ref-fun="carouselRefFn" @on-slice-change="playCardAudio" @on-selected-text="onSelectedText">
        </ReviewLessonPhraseSlider>
      </el-main>
    </el-container>
  </div>
  <SearchPhraseDialog :visible="searchPhraseDialogVisible" :search-text="searchText" @close="closeSearchPhraseDialog" />
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
import AnkiResponseModel from '@/models/response/AnkiResponseModel'
import LessonWordModel from '@/models/lesson/LessonWordModel'
import LessonPhraseModel from '@/models/lesson/LessonPhraseModel'
import moment from 'moment';
import ReviewLessonWordSlider from './components/ReviewLessonWordSlider.vue'
import ReviewLessonPhraseSlider from './components/ReviewLessonPhraseSlider.vue';
import SearchPhraseDialog from './modals/SearchPhraseDialog.vue'

const videoId = ref<string>("70274007")
const selectNoteType = ref<number>(0)
const importingLRData = ref(false)
const lessonWords = ref<LessonWordModel[]>([])
const lessonPhrases = ref<LessonPhraseModel[]>([])
const carouselRef = ref()
const carouselRefFn = () => carouselRef

const searchText = ref<string>("")
const searchPhraseDialogVisible = ref<boolean>(false)

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
let currentActiveCardIndex: number = 0;

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
  getLessonWord()
  getLessonPhrases()
}

const getLessonWord = () => {
  ajax.get<AnkiResponseModel>(`/lesson-words?vid=${videoId.value}`)
    .then(res => {
      if (res.data.error != null) {
        showErrorAlert(res.data.error)
        return
      }
      if (res.data.result != null) {
        lessonWords.value = []
        res.data?.result.forEach((item: any) => {
          lessonWords.value.push({
            AudioFileName: item["fields"]["Audio clip media filename"].value as string,
            Context: item["fields"].Context.value,
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
        lessonWords.value.sort((a, b): number => {
          if (a.DateCreated < b.DateCreated) {
            return -1
          } else if (a.DateCreated > b.DateCreated) {
            return 1
          }
          return 0
        })
      }
    })
    .catch(res => {
      console.log(res)
    })
}

const getLessonPhrases = () => {
  ajax.get<AnkiResponseModel>(`/lesson-phrases?vid=${videoId.value}`)
    .then(res => {
      if (res.data.error != null) {
        showErrorAlert(res.data.error)
        return
      }
      if (res.data.result != null) {
        lessonPhrases.value = []
        res.data?.result.forEach((item: any) => {
          lessonPhrases.value.push({
            NoteId: item.noteId,
            Tags: item.tags,
            Context: item["fields"].Context.value,
            ContextTranslation: item["fields"]["Context translation"].value as string,
            NextImageFileName: item["fields"]["Next Image media filename"].value,
            PrevImageFileName: item["fields"]["Previous Image media filename"].value,
            AudioFileName: item["fields"]["Audio clip media filename"].value as string,
            DateCreated: moment(item["fields"]["Date created"].value as string, "YYYY-MM-DD hh:mm").toDate(),
            PhraseId: item["fields"]["PhraseId"].value as string,
          })
        })
        lessonPhrases.value.sort((a, b): number => {
          if (a.DateCreated < b.DateCreated) {
            return -1 // a --> b
          } else if (a.DateCreated > b.DateCreated) {
            return 1  // b --> a
          }
          return 0
        })
      }
    })
    .catch(res => {
      console.log(res)
    })
}

const playCardAudio = (cardIndex: number) => {
  currentActiveCardIndex = cardIndex;
  const element = document.getElementById("card-audio-" + cardIndex)
  if (element instanceof HTMLAudioElement) {
    element.play()
  }
}

const openSearchPhraseDialog = () => {
  searchPhraseDialogVisible.value = true
}

const closeSearchPhraseDialog = () => {
  searchPhraseDialogVisible.value = false
}

const onSelectedText = (value: string | null) => {
  if (value != null && value.trim() != "") {
    searchText.value = value;
    searchPhraseDialogVisible.value = true;
  }
}

window.addEventListener('keyup', (e) => {
  var targetElement = e.target;
  if (!(targetElement instanceof HTMLInputElement)) {
    if (e.key == 'ArrowRight' && carouselRef.value != null) {
      carouselRef.value.next()
    }
    if (e.key == 'ArrowLeft' && carouselRef.value != null) {
      carouselRef.value.prev()
    }
    if (e.key == "r" || e.key == "R") {
      var audioElement = document.getElementById("card-audio-" + currentActiveCardIndex)
      if (audioElement instanceof HTMLAudioElement) {
        audioElement.play()
      }
    }
  }

});

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

.card-images img {
  width: 50%;
  padding: 8px;
}
</style>