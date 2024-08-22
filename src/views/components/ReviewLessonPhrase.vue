<template>
    <el-row>
        <el-col :span="4">
            <el-input v-model="functionTextBox" placeholder="Serch Phrase" @keyup.enter="getLessonPhrases"></el-input>
        </el-col>
        <el-col :span="4">
            <div class="ms-5">
                <el-button @click="getLessonPhrases" type="primary">Load Data</el-button>
            </div>
        </el-col>
    </el-row>
    <el-row style="height: 100%;">
        <el-col :span="14" style="height: 100%;">
            <el-auto-resizer>
                <template #default="{height,width}">
                    <el-table-v2 
                        :columns="columns" 
                        :data="phraseNotes" 
                        :width="width" 
                        :height="height" 
                        :row-props="getRowProps"
                        :row-class="rowClass"
                        :estimated-row-height="80"
                        fixed>
                        <template #header-cell="{ column }">
                            <template v-if="column.key == 'selection'">
                                <ElCheckbox :v-model:model-value="allSelected" @change="(value) => onAllRowSelectionChange(value)" />
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
                            <div class="el-loading-mask" style="display: flex; align-items: center; justify-content: center">
                                <ElIcon class="is-loading" color="var(--el-color-primary)" :size="26">
                                    <Loading />
                                </ElIcon>
                            </div>
                        </template>
                    </el-table-v2>
                </template>
            </el-auto-resizer>
            
            <!-- <el-table :data="lessonPhrases" ref="singleTableRef" style="width: 100%;height: 85vh;" highlight-current-row
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
            </el-table> -->
        </el-col>
        <el-col :span="10" style="height: 100%;" v-if="currSelectedRow">
            <div class="phrase-info-box">
               
                <div class="mb-3">
                    <label>Type Text</label>
                    <ElInput @keydown.enter="goToNextRow" v-model="typeText"></ElInput>
                </div>
                <div class="d-flex justify-content-start">
                    <label>Context</label>
                    <div class="ms-5 mb-2 d-flex justify-content-between flex-grow-1">
                        <div>
                            <el-button @click="highLightWord" type="warning">Highlight</el-button>
                        </div>
                        <div>
                            <el-button @click="() => playAudio()" type="primary">Replay Audio</el-button>
                        </div>
                        <div>
                            <el-button @click="() => updatPhraseNote(currSelectedRow)" type="primary">Save</el-button>
                            <el-button @click="() => deletePhrase(currSelectedRow!.NoteId)" type="danger">Remove</el-button>
                        </div>
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

                <template v-for="phrase in currSelectedRow.ParentPhrases">
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
                    <img :src="SERVER_BASE_URL + '/image?fileName=' + currSelectedRow.ImageFileName">
                </div>
            </div>
        </el-col>
    </el-row>
    <SearchPhraseDialog :visible="searchPhraseDialogVisible" :search-text="selectionPhrase"
        @close="closeSearchPhraseDialog" :currentPhraseId="currSelectedRow?.NoteId"
        :currentMasterPhraseIds="currSelectedRow?.PhraseIds" />
    <EditPhraseDialog :visible="editPhraseDialogVisible" @on-close="closeEditPhraseDialog"
        v-model:note-id="editPhraseModel.NoteId" v-model:example="editPhraseModel.Example"
        v-model:front="editPhraseModel.Front" v-model:meaning="editPhraseModel.Meaning" />
</template>

<script lang="ts" setup>
import { ElTag, ElRow, ElCol, ElCheckbox, Column, ElButton, ElMessageBox, ElMessage, ElInput, ElTableV2, ElAutoResizer, RowClassNameGetter, CheckboxValueType } from 'element-plus'
import {SERVER_BASE_URL} from '../../libs/url'
import LRPhraseNoteModel from '../../models/lesson/LRPhraseNoteModel'
import { onMounted, ref, toRef, toRefs, watch } from 'vue';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import {ajax} from '../../libs/ajax';
import AnkiResponseModel from '../../models/response/AnkiResponseModel';
import moment from 'moment';
import SearchPhraseDialog from '../modals/SearchPhraseDialog.vue'
import EditPhraseDialog from '../modals/EditPhraseDialog.vue'
import EditPhraseModel from '../../models/phrase/EditPhraseModel';

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
let rootData: LRPhraseNoteModel[];
let updatedNodeIds: number[] = [];

const phraseNotes = ref<LRPhraseNoteModel[]>([]);

const totalPhrase = ref<number>(0)
const updatedPhrase = ref<number>(0)
const attachMasterAmount = ref<number>(0)

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

const currSelectedRow = ref<LRPhraseNoteModel | null>(null)
let currAudio: HTMLAudioElement

const selectionPhrase = ref<string | undefined>("")

// ====================== Dialog Variable ==================

const searchPhraseDialogVisible = ref<boolean>(false)
const editPhraseDialogVisible = ref<boolean>(false)
const editPhraseModel = ref<EditPhraseModel>({
    NoteId: "",
    Example: "",
    Front: "",
    Meaning: ""
})

// ====================================== DATA HANDLE =========================================
onMounted(() => {
    getLessonPhrases()
})


const getLessonPhrases = () => {
    ajax.get<AnkiResponseModel>(`/phrase-notes?vid=${props.videoId}&searchContext=${functionTextBox.value}`)
        .then(res => {
            if (res.data.error != null) {
                ElMessage({
                    message: res.data.error,
                    type: 'error',
                })
                return
            }
            if (res.data.result != null) {
                phraseNotes.value = []
                res.data?.result.forEach((item: any) => {
                    phraseNotes.value.push({
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
                        IsLoadParentPhrase: false,
                        Checked: false
                    })
                })
                currSelectedRow.value = phraseNotes.value[0]
                getParentPhrase(phraseNotes.value[0])
            }
        })
        .catch(res => {
            console.log(res)
        })
}

const updatPhraseNote = (lrPhrase: LRPhraseNoteModel | null) => {
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

const getParentPhrase = (lrPhrase: LRPhraseNoteModel) => {
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

const removeParentPhrase = (parentPhraseId: string) => {
    if (currSelectedRow.value != null) {
        currSelectedRow.value.PhraseIds = currSelectedRow.value.PhraseIds.filter(pid => pid != parentPhraseId)
        currSelectedRow.value.ParentPhrases = currSelectedRow.value.ParentPhrases.filter(pp => pp.NoteId != parentPhraseId)
        updatPhraseNote(currSelectedRow.value)
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
            ajax.get<AnkiResponseModel>(`delete-note?noteId=${noteId}&audioFileName=${currSelectedRow.value?.AudioFileName}&imageFileName=${currSelectedRow.value?.ImageFileName}`).then(res => {
                if (res.data.error == null) {
                    ElMessage({
                        type: 'success',
                        message: 'Delete completed',
                    })
                    phraseNotes.value = phraseNotes.value.filter(wordItem => wordItem.NoteId != currSelectedRow.value?.NoteId)
                }

            }).catch(res => {
                console.error(res)
            })
        }).catch(() => { })
}


// ====================================== TABLE HANDLE =========================================

const filterPhrases = () => {
  if (!functionTextBox.value) {
    phraseNotes.value = rootData
  } else if(functionTextBox.value.includes("bl:")){
    var newStatus = parseInt(functionTextBox.value.substring(3))
    //setStatusForWords(newStatus)
  } 
  else {
    phraseNotes.value = rootData.filter((p) => p.Context.includes(functionTextBox.value))
  }
  if (props.autoHideUpdatedNote) {
    phraseNotes.value = phraseNotes.value.filter(p => !updatedNodeIds.includes(p.NoteId))
  }
  //scanAllWordStatus()
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
  if (target.className.includes("el-radio") || target.className.includes("el-checkbox")) {
    return
  }
  var rowClicked = row.rowData as LRPhraseNoteModel
  if (currSelectedRow.value == null) {
    currSelectedRow.value = rowClicked
  } else if (currSelectedRow.value != rowClicked) {
    currSelectedRow.value = rowClicked
  }
  playAudio()
}

const playAudio = () => {
    if(!props.autoPlayAudio){
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
            searchPhraseDialogVisible.value = true
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
    if(nextRow){
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
    if(nextRow){
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
const closeSearchPhraseDialog = (newPhraseId: string | null) => {
    if (newPhraseId != null && currSelectedRow.value != null) {
        if (!currSelectedRow.value.PhraseIds.includes(newPhraseId)) {
            currSelectedRow.value.PhraseIds.push(newPhraseId)
            currSelectedRow.value.IsLoadParentPhrase = false;
            getParentPhrase(currSelectedRow.value)
        }
    }
    searchPhraseDialogVisible.value = false
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
    border: 1px solid;
    padding: 10px;
    overflow: scroll;
}

.my-toolbar {
    height: 0;
    padding: 0 !important;
}
</style>