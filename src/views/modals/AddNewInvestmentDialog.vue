<template>
    <ElDialog v-bind:model-value="visible" title="Add New Investmnet" @close="()=>closeDialog(null)">
        <div>
            <div>
                <label>Channel Account *</label>
                <ElSelect v-model:model-value="model.account_id">
                    <ElOption v-for="acc in accounts" :key="acc.id" :label="acc.channel_name" :value="acc.id"></ElOption>
                </ElSelect>
            </div>
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
        <div class="flex justify-end my-2">
            <ElButton @click="() => closeDialog(null)">Cancel</ElButton>
            <ElButton type="primary" @click="save">Add New</ElButton>
        </div>
    </ElDialog>
</template>


<script setup lang="ts">
import { stockAjax } from '@/libs/ajax';
import { AccountSelectDto } from '@/models/stock/AccountModels';
import AddNewInvestmnetModel, { InvestmentRow } from '@/models/stock/InvestmentModels';
import { ElButton, ElDialog, ElInput, ElMessage, ElOption, ElSelect, ElText } from 'element-plus';
import { ref } from 'vue';

const props = defineProps<{
    visible: boolean,
    accounts: AccountSelectDto[]
}>()
const model = ref<AddNewInvestmnetModel>({
    account_id: undefined,
    company_name: "",
    description: "",
    market_price: 0,
    ticker: ""
})

const emit = defineEmits({
    onclose: (investment: InvestmentRow | null)=>{}
})


const closeDialog = (investment: InvestmentRow | null) =>{
    emit("onclose", investment)
}

const save = () =>{
   
        model.value.market_price = Number(model.value.market_price)
        var bodyData = JSON.stringify(model.value)
        stockAjax.post<InvestmentRow>("/investment",bodyData).then(res =>{
            ElMessage({
                type: 'success',
                message: 'create new investment successful'
            })
            model.value.account_id = 0
            model.value.company_name = ""
            model.value.description = ""
            model.value.market_price = 0
            model.value.ticker = ""
            closeDialog(res.data)
        }).catch(err  => {
            ElMessage({
                type: 'error',
                message: err.response?.data.error
            })
        })
    
    
}


</script>
