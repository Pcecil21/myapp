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
    { key: 'calorie_goal', label: 'Daily Calories', unit: 'kcal', color: 'accent' },
    { key: 'protein_goal', label: 'Protein', unit: 'g', color: 'blue-400' },
    { key: 'carbs_goal', label: 'Carbs', unit: 'g', color: 'amber-400' },
    { key: 'fat_goal', label: 'Fat', unit: 'g', color: 'rose-400' },
  ]

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <form onSubmit={saveGoals} className="space-y-6">
        <div className="bg-navy-800 rounded-2xl p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Daily Goals
          </h2>
          <div className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-300">{f.label}</span>
                  <span className="text-slate-500">{f.unit}</span>
                </label>
                <input
                  type="number"
                  value={goals[f.key]}
                  onChange={e => setGoals({ ...goals, [f.key]: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-xl text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {saved ? 'Saved!' : loading ? 'Saving...' : 'Save Goals'}
        </button>
      </form>

      {/* Account */}
      <div className="bg-navy-800 rounded-2xl p-5 mt-6">
        <h2 className="font-semibold mb-3">Account</h2>
        <p className="text-sm text-slate-400 mb-4">{user?.email}</p>
        <button
          onClick={signOut}
          className="w-full py-3 bg-navy-700 hover:bg-navy-600 text-slate-300 font-medium rounded-xl transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
