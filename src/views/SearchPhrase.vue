<template>
  <el-container>
    <el-header>
      <el-row :gutter="20">
        <el-col :span="2">
          <el-input-number v-model:model-value="lessonId" placeholder="Please input Note Id"></el-input-number>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="getLesson">Get Lesson</el-button>
        </el-col>
        <el-col :span="14">
          <el-select-v2 v-model="selectedPhraseId" style="width: 100%;" remote :remote-method="searchNote" clearable
            :options="searchNoteOptions" :loading="loading" placeholder="Please enter phrase name" filterable
            @keyup.ctrl.space="searchPhraseOnGoole" @keyup.enter="addPhrase">
            <template #default="{ item }">
              <b v-html="item.label" class="me-2"></b>
              <span>&#8594; </span>
              <span v-html="item.options">
              </span>
            </template>
          </el-select-v2>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="addPhrase">Add Phrase</el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <el-row>
        <h4 v-html="lessonName"></h4>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8" v-for="phrase in phrases">
          <el-card class="box-card mb-10">
            <template #header>
              <div class="card-header">
                <div>
                  <mark><b v-html="phrase.Front"></b></mark>
                </div>
                <div style="max-width: 80px;">
                  <el-button class="button" type="danger" plain
                    @click="() => removePhrase(phrase.NoteId)">Remove</el-button>
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
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
import { ElButton, ElCol, ElInput, ElRow, ElSelectV2, ElCard, ElMessage, ElInputNumber, ElContainer, ElMain, ElHeader } from 'element-plus';
import ajax from '@/libs/ajax';
import { OptionType } from 'element-plus/es/components/select-v2/src/select.types';
import NoteInfo from '@/models/note/NoteInfo'
import { isNumeric, isStringNullOrEmpty } from "@/libs/util"

const lessonId = ref<number>(1700274502629)
const lessonName = ref<string>();

const selectedPhraseId = ref<any>();
const searchNoteOptions = ref<OptionType[]>([]);

const loading = ref(false);
const phrases = ref<NoteInfo[]>([])
let lessonPhraseIds: number[] = [];
let isLoadedLesson = false;

// get lesson
const getLesson = () => {
  if (!lessonId.value) {
    return
  }
  isLoadedLesson = false;
  lessonName.value = "";
  phrases.value = [];
  lessonPhraseIds = [];
  // get phrase belong to lesson
  getNotes(lessonId.value.toString(), (data: any) => {
    lessonName.value = data.result[0].fields["Lesson Name"].value
    var phraseIdsString = data.result[0].fields["PhraseIds"].value as string
    getPhrase(phraseIdsString);
  })
}

// get phrase belong to lesson
const getPhrase = (phraseIdsString: any) => {
  if (isStringNullOrEmpty(phraseIdsString)) {
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

// search phrases
const searchNote = (query: string) => {
  selectedPhraseId.value = undefined;
  loading.value = true;
  searchNoteOptions.value = []
  ajax.get("/search-phrase?search=" + query).then((res) => {
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
  }).catch(res => {
    console.log(res.message)
  })
}

// add phrase to lesson 
const addPhrase = () => {
  if (!isLoadedLesson) {
    ElMessage({
      message: 'You must load lesson before add phrase',
      type: 'warning',
    })
    return
  }

  if (isStringNullOrEmpty(selectedPhraseId.value)) {
    ElMessage({
      message: 'You must choose phrase',
      type: 'error',
    })
    return
  }
  if (lessonPhraseIds.indexOf(selectedPhraseId.value) >= 0) {
    ElMessage({
      message: 'Phrase already added',
      type: 'error',
    })
    return
  }

  var temphraseIds = lessonPhraseIds.slice() // clone
  temphraseIds.push(selectedPhraseId.value)
  var data = JSON.stringify({
    lessonId: lessonId.value,
    phraseIds: temphraseIds.join(",")
  })
  ajax.post("/lesson-phrase", data)
    .then(res => {
      getPhrase(selectedPhraseId.value?.toString())
      selectedPhraseId.value = undefined
    })
    .catch(res => {
      console.log(res.message)
    })
}

const removePhrase = (phraseId: number) => {
  lessonPhraseIds = lessonPhraseIds.filter(id => id != phraseId)

  var data = JSON.stringify({
    lessonId: lessonId.value,
    phraseIds: lessonPhraseIds.join(",")
  })
  ajax.post("/lesson-phrase", data)
    .then(res => {
      phrases.value = phrases.value.filter(p => p.NoteId != phraseId)
    })
    .catch(res => {
      console.log(res.message)
    })
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

// get notes by id
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
</style>

