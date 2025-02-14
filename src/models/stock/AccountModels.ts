import EntryDto from "./EntryModels";

export interface AccountSelectDto{
    id: number;
    channel_name: string;
}

export interface AccountInfoDto{
    id: number;
    channel_name: string;
    cash: number;
    total_cogs: number;
    market_value: number;
}

export default interface AccountDto{
    id: number,
    channel_name: string,
    owner: string,
    balance: number,
    currency: string,
    created_at: string
}

export  interface GetAccountPagingDto{
    id: number,
    channel_name: string,
    owner: string,
    balance: number,
    currency: string,
    deposit: number,
    withdraw: number
}

export interface AccountTransferResult{
    account: AccountDto,
    entry: EntryDto
}

export interface CreateAccountDto{
    username: string,
    email: string,
    channel_name: string,
    currency: string
}