<template>
    <el-menu :default-active="activeIndex" :router="true" class="el-menu-app" mode="horizontal" >
        <el-menu-item index="/home">Home</el-menu-item>
        <el-menu-item index="/vocabs">Vocab</el-menu-item>
        <el-menu-item index="/import-lesson">Import Lesson</el-menu-item>
        
        <el-select v-model="selectedLanguageId" placeholder="Select Language" class="lang-selector-ctn">
            <el-option v-for="item in languages" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        
    </el-menu>
</template>
<script setup lang="ts">
import Language from "@/entities/Language"
import axios from "axios";
import { ElMenu, ElMenuItem, ElOption, ElSelect, ElButton } from "element-plus";
import { onMounted, ref } from "vue";

const activeIndex = ref('/home')
let languages = ref<Language[]>([]);
const selectedLanguageId = ref('')



onMounted(() => {
    axios.post('http://localhost:3333/get-languages').then(response => {
        languages.value = response.data as Language[]

        console.log(languages.value)
    }).catch(() => {
        console.log("error")
    })
})


</script>

<style>
.el-menu-app {
    justify-content: center !important;
}

.lang-selector-ctn {
    position: absolute;
    right: 0;
    top: 10px;
}

</style>