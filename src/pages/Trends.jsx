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
      <div className="bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-xs">
        <p className="text-slate-300 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {Math.round(p.value)}{p.name === 'Calories' ? '' : p.name === 'Weight' ? ' lbs' : 'g'}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Trends</h1>

      {/* Tab selector */}
      <div className="flex gap-1 bg-navy-800 rounded-xl p-1 mb-6">
        {[
          { id: 'calories', label: 'Calories' },
          { id: 'macros', label: 'Macros' },
          { id: 'volume', label: 'Volume' },
          { id: 'progress', label: 'Progress' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              tab === t.id ? 'bg-accent text-white' : 'text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'calories' && (
        <div className="bg-navy-800 rounded-2xl p-4">
          <h2 className="font-semibold mb-4">Daily Calories (14 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mealData}>
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} interval={1} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="calories" name="Calories" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'macros' && (
        <div className="bg-navy-800 rounded-2xl p-4">
          <h2 className="font-semibold mb-4">Daily Macros (14 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mealData}>
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} interval={1} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="protein" name="Protein" stroke="#60a5fa" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="carbs" name="Carbs" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fat" name="Fat" stroke="#f43f5e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" />Protein</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />Carbs</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" />Fat</span>
          </div>
        </div>
      )}

      {tab === 'volume' && (
        <div className="bg-navy-800 rounded-2xl p-4">
          <h2 className="font-semibold mb-4">Weekly Training Volume</h2>
          {volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={volumeData}>
                <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volume" name="Volume (lbs)" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center py-12">Log some workouts to see volume trends.</p>
          )}

          {volumeData.length > 0 && (
            <div className="mt-4 space-y-2">
              {volumeData.map((w, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-400">Week of {w.week}</span>
                  <span className="font-medium">{w.sets} sets &middot; {w.volume.toLocaleString()} lbs</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'progress' && (
        <div className="bg-navy-800 rounded-2xl p-4">
          <h2 className="font-semibold mb-4">Exercise Progress</h2>

          {/* Exercise selector */}
          <select
            value={progressExercise}
            onChange={e => setProgressExercise(e.target.value)}
            className="w-full px-3 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm mb-4 focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">Select an exercise...</option>
            {allExercises.map(ex => (
              <option key={ex.id} value={ex.name}>{ex.name} ({ex.muscle})</option>
            ))}
          </select>

          {progressExercise && progressData.some(d => d.weight !== null) ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={progressData}>
                <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} width={45} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : progressExercise ? (
            <p className="text-slate-400 text-sm text-center py-12">No data logged for this exercise yet.</p>
          ) : (
            <p className="text-slate-400 text-sm text-center py-12">Select an exercise to view weight progression across weeks.</p>
          )}
        </div>
      )}
    </div>
  )
}
