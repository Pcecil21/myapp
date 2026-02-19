import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { FOOD_DATABASE, fuzzySearch } from '../lib/foodDatabase'

export default function Meals() {
  const { user } = useAuth()
  const [meals, setMeals] = useState([])
  const [savedMeals, setSavedMeals] = useState([])
  const [tab, setTab] = useState('log') // 'log' | 'saved' | 'today'
  const [search, setSearch] = useState('')
  const [results, setResults] = useState(FOOD_DATABASE.slice(0, 10))
  const [form, setForm] = useState({ food_name: '', calories: '', protein: '', carbs: '', fat: '' })
  const [showForm, setShowForm] = useState(false)
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => { if (user) loadData() }, [user])

  useEffect(() => {
    setResults(fuzzySearch(search))
  }, [search])

  async function loadData() {
    const [mealsRes, savedRes] = await Promise.all([
      supabase.from('meals').select('*').eq('user_id', user.id).eq('date', today).order('created_at', { ascending: false }),
      supabase.from('saved_meals').select('*').eq('user_id', user.id).order('frequency', { ascending: false }),
    ])
    if (mealsRes.data) setMeals(mealsRes.data)
    if (savedRes.data) setSavedMeals(savedRes.data)
  }

  async function logMeal(food) {
    const meal = {
      user_id: user.id,
      food_name: food.name || food.food_name,
      calories: Number(food.calories),
      protein: Number(food.protein),
      carbs: Number(food.carbs),
      fat: Number(food.fat),
      date: today,
    }
    const { error } = await supabase.from('meals').insert(meal)
    if (error) return

    // Upsert to saved_meals
    const { data: existing } = await supabase.from('saved_meals')
      .select('*').eq('user_id', user.id).eq('food_name', meal.food_name).single()

    if (existing) {
      await supabase.from('saved_meals').update({
        frequency: existing.frequency + 1,
        last_used: new Date().toISOString(),
      }).eq('id', existing.id)
    } else {
      await supabase.from('saved_meals').insert({
        user_id: user.id,
        food_name: meal.food_name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
      })
    }

    loadData()
    setSearch('')
    setShowForm(false)
    setForm({ food_name: '', calories: '', protein: '', carbs: '', fat: '' })
  }

  async function deleteMeal(id) {
    await supabase.from('meals').delete().eq('id', id)
    loadData()
  }

  async function deleteSavedMeal(id) {
    await supabase.from('saved_meals').delete().eq('id', id)
    loadData()
  }

  function handleCustomSubmit(e) {
    e.preventDefault()
    if (!form.food_name || !form.calories) return
    logMeal(form)
  }

  const todayTotals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + Number(m.protein),
      carbs: acc.carbs + Number(m.carbs),
      fat: acc.fat + Number(m.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return (
    <div className="px-5 pt-8 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Meals</h1>
      <p className="text-slate-500 text-sm mb-5">{format(new Date(), 'EEEE, MMMM d')}</p>

      {/* Running daily total bar */}
      <div className="bg-surface rounded-3xl p-4 mb-5 border border-surface-border">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-xl font-extrabold">{todayTotals.calories}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">Cals</p>
          </div>
          <div>
            <p className="text-xl font-extrabold" style={{ color: '#60a5fa' }}>{Math.round(todayTotals.protein)}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">Protein</p>
          </div>
          <div>
            <p className="text-xl font-extrabold" style={{ color: '#f59e0b' }}>{Math.round(todayTotals.carbs)}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">Carbs</p>
          </div>
          <div>
            <p className="text-xl font-extrabold" style={{ color: '#f472b6' }}>{Math.round(todayTotals.fat)}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">Fat</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface rounded-2xl p-1 mb-5 border border-surface-border">
        {[
          { id: 'log', label: 'Log Food' },
          { id: 'saved', label: 'My Meals' },
          { id: 'today', label: "Today" },
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

      {tab === 'log' && (
        <div>
          {/* Search */}
          <div className="relative mb-4">
            <svg className="absolute left-4 top-4 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search foods..."
              className="w-full pl-12 pr-4 py-3.5 bg-surface border border-surface-border rounded-2xl text-white placeholder-slate-500 focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all text-[15px]"
            />
          </div>

          {/* Food results */}
          <div className="space-y-2 mb-4">
            {results.map((food, i) => (
              <button
                key={i}
                onClick={() => logMeal(food)}
                className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-elevated rounded-2xl transition-all duration-200 text-left border border-surface-border min-h-[60px] active:scale-[0.98]"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px] truncate">{food.name}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs font-medium" style={{ color: '#60a5fa' }}>P:{food.protein}g</span>
                    <span className="text-xs font-medium" style={{ color: '#f59e0b' }}>C:{food.carbs}g</span>
                    <span className="text-xs font-medium" style={{ color: '#f472b6' }}>F:{food.fat}g</span>
                  </div>
                </div>
                <span className="text-accent font-extrabold text-sm ml-3">{food.calories} cal</span>
              </button>
            ))}
          </div>

          {/* Custom entry toggle */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full py-4 border-2 border-dashed border-surface-border rounded-2xl text-slate-500 text-sm font-bold hover:border-accent hover:text-accent transition-all duration-200 min-h-[52px]"
          >
            + Custom Entry
          </button>

          {showForm && (
            <form onSubmit={handleCustomSubmit} className="mt-4 bg-surface rounded-3xl p-5 space-y-3 border border-surface-border animate-fade-in">
              <input
                type="text"
                placeholder="Food name"
                value={form.food_name}
                onChange={e => setForm({ ...form, food_name: e.target.value })}
                className="w-full px-4 py-3.5 bg-base border border-surface-border rounded-2xl text-white placeholder-slate-500 focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all text-[15px]"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Calories" value={form.calories}
                  onChange={e => setForm({ ...form, calories: e.target.value })}
                  className="px-4 py-3 bg-base border border-surface-border rounded-2xl text-white placeholder-slate-500 focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all text-sm" required />
                <input type="number" placeholder="Protein (g)" value={form.protein}
                  onChange={e => setForm({ ...form, protein: e.target.value })}
                  className="px-4 py-3 bg-base border border-surface-border rounded-2xl text-white placeholder-slate-500 focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all text-sm" />
                <input type="number" placeholder="Carbs (g)" value={form.carbs}
                  onChange={e => setForm({ ...form, carbs: e.target.value })}
                  className="px-4 py-3 bg-base border border-surface-border rounded-2xl text-white placeholder-slate-500 focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all text-sm" />
                <input type="number" placeholder="Fat (g)" value={form.fat}
                  onChange={e => setForm({ ...form, fat: e.target.value })}
                  className="px-4 py-3 bg-base border border-surface-border rounded-2xl text-white placeholder-slate-500 focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all text-sm" />
              </div>
              <button type="submit" className="w-full py-4 bg-accent hover:bg-accent-light text-white font-bold rounded-2xl transition-all duration-200 text-[15px] min-h-[52px] glow-accent active:scale-[0.98]">
                Log Meal
              </button>
            </form>
          )}
        </div>
      )}

      {tab === 'saved' && (
        <div className="space-y-2">
          {savedMeals.length === 0 ? (
            <div className="bg-surface rounded-3xl p-8 border border-surface-border text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">Meals you log will appear here for quick re-logging.</p>
            </div>
          ) : (
            savedMeals.map(meal => (
              <div key={meal.id} className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-surface-border">
                <button onClick={() => logMeal(meal)} className="flex-1 text-left min-h-[44px] flex flex-col justify-center">
                  <p className="font-bold text-[15px]">{meal.food_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {meal.calories} cal &middot; Logged {meal.frequency}x
                  </p>
                </button>
                <button onClick={() => deleteSavedMeal(meal.id)} className="p-2.5 text-slate-600 hover:text-danger transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'today' && (
        <div>
          {/* Meal list */}
          <div className="space-y-2">
            {meals.length === 0 ? (
              <div className="bg-surface rounded-3xl p-8 border border-surface-border text-center">
                <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">No meals logged today.</p>
                <button onClick={() => setTab('log')} className="text-accent text-sm font-semibold mt-2 min-h-[44px]">
                  Log your first meal
                </button>
              </div>
            ) : (
              meals.map(meal => (
                <div key={meal.id} className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-surface-border">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[15px] truncate">{meal.food_name}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs font-medium" style={{ color: '#60a5fa' }}>P:{Math.round(Number(meal.protein))}g</span>
                      <span className="text-xs font-medium" style={{ color: '#f59e0b' }}>C:{Math.round(Number(meal.carbs))}g</span>
                      <span className="text-xs font-medium" style={{ color: '#f472b6' }}>F:{Math.round(Number(meal.fat))}g</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-extrabold text-sm">{meal.calories} cal</span>
                    <button onClick={() => deleteMeal(meal.id)} className="p-2 text-slate-600 hover:text-danger transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Bottom spacer for nav */}
      <div className="h-8" />
    </div>
  )
}
