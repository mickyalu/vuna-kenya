/** Weekly deposits into an MMF, compounded weekly at a stated annual rate. */
export const MMF_ANNUAL_RATE = 0.1
export const WEEKS_PER_YEAR = 52

export type YieldProjection = {
  kesPerHabit: number
  timesPerWeek: number
  weeklyKes: number
  annualSavedKes: number
  yieldKes: number
  harvestKes: number
  annualRate: number
}

export function projectHabitYield(
  kesPerHabit: number,
  timesPerWeek: number,
  annualRate = MMF_ANNUAL_RATE,
): YieldProjection {
  const kes = Math.max(0, Math.round(kesPerHabit))
  const freq = Math.min(7, Math.max(1, Math.round(timesPerWeek)))
  const weeklyKes = kes * freq
  const annualSavedKes = weeklyKes * WEEKS_PER_YEAR
  const weeklyRate = annualRate / WEEKS_PER_YEAR
  const harvestKes =
    weeklyRate === 0
      ? annualSavedKes
      : weeklyKes * ((Math.pow(1 + weeklyRate, WEEKS_PER_YEAR) - 1) / weeklyRate)
  const yieldKes = Math.max(0, harvestKes - annualSavedKes)
  return {
    kesPerHabit: kes,
    timesPerWeek: freq,
    weeklyKes,
    annualSavedKes,
    yieldKes: Math.round(yieldKes * 100) / 100,
    harvestKes: Math.round(harvestKes * 100) / 100,
    annualRate,
  }
}
