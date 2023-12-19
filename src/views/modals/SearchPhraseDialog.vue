<template>
    <el-dialog v-model="visible" title="Search Phrase" width="60%" @open="onDialogOpen">
        <div>
            <div>
                <el-input v-model="searchPhraseText" @keyup.enter="() => searchNote(searchPhraseText)"
                    @keyup.ctrl.space="searchPhraseOnGoole" placeholder="Phrase Text" :tabindex="0">
                </el-input>
                <label class="mt-2">Total anki search result: {{ totalAnkiSearchResult }}</label>
                <el-select-v2 v-model="selectedPhraseId" style="width: 100%;" remote :remote-method="searchNote" clearable
                    :options="phraseOptions" :loading="loading" placeholder="Please enter phrase name" filterable
                    :tabindex="1">
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
                <QuillEditor v-model:content="examplePhrase" toolbar="#context-toolbar2" content-type="html">
                    <template #toolbar>
                        <div id="context-toolbar2" class="my-toolbar">
                        </div>
                    </template>
                </QuillEditor>
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
import ajax from '@/libs/ajax';
import AnkiResponseModel from '@/models/response/AnkiResponseModel';
import { ElDialog, ElButton, ElSelectV2, ElInput, ElMessage } from 'element-plus';
import { OptionType } from 'element-plus/es/components/select-v2/src/select.types';
import { ref } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'

const props = defineProps<{
    visible: boolean,
    searchText: string | null | undefined,
    currentLRPhraseId: string | null | undefined,
    currentParentPhraseIds: string[] | null | undefined
}>()
const emit = defineEmits(["close"])

const selectedPhraseId = ref()
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
                    value: element.noteId
                })
            });
        }
    }).catch(res => {
        console.log(res.message)
    })
}

const confirm = () => {
    if (selectedPhraseId.value != null) {
        addMoreParentPhrase(selectedPhraseId.value)
    } else {
        addNewPhraseToAnki()
    }
}

const addMoreParentPhrase = (phraseId: string) => {
    if (props.currentParentPhraseIds) {
        var parentPhraseIds = [...props.currentParentPhraseIds, phraseId].join(",")
        ajax.post<AnkiResponseModel>(`/parent-phrase?noteId=${props.currentLRPhraseId}&phraseIds=${parentPhraseIds}`)
            .then(res => {
                if (res.status == 200 && res.data.error == null) {
                    closeDialog(phraseId)
                } else {
                    ElMessage({
                        message: "Add parent phrase error: " + res.data.error,
                        type: 'error',
                    })
                }
            })
            .catch(res => {
                ElMessage({
                    message: "Add parent phrase error: " + res.error,
                    type: 'error',
                })
            })

    }
}

const searchPhraseOnGoole = (event: Event) => {
    var searchString = searchPhraseText.value.split(" ").join("+")
    var url = `https://www.google.com/search?q=${searchString}`
    window.open(url, "_blank", "height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes")
}

const addNewPhraseToAnki = () => {
    if (searchPhraseText.value.trim() != "") {
        ajax.post<AnkiResponseModel>("/phrase", JSON.stringify({
            Front: searchPhraseText.value,
            Meaning: googlePhraseMeaning.value,
            Example: examplePhrase.value
        })).then(res => {
            if (res.data.error != null) {
                ElMessage({
                    message: res.data.error,
                    type: 'error',
                })
            } else {
                addMoreParentPhrase(res.data.result as string)
            }
        }).catch(res => {
            console.log(res)
        })
    }

}

const closeDialog = (newParentPhraseId: string | null) => {
    emit("close", newParentPhraseId)
}

</script>

<style>
.ql-editor {
  font-size: 15px;
}
</style>