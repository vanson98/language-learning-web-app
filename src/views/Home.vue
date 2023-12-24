<template>
  <div>
    <el-container>
      <el-header style="height: auto;">
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
            <el-checkbox v-model="autoPlayAudio" label="Auto Play Audio" size="large"></el-checkbox>
          </el-col>
          <!-- <el-col :span="3">
            <el-button type="primary" @click="openSearchPhraseDialog">Search Phrase</el-button>
          </el-col> -->

          <el-col :span="12">
            <div class="d-flex justify-content-end w-100">

              <!-- <form :action="`${SERVER_BASE_URL}/upload-lre-file`" method="POST" enctype="multipath/form-data">
                <input type="file" name="lre_file" id="lre_file">
                <button type="submit">SUBMIT</button>
              </form> -->
              <el-upload 
                :auto-upload="false" 
                :action="`${SERVER_BASE_URL}/upload-lre-file`" 
                :multiple="false"
                :name="'lre_file'" 
                :method="'post'" 
                ref="uploadRef" 
                accept=".zip,.rar,.7zip" 
                :on-success="onUploadLreFileSuccess"
                :on-error="onUploadLreFileError">
                <template #trigger>
                  <el-button type="primary">Select File</el-button>
                </template>

                <el-button class="ms-3" type="success" @click="submitUploadFileContent">
                  Upload To Server
                </el-button>


              </el-upload>
              <!-- <el-button type="danger" v-bind:loading="importingLRData" @click="importLRData">
                Import LR Data</el-button> -->
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-main style="height: 90vh;overflow: hidden;">
        <ReviewLessonWord v-if="selectNoteType == 0" :video-id="videoId" :auto-play-audio="autoPlayAudio">
        </ReviewLessonWord>
        <ReviewLessonPhrase v-if="selectNoteType == 1" :video-id="videoId" :auto-play-audio="autoPlayAudio">
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
  ElMain, ElUpload, UploadInstance,
  ElRow, ElCol, ElSelect, ElButton, ElOption, ElMessage, ElInput, ElCheckbox, ElMessageBox,
} from 'element-plus';
import { ref } from 'vue';
import ReviewLessonWord from './components/ReviewLessonWord.vue'
import ReviewLessonPhrase from './components/ReviewLessonPhrase.vue';
import SERVER_BASE_URL from '@/libs/url';

const videoId = ref<string>("81223025")
const selectNoteType = ref<number>(0)
const importingLRData = ref(false)
const autoPlayAudio = ref(false)
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

const importLRData = () => {

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
    }).catch(() => { })


}


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

const onUploadLreFileError = () => {
  ElMessage({
    type: 'error',
    message: 'Import Data Fail @-@',
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
  justify-content: space-between;
  grid-gap: 7px;
}

.card-images img {
  width: 50%;
}
</style>