<template>
    <ElDialog v-bind:model-value="isVisible" title="Create New Transaction" :width="560" @close="() => onClose(null)">
        <div>
            <label>Match volume</label>
            <ElInput v-model="model.match_volume" type="number"></ElInput>
        </div>
        <div class="mt-1">
            <label>Match price</label>
            <ElInput v-model="model.match_price"></ElInput>
        </div>
        <div class="mt-1">
            <label>Fee</label>
            <ElInput v-model="model.fee"></ElInput>
        </div>
        <div class="mt-1">
            <label>Tax</label>
            <ElInput v-model="model.tax"></ElInput>
        </div>
        <div class="grid grid-cols-2 gap-3 my-1">
            <div>
                <label>Trading Date</label>
                <div>
                    <ElDatePicker v-model:model-value="model.trading_date"></ElDatePicker>
                </div>
            </div>
            <div > 
                <label>Status</label>
                <ElSelect v-model="model.status">
                    <ElOption :value="'COMPLETED'">COMPLETED</ElOption>
                    <ElOption :value="'INCOMPLETED'">INCOMPLETED</ElOption>
                </ElSelect>
            </div>
        </div>
        <div class="flex justify-end mt-2">
            <ElButton @click="() => onClose(null)">Cancel</ElButton>    
            <ElButton type="primary" @click="submit">Create</ElButton>
        </div>
       
    </ElDialog>
</template>

<script lang="ts" setup>
import { stockAjax } from '@/libs/ajax';
import Transaction, { CreateNewTransactionModel } from '@/models/stock/TransactionModels';
import { ElButton, ElDatePicker, ElDialog, ElInput, ElMessage, ElOption, ElSelect } from 'element-plus';
import { ref } from 'vue';
const props = defineProps<{
    isVisible: boolean,
    accountId: number,
    investmentId?: number,
    trade: string
}>()

const model = ref<CreateNewTransactionModel>({
    account_id: 0,
    trading_date: new Date(),
    investment_id: 0,
    fee: null,
    match_price: null,
    match_volume: null,
    status: "COMPLETED",
    tax: null,
    trade: "SELL"
})

const emit = defineEmits(["close"])

const submit = () =>{
    if(props.investmentId != null){
        model.value.account_id = props.accountId
        model.value.investment_id = props.investmentId
        model.value.trade = props.trade
        model.value.match_price = Number(model.value.match_price)
        model.value.match_volume = Number(model.value.match_volume)
        model.value.fee = Number(model.value.fee)
        model.value.tax = Number(model.value.tax)
        stockAjax.post<Transaction>("/transactions",JSON.stringify(model.value)).then(res=>{
            ElMessage({
                message: "Add new transaction successful",
                type: "success"
            })
            onClose(res.data)
        }).catch(err=>{
            ElMessage({
                message: err.response.data.error,
                type: "error"
            })
        })
    }
}



const onClose = (transaction: Transaction | null)=>{
    emit("close", transaction)
    model.value.match_volume = null
    model.value.match_price = null
    model.value.fee = null
    model.value.tax = null
    model.value.trading_date = new Date()
    model.value.status = "COMPLETED"
}
</script>