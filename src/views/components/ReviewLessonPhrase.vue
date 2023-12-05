<template>
    <el-row>
        <el-col :span="4">
            <el-input v-model="searchText" placeholder="Serch Phrase"
                @keyup.enter="() => getLessonPhrases(searchText)"></el-input>
        </el-col>
        <SearchPhraseDialog :visible="searchPhraseDialogVisible" :search-text="searchTextPhrase"
            @close="closeSearchPhraseDialog" :current-l-r-phrase-id="currentRow?.NoteId"
            :current-parent-phrase-ids="currentRow?.PhraseIds" />
    </el-row>
    <el-row>

        <el-col :span="14">
            <el-table :data="lessonPhrases" ref="singleTableRef" style="width: 100%;height: 85vh;" highlight-current-row
                @current-change="handleCurrentRowChange">
                <el-table-column type="index" width="50" />
                <el-table-column property="Context" label="Context" min-width="200">
                    <template #default="scope">
                        <p v-html="scope.row.Context"></p>
                        <audio :id="'card-audio-' + scope.row.NoteId">
                            <source :src="SERVER_BASE_URL + '/audio?fileName=' + scope.row.AudioFileName" type="audio/mpeg">
                        </audio>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>
        <el-col :span="10" v-if="currentRow != null">
            <div class="phrase-info-box">
                <div class="card-images">
                    <img :src="SERVER_BASE_URL + '/image?fileName=' + currentRow.PrevImageFileName">
                    <img :src="SERVER_BASE_URL + '/image?fileName=' + currentRow.NextImageFileName">
                </div>
                <hr>
                <div class="d-flex justify-content-end">
                    <el-button @click="() => deletePhrase(currentRow!.NoteId)" type="danger">Remove</el-button>
                </div>
                <hr>
                <div>
                    <QuillEditor v-model:content="currentRow.Context" toolbar="full" content-type="html"
                        style="margin-bottom: 2px;">

                    </QuillEditor>
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
                    <hr>
                    <el-tag>{{ phrase.NoteId }}</el-tag>
                    <br>
                    <b v-html="phrase.Front"></b>
                    <div v-html="phrase.Meaning"></div>
                </template>
            </div>
        </el-col>
    </el-row>
</template>

<script lang="ts" setup>
import { ElTag, ElRow, ElCol, ElTable, ElTableColumn, ElButton, ElMessageBox, ElMessage } from 'element-plus'
import SERVER_BASE_URL from '../../libs/url'
import LRPhraseModel from '../../models/lesson/LRPhraseModel'
import { onMounted, ref } from 'vue';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import ajax from '@/libs/ajax';
import AnkiResponseModel from '@/models/response/AnkiResponseModel';
import moment from 'moment';
import SearchPhraseDialog from '../modals/SearchPhraseDialog.vue'

const props = defineProps<{
    videoId: string
}>()

const lessonPhrases = ref<LRPhraseModel[]>([]);
const currentRow = ref<LRPhraseModel | null>(null)
const singleTableRef = ref<InstanceType<typeof ElTable>>()

const searchText = ref<string>("")
const searchTextPhrase = ref<string | undefined>("")
const searchPhraseDialogVisible = ref<boolean>(false)


onMounted(() => {
    getLessonPhrases("")
})

const getLessonPhrases = (searchContext: string) => {
    ajax.get<AnkiResponseModel>(`/lesson-phrases?vid=${props.videoId}&searchContext=${searchContext}`)
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
                        NoteId: item.noteId,
                        Tags: item.tags,
                        Context: item["fields"].Context.value as string,
                        ContextTranslation: item["fields"]["Context translation"].value as string,
                        NextImageFileName: item["fields"]["Next Image media filename"].value,
                        PrevImageFileName: item["fields"]["Previous Image media filename"].value,
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
    onCurrentPhraseRowChange(cr, ocr)
}

const onCurrentPhraseRowChange = (currectActivePhrase: LRPhraseModel | null, oldActivePhrase: LRPhraseModel | null) => {
    if (currectActivePhrase != null) {
        getParentPhrase(currectActivePhrase)
    }
    if (oldActivePhrase) {
        updateLRPhrase(oldActivePhrase)
    }
}

// =================== SEARCH PHRASE AND AUDIO ======================

window.addEventListener('keydown', (e) => {
    var targetElement = e.target
    if (!(targetElement instanceof HTMLInputElement)) {
        if (e.key == 'r' && currentRow.value != null) {
            var audioElement = document.getElementById("card-audio-" + currentRow.value?.NoteId)
            if (audioElement instanceof HTMLAudioElement) {
                audioElement.play()
            }
        }
        if (e.altKey && e.key == 'q') {
            searchTextPhrase.value = window.getSelection()?.toString()
            searchPhraseDialogVisible.value = true
        }
    }


});

const closeSearchPhraseDialog = (newPhraseId: string | null) => {
    if (newPhraseId != null && currentRow.value != null) {
        currentRow.value.PhraseIds.push(newPhraseId)
        currentRow.value.IsLoadParentPhrase = false;
        getParentPhrase(currentRow.value)
    }
    searchPhraseDialogVisible.value = false
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
                            Meaning: item["fields"]["Meaning"].value as string
                        })
                        lrPhrase.PhraseIds.push(item.noteId)
                    }
                })
                lrPhrase.IsLoadParentPhrase = true;
            }
        })
    }
}

const updateLRPhrase = (lrPhrase: LRPhraseModel) => {
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
            ajax.get<AnkiResponseModel>(`delete-note?noteId=${noteId}&audioFileName=${currentRow.value?.AudioFileName}&nextImageFileName=${currentRow.value?.NextImageFileName}&prevImageFileName=${currentRow.value?.PrevImageFileName}`).then(res => {
                if (res.data.error == null) {
                    ElMessage({
                        type: 'success',
                        message: 'Delete completed',
                    })
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
}

.my-toolbar {
    height: 0;
    padding: 0 !important;
}
</style>