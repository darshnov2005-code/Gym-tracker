export interface SetLog {
  id: string
  reps: number
  weight: number
  completed: boolean
  notes?: string
}

export interface ExerciseLog {
  id: string
  name: string
  muscleGroup?: string
  sets: SetLog[]
  notes?: string
}

export interface Workout {
  id?: number
  date: string
  name: string
  exercises: ExerciseLog[]
  durationMinutes?: number
  notes?: string
  createdAt: number
  startedAt?: number
}

export interface RoutineExercise {
  name: string
  muscleGroup?: string
  targetSets: number
  targetReps: string
  restSeconds?: number
}

export interface Routine {
  id?: number
  name: string
  exercises: RoutineExercise[]
  createdAt: number
}

export interface BodyWeight {
  id?: number
  date: string
  weight: number
  notes?: string
}

export interface PersonalRecord {
  id?: number
  exerciseName: string
  weight: number
  reps: number
  date: string
  estimated1RM: number
}

export interface Goal {
  id?: number
  exerciseName: string
  targetWeight: number
  targetReps: number
  createdAt: number
  completed?: boolean
}

export interface AppBackup {
  version: 1
  exportedAt: string
  workouts: Workout[]
  routines: Routine[]
  bodyWeights: BodyWeight[]
  personalRecords: PersonalRecord[]
  goals: Goal[]
}