import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { SPLIT, PHASES, getPhaseForWeek, getWeekSchedule, getTargetWeight, getAllExercises } from '../lib/workoutProgram'
import RestTimer from '../components/RestTimer'
import ReadinessCheckin from '../components/ReadinessCheckin'

export default function Workouts() {
  const { user } = useAuth()
  const [week, setWeek] = useState(1)
  const [selectedDay, setSelectedDay] = useState(0)
  const [entries, setEntries] = useState({})
  const [saving, setSaving] = useState(false)
  const [showReadiness, setShowReadiness] = useState(false)
  const [readiness, setReadiness] = useState(null)
  const [readinessChecked, setReadinessChecked] = useState(false)
  const today = format(new Date(), 'yyyy-MM-dd')
  const phase = getPhaseForWeek(week)
  const schedule = getWeekSchedule(week)

  // Check readiness on mount
  useEffect(() => {
    if (!user) return
    checkReadiness()
  }, [user])

  useEffect(() => { if (user) loadEntries() }, [user, week])

  async function checkReadiness() {
    const { data } = await supabase
      .from('readiness_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()
    if (data) {
      setReadiness(data.score)
      setReadinessChecked(true)
    } else {
      setShowReadiness(true)
      setReadinessChecked(true)
    }
  }

  async function loadEntries() {
    const { data } = await supabase
      .from('workout_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_number', week)
      .eq('date', today)
    if (data) {
      const map = {}
      data.forEach(e => {
        const key = `${e.exercise_name}-${e.set_number}`
        map[key] = e
      })
      setEntries(map)
    }
  }

  async function toggleSet(exercise, setNum, dayName) {
    const key = `${exercise.name}-${setNum}`
    const existing = entries[key]
    setSaving(true)

    if (existing) {
      if (existing.completed) {
        await supabase.from('workout_entries').update({ completed: false }).eq('id', existing.id)
      } else {
        await supabase.from('workout_entries').update({ completed: true }).eq('id', existing.id)
      }
    } else {
      await supabase.from('workout_entries').insert({
        user_id: user.id,
        exercise_name: exercise.name,
        day_name: dayName,
        week_number: week,
        set_number: setNum,
        weight: exercise.isBW ? 0 : exercise.weight,
        reps: exercise.targetReps,
        completed: true,
        date: today,
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
        user_id: user.id,
        exercise_name: exercise.name,
        day_name: dayName,
        week_number: week,
        set_number: setNum,
        weight: field === 'weight' ? Number(value) || 0 : (exercise.isBW ? 0 : exercise.weight),
        reps: field === 'reps' ? Number(value) || 0 : exercise.targetReps,
        completed: false,
        date: today,
      })
    }
    await loadEntries()
  }

  if (!readinessChecked) return null

  // Show readiness modal before anything else
  if (showReadiness) {
    return (
      <ReadinessCheckin
        onComplete={(score) => {
          setReadiness(score)
          setShowReadiness(false)
        }}
      />
    )
  }

  if (!schedule) return null
  const day = schedule[selectedDay]

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1">Workouts</h1>
      <p className="text-slate-400 text-sm mb-4">
        Week {week} &middot; Phase {phase.phase}: {phase.name} &middot; RPE {phase.rpe}
        {readiness !== null && (
          <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
            readiness <= 2 ? 'bg-red-500/20 text-red-400' :
            readiness <= 3 ? 'bg-amber-500/20 text-amber-400' :
            readiness <= 4 ? 'bg-blue-500/20 text-blue-400' :
            'bg-green-500/20 text-green-400'
          }`}>
            Readiness {readiness}
          </span>
        )}
      </p>

      {/* Week Selector */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {[1,2,3,4,5,6,7,8].map(w => (
          <button
            key={w}
            onClick={() => setWeek(w)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              week === w ? 'bg-accent text-white' : 'bg-navy-800 text-slate-400 hover:text-white'
            }`}
          >
            W{w}
          </button>
        ))}
      </div>

      {/* Day Tabs */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        {schedule.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={`flex-shrink-0 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              selectedDay === i ? 'bg-navy-700 text-white' : 'bg-navy-800 text-slate-400'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* Phase Info */}
      <div className="bg-navy-800 rounded-xl p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Phase {phase.phase}</p>
          <p className="font-semibold">{phase.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">RPE Target</p>
          <p className="font-semibold">{phase.rpe}</p>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4 mb-8">
        {day.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            week={week}
            dayName={day.name}
            entries={entries}
            onToggle={toggleSet}
            onUpdate={updateEntry}
            saving={saving}
          />
        ))}
      </div>
    </div>
  )
}

function ExerciseCard({ exercise, week, dayName, entries, onToggle, onUpdate, saving }) {
  const [showProgress, setShowProgress] = useState(false)
  const sets = Array.from({ length: exercise.sets }, (_, i) => i + 1)
  const completedCount = sets.filter(s => entries[`${exercise.name}-${s}`]?.completed).length
  const targetDisplay = exercise.isBW ? 'BW' : `${exercise.weight} lbs`

  return (
    <div className="bg-navy-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold">{exercise.name}</h3>
          <p className="text-xs text-slate-400">{exercise.muscle} &middot; {exercise.equipment}</p>
        </div>
        <span className="text-xs bg-navy-700 px-2.5 py-1 rounded-full text-slate-300">
          {completedCount}/{exercise.sets}
        </span>
      </div>

      {/* Target info row */}
      <div className="flex gap-3 text-xs text-slate-400 mb-3">
        <span>Target: {targetDisplay} x {exercise.targetReps}</span>
        <span>Rest: {exercise.restSeconds}s</span>
        <button
          onClick={() => setShowProgress(p => !p)}
          className="ml-auto text-accent hover:text-blue-400 transition-colors"
        >
          {showProgress ? 'Hide' : 'Progress'}
        </button>
      </div>

      {/* Inline progress: weight by week */}
      {showProgress && (
        <div className="mb-3 bg-navy-900 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 mb-1.5 uppercase tracking-wide">Target Weight by Week</p>
          <div className="flex gap-1">
            {[1,2,3,4,5,6,7,8].map(w => {
              const wt = getTargetWeight(exercise, w)
              return (
                <div
                  key={w}
                  className={`flex-1 text-center py-1 rounded text-xs ${
                    w === week ? 'bg-accent text-white font-bold' : 'bg-navy-800 text-slate-400'
                  }`}
                >
                  <div className="text-[9px]">W{w}</div>
                  <div>{wt}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sets.map(setNum => {
          const key = `${exercise.name}-${setNum}`
          const entry = entries[key]
          const completed = entry?.completed

          return (
            <div key={setNum} className="flex items-center gap-2">
              <button
                onClick={() => onToggle(exercise, setNum, dayName)}
                disabled={saving}
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  completed ? 'bg-success text-white' : 'bg-navy-700 text-slate-500'
                }`}
              >
                {completed ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">{setNum}</span>
                )}
              </button>

              <div className="flex-1 flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    placeholder={exercise.isBW ? 'BW' : String(exercise.weight)}
                    value={entry?.weight || ''}
                    onChange={e => onUpdate(exercise, setNum, 'weight', e.target.value, dayName)}
                    className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <span className="absolute right-2 top-2.5 text-[10px] text-slate-500">lbs</span>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    placeholder={String(exercise.targetReps)}
                    value={entry?.reps || ''}
                    onChange={e => onUpdate(exercise, setNum, 'reps', e.target.value, dayName)}
                    className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <span className="absolute right-2 top-2.5 text-[10px] text-slate-500">reps</span>
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
