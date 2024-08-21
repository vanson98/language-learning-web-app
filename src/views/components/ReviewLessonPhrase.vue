<template>
    <el-row>
        <el-col :span="4">
            <el-input v-model="searchText" placeholder="Serch Phrase" @keyup.enter="getLessonPhrases"></el-input>
        </el-col>
        <el-col :span="4">
            <div class="ms-5">
                <el-button @click="getLessonPhrases" type="primary">Load Data</el-button>
            </div>
        </el-col>
    </el-row>
    <el-row style="height: 100%;">
        <el-col :span="14" style="height: 100%;">
            <el-table :data="lessonPhrases" ref="singleTableRef" style="width: 100%;height: 85vh;" highlight-current-row
                @current-change="handleCurrentRowChange">
                <el-table-column type="index" width="50" />
                <el-table-column property="Context" label="Context" min-width="200">
                    <template #default="scope">
                        <p v-html="scope.row.Context"></p>
                        <audio :id="'card-audio-' + scope.row.NoteId">
                            <source :src="SERVER_BASE_URL + '/audio?fileName=' + scope.row.AudioFileName"
                                type="audio/mpeg">
                        </audio>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>
        <el-col :span="10" style="height: 100%;" v-if="currentRow">
            <div class="phrase-info-box">
               
                <div class="mb-3">
                    <label>Type Text</label>
                    <ElInput @keydown.enter="goToNextLrPhrase" v-model="typeText"></ElInput>
                </div>
                <div class="d-flex justify-content-start">
                    <label>Context</label>
                    <div class="ms-5 mb-2 d-flex justify-content-between flex-grow-1">
                        <div>
                            <el-button @click="highLightWord" type="warning">Highlight</el-button>
                        </div>
                        <div>
                            <el-button @click="() => playAudio(null)" type="primary">Replay Audio</el-button>
                        </div>
                        <div>
                            <el-button @click="() => updateLRPhrase(currentRow)" type="primary">Save</el-button>
                            <el-button @click="() => deletePhrase(currentRow!.NoteId)" type="danger">Remove</el-button>
                        </div>
                    </div>
                </div>
                <div>
                    <QuillEditor v-model:content="currentRow.Context" toolbar="minimal" content-type="html"
                        style="margin-bottom: 2px;">
                    </QuillEditor>
                </div>
                <div>
                    <label>Context Translation</label>
                    <QuillEditor v-model:content="currentRow.ContextTranslation" toolbar="#context-toolbar2"
                        content-type="html">
                        <template #toolbar>
                            <div id="context-toolbar2" class="my-toolbar">
                            </div>
                        </template>
                    </QuillEditor>
                    <br>
                </div>

                <template v-for="phrase in currentRow.ParentPhrases">
                    <div style="height: auto; margin-bottom: 8px;">
                        <hr>
                        <div class="d-flex justify-content-between mb-3">
                            <el-tag>{{ phrase.NoteId }}</el-tag>
                            <div>
                                <el-button size="small" type="warning"
                                    @click="() => openEditPhraseDialog({ Front: phrase.Front, Example: phrase.Example, Meaning: phrase.Meaning, NoteId: phrase.NoteId })">Edit</el-button>
                                <el-button size="small" type="danger"
                                    @click="() => removeParentPhrase(phrase.NoteId)">Remove</el-button>
                            </div>
                        </div>

                        <b v-html="phrase.Front"></b>
                        <div v-html="phrase.Meaning"></div>
                        <div style="color: green;font-style: italic;font-weight: 600;" v-html="phrase.Example">
                        </div>
                    </div>
                </template>
                <hr>
                <div class="card-images">
                    <img :src="SERVER_BASE_URL + '/image?fileName=' + currentRow.ImageFileName">
                </div>
            </div>
        </el-col>
    </el-row>
    <SearchPhraseDialog :visible="searchPhraseDialogVisible" :search-text="searchTextPhrase"
        @close="closeSearchPhraseDialog" :current-l-r-phrase-id="currentRow?.NoteId"
        :current-parent-phrase-ids="currentRow?.PhraseIds" />
    <EditPhraseDialog :visible="editPhraseDialogVisible" @on-close="closeEditPhraseDialog"
        v-model:note-id="editPhraseModel.NoteId" v-model:example="editPhraseModel.Example"
        v-model:front="editPhraseModel.Front" v-model:meaning="editPhraseModel.Meaning" />
</template>

<script lang="ts" setup>
import { ElTag, ElRow, ElCol, ElTable, ElTableColumn, ElButton, ElMessageBox, ElMessage, ElInput } from 'element-plus'
import {SERVER_BASE_URL} from '../../libs/url'
import LRPhraseModel from '../../models/lesson/LRPhraseModel'
import { onMounted, ref, toRefs } from 'vue';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import {ajax} from '@/libs/ajax';
import AnkiResponseModel from '@/models/response/AnkiResponseModel';
import moment from 'moment';
import SearchPhraseDialog from '../modals/SearchPhraseDialog.vue'
import EditPhraseDialog from '../modals/EditPhraseDialog.vue'
import EditPhraseModel from '@/models/phrase/EditPhraseModel';
const props = defineProps<{
    videoId: string,
    autoPlayAudio: boolean
}>()

const lessonPhrases = ref<LRPhraseModel[]>([]);
const currentRow = ref<LRPhraseModel | null>(null)
const singleTableRef = ref<InstanceType<typeof ElTable>>()
const searchText = ref<string>("")
const searchTextPhrase = ref<string | undefined>("")
const searchPhraseDialogVisible = ref<boolean>(false)
const editPhraseDialogVisible = ref<boolean>(false)
const editPhraseModel = ref<EditPhraseModel>({
    NoteId: "",
    Example: "",
    Front: "",
    Meaning: ""
})
const typeText = ref<string | null>("")

onMounted(() => {
    getLessonPhrases()
})

const getLessonPhrases = () => {
    ajax.get<AnkiResponseModel>(`/phrase-notes?vid=${props.videoId}&searchContext=${searchText.value}`)
        .then(res => {
            if (res.data.error != null) {
                ElMessage({
                    message: res.data.error,
                    type: 'error',
                })
                return
            }
            if (res.data.result != null) {
                lessonPhrases.value = []
                res.data?.result.forEach((item: any) => {
                    lessonPhrases.value.push({
                        CardId: item.cards[0],
                        NoteId: item.noteId,
                        Tags: item.tags,
                        Context: item["fields"].Context.value as string,
                        ContextTranslation: item["fields"]["Context translation"].value as string,
                        ImageFileName: item["fields"]["Next Image media filename"].value,
                        AudioFileName: item["fields"]["Audio clip media filename"].value as string,
                        DateCreated: moment(item["fields"]["Date created"].value as string, "YYYY-MM-DD hh:mm").toDate(),
                        PhraseIds: (item["fields"]["PhraseIds"].value as string).split(",").filter(id => id != ""),
                        ParentPhrases: [],
                        IsLoadParentPhrase: false
                    })
                })
                lessonPhrases.value.sort((a, b): number => {
                    if (a.DateCreated < b.DateCreated) {
                        return -1 // a --> b
                    } else if (a.DateCreated > b.DateCreated) {
                        return 1  // b --> a
                    }
                    return 0
                })
                currentRow.value = lessonPhrases.value[0]
                getParentPhrase(lessonPhrases.value[0])
            }
        })
        .catch(res => {
            console.log(res)
        })
}

const handleCurrentRowChange = (cr: LRPhraseModel, ocr: LRPhraseModel) => {
    currentRow.value = cr
    onCurrentRowChange(cr, ocr)
}

const onCurrentRowChange = (currentRow: LRPhraseModel | null, previousRow: LRPhraseModel | null) => {
    if (currentRow != null) {
        getParentPhrase(currentRow)
    }
    if (previousRow) {
        updateLRPhrase(previousRow)
    }
    if (props.autoPlayAudio) {
        playAudio(previousRow)
    }
}

// =================== SEARCH PHRASE AND PLAY AUDIO ======================

window.addEventListener('keydown', (e) => {
    var targetElement = e.target as Element
    if (!(targetElement instanceof HTMLInputElement) && targetElement.className != "ql-editor") {
        if (e.key == "ArrowDown") {
            goToNextLrPhrase()
        }
        if (e.key == "ArrowUp") {
            goToPreviousLrPhrase()
        }
        if (e.key == "r") {
            playAudio(null)
        }
    }
    if (targetElement.className == "ql-editor") {
        if (e.ctrlKey && e.key.toLowerCase() === 'q') {
            searchTextPhrase.value = window.getSelection()?.toString()
            searchPhraseDialogVisible.value = true
        }
        if (e.ctrlKey && e.key == 'a') {
            highLightWord()
        }
    }
});

const goToNextLrPhrase = () => {
    if (currentRow.value != null) {
        var currentRowIndex = lessonPhrases.value.indexOf(currentRow.value)
        if (currentRowIndex == lessonPhrases.value.length - 1) {
            return
        }
        singleTableRef.value?.setCurrentRow(lessonPhrases.value[currentRowIndex + 1])
    }
    typeText.value = null
}

const goToPreviousLrPhrase = () => {
    if (currentRow.value != null) {
        var currentRowIndex = lessonPhrases.value.indexOf(currentRow.value)
        if (currentRowIndex == 0) {
            return
        }
        singleTableRef.value?.setCurrentRow(lessonPhrases.value[currentRowIndex - 1])
    }
}


const highLightWord = () => {
    var selectText = window.getSelection()?.toString()
    if (currentRow.value != null && selectText != null) {
        var highlightText = `<span style="background-color: rgb(255, 170, 0);">${selectText}</span>`
        currentRow.value.Context = currentRow.value.Context.replace(selectText, highlightText)
    }
}

const playAudio = (previousRow: LRPhraseModel | null) => {
    var currentAudioElement = document.getElementById("card-audio-" + currentRow.value?.NoteId)
    var previousAudioElement = document.getElementById("card-audio-" + previousRow?.NoteId)
    if (previousAudioElement instanceof HTMLAudioElement) {
        previousAudioElement.pause()
    }
    if (currentAudioElement instanceof HTMLAudioElement) {
        currentAudioElement.load()
        currentAudioElement.play()
    }
}


const closeSearchPhraseDialog = (newPhraseId: string | null) => {
    if (newPhraseId != null && currentRow.value != null) {
        if (!currentRow.value.PhraseIds.includes(newPhraseId)) {
            currentRow.value.PhraseIds.push(newPhraseId)
            currentRow.value.IsLoadParentPhrase = false;
            getParentPhrase(currentRow.value)
        }
    }
    searchPhraseDialogVisible.value = false
}

const closeEditPhraseDialog = (isUpdated: boolean) => {
    if (isUpdated && currentRow.value != null) {
        currentRow.value.IsLoadParentPhrase = false;
        getParentPhrase(currentRow.value)
    }
    editPhraseDialogVisible.value = false;
}

const openEditPhraseDialog = (phrase: EditPhraseModel) => {
    editPhraseDialogVisible.value = true
    editPhraseModel.value = phrase
}
// ====================== GET PARENT PHRASE, UPDATE LR PHRASE AND DELETE PHRASE ================

const getParentPhrase = (lrPhrase: LRPhraseModel) => {
    if (lrPhrase.PhraseIds.length > 0 && !lrPhrase.IsLoadParentPhrase) {
        lrPhrase.ParentPhrases = []
        ajax.get<AnkiResponseModel>(`/notes?ids=${lrPhrase.PhraseIds.join(",")}`).then(res => {
            if (res.data.error == null && Array.isArray(res.data.result)) {
                lrPhrase.PhraseIds = [];
                res.data.result.forEach((item: any) => {
                    if (item != null && Object.keys(item).length != 0) {
                        lrPhrase.ParentPhrases.push({
                            NoteId: item.noteId,
                            Front: item["fields"]["Front"].value as string,
                            Meaning: item["fields"]["Meaning"].value as string,
                            Example: item["fields"]["Example"].value as string
                        })
                        lrPhrase.PhraseIds.push(item.noteId)
                    }
                })
                lrPhrase.IsLoadParentPhrase = true;
            }
        })
    }
}

const updateLRPhrase = (lrPhrase: LRPhraseModel | null) => {
    if (lrPhrase !== null) {
        ajax.post<AnkiResponseModel>("/lr-phrase", JSON.stringify({
            NoteId: lrPhrase.NoteId,
            Context: lrPhrase.Context,
            "Context translation": lrPhrase.ContextTranslation,
            PhraseIds: lrPhrase.PhraseIds.toString().replace("[]", "") as string
        })).then(res => {
        }).catch(res => {
            console.error(res)
        })
    }
}

const removeParentPhrase = (parentPhraseId: string) => {
    if (currentRow.value != null) {
        currentRow.value.PhraseIds = currentRow.value.PhraseIds.filter(pid => pid != parentPhraseId)
        currentRow.value.ParentPhrases = currentRow.value.ParentPhrases.filter(pp => pp.NoteId != parentPhraseId)
        updateLRPhrase(currentRow.value)
    }
}

const deletePhrase = (noteId: string) => {
    ElMessageBox.confirm(
        'Permanently delete the phrase. Continue?',
        'Warning',
        {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    )
        .then(() => {
            ajax.get<AnkiResponseModel>(`delete-note?noteId=${noteId}&audioFileName=${currentRow.value?.AudioFileName}&imageFileName=${currentRow.value?.ImageFileName}`).then(res => {
                if (res.data.error == null) {
                    ElMessage({
                        type: 'success',
                        message: 'Delete completed',
                    })
                    lessonPhrases.value = lessonPhrases.value.filter(wordItem => wordItem.NoteId != currentRow.value?.NoteId)
                }

            }).catch(res => {
                console.error(res)
            })
        }).catch(() => { })
}


</script>

<style>
.phrase-info-box {
    width: 100%;
    height: 100%;
    border: 1px solid;
    padding: 10px;
    overflow: scroll;
}

.my-toolbar {
    height: 0;
    padding: 0 !important;
}
</style>