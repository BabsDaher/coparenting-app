export type Overnight = 'lissi' | 'babs'

export interface CalEvent {
  id: string
  title: string
  time?: string
}

export interface DayData {
  overnight?: Overnight
  familyDay?: boolean
  events: CalEvent[]
  note?: string
  updatedBy?: string
  updatedAt?: string
}

// Firestore document keyed by 'YYYY-MM-DD'
export type CalendarData = Record<string, DayData>
