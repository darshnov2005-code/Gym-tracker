import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId() {
  return crypto.randomUUID()
}

export function formatWeight(w: number) {
  return w % 1 === 0 ? w.toString() : w.toFixed(1)
}

export function volumeOfExercise(sets: { reps: number; weight: number; completed: boolean }[]) {
  return sets
    .filter(s => s.completed)
    .reduce((sum, s) => sum + s.reps * s.weight, 0)
}