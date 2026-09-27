import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, checkAndSavePR, getLastSetsForExercise } from '../db'
import Header from '../components/Header'
import { Card } from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import RestTimer, { type RestTimerHandle } from '../components/RestTimer'
import ExercisePicker from '../components/ExercisePicker'
import PlateCalculator from '../components/PlateCalculator'
import { generateId } from '../lib/utils'
import type { ExerciseLog, SetLog } from '../types'
import { Plus, Check, Trash2, Save, Calculator } from 'lucide-react'
import { format } from 'date-fns'

const WORKOUT_NAME_SUGGESTIONS = [
  'Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Lower Body',
  'Full Body', 'Chest & Triceps', 'Back & Biceps', 'Shoulders & Arms', 'Core & Cardio'
]

export default function WorkoutSession() {
  const { routineId } = useParams()
  const [searchParams] = useSearchParams()
  const repeatId = searchParams.get('repeat')
  const navigate = useNavigate()
  const routine = useLiveQuery(
    () => (routineId ? db.routines.get(Number(routineId)) : undefined),
    [routineId]
  )
  const timerRef = useRef<RestTimerHandle>(null)
  const startedAt = useRef(Date.now())

  const [workoutName, setWorkoutName] = useState('Workout')
  const [showNameSuggestions, setShowNameSuggestions] = useState(false)
  const [exercises, setExercises] = useState<ExerciseLog[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPlates, setShowPlates] = useState(false)
  const [plateTarget, setPlateTarget] = useState(60)
  const [elapsed, setElapsed] = useState(0)

  // Live duration clock
  useEffect(() => {
    const t = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  // Load routine
  useEffect(() => {
    if (routine) {
      setWorkoutName(routine.name)
      ;(async () => {
        const loaded: ExerciseLog[] = []
        for (const e of routine.exercises) {
          const last = await getLastSetsForExercise(e.name)
          const sets: SetLog[] =
            last.length > 0
              ? last.map(s => ({
                  id: generateId(),
                  reps: s.reps,
                  weight: s.weight,
                  completed: false
                }))
              : Array.from({ length: e.targetSets }, () => ({
                  id: generateId(),
                  reps: 0,
                  weight: 0,
                  completed: false
                }))
          // pad to target sets if needed
          while (sets.length < e.targetSets) {
            sets.push({ id: generateId(), reps: 0, weight: 0, completed: false })
          }
          loaded.push({
            id: generateId(),
            name: e.name,
            muscleGroup: e.muscleGroup,
            sets
          })
        }
        setExercises(loaded)
      })()
    }
  }, [routine])

  // Repeat last workout
  useEffect(() => {
    if (!repeatId) return
    ;(async () => {
      const w = await db.workouts.get(Number(repeatId))
      if (!w) return
      setWorkoutName(w.name)
      setExercises(
        w.exercises.map(e => ({
          id: generateId(),
          name: e.name,
          muscleGroup: e.muscleGroup,
          sets: e.sets.map(s => ({
            id: generateId(),
            reps: s.reps,
            weight: s.weight,
            completed: false
          }))
        }))
      )
    })()
  }, [repeatId])

  const grouped = useMemo(() => {
    const map = new Map<string, ExerciseLog[]>()
    for (const ex of exercises) {
      const key = ex.muscleGroup || 'Other'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ex)
    }
    return map
  }, [exercises])

  const addExercise = async (prefill?: { name: string; muscleGroup?: string }) => {
    let sets: SetLog[] = [
      { id: generateId(), reps: 0, weight: 0, completed: false },
      { id: generateId(), reps: 0, weight: 0, completed: false },
      { id: generateId(), reps: 0, weight: 0, completed: false }
    ]
    if (prefill?.name) {
      const last = await getLastSetsForExercise(prefill.name)
      if (last.length) {
        sets = last.map(s => ({
          id: generateId(),
          reps: s.reps,
          weight: s.weight,
          completed: false
        }))
      }
    }
    setExercises([
      ...exercises,
      {
        id: generateId(),
        name: prefill?.name || '',
        muscleGroup: prefill?.muscleGroup || '',
        sets
      }
    ])
  }

  const updateExercise = async (id: string, patch: Partial<ExerciseLog>) => {
    // When name changes, try to load last weights
    if (patch.name && patch.name.trim()) {
      const last = await getLastSetsForExercise(patch.name)
      if (last.length) {
        setExercises(prev =>
          prev.map(e =>
            e.id === id
              ? {
                  ...e,
                  ...patch,
                  sets: last.map(s => ({
                    id: generateId(),
                    reps: s.reps,
                    weight: s.weight,
                    completed: false
                  }))
                }
              : e
          )
        )
        return
      }
    }
    setExercises(prev => prev.map(e => (e.id === id ? { ...e, ...patch } : e)))
  }

  const updateSet = (
    exId: string,
    setId: string,
    field: keyof SetLog,
    value: number | boolean
  ) => {
    setExercises(prev =>
      prev.map(e =>
        e.id === exId
          ? {
              ...e,
              sets: e.sets.map(s => (s.id === setId ? { ...s, [field]: value } : s))
            }
          : e
      )
    )
    // Auto-start rest when completing a set
    if (field === 'completed' && value === true) {
      timerRef.current?.startRest()
    }
  }

  const addSet = (exId: string) => {
    setExercises(prev =>
      prev.map(e => {
        if (e.id !== exId) return e
        const last = e.sets[e.sets.length - 1]
        return {
          ...e,
          sets: [
            ...e.sets,
            {
              id: generateId(),
              reps: last?.reps || 0,
              weight: last?.weight || 0,
              completed: false
            }
          ]
        }
      })
    )
  }

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id))
  }

  const finishWorkout = async () => {
    if (exercises.length === 0) return
    setSaving(true)
    const date = format(new Date(), 'yyyy-MM-dd')
    const durationMinutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000))

    for (const ex of exercises) {
      for (const s of ex.sets) {
        if (s.completed && s.weight > 0 && s.reps > 0 && ex.name.trim()) {
          await checkAndSavePR(ex.name.trim(), s.weight, s.reps, date)
        }
      }
    }

    await db.workouts.add({
      date,
      name: workoutName || 'Workout',
      exercises: exercises.filter(e => e.name.trim()),
      notes: notes || undefined,
      durationMinutes,
      startedAt: startedAt.current,
      createdAt: Date.now()
    })

    setSaving(false)
    navigate('/history')
  }

  const filteredNameSuggestions = WORKOUT_NAME_SUGGESTIONS.filter(
    n => n.toLowerCase().includes(workoutName.toLowerCase()) || workoutName === 'Workout'
  )

  const elapsedStr = `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`

  return (
    <div className="pb-8">
      <Header
        title="Workout"
        subtitle={`⏱ ${elapsedStr}`}
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowPlates(true)}>
              <Calculator size={18} />
            </Button>
            <Button size="sm" onClick={finishWorkout} disabled={saving}>
              <Save size={16} className="mr-1" />
              {saving ? 'Saving...' : 'Finish'}
            </Button>
          </div>
        }
      />

      <div className="p-4 space-y-4">
        <div className="relative">
          <Input
            value={workoutName}
            onChange={e => {
              setWorkoutName(e.target.value)
              setShowNameSuggestions(true)
            }}
            onFocus={() => setShowNameSuggestions(true)}
            onBlur={() => setTimeout(() => setShowNameSuggestions(false), 150)}
            placeholder="Workout name (e.g. Push Day)"
            className="text-lg font-semibold min-h-[48px]"
            autoComplete="off"
          />
          {showNameSuggestions && filteredNameSuggestions.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
              {filteredNameSuggestions.map(s => (
                <li key={s}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-3 text-sm hover:bg-slate-800 text-slate-100 min-h-[44px]"
                    onMouseDown={() => {
                      setWorkoutName(s)
                      setShowNameSuggestions(false)
                    }}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <RestTimer ref={timerRef} />

        {Array.from(grouped.entries()).map(([group, groupExercises]) => (
          <div key={group} className="space-y-3">
            {group !== 'Other' && (
              <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-400/90 px-1">
                {group}
              </h3>
            )}
            {groupExercises.map(ex => (
              <Card key={ex.id} className="space-y-3">
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <ExercisePicker
                      name={ex.name}
                      muscleGroup={ex.muscleGroup}
                      onNameChange={name => updateExercise(ex.id, { name })}
                      onMuscleGroupChange={muscleGroup =>
                        updateExercise(ex.id, { muscleGroup })
                      }
                    />
                  </div>
                  <button
                    onClick={() => removeExercise(ex.id)}
                    className="text-slate-500 hover:text-red-400 p-2 mt-6 min-h-[44px] min-w-[44px]"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs text-slate-500 px-1">
                  <span>Set</span>
                  <span>kg</span>
                  <span>Reps</span>
                  <span></span>
                </div>

                {ex.sets.map((s, idx) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center"
                  >
                    <span className="text-sm text-slate-400 text-center">{idx + 1}</span>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={s.weight || ''}
                      onChange={e =>
                        updateSet(ex.id, s.id, 'weight', parseFloat(e.target.value) || 0)
                      }
                      onFocus={() => setPlateTarget(s.weight || 60)}
                      className="text-center min-h-[48px] text-base"
                      placeholder="0"
                    />
                    <Input
                      type="number"	ibur inputMode="numeric"
                      value={s.reps || ''}
                      onChange={e =>
                        updateSet(ex.id, s.id, 'reps', parseInt(e.target.value) || 0)
                      }
                      className="text-center min-h-[48px] text-base"
                      placeholder="0"
                    />
                    <button
                      onClick={() => updateSet(ex.id, s.id, 'completed', !s.completed)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        s.completed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                      }`}
                    >
                      <Check size={20} />
                    </button>
                  </div>
                ))}

                <Button variant="ghost" size="md" onClick={() => addSet(ex.id)} className="w-full min-h-[44px]">
                  <Plus size={16} className="mr-1" /> Add Set
                </Button>
              </Card>
            ))}
          </div>
        ))}

        <Button variant="secondary" className="w-full min-h-[48px]" onClick={() => addExercise()}>
          <Plus size={18} className="mr-2" /> Add Exercise
        </Button>

        <Input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Workout notes (optional)"
          className="min-h-[48px]"
        />
      </div>

      {showPlates && (
        <PlateCalculator
          initialWeight={plateTarget}
          onClose={() => setShowPlates(false)}
        />
      )}
    </div>
  )
}
