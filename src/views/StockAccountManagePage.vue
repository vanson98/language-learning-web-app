<template>
    <div class="m-2">
        <div class="mb-2">
            <RouterLink to="/">Home</RouterLink>/Account Manager
        </div>
        <div class="flex justify-between">
            <div class="flex-grow" >
                <ElInput class="flex-initial w-1/6 me-3"  placeholder="Type money amount (x1000)" type="number" v-model:model-value="updateAmount"></ElInput>
                <ElButton :type="'primary'" @click="depositMoney">Deposit</ElButton>
                <ElButton :type="'danger'" @click="withdrawMoney">Withdraw</ElButton>
            </div>
            <ElButton class="flex-initial" @click="()=>createAccountDialogVisible = true" >Create Account</ElButton>
        </div>
        <div>   
            <ElTable :data="accounts" 
            highlight-current-row
            @current-change="handleCurrentChange">
                <ElTableColumn prop="channel_name" label="Channel Name"></ElTableColumn>
                <ElTableColumn prop="balance" label="Balance"></ElTableColumn>
                <ElTableColumn prop="deposit" label="Deposit"></ElTableColumn>
                <ElTableColumn prop="withdraw" label="Withdraw"></ElTableColumn>
                <ElTableColumn prop="currency" label="Currency"></ElTableColumn>
            </ElTable>
        </div>
    </div>
    <CreateAccountDialog :visible="createAccountDialogVisible" @onclose="onCreateAccountDialogClose"/>
</template>

<script lang="ts" setup>
import { stockAjax } from '@/libs/ajax';
import AccountDto, { AccountTransferResult, GetAccountPagingDto } from '@/models/stock/AccountModels';
import { ElButton, ElInput, ElMessage, ElMessageBox, ElTable, ElTableColumn } from 'element-plus';
import { onMounted, ref } from 'vue';
import CreateAccountDialog from './modals/CreateAccountDialog.vue';
import { RouterLink } from 'vue-router';
const updateAmount = ref<number>()
const accounts = ref<GetAccountPagingDto[]>()
const createAccountDialogVisible = ref<boolean>(false)
const currentAccount = ref<GetAccountPagingDto | null>()

onMounted(()=>{
    getAccountsPaging()
})

const getAccountsPaging =  () =>{
    stockAjax.get<GetAccountPagingDto[]>(`/account-search?owner=wmvcua`).then(res=>{
        res.data.forEach(a=>{
            a.balance = a.balance/1000
            a.deposit = a.deposit/1000
            a.withdraw = a.withdraw/1000
        })
        accounts.value = res.data
        
    })
}

const handleCurrentChange =  (val :GetAccountPagingDto | null) =>{
    currentAccount.value = val
}

const onCreateAccountDialogClose = () =>{
    createAccountDialogVisible.value = false
    getAccountsPaging()
}

const depositMoney = () => {
  if (!updateAmount.value || updateAmount.value < 0) {
    ElMessage({
      message: "Amount must be possitive",
      type: "error",
    });
    return;
  }
  if(!currentAccount.value){
    ElMessage({
      message: "Please select one account to update balance",
      type: "error",
    });
    return;
  }
  ElMessageBox.confirm("Bạn có chắc muốn nạp tiền?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning",
  })
    .then(() => {
      var url = `/account-transfer`;
      var body = JSON.stringify({
        accountId: currentAccount.value!.id,
        amount: +updateAmount.value! * 1000,
        entryType: "TM",
        currency: currentAccount.value!.currency,
      });
      stockAjax
        .put<AccountTransferResult>(url, body)
        .then((res) => {
          currentAccount.value!.balance = res.data.account.balance / 1000;
          currentAccount.value!.deposit += (res.data.entry.amount / 1000);
        })
        .catch((err) => {
          ElMessage({
            message: err.response.data.error,
            type: "error",
          });
        });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Deposit canceled",
      });
    });
};

const withdrawMoney = () => {
    if(!currentAccount.value){
    ElMessage({
      message: "Please select one account to update balance",
      type: "error",
    });
    return;
  }
  if (!updateAmount.value || updateAmount.value < 0) {
    ElMessage({
      message: "Amount must be possitive",
      type: "error",
    });
    return;
  }
  
  ElMessageBox.confirm("Bạn có chắc muốn rút tiền?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning",
  })
    .then(() => {
      var url = `/account-transfer`;
      var body = JSON.stringify({
        accountId: currentAccount.value!.id,
        amount: 0 - (updateAmount.value! * 1000),
        entryType: "TM",
        currency: currentAccount.value!.currency,
      });
      stockAjax
        .put<AccountTransferResult>(url, body)
        .then((res) => {
          currentAccount.value!.balance = (res.data.account.balance/1000);
          currentAccount.value!.withdraw += (res.data.entry.amount/1000);
        })
        .catch((err) => {
          ElMessage({
            message: err.response.data.error,
            type: "error",
          });
        });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Withdrawal canceled",
      });
    });
};


</script>