<template>
    <el-menu :default-active="activeIndex" :router="true" class="el-menu-app" mode="horizontal" >
        <el-menu-item index="/home">Home</el-menu-item>
        <el-menu-item index="/vocabs">Vocab</el-menu-item>
        <el-menu-item index="/import-lesson">Import Lesson</el-menu-item>
        
        <el-select v-model="selectedLanguageId" 
        placeholder="Select Language" 
        class="lang-selector-ctn"
        @change="onSelectedLanguageChange">
            <el-option v-for="item in languages" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        
    </el-menu>
</template>
<script setup lang="ts">
import ajax from "@/libs/ajax";
import Language from "@/models/language/Language"
import { ElMenu, ElMenuItem, ElOption, ElSelect, ElButton } from "element-plus";
import { onMounted, ref } from "vue";

const activeIndex = ref('/home')
let languages = ref<Language[]>([]);
const selectedLanguageId = ref('')



onMounted(() => {
    ajax.get('/languages').then(response => {
        if(response.data != null){
            languages.value = response.data as Language[]
            selectedLanguageId.value = languages.value[0].id
            localStorage.setItem("languageId",selectedLanguageId.value)
        }
    }).catch(() => {
        console.log("error")
    })
})

const onSelectedLanguageChange = ()=>{
    localStorage.setItem("languageId",selectedLanguageId.value)
}
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