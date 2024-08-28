<template>
    <el-row style="height: 5%;">
        <el-col :span="4">
            <el-input v-model="functionTextBox" placeholder="bl: " @keyup.enter="filterPhrases"></el-input>
        </el-col>
        <el-col :span="4">
            <div class="ms-5">
                <el-button @click="getLessonPhrases" type="primary">Load Data</el-button>
            </div>
        </el-col>
        <el-col :span="12">
            <div class="phrase-status-ctn">
                <span>Total Phrase: {{ totalPhrase }} </span>
                <span>Updated Notes: {{ totalUpdatedNote }}</span>
                <span>Attach Phrase Master: {{ totalMasterAttach }}</span>
            </div>
        </el-col>
    </el-row>
    <el-row style="height: 95%;  border: 1px solid; border-color: #8080806f;">
        <el-col :span="14" style="height: 100%; padding-right: 8px;">
            <el-auto-resizer>
                <template #default="{ height, width }">
                    <el-table-v2 :columns="columns" :data="phraseNotes" :width="width" :height="height"
                        :row-props="getRowProps" :row-class="rowClass" :estimated-row-height="80" fixed>
                        <template #header-cell="{ column }">
                            <template v-if="column.key == 'selection'">
                                <ElCheckbox :v-model:model-value="allSelected"
                                    @change="(value) => onAllRowSelectionChange(value)" />
                            </template>
                        </template>

                        <template #cell="{ rowData, column, rowIndex }">
                            <template v-if="column.key == 'selection'">
                                <el-checkbox v-model:model-value="rowData.Checked" />
                            </template>
                            <template v-if="column.key == 'Context'">
                                <div v-html="rowData.Context"></div>
                            </template>
                            <template v-if="column.key == 'tags'">
                                <el-tag v-for="tag in rowData.Tags">{{ tag }}</el-tag>
                            </template>
                        </template>
                        <template #overlay v-if="loading">
                            <div class="el-loading-mask"
                                style="display: flex; align-items: center; justify-content: center">
                                <ElIcon class="is-loading" color="var(--el-color-primary)" :size="26">
                                    <Loading />
                                </ElIcon>
                            </div>
                        </template>
                    </el-table-v2>
                </template>
            </el-auto-resizer>
        </el-col>
        <el-col :span="10" style="height: 100%;" v-if="currSelectedRow">
            <div class="phrase-info-box">
                <div class="card-images">
                    <img :src="SERVER_BASE_URL + '/image?fileName=' + currSelectedRow.ImageFileName" />
                    <strong>{{ currSelectedRow.VideoTitle }}</strong>
                </div>
                <div class="mb-3">
                    <label>Type Text</label>
                    <ElInput @keydown.enter="goToNextRow" v-model="typeText"></ElInput>
                </div>
                <div class="d-flex justify-content-start">
                    <div class=" mb-2 d-flex justify-content-between flex-grow-1">
                        <el-button @click="highLightWord" type="warning">Highlight</el-button>
                        <el-button @click="() => playAudio()" type="primary">Replay Audio</el-button>
                        <el-button @click="() => updateAndLevelDownPhraseMaster(currSelectedRow!)" type="default">Update -</el-button>
                        <el-button @click="() => updateAndLevelUpPhraseMaster(currSelectedRow!)" type="primary">Update +</el-button>
                        <el-button @click="() => deletePhrase(currSelectedRow!.NoteId)" type="danger">Remove</el-button>
                    </div>
                </div>
                <div>
                    <QuillEditor v-model:content="currSelectedRow.Context" toolbar="minimal" content-type="html"
                        style="margin-bottom: 2px;">
                    </QuillEditor>
                </div>
                <div>
                    <label>Context Translation</label>
                    <QuillEditor v-model:content="currSelectedRow.ContextTranslation" toolbar="#context-toolbar2"
                        content-type="html">
                        <template #toolbar>
                            <div id="context-toolbar2" class="my-toolbar">
                            </div>
                        </template>
                    </QuillEditor>
                    <br>
                </div>
                <template v-for="phrase in currSelectedRow.PhraseMasters">
                    <div style="height: auto; margin-bottom: 8px;">
                        <hr>
                        <div class="d-flex justify-content-between mb-3">
                            <div>
                                <el-tag>{{ phrase.NoteId }}</el-tag>
                                <span class="ms-3">Status: {{ phrase.Status }}/5</span>
                            </div>
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
            </div>
        </el-col>
    </el-row>
    <AttachPhraseMasterDialog :visible="attachPhraseMasterDialogVisible" :search-text="selectionPhrase"
        @close="closeAttachPhraseMasterDialog" :currentPhraseId="currSelectedRow?.NoteId"
        :currentMasterPhraseIds="currSelectedRow?.PhraseMasterIds" />
    <EditPhraseDialog :visible="editPhraseDialogVisible" @on-close="closeEditPhraseDialog"
        v-model:note-id="editPhraseModel.NoteId" v-model:example="editPhraseModel.Example"
        v-model:front="editPhraseModel.Front" v-model:meaning="editPhraseModel.Meaning" />
</template>

<script lang="ts" setup>
import { ElTag, ElRow, ElCol, ElCheckbox, Column, ElButton, ElMessageBox, ElMessage, ElInput, ElTableV2, ElAutoResizer, RowClassNameGetter, CheckboxValueType, ElIcon } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { SERVER_BASE_URL } from '../../libs/url'
import PhraseNoteModel from '../../models/lesson/PhraseNoteModel'
import { onMounted, ref, toRef, toRefs, watch } from 'vue';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { ajax } from '../../libs/ajax';
import AnkiResponseModel from '../../models/response/AnkiResponseModel';
import AttachPhraseMasterDialog from '../modals/AttachPhraseMasterDialog.vue'
import EditPhraseDialog from '../modals/EditPhraseDialog.vue'
import EditPhraseModel from '../../models/phrase/EditPhraseModel';
import PhraseMasterModel from '@/models/lesson/PhraseMasterModel';

const props = defineProps<{
    videoId: string,
    autoPlayAudio: boolean
    autoHideUpdatedNote: boolean;
}>()

const autoHideUpdatedNoteProp = toRef(props, 'autoHideUpdatedNote');

watch(autoHideUpdatedNoteProp, (newvalue, oldVaue) => {
    functionTextBox.value = ""
    filterPhrases()
})


// =================== Data Variables ===============
let rootData: PhraseNoteModel[];
let updatedNodeIds: number[] = [];

const phraseNotes = ref<PhraseNoteModel[]>([]);

const totalPhrase = ref<number>(0)
const totalUpdatedNote = ref<number>(0)
const totalMasterAttach = ref<number>(0)

// =================== Table Variables ====================
const columns: Column<any>[] = [
    {
        key: "selection",
        width: 30
    },
    {
        key: "Context",
        dataKey: "Context",
        title: "LR Phrase",
        width: 700
    },
    {
        key: "tags",
        dataKey: "tags",
        title: "Tags",
        width: 100
    },
]

const typeText = ref<string | null>("")
const functionTextBox = ref<string>("")

const allSelected = ref<boolean>(false)
const loading = ref<boolean>(false)

const currSelectedRow = ref<PhraseNoteModel | null>(null)
let currAudio: HTMLAudioElement

const selectionPhrase = ref<string | undefined>("")

watch(currSelectedRow,(newValue, oldValue)=>{
    if(newValue){
        getParentPhrase(newValue)
    }
})

// ====================== Dialog Variable ==================

const attachPhraseMasterDialogVisible = ref<boolean>(false)
const editPhraseDialogVisible = ref<boolean>(false)
const editPhraseModel = ref<EditPhraseModel>({
    NoteId: 0,
    Example: "",
    Front: "",
    Meaning: ""
})

// ====================================== DATA HANDLE =========================================
onMounted(() => {
    getLessonPhrases()
    getUpdatedNoteIds()
})

// get lesson phrases
const getLessonPhrases = () => {
    functionTextBox.value = ""
    loading.value = true
    ajax.get<AnkiResponseModel>(`/phrase-notes?vid=${props.videoId}&searchContext=${functionTextBox.value}`)
        .then(res => {
            loading.value = false
            if (res.data.error != null) {
                ElMessage({
                    message: res.data.error,
                    type: 'error',
                })
                return
            }
            if (res.data.result != null) {
                rootData = []
                res.data?.result.forEach((item: any) => {
                    var phrase : PhraseNoteModel = {
                        CardId: item.cards[0],
                        NoteId: item.noteId,
                        Tags: item.tags,
                        VideoTitle: item["fields"]["Video title"].value as string,
                        Context: item["fields"].Context.value as string,
                        ContextTranslation: item["fields"]["Context translation"].value as string,
                        ImageFileName: item["fields"]["Next Image media filename"].value,
                        AudioFileName: item["fields"]["Audio clip media filename"].value as string,
                        PhraseMasterIds: (item["fields"]["PhraseIds"].value as string).split(",").filter(id => id != "").map(id => Number(id)),
                        PhraseMasters: [],
                        IsLoadParentPhrase: false,
                        Checked: false
                    }
                    rootData.push(phrase)
                })
                filterPhrases()
            }
        })
        .catch(res => {
            ElMessage({
                message: res.message,
                type: 'error',
            })
            loading.value = false
        })
}

const getUpdatedNoteIds = () => {
  const today = new Date();
  const year = String(today.getFullYear()).substring(2);
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  ajax.get<string[]>(`/updated-noteids?userid=${15091998}&date=${day + month + year}`).then((res) => {
    updatedNodeIds = res.data.map(Number)
  }).catch((res) => {
    console.log(res)
  })
}

//update phrase note and level up phrase master
const updateAndLevelUpPhraseMaster = (phraseNote: PhraseNoteModel) => {
    updatePhraseNote(phraseNote,false ,() => {
        phraseNote.PhraseMasters.forEach((pm) => {
            if(pm.Status < 5){
                var newStatus = pm.Status + 1
                updatePhraseMasterNoteStatus(pm, newStatus)
            }
        })
        recordUpdatedPhrase(phraseNote)
    })
}

//update phrase note and level down phrase master
const updateAndLevelDownPhraseMaster = (phraseNote: PhraseNoteModel) => {
    updatePhraseNote(phraseNote,false ,() => {
        phraseNote.PhraseMasters.forEach((pm) => {
            if(pm.Status > 1){
                var newStatus = pm.Status - 1
                updatePhraseMasterNoteStatus(pm, newStatus)
            }
        })
        recordUpdatedPhrase(phraseNote)
    })
}

// update phrase note but dont hide it
const updatePhraseNote = (phraseNote: PhraseNoteModel,formUpdateRange: boolean, callBack: (() => void) | null) => {
    ajax.put<AnkiResponseModel>("/phrase", JSON.stringify({
        NoteId: phraseNote.NoteId,
        Context: phraseNote.Context,
        "Context translation": phraseNote.ContextTranslation,
        PhraseIds: phraseNote.PhraseMasterIds.toString().replace("[]", "") as string
    })).then(res => {
        if (res.data.error != null) {
            ElMessage({
                type: "error",
                message: res.data.error,
            });
        }
        ElMessage({
            type: "success",
            message: `update phrase successful`,
        });
        if (props.autoHideUpdatedNote) {
            phraseNote.Checked = false;
            if (!formUpdateRange) {
                //--> auto move current row to next row or next checked row
                var crrRowIndex = phraseNotes.value.indexOf(phraseNote)

                // priority for checked row
                var nextRowIndex = phraseNotes.value.findIndex((w, idx) => w.Checked)
                if (nextRowIndex == -1) {
                    nextRowIndex = phraseNotes.value.findIndex((w, idx) => idx == crrRowIndex + 1)
                }
                if (nextRowIndex != -1) {
                    currSelectedRow.value = phraseNotes.value[nextRowIndex]
                    playAudio()
                }
            }
        }
        if(callBack != null){
            callBack()
        }
    }).catch(res => {
        ElMessage({
            type: "error",
            message: res.message,
        });
    })
}

const setRangePhraseMasterStatus = (newStatus: number) => {
    if (newStatus < 1 || newStatus > 5) {
        ElMessage({
            type: "error",
            message: "Status must be in range 1->5!"
        })
        return
    }
    var masterPhraseIds: PhraseMasterModel[] = []
    phraseNotes.value.filter(pn => pn.Checked).forEach(p => masterPhraseIds = masterPhraseIds.concat(p.PhraseMasters))

    masterPhraseIds = Array.from(new Set(masterPhraseIds));

    masterPhraseIds.forEach((pm) => {
        updatePhraseMasterNoteStatus(pm, newStatus)
    })
}

const updatePhraseMasterNoteStatus = (phraseMaster: PhraseMasterModel, newStatus: number) => {
    ajax.put<AnkiResponseModel>(
        "/note-status",
        JSON.stringify({
            NoteId: phraseMaster.NoteId,
            Status: newStatus.toString()
        })
    ).then((res) => {
        if (res.data.error) {
            ElMessage({
                type: "error",
                message: res.data.error,
            });
            console.log(`base level for master phrase id : ${phraseMaster.NoteId} error`)
            return
        }
        ElMessage({
            type: "success",
            message: `update phrase master status successful`,
        });
        phraseMaster.Status = newStatus
        // if (newStatus != masterPhraseId.Status) {
        //   analyzeWordStatus(newStatus, masterPhraseId.Status)
        //   masterPhraseId.Status = newStatus
        // }
    })
        .catch((res) => {
            console.log(`base level for master phrase id : ${phraseMaster.NoteId} error`)
            ElMessage({
                type: "error",
                message: res.message,
            });
        });
};

const getParentPhrase = (lrPhrase: PhraseNoteModel) => {
    if (lrPhrase.PhraseMasterIds.length > 0 && !lrPhrase.IsLoadParentPhrase) {
        lrPhrase.PhraseMasters = []
        ajax.get<AnkiResponseModel>(`/notes?ids=${lrPhrase.PhraseMasterIds.join(",")}`).then(res => {
            if (res.data.error == null && Array.isArray(res.data.result)) {
                lrPhrase.PhraseMasterIds = [];
                res.data.result.forEach((item: any) => {
                    if (item != null && Object.keys(item).length != 0) {
                        lrPhrase.PhraseMasters.push({
                            NoteId: item.noteId,
                            Front: item["fields"]["Front"].value,
                            Meaning: item["fields"]["Meaning"].value,
                            Status: +item["fields"]["Status"].value,
                            Example: item["fields"]["Example"].value,
                            VietnameseMeaning: item["fields"]["Vietnamese Meaning"].value,
                        })
                        lrPhrase.PhraseMasterIds.push(item.noteId)
                    }
                })
                lrPhrase.IsLoadParentPhrase = true;
            }
        })
    }
}

const removeParentPhrase = (masterPhraseId: number) => {
    if (currSelectedRow.value) {
        currSelectedRow.value.PhraseMasterIds = currSelectedRow.value.PhraseMasterIds.filter(pid => pid != masterPhraseId)
        currSelectedRow.value.PhraseMasters = currSelectedRow.value.PhraseMasters.filter(pp => pp.NoteId != masterPhraseId)
        updatePhraseNote(currSelectedRow.value,false,null)
    }
}

const deletePhrase = (noteId: number) => {
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
            ajax.delete<AnkiResponseModel>(`note?noteId=${noteId}&audioFileName=${currSelectedRow.value?.AudioFileName}&imageFileName=${currSelectedRow.value?.ImageFileName}`).then(res => {
                if (res.data.error != null) {
                    ElMessage({
                        type: "error",
                        message: res.data.error,
                    });
                    return
                }
                ElMessage({
                    type: 'success',
                    message: 'Delete completed',
                })
                phraseNotes.value = phraseNotes.value.filter(wordItem => wordItem.NoteId != currSelectedRow.value?.NoteId)
            }).catch(res => {
                console.error(res)
            })
        }).catch((res) => {
            ElMessage({
                type: "error",
                message: res.message,
            });
        })
}

const recordUpdatedPhrase = (phrase: PhraseNoteModel) => {
  if (updatedNodeIds.includes(phrase.NoteId)) {
    return
  } else {
    updatedNodeIds.push(phrase.NoteId)
    totalUpdatedNote.value++
    if (props.autoHideUpdatedNote) {
      phraseNotes.value = phraseNotes.value.filter(w => !updatedNodeIds.includes(w.NoteId))
    }
  }
}

const analyzeWordStatus = () => {
  totalPhrase.value = rootData.length
  totalUpdatedNote.value = updatedNodeIds.length
  totalMasterAttach.value = rootData.filter(p=>p.PhraseMasterIds.length > 0).length
}

// ====================================== TABLE HANDLE =========================================

const filterPhrases = () => {
    if (!functionTextBox.value) {
        phraseNotes.value = rootData
    } else if (functionTextBox.value.includes("bl:")) {
        var newStatus = parseInt(functionTextBox.value.substring(3))
        setRangePhraseMasterStatus(newStatus)
    }else if (functionTextBox.value.includes("na:")) {
        phraseNotes.value = rootData.filter(p=>p.PhraseMasterIds.length==0)
    }else {
        phraseNotes.value = rootData.filter((p) => p.Context.includes(functionTextBox.value))
    }
    if (props.autoHideUpdatedNote) {
        phraseNotes.value = phraseNotes.value.filter(p => !updatedNodeIds.includes(p.NoteId))
    }
    analyzeWordStatus()
}

const onAllRowSelectionChange = (value: CheckboxValueType) => {
    phraseNotes.value = phraseNotes.value.map(phrase => {
        phrase.Checked = value as boolean
        return phrase
    })
}

const getRowProps = (row: any) => {
    return {
        onClick: (event: any) => handleRowClick(event, row),
    }
}

const handleRowClick = (event: any, row: any) => {
    var target = event.target as HTMLElement
    if (target.className.includes("el-checkbox")) {
        return
    }
    var rowClicked = row.rowData as PhraseNoteModel
    if (currSelectedRow.value != rowClicked) {
        currSelectedRow.value = rowClicked
    }
    playAudio()
}

const playAudio = () => {
    if (!props.autoPlayAudio) {
        return
    }
    var fileName = currSelectedRow.value?.AudioFileName
    ajax.get(`/context-voice?fileName=${fileName}`, {
        responseType: 'arraybuffer'
    }).then((res) => {
        const arrayBuffer = res.data;
        // Convert the ArrayBuffer to a Blob
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        // Create an object URL from the Blob
        const url = URL.createObjectURL(blob);
        // Create an audio element and play the MP3
        if (currAudio != null) {
            currAudio.pause()
        }
        currAudio = new Audio(url);
        currAudio.play();
    }).catch(() => {

    })
};

const rowClass = ({ rowData }: Parameters<RowClassNameGetter<any>>[0]) => {
    if (rowData.NoteId === currSelectedRow.value?.NoteId) {
        return 'highlight-row'
    } else {
        return ''
    }
}

window.addEventListener('keydown', (e) => {
    var targetElement = e.target as Element
    if (!(targetElement instanceof HTMLInputElement) && targetElement.className != "ql-editor") {
        if (e.key == "ArrowDown") {
            goToNextRow()
        }
        if (e.key == "ArrowUp") {
            goToPreviousRow()
        }
        if (e.key == "r") {
            playAudio()
        }
    }
    if (targetElement.className == "ql-editor") {
        if (e.ctrlKey && e.key.toLowerCase() === 'q') {
            selectionPhrase.value = window.getSelection()?.toString()
            attachPhraseMasterDialogVisible.value = true
        }
        if (e.ctrlKey && e.key == 'a') {
            highLightWord()
        }
    }
});

const goToNextRow = () => {
    if (currSelectedRow.value != null) {
        var currentRowIndex = phraseNotes.value.indexOf(currSelectedRow.value);

        if (currentRowIndex == phraseNotes.value.length - 1) {
            return;
        }
        var nextRow = phraseNotes.value.at(currentRowIndex + 1)
        if (nextRow) {
            currSelectedRow.value = nextRow
            playAudio()
            typeText.value = null
        }
    }
}

const goToPreviousRow = () => {
    if (currSelectedRow.value != null) {
        var currentRowIndex = phraseNotes.value.indexOf(currSelectedRow.value);

        if (currentRowIndex == 0) {
            return;
        }
        var nextRow = phraseNotes.value.at(currentRowIndex - 1)
        if (nextRow) {
            currSelectedRow.value = nextRow
            playAudio()
            typeText.value = null
        }
    }
}

const highLightWord = () => {
    var selectText = window.getSelection()?.toString()
    if (currSelectedRow.value != null && selectText != null) {
        var highlightText = `<span style="background-color: rgb(255, 170, 0);">${selectText}</span>`
        currSelectedRow.value.Context = currSelectedRow.value.Context.replace(selectText, highlightText)
    }
}


// ========================== DIALOG HANDLE ==========================

const closeAttachPhraseMasterDialog = (newPhraseId: number | null) => {
    if (newPhraseId != null && currSelectedRow.value != null) {
        if (!currSelectedRow.value.PhraseMasterIds.includes(newPhraseId)) {
            if(currSelectedRow.value.PhraseMasterIds.length == 0){
                totalMasterAttach.value++
            }
            currSelectedRow.value.PhraseMasterIds.push(newPhraseId)
            currSelectedRow.value.IsLoadParentPhrase = false;
            getParentPhrase(currSelectedRow.value)
        }
    }
    attachPhraseMasterDialogVisible.value = false
}

const closeEditPhraseDialog = (isUpdated: boolean) => {
    if (isUpdated && currSelectedRow.value != null) {
        currSelectedRow.value.IsLoadParentPhrase = false;
        getParentPhrase(currSelectedRow.value)
    }
    editPhraseDialogVisible.value = false;
}

const openEditPhraseDialog = (phrase: EditPhraseModel) => {
    editPhraseDialogVisible.value = true
    editPhraseModel.value = phrase
}

</script>

<style>
.phrase-info-box {
    width: 100%;
  height: 100%;
  padding: 0 8px;
  overflow: scroll;
  border-left: 1px solid;
  border-color: #8080806f;
}

.my-toolbar {
    height: 0;
    padding: 0 !important;
}

.phrase-status-ctn {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* 3 columns */
  grid-template-rows: repeat(1, 1fr);
  /* 2 rows */
  gap: 10px;
}

</style>