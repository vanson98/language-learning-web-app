<template>
  <el-button type="primary" class="add-subject-btn" @click="openSubjectCreatedDialog">Add Subject</el-button>
  <CreateSubjectDialog :is-open="isOpenedSubjectCreationDialog" @on-close-dialog="closeDialog"></CreateSubjectDialog>

</template>

<script lang="ts" setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import Subject from "../../models/subject/Subject"
import { ElButton } from 'element-plus';
import CreateSubjectDialog from './CreateSubjectDialog.vue';
import ajax from '@/libs/ajax';


var subjects: Subject[] = []

let isOpenedSubjectCreationDialog = ref(false)

onMounted(()=>{

})

const getAllSubjects = () =>{
  ajax.get("/get-all-subjects",{
    params:{
      uid: localStorage.getItem("userId"),
      langid: localStorage.getItem("languageId")
    }
  }).then(response =>{
    console.log(response.data)
  })
}

const openSubjectCreatedDialog = () =>{
  isOpenedSubjectCreationDialog.value = true
}

const closeDialog = (isCreatSubjectSuccess: boolean) =>{
  if(isCreatSubjectSuccess){

  }
  isOpenedSubjectCreationDialog.value = false;
}


</script>
  