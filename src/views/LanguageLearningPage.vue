<template>
  <div>
    <el-container style="height: 100vh;">
      <el-header style="height: auto;">
        <el-row class="mt-2">
          <el-col :span="3">
            <ElInput v-model="videoId" class="pe-2" placeholder="Type Video Id" />
          </el-col>
          <el-col :span="3">
            <el-select v-model="selectNoteType" placeholder="Note Type" class="pe-2">
              <el-option v-for="item in noteTypeOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="5">
            <div class="checkbox-ctn">
              <el-checkbox v-model="autoPlayAudio" label="Auto Play Audio" size="large"></el-checkbox>
              <el-checkbox v-model="hideMeaning" label="Hide Meaning" size="large"></el-checkbox>
              <el-checkbox v-model="autoHideUpdatedNote" label="Hide Updated" size="large"></el-checkbox>
            </div>
          </el-col>
          <el-col :span="3">
            <el-select v-model="voiceType">
              <el-option :key="0" :value="'Context'" :label="'Context Voice'"></el-option>
              <el-option :key="1" :value="'Word'" :label="'Word Voice'"></el-option>
            </el-select>
          </el-col>
          <!-- <el-col :span="3">
            <el-button type="primary" @click="openSearchPhraseDialog">Search Phrase</el-button>
          </el-col> -->

          <el-col :span="7">
            <div class="d-flex justify-content-end w-100">
              <el-upload :auto-upload="false" :action="`${SERVER_BASE_URL}/upload-lre-file`" :multiple="false"
                :name="'lre_file'" :method="'post'" ref="uploadRef" accept=".zip,.rar,.7zip"
                :on-success="onUploadLreFileSuccess" :on-error="onUploadLreFileError">
                <template #trigger>
                  <el-button type="primary">Select File</el-button>
                </template>
                <el-button class="ms-3" type="success" @click="submitUploadFileContent">
                  Upload To Server
                </el-button>
              </el-upload>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-main style="height: 100%; padding-top: 8px;">
        <ReviewLessonWord v-if="selectNoteType == 0" :video-id="videoId" :auto-play-audio="autoPlayAudio"
          :auto-hide-updated-note="autoHideUpdatedNote" :voice-type="voiceType" :hide-meaning="hideMeaning">
        </ReviewLessonWord>
        <ReviewLessonPhrase v-if="selectNoteType == 1" :video-id="videoId" :auto-play-audio="autoPlayAudio"
          :auto-hide-updated-note="autoHideUpdatedNote">
        </ReviewLessonPhrase>
       
      </el-main>
    </el-container>
  </div>
</template>
<script lang="ts" setup>
import {
  ElContainer,
  ElHeader,
  ElMain, ElUpload, UploadInstance,
  ElRow, ElCol, ElSelect, ElButton, ElOption, ElMessage, ElInput, ElCheckbox, ElMessageBox, ElAlert, ElRadioGroup, ElRadio
} from 'element-plus';
import { ref } from 'vue';
import ReviewLessonWord from './components/ReviewLessonWord.vue'
import ReviewLessonPhrase from './components/ReviewLessonPhrase.vue';
import {SERVER_BASE_URL} from '@/libs/url';

const videoId = ref<string>("")
const selectNoteType = ref<number>(0)
const autoPlayAudio = ref(true)
const autoHideUpdatedNote = ref(true)
const hideMeaning = ref(true)
const voiceType = ref("Word")
const uploadRef = ref<UploadInstance>()
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

const submitUploadFileContent = () => {
  ElMessageBox.confirm(
    'Are you sure want to import new data. Continue?',
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(() => {
      uploadRef.value!.submit();
    }).catch(() => { })
}

const onUploadLreFileSuccess = () => {
  ElMessage({
    type: 'success',
    message: 'Import Data Successful ^-^',
  })
}

const onUploadLreFileError = (err : Error) => {
  ElMessage({
    type: 'error',
    message: err.message,
  })
}

</script>

<style>
body {
  font-family: Arial, Helvetica, sans-serif;
}

.ql-editor {
  font-size: 18px;
}

.el-table {
  --el-table-current-row-bg-color: #bfe1fc
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
  justify-content: flex-start;
  grid-gap: 7px;
}

.card-images img {
  width: 50%;
}
.el-alert {
  margin: 20px 0 0;
}
.el-alert:first-child {
  margin: 0;
}
.checkbox-ctn{
  margin-top: -7px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* 3 columns */
  grid-template-rows: repeat(2, 1fr);
  /* 2 rows */
  gap: 10px;
}
.checkbox-ctn>label{
  height: 20px !important;
}
</style>

