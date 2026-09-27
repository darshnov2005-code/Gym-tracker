import Dexie, { type Table } from 'dexie'
import type { Workout, Routine, BodyWeight, PersonalRecord, Goal, AppBackup, SetLog } from './types'

export class GymDB extends Dexie {
  workouts!: Table<Workout, number>
  routines!: Table<Routine, number>
  bodyWeights!: Table<BodyWeight, number>
  personalRecords!: Table<PersonalRecord, number>
  goals!: Table<Goal, number>

  constructor() {
    super('GymTrackerDB')
    this.version(1).stores({
      workouts: '++id, date, name, createdAt',
      routines: '++id, name, createdAt',
      bodyWeights: '++id, date',
      personalRecords: '++id, exerciseName, date, estimated1RM'
    })
    this.version(2).stores({
      workouts: '++id, date, name, createdAt',
      routines: '++id, name, createdAt',
      bodyWeights: '++id, date',
      personalRecords: '++id, exerciseName, date, estimated1RM',
      goals: '++id, exerciseName, createdAt'
    })
  }
}

export const db = new GymDB()

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
  const existing = await db.personalRecords.where('exerciseName').equals(exerciseName).toArray()
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

/** Last completed sets for an exercise (most recent workout first) */
export async function getLastSetsForExercise(exerciseName: string): Promise<SetLog[]> {
  if (!exerciseName.trim()) return []
  const workouts = await db.workouts.orderBy('createdAt').reverse().toArray()
  for (const w of workouts) {
    const ex = w.exercises.find(
      e => e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase()
    )
    if (ex) {
      const completed = ex.sets.filter(s => s.completed && s.weight > 0)
      if (completed.length) return completed
    }
  }
  return []
}

export async function exportBackup(): Promise<AppBackup> {
  const [workouts, routines, bodyWeights, personalRecords, goals] = await Promise.all([
    db.workouts.toArray(),
    db.routines.toArray(),
    db.bodyWeights.toArray(),
    db.personalRecords.toArray(),
    db.goals.toArray()
  ])
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    workouts,
    routines,
    bodyWeights,
    personalRecords,
    goals
  }
}

export async function importBackup(data: AppBackup) {
  if (!data || data.version !== 1) throw new Error('Invalid backup file')
  await db.transaction(
    'rw',
    db.workouts,
    db.routines,
    db.bodyWeights,
    db.personalRecords,
    db.goals,
    async () => {
      await Promise.all([
        db.workouts.clear(),
        db.routines.clear(),
        db.bodyWeights.clear(),
        db.personalRecords.clear(),
        db.goals.clear()
      ])
      if (data.workouts?.length) await db.workouts.bulkAdd(data.workouts.map(({ id, ...r }) => r))
      if (data.routines?.length) await db.routines.bulkAdd(data.routines.map(({ id, ...r }) => r))
      if (data.bodyWeights?.length)
        await db.bodyWeights.bulkAdd(data.bodyWeights.map(({ id, ...r }) => r))
      if (data.personalRecords?.length)
        await db.personalRecords.bulkAdd(data.personalRecords.map(({ id, ...r }) => r))
      if (data.goals?.length) await db.goals.bulkAdd(data.goals.map(({ id, ...r }) => r))
    }
  )
}