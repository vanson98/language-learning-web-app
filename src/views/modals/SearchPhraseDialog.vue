<template>
    <el-dialog 
        v-model="visible"
        title="Search Phrase"
        width="30%"
        >
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="closeDialog">Cancel</el-button>
                <el-button type="primary" @click="closeDialog">
                    Confirm
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
import { ElDialog } from 'element-plus';

const props = defineProps<{
    visible: boolean
}>()
const emit = defineEmits(["close"])

const closeDialog = () =>{
    emit("close")
}

</script>