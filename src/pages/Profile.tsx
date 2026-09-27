import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import Header from '../components/Header'
import { Card } from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { format } from 'date-fns'
import { Download } from 'lucide-react'

export default function ProfilePage() {
  const bodyWeights = useLiveQuery(() =>
    db.bodyWeights.orderBy('date').reverse().toArray()
  )
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))

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
    a.download = `gym-tracker-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <Header title="Profile" />

      <div className="p-4 space-y-6">
        {/* Body Weight */}
        <section>
          <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Body Weight</h2>
          <Card className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Weight (kg)"
                value={weight}
                onChange={e => setWeight(e.target.value)}
              />
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-40"
              />
              <Button onClick={addWeight}>Add</Button>
            </div>
            {bodyWeights && bodyWeights.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                {bodyWeights.slice(0, 8).map(bw => (
                  <div key={bw.id} className="flex justify-between text-sm">
                    <span className="text-slate-400">{format(new Date(bw.date), 'MMM d, yyyy')}</span>
                    <span className="font-medium">{bw.weight} kg</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        {/* Export */}
        <section>
          <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Data</h2>
          <Button variant="secondary" className="w-full" onClick={exportCSV}>
            <Download size={18} className="mr-2" />
            Export Workouts to CSV
          </Button>
        </section>

        <p className="text-center text-xs text-slate-600 pt-8">
          Gym Tracker v1.0 • Offline-first • Data stays on your device
        </p>
      </div>
    </div>
  )
}