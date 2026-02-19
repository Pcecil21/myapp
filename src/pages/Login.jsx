import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { user, signUp, signInWithPassword, signInWithEmail } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [staySignedIn, setStaySignedIn] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)

  if (user) return <Navigate to="/" replace />

  const resetForm = () => { setError(''); setPassword(''); setConfirmPassword('') }

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    const { error } = await signInWithPassword(email, password)
    setLoading(false)
    if (error) setError(error.message)
  }

  const handleSignUp = async (e) => {
    e.preventDefault(); setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    const { data, error } = await signUp(email, password)
    setLoading(false)
    if (error) setError(error.message)
    else if (data?.user && !data.session) setSignupSuccess(true)
  }

  const handleMagicLink = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    const { error } = await signInWithEmail(email)
    setLoading(false)
    if (error) setError(error.message)
    else setMagicSent(true)
  }

  const inputClass = "w-full px-4 py-4 bg-surface-elevated border border-surface-border rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-accent/50 focus:border-accent/50 text-[15px] transition-all duration-200"

  return (
    <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0c0d12 0%, #0f1923 50%, #0c0d12 100%)' }}>
      {/* Decorative glow orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
      <div className="absolute bottom-[-30%] right-[-15%] w-[600px] h-[600px] rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent/10 mb-5 glow-accent">
            <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h2.25m13.5 0H21m-3.75 0V4.875c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125V7.5m3.75 0h-3.75m-6 0V4.875c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125V7.5m3.75 0h-3.75M3 16.5h2.25m13.5 0H21m-3.75 0v2.625c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 01-1.125-1.125V16.5m3.75 0h-3.75m-6 0v2.625c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 01-1.125-1.125V16.5m3.75 0h-3.75M3 12h18" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">FitTrack</h1>
          <p className="text-slate-400 mt-2 text-[15px]">Track your gains, fuel your progress</p>
        </div>

        {/* Sign-up success */}
        {signupSuccess && (
          <div className="bg-surface rounded-3xl p-7 text-center border border-surface-border">
            <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Account created!</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Check your email at <span className="text-white font-medium">{email}</span> to confirm your account.
            </p>
            <button onClick={() => { setSignupSuccess(false); setMode('login'); resetForm() }}
              className="mt-6 text-accent text-sm font-semibold min-h-[44px]">
              Go to Login
            </button>
          </div>
        )}

        {/* Magic link sent */}
        {magicSent && !signupSuccess && (
          <div className="bg-surface rounded-3xl p-7 text-center border border-surface-border">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We sent a magic link to <span className="text-white font-medium">{email}</span>
            </p>
            <button onClick={() => { setMagicSent(false); setMode('login'); resetForm() }}
              className="mt-6 text-accent text-sm font-semibold min-h-[44px]">
              Back to Login
            </button>
          </div>
        )}

        {/* Login form */}
        {mode === 'login' && !signupSuccess && !magicSent && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-surface rounded-3xl p-6 border border-surface-border space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" required className={inputClass} />
              </div>

              <label className="flex items-center gap-3 cursor-pointer py-1">
                <button type="button" onClick={() => setStaySignedIn(p => !p)}
                  className={`w-11 h-[26px] rounded-full relative transition-colors duration-200 ${staySignedIn ? 'bg-accent' : 'bg-surface-elevated'}`}>
                  <span className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${staySignedIn ? 'left-[22px]' : 'left-[3px]'}`} />
                </button>
                <span className="text-sm text-slate-300">Stay signed in</span>
              </label>
            </div>

            {error && <p className="text-danger text-sm text-center px-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-accent hover:bg-accent-light text-white font-bold rounded-2xl transition-all duration-200 disabled:opacity-50 text-[15px] min-h-[52px] glow-accent active:scale-[0.98]">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button type="button" onClick={() => { setMode('magic'); resetForm() }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors min-h-[44px]">
              Forgot password? Send a magic link instead
            </button>

            <p className="text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <button type="button" onClick={() => { setMode('signup'); resetForm() }}
                className="text-accent font-semibold hover:text-accent-light transition-colors">
                Sign up
              </button>
            </p>
          </form>
        )}

        {/* Sign-up form */}
        {mode === 'signup' && !signupSuccess && !magicSent && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="bg-surface rounded-3xl p-6 border border-surface-border space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters" required minLength={6} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password" required minLength={6} className={inputClass} />
              </div>
            </div>

            {error && <p className="text-danger text-sm text-center px-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-accent hover:bg-accent-light text-white font-bold rounded-2xl transition-all duration-200 disabled:opacity-50 text-[15px] min-h-[52px] glow-accent active:scale-[0.98]">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); resetForm() }}
                className="text-accent font-semibold hover:text-accent-light transition-colors">
                Sign in
              </button>
            </p>
          </form>
        )}

        {/* Magic link form */}
        {mode === 'magic' && !signupSuccess && !magicSent && (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="bg-surface rounded-3xl p-6 border border-surface-border space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required className={inputClass} />
              </div>
            </div>

            {error && <p className="text-danger text-sm text-center px-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-accent hover:bg-accent-light text-white font-bold rounded-2xl transition-all duration-200 disabled:opacity-50 text-[15px] min-h-[52px] glow-accent active:scale-[0.98]">
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>

            <p className="text-center text-sm text-slate-400">
              <button type="button" onClick={() => { setMode('login'); resetForm() }}
                className="text-accent font-semibold hover:text-accent-light transition-colors">
                Back to login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
