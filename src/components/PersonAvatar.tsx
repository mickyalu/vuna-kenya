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
        className={`inline-flex items-center justify-center rounded-full bg-[#2a2a2a] text-[11px] font-bold text-white ${className}`}
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
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
