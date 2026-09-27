import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, exportBackup, importBackup } from '../db'
import Header from '../components/Header'
import { Card } from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import PlateCalculator from '../components/PlateCalculator'
import { useTheme } from '../context/ThemeContext'
import { format } from 'date-fns'
import { Download, Upload, Moon, Sun, Calculator } from 'lucide-react'
import type { AppBackup } from '../types'

export default function ProfilePage() {
  const { theme, toggle } = useTheme()
  const bodyWeights = useLiveQuery(() =>
    db.bodyWeights.orderBy('date').reverse().toArray()
  )
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showPlates, setShowPlates] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const addWeight = async () => {
    const w = parseFloat(weight)
    if (!w || w <= 0) return
    await db.bodyWeights.add({ date, weight: w })
    setWeight('')
  }

  const exportCSV = async () => {
    const workouts = await db.workouts.toArray()
    let csv = 'Date,Workout,Exercise,Set,Reps,Weight,Notes\n'
    for (const w of workouts) {
      for (const ex of w.exercises) {
        ex.sets.forEach((s, i) => {
          if (s.completed) {
            csv += `${w.date},"${w.name}","${ex.name}",${i + 1},${s.reps},${s.weight},"${s.notes || ''}"\n`
          }
        })
      }
    }
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gym-tracker-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportJson = async () => {
    const data = await exportBackup()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gym-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Backup exported')
  }

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text) as AppBackup
      if (!confirm('This will replace ALL local data with the backup. Continue?')) return
      await importBackup(data)
      setMsg('Backup restored successfully')
    } catch {
      setMsg('Invalid backup file')
    }
    e.target.value = ''
  }

  return (
    <div>
      <Header title="Profile" />
      <div className="p-4 space-y-6">
        {/* Theme */}
        <section>
          <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Appearance</h2>
          <Button variant="secondary" className="w-full min-h-[48px]" onClick={toggle}>
            {theme === 'dark' ? <Sun size={18} className="mr-2" /> : <Moon size={18} className="mr-2" />}
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} mode
          </Button>
        </section>

        {/* Body Weight */}
        <section>
          <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Body Weight</h2>
          <Card className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Input
                type="number"
                placeholder="Weight (kg)"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="min-h-[48px] flex-1"
              />
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-40 min-h-[48px]"
              />
              <Button onClick={addWeight} className="min-h-[48px]">Add</Button>
            </div>
            {bodyWeights && bodyWeights.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                {bodyWeights.slice(0, 8).map(bw => (
                  <div key={bw.id} className="flex justify-between text-sm py-1">
                    <span className="text-slate-400">{format(new Date(bw.date), 'MMM d, yyyy')}</span>
                    <span className="font-medium">{bw.weight} kg</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        {/* Tools */}
        <section>
          <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Tools</h2>
          <Button variant="secondary" className="w-full min-h-[48px]" onClick={() => setShowPlates(true)}>
            <Calculator size={18} className="mr-2" />
            Plate Calculator
          </Button>
        </section>

        {/* Data */}
        <section>
          <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Data</h2>
          <div className="space-y-2">
            <Button variant="secondary" className="w-full min-h-[48px]" onClick={exportCSV}>
              <Download size={18} className="mr-2" />
              Export CSV
            </Button>
            <Button variant="secondary" className="w-full min-h-[48px]" onClick={exportJson}>
              <Download size={18} className="mr-2" />
              Full Backup (JSON)
            </Button>
            <Button
              variant="ghost"
              className="w-full min-h-[48px]"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={18} className="mr-2" />
              Restore Backup
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={onImportFile}
            />
            {msg && <p className="text-sm text-sky-400 text-center">{msg}</p>}
          </div>
        </section>

        <p className="text-center text-xs text-slate-600 pt-4">
          Gym Tracker · Offline-first · Data stays on your device
        </p>
      </div>

      {showPlates && <PlateCalculator onClose={() => setShowPlates(false)} />}
    </div>
  )
}
