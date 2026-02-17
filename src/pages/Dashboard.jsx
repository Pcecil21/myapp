import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { scoreBadge } from '../components/ReadinessCheckin'

export default function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [meals, setMeals] = useState([])
  const [workoutEntries, setWorkoutEntries] = useState([])
  const [readiness, setReadiness] = useState(null)
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  async function loadData() {
    const [profileRes, mealsRes, workoutRes, readinessRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('meals').select('*').eq('user_id', user.id).eq('date', today),
      supabase.from('workout_entries').select('*').eq('user_id', user.id).eq('date', today),
      supabase.from('readiness_entries').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
    ])
    if (profileRes.data) setProfile(profileRes.data)
    if (mealsRes.data) setMeals(mealsRes.data)
    if (workoutRes.data) setWorkoutEntries(workoutRes.data)
    if (readinessRes.data) setReadiness(readinessRes.data)
  }

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + Number(m.protein || 0),
      carbs: acc.carbs + Number(m.carbs || 0),
      fat: acc.fat + Number(m.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const goals = profile || { calorie_goal: 2000, protein_goal: 150, carbs_goal: 250, fat_goal: 65 }

  const completedSets = workoutEntries.filter(e => e.completed).length
  const todayDayName = workoutEntries.length > 0 ? workoutEntries[0].day_name : null

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-slate-400 text-sm mb-6">{format(new Date(), 'EEEE, MMMM d')}</p>

      {/* Calorie Ring */}
      <div className="bg-navy-800 rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-6">
          <CalorieRing eaten={totals.calories} goal={goals.calorie_goal} />
          <div className="flex-1">
            <p className="text-sm text-slate-400 mb-1">Calories</p>
            <p className="text-3xl font-bold">{totals.calories}</p>
            <p className="text-sm text-slate-400">of {goals.calorie_goal} kcal</p>
          </div>
        </div>
      </div>

      {/* Readiness Score */}
      {readiness && (
        <div className="bg-navy-800 rounded-2xl p-5 mb-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Daily Readiness
          </h2>
          <div className="flex items-center gap-4">
            <span className={`${scoreBadge(readiness.score).color} text-white text-lg font-bold px-4 py-2 rounded-xl`}>
              {readiness.score}
            </span>
            <div className="flex-1">
              <p className="font-medium">{scoreBadge(readiness.score).text}</p>
              <div className="flex gap-3 mt-1 text-xs text-slate-400">
                <span>Sleep {readiness.sleep}</span>
                <span>Stress {readiness.stress}</span>
                <span>Energy {readiness.energy}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Macros */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <MacroCard label="Protein" value={Math.round(totals.protein)} goal={goals.protein_goal} color="bg-blue-500" unit="g" />
        <MacroCard label="Carbs" value={Math.round(totals.carbs)} goal={goals.carbs_goal} color="bg-amber-500" unit="g" />
        <MacroCard label="Fat" value={Math.round(totals.fat)} goal={goals.fat_goal} color="bg-rose-500" unit="g" />
      </div>

      {/* Workout Status */}
      <div className="bg-navy-800 rounded-2xl p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h2.25m13.5 0H21m-3.75 0V4.875c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125V7.5m3.75 0h-3.75m-6 0V4.875c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125V7.5m3.75 0h-3.75M3 16.5h2.25m13.5 0H21m-3.75 0v2.625c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 01-1.125-1.125V16.5m3.75 0h-3.75m-6 0v2.625c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 01-1.125-1.125V16.5m3.75 0h-3.75M3 12h18" />
          </svg>
          Today's Workout
        </h2>
        {todayDayName ? (
          <div>
            <p className="text-white font-medium">{todayDayName}</p>
            <p className="text-sm text-slate-400">{completedSets} sets completed</p>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No workout logged yet today. Hit the Workouts tab to start!</p>
        )}
      </div>
    </div>
  )
}

function CalorieRing({ eaten, goal }) {
  const pct = Math.min((eaten / goal) * 100, 100)
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const color = pct >= 100 ? '#22c55e' : pct >= 75 ? '#f59e0b' : '#3b82f6'

  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#334155" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
        {Math.round(pct)}%
      </span>
    </div>
  )
}

function MacroCard({ label, value, goal, color, unit }) {
  const pct = Math.min((value / goal) * 100, 100)
  return (
    <div className="bg-navy-800 rounded-2xl p-4">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      <p className="text-xl font-bold">{value}<span className="text-sm text-slate-400 font-normal">{unit}</span></p>
      <div className="w-full bg-navy-700 rounded-full h-1.5 mt-2">
        <div className={`${color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-slate-500 mt-1">{goal}{unit} goal</p>
    </div>
  )
}
