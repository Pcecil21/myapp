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

function scoreBadge(score) {
  if (score <= 2) return { color: 'bg-red-500',   text: 'Low' }
  if (score <= 3) return { color: 'bg-amber-500',  text: 'Moderate' }
  if (score <= 4) return { color: 'bg-blue-500',   text: 'Good' }
  return              { color: 'bg-green-500',  text: 'Excellent' }
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
      user_id: user.id,
      ...ratings,
      score,
      date: today,
    })
    setSaving(false)
    onComplete?.(score)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-navy-800 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-1">Daily Readiness</h2>
        <p className="text-sm text-slate-400 mb-5">Rate each factor 1-5 before you train.</p>

        <div className="space-y-4">
          {FIELDS.map(f => (
            <div key={f.key}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium">{f.label}</span>
                <span className="text-[10px] text-slate-500">{f.low} → {f.high}</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRatings(prev => ({ ...prev, [f.key]: n }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      ratings[f.key] === n
                        ? 'bg-accent text-white'
                        : 'bg-navy-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Score preview */}
        {score !== null && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <span className={`${badge.color} text-white text-sm font-bold px-3 py-1 rounded-full`}>
              {score}
            </span>
            <span className="text-sm text-slate-300">{badge.text}</span>
          </div>
        )}

        <button
          onClick={submit}
          disabled={!filled || saving}
          className={`mt-5 w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
            filled ? 'bg-accent text-white hover:bg-blue-600' : 'bg-navy-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          {saving ? 'Saving...' : 'Start Workout'}
        </button>
      </div>
    </div>
  )
}

export { scoreBadge }
