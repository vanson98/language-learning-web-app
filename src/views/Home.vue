<template>
    <div class="common-layout">
        <ElContainer>
            <ElHeader>
                <ElMenu mode="horizontal">
                    <ElMenuItem @click="goToLearningLanguagePage">Learning Language Page</ElMenuItem>
                    <ElMenuItem @click="goToStockManagerPage">Stock Managing Page</ElMenuItem>
                </ElMenu>
            </ElHeader>
            <ElMain>
                Wellcom to new version of yourself
            </ElMain>
        </ElContainer>
    </div>
</template>
<script setup lang="ts">
import router from '@/router';
import { ElContainer, ElHeader, ElMain, ElMenu, ElMenuItem } from 'element-plus';

const goToLearningLanguagePage = () =>{
    router.push("/language-learning")
}

const goToStockManagerPage = () =>{
    router.push("/stock-manager")
}
</script>