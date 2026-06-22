import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { CalEvent, CalendarData, DayData, Overnight } from '../types'

export function useCalendar() {
  const [data, setData] = useState<CalendarData>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    supabase.from('calendar').select('*').then(({ data: rows }) => {
      const result: CalendarData = {}
      rows?.forEach(row => { result[row.date_key] = row.data })
      setData(result)
      setLoading(false)
    })

    // Realtime subscription
    const channel = supabase
      .channel('calendar-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar' }, () => {
        supabase.from('calendar').select('*').then(({ data: rows }) => {
          const result: CalendarData = {}
          rows?.forEach(row => { result[row.date_key] = row.data })
          setData(result)
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  function getDay(dateKey: string): DayData {
    return data[dateKey] ?? { events: [] }
  }

  async function saveDay(dateKey: string, dayData: DayData) {
    await supabase.from('calendar').upsert({ date_key: dateKey, data: dayData })
  }

  async function setOvernight(dateKey: string, overnight: Overnight | undefined) {
    await saveDay(dateKey, { ...getDay(dateKey), overnight })
  }

  async function addEvent(dateKey: string, event: Omit<CalEvent, 'id'>) {
    const day = getDay(dateKey)
    const newEvent: CalEvent = { ...event, id: crypto.randomUUID() }
    await saveDay(dateKey, { ...day, events: [...day.events, newEvent] })
  }

  async function removeEvent(dateKey: string, eventId: string) {
    const day = getDay(dateKey)
    await saveDay(dateKey, { ...day, events: day.events.filter(e => e.id !== eventId) })
  }

  async function setNote(dateKey: string, note: string) {
    await saveDay(dateKey, { ...getDay(dateKey), note })
  }

  return { data, loading, getDay, setOvernight, addEvent, removeEvent, setNote }
}
