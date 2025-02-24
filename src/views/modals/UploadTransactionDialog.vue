<template>
    <ElDialog v-bind:model-value="visible" title="Upload Transactions" @close="() => closeDialog()" :width="1400" :top="'5vh'">
        <div>
            <div>
                <ElUpload ref="tcbsTransactionUploader" :auto-upload="false" :multiple="false" :accept="'.xlsx'"
                    :limit="1" :name="'tcbs_transaction_export_data'" :with-credentials="true" :on-exceed="handleExceed"
                    :on-error="onUploadTbcsTransactionError" :on-change="handleUploadFileChange">
                    <template #trigger>
                        <el-button type="primary">Select TCBS file</el-button>
                    </template>
                    
                    <el-button class="ml-3" type="success" @click="pushTransactionsToServer">
                        Push All Transactions
                    </el-button>
                </ElUpload>
            </div>
            <div>
                <ElTable :data="transactionExcelRows" highlight-current-row :height="500">
                    <ElTableColumn prop="ticker" label="Ticker" :width="80"></ElTableColumn>
                    <ElTableColumn prop="trading_date" label="Trading Date"></ElTableColumn>
                    <ElTableColumn prop="trade" label="Trade" :width="80"></ElTableColumn>
                    <ElTableColumn prop="match_volume" label="Match Volume" ></ElTableColumn>
                    <ElTableColumn prop="match_price" label="Match Price"></ElTableColumn>
                    <ElTableColumn prop="match_value" label="Match Value"></ElTableColumn>
                    <ElTableColumn prop="fee" label="Fee" :width="100"></ElTableColumn>
                    <ElTableColumn prop="tax" label="Tax" :width="100"></ElTableColumn>
                    <ElTableColumn prop="cost" label="Cost"></ElTableColumn>
                    <ElTableColumn prop="return" label="Return"></ElTableColumn>
                    <ElTableColumn label="Upload Status">
                        <template #default="scope">
                            <ElTag type="info" v-if="scope.row.upload_status==0">RTU</ElTag>
                            <ElTag type="primary" v-if="scope.row.upload_status==1">QUE</ElTag>
                            <ElTag type="success" v-if="scope.row.upload_status==2">USS</ElTag>
                            <ElTag type="warning" v-if="scope.row.upload_status==3">UFL</ElTag>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn label="Action">
                        <template #default="scope">
                            <div class="d-flex"  v-if="scope.row.upload_status==2">
                                <ElButton type="success" size="small">PCC</ElButton>
                                <ElButton type="warning" size="small">PNC</ElButton>
                            </div>
                        </template>
                    </ElTableColumn>
                </ElTable>
            </div>
        </div>
        <div class="flex justify-end my-2">
            <ElButton @click="() => closeDialog()">Close</ElButton>
        </div>
    </ElDialog>
</template>

<script setup lang="ts">
import { gatewayAjax } from "@/libs/ajax";
import * as XLSX from "xlsx";
import { UpdateMarketPriceModel } from "@/models/stock/InvestmentModels";
import {
    ElButton,
    ElDialog,
    ElTableColumn,
    ElMessage,
    genFileId,
    UploadFile,
    UploadInstance,
    UploadProps,
    UploadRawFile,
    ElUpload,
    ElTable,
    ElTag,
} from "element-plus";
import { ref } from "vue";
import { TransactionExcelRow } from "@/models/stock/TransactionModels";

const props = defineProps<{
    visible: boolean;
    accountId: number;
}>();
const model = ref<UpdateMarketPriceModel>({
    investment_id: 0,
    market_price: null,
});

const emit = defineEmits({
    onclose: (result: { id: number; market_price: number } | null) => { },
});

const closeDialog = () => {
    emit("onclose", null);
};

const tcbsTransactionUploader = ref<UploadInstance>();
const transactionExcelRows = ref<TransactionExcelRow[]>([]);
var fileUpload: UploadRawFile | null = null;

const handleUploadFileChange = (file: UploadFile) => {
    fileUpload = file.raw ?? null;
    extractTransactionData()
};

const handleExceed: UploadProps["onExceed"] = (files) => {
    tcbsTransactionUploader.value!.clearFiles();
    const file = files[0] as UploadRawFile;
    file.uid = genFileId();
    tcbsTransactionUploader.value!.handleStart(file);
};

const extractTransactionData = () => {
    if (fileUpload == null) {
        ElMessage({
            type: "error",
            message: "Please upload file",
        });
        return;
    }
    const reader = new FileReader();
    transactionExcelRows.value = []
    reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
            // read excel file
            var workbook: XLSX.WorkBook = XLSX.read(data, { type: "binary" });
            // Process the workbook
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            // Convert to json

            const ref = worksheet["!ref"];
            if (ref) {
                const endRow = ref
                    ? parseInt(ref.split(":")[1]?.match(/\d+/)?.[0] ?? "0")
                    : 0;
                for (let i = 15; i < endRow; i++) {
                    const row = XLSX.utils.sheet_to_json(worksheet, {
                        header: 1,
                        range: i,
                        blankrows: true,
                    })[0] as any[];
                    if (
                        row.every(
                            (cell) => cell === undefined || cell === null || cell === ""
                        )
                    ) {
                        break;
                    }
                    var rowData: TransactionExcelRow = {
                        tx_id: crypto.randomUUID(),
                        account_id: props.accountId,
                        ticker: row[0],
                        trading_date: row[1],
                        trade: row[2] == "Mua" ? "BUY" : "SELL",
                        volume: row[3],
                        order_price: row[4],
                        match_volume: row[5],
                        match_price: row[6],
                        match_value: row[7],
                        fee: row[8],
                        tax: row[9],
                        cost: row[10],
                        return: row[11],
                        upload_status: 0,
                        push_time: null,
                        check_cost: true
                    };
                    transactionExcelRows.value.push(rowData);
                }
            }
        }
    };
    reader.readAsArrayBuffer(fileUpload);
};

const pushTransactionsToServer = () => {
    if (!props.accountId) {
        ElMessage({
            type: "error",
            message: "Please select account to push",
        });
        return;
    }
    var n = transactionExcelRows.value.length;
    for (let i = 1; i <= n; i++) {
        var tx = transactionExcelRows.value[n - i];
        if(tx.upload_status == 0 || tx.upload_status == 3){
            setTimeout((transaction: TransactionExcelRow) => {
                transaction.push_time = Date.now();
                gatewayAjax
                    .post(`/transaction?txid=${transaction.tx_id}`, JSON.stringify(transaction), {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                    .then((res) => {
                        transaction.upload_status = 1
                        
                    })
                    .catch((err) => {
                        ElMessage({
                            type: "error",
                            message: err.response ? err.response.data : err.message,
                        });
                    });
            }, i * 200, tx);
        }else {
            ElMessage({
                type: "error",
                message: "Transaction has already in queue or process successful",
            });
        }
        
    }
};

const onUploadTbcsTransactionError = (err: Error) => {
    ElMessage({
        type: "error",
        message: err.message,
    });
};
</script>
