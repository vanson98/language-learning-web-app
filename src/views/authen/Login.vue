<template>
    <ElContainer class="login-form-ctn">
        <el-form :model="formModel" label-width="120px">
            <el-form-item label="User Name">
                <el-input v-model="formModel.userName"></el-input>
            </el-form-item>
            <el-form-item label="Password">
                <el-input v-model="formModel.password" type="password" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">Login</el-button>
                <el-button type="primary" @click="redirectToIdentityServer">Login with google</el-button>
            </el-form-item>
            <p v-if="displayError" style="color: red;">{{ message }}</p>
        </el-form>
    </ElContainer>
</template>

<script setup lang="ts">
import { ElInput,ElForm,ElFormItem, ElButton, ElContainer } from 'element-plus';
import LoginModel from '@/models/authen/LoginModel'
import { reactive, ref } from 'vue';
import axios from 'axios';
import router from '@/router';
import { identityAjax } from '@/libs/ajax';
import AppConsts from '@/libs/appconst';
const formModel = reactive<LoginModel>({
    userName: null,
    password: null
})
const displayError = ref(false);
const message = ref("")

const client = axios.create({
    withCredentials: true
});

const onSubmit = () =>{
    identityAjax.post("/login",JSON.stringify(formModel)).then((res)=>{
        if(res.status == 200){
            // localStorage.setItem("userId",res.data)
            // router.push({path: "/home"})
            console.log(JSON.stringify(res.data));
        }
    }).catch(err=>{
        if(err.status == 401){
            displayError.value = true;
            message.value = err.data;
        }
    })
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