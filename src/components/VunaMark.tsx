export function VunaMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#121212" stroke="#222222" />
      <path d="M8 22c2-6 4.5-10 8-14 3.5 4 6 8 8 14" stroke="#CCFF00" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 8v14" stroke="#CCFF00" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
