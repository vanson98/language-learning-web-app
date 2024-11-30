export default interface Transaction {
    id: number,
    investment_id: number,
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

export interface CreateNewTransactionModel{
    account_id: number,
    investment_id: number,
    trading_date: Date,
    trade: string,
    match_volume: number | null,
    match_price: number | null,
    fee: number | null,
    tax: number | null,
    status: string
}