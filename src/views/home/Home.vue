<template>
  <el-row :gutter="20">
    <el-col :span="2">
      <el-input v-model:model-value="lessonId" placeholder="Please input Note Id"></el-input>
    </el-col>
    <el-col :span="2">
      <el-button type="primary" @click="getLesson">Get Lesson</el-button>
    </el-col>
    <el-col :span="14">
      <el-select-v2 v-model="selectedPhraseId" style="width: 100%;" filterable remote :remote-method="searchNote" clearable
        :options="searchNoteOptions" :loading="loading" placeholder="Please enter phrase name">
        <template #default="{ item }">
          <b v-html="item.label" class="me-2"></b>
          <span>&#8594; </span>
          <span v-html="item.options">
          </span>
        </template>
      </el-select-v2>
    </el-col>
    <el-col :span="6">
      <el-button type="primary" @click="onAddPhraseButtonClick">Add Phrase</el-button>
    </el-col>

  </el-row>
  <el-row>
    <h4 v-html="lessonName"></h4>
  </el-row>
  <el-row :gutter="20">
    <el-col :span="8" v-for="phrase in phrases">
      <el-card class="box-card mb-10" >
        <template #header>
          <div class="card-header">
            <span v-html="phrase.Front"></span>
            <el-button class="button" type="danger" plain>Remove</el-button>
          </div>
        </template>
        <div>
          <span v-html="phrase.Meaning"></span>
          <hr>
          <span v-html="phrase.Example"></span>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
import { ElButton, ElCol, ElInput, ElRow, ElSelectV2, ElCard, ElMessage } from 'element-plus';
import ajax from '@/libs/ajax';
import { OptionType } from 'element-plus/es/components/select-v2/src/select.types';
import NoteInfo from '@/models/note/NoteInfo'

const lessonId = ref<number>(1695944403453)
const lessonName = ref<string>();
const selectedPhraseId = ref<number | undefined>();
const searchNoteOptions = ref<OptionType[]>([]);
const loading = ref(false);
const phrases = ref<NoteInfo[]>([])
let lessonPhraseIds : number[] = [];
let isLoadedLesson = false;

const getLesson = () => {
  if(!lessonId.value){
    return
  }
  isLoadedLesson =false;
  lessonName.value = "";
  phrases.value = [];
  lessonPhraseIds = [];
  getNotes(lessonId.value.toString(), (data: any) => {
    lessonName.value = data.result[0].fields["Lesson Name"].value
    // get phrase belong to lesson
    var phraseIdsString = data.result[0].fields["PhraseIds"].value as string
    getPhrase(phraseIdsString);
  })
}

const getPhrase = (phraseIdsString: string) =>{
  if(phraseIdsString == ""){
    isLoadedLesson = true;
    return
  }
  getNotes(phraseIdsString, (data) => {
      data.result.forEach((note: any) => {
        lessonPhraseIds.push(note.noteId as number)
        phrases.value.push({
          NoteId: note.noteId as number,
          Front: note.fields.Front.value as string,
          Example: note.fields.Example.value as string,
          Meaning: note.fields.Meaning.value as string,
        })
      });
      isLoadedLesson = true;
    })
}

const getNotes = (noteIds: string, onRequestSuccess: (response: any) => void) => {
  const queryString = "?ids=" + noteIds
  ajax.get("/notes" + queryString).then(response => {
    var error = response.data.error
    if (error != null) {
      console.log(error)
      return
    }
    onRequestSuccess(response.data);
  }).catch((res) => {
    console.log(res.data)
  })
}

const searchNote = (query: string) => {
  loading.value = true;
  searchNoteOptions.value = []
  ajax.get("/search-note?search=" + query).then((res) => {
    loading.value = false
    if (Array.isArray(res.data.result)) {
      res.data.result.forEach((element: any) => {
        searchNoteOptions.value.push({
          label: element.fields.Front.value,
          options: element.fields.Meaning.value,
          value: element.noteId
        })
      });
    }
  })
}

const onAddPhraseButtonClick = () => {
  if(!isLoadedLesson){
    ElMessage({
      message: 'You must load lesson before add phrase',
      type: 'warning',
    })
    return
  }
  if (selectedPhraseId.value) {
    if(lessonPhraseIds.indexOf(selectedPhraseId.value) >= 0){
      return
    }
    lessonPhraseIds.push(selectedPhraseId.value)
    var data = JSON.stringify({
      lessonId : lessonId.value,
      phraseIds: lessonPhraseIds.join(",")
    })
    ajax.post("/lesson-phrase",data).then(res=>{
      console.log(res.data)
    })  
    .catch(res=>{
      console.log(res.message)
    })
  }else{
    ElMessage({
      message: 'You must choose phrase',
      type: 'warning',
    })
  }
}

</script>
  

<style>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
</style>

