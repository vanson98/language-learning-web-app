<template>
  <div class="m-2">
    <div class="flex">
      <ElSelect class="flex-none" placeholder="Chọn tài khoản" v-model="selectedAccountId" style="width: 100px"
        @change="onSelectAccountChange">
        <ElOption v-for="account in accountList" :key="account.id" :label="account.channel_name" :value="account.id">
        </ElOption>
      </ElSelect>
    </div>
    <div class="grid grid-cols-3 gap-1 my-2">
      <div>
        <span>Deposit: {{ accountInfo?.deposit }}</span>
      </div>
      <div>
        <span>Net Asset Value (NAV): {{ accountInfo.balance }}</span>
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
    <div class="flex flex-row">
      <div>
        <ElInput v-model="searchText" type="text" placeholder="Search ..." @keyup.enter="getInvestmentPaging"></ElInput>
      </div>
      <div class="flex-grow"></div>
      <div>
        <ElButton @click="clearSelectInvestment()">Clear Select</ElButton>
        <ElButton @click="()=>addNewInvestmentDialogVisible=true">Add New Investment</ElButton>
      </div>
    </div>
    <div>
      <ElTable stripe style="width: 100" :data="investments" :default-sort="{prop: 'status', order:'descending'}" 
        ref="investmentTableRef"
        @sort-change="onInvestmentTableSortChange"
        @current-change="handleCurrentChange"
        highlight-current-row>
        <ElTableColumn prop="ticker" label="Ticker" sortable="custom" />
        <ElTableColumn prop="buy_value" label="Buy Value" />
        <ElTableColumn prop="buy_volume" label="Buy Volume" />
        <ElTableColumn prop="capital_cost" label="Capital Cost" />
        <ElTableColumn prop="current_volume" label="Current Volume" />
        <ElTableColumn prop="market_price" label="Market Price" />
        <ElTableColumn prop="sell_value" label="Sell Value" />
        <ElTableColumn prop="sell_volume" label="Sell Volume" />
        <ElTableColumn prop="fee" label="Fee"></ElTableColumn>
        <ElTableColumn prop="tax" label="Tax"></ElTableColumn>
        <ElTableColumn prop="status" label="Status" sortable="custom" />
        <ElTableColumn label="Action">
          <template #default="scope">
            <el-button size="small" type="success" @click="openAddingTransactionDialog(scope.row, 'BUY')">
              BUY
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="openAddingTransactionDialog(scope.row, 'SELL')"
            >
              SELL
            </el-button>
          </template>
        </ElTableColumn>
      </ElTable>
      <div class="flex justify-center my-2">
        <ElPagination background layout="prev, pager, next" :total="totalInvestments" :page-size="6" @change="onInvestmentTablePageChange" />
      </div>
    </div>
    <div>
      <ElTable 
        stripe 
        style="width: 100" 
        :data="transactions" 
        :default-sort="{prop: 'trading_date', order:'descending'}"  
        @sort-change="onTransactionTableSortChange"
        
        >
        <ElTableColumn prop="ticker" label="Ticker"/>
        <ElTableColumn prop="trading_date" label="Tradind Date" sortable="custom" />
        <ElTableColumn prop="trade" label="Trade" />
        <ElTableColumn prop="volume" label="Volume" />
        <ElTableColumn prop="order_price" label="Order Price" />
        <ElTableColumn prop="match_volume" label="Match Vol" />
        <ElTableColumn prop="match_price" label="Match Price" />
        <ElTableColumn prop="match_value" label="Match Value" />
        <ElTableColumn prop="fee" label="Fee"></ElTableColumn>
        <ElTableColumn prop="tax" label="Tax"></ElTableColumn>
        <ElTableColumn prop="cost" label="Cost"/>
        <ElTableColumn prop="cost_of_goods_sold" label="COGS" sortable="custom"/>
        <ElTableColumn prop="return" label="Return" sortable="custom"/>
      </ElTable>
      <div class="flex justify-center my-2">
        <ElPagination background layout="prev, pager, next" :total="totalTransactions" :page-size="9" @change="onTransactionTablePageChange" />
      </div>
    </div>
  </div>
  <AddNewInvestmentDialog :visible="addNewInvestmentDialogVisible" @onclose="onAddingInvestmentDialogClose" :account-id="accountInfo.id"/>
  <AddNewTransactionDialog 
  :is-visible="addNewTransactionDialogVisible" 
  :account-id="selectedAccountId" 
  :investment-id="currentInvestment?.id" 
  :trade="tradingMode"
  @close="onCloseCreatingTransactionDialog"/>
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
  ElTable,
  ElTableColumn,
  ElAlert,
  ElMessage,
  ElPagination,
} from "element-plus";
import { ajax, stockAjax } from "@/libs/ajax";
import AddNewInvestmentDialog from "./modals/AddNewInvestmentDialog.vue";
import { Investment } from "@/models/stock/InvestmentModels";
import Transaction from "@/models/stock/TransactionModels";
import AddNewTransactionDialog from "./modals/AddNewTransactionDialog.vue";
import moment from "moment";

const addNewInvestmentDialogVisible = ref<boolean>(false)
const addNewTransactionDialogVisible = ref<boolean>(false)

// ========================================= COMPONENT EVENT ==================================================
onMounted(() => {
  getAllAccount();
});

// ========================================= ACCOUNTS ==================================================
const accountList = ref<AccountSelectDto[]>([]);
const selectedAccountId = ref<number>(0);
const accountInfo = ref<AccountInfoDto>({
  id: 0,
  balance: 0,
  channel_name: "",
  currency: "",
  deposit: 0,
  owner: "",
  withdrawal: 0
});


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


const onSelectAccountChange = ()=>{
  getAccountInfoById()
  getInvestmentPaging()
  getTransactionPaging();
}

const getAllAccount = () => {
  stockAjax.get<AccountSelectDto[]>("/accounts").then((res) => {
    res.data.forEach((a) => {
      accountList.value.push(a);
    });
    selectedAccountId.value = res.data[0].id;
    onSelectAccountChange()
  });
};

const getAccountInfoById = () => {
  var url = `/account-info/${selectedAccountId.value}`;
  stockAjax.get<AccountInfoDto>(url).then((res) => {
    accountInfo.value = res.data;
  }).catch(()=>{
    ElAlert.error({
      title: "Error",
      message: "Cannot fetch account information",
      showClose: true,
    });
  });
};



// ========================================= INVESTMENTS ==================================================
const searchText = ref<string>("");
const investments = ref<Investment[]>([])
const currentInvestment = ref<Investment>();
// table properties
let currentInvestmentPage = 1;
const totalInvestments = ref<number>(0);
let investmentSortProp = 'status'
let investmentSortMode = 'descending'
const investmentTableRef = ref<InstanceType<typeof ElTable>>()


const onInvestmentTablePageChange = (currentPage: number, pageSize: number) =>{
  currentInvestmentPage = currentPage;
  getInvestmentPaging()
}

const onAddingInvestmentDialogClose = (investment: Investment | null) =>{
  addNewInvestmentDialogVisible.value = false
  if (investment){
    investments.value.push(investment)
  }
}

const onInvestmentTableSortChange = (data: {column: any, prop: string, order: any }) =>{
  investmentSortProp = data.prop
  investmentSortMode = data.order
  getInvestmentPaging()
}

const getInvestmentPaging = () =>{
  var url = `/investments?account_id=${selectedAccountId.value}&search_text=${searchText.value.trim()}&order_by=${investmentSortProp}&sort_type=${investmentSortMode}&page=${currentInvestmentPage}&page_size=6`
  stockAjax.get(url).then(res=>{
    investments.value = res.data.investments
    totalInvestments.value = res.data.total_items
  }).catch(err=>{
    console.log(err.response.data)
  })
}

const getLatestInvesment = (investmentId: number) => {
  var url = `investment/${investmentId}`
  stockAjax.get<Investment>(url).then(res=>{
    var newestInvestment = res.data
    if (currentInvestment.value){
      currentInvestment.value.buy_value = newestInvestment.buy_value
      currentInvestment.value.buy_volume = newestInvestment.buy_volume
      currentInvestment.value.capital_cost = newestInvestment.capital_cost
      currentInvestment.value.current_volume = newestInvestment.current_volume
      currentInvestment.value.market_price = newestInvestment.market_price
      currentInvestment.value.sell_value = newestInvestment.sell_value
      currentInvestment.value.sell_volume = newestInvestment.sell_volume
      currentInvestment.value.fee = newestInvestment.fee
      currentInvestment.value.tax = newestInvestment.tax
      currentInvestment.value.status = newestInvestment.status
    }
  }).catch(err=>{
    console.log(err.response.data)
  })
}

const handleCurrentChange = (val: Investment | undefined) => {
  currentInvestment.value = val
  getTransactionPaging()
}

const clearSelectInvestment = () => {
  investmentTableRef.value!.setCurrentRow(undefined)
  searchText.value = ""
  getTransactionPaging()
}

// ========================================= TRANSACTIONS ==================================================
const transactions = ref<Transaction[]>([])
// transaction table properties
const totalTransactions = ref<number>(0);
let currentTransactionPage = 1;
let transactionOrderBy = 'trading_date'
let transactionOrderType = 'descending'
const tradingMode = ref<string>("BUY")


const getTransactionPaging = () =>{
  var ticker = currentInvestment.value ? currentInvestment.value.ticker : ""
  var url = `/transactions?account_id=${selectedAccountId.value}&ticker=${ticker}&order_by=${transactionOrderBy}&order_type=${transactionOrderType}&page=${currentTransactionPage}&page_size=9`
  stockAjax.get(url).then(res=>{
    transactions.value =  res.data.transactions
    totalTransactions.value = res.data.total
  })
}

const onTransactionTablePageChange = (page: number) => {
  currentTransactionPage = page
  getTransactionPaging()
}

const onTransactionTableSortChange = (data: {column: any, prop: string, order: any }) =>{
  transactionOrderBy = data.prop
  transactionOrderType = data.order
  getTransactionPaging()
}

const openAddingTransactionDialog = (row: Investment, trade: string) =>{
  //console.log(row.account_id)
  addNewTransactionDialogVisible.value = true 
  tradingMode.value = trade
  
}

const onCloseCreatingTransactionDialog = (tx: Transaction) => {
  addNewTransactionDialogVisible.value = false
  if(tx != null){
    //tx.trading_date = (moment(tx.trading_date)).format("DD/MM/YYYY")
    //transactions.value.push(tx)
    getLatestInvesment(tx.investment_id)
    getTransactionPaging()
  }
}


</script>
