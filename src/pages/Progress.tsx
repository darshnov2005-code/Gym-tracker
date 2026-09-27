import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import Header from '../components/Header'
import { Card } from '../components/Card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { useMemo, useState } from 'react'

export default function ProgressPage() {
  const workouts = useLiveQuery(() => db.workouts.toArray())
  const bodyWeights = useLiveQuery(() => db.bodyWeights.orderBy('date').toArray())
  const prs = useLiveQuery(() => db.personalRecords.orderBy('estimated1RM').reverse().toArray())

  const [selectedExercise, setSelectedExercise] = useState<string>('')

  const exerciseNames = useMemo(() => {
    if (!workouts) return []
    const set = new Set<string>()
    workouts.forEach(w => w.exercises.forEach(e => e.name && set.add(e.name)))
    return Array.from(set).sort()
  }, [workouts])

  // Build progress data for selected exercise (max weight per session)
  const exerciseProgress = useMemo(() => {
    if (!workouts || !selectedExercise) return []
    const map = new Map<string, number>()
    workouts.forEach(w => {
      const ex = w.exercises.find(e => e.name === selectedExercise)
      if (!ex) return
      const maxWeight = Math.max(...ex.sets.filter(s => s.completed).map(s => s.weight), 0)
      if (maxWeight > 0) {
        const prev = map.get(w.date) || 0
        map.set(w.date, Math.max(prev, maxWeight))
      }
    })
    return Array.from(map.entries())
      .map(([date, weight]) => ({ date, weight }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [workouts, selectedExercise])

  const bodyWeightData = useMemo(() => {
    if (!bodyWeights) return []
    return bodyWeights.map(bw => ({
      date: bw.date,
      weight: bw.weight
    }))
  }, [bodyWeights])

  return (
    <div>
      <Header title="Progress" />

      <div className="p-4 space-y-6">
        {/* Exercise Progress */}
        <section>
          <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Exercise Progress</h2>
          <Card className="space-y-4">
            <select
              value={selectedExercise}
              onChange={e => setSelectedExercise(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100"
            >
              <option value="">Select exercise...</option>
              {exerciseNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {selectedExercise && exerciseProgress.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={exerciseProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={d => format(parseISO(d), 'MMM d')}
                      stroke="#64748b"
                      fontSize={11}
                    />
                    <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                      labelFormatter={d => format(parseISO(d as string), 'MMM d, yyyy')}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={{ fill: '#38bdf8', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : selectedExercise ? (
              <p className="text-center text-slate-500 py-8">No data yet for this exercise</p>
            ) : null}
          </Card>
        </section>

        {/* Body Weight */}
        {bodyWeightData.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Body Weight</h2>
            <Card>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bodyWeightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={d => format(parseISO(d), 'MMM d')}
                      stroke="#64748b"
                      fontSize={11}
                    />
                    <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>
        )}

        {/* PRs */}
        {prs && prs.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Personal Records</h2>
            <div className="space-y-2">
              {prs.slice(0, 10).map(pr => (
                <Card key={pr.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{pr.exerciseName}</p>
                    <p className="text-xs text-slate-400">
                      {pr.weight} kg × {pr.reps} • {format(parseISO(pr.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sky-400 font-bold">{pr.estimated1RM}</p>
                    <p className="text-xs text-slate-500">est 1RM</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}