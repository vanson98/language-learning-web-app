<template>
    
</template>

<script setup lang="ts">
import ajax from '@/libs/ajax';
import LessonDetailModel from '@/models/lesson/LessonDetailModel';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const model = ref<LessonDetailModel>()

onMounted(()=>{
    ajax.get<LessonDetailModel>(`/lesson-detail?id=${route.params.id}`).then(res=>{
        model.value = res.data
        console.log(res.data)
    })
})

</script>