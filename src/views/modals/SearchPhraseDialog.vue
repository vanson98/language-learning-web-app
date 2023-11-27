<template>
    <el-dialog v-model="visible" title="Search Phrase" width="30%" @open="onDialogOpen">
        <div>
            <el-input v-model="searchPhraseText" @keyup.enter="() => searchNote(searchPhraseText)" placeholder="Phrase Text"
                :tabindex="0"></el-input>
            <div class="mt-2">
                <el-input v-model="phraseMeaning" placeholder="Phrase Meaning"></el-input>
            </div>
            <div class="mt-2 mb-2">
                <el-button type="primary" @click="searchPhraseOnGoole">Google Search</el-button>
                <el-button type="primary" @click="searchPhraseOnAnki">Anki Search</el-button>
                <el-button type="primary" @click="addNewPhraseToAnki">Add Anki Phrase</el-button>
            </div>
            <div>
                <span>Total anki search result: {{ totalAnkiSearchResult }}</span>
            </div>
            <el-select-v2 v-model="selectedPhraseId" style="width: 100%;" remote :remote-method="searchNote" clearable
                :options="phraseOptions" :loading="loading" placeholder="Please enter phrase name" filterable :tabindex="1">
                <template #default="{ item }">
                    <b v-html="item.label" class="me-2"></b>
                    <span>&#8594; </span>
                    <span v-html="item.options">
                    </span>
                </template>
            </el-select-v2>

        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="() => closeDialog(null)">Cancel</el-button>
                <el-button type="primary" @click="addParentPhrase">
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
const props = defineProps<{
    visible: boolean,
    searchText: string,
    currentLRPhraseId: string,
    currentParentPhraseIds: string[]
}>()
const emit = defineEmits(["close"])

const selectedPhraseId = ref()
const loading = ref(false);
const phraseOptions = ref<OptionType[]>([]);
const searchPhraseText = ref("")
const phraseMeaning = ref("")
const totalAnkiSearchResult = ref(0)

const onDialogOpen = () => {
    searchNote(props.searchText)
    searchPhraseText.value = props.searchText
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

const addParentPhrase = () => {
    if (selectedPhraseId.value != null) {
        var parentPhraseIds = [...props.currentParentPhraseIds, selectedPhraseId.value].join(",")
        ajax.post<AnkiResponseModel>(`/parent-phrase?noteId=${props.currentLRPhraseId}&phraseIds=${parentPhraseIds}`)
            .then(res => {
                if (res.status == 200 && res.data.error == null) {
                    closeDialog(selectedPhraseId.value)
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

const searchPhraseOnAnki = () => {
    searchNote(searchPhraseText.value)
}

const addNewPhraseToAnki = () => {

}

const closeDialog = (newParentPhraseId: string | null) => {
    emit("close", newParentPhraseId)
}

</script>