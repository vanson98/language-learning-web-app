export default interface TransactionRow {
    id: number,
    investment_id: number,
    channel_name: string,
    ticker: string,
    trading_date: string,
    trade: string, 
    volume: number,
    order_price: number,
    match_volume: number,
    match_price: number,
    match_value: number, 
    fee: number,
    tax: number,
    cost: number,
    cost_of_goods_sold: number,
    return: number,
    status: string
}

export interface TransactionExcelRow {
    tx_id: string,
    account_id: number,
    ticker: string,
    trading_date: string,
    trade: string, 
    volume: number,
    order_price: number,
    match_volume: number,
    match_price: number,
    match_value: number, 
    fee: number,
    tax: number,
    cost: number,
    return: number,
    upload_status: number,
    push_time: number | null,
    check_cost: boolean,
}
export interface CreateNewTransactionModel{
    investment_id: number,
    trading_date: Date,
    trade: string,
    match_volume: number | null,
    match_price: number | null,
    fee: number | null,
    tax: number | null,
    status: string
}