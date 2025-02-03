<template>
    <div class="common-layout">
        <ElContainer>
            <ElHeader>
                <ElMenu mode="horizontal">
                    <ElMenuItem @click="goToLearningLanguagePage">Learning Language Page</ElMenuItem>
                    <ElMenuItem @click="goToStockManagerPage">Stock Managing</ElMenuItem>
                    <ElMenuItem @click="goToStockAccountsManagerPage">Stock Accounts</ElMenuItem>
                </ElMenu>
            </ElHeader>
            <ElMain>
                BELIEVE IN YOURSELF - {{ userStore.user?.Username }}
            </ElMain>
        </ElContainer>
    </div>
</template>
<script setup lang="ts">
import router from '@/router';
import { useUserInfoStore } from '@/store/UserStore';
import { ElContainer, ElHeader, ElMain, ElMenu, ElMenuItem } from 'element-plus';
import { onMounted } from 'vue';
const userStore = useUserInfoStore();

onMounted(()=>{
    userStore.fetchUserInfo()
})

const goToLearningLanguagePage = () =>{
    router.push("/language-learning")
}

const goToStockManagerPage = () =>{
    router.push("/stock-manager")
}

const goToStockAccountsManagerPage = () =>{
    router.push("/stock-accounts-manager")
}
</script>