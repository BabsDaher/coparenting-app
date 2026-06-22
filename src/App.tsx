import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Session } from '@supabase/supabase-js'
import LoginScreen from './components/LoginScreen'
import Calendar from './components/Calendar'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setChecking(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (checking) return null
  return session ? <Calendar /> : <LoginScreen />
}
