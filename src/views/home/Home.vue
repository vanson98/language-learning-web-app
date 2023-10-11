<template>
  <el-button type="primary" class="add-subject-btn" @click="openSubjectCreatedDialog">Add Subject</el-button>
  <el-button type="primary" @click="lessonDialogVisible = true">Create Lesson</el-button>
  <div>
    <ul>
      <li v-for="subject in subjects" :key="(subject.id as string)">{{ subject.name }}</li>
    </ul>
  </div>
  <CreateSubjectDialog :is-open="subjectDialogVisible" @on-close-dialog="closeSubjectDialog"></CreateSubjectDialog>
  <CreateLessonDialog 
    :is-open="lessonDialogVisible" 
    @on-close="closeLessonDialog"
    :subjects="subjects"
    >
  </CreateLessonDialog>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import Subject from "../../models/subject/Subject"
import { ElButton } from 'element-plus';
import CreateSubjectDialog from './CreateSubjectDialog.vue';
import CreateLessonDialog from './CreateLessonDialog.vue'
import ajax from '@/libs/ajax';


var subjects = ref<Subject[]>([])

const subjectDialogVisible = ref(false)
const lessonDialogVisible = ref(false)

onMounted(() => {
  getAllSubjects()
})

const getAllSubjects = () => {
  ajax.get("/subjects", {
    params: {
      uid: localStorage.getItem("userId"),
      langid: localStorage.getItem("languageId")
    }
  }).then(response => {
    subjects.value = response.data
    console.log(subjects.value)
  })
}

const openSubjectCreatedDialog = () => {
  subjectDialogVisible.value = true
}

const closeSubjectDialog = (isSuccess: boolean) => {
  if (isSuccess) {
    getAllSubjects();
  }
  subjectDialogVisible.value = false;
}

const closeLessonDialog = (isSuccess: boolean) => {
  lessonDialogVisible.value = false;
}


</script>
  