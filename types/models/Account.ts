export enum AccountType {
    FREELANCER = 'FREELANCER',
    CLIENT = 'CLIENT'
}

export interface Account {
    id: number
    type: AccountType
    created_at: Date
    updated_at: Date
}