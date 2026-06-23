import { useEffect, useState, useRef, useMemo } from 'react'
import { supabase } from '../supabase'
import { editorNameFromSession } from '../lib/editorName'
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

  async function fetchAll() {
    const { data: rows, error } = await supabase.from('calendar').select('*')
    if (error) console.error('calendar fetch error:', error)
    if (rows) applyRows(rows)
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()

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
  async function optimistic(dateKey: string, dayData: DayData) {
    const { data: { session } } = await supabase.auth.getSession()
    const stamped: DayData = {
      ...dayData,
      updatedBy: editorNameFromSession(session),
      updatedAt: new Date().toISOString(),
    }
    const next = { ...dataRef.current, [dateKey]: stamped }
    dataRef.current = next
    setData({ ...next })
    supabase.from('calendar').upsert({ date_key: dateKey, data: stamped }).then(({ error }) => {
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

  const lastUpdate = useMemo(() => {
    let latest: { by: string; at: string; dateKey: string } | null = null
    for (const [dateKey, day] of Object.entries(data)) {
      if (!day.updatedAt || !day.updatedBy) continue
      if (!latest || day.updatedAt > latest.at) {
        latest = { by: day.updatedBy, at: day.updatedAt, dateKey }
      }
    }
    return latest
  }, [data])

  return { data, loading, getDay, refresh: fetchAll, lastUpdate, setOvernight, setFamilyDay, addEvent, removeEvent, setNote }
}
