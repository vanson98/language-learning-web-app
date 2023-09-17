<template>
    <ElContainer class="login-form-ctn">
        <el-form :model="formModel" label-width="120px">
        <el-form-item label="User Name">
            <el-input v-model="formModel.userName"></el-input>
        </el-form-item>
        <el-form-item label="Pass Word">
            <el-input v-model="formModel.password" type="password" autocomplete="off"></el-input>
        </el-form-item>
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

const formModel = reactive<LoginModel>({
    userName: null,
    password: null
})

const onSubmit = () =>{
    console.log(formModel)
}
</script>

<style>
.login-form-ctn{
    justify-content: center;
    height: 100vh;
    align-items: center;
}
</style>