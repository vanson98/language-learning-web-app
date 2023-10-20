<template>
    <div class="d-flex justify-content-center">
        <table>
            <thead>
                <th>Lesson Name</th>
                <th>Due Date</th>
            </thead>
            <tbody>
                <tr v-for="lesson in lessons">
                    <td>
                        <router-link :to="{name:'lesson-detail',params: {id: lesson.id} }">
                            {{ lesson.name }}
                        </router-link>
                    </td>
                    <td>{{ moment.utc(lesson.dueDate).format("DD/MM/YYYY") }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    
</template>

<script lang="ts" setup>
import ajax from '@/libs/ajax';
import LessonItemModel from '@/models/lesson/LessonItemModel';
import { onMounted,ref } from 'vue';
import { useRoute } from 'vue-router';
import moment from 'moment';

const route = useRoute()
const lessons = ref<LessonItemModel[]>([])

onMounted(()=>{
    ajax.get<LessonItemModel[]>(`/lessons/?subjectId=${route.params.subjectId}`).then((res)=>{
        lessons.value = res.data
    })
})
</script>