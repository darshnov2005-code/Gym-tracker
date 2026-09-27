import { useState, useMemo } from 'react'
import { calculatePlates } from '../lib/plates'
import Input from './Input'
import Button from './Button'
import { X } from 'lucide-react'

interface PlateCalculatorProps {
  initialWeight?: number
  onClose: () => void
  onUse?: (weight: number) => void
}

export default function PlateCalculator({ initialWeight = 60, onClose, onUse }: PlateCalculatorProps) {
  const [target, setTarget] = useState(String(initialWeight))
  const [bar, setBar] = useState('20')

  const result = useMemo(() => {
    const t = parseFloat(target) || 0
    const b = parseFloat(bar) || 20
    return calculatePlates(t, b)
  }, [target, bar])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Plate Calculator</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Target (kg)</label>
            <Input
              type="number"
              inputMode="decimal"
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="text-lg text-center min-h-[48px]"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Bar (kg)</label>
            <Input
              type="number"
              inputMode="decimal"
              value={bar}
              onChange={e => setBar(e.target.value)}
              className="text-lg text-center min-h-[48px]"
            />
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-4 space-y-2">
          <p className="text-sm text-slate-400">Per side</p>
          {result.perSide.length === 0 ? (
            <p className="text-slate-500">Empty bar / below bar weight</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {result.perSide.map((p, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-sky-500/20 text-sky-300 rounded-lg font-semibold text-sm"
                >
                  {p} kg
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-slate-400 pt-2">
            Loaded: <span className="text-slate-100 font-medium">{result.total} kg</span>
            {result.leftover !== 0 && (
              <span className="text-amber-400"> (off by {result.leftover} kg)</span>
            )}
          </p>
        </div>

        {onUse && (
          <Button
            className="w-full min-h-[48px]"
            onClick={() => {
              onUse(parseFloat(target) || 0)
              onClose()
            }}
          >
            Use this weight
          </Button>
        )}
      </div>
    </div>
  )
}