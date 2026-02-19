import { useState, useEffect } from 'react'
import { format, subDays, startOfWeek } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { getAllExercises } from '../lib/workoutProgram'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function Trends() {
  const { user } = useAuth()
  const [mealData, setMealData] = useState([])
  const [volumeData, setVolumeData] = useState([])
  const [tab, setTab] = useState('calories')

  // Progress tab state
  const [progressExercise, setProgressExercise] = useState('')
  const [progressData, setProgressData] = useState([])

  const allExercises = getAllExercises()

  useEffect(() => { if (user) loadTrends() }, [user])
  useEffect(() => { if (user && progressExercise) loadProgress() }, [user, progressExercise])

  async function loadTrends() {
    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')

    const [mealsRes, volumeRes] = await Promise.all([
      supabase.from('meals').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgo).order('date'),
      supabase.from('workout_entries').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgo).eq('completed', true).order('date'),
    ])

    // Process meals by day
    if (mealsRes.data) {
      const byDay = {}
      mealsRes.data.forEach(m => {
        if (!byDay[m.date]) byDay[m.date] = { date: m.date, calories: 0, protein: 0, carbs: 0, fat: 0 }
        byDay[m.date].calories += m.calories
        byDay[m.date].protein += Number(m.protein)
        byDay[m.date].carbs += Number(m.carbs)
        byDay[m.date].fat += Number(m.fat)
      })

      const last14 = Array.from({ length: 14 }, (_, i) => {
        const d = format(subDays(new Date(), 13 - i), 'yyyy-MM-dd')
        return byDay[d] || { date: d, calories: 0, protein: 0, carbs: 0, fat: 0 }
      }).map(d => ({
        ...d,
        label: format(new Date(d.date + 'T12:00:00'), 'MMM d'),
        protein: Math.round(d.protein),
        carbs: Math.round(d.carbs),
        fat: Math.round(d.fat),
      }))

      setMealData(last14)
    }

    // Process volume by week
    if (volumeRes.data) {
      const byWeek = {}
      volumeRes.data.forEach(e => {
        const ws = format(startOfWeek(new Date(e.date + 'T12:00:00'), { weekStartsOn: 1 }), 'MMM d')
        if (!byWeek[ws]) byWeek[ws] = { week: ws, sets: 0, volume: 0 }
        byWeek[ws].sets += 1
        byWeek[ws].volume += (Number(e.weight) || 0) * (Number(e.reps) || 0)
      })
      setVolumeData(Object.values(byWeek))
    }
  }

  async function loadProgress() {
    const { data } = await supabase
      .from('workout_entries')
      .select('week_number, weight')
      .eq('user_id', user.id)
      .eq('exercise_name', progressExercise)
      .eq('completed', true)
      .order('week_number')

    if (data) {
      const byWeek = {}
      data.forEach(e => {
        const w = e.week_number
        if (!byWeek[w] || Number(e.weight) > byWeek[w]) {
          byWeek[w] = Number(e.weight)
        }
      })
      const chartData = [1,2,3,4,5,6,7,8].map(w => ({
        week: `W${w}`,
        weight: byWeek[w] || null,
      }))
      setProgressData(chartData)
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-surface-elevated border border-surface-border rounded-2xl px-4 py-3 text-xs shadow-lg">
        <p className="text-slate-400 mb-1.5 font-semibold">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-bold">
            {p.name}: {Math.round(p.value)}{p.name === 'Calories' ? '' : p.name === 'Weight' ? ' lbs' : 'g'}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="px-5 pt-8 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-2xl font-extrabold tracking-tight mb-5">Trends</h1>

      {/* Tab selector */}
      <div className="flex gap-1 bg-surface rounded-2xl p-1 mb-6 border border-surface-border">
        {[
          { id: 'calories', label: 'Calories' },
          { id: 'macros', label: 'Macros' },
          { id: 'volume', label: 'Volume' },
          { id: 'progress', label: 'Progress' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 min-h-[44px] ${
              tab === t.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-slate-500 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'calories' && (
        <div className="bg-surface rounded-3xl p-5 border border-surface-border">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-[15px]">Daily Calories</h2>
              <p className="text-xs text-slate-500">Last 14 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mealData}>
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval={1} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="calories" name="Calories" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'macros' && (
        <div className="bg-surface rounded-3xl p-5 border border-surface-border">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-[15px]">Daily Macros</h2>
              <p className="text-xs text-slate-500">Last 14 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mealData}>
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval={1} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="protein" name="Protein" stroke="#60a5fa" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="carbs" name="Carbs" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="fat" name="Fat" stroke="#f472b6" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-4">
            <span className="flex items-center gap-2 text-xs text-slate-400 font-medium"><span className="w-3 h-3 rounded-full" style={{ background: '#60a5fa' }} />Protein</span>
            <span className="flex items-center gap-2 text-xs text-slate-400 font-medium"><span className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />Carbs</span>
            <span className="flex items-center gap-2 text-xs text-slate-400 font-medium"><span className="w-3 h-3 rounded-full" style={{ background: '#f472b6' }} />Fat</span>
          </div>
        </div>
      )}

      {tab === 'volume' && (
        <div className="bg-surface rounded-3xl p-5 border border-surface-border">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-[15px]">Weekly Volume</h2>
              <p className="text-xs text-slate-500">Training load over time</p>
            </div>
          </div>
          {volumeData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={volumeData}>
                  <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="volume" name="Volume (lbs)" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Weekly summary cards */}
              <div className="mt-5 space-y-2">
                {volumeData.map((w, i) => (
                  <div key={i} className="flex justify-between items-center py-3 px-4 bg-base rounded-2xl">
                    <span className="text-sm text-slate-400 font-medium">Week of {w.week}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-surface-elevated px-2 py-1 rounded-lg text-slate-400 font-medium">{w.sets} sets</span>
                      <span className="text-sm font-bold">{w.volume.toLocaleString()} lbs</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h2.25m13.5 0H21m-3.75 0V4.875c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125V7.5m3.75 0h-3.75m-6 0V4.875c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125V7.5m3.75 0h-3.75M3 16.5h2.25m13.5 0H21m-3.75 0v2.625c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 01-1.125-1.125V16.5m3.75 0h-3.75m-6 0v2.625c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 01-1.125-1.125V16.5m3.75 0h-3.75M3 12h18" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">Log some workouts to see volume trends.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'progress' && (
        <div className="bg-surface rounded-3xl p-5 border border-surface-border">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-[15px]">Exercise Progress</h2>
              <p className="text-xs text-slate-500">Weight across weeks</p>
            </div>
          </div>

          {/* Exercise selector */}
          <select
            value={progressExercise}
            onChange={e => setProgressExercise(e.target.value)}
            className="w-full px-4 py-3.5 bg-base border border-surface-border rounded-2xl text-white text-sm font-medium mb-5 focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all appearance-none cursor-pointer"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '20px' }}
          >
            <option value="">Select an exercise...</option>
            {allExercises.map(ex => (
              <option key={ex.id} value={ex.name}>{ex.name} ({ex.muscle})</option>
            ))}
          </select>

          {progressExercise && progressData.some(d => d.weight !== null) ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={progressData}>
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ fill: '#06b6d4', r: 5, strokeWidth: 2, stroke: '#151720' }}
                  activeDot={{ fill: '#06b6d4', r: 7, strokeWidth: 2, stroke: '#151720' }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : progressExercise ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">No data logged for this exercise yet.</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">Select an exercise to view weight progression across weeks.</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom spacer for nav */}
      <div className="h-8" />
    </div>
  )
}
