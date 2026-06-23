import { addDays, format } from 'date-fns'
import type { CalendarData, Overnight } from '../types'

export const OVERNIGHT_LABELS: Record<Overnight, string> = {
  lissi: 'Lissi',
  babs: 'Babs',
}

export function getTonightStatus(
  data: CalendarData,
  today: Date,
): { overnight: Overnight | null; lines: string[] } {
  const todayKey = format(today, 'yyyy-MM-dd')
  const overnight = data[todayKey]?.overnight
  if (!overnight) return { overnight: null, lines: [] }

  const name = OVERNIGHT_LABELS[overnight]
  let forwardStreak = 0
  let d = addDays(today, 1)
  while (data[format(d, 'yyyy-MM-dd')]?.overnight === overnight) {
    forwardStreak++
    d = addDays(d, 1)
  }

  const lines: string[] = []
  if (forwardStreak === 0) {
    lines.push(`Otis is with ${name} tonight.`)
  } else if (forwardStreak === 1) {
    lines.push(`Otis is with ${name} tonight and tomorrow.`)
  } else {
    lines.push(`Otis is with ${name} tonight, and the next ${forwardStreak} days.`)
  }

  const nextOvernight = data[format(d, 'yyyy-MM-dd')]?.overnight
  if (nextOvernight && nextOvernight !== overnight) {
    const nextName = OVERNIGHT_LABELS[nextOvernight]
    if (forwardStreak === 0) {
      lines.push(`Tomorrow night he is with ${nextName}.`)
    } else {
      lines.push(`Then he is with ${nextName}.`)
    }
  }

  return { overnight, lines }
}
