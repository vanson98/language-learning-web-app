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