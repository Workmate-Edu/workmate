"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Lock,
  ArrowLeft,
} from "lucide-react"
import TimezoneSelect, { ITimezone } from "react-timezone-select"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip"


const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

// Helper to get next month's date in YYYY-MM-DD
function getNextMonthDate(fromDate?: string) {
  const base = fromDate ? new Date(fromDate) : new Date()
  const nextMonth = new Date(base)
  nextMonth.setMonth(base.getMonth() + 1)
  return nextMonth.toISOString().slice(0, 10)
}

// Format a "HH:MM" time string into "hh:mm AM/PM" in the selected timezone, showing the time as entered (not converted to local time)
function formatTimeDisplay(time: string, timezone: string) {
  if (!time) return ""
  // Instead of using Date, just display the input time as-is in the selected timezone
  // This avoids browser conversion and always shows the time the parent/student picked
  // Example: "10:00 AM (Africa/Lagos)"
  const [hour, minute] = time.split(":")
  let hourNum = Number(hour)
  let ampm = "AM"
  if (hourNum >= 12) {
    ampm = "PM"
    if (hourNum > 12) hourNum -= 12
  }
  if (hourNum === 0) hourNum = 12
  const formatted = `${hourNum}:${minute.padStart(2, "0")} ${ampm}`
  // return `${formatted} (${timezone})`
  return `${formatted}`

}

// Check if two time ranges overlap
function isTimeOverlap(startA: string, endA: string, startB: string, endB: string) {
  return startA < endB && endA > startB
}

export default function ChildAvailabilityPage({
  params,
}: {
  params: { childId: string }
}) {
  const { data: session } = useSession()
  const router = useRouter()

  // new: store child's name
  const [childName, setChildName] = useState<string>("")

  // availability state
  const [days, setDays] = useState<
    {
      day: string
      slots: {
        start: string
        end: string
        startDisplay?: string
        endDisplay?: string
      }[]
    }[]
  >([])
  const [validFrom, setValidFrom] = useState<string>("")
  const [validTo, setValidTo] = useState<string>("")
  const [timezone, setTimezone] = useState<ITimezone>({
    value: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])

  // Helper: check if there are unsaved changes (new slots or changes to days)
  const [formDirty, setFormDirty] = useState(false)

  // Track changes to days/slots to enable Save button only when there are changes
  useEffect(() => {
    setFormDirty(days.some((d) => d.slots.some((slot) => slot.start || slot.end)))
  }, [days])

  // 0) fetch child info
  useEffect(() => {
    async function loadChild() {
      try {
        const res = await fetch(`/api/parent/children/${params.childId}`)
        if (!res.ok) throw new Error("Failed to load child")
        const { child } = await res.json()
        setChildName(child.name)
      } catch {
        setChildName("Your child")
      }
    }
    loadChild()
  }, [params.childId])

  // 1) Load existing availability
  useEffect(() => {
    async function loadAvailability() {
      setLoading(true)
      const res = await fetch(
        `/api/parent/children/${params.childId}/availability`
      )
      if (res.ok) {
        const data = await res.json()
        setDays(data.days || [])
        // Lock validFrom and validTo for one month window
        const initialFrom = data.validFrom
          ? new Date(data.validFrom).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10)
        const initialTo = getNextMonthDate(initialFrom)
        setValidFrom(initialFrom)
        setValidTo(initialTo)
        setTimezone({ value: data.timezone || timezone.value })
      } else {
        const initialFrom = new Date().toISOString().slice(0, 10)
        const initialTo = getNextMonthDate(initialFrom)
        setValidFrom(initialFrom)
        setValidTo(initialTo)
      }
      setLoading(false)
    }
    loadAvailability()
  }, [params.childId])

  // 2) Clamp validTo to one month after validFrom
  useEffect(() => {
    if (!validFrom) return
    setValidTo((prev) => {
      const clampTo = getNextMonthDate(validFrom)
      if (!prev || prev < validFrom) return clampTo
      return prev > clampTo ? clampTo : prev
    })
  }, [validFrom])

  // 3) Fetch all booked sessions (one‑offs + recurrences) in our window
  // useEffect(() => {
  //   async function loadSessions() {
  //     if (!validFrom || !validTo) return
  //     try {
  //       const res = await fetch(
  //         `/api/parent/children/${params.childId}/sessions?from=${validFrom}&to=${validTo}`
  //       )
  //       setSessions(res.ok ? await res.json() : [])
  //     } catch {
  //       setSessions([])
  //     }
  //   }
  //   loadSessions()
  // }, [params.childId, validFrom, validTo])

    // 3) Fetch only future sessions (one‑offs + recurrences still active) in our window
  useEffect(() => {
    async function loadSessions() {
      if (!validFrom || !validTo) return
      try {
        const res = await fetch(
          `/api/parent/children/${params.childId}/sessions?from=${validFrom}&to=${validTo}`
        )
        if (!res.ok) throw new Error()
        const all = await res.json()
        const now = new Date()
        // filter out past one‑offs and ended recurrences
        const upcoming = all.filter((s: any) => {
          if (s.recurrence?.isRecurring) {
            return new Date(s.recurrence.endDate) > now
          } else {
            return new Date(s.startTime) > now
          }
        })
        setSessions(upcoming)
      } catch {
        setSessions([])
      }
    }
    loadSessions()
  }, [params.childId, validFrom, validTo])


  // Return locked slots for a given weekday, including recurrences
  // function getBookedSlots(day: string) {
  //   const dayIdx = [
  //     "Sunday",
  //     "Monday",
  //     "Tuesday",
  //     "Wednesday",
  //     "Thursday",
  //     "Friday",
  //     "Saturday",
  //   ].indexOf(day)
  //   const windowStart = new Date(validFrom)
  //   const windowEnd = new Date(validTo)

  //   return sessions.flatMap((s) => {
  //     // Recurring
  //     if (s.recurrence?.isRecurring && Array.isArray(s.recurrence.daysOfWeek)) {
  //       const recStart = new Date(s.recurrence.startDate)
  //       const recEnd = new Date(s.recurrence.endDate)
  //       if (
  //         s.recurrence.daysOfWeek.includes(dayIdx) &&
  //         recEnd >= windowStart &&
  //         recStart <= windowEnd
  //       ) {
  //         return [
  //           {
  //             start: new Date(s.startTime).toTimeString().slice(0, 5),
  //             end: new Date(s.endTime).toTimeString().slice(0, 5),
  //           },
  //         ]
  //       }
  //       return []
  //     }
  //     // One‑off
  //     const d = new Date(s.startTime)
  //     if (d.getDay() === dayIdx) {
  //       return [
  //         {
  //           start: d.toTimeString().slice(0, 5),
  //           end: new Date(s.endTime).toTimeString().slice(0, 5),
  //         },
  //       ]
  //     }
  //     return []
  //   })
  // }

   function getBookedSlots(day: string) {
    const dayIdx = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].indexOf(day)
    const windowStart = new Date(validFrom)
    const windowEnd = new Date(validTo)
    return sessions.flatMap(s => {
      // Recurring
      if (s.recurrence?.isRecurring && Array.isArray(s.recurrence.daysOfWeek)) {
        const recStart = new Date(s.recurrence.startDate)
        const recEnd = new Date(s.recurrence.endDate)
        if (s.recurrence.daysOfWeek.includes(dayIdx) && recEnd >= windowStart && recStart <= windowEnd) {
          return [{ start: new Date(s.startTime).toTimeString().slice(0,5), end: new Date(s.endTime).toTimeString().slice(0,5) }]
        }
        return []
      }
      // One‑off
      const d = new Date(s.startTime)
      if (d.getDay() === dayIdx && d >= windowStart && d <= windowEnd) {
        return [{ start: d.toTimeString().slice(0,5), end: new Date(s.endTime).toTimeString().slice(0,5) }]
      }
      return []
    })
  }
  

  // Check if a slot overlaps any booked slot
  function isSlotBooked(day: string, slot: { start: string; end: string }) {
    return getBookedSlots(day).some((b) =>
      isTimeOverlap(slot.start, slot.end, b.start, b.end)
    )
  }

  // slot handlers unchanged…
  const handleAddSlot = (day: string) => {
    setDays((prev) => {
      const found = prev.find((d) => d.day === day)
      if (found) {
        return prev.map((d) =>
          d.day === day
            ? { ...d, slots: [...d.slots, { start: "", end: "" }] }
            : d
        )
      }
      return [...prev, { day, slots: [{ start: "", end: "" }] }]
    })
  }

  const handleSlotChange = (
    day: string,
    idx: number,
    field: "start" | "end",
    value: string
  ) => {
    setDays((prev) =>
      prev.map((d) =>
        d.day === day
          ? {
              ...d,
              slots: d.slots.map((slot, i) =>
                i === idx
                  ? {
                      ...slot,
                      [field]: value,
                      startDisplay:
                        field === "start"
                          ? formatTimeDisplay(value, timezone.value)
                          : slot.startDisplay,
                      endDisplay:
                        field === "end"
                          ? formatTimeDisplay(value, timezone.value)
                          : slot.endDisplay,
                    }
                  : slot
              ),
            }
          : d
      )
    )
  }

  const handleRemoveSlot = (day: string, idx: number) => {
    const slot = days.find((d) => d.day === day)!.slots[idx]
    // Only prevent removal if slot is locked (has a session booked)
    if (isSlotBooked(day, slot)) return
    setDays((prev) =>
      prev
        .map((d) =>
          d.day === day
            ? { ...d, slots: d.slots.filter((_, i) => i !== idx) }
            : d
        )
        .filter((d) => d.slots.length > 0)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validFrom || !validTo || days.length === 0 || !timezone.value) {
      toast.error("Please fill out all fields")
      return
    }
    setLoading(true)
    const res = await fetch(
      `/api/parent/children/${params.childId}/availability`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, validFrom, validTo, timezone: timezone.value }),
      }
    )
    if (res.ok) {
      toast.success("Saved!")
      router.push(`/dashboard/parent/children/${params.childId}`)
    } else {
      toast.error("Save failed")
    }
    setLoading(false)
  }

  return (
    <TooltipProvider>
      <div className="max-w-3xl mx-auto py-4 px-2 sm:px-4">
        <Button
          variant="outline"
          size="sm"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        <Card className="p-4 sm:p-8">
          <h1 className="text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            {`Set ${childName.split(" ")[0]}’s Weekly Availability`}
          </h1>
          <p className="mb-4 text-muted-foreground">
            Slots marked 🔒 are already booked and can’t be changed until your current one‑month period ends.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* validity window */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="relative">
                <label className="font-medium">From</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <input
                      type="date"
                      value={validFrom}
                      disabled
                      className="border rounded px-3 py-2 w-full mt-1 bg-gray-100 cursor-not-allowed"
                      required
                      title={`Update can be made only by next month (${getNextMonthDate(validFrom)})`}
                      aria-label={`Update can be made only by next month (${getNextMonthDate(validFrom)})`}
                      data-tooltip
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="z-50 max-w-xs text-xs">
                    Update can be made only by next month ({getNextMonthDate(validFrom)})
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <label className="font-medium">To</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <input
                      type="date"
                      value={validTo}
                      disabled
                      className="border rounded px-3 py-2 w-full mt-1 bg-gray-100 cursor-not-allowed"
                      required
                      title={`Update can be made only by next month (${getNextMonthDate(validFrom)})`}
                      aria-label={`Update can be made only by next month (${getNextMonthDate(validFrom)})`}
                      data-tooltip
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="z-50 max-w-xs text-xs">
                    Update can be made only by next month ({getNextMonthDate(validFrom)})
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* timezone */}
            <div>
              <label className="font-medium mb-2 block">Timezone</label>
              <TimezoneSelect value={timezone} onChange={setTimezone} />
              <span className="text-xs text-muted-foreground mt-1 block">
                All slots below use this timezone: <strong>{timezone.value}</strong>
              </span>
            </div>

            {/* slots table */}
            <div>
              <label className="font-medium mb-2 block">
                Weekly Availability
              </label>
              <div className="overflow-x-auto">
                <table className="min-w-full border rounded-lg bg-background shadow-sm text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="py-2 px-2 sm:px-4 bg-primary/10 text-primary text-left rounded-tl-lg">
                        Day
                      </th>
                      <th className="py-2 px-2 sm:px-4 bg-primary/10 text-primary text-left">
                        Slots
                      </th>
                      <th className="py-2 px-2 sm:px-4 bg-primary/10 rounded-tr-lg" />
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day) => {
                      const row = days.find((d) => d.day === day)
                      return (
                        <tr key={day} className="border-b last:border-b-0">
                          <td className="py-2 px-2 sm:px-4 font-semibold">{day}</td>
                          <td className="py-2 px-2 sm:px-4">
                            {row?.slots.length ? (
                              <div className="flex flex-wrap gap-2">
                                {row.slots.map((slot, i) => {
                                  const booked = isSlotBooked(day, slot)
                                  const pastLock =
                                    validFrom < new Date().toISOString().slice(0, 10)
                                  return (
                                    <div
                                      key={i}
                                      className={`flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 px-2 py-1 rounded ${
                                        booked
                                          ? "bg-gray-200 text-gray-500"
                                          : "bg-primary/5"
                                      }`}
                                    >
                                      <div className="flex gap-1 items-center">
                                        <input
                                          type="time"
                                          value={slot.start}
                                          onChange={(e) =>
                                            handleSlotChange(
                                              day,
                                              i,
                                              "start",
                                              e.target.value
                                            )
                                          }
                                          className="border rounded px-2 py-1 w-20 sm:w-24"
                                          required
                                          disabled={booked}
                                        />
                                        <span>to</span>
                                        <input
                                          type="time"
                                          value={slot.end}
                                          onChange={(e) =>
                                            handleSlotChange(
                                              day,
                                              i,
                                              "end",
                                              e.target.value
                                            )
                                          }
                                          className="border rounded px-2 py-1 w-20 sm:w-24"
                                          required
                                          disabled={booked}
                                        />
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {slot.startDisplay ||
                                          formatTimeDisplay(
                                            slot.start,
                                            timezone.value
                                          )}{" "}
                                        –{" "}
                                        {slot.endDisplay ||
                                          formatTimeDisplay(
                                            slot.end,
                                            timezone.value
                                          )}
                                      </span>
                                      {booked ? (
                                        <Lock className="w-4 h-4 text-gray-500" />
                                      ) : (
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="ghost"
                                          onClick={() =>
                                            handleRemoveSlot(day, i)
                                          }
                                          disabled={booked}
                                          title={
                                            booked
                                              ? "Cannot remove booked slots"
                                              : "Remove slot"
                                          }
                                        >
                                          <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                No slots
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 sm:px-4">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddSlot(day)}
                              className="flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" /> Add Slot
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={loading || !formDirty}
                title={!formDirty ? "Add or change slots to enable saving" : ""}
              >
                {loading ? "Loading…" : "Save Availability"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </TooltipProvider>
  )
}
