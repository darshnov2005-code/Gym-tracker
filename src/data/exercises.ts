export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Glutes',
  'Core',
  'Full Body',
  'Cardio',
  'Other'
] as const

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]

export interface ExerciseSuggestion {
  name: string
  muscleGroup: MuscleGroup
}

/** Common exercises grouped by muscle — used for autocomplete suggestions */
export const EXERCISE_LIBRARY: ExerciseSuggestion[] = [
  // Chest
  { name: 'Bench Press', muscleGroup: 'Chest' },
  { name: 'Incline Bench Press', muscleGroup: 'Chest' },
  { name: 'Decline Bench Press', muscleGroup: 'Chest' },
  { name: 'Dumbbell Bench Press', muscleGroup: 'Chest' },
  { name: 'Incline Dumbbell Press', muscleGroup: 'Chest' },
  { name: 'Dumbbell Flyes', muscleGroup: 'Chest' },
  { name: 'Cable Flyes', muscleGroup: 'Chest' },
  { name: 'Pec Deck', muscleGroup: 'Chest' },
  { name: 'Push-Ups', muscleGroup: 'Chest' },
  { name: 'Chest Dips', muscleGroup: 'Chest' },
  { name: 'Machine Chest Press', muscleGroup: 'Chest' },

  // Back
  { name: 'Deadlift', muscleGroup: 'Back' },
  { name: 'Barbell Row', muscleGroup: 'Back' },
  { name: 'Pendlay Row', muscleGroup: 'Back' },
  { name: 'Dumbbell Row', muscleGroup: 'Back' },
  { name: 'Seated Cable Row', muscleGroup: 'Back' },
  { name: 'Lat Pulldown', muscleGroup: 'Back' },
  { name: 'Pull-Ups', muscleGroup: 'Back' },
  { name: 'Chin-Ups', muscleGroup: 'Back' },
  { name: 'T-Bar Row', muscleGroup: 'Back' },
  { name: 'Face Pulls', muscleGroup: 'Back' },
  { name: 'Hyperextensions', muscleGroup: 'Back' },
  { name: 'Shrugs', muscleGroup: 'Back' },

  // Shoulders
  { name: 'Overhead Press', muscleGroup: 'Shoulders' },
  { name: 'Military Press', muscleGroup: 'Shoulders' },
  { name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders' },
  { name: 'Arnold Press', muscleGroup: 'Shoulders' },
  { name: 'Lateral Raises', muscleGroup: 'Shoulders' },
  { name: 'Front Raises', muscleGroup: 'Shoulders' },
  { name: 'Rear Delt Flyes', muscleGroup: 'Shoulders' },
  { name: 'Upright Rows', muscleGroup: 'Shoulders' },
  { name: 'Cable Lateral Raises', muscleGroup: 'Shoulders' },

  // Biceps
  { name: 'Barbell Curl', muscleGroup: 'Biceps' },
  { name: 'Dumbbell Curl', muscleGroup: 'Biceps' },
  { name: 'Hammer Curl', muscleGroup: 'Biceps' },
  { name: 'Preacher Curl', muscleGroup: 'Biceps' },
  { name: 'Concentration Curl', muscleGroup: 'Biceps' },
  { name: 'Cable Curl', muscleGroup: 'Biceps' },
  { name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps' },

  // Triceps
  { name: 'Tricep Pushdown', muscleGroup: 'Triceps' },
  { name: 'Skull Crushers', muscleGroup: 'Triceps' },
  { name: 'Overhead Tricep Extension', muscleGroup: 'Triceps' },
  { name: 'Close-Grip Bench Press', muscleGroup: 'Triceps' },
  { name: 'Tricep Dips', muscleGroup: 'Triceps' },
  { name: 'Diamond Push-Ups', muscleGroup: 'Triceps' },
  { name: 'Cable Overhead Extension', muscleGroup: 'Triceps' },

  // Legs
  { name: 'Squat', muscleGroup: 'Legs' },
  { name: 'Front Squat', muscleGroup: 'Legs' },
  { name: 'Leg Press', muscleGroup: 'Legs' },
  { name: 'Romanian Deadlift', muscleGroup: 'Legs' },
  { name: 'Leg Extension', muscleGroup: 'Legs' },
  { name: 'Leg Curl', muscleGroup: 'Legs' },
  { name: 'Walking Lunges', muscleGroup: 'Legs' },
  { name: 'Bulgarian Split Squat', muscleGroup: 'Legs' },
  { name: 'Calf Raises', muscleGroup: 'Legs' },
  { name: 'Seated Calf Raise', muscleGroup: 'Legs' },
  { name: 'Hack Squat', muscleGroup: 'Legs' },
  { name: 'Goblet Squat', muscleGroup: 'Legs' },

  // Glutes
  { name: 'Hip Thrust', muscleGroup: 'Glutes' },
  { name: 'Glute Bridge', muscleGroup: 'Glutes' },
  { name: 'Cable Kickback', muscleGroup: 'Glutes' },
  { name: 'Sumo Deadlift', muscleGroup: 'Glutes' },

  // Core
  { name: 'Plank', muscleGroup: 'Core' },
  { name: 'Crunches', muscleGroup: 'Core' },
  { name: 'Hanging Leg Raises', muscleGroup: 'Core' },
  { name: 'Cable Crunch', muscleGroup: 'Core' },
  { name: 'Russian Twists', muscleGroup: 'Core' },
  { name: 'Ab Wheel Rollout', muscleGroup: 'Core' },
  { name: 'Dead Bug', muscleGroup: 'Core' },

  // Full Body / Cardio
  { name: 'Clean and Press', muscleGroup: 'Full Body' },
  { name: 'Thrusters', muscleGroup: 'Full Body' },
  { name: 'Burpees', muscleGroup: 'Full Body' },
  { name: 'Kettlebell Swing', muscleGroup: 'Full Body' },
  { name: 'Treadmill', muscleGroup: 'Cardio' },
  { name: 'Rowing Machine', muscleGroup: 'Cardio' },
  { name: 'Cycling', muscleGroup: 'Cardio' },
  { name: 'Elliptical', muscleGroup: 'Cardio' },
  { name: 'Jump Rope', muscleGroup: 'Cardio' }
]

export function getSuggestions(query: string, muscleGroup?: string): ExerciseSuggestion[] {
  const q = query.trim().toLowerCase()
  let list = EXERCISE_LIBRARY

  if (muscleGroup && muscleGroup !== 'All') {
    list = list.filter(e => e.muscleGroup === muscleGroup)
  }

  if (!q) return list.slice(0, 12)

  return list
    .filter(e => e.name.toLowerCase().includes(q))
    .slice(0, 10)
}