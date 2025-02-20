<template>
    <ElContainer class="login-form-ctn">
        <ElButton type="primary" @click="redirectToRegisterIdentityPage">Register</ElButton>
        <el-button type="primary" @click="redirectToLoginIdentityPage">Login</el-button>
        <el-button type="primary" @click="redirectToIdentityServer">Login with google</el-button>
       
    </ElContainer>
</template>

<script setup lang="ts">
import { ElButton, ElContainer } from 'element-plus';

import AppConsts from '@/libs/appconst';


const redirectToRegisterIdentityPage = () =>{
    var clientId = 1
    window.location.assign(`${AppConsts.remoteIdentityServerUrl}/register?client_id=${clientId}`)
}

const redirectToLoginIdentityPage = () =>{
    var clientId = 1
    window.location.assign(`${AppConsts.remoteIdentityServerUrl}/login?client_id=${clientId}`)
}

const redirectToIdentityServer = () =>{
    var clientId = 1
    window.location.assign(`${AppConsts.remoteIdentityServerUrl}/google-login?client_id=${clientId}`)
}

</script>

<style>
.login-form-ctn{
    justify-content: center;
    height: 100vh;
    align-items: center;
}
</style>