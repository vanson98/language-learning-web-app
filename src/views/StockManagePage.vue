<template>
  <div class="m-2">
    <div class="flex">
      <ElSelect class="flex-none" placeholder="Chọn tài khoản" v-model="selectedAccountId" style="width: 100px"
        @change="getAccountInfoById">
        <ElOption v-for="account in accountList" :key="account.id" :label="account.channel_name" :value="account.id">
        </ElOption>
      </ElSelect>
      <el-input class="flex-none mx-2" style="width: 200px" placeholder="Nhập số liệu (/1000)" v-model="updateAmount"
        :min="0" :type="'number'"></el-input>
      <div v-if="accountInfo != null">
        <el-button class="flex-none" type="primary" @click="depositMoney">Deposit</el-button>
        <el-button class="flex-none" type="primary" @click="withdrawMoney">Withdraw</el-button>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-1 my-2">
      <div>
        <span>Deposit: {{ accountInfo?.deposit }}</span>
      </div>
      <div>
        <span>Net Asset Value (NAV): {{ -6 }}</span>
      </div>
      <div>
        <span>Withdrawal: {{ accountInfo?.withdrawal }}</span>
      </div>
      <div>
        <span>Tổng giá trị CP (lúc mua): {{ 3000 }}</span>
      </div>
      <div>
        <span>Tổng giá trị thị trường (hiện tại): {{ 2000 }}</span>
      </div>
      <div>
        <span>Lãi lỗ: +{{ 1000 }}</span>
      </div>
      <div>
        <span>Cash: {{ accountInfo?.balance }}</span>
      </div>
      <div>
        <span>Fee: +{{ 1000 }}</span>
      </div>
      <div>
        <span>Tax: +{{ 1000 }}</span>
      </div>
    </div>
    <div>
      <ElTable stripe style="width: 100">
        <ElTableColumn prop="ticker" label="Ticker" />
        <ElTableColumn prop="buyValue" label="Buy Value" />
        <ElTableColumn prop="buyVolume" label="Buy Volume" />
        <ElTableColumn prop="capitalCost" label="Capital Cost" />
        <ElTableColumn prop="currentVolume" label="Current Volume" />
        <ElTableColumn prop="marketPrice" label="Market Price" />
        <ElTableColumn prop="sellValue" label="Sell Value" />
        <ElTableColumn prop="sellVolume" label="Sell Volume" />
        <ElTableColumn prop="fee" label="Fee"></ElTableColumn>
        <ElTableColumn prop="tax" label="Tax"></ElTableColumn>
        <ElTableColumn prop="status" label="Status" />
        <ElTableColumn label="Action"></ElTableColumn>
      </ElTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  AccountInfoDto,
  AccountSelectDto,
  AccountTransferResult,
} from "@/models/stock/AccountModels";
import {
  ElOption,
  ElSelect,
  ElInput,
  ElButton,
  ElMessageBox,
  ElRow,
  ElCol,
  ElTable,
  ElTableColumn,
  ElAlert,
  ElMessage,
} from "element-plus";
import { stockAjax } from "@/libs/ajax";

const selectedAccountId = ref<number>();
const updateAmount = ref<number>();
const accountList = ref<AccountSelectDto[]>([]);
const accountInfo = ref<AccountInfoDto | null>(null);

onMounted(() => {
  getAllInvestmentPaging();
});

const getAllInvestmentPaging = () => {
  stockAjax.get<AccountSelectDto[]>("/accounts").then((res) => {
    res.data.forEach((a) => {
      accountList.value.push(a);
    });
    selectedAccountId.value = res.data[0].id;
    getAccountInfoById();
  });
};

const getAccountInfoById = () => {
  var url = `/account-info/${selectedAccountId.value}`;
  stockAjax.get<AccountInfoDto>(url).then((res) => {
    accountInfo.value = res.data;
  });
};

const depositMoney = () => {
  if (!updateAmount.value || updateAmount.value < 0) {
    ElMessage({
      message: "Amount must be possitive",
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
        accountId: accountInfo.value!.id,
        amount: +updateAmount.value!,
        entryType: "TM",
        currency: accountInfo.value!.currency,
      });
      stockAjax
        .put<AccountTransferResult>(url, body)
        .then((res) => {
          accountInfo.value!.balance = res.data.account.balance;
          accountInfo.value!.deposit += res.data.entry.amount;
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
        accountId: accountInfo.value!.id,
        amount: 0 - updateAmount.value!,
        entryType: "TM",
        currency: accountInfo.value!.currency,
      });
      stockAjax
        .put<AccountTransferResult>(url, body)
        .then((res) => {
          accountInfo.value!.balance = res.data.account.balance;
          accountInfo.value!.withdrawal += res.data.entry.amount;
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
      //addMoneyInput();
    } else if (actionType == "withdraw-money") {
      //withdrawMoney();
    } else if (actionType == "update-buy-fee") {
      //updateFee("BF");
    } else if (actionType == "update-sell-fee") {
      //updateFee("SF");
    }
  });
};
</script>
