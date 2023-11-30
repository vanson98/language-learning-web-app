<template>
    <el-row>
        <el-col :span="14">
            <el-table :data="lessonPhrases" ref="singleTableRef" style="width: 100%;height: 85vh;" highlight-current-row
                @current-change="handleCurrentChange">
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
                <div>
                    <QuillEditor v-model:content="currentRow.Context" toolbar="#context-toolbar1" content-type="html"
                        style="margin-bottom: 2px;">
                        <template #toolbar>
                            <div id="context-toolbar1" class="my-toolbar">
                            </div>
                        </template>
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
    <!-- <el-carousel 
        trigger="click" 
        type="card" 
        :autoplay="false" 
        :loop="false" 
        height="600px" 
        ref="carouselRef"
        @change="onCarouseChange"
        @keyup.ctrl.g>
        <el-carousel-item v-for="(item, index) in lessonPhrases" :key="item.NoteId" :name="item.NoteId">
            <el-card class="word-card-box">
                <div class="m-1">
                    <el-tag v-for="tag in item.Tags" :key="tag" effect="dark">{{ tag }}</el-tag>
                </div>
                <hr>
                <p v-html="item.Context"></p>
                <hr>
                <p v-html="item.ContextTranslation" class="word-ctx-translation"></p>
                <hr>
               
              
            </el-card>
        </el-carousel-item>
    </el-carousel> -->
</template>

<script lang="ts" setup>
import { ElInput, ElCarouselItem, ElCard, ElTag, ElRow, ElCol, ElTable, ElTableColumn } from 'element-plus'
import SERVER_BASE_URL from '../../libs/url'
import LessonPhraseModel from '../../models/lesson/LessonPhraseModel'
import { Ref, onMounted, ref } from 'vue';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const props = defineProps<{
    lessonPhrases: LessonPhraseModel[]
    carouselRefFun: () => Ref<any>
}>()

const currentRow = ref<LessonPhraseModel | null>(null)
const singleTableRef = ref<InstanceType<typeof ElTable>>()
const emit = defineEmits(["onSliceChange", "onSelectedText"])

const onCarouseChange = (activeIndex: any, oldActiveIndex: any) => {
    emit("onSliceChange", activeIndex)
}

window.addEventListener('keydown', (e) => {
    var targetElement = e.target
    if (!(targetElement instanceof HTMLInputElement)) {
        if(e.key == 'r' && currentRow.value != null){
            var audioElement = document.getElementById("card-audio-"+currentRow.value?.NoteId)
            debugger
            if(audioElement instanceof HTMLAudioElement){
                audioElement.play()
            }
        }
        if (e.altKey && e.key == 'q') {
            if (window.getSelection != null) {
                emit("onSelectedText", window.getSelection()?.toString())
            }
        }
    }


});

onMounted(() => {
    currentRow.value = props.lessonPhrases[0]
})


const handleCurrentChange = (val: LessonPhraseModel) => {
    currentRow.value = val
}

</script>

<style>
.phrase-info-box {
    width: 100%;
    height: 100%;
    border: 1px solid;
    padding: 5px;
}

.my-toolbar {
    height: 0;
    padding: 0 !important;
}
</style>