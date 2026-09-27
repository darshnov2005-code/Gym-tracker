import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import Header from '../components/Header'
import { Card } from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { Plus, Trash2, X } from 'lucide-react'
import type { RoutineExercise } from '../types'
import { generateId } from '../lib/utils'

export default function RoutinesPage() {
  const routines = useLiveQuery(() => db.routines.orderBy('name').toArray())
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [exercises, setExercises] = useState<RoutineExercise[]>([
    { name: '', targetSets: 3, targetReps: '8-12' }
  ])

  const addExercise = () => {
    setExercises([...exercises, { name: '', targetSets: 3, targetReps: '8-12' }])
  }

  const updateExercise = (idx: number, field: keyof RoutineExercise, value: string | number) => {
    const next = [...exercises]
    next[idx] = { ...next[idx], [field]: value }
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
    setExercises([{ name: '', targetSets: 3, targetReps: '8-12' }])
    setShowForm(false)
  }

  const deleteRoutine = async (id?: number) => {
    if (id && confirm('Delete this routine?')) {
      await db.routines.delete(id)
    }
  }

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
          <Card className="space-y-3">
            <Input
              placeholder="Routine name (e.g. Push Day)"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            {exercises.map((ex, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  className="flex-1"
                  placeholder="Exercise"
                  value={ex.name}
                  onChange={e => updateExercise(i, 'name', e.target.value)}
                />
                <Input
                  className="w-16 text-center"
                  type="number"
                  value={ex.targetSets}
                  onChange={e => updateExercise(i, 'targetSets', +e.target.value)}
                />
                <Input
                  className="w-20 text-center"
                  placeholder="reps"
                  value={ex.targetReps}
                  onChange={e => updateExercise(i, 'targetReps', e.target.value)}
                />
                <button onClick={() => removeExercise(i)} className="text-slate-500 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
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