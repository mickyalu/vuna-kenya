type SplashScreenProps = {
  fading?: boolean
}

export function SplashScreen({ fading = false }: SplashScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col bg-[#0A0A0A] transition-opacity duration-500 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      role="status"
      aria-live="polite"
      aria-label="VUNA is opening"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8">
        <div className="vuna-splash-mark flex h-24 w-24 items-center justify-center rounded-[28px] border border-[#222] bg-[#121212] shadow-[0_0_40px_rgba(204,255,0,0.18)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            fill="none"
            className="h-16 w-16"
            aria-hidden
          >
            <path
              d="M8 22c2-6 4.5-10 8-14 3.5 4 6 8 8 14"
              stroke="#CCFF00"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path d="M16 8v14" stroke="#CCFF00" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
        <p className="font-display mt-7 text-[56px] leading-none tracking-[0.18em] text-white">VUNA</p>
        <p className="mt-3 text-center text-[13px] font-medium tracking-[0.04em] text-[#888888]">
          Micro-Savings &amp; Behavioral Wealth
        </p>
      </div>
      <div className="px-10 pb-[max(2.5rem,env(safe-area-inset-bottom,1.5rem))]">
        <div className="h-[3px] overflow-hidden rounded-full bg-[#1a1a1a]">
          <div className="vuna-splash-bar h-full origin-left rounded-full bg-[#CCFF00]" />
        </div>
      </div>
    </div>
  )
}
