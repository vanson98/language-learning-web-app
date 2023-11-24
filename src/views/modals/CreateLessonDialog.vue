<template>
    <el-dialog 
        v-model="isOpen" 
        :before-close="() => handleDialog(false)" 
        title="Create Lesson"
    >
        <label class="mb-1">Subject</label>
        <el-select v-model="lessonModel.subjectId" placeholder="Select subject" class="w-100 mb-1">
            <el-option
                v-for="item in subjects"
                :key="(item.id as string)"
                :label="item.name"
                :value="(item.id as string)"
            ></el-option>
        </el-select>    
        <label class="mb-1">Lesson Name</label>
        <el-input type="text" v-model="lessonModel?.name"></el-input>
        
        <lable class="mb-1">Link Source</lable>
        <el-input type="text" v-model="lessonModel?.sourceLink"></el-input>
        
        <label class="mb-1">Note</label>
        <el-input 
            type="textarea" 
            v-model="lessonModel?.note"
            :autosize="{minRows:5, maxRows:15}"
        ></el-input>
        <div class="d-flex mt-2 justify-content-end">
            <el-button>Cancel</el-button>
            <el-button type="primary" @click="submitForm">Save</el-button>
        </div>
        
    </el-dialog>
</template>

<script setup lang="ts">
import { ElButton, ElDialog, ElInput, ElSelect, ElOption} from 'element-plus';
import CreateLessonModel from '@/models/lesson/CreateLessonModel'
import { ref,onMounted } from 'vue';
import ajax from '@/libs/ajax';
import Subject from '@/models/subject/Subject';
const props = defineProps<{
    isOpen: boolean,
    subjects: Subject[]
}>()

const emit = defineEmits(["onClose"])
const lessonModel = ref<CreateLessonModel>({
    subjectId: "", 
    name: "",
    note: null,
    sourceLink: null
})
const selectedSubjectId = ref('');

onMounted(()=>{
})

const submitForm = () =>{
    ajax.post("/lesson",JSON.stringify(lessonModel.value)).then(res=>{
        console.log(res)
        lessonModel.value = {
            name : "",
            note: "",
            sourceLink: "",
            subjectId: ""
        }
    })
}

const handleDialog = (isCreateLessonSuccess: boolean) => {
    emit("onClose", isCreateLessonSuccess)
}


</script>