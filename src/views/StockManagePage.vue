<template>
  <div class="m-2">
    <div class="flex justify-between">
      <ElSelect class="flex-none" placeholder="Chọn tài khoản" multiple v-model="selectedAccountIds"
        style="width: 350px" @change="onSelectAccountChange">
        <ElOption v-for="account in accountList" :key="account.id" :label="account.channel_name" :value="account.id">
        </ElOption>
      </ElSelect>
      <div>
        <ElUpload
          ref="tcbsTransactionUploader"
          :action="`${SERVER_STOCK_TRACKER_URL}/tcbs-import`"
          :auto-upload="false"
          :multiple="false"
          :accept="'.xlsx'"
          :limit="1"
          :name="'tcbs_transaction_export_data'"
          :data="{account_id: selectedAccountIds[0]}"
          :on-exceed="handleExceed"
          :on-error="onUploadTbcsTransactionError"
          :on-success="onUploadTcbsTransactionSuccess"
        >
          <template #trigger>
            <el-button type="primary">Select TCBS file</el-button>
          </template>
          <el-button class="ml-3" type="success" @click="submitUpload">
            upload to server
          </el-button>
        </ElUpload>
      </div>
    </div>
    <!-- Account Overview -->
    <div v-for="accInfo in accountInfos">
      <div class="grid grid-cols-6 grap-1">
        <div>
          <span>{{ accInfo.channel_name }}</span>
        </div>
        <div>
          <span>NAV: {{ (accInfo.cash + accInfo.total_cogs) / 1000 }}</span>
        </div>
        <div>
          <span>Cash: {{ accInfo.cash / 1000 }}</span>
        </div>
        <div>
          <span>Total COGS: {{ accInfo.total_cogs / 1000 }}</span>
        </div>
        <div>
          <span>Market Value: {{ accInfo.market_value / 1000 }}</span>
        </div>
        <div>
          <span>Profit: {{ (accInfo.market_value - accInfo.total_cogs) / 1000 }}</span>
        </div>
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
    <!-- Investment Table -->
    <div>
      <ElTable stripe style="width: 100" :data="investments" :default-sort="{prop: 'status', order:'descending'}"
        ref="investmentTableRef" @sort-change="onInvestmentTableSortChange" @current-change="handleCurrentChange"
        highlight-current-row>
        <ElTableColumn prop="channel_name" label="Channel" sortable="custom" :width="110" />
        <ElTableColumn prop="ticker" label="Ticker" sortable="custom" :width="110"/>
        <ElTableColumn prop="buy_value" label="Buy Value" >
          <template #default="scope">
            <span>{{ scope.row.buy_value / 1000 }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="buy_volume" label="Buy Volume" />
        <ElTableColumn prop="capital_cost" label="Capital Cost" >
          <template #default="scope">
            <span>{{ scope.row.capital_cost / 1000 }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="current_volume" label="Current Volume" />
        <ElTableColumn prop="market_price" label="Market Price" >
          <template #default="scope">
            <span>{{ (scope.row.market_price / 1000) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="sell_value" label="Sell Value" >
          <template #default="scope">
            <span>{{ scope.row.sell_value / 1000 }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="sell_volume" label="Sell Volume" />
        <!-- <ElTableColumn prop="fee" label="Fee">
          <template #default="scope">
            <span>{{ scope.row.fee / 1000 }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="tax" label="Tax">
          <template #default="scope">
            <span>{{ scope.row.tax / 1000 }}</span>
          </template>
        </ElTableColumn> -->
        <ElTableColumn label="Profit" prop="profit" sortable="custom">
          <template #default="scope">
              <span v-if="scope.row.status == 'sellout'"> {{scope.row.profit }}%</span>
              <span v-if="scope.row.status == 'active'">{{ scope.row.profit }}%</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="Status" sortable="custom" >
          <template #default="scope">
            <ElTag type="info" v-if="scope.row.status == 'inactive'">Inactive</ElTag>
            <ElTag type="warning" v-if="scope.row.status == 'sellout'">Sellout</ElTag>
            <ElTag type="success" v-if="scope.row.status == 'active'">Active</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Action" :width="150">
          <template #default="scope">
            <el-button size="small" type="success" @click="openCreateTransactionDialog(scope.row, 'BUY')">
              BUY
            </el-button>
            <el-button size="small" type="danger" @click="openCreateTransactionDialog(scope.row, 'SELL')">
              SELL
            </el-button>
          </template>
        </ElTableColumn>
      </ElTable>
      <div class="flex justify-center my-2">
        <ElPagination background layout="prev, pager, next" :total="totalInvestments" :page-size="6"
          @change="onInvestmentTablePageChange" />
      </div>
    </div>
    <!-- Transaction Table -->
    <div>
      <ElTable stripe style="width: 100" :data="transactions" :default-sort="{prop: 'trading_date', order:'descending'}"
        @sort-change="onTransactionTableSortChange" :show-summary="true" :summary-method="getSummaries">
        <ElTableColumn prop="channel_name" label="Channel " :width="120" />
        <ElTableColumn prop="ticker" label="Ticker" :width="120" />
        <ElTableColumn prop="trading_date" label="Tradind Date" sortable="custom" />
        <ElTableColumn prop="trade" label="Trade" />
        <!-- <ElTableColumn prop="volume" label="Volume" />
        <ElTableColumn prop="order_price" label="Order Price" >
          <template #default="scope">
            <span>{{ scope.row.order_price / 1000 }}</span>
          </template>
        </ElTableColumn> -->
        <ElTableColumn prop="match_volume" label="Match Vol" />
        <ElTableColumn prop="match_price" label="Match Price">
          <template #default="scope">
            <span>{{ scope.row.match_price / 1000 }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="match_value" label="Match Value" >
          <template #default="scope">
            <span>{{ scope.row.match_value / 1000 }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="fee" label="Fee">
          <template #default="scope">
            <span>{{ scope.row.fee / 1000 }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="tax" label="Tax">
          <template #default="scope">
            <span>{{ scope.row.tax / 1000 }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="cost" label="Cost" >
          <template #default="scope">
            <span>{{ scope.row.cost / 1000 }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="cost_of_goods_sold" label="COGS" sortable="custom" >
          <template #default="scope">
            <span>{{ scope.row.cost_of_goods_sold / 1000 }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="return" label="Return" sortable="custom" >
          <template #default="scope">
            <span>{{ scope.row.return / 1000 }}</span>
          </template>
        </ElTableColumn>
      </ElTable>
      <div class="flex justify-center my-2">
        <ElPagination background layout="prev, pager, next" :total="totalTransactionRows" :page-size="9"
          @change="onTransactionTablePageChange" />
      </div>
    </div>
  </div>
  <AddNewInvestmentDialog :visible="addNewInvestmentDialogVisible" @onclose="onAddingInvestmentDialogClose" :accounts="accountList"/>
  <CreateTransactionDialog :is-visible="addNewTransactionDialogVisible" :investment-id="currentInvestment?.id" :trade="tradingMode" @close="onCloseCreatingTransactionDialog" />
</template>

<script setup lang="ts">
import { h, onMounted, ref, VNode } from "vue";
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
  ElUpload,
  UploadInstance,
  UploadProps,
  UploadRawFile,
  genFileId,
  ElTag,
  TableColumnCtx,
} from "element-plus";
import { ajax, stockAjax } from "@/libs/ajax";
import AddNewInvestmentDialog from "./modals/AddNewInvestmentDialog.vue";
import { InvestmentRow } from "@/models/stock/InvestmentModels";
import TransactionRow from "@/models/stock/TransactionModels";
import CreateTransactionDialog from "./modals/CreateTransactionDialog.vue";
import { SERVER_STOCK_TRACKER_URL } from "@/libs/url";

const addNewInvestmentDialogVisible = ref<boolean>(false)
const addNewTransactionDialogVisible = ref<boolean>(false)

// ========================================= COMPONENT EVENT ==================================================
onMounted(() => {
  getAllAccount();
});

// ========================================= ACCOUNTS ==================================================
const accountList = ref<AccountSelectDto[]>([]);
const selectedAccountIds = ref<number[]>([]);
const accountInfos = ref<AccountInfoDto[]>([]);
const tcbsTransactionUploader = ref<UploadInstance>()

const onSelectAccountChange = ()=>{
  getAccountInfoByIds()
  getInvestmentPaging()
  getTransactionPaging();
}

const getAllAccount = () => {
  stockAjax.get<AccountSelectDto[]>("/accounts?owner=wmvcua").then((res) => {
    res.data.forEach((a) => {
      accountList.value.push(a);
      
    });
    selectedAccountIds.value.push(accountList.value[0].id);
    onSelectAccountChange()
  });
};

const getAccountInfoByIds = () => {
  stockAjax.get<AccountInfoDto[]>("/account-overview", {
    params: {
      ids: selectedAccountIds.value,
    },
    paramsSerializer: {
      indexes: null
    }
  }).then((res) => {
    accountInfos.value = res.data;
    console.log(accountInfos.value)
  }).catch(()=>{
    ElAlert.error({
      title: "Error",
      message: "Cannot fetch account information",
      showClose: true,
    });
  });
};



const getLatestAccountInfo = (accId: number) =>{
  var url = `/account-info`
  stockAjax.get<AccountInfoDto[]>(url,{
    params: {
      ids: accId
    }
  }).then(res=>{
    var accountInfo = res.data[0]
    var updateAccountInfo = accountInfos.value.find(a=>a.id == accId)
    if (updateAccountInfo){
      updateAccountInfo.cash = accountInfo.cash
      updateAccountInfo.market_value = accountInfo.market_value
      updateAccountInfo.total_cogs = accountInfo.total_cogs
    }
  }).catch(err=>{
    ElAlert.error({
      title: "Error",
      message: err.response.data.error,
      showClose: true,
    });
  })
}

const handleExceed: UploadProps['onExceed'] = (files) => {
  tcbsTransactionUploader.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  tcbsTransactionUploader.value!.handleStart(file)
}

const submitUpload = () => {
  tcbsTransactionUploader.value!.submit()
}

const onUploadTcbsTransactionSuccess = () => {
  ElMessage({
    type: 'success',
    message: 'import tbcs transaction successful',
  })
  onSelectAccountChange()
}

const onUploadTbcsTransactionError = (err : Error) => {
  ElMessage({
    type: 'error',
    message: err.message,
  })
}

// ========================================= INVESTMENTS ==================================================
const searchText = ref<string>("");
const investments = ref<InvestmentRow[]>([])
const currentInvestment = ref<InvestmentRow>();
// table properties
let currentInvestmentPage = 1;
const totalInvestments = ref<number>(0);
let investmentSortProp = 'status'
let investmentSortMode = 'ascending'
const investmentTableRef = ref<InstanceType<typeof ElTable>>()


const onInvestmentTablePageChange = (currentPage: number, pageSize: number) =>{
  currentInvestmentPage = currentPage;
  getInvestmentPaging()
}

const onAddingInvestmentDialogClose = (investment: InvestmentRow | null) =>{
  addNewInvestmentDialogVisible.value = false
  if (investment){
    getInvestmentPaging()
  }
}

const onInvestmentTableSortChange = (data: {column: any, prop: string, order: any }) =>{
  investmentSortProp = data.prop
  investmentSortMode = data.order
  getInvestmentPaging()
}

const getInvestmentPaging = () =>{
  var queryParams = {
    account_ids: selectedAccountIds.value,
    search_text: searchText.value.trim(),
    order_by: investmentSortProp,
    sort_type: investmentSortMode,
    page: currentInvestmentPage,
    page_size: 6
  }
  stockAjax.get("/investments",{
    params: queryParams,
    paramsSerializer: {
      indexes: null, 
    }
  },).then(res=>{
    investments.value = res.data.investments
    totalInvestments.value = res.data.total_items
  }).catch(err=>{
    ElMessage({
      message: err.response.data.error,
      type: "error"
    })
  })
}

const getLatestInvesment = (investmentId: number) => {
  var url = `/investment/${investmentId}`
  stockAjax.get<InvestmentRow>(url).then(res=>{
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

const handleCurrentChange = (val: InvestmentRow | undefined) => {
  currentInvestment.value = val
  getTransactionPaging(val?.account_id)
}

const clearSelectInvestment = () => {
  investmentTableRef.value!.setCurrentRow(undefined)
  searchText.value = ""
  getTransactionPaging()
}

// ========================================= TRANSACTIONS ==================================================
const transactions = ref<TransactionRow[]>([])
// transaction table properties
const totalTransactionRows = ref<number>(0);
let sumMatchValue = 0;
let sumFee = 0;
let sumTax = 0; 
let sumReturnValue = 0;
let currentTransactionPage = 1;
let transactionOrderBy = 'trading_date'
let transactionOrderType = 'descending'
const tradingMode = ref<string>("BUY")


const getTransactionPaging = (acc_id?: number) =>{
  var ticker = currentInvestment.value ? currentInvestment.value.ticker : ""
  stockAjax.get("/transactions",{
    params: {
      account_ids: acc_id ? acc_id : selectedAccountIds.value,
      ticker: ticker,
      order_by: transactionOrderBy,
      order_type: transactionOrderType,
      page: currentTransactionPage,
      page_size: 10
    },
    paramsSerializer: {
      indexes: null, 
    }
  }
  ).then(res=>{
    transactions.value =  res.data.transactions
    totalTransactionRows.value = res.data.total
    sumMatchValue = res.data.sum_match_value
    sumFee = res.data.sum_fee
    sumTax = res.data.sum_tax
    sumReturnValue = res.data.sum_return
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

const openCreateTransactionDialog = (row: InvestmentRow, trade: string) =>{
  addNewTransactionDialogVisible.value = true 
  tradingMode.value = trade
  
}

const onCloseCreatingTransactionDialog = (tx: TransactionRow) => {
  addNewTransactionDialogVisible.value = false
  if(tx != null){
    getLatestInvesment(tx.investment_id)
    getLatestAccountInfo(currentInvestment.value!.account_id)
    getTransactionPaging(currentInvestment.value?.account_id)
  }
}

interface SummaryMethodProps<T = TransactionRow> {
  columns: TableColumnCtx<T>[]
  data: T[]
}

const getSummaries = (param: SummaryMethodProps) => {
  const { columns } = param
  
  const sums: (string | VNode)[] = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = h('div', { style: { textDecoration: 'underline' } }, [
        'Total',
      ])
      return
    }
    if (index <= 5 || index == 9 || index == 10){
      sums[index] = ''
    }else {
      sums[6] = (sumMatchValue / 1000).toString()
      sums[7] = (sumFee / 1000).toString()
      sums[8] = (sumTax / 1000).toString()
      sums[11] = (sumReturnValue / 1000).toString()
    }
  })

  return sums
}


</script>
