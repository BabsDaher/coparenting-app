export type Overnight = 'lissi' | 'babs' | 'family'

export interface CalEvent {
  id: string
  title: string
  time?: string
}

export interface DayData {
  overnight?: Overnight
  events: CalEvent[]
  note?: string
}

// Firestore document keyed by 'YYYY-MM-DD'
export type CalendarData = Record<string, DayData>
