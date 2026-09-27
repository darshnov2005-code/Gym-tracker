import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import Header from '../components/Header'
import { Card } from '../components/Card'
import { format } from 'date-fns'
import { volumeOfExercise } from '../lib/utils'

export default function HistoryPage() {
  const workouts = useLiveQuery(() =>
    db.workouts.orderBy('createdAt').reverse().toArray()
  )

  return (
    <div>
      <Header title="History" subtitle={`${workouts?.length ?? 0} workouts`} />

      <div className="p-4 space-y-3">
        {!workouts || workouts.length === 0 ? (
          <p className="text-center text-slate-500 py-12">No workouts yet. Go lift something!</p>
        ) : (
          workouts.map(w => {
            const totalVolume = w.exercises.reduce(
              (sum, e) => sum + volumeOfExercise(e.sets),
              0
            )
            return (
              <Card key={w.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-lg">{w.name}</p>
                    <p className="text-sm text-slate-400">
                      {format(new Date(w.date), 'EEEE, MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-sky-400 font-medium">{Math.round(totalVolume)} kg</p>
                    <p className="text-slate-500">volume</p>
                  </div>
                </div>
                <div className="space-y-1 mt-3">
                  {w.exercises.map(ex => (
                    <div key={ex.id} className="text-sm flex justify-between text-slate-300">
                      <span>{ex.name}</span>
                      <span className="text-slate-500">
                        {ex.sets.filter(s => s.completed).length} sets
                      </span>
                    </div>
                  ))}
                </div>
                {w.notes && (
                  <p className="mt-3 text-sm text-slate-400 italic border-t border-slate-800 pt-2">
                    {w.notes}
                  </p>
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}