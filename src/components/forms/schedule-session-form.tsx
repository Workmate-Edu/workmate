import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectItem } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Student } from "@/models/student"

const formSchema = z.object({
  startTime: z.date(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  students: z.array(z.string()).nonempty("At least one student must be selected"),
  externalLink: z.string().optional(),
  recurrence: z.object({
    isRecurring: z.boolean(),
    pattern: z.enum(["none", "daily", "weekly", "twice-weekly"]),
    daysOfWeek: z.array(z.number()).optional(),
    endsOn: z.date().optional()
  }).optional()
})

interface ScheduleSessionFormProps {
  courseId: string
  students: Student[]
  onSuccess?: () => void
  onCancel?: () => void
}

export function ScheduleSessionForm({
  courseId,
  students,
  onSuccess,
  onCancel
}: ScheduleSessionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema)
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      const response = await fetch("/api/teacher/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...data,
          courseId
        })
      })

      if (!response.ok) {
        throw new Error("Failed to schedule session")
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Start Time</label>
        <Calendar {...register("startTime")} />
        {errors.startTime && <p>{errors.startTime.message}</p>}
      </div>
      <div>
        <label>Duration (minutes)</label>
        <Input type="number" {...register("duration")} />
        {errors.duration && <p>{errors.duration.message}</p>}
      </div>
      <div>
        <label>Students</label>
        <Select {...register("students")} multiple>
          {students.map(student => (
            <SelectItem key={student.id} value={student.id}>
              {student.name}
            </SelectItem>
          ))}
        </Select>
        {errors.students && <p>{errors.students.message}</p>}
      </div>
      <div>
        <label>External Link (optional)</label>
        <Input type="text" {...register("externalLink")} />
      </div>
      <div>
        <label>Recurrence</label>
        <Select {...register("recurrence.pattern")}>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="twice-weekly">Twice Weekly</SelectItem>
        </Select>
        {errors.recurrence?.pattern && <p>{errors.recurrence.pattern.message}</p>}
        {watch("recurrence.pattern") !== "none" && (
          <>
            <div>
              <label>Days of Week</label>
              <Select {...register("recurrence.daysOfWeek")} multiple>
                <SelectItem value={0}>Sunday</SelectItem>
                <SelectItem value={1}>Monday</SelectItem>
                <SelectItem value={2}>Tuesday</SelectItem>
                <SelectItem value={3}>Wednesday</SelectItem>
                <SelectItem value={4}>Thursday</SelectItem>
                <SelectItem value={5}>Friday</SelectItem>
                <SelectItem value={6}>Saturday</SelectItem>
              </Select>
              {errors.recurrence?.daysOfWeek && <p>{errors.recurrence.daysOfWeek.message}</p>}
            </div>
            <div>
              <label>Ends On</label>
              <Calendar {...register("recurrence.endsOn")} />
              {errors.recurrence?.endsOn && <p>{errors.recurrence.endsOn.message}</p>}
            </div>
          </>
        )}
      </div>
      <div>
        <Button type="submit" disabled={loading}>
          {loading ? "Scheduling..." : "Schedule Session"}
        </Button>
        {onCancel && (
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}