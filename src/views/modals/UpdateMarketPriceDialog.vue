<template>
    <ElDialog v-bind:model-value="visible" title="Update Market Price" @close="() => closeDialog()" :width="300">
        <div>
            <div>
                <label>Type Market Price for {{ props.ticker }}</label>
                <ElInput v-model="model.market_price" type="text" placeholder="Enter Market Price / 1000"></ElInput>
            </div>
        </div>
        <div class="flex justify-end my-2">
            <ElButton @click="() => closeDialog()">Cancel</ElButton>
            <ElButton type="primary" @click="save">Save</ElButton>
        </div>
    </ElDialog>
</template>


<script setup lang="ts">
import { stockAjax } from '@/libs/ajax';
import STTReponseErrorModel from '@/models/response/StockTrackerResponseModel';
import { UpdateMarketPriceModel } from '@/models/stock/InvestmentModels';
import { AxiosError } from 'axios';
import { ElButton, ElDialog, ElInput, ElMessage, ElText } from 'element-plus';
import { ref } from 'vue';

const props = defineProps<{
    visible: boolean,
    investmentId: number,
    ticker?: string
}>()
const model = ref<UpdateMarketPriceModel>({
    investment_id: 0,
    market_price: null
})

const emit = defineEmits({
    onclose: (result: {id: number, market_price: number} | null) => { }
})


const closeDialog = () => {
    emit("onclose", null)
}

const save = () => {
    if (model.value.market_price == null) {
        ElMessage("Please enter market price")
        return
    }
    model.value.investment_id = props.investmentId
    model.value.market_price = Number(model.value.market_price) * 1000
    var bodyData = JSON.stringify(model.value)
    stockAjax.put("/market-price", bodyData).then(res => {
        ElMessage({
            type: 'success',
            message: 'update market price successfully'
        })
        model.value.market_price = 0
        emit("onclose", res.data)
    }).catch((err) => {
        ElMessage({
            type: 'error',
            message: err.response?.data
        })
    })
}


</script>
