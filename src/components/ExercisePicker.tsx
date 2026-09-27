import { useState, useRef, useEffect } from 'react'
import { MUSCLE_GROUPS, getSuggestions, type MuscleGroup } from '../data/exercises'
import Input from './Input'
import { cn } from '../lib/utils'

interface ExercisePickerProps {
  name: string
  muscleGroup?: string
  onNameChange: (name: string) => void
  onMuscleGroupChange: (group: string) => void
  placeholder?: string
}

export default function ExercisePicker({
  name,
  muscleGroup = '',
  onNameChange,
  onMuscleGroupChange,
  placeholder = 'Exercise name'
}: ExercisePickerProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filterGroup, setFilterGroup] = useState<string>(muscleGroup || 'All')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const suggestions = getSuggestions(name, filterGroup === 'All' ? undefined : filterGroup)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectSuggestion = (s: { name: string; muscleGroup: MuscleGroup }) => {
    onNameChange(s.name)
    onMuscleGroupChange(s.muscleGroup)
    setFilterGroup(s.muscleGroup)
    setShowSuggestions(false)
  }

  return (
    <div ref={wrapperRef} className="space-y-2 relative">
      {/* Muscle group chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setFilterGroup('All')}
          className={cn(
            'shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
            filterGroup === 'All'
              ? 'bg-sky-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          )}
        >
          All
        </button>
        {MUSCLE_GROUPS.map(g => (
          <button
            key={g}
            type="button"
            onClick={() => {
              setFilterGroup(g)
              onMuscleGroupChange(g)
            }}
            className={cn(
              'shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
              filterGroup === g || muscleGroup === g
                ? 'bg-sky-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Name input + suggestions */}
      <div className="relative">
        <Input
          value={name}
          onChange={e => {
            onNameChange(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="font-medium"
          autoComplete="off"
        />

        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-xl">
            {suggestions.map(s => (
              <li key={s.name}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-800 flex justify-between items-center gap-2"
                  onClick={() => selectSuggestion(s)}
                >
                  <span className="text-slate-100">{s.name}</span>
                  <span className="text-xs text-slate-500 shrink-0">{s.muscleGroup}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {muscleGroup && (
        <p className="text-xs text-sky-400/80">
          {muscleGroup}
        </p>
      )}
    </div>
  )
}