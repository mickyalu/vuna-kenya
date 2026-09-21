import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isAppPath, isModifiedClick } from './route.ts'

test('isAppPath treats /app and nested app paths as the dashboard', () => {
  assert.equal(isAppPath('/'), false)
  assert.equal(isAppPath('/app'), true)
  assert.equal(isAppPath('/app/'), true)
  assert.equal(isAppPath('/about'), false)
})

test('isAppPath also accepts hash dashboard routes', () => {
  assert.equal(isAppPath('/', '#/app'), true)
  assert.equal(isAppPath('/', '#faq'), false)
})

test('modified clicks are left to the browser', () => {
  assert.equal(isModifiedClick({ metaKey: true, ctrlKey: false, shiftKey: false, altKey: false }), true)
  assert.equal(isModifiedClick({ metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, button: 0 }), false)
})
