<template>
    <ElContainer class="login-form-ctn">
        <el-form :model="formModel" label-width="120px">
        <el-form-item label="User Name">
            <el-input v-model="formModel.userName"></el-input>
        </el-form-item>
        <el-form-item label="Pass Word">
            <el-input v-model="formModel.password" type="password" autocomplete="off"></el-input>
        </el-form-item>
        <p v-if="displayError">Username or password is incorect</p>
        <el-form-item>
            <el-button type="primary" @click="onSubmit">Login</el-button>
        </el-form-item>
    </el-form>
    </ElContainer>
    
</template>

<script setup lang="ts">
import { ElInput,ElForm,ElFormItem, ElButton, ElContainer } from 'element-plus';
import LoginModel from '@/models/authen/LoginModel'
import { reactive } from 'vue';
import axios from 'axios';
import ajax from '@/libs/ajax';
import router from '@/router';
const formModel = reactive<LoginModel>({
    userName: null,
    password: null
})
var displayError = false;

const client = axios.create({
    withCredentials: true
});

const onSubmit = () =>{
    ajax.post("/login",JSON.stringify(formModel)).then((res)=>{
        if(res.status == 401){
            displayError = true;
        }else{
            localStorage.setItem("userId",res.data)
            router.push({path: "/home"})
        }
    })
}
</script>

<style>
.login-form-ctn{
    justify-content: center;
    height: 100vh;
    align-items: center;
}
</style>