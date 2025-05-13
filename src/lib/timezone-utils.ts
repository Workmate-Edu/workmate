// lib/timezone-utils.ts
import { formatInTimeZone, fromZonedTime } from "date-fns-tz"

// Update with comprehensive timezone list
export const TIMEZONE_OPTIONS = [
  // Africa
  { value: 'Africa/Lagos', label: 'West Africa Time (WAT)' },
  { value: 'Africa/Cairo', label: 'Eastern European Time (EET)' },
  { value: 'Africa/Johannesburg', label: 'South African Time (SAST)' },
  { value: 'Africa/Nairobi', label: 'East Africa Time (EAT)' },

  // Americas
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'America/Halifax', label: 'Atlantic Time (AT)' },
  { value: 'America/Sao_Paulo', label: 'Brasília Time (BRT)' },
  { value: 'America/Buenos_Aires', label: 'Argentina Time (ART)' },

  // Asia
  { value: 'Asia/Tokyo', label: 'Japan Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Time (CST)' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT)' },
  { value: 'Asia/Dubai', label: 'Gulf Time (GST)' },
  { value: 'Asia/Kolkata', label: 'India Time (IST)' },
  { value: 'Asia/Bangkok', label: 'Indochina Time (ICT)' },
  { value: 'Asia/Seoul', label: 'Korea Time (KST)' },

  // Europe
  { value: 'Europe/London', label: 'British Time (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Europe/Moscow', label: 'Moscow Time (MSK)' },
  { value: 'Europe/Istanbul', label: 'Turkey Time (TRT)' },

  // Oceania
  { value: 'Pacific/Auckland', label: 'New Zealand Time (NZT)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  { value: 'Australia/Perth', label: 'Australian Western Time (AWT)' },

  // UTC
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' }
].sort((a, b) => a.label.localeCompare(b.label))

export function formatSessionDateTime({
  date,
  teacherTimezone,
  format = "PPpp"
}: {
  date: string | Date,
  teacherTimezone: string,
  format?: string
}) {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    // Format in teacher's timezone
    return formatInTimeZone(dateObj, teacherTimezone, format)
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid date'
  }
}

/**
 * Show a “floating” ISO (no offset) as a UTC instant in two zones.
 */
export function convertTimeBetweenTimezones({
  dateStr,
  fromTimezone,
  toTimezone
}: {
  dateStr: string
  fromTimezone: string
  toTimezone: string
}) {
  const utcDate = fromZonedTime(dateStr, fromTimezone)
  const originalFormatted = formatInTimeZone(
    utcDate,
    fromTimezone,
    "MMM d, yyyy h:mm a zzz"
  )
  const convertedFormatted = formatInTimeZone(
    utcDate,
    toTimezone,
    "MMM d, yyyy h:mm a zzz"
  )
  return { originalFormatted, convertedFormatted }
}

/**
 * For assessments:
 * - teacherTime = clock + zone in teacher’s zone
 * - studentTime = full date-time + zone in student’s zone
 */
export function formatAssessmentDateTime({
  dateStr,
  teacherTimezone
}: {
  dateStr: string
  teacherTimezone: string
}) {
  const studentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const utcDate = fromZonedTime(dateStr, teacherTimezone)
  const teacherTime = formatInTimeZone(
    utcDate,
    teacherTimezone,
    "h:mm a zzz"
  )
  const studentTime = formatInTimeZone(
    utcDate,
    studentTimezone,
    "MMM d, yyyy h:mm a zzz"
  )
  return { teacherTime, studentTime }
}

export function formatDateTime({
  date,
  teacherTimezone
}: {
  date: string,
  teacherTimezone: string
}) {
  const studentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  // Format in teacher's timezone
  const teacherTime = formatInTimeZone(
    new Date(date),
    teacherTimezone,
    'h:mm a'
  )

  // Format in student's timezone
  const studentTime = formatInTimeZone(
    new Date(date),
    studentTimezone,
    "MMM d, yyyy h:mm a zzz"
  )

  return {
    studentTime,
    teacherTime: `Teacher's time (${teacherTimezone}): ${teacherTime}`
  }
}
