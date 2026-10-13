export type AppEnvironment = 'development' | 'staging' | 'production'

export interface RuntimeConfig {
  firebaseApiKey: string | null
  firebaseAuthDomain: string | null
  firebaseProjectId: string | null
  firebaseStorageBucket: string | null
  firebaseMessagingSenderId: string | null
  firebaseAppId: string | null
  firebaseMeasurementId: string | null
  appEnvironment: AppEnvironment
  firebaseConfigured: boolean
  supabaseUrl: string | null
  supabaseAnonKey: string | null
  supabaseConfigured: boolean
}

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function getRuntimeConfig(env: ImportMetaEnv = import.meta.env): RuntimeConfig {
  const firebaseApiKey = clean(env.VITE_FIREBASE_API_KEY) || clean(env.VITE_SUPABASE_ANON_KEY)
  const firebaseAuthDomain = clean(env.VITE_FIREBASE_AUTH_DOMAIN)
  const supabaseUrl = clean(env.VITE_SUPABASE_URL)
  const supabaseAnonKey = clean(env.VITE_SUPABASE_ANON_KEY)
  const firebaseProjectId = clean(env.VITE_FIREBASE_PROJECT_ID) || (supabaseUrl ? new URL(supabaseUrl).hostname : null)
  const firebaseStorageBucket = clean(env.VITE_FIREBASE_STORAGE_BUCKET)
  const firebaseMessagingSenderId = clean(env.VITE_FIREBASE_MESSAGING_SENDER_ID)
  const firebaseAppId = clean(env.VITE_FIREBASE_APP_ID)
  const firebaseMeasurementId = clean(env.VITE_FIREBASE_MEASUREMENT_ID)
  const appEnvironment = env.VITE_APP_ENV ?? 'development'

  const firebaseConfigured = Boolean((firebaseApiKey && firebaseProjectId) || (supabaseUrl && supabaseAnonKey))

  return {
    firebaseApiKey,
    firebaseAuthDomain,
    firebaseProjectId,
    firebaseStorageBucket,
    firebaseMessagingSenderId,
    firebaseAppId,
    firebaseMeasurementId,
    appEnvironment,
    firebaseConfigured,
    supabaseUrl,
    supabaseAnonKey,
    supabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  }
}
