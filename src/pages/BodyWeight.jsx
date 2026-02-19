import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'All', days: null },
]

export default function BodyWeight() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [notes, setNotes] = useState('')
  const [todayEntry, setTodayEntry] = useState(null)
  const [range, setRange] = useState('30d')
  const [saving, setSaving] = useState(false)
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => { if (user) loadData() }, [user])

  async function loadData() {
    const { data } = await supabase
      .from('body_weight_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (data) {
      setEntries(data)
      const todayRow = data.find(e => e.date === today)
      if (todayRow) {
        setTodayEntry(todayRow)
        setWeight(String(todayRow.weight_lbs))
        setBodyFat(todayRow.body_fat_pct != null ? String(todayRow.body_fat_pct) : '')
        setNotes(todayRow.notes || '')
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!weight) return
    setSaving(true)

    const row = {
      user_id: user.id,
      weight_lbs: parseFloat(weight),
      body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
      notes: notes || null,
      date: today,
    }

    if (todayEntry) {
      await supabase.from('body_weight_entries').update(row).eq('id', todayEntry.id)
    } else {
      await supabase.from('body_weight_entries').insert(row)
    }

    setSaving(false)
    loadData()
  }

  async function handleDelete(id) {
    await supabase.from('body_weight_entries').delete().eq('id', id)
    if (todayEntry?.id === id) {
      setTodayEntry(null)
      setWeight('')
      setBodyFat('')
      setNotes('')
    }
    loadData()
  }

  // Chart data
  const selectedRange = RANGES.find(r => r.label === range)
  const cutoff = selectedRange.days ? format(subDays(new Date(), selectedRange.days), 'yyyy-MM-dd') : null
  const filtered = cutoff ? entries.filter(e => e.date >= cutoff) : entries
  const chartData = [...filtered].reverse().map(e => ({
    date: format(new Date(e.date + 'T12:00:00'), 'MMM d'),
    weight: Number(e.weight_lbs),
    bodyFat: e.body_fat_pct != null ? Number(e.body_fat_pct) : null,
  }))

  // Quick stats
  const current = entries[0]
  const rangeEntries = filtered
  const oldest = rangeEntries.length > 1 ? rangeEntries[rangeEntries.length - 1] : null
  const delta = current && oldest ? (Number(current.weight_lbs) - Number(oldest.weight_lbs)).toFixed(1) : null
  const latestBf = entries.find(e => e.body_fat_pct != null)

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-surface-elevated border border-surface-border rounded-2xl px-4 py-3 text-xs shadow-lg">
        <p className="text-slate-400 mb-1.5 font-semibold">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-bold">
            {p.name}: {p.value}{p.name === 'Weight' ? ' lbs' : '%'}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="px-5 pt-8 max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Body Weight</h1>
        <p className="text-slate-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-surface rounded-2xl p-4 border border-surface-border">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Current</p>
          <p className="text-xl font-extrabold">
            {current ? Number(current.weight_lbs).toFixed(1) : '—'}
            <span className="text-xs text-slate-500 font-medium ml-0.5">lbs</span>
          </p>
        </div>
        <div className="bg-surface rounded-2xl p-4 border border-surface-border">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Change</p>
          <p className={`text-xl font-extrabold ${delta && Number(delta) < 0 ? 'text-green-400' : delta && Number(delta) > 0 ? 'text-red-400' : ''}`}>
            {delta != null ? `${Number(delta) > 0 ? '+' : ''}${delta}` : '—'}
            <span className="text-xs text-slate-500 font-medium ml-0.5">lbs</span>
          </p>
        </div>
        <div className="bg-surface rounded-2xl p-4 border border-surface-border">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Body Fat</p>
          <p className="text-xl font-extrabold">
            {latestBf ? Number(latestBf.body_fat_pct).toFixed(1) : '—'}
            <span className="text-xs text-slate-500 font-medium ml-0.5">%</span>
          </p>
        </div>
      </div>

      {/* Log Form */}
      <form onSubmit={handleSubmit} className="bg-surface rounded-3xl p-5 mb-4 border border-surface-border">
        <h2 className="font-bold text-[15px] mb-4">Log Entry</h2>
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Weight (lbs) *</label>
            <input
              type="number"
              step="0.1"
              required
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="185.0"
              className="w-full px-4 py-3 bg-base border border-surface-border rounded-2xl text-white text-sm font-medium focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Body Fat %</label>
            <input
              type="number"
              step="0.1"
              value={bodyFat}
              onChange={e => setBodyFat(e.target.value)}
              placeholder="15.0"
              className="w-full px-4 py-3 bg-base border border-surface-border rounded-2xl text-white text-sm font-medium focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Post-workout, fasted, etc."
            className="w-full px-4 py-3 bg-base border border-surface-border rounded-2xl text-white text-sm font-medium focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !weight}
          className="w-full py-3.5 bg-accent text-white font-bold rounded-2xl text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 min-h-[44px]"
        >
          {saving ? 'Saving...' : todayEntry ? 'Update Weight' : 'Log Weight'}
        </button>
      </form>

      {/* Trend Chart */}
      {chartData.length > 1 && (
        <div className="bg-surface rounded-3xl p-5 mb-4 border border-surface-border">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[15px]">Trend</h2>
            <div className="flex gap-1 bg-base rounded-xl p-1">
              {RANGES.map(r => (
                <button
                  key={r.label}
                  onClick={() => setRange(r.label)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[32px] ${
                    range === r.label ? 'bg-accent text-white' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis
                yAxisId="weight"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={40}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <YAxis
                yAxisId="bf"
                orientation="right"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={35}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                yAxisId="weight"
                type="monotone"
                dataKey="weight"
                name="Weight"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ fill: '#06b6d4', r: 4, strokeWidth: 2, stroke: '#151720' }}
                activeDot={{ fill: '#06b6d4', r: 6, strokeWidth: 2, stroke: '#151720' }}
              />
              <Line
                yAxisId="bf"
                type="monotone"
                dataKey="bodyFat"
                name="Body Fat"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={{ fill: '#22c55e', r: 4, strokeWidth: 2, stroke: '#151720' }}
                activeDot={{ fill: '#22c55e', r: 6, strokeWidth: 2, stroke: '#151720' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-4">
            <span className="flex items-center gap-2 text-xs text-slate-400 font-medium"><span className="w-3 h-3 rounded-full" style={{ background: '#06b6d4' }} />Weight</span>
            <span className="flex items-center gap-2 text-xs text-slate-400 font-medium"><span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />Body Fat %</span>
          </div>
        </div>
      )}

      {/* History List */}
      {entries.length > 0 && (
        <div className="bg-surface rounded-3xl p-5 mb-4 border border-surface-border">
          <h2 className="font-bold text-[15px] mb-4">History</h2>
          <div className="space-y-2">
            {entries.slice(0, 20).map(entry => (
              <div key={entry.id} className="flex items-center justify-between py-3 px-4 bg-base rounded-2xl">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    {format(new Date(entry.date + 'T12:00:00'), 'MMM d, yyyy')}
                  </p>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-xs text-slate-400">{Number(entry.weight_lbs).toFixed(1)} lbs</span>
                    {entry.body_fat_pct != null && (
                      <span className="text-xs text-slate-400">{Number(entry.body_fat_pct).toFixed(1)}% BF</span>
                    )}
                    {entry.notes && (
                      <span className="text-xs text-slate-500 truncate max-w-[120px]">{entry.notes}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-2 text-slate-600 hover:text-red-400 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom spacer */}
      <div className="h-8" />
    </div>
  )
}
