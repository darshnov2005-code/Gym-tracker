import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import Header from '../components/Header'
import { Card } from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import ExercisePicker from '../components/ExercisePicker'
import { Plus, Trash2, X } from 'lucide-react'
import type { RoutineExercise } from '../types'

const ROUTINE_NAME_SUGGESTIONS = [
  'Push Day',
  'Pull Day',
  'Leg Day',
  'Upper Body',
  'Lower Body',
  'Full Body',
  'Chest & Triceps',
  'Back & Biceps',
  'Shoulders & Arms'
]

export default function RoutinesPage() {
  const routines = useLiveQuery(() => db.routines.orderBy('name').toArray())
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [showNameSuggestions, setShowNameSuggestions] = useState(false)
  const [exercises, setExercises] = useState<RoutineExercise[]>([
    { name: '', muscleGroup: '', targetSets: 3, targetReps: '8-12' }
  ])

  const addExercise = () => {
    setExercises([...exercises, { name: '', muscleGroup: '', targetSets: 3, targetReps: '8-12' }])
  }

  const updateExercise = (idx: number, patch: Partial<RoutineExercise>) => {
    const next = [...exercises]
    next[idx] = { ...next[idx], ...patch }
    setExercises(next)
  }

  const removeExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx))
  }

  const saveRoutine = async () => {
    if (!name.trim() || exercises.some(e => !e.name.trim())) return
    await db.routines.add({
      name: name.trim(),
      exercises: exercises.filter(e => e.name.trim()),
      createdAt: Date.now()
    })
    setName('')
    setExercises([{ name: '', muscleGroup: '', targetSets: 3, targetReps: '8-12' }])
    setShowForm(false)
  }

  const deleteRoutine = async (id?: number) => {
    if (id && confirm('Delete this routine?')) {
      await db.routines.delete(id)
    }
  }

  const filteredNames = ROUTINE_NAME_SUGGESTIONS.filter(
    n => !name || n.toLowerCase().includes(name.toLowerCase())
  )

  return (
    <div>
      <Header
        title="Routines"
        action={
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={18} /> : <Plus size={18} />}
          </Button>
        }
      />

      <div className="p-4 space-y-4">
        {showForm && (
          <Card className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Routine name (e.g. Push Day)"
                value={name}
                onChange={e => {
                  setName(e.target.value)
                  setShowNameSuggestions(true)
                }}
                onFocus={() => setShowNameSuggestions(true)}
                onBlur={() => setTimeout(() => setShowNameSuggestions(false), 150)}
                autoComplete="off"
              />
              {showNameSuggestions && filteredNames.length > 0 && (
                <ul className="absolute z-20 left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                  {filteredNames.map(s => (
                    <li key={s}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-800"
                        onMouseDown={() => {
                          setName(s)
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

            {exercises.map((ex, i) => (
              <div key={i} className="space-y-2 border-b border-slate-800 pb-3 last:border-0">
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <ExercisePicker
                      name={ex.name}
                      muscleGroup={ex.muscleGroup}
                      onNameChange={name => updateExercise(i, { name })}
                      onMuscleGroupChange={muscleGroup => updateExercise(i, { muscleGroup })}
                    />
                  </div>
                  <button
                    onClick={() => removeExercise(i)}
                    className="text-slate-500 hover:text-red-400 p-1 mt-8"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">Sets</label>
                    <Input
                      type="number"
                      value={ex.targetSets}
                      onChange={e => updateExercise(i, { targetSets: +e.target.value })}
                      className="text-center"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">Reps</label>
                    <Input
                      placeholder="8-12"
                      value={ex.targetReps}
                      onChange={e => updateExercise(i, { targetReps: e.target.value })}
                      className="text-center"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={addExercise}>
                + Exercise
              </Button>
              <Button size="sm" onClick={saveRoutine}>
                Save Routine
              </Button>
            </div>
          </Card>
        )}

        {routines?.map(r => (
          <Card key={r.id}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{r.name}</p>
                <p className="text-sm text-slate-400 mt-1">
                  {r.exercises.map(e => e.name).join(' • ')}
                </p>
                {r.exercises.some(e => e.muscleGroup) && (
                  <p className="text-xs text-sky-400/70 mt-1">
                    {[...new Set(r.exercises.map(e => e.muscleGroup).filter(Boolean))].join(' • ')}
                  </p>
                )}
              </div>
              <button
                onClick={() => deleteRoutine(r.id)}
                className="text-slate-500 hover:text-red-400 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        ))}

        {(!routines || routines.length === 0) && !showForm && (
          <p className="text-center text-slate-500 py-12">No routines yet. Create one!</p>
        )}
      </div>
    </div>
  )
}
