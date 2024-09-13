<template>
    <el-dialog v-bind:model-value="visible" title="Search Phrase" width="60%" 
        @open="onDialogOpen" 
        @close="() => closeDialog(null)"
        draggable
        :overflow="true">
        <div>
            <div>
                <el-input v-model="searchPhraseText" @keyup.enter="() => searchNote(searchPhraseText)"
                    @keydown="handleKeyDownOnSearchPhraseInput" placeholder="Phrase Text" :tabindex="0">
                </el-input>
                <label class="mt-2">Total anki search result: {{ totalAnkiSearchResult }}</label>
                <el-select-v2 v-model="selectedPhraseId" style="width: 100%;" remote :remote-method="searchNote"
                    :options="phraseOptions" :loading="loading" placeholder="Please enter phrase name" filterable
                    value-key="value" >
                    <template #default="{ item }">
                        <b v-html="item.label" class="me-2"></b>
                        <span>&#8594; </span>
                        <span v-html="item.options">
                        </span>
                    </template>
                </el-select-v2>
            </div>
            <div class="mt-2">
                <label>Google Meaning</label>
                <el-input v-model="googlePhraseMeaning" placeholder="Phrase Meaning"></el-input>
            </div>
            <div class="mt-2">
                <lable>Example</lable>
                <el-input v-model="examplePhrase" type="textarea" autosize></el-input>
            </div>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="() => closeDialog(null)">Cancel</el-button>
                <el-button type="primary" @click="confirm">
                    Confirm
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
import {ajax} from '@/libs/ajax';
import AnkiResponseModel from '@/models/response/AnkiResponseModel';
import { ElDialog, ElButton, ElSelectV2, ElInput, ElMessage } from 'element-plus';
import { OptionType } from 'element-plus/es/components/select-v2/src/select.types';
import { ref } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'

const props = defineProps<{
    visible: boolean,
    searchText: string | null | undefined,
    currentPhraseId: number | null | undefined,
    currentMasterPhraseIds: string | null | undefined
}>()
const emit = defineEmits(["close"])

const selectedPhraseId = ref<number>()
const loading = ref(false);
const phraseOptions = ref<OptionType[]>([]);
const searchPhraseText = ref("")
const googlePhraseMeaning = ref("")
const examplePhrase = ref("")
const totalAnkiSearchResult = ref(0)

const onDialogOpen = () => {
    searchPhraseText.value = ""
    googlePhraseMeaning.value = ""

    if (props.searchText != null) {
        searchNote(props.searchText)
        searchPhraseText.value = props.searchText.replace(".", "").replace(",", "")
    }

}

const searchNote = (query: string) => {
    selectedPhraseId.value = undefined;
    loading.value = true;
    phraseOptions.value = []
    ajax.get("/search-phrase?search=" + query).then((res) => {
        loading.value = false
        if (Array.isArray(res.data.result)) {
            totalAnkiSearchResult.value = res.data.result.length
            res.data.result.forEach((element: any) => {
                phraseOptions.value.push({
                    label: element.fields.Front.value,
                    options: element.fields.Meaning.value,
                    value: element.noteId as number
                })
            });
        }
    }).catch(res => {
        console.log(res.message)
    })
}

const confirm = () => {
    if (selectedPhraseId.value != null) {
        updateParentPhraseIds(selectedPhraseId.value)
    } else {
        addNewMasterPhraseToAnki()
    }
}

const updateParentPhraseIds = (parentPhraseId: number) => {
    var parentPhraseIdString = parentPhraseId.toString()
    if (props.currentMasterPhraseIds?.trim()) {
        parentPhraseIdString = props.currentMasterPhraseIds + "," + parentPhraseId
    }
    var requestData = JSON.stringify({
        NoteId: props.currentPhraseId,
        PhraseIds: parentPhraseIdString
    })
    ajax.put<AnkiResponseModel>("/parent-phrase", requestData)
        .then(res => {
            if (!res.data.error) {
                closeDialog(parentPhraseId)
                ElMessage({
                    message: "Binding parent phrase success",
                    type: 'success',
                })
            } else {
                ElMessage({
                    message: "Binding parent phrase error: " + res.data.error,
                    type: 'error',
                })
            }
        })
        .catch(res => {
            ElMessage({
                message: "Add parent phrase error: " + res.message,
                type: 'error',
            })
        })
}

const addNewMasterPhraseToAnki = () => {
    if (searchPhraseText.value.trim() != "") {
        ajax.post<AnkiResponseModel>("/phrase-master", JSON.stringify({
            Front: searchPhraseText.value,
            Meaning: googlePhraseMeaning.value,
            Example: examplePhrase.value,
            Status: "1"
        })).then(res => {
            if (res.data.error) {
                ElMessage({
                    message: res.data.error,
                    type: 'error',
                })
            } else {
                updateParentPhraseIds(res.data.result as number)
            }
        }).catch(res => {
            console.log(res)
        })
    }

}

const handleKeyDownOnSearchPhraseInput = (event: Event) : any=> {
    if(event instanceof KeyboardEvent && event.ctrlKey && event.key === 'g'){
        var searchString = searchPhraseText.value.split(" ").join("+")
        var url = `https://www.google.com/search?q=${searchString}`
        window.open(url, "_blank", "height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes")
        event.preventDefault()     
    }
}


const closeDialog = (parentPhraseId: number | null) => {
    emit("close", parentPhraseId)
}

</script>

<style>
.ql-editor {
  font-size: 15px;
}
</style>