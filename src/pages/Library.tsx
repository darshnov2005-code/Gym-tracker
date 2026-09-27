import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Card } from '../components/Card'
import Input from '../components/Input'
import { MUSCLE_GROUPS, EXERCISE_LIBRARY } from '../data/exercises'
import { cn } from '../lib/utils'

export default function LibraryPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('All')

  const list = useMemo(() => {
    let items = EXERCISE_LIBRARY
    if (group !== 'All') items = items.filter(e => e.muscleGroup === group)
    if (query.trim()) {
      const q = query.toLowerCase()
      items = items.filter(e => e.name.toLowerCase().includes(q))
    }
    return items
  }, [query, group])

  return (
    <div>
      <Header title="Exercise Library" subtitle={`${list.length} exercises`} />
      <div className="p-4 space-y-4">
        <Input
          placeholder="Search exercises..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="min-h-[48px]"
        />
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setGroup('All')}
            className={cn(
              'shrink-0 px-3 py-2 rounded-xl text-sm font-medium min-h-[40px]',
              group === 'All' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
            )}
          >
            All
          </button>
          {MUSCLE_GROUPS.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              className={cn(
                'shrink-0 px-3 py-2 rounded-xl text-sm font-medium min-h-[40px]',
                group === g ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
              )}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {list.map(ex => (
            <Card
              key={ex.name}
              className="flex justify-between items-center cursor-pointer hover:border-sky-500/40 min-h-[52px]"
              onClick={() => navigate('/workout')}
            >
              <div>
                <p className="font-medium">{ex.name}</p>
                <p className="text-xs text-sky-400/80">{ex.muscleGroup}</p>
              </div>
            </Card>
          ))}
          {list.length === 0 && (
            <p className="text-center text-slate-500 py-8">No exercises match</p>
          )}
        </div>
      </div>
    </div>
  )
}
