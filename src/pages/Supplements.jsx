import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Supplements() {
  const { user } = useAuth()
  const today = format(new Date(), 'yyyy-MM-dd')
  const [supplements, setSupplements] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  // Manual add form
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDosage, setNewDosage] = useState('')
  const [newBrand, setNewBrand] = useState('')
  const [addingSupplement, setAddingSupplement] = useState(false)

  // Photo scan state
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [identifying, setIdentifying] = useState(false)
  const [scanResults, setScanResults] = useState(null)
  const [savingScanned, setSavingScanned] = useState(false)

  useEffect(() => { if (user) loadData() }, [user])

  async function loadData() {
    setLoading(true)
    const [{ data: supps }, { data: todayLogs }] = await Promise.all([
      supabase
        .from('supplements')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true }),
      supabase
        .from('supplement_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today),
    ])
    setSupplements(supps || [])
    setLogs(todayLogs || [])
    setLoading(false)
  }

  // --- Check-in logic ---
  const activeSupps = supplements.filter(s => s.active)
  const takenCount = activeSupps.filter(s => logs.find(l => l.supplement_id === s.id && l.taken)).length

  async function toggleTaken(supplementId) {
    const existing = logs.find(l => l.supplement_id === supplementId)
    if (existing) {
      const newVal = !existing.taken
      await supabase.from('supplement_logs').update({ taken: newVal }).eq('id', existing.id)
      setLogs(logs.map(l => l.id === existing.id ? { ...l, taken: newVal } : l))
    } else {
      const { data } = await supabase.from('supplement_logs').insert({
        supplement_id: supplementId,
        user_id: user.id,
        date: today,
        taken: true,
      }).select().single()
      if (data) setLogs([...logs, data])
    }
  }

  async function checkAll() {
    const promises = activeSupps.map(async (s) => {
      const existing = logs.find(l => l.supplement_id === s.id)
      if (existing && !existing.taken) {
        await supabase.from('supplement_logs').update({ taken: true }).eq('id', existing.id)
      } else if (!existing) {
        await supabase.from('supplement_logs').insert({
          supplement_id: s.id,
          user_id: user.id,
          date: today,
          taken: true,
        })
      }
    })
    await Promise.all(promises)
    loadData()
  }

  // --- Manual add ---
  async function handleAddManual(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setAddingSupplement(true)
    await supabase.from('supplements').insert({
      user_id: user.id,
      name: newName.trim(),
      dosage: newDosage.trim() || null,
      brand: newBrand.trim() || null,
      sort_order: supplements.length,
    })
    setNewName('')
    setNewDosage('')
    setNewBrand('')
    setShowAddForm(false)
    setAddingSupplement(false)
    loadData()
  }

  // --- Deactivate / Delete ---
  async function toggleActive(supp) {
    await supabase.from('supplements').update({ active: !supp.active }).eq('id', supp.id)
    loadData()
  }

  async function deleteSupplement(id) {
    await supabase.from('supplements').delete().eq('id', id)
    loadData()
  }

  // --- Photo scan ---
  function resizeImage(file, maxSize = 1024) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height * maxSize) / width)
              width = maxSize
            } else {
              width = Math.round((width * maxSize) / height)
              height = maxSize
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await resizeImage(file)
    setPreview(dataUrl)
    setImageBase64(dataUrl)
    setScanResults(null)
  }

  async function handleIdentify() {
    if (!imageBase64) return
    setIdentifying(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/identify-supplements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ image: imageBase64 }),
        }
      )
      const text = await res.text()
      let result
      try { result = JSON.parse(text) } catch { alert('Invalid response: ' + text); setIdentifying(false); return }
      if (!res.ok) { alert('Function error (' + res.status + '): ' + (result.error || text)); setIdentifying(false); return }
      if (result.supplements) {
        setScanResults(result.supplements)
      } else {
        alert('Unexpected response: ' + JSON.stringify(result))
      }
    } catch (err) {
      alert('Error calling identify function: ' + err.message)
    }
    setIdentifying(false)
  }

  function updateScanResult(idx, field, value) {
    setScanResults(scanResults.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  function removeScanResult(idx) {
    setScanResults(scanResults.filter((_, i) => i !== idx))
  }

  async function saveScannedSupplements() {
    if (!scanResults?.length) return
    setSavingScanned(true)
    const rows = scanResults.map((r, i) => ({
      user_id: user.id,
      name: r.name,
      dosage: r.dosage || null,
      brand: r.brand || null,
      sort_order: supplements.length + i,
    }))
    await supabase.from('supplements').insert(rows)
    setSavingScanned(false)
    setPreview(null)
    setImageBase64(null)
    setScanResults(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    loadData()
  }

  function cancelScan() {
    setPreview(null)
    setImageBase64(null)
    setScanResults(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (loading) {
    return (
      <div className="px-5 pt-8 max-w-lg mx-auto animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Supplements</h1>
          <p className="text-slate-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 pt-8 max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Supplements</h1>
        <p className="text-slate-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      {/* Today's Check-in */}
      {activeSupps.length > 0 && (
        <div className="bg-surface rounded-3xl p-5 mb-4 border border-surface-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[15px]">Today's Check-in</h2>
            <button
              onClick={checkAll}
              className="text-xs font-bold text-accent hover:text-accent/80 transition-colors min-h-[32px] px-3"
            >
              Check All
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400 font-medium">
                {takenCount}/{activeSupps.length} taken
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {activeSupps.length > 0 ? Math.round((takenCount / activeSupps.length) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 bg-base rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${activeSupps.length > 0 ? (takenCount / activeSupps.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-1">
            {activeSupps.map(supp => {
              const taken = logs.find(l => l.supplement_id === supp.id && l.taken)
              return (
                <button
                  key={supp.id}
                  onClick={() => toggleTaken(supp.id)}
                  className="flex items-center gap-3 w-full py-2.5 px-3 rounded-2xl hover:bg-base/50 transition-colors min-h-[44px]"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    taken ? 'bg-accent border-accent' : 'border-slate-600'
                  }`}>
                    {taken && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <span className={`text-sm font-medium ${taken ? 'line-through text-slate-500' : 'text-white'}`}>
                      {supp.name}
                    </span>
                    {supp.dosage && (
                      <span className={`text-xs ml-2 ${taken ? 'text-slate-600' : 'text-slate-400'}`}>
                        {supp.dosage}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Scan Supplements */}
      <div className="bg-surface rounded-3xl p-5 mb-4 border border-surface-border">
        <h2 className="font-bold text-[15px] mb-4">Scan Supplements</h2>

        {!preview && (
          <div>
            <label className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-surface-border rounded-2xl cursor-pointer hover:border-accent/30 transition-colors">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              <span className="text-sm text-slate-400 font-medium">Tap to take a photo</span>
              <span className="text-xs text-slate-600">or choose from gallery</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {preview && !scanResults && (
          <div>
            <img src={preview} alt="Supplement photo" className="w-full rounded-2xl mb-4 max-h-64 object-cover" />
            <div className="flex gap-3">
              <button
                onClick={cancelScan}
                className="flex-1 py-3 bg-base border border-surface-border text-slate-400 font-bold rounded-2xl text-sm transition-all hover:text-white min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleIdentify}
                disabled={identifying}
                className="flex-1 py-3 bg-accent text-white font-bold rounded-2xl text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 min-h-[44px]"
              >
                {identifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Identifying...
                  </span>
                ) : 'Identify'}
              </button>
            </div>
          </div>
        )}

        {scanResults && (
          <div>
            {scanResults.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No supplements detected. Try another photo.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {scanResults.map((r, idx) => (
                  <div key={idx} className="bg-base rounded-2xl p-4 border border-surface-border">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">#{idx + 1}</span>
                      <button
                        onClick={() => removeScanResult(idx)}
                        className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={r.name}
                      onChange={e => updateScanResult(idx, 'name', e.target.value)}
                      placeholder="Name"
                      className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white text-sm font-medium mb-2 focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={r.dosage || ''}
                        onChange={e => updateScanResult(idx, 'dosage', e.target.value)}
                        placeholder="Dosage"
                        className="flex-1 px-3 py-2 bg-surface border border-surface-border rounded-xl text-white text-sm font-medium focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all"
                      />
                      <input
                        type="text"
                        value={r.brand || ''}
                        onChange={e => updateScanResult(idx, 'brand', e.target.value)}
                        placeholder="Brand"
                        className="flex-1 px-3 py-2 bg-surface border border-surface-border rounded-xl text-white text-sm font-medium focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={cancelScan}
                className="flex-1 py-3 bg-base border border-surface-border text-slate-400 font-bold rounded-2xl text-sm transition-all hover:text-white min-h-[44px]"
              >
                Cancel
              </button>
              {scanResults.length > 0 && (
                <button
                  onClick={saveScannedSupplements}
                  disabled={savingScanned}
                  className="flex-1 py-3 bg-accent text-white font-bold rounded-2xl text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 min-h-[44px]"
                >
                  {savingScanned ? 'Saving...' : 'Add to My List'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* My Supplements List */}
      <div className="bg-surface rounded-3xl p-5 mb-4 border border-surface-border">
        <h2 className="font-bold text-[15px] mb-4">My Supplements</h2>

        {supplements.length > 0 && (
          <div className="space-y-1 mb-4">
            {supplements.map(supp => (
              <div
                key={supp.id}
                className={`flex items-center justify-between py-2.5 px-3 rounded-2xl ${
                  supp.active ? '' : 'opacity-40'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{supp.name}</p>
                  <div className="flex gap-2 mt-0.5">
                    {supp.dosage && <span className="text-xs text-slate-400">{supp.dosage}</span>}
                    {supp.brand && <span className="text-xs text-slate-500">{supp.brand}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(supp)}
                    className="p-2 text-slate-600 hover:text-slate-300 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title={supp.active ? 'Deactivate' : 'Activate'}
                  >
                    {supp.active ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => deleteSupplement(supp.id)}
                    className="p-2 text-slate-600 hover:text-red-400 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {supplements.length === 0 && !showAddForm && (
          <p className="text-sm text-slate-500 text-center py-4 mb-3">No supplements yet. Add some manually or scan a photo.</p>
        )}

        {/* Add manually */}
        {showAddForm ? (
          <form onSubmit={handleAddManual} className="bg-base rounded-2xl p-4 border border-surface-border">
            <div className="mb-3">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Vitamin D3"
                className="w-full px-4 py-3 bg-surface border border-surface-border rounded-2xl text-white text-sm font-medium focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all"
              />
            </div>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Dosage</label>
                <input
                  type="text"
                  value={newDosage}
                  onChange={e => setNewDosage(e.target.value)}
                  placeholder="e.g. 5000 IU"
                  className="w-full px-4 py-3 bg-surface border border-surface-border rounded-2xl text-white text-sm font-medium focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Brand</label>
                <input
                  type="text"
                  value={newBrand}
                  onChange={e => setNewBrand(e.target.value)}
                  placeholder="e.g. NOW Foods"
                  className="w-full px-4 py-3 bg-surface border border-surface-border rounded-2xl text-white text-sm font-medium focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewName(''); setNewDosage(''); setNewBrand('') }}
                className="flex-1 py-3 bg-surface border border-surface-border text-slate-400 font-bold rounded-2xl text-sm transition-all hover:text-white min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingSupplement || !newName.trim()}
                className="flex-1 py-3 bg-accent text-white font-bold rounded-2xl text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 min-h-[44px]"
              >
                {addingSupplement ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3.5 border-2 border-dashed border-surface-border text-slate-500 font-bold rounded-2xl text-sm transition-all hover:border-accent/30 hover:text-accent min-h-[44px]"
          >
            + Add Manually
          </button>
        )}
      </div>

      {/* Bottom spacer */}
      <div className="h-8" />
    </div>
  )
}
