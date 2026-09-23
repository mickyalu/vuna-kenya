import assert from 'node:assert/strict'
import { test } from 'node:test'
import { PILLAR_VERTICALS, chosenVertical, pillPeople } from './tribes.ts'

test('a typed focus wins over a pillar chip', () => {
  assert.equal(chosenVertical('Morning run', 'Karura loop'), 'Karura loop')
  assert.equal(chosenVertical('Meal prep', '   '), 'Meal prep')
  assert.equal(chosenVertical('', '  '), null)
})

test('the tribe pill shows saved people and leaves the sample faces out', () => {
  assert.deepEqual(pillPeople([], null), [])
  const you = { name: 'Amina.K', photo: '/faces/amina.jpg' }
  assert.deepEqual(pillPeople([{ name: 'Amina.K', photo: '/faces/amina.jpg' }], you), [
    { alt: 'Amina.K', src: '/faces/amina.jpg' },
  ])
  const faces = pillPeople([{ name: 'Wanjiku.N', photo: '/faces/zuri.jpg' }], you)
  assert.deepEqual(faces, [
    { alt: 'Amina.K', src: '/faces/amina.jpg' },
    { alt: 'Wanjiku.N', src: '/faces/zuri.jpg' },
  ])
  assert.equal(faces.some((face) => face.alt === 'Mkuu' || face.alt === 'Nzomo'), false)
})

test('fitness and lifestyle offer different focuses', () => {
  assert.equal(PILLAR_VERTICALS.FITNESS.includes('Morning run'), true)
  assert.equal(PILLAR_VERTICALS.LIFESTYLE.includes('Meal prep'), true)
  assert.equal(PILLAR_VERTICALS.LIFESTYLE.includes('Morning run'), false)
})
