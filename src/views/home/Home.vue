<template>
  <el-row :gutter="20">
    <el-col :span="2">
      <el-input-number v-model:model-value="lessonId" placeholder="Please input Note Id" ></el-input-number>
    </el-col>
    <el-col :span="2">
      <el-button type="primary" @click="getLesson">Get Lesson</el-button>
    </el-col>
    <el-col :span="14">
      <el-select-v2 v-model="selectedPhraseId" style="width: 100%;" filterable remote :remote-method="searchNote"
        clearable :options="searchNoteOptions" :loading="loading" placeholder="Please enter phrase name"
        @keyup.ctrl.space="onSelectPhraseChanges"
        @keyup.enter="addPhrase">
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
  <el-row>
    <h4 v-html="lessonName"></h4>
  </el-row>
  <el-row :gutter="20">
    <el-col :span="8" v-for="phrase in phrases">
      <el-card class="box-card mb-10">
        <template #header>
          <div class="card-header">
            <span v-html="phrase.Front"></span>
            <br>
            <span>{{ phrase.NoteId }}</span>
            <el-button class="button" type="danger" plain @click="() => removePhrase(phrase.NoteId)">Remove</el-button>
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
import { ElButton, ElCol, ElInput, ElRow, ElSelectV2, ElCard, ElMessage,ElInputNumber } from 'element-plus';
import ajax from '@/libs/ajax';
import { OptionType } from 'element-plus/es/components/select-v2/src/select.types';
import NoteInfo from '@/models/note/NoteInfo'

const lessonId = ref<number>()
const lessonName = ref<string>();

const selectedPhraseId = ref<number>();
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
  if (phraseIdsString == "") {
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
  }).catch(res=>{
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
  if (selectedPhraseId.value) {
    if (lessonPhraseIds.indexOf(selectedPhraseId.value) >= 0) {
      return
    }
    var temphraseIds = lessonPhraseIds.slice()
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
  } else {
    ElMessage({
      message: 'You must choose phrase',
      type: 'warning',
    })
  }
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


const onSelectPhraseChanges = (event: Event) => {
  var inputElement = event.target as HTMLInputElement;
  var inputValue = inputElement.value
  if (inputValue != null && selectedPhraseId.value == null) {
    var searchString = inputValue.split(" ").join("+")
    var url = `https://www.google.com/search?q=${searchString}`
    window.open(url,"_blank","height=570,width=1000,scrollbars=yes,status=yes")
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

