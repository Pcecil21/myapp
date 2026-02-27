import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { PROGRAM, SPLIT, PHASES, getPhaseForWeek, getWeekSchedule, getTargetWeight, getSetsForExercise, getAllExercises } from '../lib/workoutProgram'
import RestTimer from '../components/RestTimer'
import ReadinessCheckin from '../components/ReadinessCheckin'
import SwapModal from '../components/SwapModal'

export default function Workouts() {
  const { user } = useAuth()
  const [week, setWeek] = useState(1)
  const [selectedDay, setSelectedDay] = useState(0)
  const [entries, setEntries] = useState({})
  const [saving, setSaving] = useState(false)
  const [showReadiness, setShowReadiness] = useState(false)
  const [readiness, setReadiness] = useState(null)
  const [readinessChecked, setReadinessChecked] = useState(false)
  const [swaps, setSwaps] = useState({})          // { originalExerciseId: { substitute_exercise_id, substitute_name } }
  const [swapModalExercise, setSwapModalExercise] = useState(null)
  const today = format(new Date(), 'yyyy-MM-dd')
  const phase = getPhaseForWeek(week)
  const schedule = getWeekSchedule(week)

  useEffect(() => { if (user) checkReadiness() }, [user])
  useEffect(() => { if (user) loadEntries() }, [user, week])
  useEffect(() => { if (user) loadSwaps() }, [user])

  async function checkReadiness() {
    const { data } = await supabase.from('readiness_entries').select('*')
      .eq('user_id', user.id).eq('date', today).maybeSingle()
    if (data) { setReadiness(data.score); setReadinessChecked(true) }
    else { setShowReadiness(true); setReadinessChecked(true) }
  }

  async function loadEntries() {
    const { data } = await supabase.from('workout_entries').select('*')
      .eq('user_id', user.id).eq('week_number', week).eq('date', today)
    if (data) {
      const map = {}
      data.forEach(e => { map[`${e.exercise_name}-${e.set_number}`] = e })
      setEntries(map)
    }
  }

  async function loadSwaps() {
    const { data } = await supabase.from('exercise_swaps').select('*')
      .eq('user_id', user.id)
    if (data) {
      const map = {}
      data.forEach(s => { map[s.original_exercise_id] = s })
      setSwaps(map)
    }
  }

  async function handleSwap(originalId, substitute) {
    const { error } = await supabase.from('exercise_swaps').upsert({
      user_id: user.id,
      original_exercise_id: originalId,
      substitute_exercise_id: substitute.id,
      substitute_name: substitute.name,
    }, { onConflict: 'user_id,original_exercise_id' })
    if (!error) {
      setSwaps(prev => ({ ...prev, [originalId]: { substitute_exercise_id: substitute.id, substitute_name: substitute.name } }))
    }
    setSwapModalExercise(null)
  }

  async function handleResetSwap(originalId) {
    await supabase.from('exercise_swaps').delete()
      .eq('user_id', user.id).eq('original_exercise_id', originalId)
    setSwaps(prev => {
      const next = { ...prev }
      delete next[originalId]
      return next
    })
    setSwapModalExercise(null)
  }

  /** Resolve an exercise — apply swap if one exists, inheriting original's progression */
  function resolveExercise(original) {
    const swap = swaps[original.id]
    if (!swap) return original
    // Find the substitute definition from the original's substitutes array
    const subDef = original.substitutes?.find(s => s.id === swap.substitute_exercise_id)
    return {
      ...original,
      // Override display fields from substitute
      name: subDef?.name || swap.substitute_name,
      muscle: subDef?.muscle || original.muscle,
      equipment: subDef?.equipment || original.equipment,
      description: subDef?.description || '',
      // Keep original's id so we can still find the swap mapping
      _originalId: original.id,
      _isSwapped: true,
    }
  }

  async function toggleSet(exercise, setNum, dayName) {
    const key = `${exercise.name}-${setNum}`
    const existing = entries[key]
    setSaving(true)
    if (existing) {
      await supabase.from('workout_entries').update({ completed: !existing.completed }).eq('id', existing.id)
    } else {
      await supabase.from('workout_entries').insert({
        user_id: user.id, exercise_name: exercise.name, day_name: dayName,
        week_number: week, set_number: setNum,
        weight: exercise.isBW ? 0 : exercise.weight,
        reps: exercise.targetReps, completed: true, date: today,
      })
    }
    await loadEntries()
    setSaving(false)
  }

  async function updateEntry(exercise, setNum, field, value, dayName) {
    const key = `${exercise.name}-${setNum}`
    const existing = entries[key]
    if (existing) {
      await supabase.from('workout_entries').update({ [field]: Number(value) || 0 }).eq('id', existing.id)
    } else {
      await supabase.from('workout_entries').insert({
        user_id: user.id, exercise_name: exercise.name, day_name: dayName,
        week_number: week, set_number: setNum,
        weight: field === 'weight' ? Number(value) || 0 : (exercise.isBW ? 0 : exercise.weight),
        reps: field === 'reps' ? Number(value) || 0 : exercise.targetReps,
        completed: false, date: today,
      })
    }
    await loadEntries()
  }

  if (!readinessChecked) return null
  if (showReadiness) return <ReadinessCheckin onComplete={(score) => { setReadiness(score); setShowReadiness(false) }} />
  if (!schedule) return null
  const day = schedule[selectedDay]

  // Apply swaps to today's exercises
  const resolvedExercises = day.exercises.map(resolveExercise)

  return (
    <div className="px-5 pt-8 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Workouts</h1>
        {readiness !== null && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            readiness <= 2 ? 'bg-red-500/15 text-red-400' :
            readiness <= 3 ? 'bg-amber-500/15 text-amber-400' :
            readiness <= 4 ? 'bg-blue-500/15 text-blue-400' :
            'bg-emerald-500/15 text-emerald-400'
          }`}>
            Readiness {readiness}
          </span>
        )}
      </div>
      <p className="text-slate-500 text-sm mb-5">
        Phase {phase.phase}: {phase.name} &middot; RPE {phase.rpe}
      </p>

      {/* Week pills */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {[1,2,3,4,5,6,7,8].map(w => (
          <button key={w} onClick={() => setWeek(w)}
            className={`flex-shrink-0 w-11 h-11 rounded-2xl text-sm font-bold transition-all duration-200 ${
              week === w ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-surface text-slate-500 border border-surface-border hover:text-white'
            }`}>
            {w}
          </button>
        ))}
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {schedule.map((d, i) => {
          const dayExercises = d.exercises.map(resolveExercise)
          const dayEntries = dayExercises.reduce((sum, ex) => {
            const sets = Array.from({ length: ex.sets }, (_, s) => s + 1)
            return sum + sets.filter(s => entries[`${ex.name}-${s}`]?.completed).length
          }, 0)
          const totalSets = dayExercises.reduce((sum, ex) => sum + ex.sets, 0)
          return (
            <button key={i} onClick={() => setSelectedDay(i)}
              className={`flex-shrink-0 px-4 py-3 rounded-2xl transition-all duration-200 text-left ${
                selectedDay === i ? 'bg-surface-elevated border border-accent/30' : 'bg-surface border border-surface-border'
              }`}>
              <p className={`text-xs font-bold ${selectedDay === i ? 'text-accent' : 'text-slate-400'}`}>Day {d.dayNumber}</p>
              <p className={`text-[11px] mt-0.5 ${selectedDay === i ? 'text-slate-300' : 'text-slate-600'}`}>
                {d.name.split('(')[0].trim()}
              </p>
              {dayEntries > 0 && (
                <p className="text-[10px] text-accent mt-1">{dayEntries}/{totalSets}</p>
              )}
            </button>
          )
        })}
      </div>

      {/* Exercise cards */}
      <div className="space-y-4 mb-8">
        {resolvedExercises.map((exercise) => (
          <ExerciseCard key={exercise._originalId || exercise.id} exercise={exercise} week={week} dayName={day.name}
            entries={entries} onToggle={toggleSet} onUpdate={updateEntry} saving={saving}
            onSwapClick={() => {
              // Pass the original PROGRAM exercise (with substitutes) to the modal
              const origId = exercise._originalId || exercise.id
              setSwapModalExercise(PROGRAM[origId])
            }}
            isSwapped={!!exercise._isSwapped} />
        ))}
      </div>

      {/* Swap modal */}
      {swapModalExercise && (
        <SwapModal
          exercise={swapModalExercise}
          isSwapped={!!swaps[swapModalExercise.id]}
          onSwap={handleSwap}
          onReset={handleResetSwap}
          onClose={() => setSwapModalExercise(null)}
        />
      )}
    </div>
  )
}

function ExerciseCard({ exercise, week, dayName, entries, onToggle, onUpdate, saving, onSwapClick, isSwapped }) {
  const [showProgress, setShowProgress] = useState(false)
  const sets = Array.from({ length: exercise.sets }, (_, i) => i + 1)
  const completedCount = sets.filter(s => entries[`${exercise.name}-${s}`]?.completed).length
  const allDone = completedCount === exercise.sets
  const targetDisplay = exercise.isBW ? 'BW' : `${exercise.weight} lbs`

  return (
    <div className={`bg-surface rounded-3xl p-5 border transition-all duration-300 ${allDone ? 'border-success/30' : 'border-surface-border'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[15px] truncate">{exercise.name}</h3>
            {isSwapped && (
              <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md bg-accent/15 text-accent text-[9px] font-bold uppercase tracking-wider">
                Swapped
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-0.5">{exercise.muscle} &middot; {exercise.equipment}</p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          {/* Swap button */}
          <button onClick={onSwapClick} title="Swap exercise"
            className="w-8 h-8 rounded-xl bg-surface-elevated flex items-center justify-center text-slate-500 hover:text-accent transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </button>
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
            allDone ? 'bg-success/15 text-success' : 'bg-surface-elevated text-slate-500'
          }`}>
            {completedCount}/{exercise.sets}
          </div>
        </div>
      </div>

      {/* Target row */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 mt-2">
        <span className="bg-surface-elevated px-2 py-1 rounded-lg font-medium">{targetDisplay} x {exercise.targetReps}</span>
        <span className="bg-surface-elevated px-2 py-1 rounded-lg font-medium">Rest {exercise.restSeconds}s</span>
        <button onClick={() => setShowProgress(p => !p)}
          className="ml-auto text-accent text-[11px] font-semibold hover:text-accent-light transition-colors min-h-[28px] flex items-center">
          {showProgress ? 'Hide' : 'Progress'}
        </button>
      </div>

      {/* Progress inline */}
      {showProgress && (
        <div className="mb-4 bg-base rounded-2xl p-3">
          <p className="text-[10px] text-slate-600 mb-2 uppercase tracking-wider font-semibold">Target by Week</p>
          <div className="flex gap-1">
            {[1,2,3,4,5,6,7,8].map(w => {
              const wt = getTargetWeight(exercise, w)
              return (
                <div key={w} className={`flex-1 text-center py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  w === week ? 'bg-accent text-white' : 'bg-surface text-slate-500'
                }`}>
                  <div className="text-[9px] opacity-60">W{w}</div>
                  <div>{wt}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Sets */}
      <div className="space-y-2.5">
        {sets.map(setNum => {
          const key = `${exercise.name}-${setNum}`
          const entry = entries[key]
          const completed = entry?.completed

          return (
            <div key={setNum} className="flex items-center gap-2.5">
              {/* Tap-to-complete circle */}
              <button onClick={() => onToggle(exercise, setNum, dayName)} disabled={saving}
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 min-w-[40px] ${
                  completed ? 'bg-success text-white shadow-md shadow-success/20' : 'bg-surface-elevated text-slate-600 hover:text-white active:scale-90'
                }`}>
                {completed ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">{setNum}</span>
                )}
              </button>

              {/* Inputs */}
              <div className="flex-1 flex gap-2">
                <div className="flex-1 relative">
                  <input type="number"
                    placeholder={exercise.isBW ? 'BW' : String(exercise.weight)}
                    value={entry?.weight || ''}
                    onChange={e => onUpdate(exercise, setNum, 'weight', e.target.value, dayName)}
                    className="w-full px-3 py-2.5 bg-base border border-surface-border rounded-xl text-white text-sm text-center focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all" />
                  <span className="absolute right-2 top-3 text-[10px] text-slate-600">lbs</span>
                </div>
                <div className="flex-1 relative">
                  <input type="number"
                    placeholder={String(exercise.targetReps)}
                    value={entry?.reps || ''}
                    onChange={e => onUpdate(exercise, setNum, 'reps', e.target.value, dayName)}
                    className="w-full px-3 py-2.5 bg-base border border-surface-border rounded-xl text-white text-sm text-center focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all" />
                  <span className="absolute right-2 top-3 text-[10px] text-slate-600">reps</span>
                </div>
              </div>

              {completed && <RestTimer seconds={exercise.restSeconds} autoStart />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
