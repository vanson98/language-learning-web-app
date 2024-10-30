<template>
    <ElRow>
        <ElCol :span="3">
            <ElSelect placeholder="Chọn tài khoản" v-model="selectedAccountId" size="small">
                <ElOption v-for="channel in accountSelectingList" :key="channel.id"
                    :label="channel.code + ' - ' + channel.name" :value="channel.id"></ElOption>
            </ElSelect>
        </ElCol>
        <ElCol :span="3">
            <el-input placeholder="Nhập số liệu" v-model="updateAmountInfo" :type="'number'" style="width: 100px"
            size="small"></el-input>
        </ElCol>
        <ElCol :span="3">
            <el-button type="primary" size="small" @click="() => updateChannel('add-money')">Add Money</el-button>
        </ElCol>
        <ElCol :span="3">
            <el-button type="primary" size="small" @click="() => updateChannel('withdraw-money')">Withdraw Money</el-button>
        </ElCol>
    </ElRow>
   
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AccountSelectDto } from '@/models/stock-account/StockAccountModels';
import { ElOption, ElSelect, ElInput, ElButton, ElMessageBox, ElRow, ElCol } from 'element-plus';

const selectedAccountId = ref<number>()
const updateAmountInfo = ref()
const accountSelectingList : AccountSelectDto[] = [{
    code: "abc",
    id: 123,
    name: "cong ty abc"
}]


const updateChannel = (actionType: string) => {
  var messageAlert = "";
  if (actionType == "add-money") {
    messageAlert = "Bạn có chắc muốn thêm tiền?";
  } else if (actionType == "withdraw-money") {
    messageAlert = "Bạn có chắc muốn rút tiền?";
  } else if (actionType == "update-buy-fee") {
    messageAlert = "Bạn có chắc muốn cập nhật phí mua?";
  } else if (actionType == "update-sell-fee") {
    messageAlert = "Bạn có chắc muốn cập nhật phí bán?";
  }

  ElMessageBox.confirm(messageAlert, "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning",
  }).then(() => {
    if (actionType == "add-money") {
      addMoneyInput();
    } else if (actionType == "withdraw-money") {
      withdrawMoney();
    } else if (actionType == "update-buy-fee") {
      updateFee("BF");
    } else if (actionType == "update-sell-fee") {
      updateFee("SF");
    }
  });
};


</script>