import assert from 'node:assert/strict'
import { test } from 'node:test'
import { installInstructions } from './install-help.ts'

test('iPhone install steps use Add to Home Screen', () => {
  const text = installInstructions('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')
  assert.match(text, /Add to Home Screen/)
})

test('Android install steps use the browser menu', () => {
  const text = installInstructions('Mozilla/5.0 (Linux; Android 14; Pixel)')
  assert.match(text, /Install app/)
})

test('desktop install steps use the address bar', () => {
  const text = installInstructions('Mozilla/5.0 (X11; Linux x86_64) Chrome/148.0.0.0')
  assert.match(text, /address bar/)
})
