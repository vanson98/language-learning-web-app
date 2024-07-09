<template>
    <div class="mw-layout">
        <el-row :gutter="10">
            <el-col :md="14">
                <div>
                    <ElInput id="search-box" placeholder="Search Box"></ElInput>
                </div>
            </el-col>
            <el-col :md="10">
                <div>Hello</div>
            </el-col>
        </el-row>
    </div>
</template>

<script lang="ts" setup>
import ajax from "@/libs/ajax";
import { ElRow, ElCol, ElInput, ElContainer, ElMain } from "element-plus"
import { onMounted } from "vue";

onMounted(()=>{
    searchWord()
})

const searchWord = () =>{
    ajax.get("/words").then(res=>{
        console.log(res)
    })
}
</script>

<style>
.mw-layout {
    margin: 8px;
}
</style>