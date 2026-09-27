import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, checkAndSavePR } from '../db'
import Header from '../components/Header'
import { Card } from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import RestTimer from '../components/RestTimer'
import ExercisePicker from '../components/ExercisePicker'
import { generateId } from '../lib/utils'
import type { ExerciseLog, SetLog } from '../types'
import { Plus, Check, Trash2, Save } from 'lucide-react'
import { format } from 'date-fns'

const WORKOUT_NAME_SUGGESTIONS = [
  'Push Day',
  'Pull Day',
  'Leg Day',
  'Upper Body',
  'Lower Body',
  'Full Body',
  'Chest & Triceps',
  'Back & Biceps',
  'Shoulders & Arms',
  'Core & Cardio'
]

export default function WorkoutSession() {
  const { routineId } = useParams()
  const navigate = useNavigate()
  const routine = useLiveQuery(
    () => (routineId ? db.routines.get(Number(routineId)) : undefined),
    [routineId]
  )

  const [workoutName, setWorkoutName] = useState('Workout')
  const [showNameSuggestions, setShowNameSuggestions] = useState(false)
  const [exercises, setExercises] = useState<ExerciseLog[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (routine) {
      setWorkoutName(routine.name)
      setExercises(
        routine.exercises.map(e => ({
          id: generateId(),
          name: e.name,
          muscleGroup: e.muscleGroup,
          sets: Array.from({ length: e.targetSets }, () => ({
            id: generateId(),
            reps: 0,
            weight: 0,
            completed: false
          }))
        }))
      )
    }
  }, [routine])

  // Group exercises by muscle group for display order
  const grouped = useMemo(() => {
    const map = new Map<string, ExerciseLog[]>()
    for (const ex of exercises) {
      const key = ex.muscleGroup || 'Other'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ex)
    }
    return map
  }, [exercises])

  const addExercise = (muscleGroup?: string) => {
    setExercises([
      ...exercises,
      {
        id: generateId(),
        name: '',
        muscleGroup: muscleGroup || '',
        sets: [
          { id: generateId(), reps: 0, weight: 0, completed: false },
          { id: generateId(), reps: 0, weight: 0, completed: false },
          { id: generateId(), reps: 0, weight: 0, completed: false }
        ]
      }
    ])
  }

  const updateExercise = (id: string, patch: Partial<ExerciseLog>) => {
    setExercises(exercises.map(e => (e.id === id ? { ...e, ...patch } : e)))
  }

  const updateSet = (exId: string, setId: string, field: keyof SetLog, value: number | boolean) => {
    setExercises(
      exercises.map(e =>
        e.id === exId
          ? {
              ...e,
              sets: e.sets.map(s => (s.id === setId ? { ...s, [field]: value } : s))
            }
          : e
      )
    )
  }

  const addSet = (exId: string) => {
    setExercises(
      exercises.map(e =>
        e.id === exId
          ? {
              ...e,
              sets: [
                ...e.sets,
                { id: generateId(), reps: 0, weight: 0, completed: false }
              ]
            }
          : e
      )
    )
  }

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id))
  }

  const finishWorkout = async () => {
    if (exercises.length === 0) return
    setSaving(true)
    const date = format(new Date(), 'yyyy-MM-dd')

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
      createdAt: Date.now()
    })

    setSaving(false)
    navigate('/history')
  }

  const filteredNameSuggestions = WORKOUT_NAME_SUGGESTIONS.filter(n =>
    n.toLowerCase().includes(workoutName.toLowerCase()) || workoutName === 'Workout'
  )

  return (
    <div className="pb-8">
      <Header
        title="Workout"
        action={
          <Button size="sm" onClick={finishWorkout} disabled={saving}>
            <Save size={16} className="mr-1" />
            {saving ? 'Saving...' : 'Finish'}
          </Button>
        }
      />

      <div className="p-4 space-y-4">
        {/* Workout name with suggestions */}
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
            className="text-lg font-semibold"
            autoComplete="off"
          />
          {showNameSuggestions && filteredNameSuggestions.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
              {filteredNameSuggestions.map(s => (
                <li key={s}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-800 text-slate-100"
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

        <RestTimer />

        {/* Exercises grouped by muscle */}
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
                      onMuscleGroupChange={muscleGroup => updateExercise(ex.id, { muscleGroup })}
                    />
                  </div>
                  <button
                    onClick={() => removeExercise(ex.id)}
                    className="text-slate-500 hover:text-red-400 p-1 mt-8"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs text-slate-500 px-1">
                  <span>Set</span>
                  <span>kg</span>
                  <span>Reps</span>
                  <span></span>
                </div>

                {ex.sets.map((s, idx) => (
                  <div key={s.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                    <span className="text-sm text-slate-400 text-center">{idx + 1}</span>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={s.weight || ''}
                      onChange={e => updateSet(ex.id, s.id, 'weight', parseFloat(e.target.value) || 0)}
                      className="text-center"
                      placeholder="0"
                    />
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={s.reps || ''}
                      onChange={e => updateSet(ex.id, s.id, 'reps', parseInt(e.target.value) || 0)}
                      className="text-center"
                      placeholder="0"
                    />
                    <button
                      onClick={() => updateSet(ex.id, s.id, 'completed', !s.completed)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        s.completed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                      }`}
                    >
                      <Check size={16} />
                    </button>
                  </div>
                ))}

                <Button variant="ghost" size="sm" onClick={() => addSet(ex.id)} className="w-full">
                  <Plus size={14} className="mr-1" /> Add Set
                </Button>
              </Card>
            ))}
          </div>
        ))}

        <Button variant="secondary" className="w-full" onClick={() => addExercise()}>
          <Plus size={18} className="mr-2" /> Add Exercise
        </Button>

        <Input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Workout notes (optional)"
        />
      </div>
    </div>
  )
}
