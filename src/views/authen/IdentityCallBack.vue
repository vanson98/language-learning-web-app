<template>
    <p>Identity Server call back</p>
</template>
<script lang="ts" setup>
import { identityAjax } from '@/libs/ajax';
import router from '@/router';
import { onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserInfoStore } from '@/store/UserStore';
const route = useRoute();
const userStore = useUserInfoStore();

onMounted(() =>{
    var clientId = 1
    var exchangeCode = route.params.exchangeCode
    identityAjax.get(`/access_token/${exchangeCode}/${clientId}`, {
        withCredentials: true // The browser blocks cross-site cookies unless credentials are included`
    }).then((res)=>{
        if (res.status == 200) {
            router.push("/")
        }
    }).catch(res =>{
        ElMessage({
            message: res.response.data.error,
            type: "error"
        })
    })
})

onUnmounted(() =>{
   

})
</script>