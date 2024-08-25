<template>
    <el-dialog v-bind:model-value="visible" title="Edit Phrase" @close="closeDialog" @open="setQuillContent">
        <div>
            <div>
                <label>Front</label>
                <el-input label="Phrase" v-model:model-value="front"></el-input>
            </div>
            <div class="mt-2">
                <label>Meaning</label>
                <QuillEditor ref="meaningQuillEditor" toolbar="#context-toolbar2" content-type="html">
                    <template #toolbar>
                        <div id="context-toolbar2" class="my-toolbar">
                        </div>
                    </template>
                </QuillEditor>
            </div>
            <div class="mt-2">
                <label>Example</label>
                <QuillEditor ref="exampleQuillEditor" toolbar="#context-toolbar2" content-type="html"> 
                    <template #toolbar>
                        <div id="context-toolbar2" class="my-toolbar">
                        </div>
                    </template>
                </QuillEditor>
            </div>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="closeDialog">Cancel</el-button>
                <el-button type="success" @click="updatePhrase">Update</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ElDialog,ElButton,ElInput, ElMessage } from 'element-plus';
import { Quill, QuillEditor } from '@vueup/vue-quill'
import { onMounted, ref, toRef } from 'vue';
import EditPhraseModel from '@/models/phrase/EditPhraseModel'
import {ajax} from '@/libs/ajax';
import AnkiResponseModel from '@/models/response/AnkiResponseModel';

const props = defineProps<{
    visible: boolean
}>()
const emit = defineEmits(["onClose"])

//https://stackoverflow.com/questions/66585688/what-is-the-difference-between-ref-toref-and-torefs
//const model = toRef(props,'editPhrase')
const noteId = defineModel<string>('noteId',{required:true})
const front = defineModel<string>('front',{required:true})
const meaning = defineModel<string | null>('meaning',{required:true})
const example = defineModel<string | null>('example',{required:true})
const exampleQuillEditor = ref<Quill>()
const meaningQuillEditor = ref<Quill>()

const setQuillContent = ()=>{

    exampleQuillEditor.value.setHTML(example.value?.replace("<div>","<p>").replace("</div>","</p>"))
    meaningQuillEditor.value.setHTML(meaning.value?.replace("<div>","<p>").replace("</div>","</p>"))
    
}
const updatePhrase = () =>{
    var phraseModel : EditPhraseModel ={
        NoteId: noteId.value,
        Front: front.value,
        Example: exampleQuillEditor.value.getHTML().replace("<p><br></p>",""),
        Meaning: meaningQuillEditor.value.getHTML().replace("<p><br></p>","")
    }
    ajax.put<AnkiResponseModel>("/phrase-master", JSON.stringify(phraseModel)).then(res => {
            if (res.data.error != null) {
                ElMessage({
                    message: res.data.error,
                    type: 'error',
                })
            }else{
                ElMessage({
                    message: "Update phrase success",
                    type: 'success',
                })
                emit("onClose",true)
            }
        }).catch(res => {
            console.log(res)
        })
}

const closeDialog = () =>{
    emit("onClose",false)
}
</script>