<template>
  <el-container>
    <el-header style="height: auto;">
      <el-button type="primary" @click="addPhrase">Add Phrase</el-button>
    </el-header>
    <el-main style="padding-top: 0; padding-bottom: 0;">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-select-v2 v-model="selectedPhraseId" style="width: 100%;" remote :remote-method="searchNote" clearable
            :options="searchNoteOptions" :loading="loading" placeholder="Please enter phrase name" filterable
            @keyup.ctrl.space="searchPhraseOnGoole" @change="addPhrase">
            <template #default="{ item }">
              <b v-html="item.label" class="me-2"></b>
              <span>&#8594; </span>
              <span v-html="item.options">
              </span>
            </template>
          </el-select-v2>
        </el-col>
        <el-col :span="14" >
          <div class="phrase-card-container">
            <el-card class="box-card mb-10" v-for="phrase in phrases" :key="phrase.NoteId">
            <template #header>
              <div class="card-header">
                <div>
                  <mark><b v-html="phrase.Front"></b></mark>
                </div>
                <div style="max-width: 80px;">
                  <el-button class="button" type="primary" plain style="margin: 3px 0 0 0;"
                    @click="() => copyNoteId(phrase.NoteId)">
                    Copy Id
                  </el-button>
                </div>
              </div>
            </template>
            <div>
              <span v-html="phrase.Meaning"></span>
              <hr>
              <span v-html="phrase.Example"></span>
            </div>
          </el-card>
          </div>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
import { ElButton, ElCol, ElInput, ElRow, ElSelectV2, ElCard, ElMessage, ElInputNumber, ElContainer, ElMain, ElHeader } from 'element-plus';
import {ajax} from '@/libs/ajax';
import { OptionType } from 'element-plus/es/components/select-v2/src/select.types';
import NoteInfo from '@/models/note/NoteInfo'
import { isStringNullOrEmpty } from "@/libs/util"

const lessonId = ref<number>(1700274502629)
const lessonName = ref<string>();

const selectedPhraseId = ref<any>();
const searchNoteOptions = ref<OptionType[]>([]);

const loading = ref(false);
const phrases = ref<NoteInfo[]>([])




// search phrases by key word
const searchNote = (keyword: string) => {
  if(!keyword){
    return
  }
  loading.value = true;
  searchNoteOptions.value = []
  phrases.value = []
  ajax.get("/search-phrase?search=" + keyword).then((res) => {
    loading.value = false
    if (Array.isArray(res.data.result)) {
      res.data.result.forEach((element: any) => {
        searchNoteOptions.value.push({
          label: element.fields.Front.value,
          options: element.fields.Meaning.value,
          value: element.noteId
        })
        phrases.value.push({
          Front: element.fields.Front.value,
          Example: element.fields.Example.value,
          Meaning: element.fields.Meaning.value,
          NoteId: element.noteId
        })
      });
    }
  }).catch(res => {
    console.log(res.message)
  })
}

// add phrase to lesson 
const addPhrase = () => {
  if (isStringNullOrEmpty(selectedPhraseId.value)) {
    return
  }
  var selectedPhraseIndex = phrases.value.findIndex(p=>p.NoteId==selectedPhraseId.value)
  var firstPhrase = phrases.value[0]
  phrases.value[0] = phrases.value[selectedPhraseIndex]
  phrases.value[selectedPhraseIndex] = firstPhrase
}



const searchPhraseOnGoole = (event: Event) => {
  var inputElement = event.target as HTMLInputElement;
  var inputValue = inputElement.value
  if (inputValue != null && selectedPhraseId.value == null) {
    var searchString = inputValue.split(" ").join("+")
    var url = `https://www.google.com/search?q=${searchString}`
    window.open(url, "_blank", "height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes")
  }
}

const copyNoteId = (noteId: number) => {
  navigator.clipboard.writeText(noteId.toString())
}

</script>
  

<style>
.card-header {
  display: flex;
  justify-content: space-between;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.box-card {
  width: 100%;
  margin-bottom: 20px;
}

.phrase-card-container{
  height: 100%;
  overflow-y: scroll;
  height: 87vh;
  border: 1px solid;
}
</style>

