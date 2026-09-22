export const PILLAR_CATALOG = {
  FITNESS: { emoji: '🏃', label: 'FITNESS', blurb: 'Training, runs, and strength.', face: 'bg-[#D6FF4A]', ink: true },
  HEALTH: { emoji: '❤️', label: 'HEALTH', blurb: 'Sleep, meds, and recovery.', face: 'bg-[#FF4B6E]', ink: true },
  HABITS: { emoji: '✓', label: 'HABITS', blurb: 'Daily non-negotiables.', face: 'bg-[#3A56E8]', ink: false },
  LIFESTYLE: { emoji: '🌿', label: 'LIFESTYLE', blurb: 'Rhythm, home, and presence.', face: 'bg-[#6846F0]', ink: false },
  RELATIONSHIP: { emoji: '💞', label: 'RELATIONSHIP', blurb: 'Partner, family, and care.', face: 'bg-[#FF7A45]', ink: true },
  FINANCES: { emoji: '💰', label: 'FINANCES', blurb: 'Save, send, and stay liquid.', face: 'bg-[#F5C451]', ink: true },
  CAREER: { emoji: '💼', label: 'CAREER', blurb: 'Craft, clients, and deep work.', face: 'bg-[#14B8A6]', ink: true },
  FAITH: { emoji: '🙏', label: 'FAITH', blurb: 'Prayer, scripture, and stillness.', face: 'bg-[#F3E27A]', ink: true },
  LEARNING: { emoji: '📚', label: 'LEARNING', blurb: 'Study, language, and skill.', face: 'bg-[#38BDF8]', ink: true },
  COMMUNITY: { emoji: '🤝', label: 'COMMUNITY', blurb: 'Tribe, service, and showing up.', face: 'bg-[#F472B6]', ink: true },
  REST: { emoji: '😴', label: 'REST', blurb: 'Sabbath, wind-down, and quiet.', face: 'bg-[#312E81]', ink: false },
  NUTRITION: { emoji: '🥗', label: 'NUTRITION', blurb: 'Meals, water, and prep.', face: 'bg-[#86EFAC]', ink: true },
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
