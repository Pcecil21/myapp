// ============================================================
// Custom 8-Week Hypertrophy Program — 31 exercises, 5-day split
// ============================================================

export const PROGRAM = {
  // ---------- Day 1: Chest & Back (Horizontal) ----------
  'flat-db-bench': {
    id: 'flat-db-bench', name: 'Flat DB Bench', muscle: 'Chest', equipment: 'Dumbbells',
    startWeight: 75, increment: 5, targetReps: 10, restSeconds: 90, isCompound: true,
    substitutes: [
      { id: 'barbell-bench', name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell', description: 'Lie flat, press barbell from chest to lockout.' },
      { id: 'machine-chest-press', name: 'Machine Chest Press', muscle: 'Chest', equipment: 'Machine', description: 'Seated press at chest height on a fixed path.' },
      { id: 'floor-press', name: 'DB Floor Press', muscle: 'Chest', equipment: 'Dumbbells', description: 'Press dumbbells lying on floor for reduced ROM.' },
    ],
  },
  't-bar-row': {
    id: 't-bar-row', name: 'T-Bar Row', muscle: 'Back', equipment: 'Barbell',
    startWeight: 90, increment: 5, targetReps: 10, restSeconds: 90, isCompound: true,
    substitutes: [
      { id: 'barbell-bent-over-row', name: 'Barbell Bent-Over Row', muscle: 'Back', equipment: 'Barbell', description: 'Hinge forward, row barbell to lower chest.' },
      { id: 'chest-supported-row', name: 'Chest-Supported Row', muscle: 'Back', equipment: 'Machine', description: 'Lie face-down on incline bench, row dumbbells up.' },
      { id: 'seated-cable-row', name: 'Seated Cable Row', muscle: 'Back', equipment: 'Cable', description: 'Sit upright, pull cable handle to torso.' },
    ],
  },
  'incline-cable-fly': {
    id: 'incline-cable-fly', name: 'Incline Cable Fly', muscle: 'Upper Chest', equipment: 'Cable',
    startWeight: 25, increment: 2.5, targetReps: 12, restSeconds: 60, isCompound: false,
    substitutes: [
      { id: 'incline-db-fly', name: 'Incline DB Fly', muscle: 'Upper Chest', equipment: 'Dumbbells', description: 'Lie on incline bench, arc dumbbells together.' },
      { id: 'pec-deck', name: 'Pec Deck', muscle: 'Chest', equipment: 'Machine', description: 'Seated fly on a fixed-arc machine.' },
      { id: 'low-to-high-cable-fly', name: 'Low-to-High Cable Fly', muscle: 'Upper Chest', equipment: 'Cable', description: 'Set pulleys low, fly upward to target upper chest.' },
    ],
  },
  'single-arm-db-row': {
    id: 'single-arm-db-row', name: 'Single-Arm DB Row', muscle: 'Back', equipment: 'Dumbbell',
    startWeight: 70, increment: 5, targetReps: 10, restSeconds: 90, isCompound: true,
    substitutes: [
      { id: 'single-arm-cable-row', name: 'Cable Row (Single-Arm)', muscle: 'Back', equipment: 'Cable', description: 'Stand or kneel, pull cable handle with one arm.' },
      { id: 'landmine-row', name: 'Landmine Row', muscle: 'Back', equipment: 'Barbell', description: 'Row the end of a barbell anchored in a landmine.' },
      { id: 'machine-row', name: 'Machine Row', muscle: 'Back', equipment: 'Machine', description: 'Seated row on a plate-loaded or selectorized machine.' },
    ],
  },
  'machine-pec-fly': {
    id: 'machine-pec-fly', name: 'Machine Pec Fly', muscle: 'Chest', equipment: 'Machine',
    startWeight: 115, increment: 5, targetReps: 12, restSeconds: 60, isCompound: false,
    substitutes: [
      { id: 'db-fly', name: 'DB Fly', muscle: 'Chest', equipment: 'Dumbbells', description: 'Lie flat, arc dumbbells together over chest.' },
      { id: 'cable-crossover-sub', name: 'Cable Crossover', muscle: 'Chest', equipment: 'Cable', description: 'High-to-low cable fly for lower chest emphasis.' },
      { id: 'svend-press', name: 'Svend Press', muscle: 'Chest', equipment: 'Plate', description: 'Squeeze a plate between palms and press forward.' },
    ],
  },
  'face-pull': {
    id: 'face-pull', name: 'Face Pull', muscle: 'Rear Delts', equipment: 'Cable',
    startWeight: 40, increment: 2.5, targetReps: 15, restSeconds: 45, isCompound: false,
    substitutes: [
      { id: 'band-pull-apart', name: 'Band Pull-Apart', muscle: 'Rear Delts', equipment: 'Band', description: 'Hold band at arm\'s length, pull apart to chest.' },
      { id: 'reverse-pec-deck', name: 'Reverse Pec Deck', muscle: 'Rear Delts', equipment: 'Machine', description: 'Sit facing the pad, fly arms back.' },
      { id: 'prone-y-raise', name: 'Prone Y-Raise', muscle: 'Rear Delts', equipment: 'Dumbbells', description: 'Lie face-down on incline, raise arms in a Y shape.' },
    ],
  },

  // ---------- Day 2: Quads & Calves ----------
  'leg-press': {
    id: 'leg-press', name: 'Leg Press', muscle: 'Quads', equipment: 'Machine',
    startWeight: 360, increment: 20, targetReps: 10, restSeconds: 120, isCompound: true,
    substitutes: [
      { id: 'barbell-back-squat', name: 'Barbell Back Squat', muscle: 'Quads', equipment: 'Barbell', description: 'Bar on upper back, squat to parallel or below.' },
      { id: 'hack-squat', name: 'Hack Squat', muscle: 'Quads', equipment: 'Machine', description: 'Shoulders under pads, squat on angled sled.' },
      { id: 'smith-machine-squat', name: 'Smith Machine Squat', muscle: 'Quads', equipment: 'Machine', description: 'Squat on a guided barbell path.' },
    ],
  },
  'bulgarian-split-squat': {
    id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscle: 'Quads', equipment: 'Dumbbells',
    startWeight: 40, increment: 5, targetReps: 10, restSeconds: 90, isCompound: true,
    substitutes: [
      { id: 'walking-lunges', name: 'Walking Lunges', muscle: 'Quads', equipment: 'Dumbbells', description: 'Step forward into alternating lunges.' },
      { id: 'reverse-lunge', name: 'Reverse Lunge', muscle: 'Quads', equipment: 'Dumbbells', description: 'Step backward into a lunge, push off front foot.' },
      { id: 'step-back-lunge', name: 'Step-Back Lunge', muscle: 'Quads', equipment: 'Dumbbells', description: 'Stationary reverse lunge alternating legs.' },
    ],
  },
  'leg-extension': {
    id: 'leg-extension', name: 'Leg Extension', muscle: 'Quads', equipment: 'Machine',
    startWeight: 100, increment: 5, targetReps: 12, restSeconds: 60, isCompound: false,
    substitutes: [
      { id: 'sissy-squat', name: 'Sissy Squat', muscle: 'Quads', equipment: 'Bodyweight', description: 'Lean back, bend knees forward to isolate quads.' },
      { id: 'wall-sit', name: 'Wall Sit (Timed)', muscle: 'Quads', equipment: 'Bodyweight', description: 'Hold seated position against a wall for time.' },
      { id: 'terminal-knee-ext', name: 'Terminal Knee Extension', muscle: 'Quads', equipment: 'Band', description: 'Band around knee, extend from partial bend.' },
    ],
  },
  'goblet-squat': {
    id: 'goblet-squat', name: 'Goblet Squat', muscle: 'Quads', equipment: 'Dumbbell',
    startWeight: 50, increment: 5, targetReps: 12, restSeconds: 75, isCompound: true,
    substitutes: [
      { id: 'front-squat', name: 'Front Squat', muscle: 'Quads', equipment: 'Barbell', description: 'Bar on front delts, squat upright.' },
      { id: 'zercher-squat', name: 'Zercher Squat', muscle: 'Quads', equipment: 'Barbell', description: 'Hold bar in elbow crease, squat deep.' },
      { id: 'belt-squat', name: 'Belt Squat', muscle: 'Quads', equipment: 'Machine', description: 'Weight attached to belt, zero spinal load.' },
    ],
  },
  'seated-calf-raise': {
    id: 'seated-calf-raise', name: 'Seated Calf Raise', muscle: 'Calves', equipment: 'Machine',
    startWeight: 90, increment: 5, targetReps: 15, restSeconds: 45, isCompound: false,
    substitutes: [
      { id: 'standing-calf-raise', name: 'Standing Calf Raise', muscle: 'Calves', equipment: 'Machine', description: 'Stand on platform, raise heels with weight on shoulders.' },
      { id: 'leg-press-calf-raise', name: 'Leg Press Calf Raise', muscle: 'Calves', equipment: 'Machine', description: 'Place toes on leg press platform, extend ankles.' },
      { id: 'single-leg-calf-raise', name: 'Single-Leg Calf Raise', muscle: 'Calves', equipment: 'Bodyweight', description: 'One-leg calf raise on a step for full ROM.' },
    ],
  },
  'pallof-press': {
    id: 'pallof-press', name: 'Pallof Press', muscle: 'Core', equipment: 'Cable',
    startWeight: 30, increment: 2.5, targetReps: 12, restSeconds: 45, isCompound: false,
    substitutes: [
      { id: 'dead-bug', name: 'Dead Bug', muscle: 'Core', equipment: 'Bodyweight', description: 'Lie on back, extend opposite arm and leg alternately.' },
      { id: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', muscle: 'Core', equipment: 'Ab Wheel', description: 'Kneel, roll wheel forward and back under control.' },
      { id: 'plank', name: 'Plank', muscle: 'Core', equipment: 'Bodyweight', description: 'Hold rigid body position on forearms and toes.' },
    ],
  },

  // ---------- Day 3: Shoulders & Arms ----------
  'seated-db-ohp': {
    id: 'seated-db-ohp', name: 'Seated DB OHP', muscle: 'Shoulders', equipment: 'Dumbbells',
    startWeight: 50, increment: 5, targetReps: 10, restSeconds: 90, isCompound: true,
    substitutes: [
      { id: 'barbell-ohp', name: 'Barbell OHP', muscle: 'Shoulders', equipment: 'Barbell', description: 'Standing overhead press with a barbell.' },
      { id: 'machine-shoulder-press', name: 'Machine Shoulder Press', muscle: 'Shoulders', equipment: 'Machine', description: 'Seated press on a fixed overhead machine.' },
      { id: 'landmine-press', name: 'Landmine Press', muscle: 'Shoulders', equipment: 'Barbell', description: 'Press the end of a landmine barbell overhead.' },
    ],
  },
  'cable-lateral-raise': {
    id: 'cable-lateral-raise', name: 'Cable Lateral Raise', muscle: 'Side Delts', equipment: 'Cable',
    startWeight: 15, increment: 2.5, targetReps: 15, restSeconds: 45, isCompound: false,
    substitutes: [
      { id: 'db-lateral-raise', name: 'DB Lateral Raise', muscle: 'Side Delts', equipment: 'Dumbbells', description: 'Stand, raise dumbbells to the side to shoulder height.' },
      { id: 'machine-lateral-raise', name: 'Machine Lateral Raise', muscle: 'Side Delts', equipment: 'Machine', description: 'Seated lateral raise on a fixed machine.' },
      { id: 'band-lateral-raise', name: 'Band Lateral Raise', muscle: 'Side Delts', equipment: 'Band', description: 'Step on band, raise arms laterally.' },
    ],
  },
  'incline-db-curl': {
    id: 'incline-db-curl', name: 'Incline DB Curl', muscle: 'Biceps', equipment: 'Dumbbells',
    startWeight: 30, increment: 5, targetReps: 12, restSeconds: 60, isCompound: false,
    substitutes: [
      { id: 'barbell-curl', name: 'Barbell Curl', muscle: 'Biceps', equipment: 'Barbell', description: 'Standing curl with a straight or EZ barbell.' },
      { id: 'preacher-curl', name: 'Preacher Curl', muscle: 'Biceps', equipment: 'EZ-Bar', description: 'Curl over a preacher bench for peak contraction.' },
      { id: 'concentration-curl', name: 'Concentration Curl', muscle: 'Biceps', equipment: 'Dumbbell', description: 'Seated, brace elbow on inner thigh and curl.' },
    ],
  },
  'dip-machine': {
    id: 'dip-machine', name: 'Dip Machine', muscle: 'Triceps', equipment: 'Machine',
    startWeight: 180, increment: 10, targetReps: 10, restSeconds: 90, isCompound: true,
    substitutes: [
      { id: 'close-grip-bench', name: 'Close-Grip Bench', muscle: 'Triceps', equipment: 'Barbell', description: 'Bench press with narrow grip to emphasize triceps.' },
      { id: 'cable-pushdown', name: 'Cable Pushdown', muscle: 'Triceps', equipment: 'Cable', description: 'Push rope or bar attachment down from high pulley.' },
      { id: 'bench-dips', name: 'Bench Dips', muscle: 'Triceps', equipment: 'Bodyweight', description: 'Hands on bench behind you, dip and press up.' },
    ],
  },
  'bayesian-cable-curl': {
    id: 'bayesian-cable-curl', name: 'Bayesian Cable Curl', muscle: 'Biceps', equipment: 'Cable',
    startWeight: 20, increment: 2.5, targetReps: 12, restSeconds: 60, isCompound: false,
    substitutes: [
      { id: 'hammer-curl', name: 'Hammer Curl', muscle: 'Biceps', equipment: 'Dumbbells', description: 'Curl with neutral (palms-in) grip.' },
      { id: 'spider-curl', name: 'Spider Curl', muscle: 'Biceps', equipment: 'Dumbbells', description: 'Lie face-down on incline bench, curl from a hanging position.' },
      { id: 'cable-curl-standard', name: 'Cable Curl (Standard)', muscle: 'Biceps', equipment: 'Cable', description: 'Curl from low pulley facing the stack.' },
    ],
  },
  'ez-bar-skull-crusher': {
    id: 'ez-bar-skull-crusher', name: 'EZ-Bar Skull Crusher', muscle: 'Triceps', equipment: 'EZ-Bar',
    startWeight: 55, increment: 5, targetReps: 12, restSeconds: 60, isCompound: false,
    substitutes: [
      { id: 'db-skull-crusher', name: 'DB Skull Crusher', muscle: 'Triceps', equipment: 'Dumbbells', description: 'Lying extension with dumbbells for independent arms.' },
      { id: 'overhead-cable-ext', name: 'Overhead Cable Extension', muscle: 'Triceps', equipment: 'Cable', description: 'Face away from cable, extend rope overhead.' },
      { id: 'kickbacks', name: 'Kickbacks', muscle: 'Triceps', equipment: 'Dumbbells', description: 'Hinge forward, extend arm straight back.' },
    ],
  },
  'rear-delt-cable-fly': {
    id: 'rear-delt-cable-fly', name: 'Rear Delt Cable Fly', muscle: 'Rear Delts', equipment: 'Cable',
    startWeight: 15, increment: 2.5, targetReps: 15, restSeconds: 45, isCompound: false,
    substitutes: [
      { id: 'face-pull-rear', name: 'Face Pull (Rear Focus)', muscle: 'Rear Delts', equipment: 'Cable', description: 'Pull rope to face with elbows high, squeeze rear delts.' },
      { id: 'reverse-pec-deck-2', name: 'Reverse Pec Deck', muscle: 'Rear Delts', equipment: 'Machine', description: 'Sit facing the pad, fly arms back.' },
      { id: 'band-pull-apart-2', name: 'Band Pull-Apart', muscle: 'Rear Delts', equipment: 'Band', description: 'Hold band at arm\'s length, pull apart to chest.' },
    ],
  },

  // ---------- Day 4: Chest & Back (Angles) ----------
  'low-incline-db-press': {
    id: 'low-incline-db-press', name: 'Low-Incline DB Press', muscle: 'Upper Chest', equipment: 'Dumbbells',
    startWeight: 60, increment: 5, targetReps: 10, restSeconds: 90, isCompound: true,
    substitutes: [
      { id: 'incline-barbell-press', name: 'Incline Barbell Press', muscle: 'Upper Chest', equipment: 'Barbell', description: 'Press barbell on a 30-45 degree incline bench.' },
      { id: 'landmine-press-chest', name: 'Landmine Press', muscle: 'Upper Chest', equipment: 'Barbell', description: 'Press the end of a landmine barbell from chest.' },
      { id: 'incline-smith-press', name: 'Incline Smith Press', muscle: 'Upper Chest', equipment: 'Machine', description: 'Incline press on a Smith machine for stability.' },
    ],
  },
  'wide-grip-pulldown': {
    id: 'wide-grip-pulldown', name: 'Wide-Grip Pulldown', muscle: 'Back', equipment: 'Cable',
    startWeight: 120, increment: 5, targetReps: 10, restSeconds: 90, isCompound: true,
    substitutes: [
      { id: 'pull-ups', name: 'Pull-Ups', muscle: 'Back', equipment: 'Bodyweight', description: 'Hang from bar, pull chin over with wide grip.' },
      { id: 'neutral-grip-pulldown', name: 'Neutral-Grip Pulldown', muscle: 'Back', equipment: 'Cable', description: 'Pulldown with palms facing each other.' },
      { id: 'straight-arm-pulldown-sub', name: 'Straight-Arm Pulldown', muscle: 'Back', equipment: 'Cable', description: 'Arms straight, pull bar from overhead to thighs.' },
    ],
  },
  'cable-crossover': {
    id: 'cable-crossover', name: 'Cable Crossover', muscle: 'Chest', equipment: 'Cable',
    startWeight: 20, increment: 2.5, targetReps: 12, restSeconds: 60, isCompound: false,
    substitutes: [
      { id: 'db-fly-flat', name: 'DB Fly', muscle: 'Chest', equipment: 'Dumbbells', description: 'Flat bench dumbbell fly with a controlled arc.' },
      { id: 'machine-pec-fly-sub', name: 'Machine Pec Fly', muscle: 'Chest', equipment: 'Machine', description: 'Seated fly on a fixed-arc machine.' },
      { id: 'standing-plate-squeeze', name: 'Standing Plate Squeeze', muscle: 'Chest', equipment: 'Plate', description: 'Squeeze plate between palms, press forward and back.' },
    ],
  },
  'meadows-row': {
    id: 'meadows-row', name: 'Meadows Row', muscle: 'Back', equipment: 'Barbell',
    startWeight: 50, increment: 5, targetReps: 10, restSeconds: 90, isCompound: true,
    substitutes: [
      { id: 'pendlay-row', name: 'Pendlay Row', muscle: 'Back', equipment: 'Barbell', description: 'Explosive row from dead stop on the floor each rep.' },
      { id: 'seal-row', name: 'Seal Row', muscle: 'Back', equipment: 'Dumbbells', description: 'Lie face-down on elevated bench, row dumbbells from hang.' },
      { id: 'chest-supported-db-row', name: 'Chest-Supported DB Row', muscle: 'Back', equipment: 'Dumbbells', description: 'Lie on incline bench, row dumbbells with chest support.' },
    ],
  },
  'push-up': {
    id: 'push-up', name: 'Push-Up (Banded)', muscle: 'Chest', equipment: 'Bodyweight',
    startWeight: 0, increment: 0, targetReps: 15, restSeconds: 60, isCompound: true, isBW: true,
    substitutes: [
      { id: 'diamond-push-up', name: 'Diamond Push-Up', muscle: 'Chest', equipment: 'Bodyweight', description: 'Hands close together in a diamond shape under chest.' },
      { id: 'deficit-push-up', name: 'Deficit Push-Up', muscle: 'Chest', equipment: 'Bodyweight', description: 'Hands elevated on blocks for deeper ROM.' },
      { id: 'db-squeeze-press', name: 'DB Squeeze Press', muscle: 'Chest', equipment: 'Dumbbells', description: 'Press dumbbells together throughout the press.' },
    ],
  },
  'straight-arm-pulldown': {
    id: 'straight-arm-pulldown', name: 'Straight-Arm Pulldown', muscle: 'Back', equipment: 'Cable',
    startWeight: 50, increment: 5, targetReps: 12, restSeconds: 60, isCompound: false,
    substitutes: [
      { id: 'db-pullover', name: 'Pullover (DB)', muscle: 'Back', equipment: 'Dumbbell', description: 'Lie on bench, arc dumbbell overhead and back.' },
      { id: 'cable-pullover', name: 'Cable Pullover', muscle: 'Back', equipment: 'Cable', description: 'Lie on bench with cable, pull from overhead.' },
      { id: 'banded-straight-arm', name: 'Banded Straight-Arm Pulldown', muscle: 'Back', equipment: 'Band', description: 'Anchor band high, pull down with straight arms.' },
    ],
  },

  // ---------- Day 5: Hams, Glutes & Core ----------
  'barbell-glute-bridge': {
    id: 'barbell-glute-bridge', name: 'Barbell Glute Bridge', muscle: 'Glutes', equipment: 'Barbell',
    startWeight: 225, increment: 10, targetReps: 10, restSeconds: 120, isCompound: true,
    substitutes: [
      { id: 'hip-thrust-bench', name: 'Hip Thrust (Bench)', muscle: 'Glutes', equipment: 'Barbell', description: 'Upper back on bench, thrust barbell up at hips.' },
      { id: 'smith-hip-thrust', name: 'Smith Machine Hip Thrust', muscle: 'Glutes', equipment: 'Machine', description: 'Hip thrust using Smith machine for stability.' },
      { id: 'banded-glute-bridge', name: 'Banded Glute Bridge', muscle: 'Glutes', equipment: 'Band', description: 'Glute bridge with band around knees for abduction.' },
    ],
  },
  'lying-leg-curl': {
    id: 'lying-leg-curl', name: 'Lying Leg Curl', muscle: 'Hamstrings', equipment: 'Machine',
    startWeight: 90, increment: 5, targetReps: 12, restSeconds: 60, isCompound: false,
    substitutes: [
      { id: 'seated-leg-curl', name: 'Seated Leg Curl', muscle: 'Hamstrings', equipment: 'Machine', description: 'Curl legs under pad while seated.' },
      { id: 'swiss-ball-curl', name: 'Swiss Ball Curl', muscle: 'Hamstrings', equipment: 'Swiss Ball', description: 'Lie on back, feet on ball, curl ball toward glutes.' },
      { id: 'slider-leg-curl', name: 'Slider Leg Curl', muscle: 'Hamstrings', equipment: 'Sliders', description: 'Lie on back, slide feet out and curl back.' },
    ],
  },
  'db-step-up': {
    id: 'db-step-up', name: 'DB Step-Up', muscle: 'Glutes', equipment: 'Dumbbells',
    startWeight: 35, increment: 5, targetReps: 10, restSeconds: 90, isCompound: true,
    substitutes: [
      { id: 'reverse-lunge-glute', name: 'Reverse Lunge', muscle: 'Glutes', equipment: 'Dumbbells', description: 'Step backward into a lunge, drive through front heel.' },
      { id: 'single-leg-hip-thrust', name: 'Hip Thrust (Single-Leg)', muscle: 'Glutes', equipment: 'Bodyweight', description: 'Hip thrust one leg at a time for isolation.' },
      { id: 'cable-kickback', name: 'Cable Kickback', muscle: 'Glutes', equipment: 'Cable', description: 'Ankle strap on cable, kick leg straight back.' },
    ],
  },
  'nordic-ham-curl': {
    id: 'nordic-ham-curl', name: 'Nordic Ham Curl', muscle: 'Hamstrings', equipment: 'Bodyweight',
    startWeight: 0, increment: 0, targetReps: 10, restSeconds: 90, isCompound: true, isBW: true,
    substitutes: [
      { id: 'razor-curl', name: 'Razor Curl', muscle: 'Hamstrings', equipment: 'Bodyweight', description: 'Kneeling hip-hinge curl with hands ready to catch.' },
      { id: 'banded-good-morning', name: 'Banded Good Morning', muscle: 'Hamstrings', equipment: 'Band', description: 'Band around neck, hinge forward at hips.' },
      { id: 'slider-leg-curl-2', name: 'Slider Leg Curl', muscle: 'Hamstrings', equipment: 'Sliders', description: 'Lie on back, slide feet out and curl back.' },
    ],
  },
  'cable-pull-through': {
    id: 'cable-pull-through', name: 'Cable Pull-Through', muscle: 'Glutes', equipment: 'Cable',
    startWeight: 60, increment: 5, targetReps: 12, restSeconds: 60, isCompound: false,
    substitutes: [
      { id: 'kb-swing', name: 'KB Swing', muscle: 'Glutes', equipment: 'Kettlebell', description: 'Explosive hip hinge swinging a kettlebell.' },
      { id: 'banded-pull-through', name: 'Banded Pull-Through', muscle: 'Glutes', equipment: 'Band', description: 'Pull-through with band anchored behind you.' },
      { id: 'romanian-deadlift', name: 'Romanian Deadlift', muscle: 'Glutes', equipment: 'Barbell', description: 'Hinge at hips, lower barbell along legs.' },
    ],
  },
  'cable-crunch': {
    id: 'cable-crunch', name: 'Cable Crunch', muscle: 'Core', equipment: 'Cable',
    startWeight: 70, increment: 5, targetReps: 15, restSeconds: 45, isCompound: false,
    substitutes: [
      { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscle: 'Core', equipment: 'Bodyweight', description: 'Hang from bar, raise legs to parallel or higher.' },
      { id: 'ab-wheel-rollout-2', name: 'Ab Wheel Rollout', muscle: 'Core', equipment: 'Ab Wheel', description: 'Kneel, roll wheel forward and back under control.' },
      { id: 'weighted-plank', name: 'Weighted Plank', muscle: 'Core', equipment: 'Plate', description: 'Hold plank position with plate on upper back.' },
    ],
  },
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
