import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase'
import type { CalEvent, CalendarData, DayData, Overnight } from '../types'

export function useCalendar() {
  const [data, setData] = useState<CalendarData>({})
  const [loading, setLoading] = useState(true)
  const dataRef = useRef<CalendarData>({})

  function applyRows(rows: { date_key: string; data: DayData }[]) {
    const result: CalendarData = {}
    rows.forEach(row => { result[row.date_key] = row.data })
    dataRef.current = result
    setData(result)
  }

  useEffect(() => {
    supabase.from('calendar').select('*').then(({ data: rows, error }) => {
      if (error) console.error('calendar fetch error:', error)
      if (rows) applyRows(rows)
      setLoading(false)
    })

    const channel = supabase
      .channel('calendar-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar' }, () => {
        supabase.from('calendar').select('*').then(({ data: rows }) => {
          if (rows) applyRows(rows)
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  function getDay(dateKey: string): DayData {
    return dataRef.current[dateKey] ?? { events: [] }
  }

  // Optimistically update local state, then persist
  function optimistic(dateKey: string, dayData: DayData) {
    const next = { ...dataRef.current, [dateKey]: dayData }
    dataRef.current = next
    setData({ ...next })
    supabase.from('calendar').upsert({ date_key: dateKey, data: dayData }).then(({ error }) => {
      if (error) console.error('calendar save error:', error)
    })
  }

  function setOvernight(dateKey: string, overnight: Overnight | undefined) {
    optimistic(dateKey, { ...getDay(dateKey), overnight })
  }

  function setFamilyDay(dateKey: string, familyDay: boolean) {
    optimistic(dateKey, { ...getDay(dateKey), familyDay })
  }

  function addEvent(dateKey: string, event: Omit<CalEvent, 'id'>) {
    const day = getDay(dateKey)
    const newEvent: CalEvent = { ...event, id: crypto.randomUUID() }
    optimistic(dateKey, { ...day, events: [...day.events, newEvent] })
  }

  function removeEvent(dateKey: string, eventId: string) {
    const day = getDay(dateKey)
    optimistic(dateKey, { ...day, events: day.events.filter(e => e.id !== eventId) })
  }

  function setNote(dateKey: string, note: string) {
    optimistic(dateKey, { ...getDay(dateKey), note })
  }

  return { data, loading, getDay, setOvernight, setFamilyDay, addEvent, removeEvent, setNote }
}
