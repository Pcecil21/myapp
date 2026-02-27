import { useState } from 'react'

export default function SwapModal({ exercise, onSwap, onReset, onClose, isSwapped }) {
  const [selected, setSelected] = useState(null)

  const subs = exercise.substitutes || []

  function handleSwap() {
    if (!selected) return
    const sub = subs.find(s => s.id === selected)
    if (sub) onSwap(exercise.id, sub)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-surface border border-surface-border rounded-3xl p-6 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-extrabold tracking-tight">Swap Exercise</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center text-slate-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          {exercise.name} &middot; {exercise.muscle}
        </p>

        {/* Substitutes list */}
        <div className="space-y-2.5 mb-5">
          {subs.map(sub => (
            <button key={sub.id}
              onClick={() => setSelected(sub.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                selected === sub.id
                  ? 'bg-accent/10 border-accent/40'
                  : 'bg-surface-elevated border-surface-border hover:border-slate-600'
              }`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  selected === sub.id ? 'border-accent bg-accent' : 'border-slate-600'
                }`}>
                  {selected === sub.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{sub.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{sub.equipment} &middot; {sub.muscle}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sub.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {isSwapped && (
            <button onClick={() => onReset(exercise.id)}
              className="flex-1 h-12 rounded-2xl border border-surface-border text-sm font-bold text-slate-400 hover:text-white hover:border-slate-500 transition-all">
              Reset to Default
            </button>
          )}
          <button onClick={handleSwap} disabled={!selected}
            className={`flex-1 h-12 rounded-2xl text-sm font-bold transition-all duration-200 ${
              selected
                ? 'bg-accent text-white shadow-lg shadow-accent/20 hover:brightness-110'
                : 'bg-surface-elevated text-slate-600 cursor-not-allowed'
            }`}>
            Swap Exercise
          </button>
        </div>
      </div>
    </div>
  )
}
