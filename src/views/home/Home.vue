<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <el-input v-model:model-value="noteId" placeholder="Please input Note Id"></el-input>
    </el-col>
    <el-col :span="6">
      <el-button type="primary"  @click="getNote">Get Lesson</el-button>
    </el-col>
    <el-col :span="6">
      <el-select-v2
        v-model="selectNoteIds"
        style="width: 100%;"
        filterable
        remote
        :remote-method="searchNote"
        clearable
        :options="searchNoteOptions"
        :loading="loading"
        placeholder="Please enter note name"
      >
        <template #default="{item}">
          <b v-html="item.label" class="me-2"></b> 
          <span v-html="item.options">
          </span>
        </template>
      </el-select-v2>
    </el-col>
    <el-col :span="6">
      <el-button type="primary">Search Phrase</el-button>
    </el-col>
    
  </el-row>
  <div>
     <h4 v-html="lessonName"></h4>
  </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
import { ElButton, ElCol, ElInput, ElRow, ElSelectV2 } from 'element-plus';
import ajax from '@/libs/ajax';
import SelectNoteOption from '@/models/note/SelectNoteOption'
import { OptionType } from 'element-plus/es/components/select-v2/src/select.types';

const noteId = ref<number>(1695944403453)
const lessonName = ref<string>();
const selectNoteIds = ref<number[]>([]);
const searchNoteOptions = ref<OptionType[]>([]);
const loading = ref(false);

const getNote = () => {
  ajax.get("/note?id="+noteId.value).then(response => {
    lessonName.value = response.data.result[0].fields["Lesson Name"].value 
  }).catch((res)=>{
    console.log(res.data)
  })
}

const searchNote = (query: string) =>{
  loading.value = true;
  searchNoteOptions.value = []
  ajax.get("/search-note?search="+query).then((res)=>{
    loading.value = false
    if(Array.isArray(res.data.result)){
      res.data.result.forEach((element : any) => {
        searchNoteOptions.value.push({
          label: element.fields.Front.value,
          options: element.fields.Meaning.value,
          value: element.noteId
        })
      });
    }
  })
}

</script>
  