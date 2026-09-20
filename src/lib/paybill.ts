export const VUNA_PAYBILL = '400200'
export const GIFT_AMOUNTS = [10, 20, 50] as const
export type GiftAmount = (typeof GIFT_AMOUNTS)[number]

export const DEFAULT_GIFT_AMOUNT: GiftAmount = 20
