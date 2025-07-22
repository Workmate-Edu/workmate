"use client"

import { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowLeft, Plus, Trash2, Lock } from "lucide-react"
import { useSession } from "next-auth/react"
import TimezoneSelect, { ITimezone } from "react-timezone-select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const DAYS = [
  "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday", "Sunday",
]

// Helpers (unchanged)
function getNextMonthDate(fromDate?: string) {
  const base = fromDate ? new Date(fromDate) : new Date()
  const nextMonth = new Date(base)
  nextMonth.setMonth(base.getMonth() + 1)
  return nextMonth.toISOString().slice(0, 10)
}
function formatTimeDisplay(time: string, tz: string) {
  if (!time) return ""
  const [h, m] = time.split(":")
  const d = new Date()
  d.setHours(+h, +m, 0, 0)
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true, timeZone: tz
  })
}
function isTimeOverlap(a0: string, a1: string, b0: string, b1: string) {
  return a0 < b1 && a1 > b0
}

export default function StudentAvailabilityPage() {
  const { data: session } = useSession()
  const router = useRouter()

  // determine independent vs child
  const [studentType, setStudentType] = useState<"independent"|"child"|null>(null)
  useEffect(() => {
    fetch("/api/student/profile")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ studentProfile }) => setStudentType(studentProfile.registeredAs))
      .catch(() => console.error("Could not load profile"))
  }, [])

  // common state
  const [availability, setAvailability] = useState<any>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string|null>(null)

  // independent edit state
  const [editMode, setEditMode] = useState(false)
  const [days, setDays]         = useState<any[]>([])
  const [validFrom, setValidFrom] = useState("")
  const [validTo,   setValidTo]   = useState("")
  const [timezone, setTimezone]   = useState<ITimezone>({
    value: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
  const [saving, setSaving] = useState(false)

  // bump this to force reload
  const [reloadCounter, setReloadCounter] = useState(0)
  const reload = useCallback(() => setReloadCounter(c=>c+1), [])

  // fetch availability + sessions
  const loadAvailabilityAndSessions = useCallback(async () => {
    if (!studentType || !session?.user?.id) return
    setLoading(true)
    setError(null)
    try {
      // 1) availability
      const availUrl =
        studentType === "child"
          ? `/api/parent/children/${session.user.id}/availability`
          : `/api/student/availability`
      const availRes = await fetch(availUrl)
      if (!availRes.ok) throw new Error("missing availability")
      const data = await availRes.json()
      setAvailability(data)
      setDays(data.days || [])
      setValidFrom(
        data.validFrom
          ? new Date(data.validFrom).toISOString().slice(0,10)
          : new Date().toISOString().slice(0,10)
      )
      setValidTo(
        data.validTo
          ? new Date(data.validTo).toISOString().slice(0,10)
          : getNextMonthDate()
      )
      setTimezone({ value: data.timezone })

      // 2) sessions
      const sessUrl =
        studentType === "child"
          ? `/api/parent/children/${session.user.id}/sessions?from=${data.validFrom.slice(0,10)}&to=${data.validTo.slice(0,10)}`
          : `/api/student/sessions?from=${data.validFrom.slice(0,10)}&to=${data.validTo.slice(0,10)}`
      const sessRes = await fetch(sessUrl)
      const sessions = sessRes.ok ? await sessRes.json() : []
      setAvailability(prev=>({ ...prev, sessions }))
    } catch {
      setError("No availability found")
      setAvailability(null)
      setDays([])
    } finally {
      setLoading(false)
    }
  }, [studentType, session?.user?.id])

  // call on mount + whenever reloadCounter changes
  useEffect(() => {
    loadAvailabilityAndSessions()
  }, [loadAvailabilityAndSessions, reloadCounter])

  // clamp validTo
  useEffect(() => {
    if (!validFrom) return
    setValidTo(prev => {
      const clamp = getNextMonthDate(validFrom)
      if (!prev || prev < validFrom) return clamp
      return prev > clamp ? clamp : prev
    })
  }, [validFrom])

  // getBookedSlots + isSlotBooked (locking entire day)
  function getBookedSlots(day: string) {
    if (!availability?.sessions) return []
    const idx = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].indexOf(day)
    const start = new Date(validFrom)
    const end   = new Date(validTo)
    return availability.sessions.flatMap((s:any) => {
      if (s.recurrence?.isRecurring && Array.isArray(s.recurrence.daysOfWeek)) {
        const r0 = new Date(s.recurrence.startDate)
        const r1 = new Date(s.recurrence.endDate)
        if (s.recurrence.daysOfWeek.includes(idx) && r1 >= start && r0 <= end) {
          return [{ start: s.startTime.slice(11,16), end: s.endTime.slice(11,16) }]
        }
        return []
      }
      const d = new Date(s.startTime)
      if (d.getDay()===idx) {
        return [{ start: s.startTime.slice(11,16), end: s.endTime.slice(11,16) }]
      }
      return []
    })
  }
  function isSlotBooked(day:string, slot:{start:string,end:string}) {
    const booked = getBookedSlots(day)
    if (booked.length>0) return true
    return booked.some(b=> isTimeOverlap(slot.start,slot.end,b.start,b.end) )
  }

  // independent handlers
  const handleAddSlot = (day:string) => {
    setDays(prev => {
      const found = prev.find(d=>d.day===day)
      if (found) {
        return prev.map(d=>
          d.day===day
            ? { ...d, slots:[...d.slots,{start:"",end:""}] }
            : d
        )
      }
      return [...prev,{ day, slots:[{start:"",end:""}] }]
    })
  }
  const handleSlotChange = (day:string,i:number,f:"start"|"end",val:string) => {
    setDays(prev => prev.map(d=>
      d.day===day
        ? { ...d, slots:d.slots.map((s,idx)=> idx===i
            ? {
                ...s,
                [f]: val,
                startDisplay: f==="start"?formatTimeDisplay(val,timezone.value):s.startDisplay,
                endDisplay:   f==="end"  ?formatTimeDisplay(val,timezone.value):s.endDisplay,
              }
            : s
          )}
        : d
    ))
  }
  const handleRemoveSlot = (day:string,i:number) => {
    const today = new Date().toISOString().slice(0,10)
    const slot = days.find(d=>d.day===day)!.slots[i]
    if (isSlotBooked(day,slot) || validFrom < today) return
    setDays(prev =>
      prev.map(d=>
        d.day===day
          ? { ...d, slots:d.slots.filter((_,idx)=>idx!==i) }
          : d
      ).filter(d=>d.slots.length>0)
    )
  }

  // save
  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault()
    if (!validFrom||!validTo||!timezone.value||days.length===0) {
      toast.error("Please fill out all fields")
      return
    }
    setSaving(true)
    try {
      const ep = studentType==="child"
        ? `/api/parent/children/${session!.user.id}/availability`
        : `/api/student/availability`
      const r = await fetch(ep,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ days, validFrom, validTo, timezone: timezone.value })
      })
      if (!r.ok) throw new Error()
      toast.success("Saved!")
      setEditMode(false)
      reload()                   // <- bump to re-fetch everything
    } catch {
      toast.error("Save failed")
    } finally {
      setSaving(false)
    }
  }

  // render
  if (!studentType) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <Card className="p-8">Loading…</Card>
      </div>
    )
  }

  // independent — editable
  if (studentType === "independent") {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <Button
          variant="outline"
          size="sm"
          onClick={()=>router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1"/> Back
        </Button>
        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary"/> My Availability
          </h1>
          <p className="mb-4 text-muted-foreground">
            Set your weekly availability. Locked slots (🔒) can’t be removed.
          </p>
          {error && <p className="text-destructive">{error}</p>}

          {(!availability?.days?.length || editMode) ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* validity */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="font-medium">Valid From</label>
                  <input
                    type="date"
                    className="border rounded px-3 py-2 w-full mt-1"
                    value={validFrom}
                    min={new Date().toISOString().slice(0,10)}
                    max={validTo}
                    required
                    onChange={e=>setValidFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-medium">Valid To</label>
                  <input
                    type="date"
                    className="border rounded px-3 py-2 w-full mt-1"
                    value={validTo}
                    min={validFrom}
                    max={getNextMonthDate(validFrom)}
                    required
                    onChange={e=>setValidTo(e.target.value)}
                  />
                </div>
              </div>
              {/* timezone */}
              <div>
                <label className="font-medium mb-2 block">Timezone</label>
                <TimezoneSelect value={timezone} onChange={setTimezone}/>
              </div>
              {/* slots */}
              <div>
                <label className="font-medium mb-2 block">Weekly Availability</label>
                <div className="overflow-x-auto">
                  <table className="min-w-full border rounded-lg bg-background shadow-sm">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 bg-primary/10 text-primary text-left rounded-tl-lg">
                          Day
                        </th>
                        <th className="py-2 px-4 bg-primary/10 text-primary text-left">
                          Time slots
                        </th>
                        <th className="py-2 px-4 bg-primary/10 rounded-tr-lg"/>
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map(day => {
                        const row = days.find(d=>d.day===day)
                        return (
                          <tr key={day} className="border-b last:border-b-0">
                            <td className="py-2 px-4 font-semibold">{day}</td>
                            <td className="py-2 px-4">
                              {row?.slots.length ? (
                                <div className="flex flex-wrap gap-2">
                                  {row.slots.map((slot,i)=> {
                                    const booked = isSlotBooked(day,slot)
                                    const pastLock = validFrom < new Date().toISOString().slice(0,10)
                                    return (
                                      <div
                                        key={i}
                                        className={`flex items-center gap-2 px-2 py-1 rounded ${
                                          booked ? "bg-gray-200 text-gray-500" : "bg-primary/5"
                                        }`}
                                      >
                                        <input
                                          type="time"
                                          className="border rounded px-2 py-1 w-24"
                                          value={slot.start}
                                          onChange={e=>handleSlotChange(day,i,"start",e.target.value)}
                                          disabled={booked}
                                          required
                                        />
                                        <span>to</span>
                                        <input
                                          type="time"
                                          className="border rounded px-2 py-1 w-24"
                                          value={slot.end}
                                          onChange={e=>handleSlotChange(day,i,"end",e.target.value)}
                                          disabled={booked}
                                          required
                                        />
                                        <span className="text-xs text-muted-foreground">
                                          {slot.startDisplay||formatTimeDisplay(slot.start,timezone.value)}
                                          {" – "}
                                          {slot.endDisplay  ||formatTimeDisplay(slot.end,timezone.value)}
                                        </span>
                                        {booked ? (
                                          <Lock className="w-4 h-4 text-gray-500"/>
                                        ) : (
                                          <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={()=>handleRemoveSlot(day,i)}
                                            disabled={pastLock}
                                            title={pastLock?"Cannot remove past":"Remove slot"}
                                          >
                                            <Trash2 className="w-4 h-4 text-destructive"/>
                                          </Button>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">No slots</span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={()=>handleAddSlot(day)}
                                className="flex items-center gap-1"
                              >
                                <Plus className="w-4 h-4"/> Add
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save Availability"}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div>
              {/* display-only view */}
              <div className="mb-2 text-sm text-muted-foreground">
                <span className="font-medium">Timezone:</span> {timezone.value}
              </div>
              <div className="mb-2 text-sm text-muted-foreground">
                <span className="font-medium">Valid:</span> {validFrom} – {validTo}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border rounded-lg bg-background shadow-sm">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 bg-primary/10 text-primary rounded-tl-lg text-left">
                        Day
                      </th>
                      <th className="py-2 px-4 bg-primary/10 text-primary text-left">
                        Time slots
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(day => {
                      const row = days.find(d=>d.day===day)
                      return (
                        <tr key={day} className="border-b last:border-b-0">
                          <td className="py-2 px-4 font-semibold">{day}</td>
                          <td className="py-2 px-4">
                            {row?.slots.length ? (
                              <div className="flex flex-wrap gap-2">
                                {row.slots.map((slot,i)=>(
                                  <div
                                    key={i}
                                    className={`flex items-center gap-2 px-2 py-1 rounded ${
                                      isSlotBooked(day,slot)
                                        ? "bg-gray-200 text-gray-500"
                                        : "bg-primary/5"
                                    }`}
                                  >
                                    <span>
                                      {slot.startDisplay||formatTimeDisplay(slot.start,timezone.value)}
                                      {" – "}
                                      {slot.endDisplay  ||formatTimeDisplay(slot.end,timezone.value)}
                                    </span>
                                    {isSlotBooked(day,slot) && (
                                      <Lock className="w-4 h-4 text-gray-500"/>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">No slots</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={()=>setEditMode(true)}>Edit Availability</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    )
  }

  // child ⇒ view only
  return (
    <div className="max-w-3xl mx-auto py-10">
      <Card className="p-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary"/> My Availability
        </h1>
        <p className="mb-4 text-muted-foreground">
          View availability set by your parent. Locked slots (🔒) cannot be removed.
        </p>
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : !availability ? (
          <p className="text-muted-foreground">No availability set.</p>
        ) : (
          <div>
            <div className="mb-2 text-sm text-muted-foreground">
              <span className="font-medium">Timezone:</span> {availability.timezone}
            </div>
            <div className="mb-2 text-sm text-muted-foreground">
              <span className="font-medium">Valid:</span>{" "}
              {new Date(availability.validFrom).toLocaleDateString()} –{" "}
              {new Date(availability.validTo).toLocaleDateString()}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-lg bg-background shadow-sm">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-left bg-primary/10 text-primary rounded-tl-lg">
                      Day
                    </th>
                    <th className="py-2 px-4 text-left bg-primary/10 text-primary">
                      Time slots
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {availability.days.map((d:any,i:number)=>(
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="py-2 px-4 font-semibold">{d.day}</td>
                      <td className="py-2 px-4">
                        {d.slots.length ? (
                          <div className="flex flex-wrap gap-2">
                            {d.slots.map((s:any,j:number)=>(
                              <span
                                key={j}
                                className="inline-block bg-primary/5 px-3 py-1 rounded text-sm"
                              >
                                {s.startDisplay||s.start} – {s.endDisplay||s.end}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">No slots</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
