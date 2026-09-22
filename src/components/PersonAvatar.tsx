import { useState } from 'react'

export function PersonAvatar({
  src,
  alt,
  size = 36,
  className = '',
}: {
  src: string
  alt: string
  size?: number
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const initial = alt.trim().charAt(0).toUpperCase() || '?'

  if (failed || !src) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-[#CCFF00] text-[13px] font-extrabold text-[#111111] ring-2 ring-[#CCFF00] ${className}`}
        style={{ width: size, height: size }}
      >
        {initial}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={`rounded-full object-cover object-[center_18%] ring-2 ring-[#CCFF00] ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
