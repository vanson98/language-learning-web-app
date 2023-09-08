<template>
  <button @click="addNewSubject">Add Subject</button>
  <input type="text" v-model="subject.Name" />
  <br>
  <input type="text" v-model="subject.LanguageId">
  <br>
  <input type="text" v-model="subject.UserId">
</template>
<script lang="ts" setup>
import axios from 'axios';
import Subject from '@/entities/Subject'

var subject: Subject = {
  Name: "",
  LanguageId: "",
  UserId: ""
}

function addNewSubject(){
  axios.post('localhost:3333/add-subject', subject).then(response => console.log(response))
}
</script>
