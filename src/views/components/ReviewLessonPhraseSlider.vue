<template>
    <el-carousel 
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
                <div class="card-images">
                    <img :src="SERVER_BASE_URL + '/image?fileName=' + item.PrevImageFileName">
                    <img :src="SERVER_BASE_URL + '/image?fileName=' + item.NextImageFileName">
                </div>
                <audio :id="'card-audio-' + index">
                    <source :src="SERVER_BASE_URL + '/audio?fileName=' + item.AudioFileName" type="audio/mpeg">
                </audio>
                <hr>
                <el-tag effect="dark" >{{ item.PhraseId }}</el-tag>
                <!-- <input autofocus :id="'input-word_' + index" class="w-100"> -->
            </el-card>
        </el-carousel-item>
    </el-carousel>
</template>

<script lang="ts" setup>
import { ElCarousel, ElCarouselItem, ElCard,ElTag } from 'element-plus'
import SERVER_BASE_URL from '../../libs/url'
import LessonPhraseModel from '../../models/lesson/LessonPhraseModel'
import { Ref } from 'vue';


const props = defineProps<{
    lessonPhrases : LessonPhraseModel[]
    carouselRefFun: () => Ref<any>
}>()

const carouselRef = props.carouselRefFun()

const emit = defineEmits(["onSliceChange","onSelectedText"])

const onCarouseChange = (activeIndex: any, oldActiveIndex: any) => {
  emit("onSliceChange",activeIndex)
}

window.addEventListener('keydown', (e) => {
  if (e.altKey && e.key == 'q') {
    if(window.getSelection != null){
        emit("onSelectedText",window.getSelection()?.toString())
    }
  }
});
</script>