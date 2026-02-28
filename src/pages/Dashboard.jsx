import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { scoreBadge } from '../components/ReadinessCheckin'
import { getTodayWhoopData, getWhoopConnection, syncWhoopData } from '../lib/whoop'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [meals, setMeals] = useState([])
  const [workoutEntries, setWorkoutEntries] = useState([])
  const [readiness, setReadiness] = useState(null)
  const [latestWeight, setLatestWeight] = useState(null)
  const [whoopData, setWhoopData] = useState(null)
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => { if (user) loadData() }, [user])

  async function loadData() {
    const [profileRes, mealsRes, workoutRes, readinessRes, weightRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('meals').select('*').eq('user_id', user.id).eq('date', today),
      supabase.from('workout_entries').select('*').eq('user_id', user.id).eq('date', today),
      supabase.from('readiness_entries').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
      supabase.from('body_weight_entries').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(1).maybeSingle(),
    ])
    if (profileRes.data) setProfile(profileRes.data)
    if (mealsRes.data) setMeals(mealsRes.data)
    if (workoutRes.data) setWorkoutEntries(workoutRes.data)
    if (readinessRes.data) setReadiness(readinessRes.data)
    if (weightRes.data) setLatestWeight(weightRes.data)

    // Load Whoop data if connected
    const connected = await getWhoopConnection(user.id)
    if (connected) {
      try { await syncWhoopData(user.id) } catch {}
      const whoop = await getTodayWhoopData(user.id)
      if (whoop) setWhoopData(whoop)
    }
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
  const firstName = user?.email?.split('@')[0]?.split('.')[0] || ''
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

  return (
    <div className="px-5 pt-8 max-w-lg mx-auto animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">{getGreeting()}, {displayName}</h1>
        <p className="text-slate-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      {/* Calorie Ring + Macros */}
      <div className="bg-surface rounded-3xl p-6 mb-4 border border-surface-border">
        <div className="flex items-center gap-6">
          <CalorieRing eaten={totals.calories} goal={goals.calorie_goal} />
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Calories</p>
            <p className="text-3xl font-extrabold tracking-tight">{totals.calories}</p>
            <p className="text-sm text-slate-500">of {goals.calorie_goal} kcal</p>
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <MacroCard label="Protein" value={Math.round(totals.protein)} goal={goals.protein_goal} color="#60a5fa" unit="g" />
        <MacroCard label="Carbs" value={Math.round(totals.carbs)} goal={goals.carbs_goal} color="#f59e0b" unit="g" />
        <MacroCard label="Fat" value={Math.round(totals.fat)} goal={goals.fat_goal} color="#f472b6" unit="g" />
      </div>

      {/* Readiness Score */}
      {readiness && (
        <div className="bg-surface rounded-3xl p-5 mb-4 border border-surface-border">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-extrabold ${scoreBadge(readiness.score).color}`}>
              {readiness.score}
            </div>
            <div className="flex-1">
              <p className="font-bold text-[15px]">Readiness: {scoreBadge(readiness.score).text}</p>
              <div className="flex gap-4 mt-1">
                <span className="text-xs text-slate-500">Sleep {readiness.sleep}/5</span>
                <span className="text-xs text-slate-500">Stress {readiness.stress}/5</span>
                <span className="text-xs text-slate-500">Energy {readiness.energy}/5</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Whoop Recovery & Strain */}
      {whoopData && (
        <div className="bg-surface rounded-3xl p-5 mb-4 border border-surface-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h2 className="font-bold text-[15px]">Whoop</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {whoopData.recovery_score != null && (
              <div className="bg-base rounded-2xl p-3.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Recovery</p>
                <p className="text-xl font-extrabold">
                  {Math.round(whoopData.recovery_score)}
                  <span className="text-xs text-slate-500 font-medium ml-0.5">%</span>
                </p>
                <div className="w-full bg-surface-elevated rounded-full h-1.5 mt-2">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(whoopData.recovery_score, 100)}%`,
                      background: whoopData.recovery_score >= 67 ? '#22c55e' : whoopData.recovery_score >= 34 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            )}

            {whoopData.day_strain != null && (
              <div className="bg-base rounded-2xl p-3.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Strain</p>
                <p className="text-xl font-extrabold">
                  {Number(whoopData.day_strain).toFixed(1)}
                  <span className="text-xs text-slate-500 font-medium ml-0.5">/21</span>
                </p>
                <div className="w-full bg-surface-elevated rounded-full h-1.5 mt-2">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min((whoopData.day_strain / 21) * 100, 100)}%`,
                      background: '#06b6d4',
                    }}
                  />
                </div>
              </div>
            )}

            {whoopData.hrv_rmssd != null && (
              <div className="bg-base rounded-2xl p-3.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">HRV</p>
                <p className="text-xl font-extrabold">
                  {Math.round(whoopData.hrv_rmssd)}
                  <span className="text-xs text-slate-500 font-medium ml-0.5">ms</span>
                </p>
              </div>
            )}

            {whoopData.resting_hr != null && (
              <div className="bg-base rounded-2xl p-3.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Resting HR</p>
                <p className="text-xl font-extrabold">
                  {Math.round(whoopData.resting_hr)}
                  <span className="text-xs text-slate-500 font-medium ml-0.5">bpm</span>
                </p>
              </div>
            )}

            {whoopData.sleep_duration_min != null && (
              <div className="bg-base rounded-2xl p-3.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Sleep</p>
                <p className="text-xl font-extrabold">
                  {Math.floor(whoopData.sleep_duration_min / 60)}h {whoopData.sleep_duration_min % 60}m
                </p>
              </div>
            )}

            {whoopData.calories_burned != null && (
              <div className="bg-base rounded-2xl p-3.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Burned</p>
                <p className="text-xl font-extrabold">
                  {whoopData.calories_burned}
                  <span className="text-xs text-slate-500 font-medium ml-0.5">kcal</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Body Weight */}
      {latestWeight && (
        <div className="bg-surface rounded-3xl p-5 mb-4 border border-surface-border">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-[15px]">
                {Number(latestWeight.weight_lbs).toFixed(1)} lbs
                {latestWeight.body_fat_pct != null && (
                  <span className="text-slate-400 font-medium text-sm ml-2">{Number(latestWeight.body_fat_pct).toFixed(1)}% BF</span>
                )}
              </p>
              <p className="text-xs text-slate-500">
                Last weighed {latestWeight.date === today ? 'today' : format(new Date(latestWeight.date + 'T12:00:00'), 'MMM d')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Workout Status */}
      <div className="bg-surface rounded-3xl p-5 border border-surface-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h2.25m13.5 0H21m-3.75 0V4.875c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125V7.5m3.75 0h-3.75m-6 0V4.875c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125V7.5m3.75 0h-3.75M3 16.5h2.25m13.5 0H21m-3.75 0v2.625c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 01-1.125-1.125V16.5m3.75 0h-3.75m-6 0v2.625c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 01-1.125-1.125V16.5m3.75 0h-3.75M3 12h18" />
            </svg>
          </div>
          <h2 className="font-bold text-[15px]">Today's Workout</h2>
        </div>
        {todayDayName ? (
          <div className="pl-[52px]">
            <p className="text-white font-semibold">{todayDayName}</p>
            <p className="text-sm text-slate-500">{completedSets} sets completed</p>
          </div>
        ) : (
          <p className="text-slate-500 text-sm pl-[52px]">No workout logged yet today.</p>
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
  const color = pct >= 100 ? '#22c55e' : '#06b6d4'

  return (
    <div className="relative w-[100px] h-[100px]">
      <svg className="w-[100px] h-[100px] -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1e2130" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold">
        {Math.round(pct)}%
      </span>
    </div>
  )
}

function MacroCard({ label, value, goal, color, unit }) {
  const pct = Math.min((value / goal) * 100, 100)
  return (
    <div className="bg-surface rounded-2xl p-4 border border-surface-border">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-xl font-extrabold">{value}<span className="text-xs text-slate-500 font-medium ml-0.5">{unit}</span></p>
      <div className="w-full bg-surface-elevated rounded-full h-1.5 mt-2.5">
        <div className="h-1.5 rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-[10px] text-slate-600 mt-1.5">{goal}{unit} goal</p>
    </div>
  )
}
