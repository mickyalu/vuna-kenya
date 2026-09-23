export const VUNA_PAYBILL = '400200'
export const GIFT_AMOUNTS = [100, 200, 500] as const
export type GiftAmount = (typeof GIFT_AMOUNTS)[number]

export const DEFAULT_GIFT_AMOUNT: GiftAmount = 100
