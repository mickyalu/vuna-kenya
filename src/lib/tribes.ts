import type { PillarId } from './pillars'

export type TribeMember = {
  initials: string
  tone: string
  name: string
}

export type Tribe = {
  pillar: PillarId
  name: string
  live: number
  line: string
  members: TribeMember[]
}

export const ACTIVITIES: Record<PillarId, string[]> = {
  FITNESS: ['Morning Run', 'Gym Session', 'Yoga', 'Swimming'],
  HEALTH: ['Health Checkup', 'Vitamins', 'Meditation', 'Sleep 8hrs'],
  HABITS: ['5am Wake Up', 'Journaling', 'No Phone Hour', 'Cold Shower'],
  LIFESTYLE: ['Meal Prep', 'Budget Review', 'Family Time', 'Learning'],
  RELATIONSHIP: ['Call Home', 'Date Night', 'Check In', 'Quality Time'],
  FINANCES: ['M-Pesa Save', 'Budget Review', 'Debt Payment', 'Give'],
  CAREER: ['Deep Work', 'Client Follow-up', 'Skill Drill', 'Ship Work'],
  FAITH: ['Morning Prayer', 'Scripture', 'Fellowship', 'Sabbath'],
  LEARNING: ['Reading', 'Language Practice', 'Course Module', 'Revision'],
  COMMUNITY: ['Show Up', 'Volunteer', 'Check a Friend', 'Host'],
  REST: ['Wind Down', 'No Screens', 'Walk Outside', 'Sleep Early'],
  NUTRITION: ['Cook at Home', 'Water Goal', 'Protein Plate', 'No Sugar'],
}

export const TRIBES: Record<PillarId, Tribe> = {
  FITNESS: {
    pillar: 'FITNESS',
    name: '5AM Club',
    live: 3,
    line: 'Karura before the city wakes.',
    members: [
      { initials: 'MK', tone: '#6b4f3a', name: 'Mkuu' },
      { initials: 'NZ', tone: '#2f3a44', name: 'Nzomo' },
      { initials: 'AW', tone: '#c4a574', name: 'Awino' },
      { initials: 'SA', tone: '#8a6a55', name: 'Sam' },
    ],
  },
  HEALTH: {
    pillar: 'HEALTH',
    name: 'Mindful Morning',
    live: 2,
    line: 'Stillness before the matatu crush.',
    members: [
      { initials: 'SA', tone: '#8a6a55', name: 'Sam' },
      { initials: 'LV', tone: '#4a5560', name: 'Leila' },
      { initials: 'JO', tone: '#3d4a3a', name: 'Joe' },
    ],
  },
  HABITS: {
    pillar: 'HABITS',
    name: 'Daily Lock',
    live: 4,
    line: 'Tiny promises, kept in KES.',
    members: [
      { initials: 'MK', tone: '#6b4f3a', name: 'Mkuu' },
      { initials: 'SA', tone: '#8a6a55', name: 'Sam' },
      { initials: 'KE', tone: '#5c4a38', name: 'Ken' },
    ],
  },
  LIFESTYLE: {
    pillar: 'LIFESTYLE',
    name: 'Westlands Circle',
    live: 2,
    line: 'Home rhythm over hustle theatre.',
    members: [
      { initials: 'AW', tone: '#c4a574', name: 'Awino' },
      { initials: 'LV', tone: '#4a5560', name: 'Leila' },
      { initials: 'NZ', tone: '#2f3a44', name: 'Nzomo' },
    ],
  },
  RELATIONSHIP: {
    pillar: 'RELATIONSHIP',
    name: 'Keepers',
    live: 1,
    line: 'The people who still pick up.',
    members: [
      { initials: 'LV', tone: '#4a5560', name: 'Leila' },
      { initials: 'AW', tone: '#c4a574', name: 'Awino' },
    ],
  },
  FINANCES: {
    pillar: 'FINANCES',
    name: 'KES Rail',
    live: 3,
    line: 'Save it before it leaves the simu.',
    members: [
      { initials: 'MK', tone: '#6b4f3a', name: 'Mkuu' },
      { initials: 'KE', tone: '#5c4a38', name: 'Ken' },
      { initials: 'JO', tone: '#3d4a3a', name: 'Joe' },
    ],
  },
  CAREER: {
    pillar: 'CAREER',
    name: 'Deep Bench',
    live: 1,
    line: 'Craft when nobody is watching.',
    members: [
      { initials: 'NZ', tone: '#2f3a44', name: 'Nzomo' },
      { initials: 'SA', tone: '#8a6a55', name: 'Sam' },
    ],
  },
  FAITH: {
    pillar: 'FAITH',
    name: 'First Light',
    live: 2,
    line: 'Before the noise, a word.',
    members: [
      { initials: 'AW', tone: '#c4a574', name: 'Awino' },
      { initials: 'JO', tone: '#3d4a3a', name: 'Joe' },
    ],
  },
  LEARNING: {
    pillar: 'LEARNING',
    name: 'Page Turners',
    live: 1,
    line: 'One page is still a harvest.',
    members: [
      { initials: 'SA', tone: '#8a6a55', name: 'Sam' },
      { initials: 'LV', tone: '#4a5560', name: 'Leila' },
    ],
  },
  COMMUNITY: {
    pillar: 'COMMUNITY',
    name: 'Show Ups',
    live: 2,
    line: 'Presence is the gift.',
    members: [
      { initials: 'MK', tone: '#6b4f3a', name: 'Mkuu' },
      { initials: 'AW', tone: '#c4a574', name: 'Awino' },
    ],
  },
  REST: {
    pillar: 'REST',
    name: 'Sabbath Set',
    live: 1,
    line: 'Stop so the work can root.',
    members: [
      { initials: 'LV', tone: '#4a5560', name: 'Leila' },
      { initials: 'JO', tone: '#3d4a3a', name: 'Joe' },
    ],
  },
  NUTRITION: {
    pillar: 'NUTRITION',
    name: 'Cooks at Home',
    live: 2,
    line: 'The plate you can name.',
    members: [
      { initials: 'AW', tone: '#c4a574', name: 'Awino' },
      { initials: 'KE', tone: '#5c4a38', name: 'Ken' },
    ],
  },
}
