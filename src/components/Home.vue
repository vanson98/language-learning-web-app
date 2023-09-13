<template>
  <button @click="addNewSubject">Add Subject</button>
  <input type="text" v-model="subject.Name" />
  <br>
  <input type="text" v-model="subject.LanguageId">
  <br>
  <input type="text" v-model="subject.UserId">
  <select v-model="languageId" >
    <option v-for="langItem in languages" :value="langItem.id">{{ langItem.name }}</option>
  </select>
  <div>{{ languageId }}</div>
</template>
<script lang="ts" setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import Subject from "@/entities/Subject"

let languages = ref<Language[]>([]);
let languageId : any
onMounted(()=>{
  axios.post('http://localhost:3333/get-languages').then(response => {
    languages.value = response.data as Language[] 
    console.log(languages.value)   
  }).catch(()=>{
    console.log("error")
  })
})

var subject: Subject = {
  Name: "",
  LanguageId: "",
  UserId: ""
}

function addNewSubject(){
  axios.post('http://localhost:3333/add-subject', subject).then(response => console.log(response))
}


</script>
