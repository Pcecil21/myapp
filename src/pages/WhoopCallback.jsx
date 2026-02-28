import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { exchangeWhoopCode, saveWhoopConnection, syncWhoopData } from '../lib/whoop'

export default function WhoopCallback() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('connecting')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    const code = searchParams.get('code')
    if (!code) {
      setStatus('error')
      setError('No authorization code received from Whoop.')
      return
    }
    handleCallback(code)
  }, [user])

  async function handleCallback(code) {
    try {
      setStatus('connecting')
      const tokenData = await exchangeWhoopCode(code)

      setStatus('saving')
      await saveWhoopConnection(user.id, tokenData)

      setStatus('syncing')
      await syncWhoopData(user.id)

      setStatus('success')
      setTimeout(() => navigate('/settings'), 1500)
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Failed to connect Whoop account.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-dvh px-5">
      <div className="bg-surface rounded-3xl p-8 w-full max-w-sm border border-surface-border text-center animate-fade-in">
        {status === 'connecting' && (
          <>
            <Spinner />
            <h2 className="text-lg font-extrabold mt-4">Connecting to Whoop</h2>
            <p className="text-sm text-slate-500 mt-1">Exchanging authorization...</p>
          </>
        )}

        {status === 'saving' && (
          <>
            <Spinner />
            <h2 className="text-lg font-extrabold mt-4">Saving Connection</h2>
            <p className="text-sm text-slate-500 mt-1">Storing your Whoop credentials...</p>
          </>
        )}

        {status === 'syncing' && (
          <>
            <Spinner />
            <h2 className="text-lg font-extrabold mt-4">Syncing Data</h2>
            <p className="text-sm text-slate-500 mt-1">Pulling your latest Whoop metrics...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-lg font-extrabold mt-4">Whoop Connected!</h2>
            <p className="text-sm text-slate-500 mt-1">Redirecting to settings...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-extrabold mt-4">Connection Failed</h2>
            <p className="text-sm text-slate-500 mt-2">{error}</p>
            <button
              onClick={() => navigate('/settings')}
              className="mt-5 w-full py-3.5 bg-surface-elevated hover:bg-surface-border text-slate-300 font-bold rounded-2xl transition-all duration-200 min-h-[48px]"
            >
              Back to Settings
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
      <svg className="w-7 h-7 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}
