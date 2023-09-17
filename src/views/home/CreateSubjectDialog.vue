<template>
    <el-dialog
        :model-value="isOpen"
        title="Create Subject"
        width="20%"
        :before-close="handleClose"
    >
        <el-input v-model:model-value="subjectName"></el-input>
        <p>{{ subjectName }}</p>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleClose">Cancel</el-button>
                <el-button type="primary" @click="handleClose">
                    Save
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
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


// function addNewSubject() {
//   axios.post('http://localhost:3333/add-subject', subject).then(response => console.log(response))
// }


const handleClose = () => {
    emits("onCloseDialog")
}

</script>