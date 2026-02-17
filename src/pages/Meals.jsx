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
    <div className="px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meals</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-navy-800 rounded-xl p-1 mb-4">
        {[
          { id: 'log', label: 'Log Food' },
          { id: 'saved', label: 'My Meals' },
          { id: 'today', label: "Today" },
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

      {tab === 'log' && (
        <div>
          {/* Search */}
          <div className="relative mb-4">
            <svg className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search foods..."
              className="w-full pl-11 pr-4 py-3 bg-navy-800 border border-navy-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Food results */}
          <div className="space-y-2 mb-4">
            {results.map((food, i) => (
              <button
                key={i}
                onClick={() => logMeal(food)}
                className="w-full flex items-center justify-between p-3.5 bg-navy-800 hover:bg-navy-700 rounded-xl transition-colors text-left"
              >
                <div>
                  <p className="font-medium text-sm">{food.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                  </p>
                </div>
                <span className="text-accent font-semibold text-sm">{food.calories} cal</span>
              </button>
            ))}
          </div>

          {/* Custom entry toggle */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full py-3 border-2 border-dashed border-navy-700 rounded-xl text-slate-400 text-sm font-medium hover:border-accent hover:text-accent transition-colors"
          >
            + Custom Entry
          </button>

          {showForm && (
            <form onSubmit={handleCustomSubmit} className="mt-4 bg-navy-800 rounded-xl p-4 space-y-3">
              <input
                type="text"
                placeholder="Food name"
                value={form.food_name}
                onChange={e => setForm({ ...form, food_name: e.target.value })}
                className="w-full px-3 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Calories" value={form.calories}
                  onChange={e => setForm({ ...form, calories: e.target.value })}
                  className="px-3 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent text-sm" required />
                <input type="number" placeholder="Protein (g)" value={form.protein}
                  onChange={e => setForm({ ...form, protein: e.target.value })}
                  className="px-3 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent text-sm" />
                <input type="number" placeholder="Carbs (g)" value={form.carbs}
                  onChange={e => setForm({ ...form, carbs: e.target.value })}
                  className="px-3 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent text-sm" />
                <input type="number" placeholder="Fat (g)" value={form.fat}
                  onChange={e => setForm({ ...form, fat: e.target.value })}
                  className="px-3 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent text-sm" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-accent hover:bg-accent-light text-white font-semibold rounded-lg transition-colors text-sm">
                Log Meal
              </button>
            </form>
          )}
        </div>
      )}

      {tab === 'saved' && (
        <div className="space-y-2">
          {savedMeals.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Meals you log will appear here for quick re-logging.</p>
          ) : (
            savedMeals.map(meal => (
              <div key={meal.id} className="flex items-center justify-between p-3.5 bg-navy-800 rounded-xl">
                <button onClick={() => logMeal(meal)} className="flex-1 text-left">
                  <p className="font-medium text-sm">{meal.food_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {meal.calories} cal &middot; Logged {meal.frequency}x
                  </p>
                </button>
                <button onClick={() => deleteSavedMeal(meal.id)} className="p-2 text-slate-500 hover:text-danger">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
          {/* Today summary */}
          <div className="bg-navy-800 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-bold">{todayTotals.calories}</p>
                <p className="text-[10px] text-slate-400">CALS</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-400">{Math.round(todayTotals.protein)}</p>
                <p className="text-[10px] text-slate-400">PROTEIN</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-400">{Math.round(todayTotals.carbs)}</p>
                <p className="text-[10px] text-slate-400">CARBS</p>
              </div>
              <div>
                <p className="text-lg font-bold text-rose-400">{Math.round(todayTotals.fat)}</p>
                <p className="text-[10px] text-slate-400">FAT</p>
              </div>
            </div>
          </div>

          {/* Meal list */}
          <div className="space-y-2">
            {meals.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No meals logged today.</p>
            ) : (
              meals.map(meal => (
                <div key={meal.id} className="flex items-center justify-between p-3.5 bg-navy-800 rounded-xl">
                  <div>
                    <p className="font-medium text-sm">{meal.food_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      P:{Math.round(Number(meal.protein))}g C:{Math.round(Number(meal.carbs))}g F:{Math.round(Number(meal.fat))}g
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-accent font-semibold text-sm">{meal.calories} cal</span>
                    <button onClick={() => deleteMeal(meal.id)} className="p-1.5 text-slate-500 hover:text-danger">
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
    </div>
  )
}
