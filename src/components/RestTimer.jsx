import { useState, useEffect, useRef } from 'react'

export default function RestTimer({ seconds, onComplete, autoStart = false }) {
  const [remaining, setRemaining] = useState(seconds)
  const [active, setActive] = useState(false)
  const intervalRef = useRef(null)
  const hasAutoStarted = useRef(false)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  useEffect(() => {
    setRemaining(seconds)
    setActive(false)
    hasAutoStarted.current = false
  }, [seconds])

  useEffect(() => {
    if (autoStart && !active && !hasAutoStarted.current) {
      hasAutoStarted.current = true
      start()
    }
  }, [autoStart])

  const start = () => {
    setRemaining(seconds)
    setActive(true)
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setActive(false)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stop = () => {
    clearInterval(intervalRef.current)
    setActive(false)
    setRemaining(seconds)
  }

  const pct = ((seconds - remaining) / seconds) * 100

  return (
    <div className="flex items-center gap-2.5">
      {active ? (
        <>
          <div className="relative w-12 h-12 animate-pulse-ring">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="#1e2130" strokeWidth="3" />
              <circle cx="24" cy="24" r="20" fill="none" stroke="#06b6d4" strokeWidth="3"
                strokeDasharray={`${pct * 1.257} 125.7`} strokeLinecap="round"
                className="transition-all duration-300 ease-linear" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-accent">
              {remaining}
            </span>
          </div>
          <button onClick={stop}
            className="px-3 py-1.5 text-xs bg-surface-elevated rounded-xl text-slate-400 font-semibold min-h-[32px] transition-colors hover:text-white">
            Skip
          </button>
        </>
      ) : (
        <button onClick={start}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-elevated hover:bg-surface-border rounded-xl text-xs font-semibold text-slate-400 transition-all duration-200 min-h-[32px]">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {seconds}s
        </button>
      )}
    </div>
  )
}
