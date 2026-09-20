export const PILLAR_CATALOG = {
  FITNESS: { emoji: '🏃', label: 'FITNESS', blurb: 'Training, runs, and strength.' },
  HEALTH: { emoji: '❤️', label: 'HEALTH', blurb: 'Sleep, meds, and recovery.' },
  HABITS: { emoji: '✓', label: 'HABITS', blurb: 'Daily non-negotiables.' },
  LIFESTYLE: { emoji: '🌿', label: 'LIFESTYLE', blurb: 'Rhythm, home, and presence.' },
  RELATIONSHIP: { emoji: '💞', label: 'RELATIONSHIP', blurb: 'Partner, family, and care.' },
  FINANCES: { emoji: '💰', label: 'FINANCES', blurb: 'Save, send, and stay liquid.' },
  CAREER: { emoji: '💼', label: 'CAREER', blurb: 'Craft, clients, and deep work.' },
  FAITH: { emoji: '🙏', label: 'FAITH', blurb: 'Prayer, scripture, and stillness.' },
  LEARNING: { emoji: '📚', label: 'LEARNING', blurb: 'Study, language, and skill.' },
  COMMUNITY: { emoji: '🤝', label: 'COMMUNITY', blurb: 'Tribe, service, and showing up.' },
  REST: { emoji: '😴', label: 'REST', blurb: 'Sabbath, wind-down, and quiet.' },
  NUTRITION: { emoji: '🥗', label: 'NUTRITION', blurb: 'Meals, water, and prep.' },
} as const

export type PillarId = keyof typeof PILLAR_CATALOG

export const PILLARS = Object.keys(PILLAR_CATALOG) as PillarId[]

export const DEFAULT_PINNED: PillarId[] = [
  'FITNESS',
  'HEALTH',
  'HABITS',
  'LIFESTYLE',
]

export function emptyPillarTotals(): Record<PillarId, number> {
  return Object.fromEntries(PILLARS.map((id) => [id, 0])) as Record<PillarId, number>
}

export function titleCasePillar(id: PillarId): string {
  return id.charAt(0) + id.slice(1).toLowerCase()
}
