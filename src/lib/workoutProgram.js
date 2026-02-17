// ============================================================
// Custom 8-Week Hypertrophy Program — 31 exercises, 5-day split
// ============================================================

export const PROGRAM = {
  // ---------- Day 1: Chest & Back (Horizontal) ----------
  'flat-db-bench':        { id: 'flat-db-bench',        name: 'Flat DB Bench',        muscle: 'Chest',       equipment: 'Dumbbells', startWeight: 75,  increment: 5,    targetReps: 10, restSeconds: 90,  isCompound: true  },
  't-bar-row':            { id: 't-bar-row',            name: 'T-Bar Row',            muscle: 'Back',        equipment: 'Barbell',   startWeight: 90,  increment: 5,    targetReps: 10, restSeconds: 90,  isCompound: true  },
  'incline-cable-fly':    { id: 'incline-cable-fly',    name: 'Incline Cable Fly',    muscle: 'Upper Chest', equipment: 'Cable',     startWeight: 25,  increment: 2.5,  targetReps: 12, restSeconds: 60,  isCompound: false },
  'single-arm-db-row':    { id: 'single-arm-db-row',    name: 'Single-Arm DB Row',    muscle: 'Back',        equipment: 'Dumbbell',  startWeight: 70,  increment: 5,    targetReps: 10, restSeconds: 90,  isCompound: true  },
  'machine-pec-fly':      { id: 'machine-pec-fly',      name: 'Machine Pec Fly',      muscle: 'Chest',       equipment: 'Machine',   startWeight: 115, increment: 5,    targetReps: 12, restSeconds: 60,  isCompound: false },
  'face-pull':            { id: 'face-pull',            name: 'Face Pull',            muscle: 'Rear Delts',  equipment: 'Cable',     startWeight: 40,  increment: 2.5,  targetReps: 15, restSeconds: 45,  isCompound: false },

  // ---------- Day 2: Quads & Calves ----------
  'leg-press':            { id: 'leg-press',            name: 'Leg Press',            muscle: 'Quads',       equipment: 'Machine',   startWeight: 360, increment: 20,   targetReps: 10, restSeconds: 120, isCompound: true  },
  'bulgarian-split-squat':{ id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscle: 'Quads',     equipment: 'Dumbbells', startWeight: 40,  increment: 5,    targetReps: 10, restSeconds: 90,  isCompound: true  },
  'leg-extension':        { id: 'leg-extension',        name: 'Leg Extension',        muscle: 'Quads',       equipment: 'Machine',   startWeight: 100, increment: 5,    targetReps: 12, restSeconds: 60,  isCompound: false },
  'goblet-squat':         { id: 'goblet-squat',         name: 'Goblet Squat',         muscle: 'Quads',       equipment: 'Dumbbell',  startWeight: 50,  increment: 5,    targetReps: 12, restSeconds: 75,  isCompound: true  },
  'seated-calf-raise':    { id: 'seated-calf-raise',    name: 'Seated Calf Raise',    muscle: 'Calves',      equipment: 'Machine',   startWeight: 90,  increment: 5,    targetReps: 15, restSeconds: 45,  isCompound: false },
  'pallof-press':         { id: 'pallof-press',         name: 'Pallof Press',         muscle: 'Core',        equipment: 'Cable',     startWeight: 30,  increment: 2.5,  targetReps: 12, restSeconds: 45,  isCompound: false },

  // ---------- Day 3: Shoulders & Arms ----------
  'seated-db-ohp':        { id: 'seated-db-ohp',        name: 'Seated DB OHP',        muscle: 'Shoulders',   equipment: 'Dumbbells', startWeight: 50,  increment: 5,    targetReps: 10, restSeconds: 90,  isCompound: true  },
  'cable-lateral-raise':  { id: 'cable-lateral-raise',  name: 'Cable Lateral Raise',  muscle: 'Side Delts',  equipment: 'Cable',     startWeight: 15,  increment: 2.5,  targetReps: 15, restSeconds: 45,  isCompound: false },
  'incline-db-curl':      { id: 'incline-db-curl',      name: 'Incline DB Curl',      muscle: 'Biceps',      equipment: 'Dumbbells', startWeight: 30,  increment: 5,    targetReps: 12, restSeconds: 60,  isCompound: false },
  'dip-machine':          { id: 'dip-machine',          name: 'Dip Machine',          muscle: 'Triceps',     equipment: 'Machine',   startWeight: 180, increment: 10,   targetReps: 10, restSeconds: 90,  isCompound: true  },
  'bayesian-cable-curl':  { id: 'bayesian-cable-curl',  name: 'Bayesian Cable Curl',  muscle: 'Biceps',      equipment: 'Cable',     startWeight: 20,  increment: 2.5,  targetReps: 12, restSeconds: 60,  isCompound: false },
  'ez-bar-skull-crusher': { id: 'ez-bar-skull-crusher', name: 'EZ-Bar Skull Crusher', muscle: 'Triceps',     equipment: 'EZ-Bar',    startWeight: 55,  increment: 5,    targetReps: 12, restSeconds: 60,  isCompound: false },
  'rear-delt-cable-fly':  { id: 'rear-delt-cable-fly',  name: 'Rear Delt Cable Fly',  muscle: 'Rear Delts',  equipment: 'Cable',     startWeight: 15,  increment: 2.5,  targetReps: 15, restSeconds: 45,  isCompound: false },

  // ---------- Day 4: Chest & Back (Angles) ----------
  'low-incline-db-press': { id: 'low-incline-db-press', name: 'Low-Incline DB Press', muscle: 'Upper Chest', equipment: 'Dumbbells', startWeight: 60,  increment: 5,    targetReps: 10, restSeconds: 90,  isCompound: true  },
  'wide-grip-pulldown':   { id: 'wide-grip-pulldown',   name: 'Wide-Grip Pulldown',   muscle: 'Back',        equipment: 'Cable',     startWeight: 120, increment: 5,    targetReps: 10, restSeconds: 90,  isCompound: true  },
  'cable-crossover':      { id: 'cable-crossover',      name: 'Cable Crossover',      muscle: 'Chest',       equipment: 'Cable',     startWeight: 20,  increment: 2.5,  targetReps: 12, restSeconds: 60,  isCompound: false },
  'meadows-row':          { id: 'meadows-row',          name: 'Meadows Row',          muscle: 'Back',        equipment: 'Barbell',   startWeight: 50,  increment: 5,    targetReps: 10, restSeconds: 90,  isCompound: true  },
  'push-up':              { id: 'push-up',              name: 'Push-Up (Banded)',     muscle: 'Chest',       equipment: 'Bodyweight',startWeight: 0,   increment: 0,    targetReps: 15, restSeconds: 60,  isCompound: true,  isBW: true },
  'straight-arm-pulldown':{ id: 'straight-arm-pulldown', name: 'Straight-Arm Pulldown', muscle: 'Back',      equipment: 'Cable',     startWeight: 50,  increment: 5,    targetReps: 12, restSeconds: 60,  isCompound: false },

  // ---------- Day 5: Hams, Glutes & Core ----------
  'barbell-glute-bridge': { id: 'barbell-glute-bridge', name: 'Barbell Glute Bridge', muscle: 'Glutes',      equipment: 'Barbell',   startWeight: 225, increment: 10,   targetReps: 10, restSeconds: 120, isCompound: true  },
  'lying-leg-curl':       { id: 'lying-leg-curl',       name: 'Lying Leg Curl',       muscle: 'Hamstrings',  equipment: 'Machine',   startWeight: 90,  increment: 5,    targetReps: 12, restSeconds: 60,  isCompound: false },
  'db-step-up':           { id: 'db-step-up',           name: 'DB Step-Up',           muscle: 'Glutes',      equipment: 'Dumbbells', startWeight: 35,  increment: 5,    targetReps: 10, restSeconds: 90,  isCompound: true  },
  'nordic-ham-curl':      { id: 'nordic-ham-curl',      name: 'Nordic Ham Curl',      muscle: 'Hamstrings',  equipment: 'Bodyweight',startWeight: 0,   increment: 0,    targetReps: 10, restSeconds: 90,  isCompound: true,  isBW: true },
  'cable-pull-through':   { id: 'cable-pull-through',   name: 'Cable Pull-Through',   muscle: 'Glutes',      equipment: 'Cable',     startWeight: 60,  increment: 5,    targetReps: 12, restSeconds: 60,  isCompound: false },
  'cable-crunch':         { id: 'cable-crunch',         name: 'Cable Crunch',         muscle: 'Core',        equipment: 'Cable',     startWeight: 70,  increment: 5,    targetReps: 15, restSeconds: 45,  isCompound: false },
}

export const SPLIT = [
  {
    dayNumber: 1,
    name: 'Chest & Back (Horizontal)',
    exercises: ['flat-db-bench', 't-bar-row', 'incline-cable-fly', 'single-arm-db-row', 'machine-pec-fly', 'face-pull'],
  },
  {
    dayNumber: 2,
    name: 'Quads & Calves',
    exercises: ['leg-press', 'bulgarian-split-squat', 'leg-extension', 'goblet-squat', 'seated-calf-raise', 'pallof-press'],
  },
  {
    dayNumber: 3,
    name: 'Shoulders & Arms',
    exercises: ['seated-db-ohp', 'cable-lateral-raise', 'incline-db-curl', 'dip-machine', 'bayesian-cable-curl', 'ez-bar-skull-crusher', 'rear-delt-cable-fly'],
  },
  {
    dayNumber: 4,
    name: 'Chest & Back (Angles)',
    exercises: ['low-incline-db-press', 'wide-grip-pulldown', 'cable-crossover', 'meadows-row', 'push-up', 'straight-arm-pulldown'],
  },
  {
    dayNumber: 5,
    name: 'Hams, Glutes & Core',
    exercises: ['barbell-glute-bridge', 'lying-leg-curl', 'db-step-up', 'nordic-ham-curl', 'cable-pull-through', 'cable-crunch'],
  },
]

export const PHASES = [
  { phase: 1, name: 'Baseline',  weeks: [1, 2], rpe: '7-8' },
  { phase: 2, name: 'Loading',   weeks: [3, 4], rpe: '8'   },
  { phase: 3, name: 'Intensity', weeks: [5, 6], rpe: '8-9' },
  { phase: 4, name: 'Peak',      weeks: [7, 8], rpe: '9'   },
]

export function getPhaseForWeek(week) {
  return PHASES.find(p => p.weeks.includes(week))
}

/** Target weight for an exercise in a given week */
export function getTargetWeight(exercise, week) {
  if (exercise.isBW) return 'BW'
  return exercise.startWeight + Math.floor((week - 1) / 2) * exercise.increment
}

/** Number of sets for an exercise in a given week */
export function getSetsForExercise(exercise, week) {
  const phase = getPhaseForWeek(week)
  if (!phase) return 3
  // Phase 3-4: compounds get 4 sets, isolations stay at 3
  if (phase.phase >= 3 && exercise.isCompound) return 4
  return 3
}

/** Full schedule for a given week — each day with fully-resolved exercise objects */
export function getWeekSchedule(week) {
  const phase = getPhaseForWeek(week)
  if (!phase) return null
  return SPLIT.map(day => ({
    ...day,
    exercises: day.exercises.map(id => {
      const ex = PROGRAM[id]
      return {
        ...ex,
        sets: getSetsForExercise(ex, week),
        weight: getTargetWeight(ex, week),
      }
    }),
  }))
}

/** Flat array of all exercises (for selectors / dropdowns) */
export function getAllExercises() {
  return Object.values(PROGRAM)
}
