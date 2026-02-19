import { useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const FIELDS = [
  { key: 'sleep',      label: 'Sleep Quality', low: 'Poor',     high: 'Great'    },
  { key: 'stress',     label: 'Stress',        low: 'Very High', high: 'Very Low' },
  { key: 'soreness',   label: 'Soreness',      low: 'Very Sore', high: 'None'     },
  { key: 'motivation', label: 'Motivation',    low: 'None',      high: 'Fired Up' },
  { key: 'energy',     label: 'Energy',        low: 'Drained',   high: 'Energized'},
]

export function scoreBadge(score) {
  if (score <= 2) return { color: 'bg-red-500',   text: 'Low' }
  if (score <= 3) return { color: 'bg-amber-500',  text: 'Moderate' }
  if (score <= 4) return { color: 'bg-blue-500',   text: 'Good' }
  return              { color: 'bg-emerald-500', text: 'Excellent' }
}

export default function ReadinessCheckin({ onComplete }) {
  const { user } = useAuth()
  const [ratings, setRatings] = useState({ sleep: 0, stress: 0, soreness: 0, motivation: 0, energy: 0 })
  const [saving, setSaving] = useState(false)

  const filled = Object.values(ratings).every(v => v > 0)
  const score = filled
    ? +(Object.values(ratings).reduce((a, b) => a + b, 0) / 5).toFixed(1)
    : null
  const badge = score ? scoreBadge(score) : null

  async function submit() {
    if (!filled || saving) return
    setSaving(true)
    const today = format(new Date(), 'yyyy-MM-dd')
    await supabase.from('readiness_entries').insert({
      user_id: user.id, ...ratings, score, date: today,
    })
    setSaving(false)
    onComplete?.(score)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">
      <div className="bg-surface rounded-3xl p-6 w-full max-w-sm border border-surface-border animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold">Daily Readiness</h2>
          <p className="text-sm text-slate-500 mt-1">Rate each factor before you train</p>
        </div>

        <div className="space-y-5">
          {FIELDS.map(f => (
            <div key={f.key}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">{f.label}</span>
                <span className="text-[10px] text-slate-600">{f.low} → {f.high}</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n}
                    onClick={() => setRatings(prev => ({ ...prev, [f.key]: n }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 min-h-[44px] ${
                      ratings[f.key] === n
                        ? 'bg-accent text-white shadow-lg shadow-accent/20'
                        : 'bg-surface-elevated text-slate-500 hover:text-white active:scale-95'
                    }`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {score !== null && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className={`${badge.color} text-white text-sm font-extrabold px-4 py-1.5 rounded-full`}>
              {score}
            </span>
            <span className="text-sm text-slate-300 font-medium">{badge.text}</span>
          </div>
        )}

        <button onClick={submit} disabled={!filled || saving}
          className={`mt-6 w-full py-4 rounded-2xl font-bold text-[15px] transition-all duration-200 min-h-[52px] ${
            filled ? 'bg-accent text-white glow-accent hover:bg-accent-light active:scale-[0.98]' : 'bg-surface-elevated text-slate-600 cursor-not-allowed'
          }`}>
          {saving ? 'Saving...' : 'Start Workout'}
        </button>
      </div>
    </div>
  )
}
