import EntryDto from "./EntryModels";

export interface AccountSelectDto{
    id: number;
    channel_name: string;
}

export interface AccountInfoDto{
    id: number;
    channel_name: string;
    owner: string;
    balance: number;
    currency: string;
    deposit: number;
    withdrawal: number;
}

export default interface AccountDto{
    id: number,
    channel_name: string,
    owner: string,
    balance: number,
    currency: string,
    created_at: string
}

export interface AccountTransferResult{
    account: AccountDto,
    entry: EntryDto
}