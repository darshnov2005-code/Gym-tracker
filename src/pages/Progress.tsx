import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import Header from '../components/Header'
import { Card } from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar
} from 'recharts'
import { format, parseISO, subDays, isAfter } from 'date-fns'
import { useMemo, useState } from 'react'
import { volumeOfExercise } from '../lib/utils'
import { Target, Plus, Trash2 } from 'lucide-react'

export default function ProgressPage() {
  const workouts = useLiveQuery(() => db.workouts.toArray())
  const bodyWeights = useLiveQuery(() => db.bodyWeights.orderBy('date').toArray())
  const prs = useLiveQuery(() => db.personalRecords.orderBy('estimated1RM').reverse().toArray())
  const goals = useLiveQuery(() => db.goals.orderBy('createdAt').reverse().toArray())

  const [selectedExercise, setSelectedExercise] = useState('')
  const [goalEx, setGoalEx] = useState('')
  const [goalWeight, setGoalWeight] = useState('')
  const [goalReps, setGoalReps] = useState('1')

  const exerciseNames = useMemo(() => {
    if (!workouts) return []
    const set = new Set<string>()
    workouts.forEach(w => w.exercises.forEach(e => e.name && set.add(e.name)))
    return Array.from(set).sort()
  }, [workouts])

  const exerciseProgress = useMemo(() => {
    if (!workouts || !selectedExercise) return []
    const map = new Map<string, number>()
    workouts.forEach(w => {
      const ex = w.exercises.find(e => e.name === selectedExercise)
      if (!ex) return
      const maxWeight = Math.max(...ex.sets.filter(s => s.completed).map(s => s.weight), 0)
      if (maxWeight > 0) {
        map.set(w.date, Math.max(map.get(w.date) || 0, maxWeight))
      }
    })
    return Array.from(map.entries())
      .map(([date, weight]) => ({ date, weight }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [workouts, selectedExercise])

  // Volume by muscle group (last 7 days)
  const volumeByMuscle = useMemo(() => {
    if (!workouts) return []
    const since = subDays(new Date(), 7)
    const map = new Map<string, number>()
    workouts.forEach(w => {
      if (!isAfter(parseISO(w.date), since) && w.date !== format(since, 'yyyy-MM-dd')) {
        // include last 7 days roughly
      }
      const d = parseISO(w.date)
      if (d < since) return
      w.exercises.forEach(ex => {
        const vol = volumeOfExercise(ex.sets)
        const g = ex.muscleGroup || 'Other'
        map.set(g, (map.get(g) || 0) + vol)
      })
    })
    return Array.from(map.entries())
      .map(([muscle, volume]) => ({ muscle, volume: Math.round(volume) }))
      .sort((a, b) => b.volume - a.volume)
  }, [workouts])

  const bodyWeightData = useMemo(() => {
    if (!bodyWeights) return []
    return bodyWeights.map(bw => ({ date: bw.date, weight: bw.weight }))
  }, [bodyWeights])

  const addGoal = async () => {
    const w = parseFloat(goalWeight)
    const r = parseInt(goalReps) || 1
    if (!goalEx.trim() || !w) return
    await db.goals.add({
      exerciseName: goalEx.trim(),
      targetWeight: w,
      targetReps: r,
      createdAt: Date.now()
    })
    setGoalEx('')
    setGoalWeight('')
    setGoalReps('1')
  }

  const deleteGoal = async (id?: number) => {
    if (id) await db.goals.delete(id)
  }

  // Best current for goal progress
  const bestFor = (name: string) => {
    if (!prs) return 0
    const match = prs.filter(p => p.exerciseName.toLowerCase() === name.toLowerCase())
    return match.reduce((m, p) => Math.max(m, p.weight), 0)
  }

  return (
    <div>
      <Header title="Progress" />
      <div className="p-4 space-y-6">
        {/* Goals */}
        <section>
          <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1">
            <Target size={14} /> Goals
          </h2>
          <Card className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Exercise"
                value={goalEx}
                onChange={e => setGoalEx(e.target.value)}
                className="min-h-[44px]"
              />
              <Input
                type="number"
                placeholder="kg"
                value={goalWeight}
                onChange={e => setGoalWeight(e.target.value)}
                className="min-h-[44px] w-24"
              />
              <Input
                type="number"
                placeholder="reps"
                value={goalReps}
                onChange={e => setGoalReps(e.target.value)}
                className="min-h-[44px] w-20"
              />
              <Button onClick={addGoal} className="min-h-[44px]">
                <Plus size={18} />
              </Button>
            </div>
            {goals?.map(g => {
              const current = bestFor(g.exerciseName)
              const pct = Math.min(100, Math.round((current / g.targetWeight) * 100))
              return (
                <div key={g.id} className="border-t border-slate-800 pt-3">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <p className="font-medium">{g.exerciseName}</p>
                      <p className="text-xs text-slate-400">
                        Goal: {g.targetWeight} kg × {g.targetReps} · Now: {current || '—'} kg
                      </p>
                    </div>
                    <button onClick={() => deleteGoal(g.id)} className="text-slate-500 p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{pct}%</p>
                </div>
              )
            })}
          </Card>
        </section>

        {/* Volume by muscle (7d) */}
        {volumeByMuscle.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
              Volume by Muscle (7 days)
            </h2>
            <Card>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeByMuscle} layout="vertical" margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis type="category" dataKey="muscle" width={70} stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 8
                      }}
                    />
                    <Bar dataKey="volume" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>
        )}

        {/* Exercise progress */}
        <section>
          <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
            Exercise Progress
          </h2>
          <Card className="space-y-4">
            <select
              value={selectedExercise}
              onChange={e => setSelectedExercise(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-slate-100 min-h-[48px]"
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
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 8
                      }}
                      labelFormatter={d => format(parseISO(d as string), 'MMM d, yyyy')}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : selectedExercise ? (
              <p className="text-center text-slate-500 py-8">No data yet</p>
            ) : null}
          </Card>
        </section>

        {bodyWeightData.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
              Body Weight
            </h2>
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
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="weight" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>
        )}

        {prs && prs.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
              Personal Records
            </h2>
            <div className="space-y-2">
              {prs.slice(0, 10).map(pr => (
                <Card key={pr.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{pr.exerciseName}</p>
                    <p className="text-xs text-slate-400">
                      {pr.weight} kg × {pr.reps} · {format(parseISO(pr.date), 'MMM d, yyyy')}
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
