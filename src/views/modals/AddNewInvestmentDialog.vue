<template>
    <ElDialog v-bind:model-value="visible" title="Add New Investmnet" @close="()=>closeDialog(null)">
        <div>
            <div>
                <label>Ticker *</label>
                <ElInput v-model="model.ticker" type="text" placeholder="Ticker"></ElInput>
            </div>
            <div>
                <label>Company Name</label>
                <ElInput v-model="model.company_name" type="text" placeholder="Company Name"></ElInput>
            </div>
            <div>
                <label>Market Price</label>
                <ElInput v-model="model.market_price" type="number" placeholder="Market Price"></ElInput>
            </div>
            <div>
                <label>Description</label>
                <ElInput v-model="model.description" type="textarea" placeholder="Description"></ElInput>
            </div>
        </div>
        <div>
            <ElButton @click="() => closeDialog(null)">Cancel</ElButton>
            <ElButton @click="save">Add New</ElButton>
        </div>
    </ElDialog>
</template>


<script setup lang="ts">
import { stockAjax } from '@/libs/ajax';
import STTReponseErrorModel from '@/models/response/StockTrackerResponseModel';
import AddNewInvestmnetModel, { Investment } from '@/models/stock/InvestmentModels';
import { AxiosError } from 'axios';
import { ElButton, ElDialog, ElInput, ElMessage, ElText } from 'element-plus';
import { ref } from 'vue';

const props = defineProps<{
    visible: boolean,
    accountId: number
}>()
const model = ref<AddNewInvestmnetModel>({
    account_id: 0,
    company_name: "",
    description: "",
    market_price: 0,
    ticker: ""
})

const emit = defineEmits({
    onclose: (investment: Investment | null)=>{}
})


const closeDialog = (investment: Investment | null) =>{
    emit("onclose", investment)
}

const save = () =>{
    model.value.account_id = props.accountId
    model.value.market_price = Number(model.value.market_price)
    var bodyData = JSON.stringify(model.value)
    stockAjax.post<Investment>("/investment",bodyData).then(res =>{
        ElMessage({
            type: 'success',
            message: 'create new investment successful'
        })
        closeDialog(res.data)
    }).catch((err : AxiosError<STTReponseErrorModel>) => {
        ElMessage({
            type: 'error',
            message: err.response?.data.error
        })
    })
}


</script>
