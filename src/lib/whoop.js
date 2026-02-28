import { supabase } from './supabase'

// Whoop OAuth configuration
// Set these in your .env file:
//   VITE_WHOOP_CLIENT_ID=your_client_id
//   VITE_WHOOP_CLIENT_SECRET=your_client_secret
const WHOOP_CLIENT_ID = import.meta.env.VITE_WHOOP_CLIENT_ID
const WHOOP_CLIENT_SECRET = import.meta.env.VITE_WHOOP_CLIENT_SECRET
const WHOOP_REDIRECT_URI = `${window.location.origin}/whoop/callback`
const WHOOP_API_BASE = 'https://api.prod.whoop.com/developer/v1'
const WHOOP_AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth'
const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token'

const SCOPES = [
  'read:recovery',
  'read:cycles',
  'read:sleep',
  'read:workout',
  'read:profile',
  'read:body_measurement',
].join(' ')

/**
 * Redirect user to Whoop OAuth authorization page
 */
export function startWhoopAuth() {
  const params = new URLSearchParams({
    client_id: WHOOP_CLIENT_ID,
    redirect_uri: WHOOP_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    state: crypto.randomUUID(),
  })
  window.location.href = `${WHOOP_AUTH_URL}?${params}`
}

/**
 * Exchange authorization code for access + refresh tokens
 */
export async function exchangeWhoopCode(code) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: WHOOP_CLIENT_ID,
    client_secret: WHOOP_CLIENT_SECRET,
    redirect_uri: WHOOP_REDIRECT_URI,
  })

  const res = await fetch(WHOOP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token exchange failed: ${err}`)
  }

  return res.json() // { access_token, refresh_token, expires_in, ... }
}

/**
 * Refresh an expired access token
 */
async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: WHOOP_CLIENT_ID,
    client_secret: WHOOP_CLIENT_SECRET,
  })

  const res = await fetch(WHOOP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) throw new Error('Token refresh failed')
  return res.json()
}

/**
 * Save Whoop connection tokens to Supabase
 */
export async function saveWhoopConnection(userId, tokenData) {
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()

  const { error } = await supabase.from('whoop_connections').upsert({
    user_id: userId,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: expiresAt,
    connected: true,
  }, { onConflict: 'user_id' })

  if (error) throw error
}

/**
 * Get a valid access token, refreshing if needed
 */
async function getAccessToken(userId) {
  const { data } = await supabase
    .from('whoop_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('connected', true)
    .single()

  if (!data) return null

  // Check if token is expired (with 5 min buffer)
  if (new Date(data.expires_at) < new Date(Date.now() + 5 * 60 * 1000)) {
    try {
      const newTokens = await refreshAccessToken(data.refresh_token)
      await saveWhoopConnection(userId, newTokens)
      return newTokens.access_token
    } catch {
      // Refresh failed, disconnect
      await disconnectWhoop(userId)
      return null
    }
  }

  return data.access_token
}

/**
 * Make an authenticated request to the Whoop API
 */
async function whoopFetch(userId, endpoint) {
  const token = await getAccessToken(userId)
  if (!token) return null

  const res = await fetch(`${WHOOP_API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) return null
  return res.json()
}

/**
 * Fetch and store the latest Whoop recovery data
 */
export async function syncWhoopData(userId) {
  const [recovery, cycle, sleep] = await Promise.all([
    whoopFetch(userId, '/recovery?limit=1&order=t'),
    whoopFetch(userId, '/cycle?limit=1&order=t'),
    whoopFetch(userId, '/sleep?limit=1&order=t'),
  ])

  const latestRecovery = recovery?.records?.[0]
  const latestCycle = cycle?.records?.[0]
  const latestSleep = sleep?.records?.[0]

  if (!latestRecovery && !latestCycle && !latestSleep) return null

  const today = new Date().toISOString().split('T')[0]

  const entry = {
    user_id: userId,
    date: today,
    recovery_score: latestRecovery?.score?.recovery_score ?? null,
    hrv_rmssd: latestRecovery?.score?.hrv_rmssd_milli != null
      ? latestRecovery.score.hrv_rmssd_milli
      : null,
    resting_hr: latestRecovery?.score?.resting_heart_rate ?? null,
    spo2_pct: latestRecovery?.score?.spo2_percentage ?? null,
    day_strain: latestCycle?.score?.strain ?? null,
    calories_burned: latestCycle?.score?.kilojoule != null
      ? Math.round(latestCycle.score.kilojoule / 4.184)
      : null,
    sleep_duration_min: latestSleep?.score?.stage_summary
      ? Math.round(
          (latestSleep.score.stage_summary.total_light_sleep_time_milli +
           latestSleep.score.stage_summary.total_slow_wave_sleep_time_milli +
           latestSleep.score.stage_summary.total_rem_sleep_time_milli) / 60000
        )
      : null,
    sleep_efficiency: latestSleep?.score?.sleep_efficiency_percentage ?? null,
  }

  const { data, error } = await supabase
    .from('whoop_data')
    .upsert(entry, { onConflict: 'user_id,date' })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get today's Whoop data from local cache
 */
export async function getTodayWhoopData(userId) {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('whoop_data')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()
  return data
}

/**
 * Get Whoop data for the last N days (for trends)
 */
export async function getWhoopTrends(userId, days = 14) {
  const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
  const { data } = await supabase
    .from('whoop_data')
    .select('*')
    .eq('user_id', userId)
    .gte('date', since)
    .order('date')
  return data || []
}

/**
 * Check if user has a connected Whoop account
 */
export async function getWhoopConnection(userId) {
  const { data } = await supabase
    .from('whoop_connections')
    .select('connected')
    .eq('user_id', userId)
    .maybeSingle()
  return data?.connected || false
}

/**
 * Disconnect Whoop account
 */
export async function disconnectWhoop(userId) {
  await supabase
    .from('whoop_connections')
    .update({ connected: false, access_token: null, refresh_token: null })
    .eq('user_id', userId)
}
