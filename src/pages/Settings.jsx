import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Settings() {
  const { user, signOut } = useAuth()
  const [goals, setGoals] = useState({ calorie_goal: 2000, protein_goal: 150, carbs_goal: 250, fat_goal: 65 })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) loadProfile() }, [user])

  async function loadProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    if (data) {
      setGoals({
        calorie_goal: data.calorie_goal,
        protein_goal: data.protein_goal,
        carbs_goal: data.carbs_goal,
        fat_goal: data.fat_goal,
      })
    }
  }

  async function saveGoals(e) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('profiles').update(goals).eq('user_id', user.id)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const fields = [
    { key: 'calorie_goal', label: 'Daily Calories', unit: 'kcal', color: '#06b6d4' },
    { key: 'protein_goal', label: 'Protein', unit: 'g', color: '#60a5fa' },
    { key: 'carbs_goal', label: 'Carbs', unit: 'g', color: '#f59e0b' },
    { key: 'fat_goal', label: 'Fat', unit: 'g', color: '#f472b6' },
  ]

  return (
    <div className="px-5 pt-8 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-2xl font-extrabold tracking-tight mb-6">Settings</h1>

      <form onSubmit={saveGoals} className="space-y-5">
        <div className="bg-surface rounded-3xl p-6 border border-surface-border">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-[15px]">Daily Goals</h2>
              <p className="text-xs text-slate-500">Set your daily nutrition targets</p>
            </div>
          </div>
          <div className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: f.color }} />
                    <span className="text-slate-300 font-medium">{f.label}</span>
                  </div>
                  <span className="text-xs text-slate-600 uppercase tracking-wider font-semibold">{f.unit}</span>
                </label>
                <input
                  type="number"
                  value={goals[f.key]}
                  onChange={e => setGoals({ ...goals, [f.key]: Number(e.target.value) })}
                  className="w-full px-4 py-4 bg-base border border-surface-border rounded-2xl text-white text-lg font-extrabold focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all text-center"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 font-bold rounded-2xl transition-all duration-200 text-[15px] min-h-[52px] active:scale-[0.98] ${
            saved
              ? 'bg-success text-white'
              : 'bg-accent hover:bg-accent-light text-white glow-accent disabled:opacity-50'
          }`}
        >
          {saved ? 'Saved!' : loading ? 'Saving...' : 'Save Goals'}
        </button>
      </form>

      {/* Account */}
      <div className="bg-surface rounded-3xl p-6 mt-5 border border-surface-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-[15px]">Account</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full py-4 bg-surface-elevated hover:bg-surface-border text-slate-300 font-bold rounded-2xl transition-all duration-200 min-h-[52px] active:scale-[0.98]"
        >
          Sign Out
        </button>
      </div>

      {/* Bottom spacer for nav */}
      <div className="h-8" />
    </div>
  )
}
