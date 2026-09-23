import { isUploadedPhoto } from './avatars.ts'

const SIDE = 256

export async function readCardPhoto(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new Error('Choose a JPEG or PNG.')
  }
  if (file.size > 8_000_000) throw new Error('That photo is too large.')
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = SIDE
  canvas.height = SIDE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Choose a JPEG or PNG.')
  const side = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - side) / 2
  const sy = (bitmap.height - side) / 2
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, SIDE, SIDE)
  bitmap.close()
  const url = canvas.toDataURL('image/jpeg', 0.82)
  if (!isUploadedPhoto(url)) throw new Error('That photo is too large.')
  return url
}
