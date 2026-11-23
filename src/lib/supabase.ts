import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? ''
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? ''

const isPlaceholderUrl =
  !supabaseUrl ||
  supabaseUrl.includes('seu-projeto') ||
  supabaseUrl.includes('your-project') ||
  !supabaseUrl.startsWith('https://')

const isPlaceholderKey =
  !supabaseAnonKey ||
  supabaseAnonKey.includes('sua-chave') ||
  supabaseAnonKey.includes('your-anon') ||
  supabaseAnonKey.length < 20

export const isSupabaseConfigured = !isPlaceholderUrl && !isPlaceholderKey

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
