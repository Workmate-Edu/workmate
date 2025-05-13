import { parseISO, format } from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'

export function toUTC(date: Date | string): Date {
  const localDate = typeof date === 'string' ? parseISO(date) : date
  return toZonedTime(localDate, Intl.DateTimeFormat().resolvedOptions().timeZone)
}

export function formatLocalDateTime(utcDate: string | Date, formatStr: string = 'PPpp'): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return formatInTimeZone(utcDate, timeZone, formatStr)
}

export function getCurrentUTCDate(): Date {
  return new Date(Date.now())
}

export function isOverdue(dueDate: string | Date): boolean {
  const now = getCurrentUTCDate()
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  return now > due
}
