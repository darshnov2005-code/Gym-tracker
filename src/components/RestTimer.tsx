import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { Timer, Play, Pause, RotateCcw } from 'lucide-react'
import Button from './Button'
import { cn } from '../lib/utils'

const PRESETS = [60, 90, 120, 180]

export interface RestTimerHandle {
  startRest: (seconds?: number) => void
}

interface RestTimerProps {
  defaultSeconds?: number
  autoStartOnMount?: boolean
}

const RestTimer = forwardRef<RestTimerHandle, RestTimerProps>(
  ({ defaultSeconds = 90 }, ref) => {
    const [seconds, setSeconds] = useState(defaultSeconds)
    const [remaining, setRemaining] = useState(defaultSeconds)
    const [running, setRunning] = useState(false)
    const intervalRef = useRef<number | null>(null)

    useImperativeHandle(ref, () => ({
      startRest: (secs?: number) => {
        const s = secs ?? seconds
        setSeconds(s)
        setRemaining(s)
        setRunning(true)
      }
    }))

    useEffect(() => {
      if (running && remaining > 0) {
        intervalRef.current = window.setInterval(() => {
          setRemaining(r => {
            if (r <= 1) {
              setRunning(false)
              if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200])
              try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.frequency.value = 880
                gain.gain.value = 0.15
                osc.start()
                setTimeout(() => {
                  osc.stop()
                  ctx.close()
                }, 300)
              } catch {
                /* audio not available */
              }
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

    const applyPreset = (s: number) => {
      setSeconds(s)
      setRemaining(s)
      setRunning(false)
    }

    const mins = Math.floor(remaining / 60)
    const secs = remaining % 60

    return (
      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 rounded-xl">
              <Timer className="text-sky-400" size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Rest Timer</p>
              <p className="text-3xl font-bold tabular-nums tracking-tight">
                {mins}:{secs.toString().padStart(2, '0')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!running ? (
              <Button size="md" onClick={() => setRunning(true)} disabled={remaining === 0}>
                <Play size={18} />
              </Button>
            ) : (
              <Button size="md" variant="secondary" onClick={() => setRunning(false)}>
                <Pause size={18} />
              </Button>
            )}
            <Button
              size="md"
              variant="ghost"
              onClick={() => {
                setRunning(false)
                setRemaining(seconds)
              }}
            >
              <RotateCcw size={18} />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {PRESETS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => applyPreset(p)}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-medium min-h-[44px] min-w-[52px]',
                seconds === p
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              )}
            >
              {p < 60 ? `${p}s` : `${p / 60}m`}
            </button>
          ))}
        </div>
      </div>
    )
  }
)

RestTimer.displayName = 'RestTimer'
export default RestTimer