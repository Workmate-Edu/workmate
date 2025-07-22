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

// Format a "HH:MM" time string into "hh:mm AM/PM"
function formatTimeDisplay(time: string, timezone: string) {
  if (!time) return ""
  const [hour, minute] = time.split(":")
  const date = new Date()
  date.setHours(Number(hour), Number(minute), 0, 0)
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone || "UTC",
  })
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
        setValidFrom(
          data.validFrom
            ? new Date(data.validFrom).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)
        )
        setValidTo(
          data.validTo
            ? new Date(data.validTo).toISOString().slice(0, 10)
            : getNextMonthDate()
        )
        setTimezone({ value: data.timezone || timezone.value })
      } else {
        setValidFrom(new Date().toISOString().slice(0, 10))
        setValidTo(getNextMonthDate())
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
  useEffect(() => {
    async function loadSessions() {
      if (!validFrom || !validTo) return
      try {
        const res = await fetch(
          `/api/parent/children/${params.childId}/sessions?from=${validFrom}&to=${validTo}`
        )
        setSessions(res.ok ? await res.json() : [])
      } catch {
        setSessions([])
      }
    }
    loadSessions()
  }, [params.childId, validFrom, validTo])

  // Return locked slots for a given weekday, including recurrences
  function getBookedSlots(day: string) {
    const dayIdx = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ].indexOf(day)
    const windowStart = new Date(validFrom)
    const windowEnd = new Date(validTo)

    return sessions.flatMap((s) => {
      // Recurring
      if (s.recurrence?.isRecurring && Array.isArray(s.recurrence.daysOfWeek)) {
        const recStart = new Date(s.recurrence.startDate)
        const recEnd = new Date(s.recurrence.endDate)
        if (
          s.recurrence.daysOfWeek.includes(dayIdx) &&
          recEnd >= windowStart &&
          recStart <= windowEnd
        ) {
          return [
            {
              start: new Date(s.startTime).toTimeString().slice(0, 5),
              end: new Date(s.endTime).toTimeString().slice(0, 5),
            },
          ]
        }
        return []
      }
      // One‑off
      const d = new Date(s.startTime)
      if (d.getDay() === dayIdx) {
        return [
          {
            start: d.toTimeString().slice(0, 5),
            end: new Date(s.endTime).toTimeString().slice(0, 5),
          },
        ]
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
    const today = new Date().toISOString().slice(0, 10)
    const slot = days.find((d) => d.day === day)!.slots[idx]
    if (isSlotBooked(day, slot) || validFrom < today) return
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
    <div className="max-w-3xl mx-auto py-10">
      <Button
        variant="outline"
        size="sm"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <Card className="p-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-primary" />
            {`Set ${childName.split(" ")[0]}’s Weekly Availability`}
        </h1>
        <p className="mb-4 text-muted-foreground">
          Locked slots (🔒) can't be removed
        </p>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* validity window */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="font-medium">Valid From</label>
              <input
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="border rounded px-3 py-2 w-full mt-1"
                required
                min={new Date().toISOString().slice(0, 10)}
                max={validTo}
              />
            </div>
            <div>
              <label className="font-medium">Valid To</label>
              <input
                type="date"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
                className="border rounded px-3 py-2 w-full mt-1"
                required
                min={validFrom}
                max={getNextMonthDate(validFrom)}
              />
            </div>
          </div>

          {/* timezone */}
          <div>
            <label className="font-medium mb-2 block">Timezone</label>
            <TimezoneSelect value={timezone} onChange={setTimezone} />
          </div>

          {/* slots table */}
          <div>
            <label className="font-medium mb-2 block">
              Weekly Availability
            </label>
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-lg bg-background shadow-sm">
                <thead>
                  <tr>
                    <th className="py-2 px-4 bg-primary/10 text-primary text-left rounded-tl-lg">
                      Day
                    </th>
                    <th className="py-2 px-4 bg-primary/10 text-primary text-left">
                      Slots
                    </th>
                    <th className="py-2 px-4 bg-primary/10 rounded-tr-lg" />
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => {
                    const row = days.find((d) => d.day === day)
                    return (
                      <tr key={day} className="border-b last:border-b-0">
                        <td className="py-2 px-4 font-semibold">{day}</td>
                        <td className="py-2 px-4">
                          {row?.slots.length ? (
                            <div className="flex flex-wrap gap-2">
                              {row.slots.map((slot, i) => {
                                const booked = isSlotBooked(day, slot)
                                const pastLock =
                                  validFrom < new Date().toISOString().slice(0, 10)
                                return (
                                  <div
                                    key={i}
                                    className={`flex items-center gap-2 px-2 py-1 rounded ${
                                      booked
                                        ? "bg-gray-200 text-gray-500"
                                        : "bg-primary/5"
                                    }`}
                                  >
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
                                      className="border rounded px-2 py-1 w-24"
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
                                      className="border rounded px-2 py-1 w-24"
                                      required
                                      disabled={booked}
                                    />
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
                                        disabled={pastLock}
                                        title={
                                          pastLock
                                            ? "Cannot remove past slots"
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
                        <td className="py-2 px-4">
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
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save Availability"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
