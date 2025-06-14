export default interface AddNewInvestmnetModel {
  account_id?: number;
  ticker: string;
  company_name: string;
  market_price: number;
  description: string;
}

export interface InvestmentRow {
  id: number;
  account_id: number;
  channel_name: string;
  ticker: string;
  buy_value: number;
  buy_volume: number;
  capital_cost: number;
  company_name: string;
  current_volume: number;
  description: string;
  fee: number;
  market_price: number;
  sell_value: number;
  sell_volume: number;
  status: string;
  tax: number;
  profit: number;
}

export interface UpdateMarketPriceModel {
  investment_id: number ;
  market_price: number | null;
}