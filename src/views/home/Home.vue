<template>
  <el-button type="primary" class="add-subject-btn" @click="openSubjectCreatedDialog">Add Subject</el-button>
  <CreateSubjectDialog :is-open="isOpenedSubjectCreationDialog" @on-close-dialog="closeDialog"></CreateSubjectDialog>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import Subject from "../../entities/Subject"
import { ElButton } from 'element-plus';
import CreateSubjectDialog from './CreateSubjectDialog.vue';


var subject: Subject = {
  Name: "",
  LanguageId: "",
  UserId: ""
}

let isOpenedSubjectCreationDialog = ref(false)

const openSubjectCreatedDialog = () =>{
  isOpenedSubjectCreationDialog.value = true
}

const closeDialog = () =>{
  isOpenedSubjectCreationDialog.value = false;
}


</script>
  