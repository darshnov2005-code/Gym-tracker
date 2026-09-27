import Dexie, { type Table } from 'dexie'
import type { Workout, Routine, BodyWeight, PersonalRecord } from './types'

export class GymDB extends Dexie {
  workouts!: Table<Workout, number>
  routines!: Table<Routine, number>
  bodyWeights!: Table<BodyWeight, number>
  personalRecords!: Table<PersonalRecord, number>

  constructor() {
    super('GymTrackerDB')
    this.version(1).stores({
      workouts: '++id, date, name, createdAt',
      routines: '++id, name, createdAt',
      bodyWeights: '++id, date',
      personalRecords: '++id, exerciseName, date, estimated1RM'
    })
  }
}

export const db = new GymDB()

// Estimated 1RM using Epley formula
export function estimate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight
  if (reps < 1 || weight <= 0) return 0
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

export async function checkAndSavePR(
  exerciseName: string,
  weight: number,
  reps: number,
  date: string
) {
  const estimated = estimate1RM(weight, reps)
  const existing = await db.personalRecords
    .where('exerciseName')
    .equals(exerciseName)
    .toArray()

  const best = existing.reduce((max, pr) => Math.max(max, pr.estimated1RM), 0)

  if (estimated > best) {
    await db.personalRecords.add({
      exerciseName,
      weight,
      reps,
      date,
      estimated1RM: estimated
    })
    return true
  }
  return false
}