import { useState, useEffect, useRef } from 'react'
import { Timer, Play, Pause, RotateCcw } from 'lucide-react'
import Button from './Button'

interface RestTimerProps {
  defaultSeconds?: number
}

export default function RestTimer({ defaultSeconds = 90 }: RestTimerProps) {
  const [seconds, setSeconds] = useState(defaultSeconds)
  const [remaining, setRemaining] = useState(defaultSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            setRunning(false)
            // vibrate if available
            if (navigator.vibrate) navigator.vibrate([200, 100, 200])
            return 0
          }
          return r - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, remaining])

  const start = () => setRunning(true)
  const pause = () => setRunning(false)
  const reset = () => {
    setRunning(false)
    setRemaining(seconds)
  }

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-sky-500/10 rounded-xl">
          <Timer className="text-sky-400" size={22} />
        </div>
        <div>
          <p className="text-xs text-slate-400">Rest Timer</p>
          <p className="text-2xl font-bold tabular-nums tracking-tight">
            {mins}:{secs.toString().padStart(2, '0')}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {!running ? (
          <Button size="sm" onClick={start} disabled={remaining === 0}>
            <Play size={16} />
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={pause}>
            <Pause size={16} />
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={reset}>
          <RotateCcw size={16} />
        </Button>
      </div>
    </div>
  )
}