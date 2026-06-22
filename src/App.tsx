import { useEffect, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from './firebase'
import LoginScreen from './components/LoginScreen'
import Calendar from './components/Calendar'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u)
      setChecking(false)
    })
  }, [])

  if (checking) return null
  return user ? <Calendar /> : <LoginScreen />
}
