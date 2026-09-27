import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import Header from '../components/Header'
import { Card } from '../components/Card'
import Button from '../components/Button'
import { Plus, Play, Trophy } from 'lucide-react'
import { format } from 'date-fns'

export default function Home() {
  const recentWorkouts = useLiveQuery(() =>
    db.workouts.orderBy('createdAt').reverse().limit(3).toArray()
  )
  const routines = useLiveQuery(() => db.routines.orderBy('name').toArray())
  const prs = useLiveQuery(() =>
    db.personalRecords.orderBy('estimated1RM').reverse().limit(3).toArray()
  )

  return (
    <div>
      <Header title="Gym Tracker" subtitle={format(new Date(), 'EEEE, MMM d')} />

      <div className="p-4 space-y-6">
        {/* Quick Start */}
        <section>
          <Link to="/workout">
            <Button className="w-full" size="lg">
              <Plus size={20} className="mr-2" />
              Start Empty Workout
            </Button>
          </Link>
        </section>

        {/* Routines */}
        {routines && routines.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Quick Start Routine</h2>
            <div className="space-y-2">
              {routines.slice(0, 4).map(r => (
                <Link key={r.id} to={`/workout/${r.id}`}>
                  <Card className="flex items-center justify-between hover:border-sky-500/50 transition-colors">
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.exercises.length} exercises</p>
                    </div>
                    <Play size={18} className="text-sky-400" />
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent */}
        {recentWorkouts && recentWorkouts.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Recent Workouts</h2>
            <div className="space-y-2">
              {recentWorkouts.map(w => (
                <Card key={w.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{w.name}</p>
                      <p className="text-xs text-slate-400">{format(new Date(w.date), 'MMM d, yyyy')} • {w.exercises.length} exercises</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* PRs */}
        {prs && prs.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1">
              <Trophy size={14} /> Recent PRs
            </h2>
            <div className="space-y-2">
              {prs.map(pr => (
                <Card key={pr.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{pr.exerciseName}</p>
                    <p className="text-xs text-slate-400">{pr.weight} kg × {pr.reps}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sky-400 font-semibold">{pr.estimated1RM} kg</p>
                    <p className="text-xs text-slate-500">est. 1RM</p>
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