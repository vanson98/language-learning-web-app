
<template>
    <ElDialog v-bind:model-value="visible" title="Create New Stock Account" @close="()=>closeDialog(null)" :width="300">
        <div>
            <div>
                <label>Channel Name*</label>
                <ElInput v-model="model.channel_name" type="text" placeholder="Channel"></ElInput>
            </div>
            <div>
                <label>Currency</label>
                <ElInput v-model="model.currency" type="text" placeholder="Currency"></ElInput>
            </div>
        </div>
        <div class="flex justify-end my-2">
            <ElButton @click="() => closeDialog(null)">Cancel</ElButton>
            <ElButton type="primary" @click="save">Create New</ElButton>
        </div>
    </ElDialog>
</template>


<script setup lang="ts">
import { stockAjax } from '@/libs/ajax';
import STTReponseErrorModel from '@/models/response/StockTrackerResponseModel';
import { CreateAccountDto } from '@/models/stock/AccountModels';
import AddNewInvestmnetModel, { InvestmentRow } from '@/models/stock/InvestmentModels';
import { AxiosError } from 'axios';
import { ElButton, ElDialog, ElInput, ElMessage, ElText } from 'element-plus';
import { ref } from 'vue';

const props = defineProps<{
    visible: boolean
}>()
const model = ref<CreateAccountDto>({
    channel_name: "",
    currency: "VND",
    owner: "vanson"
})

const emit = defineEmits({
    onclose: (investment: InvestmentRow | null)=>{}
})


const closeDialog = (investment: InvestmentRow | null) =>{
    emit("onclose", investment)
}

const save = () =>{
    var bodyData = JSON.stringify(model.value)
    stockAjax.post<InvestmentRow>("/accounts",bodyData).then(res =>{
        ElMessage({
            type: 'success',
            message: 'create new investment successful'
        })
        model.value.channel_name = ""
        model.value.currency = "VND"
        closeDialog(res.data)
    }).catch((err : AxiosError<STTReponseErrorModel>) => {
        ElMessage({
            type: 'error',
            message: err.response?.data.error
        })
    })
}


</script>
