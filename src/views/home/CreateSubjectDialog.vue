<template>
    <el-dialog
        :model-value="isOpen"
        title="Create Subject"
        width="20%"
        :before-close="() => handleClose(false)"
    >
        <el-input v-model:model-value="subjectName"></el-input>
        <p>{{ subjectName }}</p>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="() => handleClose(false)">Cancel</el-button>
                <el-button type="primary" @click="addNewSubject">
                    Save
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import ajax from '@/libs/ajax';
import Subject from '@/models/subject/Subject';
import { ElDialog, ElMessageBox, ElButton, ElInput } from 'element-plus';
import {ref} from 'vue'

const props = withDefaults( defineProps<{
    isOpen?: boolean
    }>(),
    {
        isOpen: false
    })

let subjectName = ref("")
// event
let emits = defineEmits(["onCloseDialog"])


function addNewSubject() {
    var userId = localStorage.getItem("userId")
    var languageId = localStorage.getItem("languageId")
    if(userId != null && languageId != null && subjectName != null){
        var subject : Subject = {
            id: null,
            name: subjectName.value,
            languageId: languageId,
            userId: userId
        }
        ajax.post('/add-subject', JSON.stringify(subject)).then(response => {
            handleClose(true)
        })
    }else{
        alert("Please check info again")
    }
   
}


const handleClose = (createSuccess : boolean) => {
    emits("onCloseDialog",createSuccess)
}

</script>