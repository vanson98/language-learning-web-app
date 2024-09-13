<template>
    <el-row style="height: 5%;">
        <el-col :span="4">
            <el-input v-model="functionTextBox" placeholder="bl: " @keyup.enter="filterPhrases"></el-input>
        </el-col>
        <el-col :span="4">
            <div class="d-flex">
                <div class="ms-1 me-1">
                    <el-button @click="getPhrasePairs" type="primary">Load Data</el-button>
                </div>

                <ElDropdown>
                    <el-button type="primary">
                        Action
                    </el-button>
                    <template #dropdown>
                        <ElDropdownMenu>
                            <el-dropdown-item @click="selectTopTenPhraseNote">Select top 10</el-dropdown-item>
                            <el-dropdown-item @click="updateSelectedPhrasePair">Update</el-dropdown-item>
                            <el-dropdown-item @click="levelUpRnage">Status +1</el-dropdown-item>
                            <el-dropdown-item @click="levelDownRange">Status -1</el-dropdown-item>
                        </ElDropdownMenu>
                    </template>
                </ElDropdown>
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
                    <el-table-v2 :columns="columns" :data="phrasePairs" :width="width" :height="height"
                        :row-props="getRowProps" :row-class="rowClass" :estimated-row-height="80" fixed>
                        <template #header-cell="{ column }">
                            <template v-if="column.key == 'selection'">
                                <ElCheckbox :v-model:model-value="allSelected"
                                    @change="(value) => onAllRowSelectionChange(value)" />
                            </template>
                        </template>

                        <template #cell="{ rowData, column, rowIndex }">
                            <template v-if="column.key == 'selection'">
                                <el-checkbox v-model:model-value="rowData.PhraseMaster.Checked" />
                            </template>
                            <template v-if="column.key == 'front'">
                                <div v-html="rowData.PhraseMaster.Front"></div>
                            </template>
                            <!-- <template v-if="column.key == 'tags'">
                                <el-tag v-for="tag in rowData.Tags">{{ tag }}</el-tag>
                            </template> -->
                            <template v-if="column.key === 'status'">
                                <el-radio-group :model-value="rowData.PhraseMaster.Status" class="ml-4"
                                    @change="(value) => updatePhraseMasterStatus(rowData.PhraseMaster,value as number)"  :key="rowData.PhraseMaster.NoteId">
                                    <el-radio-button :value="1" size="large">New</el-radio-button>
                                    <el-radio-button :value="2" size="large">Rec</el-radio-button>
                                    <el-radio-button :value="3" size="large">Fam</el-radio-button>
                                    <el-radio-button :value="4" size="large">Ler</el-radio-button>
                                    <el-radio-button :value="5" size="large">Knw</el-radio-button>
                                </el-radio-group>
                            </template>
                            <!-- <template v-if="column.key == 'meaning'">
                                <div v-html="rowData.PhraseMaster.Meaning"></div>
                            </template> -->
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
        <el-col :span="10" style="height: 100%;" v-if="currSelectedRow?.PhraseMaster">
            <div class="phrase-info-box">
                <div class="mt-2 d-flex justify-content-between">
                    <ElTag>{{ currSelectedRow.PhraseMaster.NoteId }}</ElTag>
                    <el-button @click="() => updatePhrasePair(currSelectedRow!,false)"
                        type="info">Update All</el-button>
                </div>
                <div class="mt-2">
                    <label>Master Phrase</label>
                    <el-input v-model="currSelectedRow.PhraseMaster.Front" autosize type="textarea" />
                </div>
                <div class="mt-2">
                    <label>Master Phrase Meaning</label>
                    <el-input v-model="currSelectedRow.PhraseMaster.Meaning" autosize type="textarea" />
                </div>
                <div class="mt-2">
                    <label>Master Phrase Example</label>
                    <el-input v-model="currSelectedRow.PhraseMaster.Example" autosize type="textarea" />
                </div>

                <div class="mt-2">
                    <label>Type Text</label>
                    <ElInput @keydown.enter="goToNextRow" v-model="typeText"></ElInput>
                </div>
               
                <template v-for="pn in currSelectedRow.PhraseNotes">
                    <div class="mt-2 d-flex justify-content-between">
                        <!-- <el-tag>{{ pn.NoteId }}</el-tag> -->
                        <div>
                            <el-button @click="() => playAudio(pn)" type="primary">Play Audio</el-button>
                            <el-button @click="()=>openAttachPhraseMasterDialog(pn)" type="primary">Bind PM</el-button>
                            <el-button @click="()=>unbindPhraseMaster(pn)" type="primary">Unbind PM</el-button>
                            <el-button @click="() => highLightWord(pn)" type="warning">Highlight</el-button>
                            <el-button @click="() => deletePhrase(pn)" type="danger">Remove</el-button>
                        </div>
                    </div>
                    <div class="mt-2">
                        <QuillEditor v-model:content="pn.Context" toolbar="#context-toolbar1" content-type="html">
                            <template #toolbar>
                                <div id="context-toolbar1" class="my-toolbar"></div>
                            </template>
                        </QuillEditor>
                    </div>
                    <div class="mt-2">
                        <label>Context Translation</label>
                        <QuillEditor v-model:content="pn.ContextTranslation" toolbar="#context-toolbar2" content-type="html">
                            <template #toolbar>
                                <div id="context-toolbar2" class="my-toolbar"></div>
                            </template>
                        </QuillEditor>
                        <br>
                    </div>
                    <div class="card-images">
                        <img :src="SERVER_BASE_URL + '/image?fileName=' + pn.ImageFileName" />
                        <strong>{{ pn.VideoTitle }}</strong>
                    </div>
                </template>
                
                <!-- <template v-for="phrase in currSelectedRow.PhraseMasters">
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
                </template> -->
                
            </div>
        </el-col>
    </el-row>
    <AttachPhraseMasterDialog :visible="attachPhraseMasterDialogVisible" :search-text="selectionText"
        @close="closeAttachPhraseMasterDialog" :currentPhraseId="currPhraseAttaching?.NoteId"
        :currentMasterPhraseIds="currPhraseAttaching?.PhraseMasterIds" />
    <EditPhraseDialog :visible="editPhraseDialogVisible" @on-close="closeEditPhraseDialog"
        v-model:note-id="editPhraseModel.NoteId" v-model:example="editPhraseModel.Example"
        v-model:front="editPhraseModel.Front" v-model:meaning="editPhraseModel.Meaning" />
</template>

<script lang="ts" setup>
import {
    ElRow, ElCol, ElCheckbox, Column,
    ElButton, ElMessage, ElInput, ElTableV2,
    ElAutoResizer, RowClassNameGetter, CheckboxValueType,
    ElIcon, ElDropdownMenu, ElDropdownItem, ElDropdown,
    ElRadioGroup, ElRadioButton,
    ElTag,
    ElMessageBox,
} from 'element-plus'
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
import PhrasePairModel from '@/models/lesson/PhrasePairModel';

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
let rootData: PhrasePairModel[];
let updatedPhraseMtIds: number[] = [];

const phrasePairs = ref<PhrasePairModel[]>([]);

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
        key: "front",
        dataKey: "Front",
        title: "Phrase Master",
        width: 220
    },
    // {
    //     key: "tags",
    //     dataKey: "Tags",
    //     title: "Tags",
    //     width: 100
    // },
    {
        key: "status",
        dataKey: "Status",
        title: "Status",
        width: 350,
    },
    // {
    //     key: "meaning",
    //     dataKey: "Meaning",
    //     title: "Meaning",
    //     width: 250
    // }
]

const typeText = ref<string | null>("")
const functionTextBox = ref<string>("")

const allSelected = ref<boolean>(false)
const loading = ref<boolean>(false)

const currSelectedRow = ref<PhrasePairModel | null>(null)
let currAudio: HTMLAudioElement

const selectionText = ref<string | undefined>("")
let currPhraseAttaching : PhraseNoteModel | null = null

watch(currSelectedRow, (newValue, oldValue) => {
    if (newValue) {
        //getParentPhrase(newValue)
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
    getPhrasePairs()
    getUpdatedNoteIds()
})

const getPhrasePairs = () =>{
    functionTextBox.value = ""
    loading.value = true
    currSelectedRow.value = null
    if(props.videoId){
        getLessonPhrasePairs()
    }else{
        getAllPhrasePairs()
    }
}

// get lesson phrases
const getLessonPhrasePairs = () => {
    
    ajax.get(`/lesson-phrases?vid=${props.videoId}`)
        .then(res => {
            loading.value = false

            rootData = []
            res.data?.forEach((item: any,index: number) => {
                var phrasePair: PhrasePairModel = {
                    PhraseMaster: {
                        NoteId: item.PhraseMaster?.noteId == -1 ? -(index+1) : +item["PhraseMaster"]["noteId"],
                        Front: item.PhraseMaster?.noteId == -1 ? "NOT BINDING" : item["PhraseMaster"]["fields"]["Front"].value.replace(/<\/?[^>]+(>|$)/g, '').replace(/&nbsp;/g, ' '),
                        Example: item["PhraseMaster"]["fields"]["Example"].value.replace(/<\/?[^>]+(>|$)/g, '').replace(/&nbsp;/g, ' '),
                        Meaning: item["PhraseMaster"]["fields"]["Meaning"].value.replace(/<\/?[^>]+(>|$)/g, '').replace(/&nbsp;/g, ' '),
                        Status: +item["PhraseMaster"]["fields"]["Status"].value,
                        VietnameseMeaning: item["PhraseMaster"]["fields"]["Vietnamese Meaning"].value,
                        Tags: null,
                        Checked: false
                    },
                    PhraseNotes: []
                }
                if (item["PhraseNotes"] instanceof Array) {
                    item["PhraseNotes"].forEach((pn: any) => {
                        phrasePair.PhraseNotes?.push({
                            NoteId: +pn["noteId"],
                            Context: pn["fields"]["Context"].value,
                            ContextTranslation: pn["fields"]["Context translation"].value,
                            VideoTitle: pn["fields"]["Video title"].value,
                            ImageFileName: pn["fields"]["Next Image media filename"].value,
                            AudioFileName: pn["fields"]["Audio clip media filename"].value,
                            PhraseMasterIds: pn["fields"]["PhraseIds"].value,
                        })
                    })
                }

                rootData.push(phrasePair)
            })
            totalPhrase.value = rootData.length
            //totalMasterAttach.value = rootData.filter(p=>p.PhraseMaster.NoteId < 0).length
            filterPhrases()

        })
        .catch(res => {
            ElMessage({
                message: res.message,
                type: 'error',
            })
            loading.value = false
        })
}

// get all phrase pair
const getAllPhrasePairs = () =>{
    ajax.get<AnkiResponseModel>(`/master-phrases`)
        .then(res => {
            loading.value = false
            if(res.data.error){
                ElMessage({
                    message: res.data.error,
                    type: 'error',
                })
            }

            rootData = []
            res.data.result.forEach((item: any,index: number) => {
                var phrasePair: PhrasePairModel = {
                    PhraseMaster: {
                        NoteId: item.noteId,
                        Front:  item["fields"]["Front"].value,
                        Example: item["fields"]["Example"].value,
                        Meaning: item["fields"]["Meaning"].value,
                        Status: item["fields"]["Status"].value == "" ? 0 : +item["fields"]["Status"].value,
                        VietnameseMeaning: item["fields"]["Vietnamese Meaning"].value,
                        Tags: null,
                        Checked: false
                    },
                    PhraseNotes: []
                }
                rootData.push(phrasePair)
            })
            totalPhrase.value = rootData.length
            //totalMasterAttach.value = rootData.filter(p=>p.PhraseMaster.NoteId < 0).length
            filterPhrases()

        })
        .catch(res => {
            ElMessage({
                message: res.message,
                type: 'error',
            })
            loading.value = false
        })
}

// get single phrase master
const getSinglePhraseMasterAndBinding = (phraseMasterId: number) => {
        ajax.get<AnkiResponseModel>(`/notes?ids=${phraseMasterId}`).then(res => {
            if (res.data.error) {
                ElMessage({
                    type: "error",
                    message: "Get binding phrase master error"
                })
            }
            var item = res.data.result[0]
            var phraseMaster : PhraseMasterModel = {
                    NoteId: item.noteId,
                    Front: item["fields"]["Front"].value,
                    Meaning: item["fields"]["Meaning"].value,
                    Status: +item["fields"]["Status"].value,
                    Example: item["fields"]["Example"].value,
                    VietnameseMeaning: item["fields"]["Vietnamese Meaning"].value,
                    Checked: false,
                    Tags: null
            }

            if(currSelectedRow.value!.PhraseMaster.NoteId < 0){
                // incase not binding
                currSelectedRow.value!.PhraseMaster = phraseMaster
            }else{
                // incase binding
                let newPhrasePair : PhrasePairModel = {
                    PhraseMaster: phraseMaster,
                    PhraseNotes: []
                }
                newPhrasePair.PhraseNotes.push(currPhraseAttaching!)
                rootData.push(newPhrasePair)
                filterPhrases()
            }
            
        })
}

// get updated phrase ids
const getUpdatedNoteIds = () => {
    const today = new Date();
    const year = String(today.getFullYear()).substring(2);
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    ajax.get<string[]>(`/updated-noteids?userid=${15091998}&date=${day + month + year}`).then((res) => {
        updatedPhraseMtIds = res.data.map(Number)
        totalUpdatedNote.value = updatedPhraseMtIds.length
    }).catch((res) => {
        console.log(res)
    })
}

//update phrase master status
const updatePhraseMasterStatus = (phraseMaster: PhraseMasterModel,newStatus: number) => {
    if(phraseMaster.NoteId < 0 ){
        return
    }
   ajax.put<AnkiResponseModel>("/note-status", JSON.stringify({
        NoteId: phraseMaster.NoteId,
        Status: newStatus.toString(),
    })).then(res => {
        if (res.data.error) {
            ElMessage({
                type: "error",
                message: res.data.error,
            });
        }else{
            phraseMaster.Status = newStatus
        }
    }).catch(res => {
        ElMessage({
            type: "error",
            message: res.message,
        });
    })
}

// update phrase pair 
const updatePhrasePair = (phrasePair: PhrasePairModel, formUpdateRange: boolean) => {
    updateMtPhrase(phrasePair.PhraseMaster,formUpdateRange)
    phrasePair.PhraseNotes.forEach(phraseNote => {
        updatePhrase(phraseNote)
    });
    // record updated note
    // if (props.autoHideUpdatedNote) {
    //         phraseNote.Checked = false;
    //         if (!formUpdateRange) {
    //             //--> auto move current row to next row or next checked row
    //             var crrRowIndex = phrasePairs.value.indexOf(phraseNote)

    //             // priority for checked row
    //             var nextRowIndex = phrasePairs.value.findIndex((w, idx) => w.Checked)
    //             if (nextRowIndex == -1) {
    //                 nextRowIndex = phrasePairs.value.findIndex((w, idx) => idx == crrRowIndex + 1)
    //             }
    //             if (nextRowIndex != -1) {
    //                 currSelectedRow.value = phrasePairs.value[nextRowIndex]
    //                 playAudio()
    //             }
    //         }
    //     }
}

// update normal phrase
const updatePhrase = (phraseNote: PhraseNoteModel,  callback?: () => void) => {
    ajax.put<AnkiResponseModel>("/phrase", JSON.stringify({
        NoteId: phraseNote.NoteId,
        Context: phraseNote.Context,
        "Context translation": phraseNote.ContextTranslation,
        PhraseIds: phraseNote.PhraseMasterIds.toString().replace("[]", "") as string
    })).then(res => {
        if (res.data.error) {
            ElMessage({
                type: "error",
                message: res.data.error,
            });
            return
        }
        ElMessage({
            type: "success",
            message: `Update phrase ${phraseNote.NoteId} success`,
        });
        if (callback) {
            callback()
        }
    }).catch(res => {
        ElMessage({
            type: "error",
            message: res.message,
        });
    })
}

// update master phrase
const updateMtPhrase = (phraseMt: PhraseMasterModel, fromRange: boolean)=>{
    if(phraseMt.NoteId < 0){
        return
    }
    ajax.put<AnkiResponseModel>("/phrase-master", JSON.stringify({
        NoteId: phraseMt.NoteId,
        Front: phraseMt.Front,
        Meaning: phraseMt.Meaning,
        Example: phraseMt.Example
    })).then(res => {
        if (res.data.error) {
            ElMessage({
                type: "error",
                message: res.data.error,
            });
            return
        }
        ElMessage({
            type: "success",
            message: `Update phrase master ${phraseMt.NoteId} success`,
        });
        if (props.autoHideUpdatedNote) {
            phraseMt.Checked = false
        }
        recordUpdatedPhrase(phraseMt)
    }).catch(res => {
        ElMessage({
            type: "error",
            message: res.message,
        });
    })
}

// update selected phrase pair
const updateSelectedPhrasePair = () =>{
    phrasePairs.value.forEach(pp=>{
        if(pp.PhraseMaster.Checked){
            updatePhrasePair(pp,true)
        }
    })
}

const recordUpdatedPhrase = (phraseMt: PhraseMasterModel) => {
  if (updatedPhraseMtIds.includes(phraseMt.NoteId)) {
    return
  } else {
    updatedPhraseMtIds.push(phraseMt.NoteId)
    totalUpdatedNote.value++
    if (props.autoHideUpdatedNote) {
      phrasePairs.value = phrasePairs.value.filter(pp => !updatedPhraseMtIds.includes(pp.PhraseMaster.NoteId))
    }
  }
}

const setRangPhraseMasterStatus = (newStatus: number) => {
    if (newStatus < 0 || newStatus > 5) {
        ElMessage({
            type: "error",
            message: "Status must be in range 1->5!"
        })
        return
    }
    phrasePairs.value.forEach((pp) => {
        updatePhraseMasterStatus(pp.PhraseMaster, newStatus)
    })
}

const deletePhrase = (phrase: PhraseNoteModel) => {
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
            ajax.delete<AnkiResponseModel>(`note?noteId=${phrase.NoteId}&audioFileName=${phrase.AudioFileName}&imageFileName=${phrase.ImageFileName}`).then(res => {
                if (res.data.error) {
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
                if(currSelectedRow.value!.PhraseMaster.NoteId < 0){
                    rootData = rootData.filter(pp => pp.PhraseMaster.NoteId != currSelectedRow.value?.PhraseMaster.NoteId)
                    filterPhrases()
                }else if(currSelectedRow.value){
                    currSelectedRow.value.PhraseNotes = currSelectedRow.value?.PhraseNotes.filter(p => p.NoteId != phrase.NoteId)
                }
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

const levelUpRnage = () => {
    // phrasePairs.value.forEach(p=>{
    //     if(p.Checked){
    //         updateAndLevelUpPhraseMaster(p,true)
    //     }
    // })
}

const levelDownRange = () => {
    // phrasePairs.value.forEach(p=>{
    //     if(p.Checked){
    //         updateAndLevelDownPhraseMaster(p,true)
    //     }
    // })
}

const unbindPhraseMaster = (phraseNote: PhraseNoteModel) =>{
    var currentPmId = currSelectedRow.value!.PhraseMaster.NoteId.toString()
    phraseNote.PhraseMasterIds = phraseNote.PhraseMasterIds.replace(`,${currentPmId}`,"").replace(`${currentPmId},`,"").replace(currentPmId,"")
    updatePhrase(phraseNote,()=>{
        currSelectedRow.value!.PhraseNotes = currSelectedRow.value!.PhraseNotes.filter((p)=>p.NoteId != phraseNote.NoteId)
    })
}
// ====================================== TABLE HANDLE =========================================

const filterPhrases = () => {
    if (!functionTextBox.value) {
        phrasePairs.value = rootData
    } else if (functionTextBox.value.includes("bl:")) {
        var newStatus = parseInt(functionTextBox.value.substring(3))
        setRangPhraseMasterStatus(newStatus)
    } else if (functionTextBox.value.includes("st:")) {
        var status = parseInt(functionTextBox.value.substring(3))
        phrasePairs.value = rootData.filter(p => p.PhraseMaster?.Status == status)
    } else {
        phrasePairs.value = rootData.filter((p) => p.PhraseMaster?.Front.includes(functionTextBox.value))
    }
    if (props.autoHideUpdatedNote) {
        phrasePairs.value = phrasePairs.value.filter(p => !updatedPhraseMtIds.includes(p.PhraseMaster.NoteId))
    }
    sortWordByLemmaAsc()
}

const onAllRowSelectionChange = (value: CheckboxValueType) => {
    phrasePairs.value.forEach(pp => {
        pp.PhraseMaster.Checked = value as boolean
        
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
    if (currSelectedRow.value != row.rowData ) {
        currSelectedRow.value = row.rowData 
    }
    if(props.autoPlayAudio && currSelectedRow.value!.PhraseNotes.length > 0){
        playAudio(currSelectedRow.value!.PhraseNotes[0])
    }
}

const playAudio = (phrase: PhraseNoteModel) => {
    if (!props.autoPlayAudio) {
        return
    }
    var fileName = phrase.AudioFileName
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
    if (rowData.PhraseMaster.NoteId === currSelectedRow.value?.PhraseMaster?.NoteId) {
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
            playAudio(currSelectedRow.value!.PhraseNotes[0])
        }
    }
    
});

const goToNextRow = () => {
    // if (currSelectedRow.value != null) {
    //     var currentRowIndex = phrasePairs.value.indexOf(currSelectedRow.value);

    //     if (currentRowIndex == phrasePairs.value.length - 1) {
    //         return;
    //     }
    //     var nextRow = phrasePairs.value.at(currentRowIndex + 1)
    //     if (nextRow) {
    //         currSelectedRow.value = nextRow
    //         playAudio()
    //         typeText.value = null
    //     }
    // }
}

const goToPreviousRow = () => {
    // if (currSelectedRow.value != null) {
    //     var currentRowIndex = phrasePairs.value.indexOf(currSelectedRow.value);

    //     if (currentRowIndex == 0) {
    //         return;
    //     }
    //     var nextRow = phrasePairs.value.at(currentRowIndex - 1)
    //     if (nextRow) {
    //         currSelectedRow.value = nextRow
    //         playAudio()
    //         typeText.value = null
    //     }
    // }
}

const highLightWord = (phraseNote: PhraseNoteModel) => {
    var selectText = window.getSelection()?.toString()
    if (currSelectedRow.value != null && selectText != null) {
        var highlightText = `<span style="background-color: rgb(255, 170, 0);">${selectText}</span>`
        phraseNote.Context = phraseNote.Context.replace(selectText, highlightText)
    }
}

const selectTopTenPhraseNote = () => {
      phrasePairs.value.forEach((w, i) => {
        if (i < 10) {
          w.PhraseMaster.Checked = true
        }
      })
}

const sortWordByLemmaAsc = () => {
  phrasePairs.value.sort((a, b) => {
    if(a.PhraseMaster!.NoteId < 0)
        return 1;
    else if (b.PhraseMaster!.NoteId < 0){
        return -1;
    } else {
        return a.PhraseMaster!.Front.localeCompare(b.PhraseMaster!.Front)
    }
  });
}

// ========================== DIALOG HANDLE ==========================

const openAttachPhraseMasterDialog = (phrase: PhraseNoteModel) =>{
    currPhraseAttaching = phrase
    selectionText.value = window.getSelection()?.toString()
    attachPhraseMasterDialogVisible.value = true
}

const closeAttachPhraseMasterDialog = (phraseMasterId: number | null) => {
    if (phraseMasterId != null && currPhraseAttaching != null) {
        var existPhrasePair = phrasePairs.value.find(pp=>pp.PhraseMaster?.NoteId === phraseMasterId)
        
        currPhraseAttaching.PhraseMasterIds = currPhraseAttaching.PhraseMasterIds.trim() ?
            `${currPhraseAttaching.PhraseMasterIds},${phraseMasterId}` :
            phraseMasterId.toString()

        if (existPhrasePair && existPhrasePair.PhraseMaster.NoteId != currSelectedRow.value?.PhraseMaster.NoteId) {
            if (currSelectedRow.value!.PhraseMaster.NoteId < 0){
                // in-case phrase master existing 
                existPhrasePair.PhraseNotes.push(currPhraseAttaching!)
                rootData = rootData.filter(pp=>pp.PhraseMaster?.NoteId != currSelectedRow.value?.PhraseMaster?.NoteId)
                filterPhrases()
            }else{
                existPhrasePair.PhraseNotes.push(currPhraseAttaching)
            }
        }else if(!existPhrasePair){
            // in-case have new phrase master (binding-not binding)
            getSinglePhraseMasterAndBinding(phraseMasterId)
        }
        
    }
    attachPhraseMasterDialogVisible.value = false
}

const closeEditPhraseDialog = (isUpdated: boolean) => {
    // if (isUpdated && currSelectedRow.value != null) {
    //     currSelectedRow.value.IsLoadParentPhrase = false;
    //     getParentPhrase(currSelectedRow.value)
    // }
    // editPhraseDialogVisible.value = false;
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