import { useState } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, addMonths, subMonths,
} from 'date-fns'
import type { CalendarData, Overnight } from '../types'
import DaySheet from './DaySheet'
import { useCalendar } from '../hooks/useCalendar'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

const OVERNIGHT_STYLES: Record<Overnight, string> = {
  lissi:  'bg-pink-50 border-pink-200',
  babs:   'bg-blue-50 border-blue-200',
  family: 'bg-purple-50 border-purple-200',
}

const LEGEND = [
  { value: 'lissi'  as Overnight, label: 'Lissi',  dot: 'bg-pink-300' },
  { value: 'babs'   as Overnight, label: 'Babs',   dot: 'bg-blue-300' },
  { value: 'family' as Overnight, label: 'Family', dot: 'bg-purple-400' },
]

export default function Calendar() {
  const [month, setMonth] = useState(new Date())
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const { getDay, setOvernight, addEvent, removeEvent, setNote } = useCalendar()

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end:   endOfWeek(endOfMonth(month),     { weekStartsOn: 1 }),
  })

  const selectedDay = selectedKey ? getDay(selectedKey) : null

  return (
    <div className="max-w-sm mx-auto min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-2">
        <button onClick={() => setMonth(m => subMonths(m, 1))} className="text-gray-400 text-2xl px-1">‹</button>
        <span className="font-semibold text-gray-800">{format(month, 'MMMM yyyy')}</span>
        <button onClick={() => setMonth(m => addMonths(m, 1))} className="text-gray-400 text-2xl px-1">›</button>
      </div>

      {/* Legend */}
      <div className="flex gap-3 px-4 pb-2">
        {LEGEND.map(l => (
          <div key={l.value} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${l.dot}`} />
            <span className="text-xs text-gray-500">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 px-3 mb-1">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 px-3 flex-1">
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd')
          const dayData = getDay(key)
          const inMonth = isSameMonth(day, month)
          const today = isToday(day)
          const overnightStyle = dayData.overnight ? OVERNIGHT_STYLES[dayData.overnight] : 'bg-white border-gray-100'
          const selected = selectedKey === key

          return (
            <button
              key={key}
              onClick={() => setSelectedKey(selected ? null : key)}
              className={`
                min-h-[48px] rounded-lg border text-left p-1 transition-all
                ${inMonth ? overnightStyle : 'bg-white border-gray-50 opacity-30'}
                ${selected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
              `}
            >
              <span className={`text-[10px] font-medium block ${today ? 'text-blue-500' : 'text-gray-700'}`}>
                {format(day, 'd')}
              </span>
              {dayData.events.length > 0 && (
                <div className="w-1 h-1 rounded-full bg-blue-400 mt-0.5" />
              )}
              {dayData.note && (
                <div className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
              )}
            </button>
          )
        })}
      </div>

      {/* Sign out */}
      <div className="text-center py-4">
        <button onClick={() => signOut(auth)} className="text-xs text-gray-300">Sign out</button>
      </div>

      {/* Bottom sheet */}
      {selectedKey && selectedDay && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedKey(null)} />
          <DaySheet
            dateKey={selectedKey}
            day={selectedDay}
            onClose={() => setSelectedKey(null)}
            onSetOvernight={o => setOvernight(selectedKey, o)}
            onAddEvent={e => addEvent(selectedKey, e)}
            onRemoveEvent={id => removeEvent(selectedKey, id)}
            onSetNote={n => setNote(selectedKey, n)}
          />
        </>
      )}
    </div>
  )
}
