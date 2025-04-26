"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { subjectAreas, type SubjectArea, type Subject } from "@/lib/constants/subjects"

const profileSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  phone: z.string().min(10, "Valid phone number required"),
  subjects: z.array(z.object({
    area: z.string(),
    subjects: z.array(z.string())
  })).min(1, "At least one subject area is required"),
  qualifications: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number()
  })),
  availability: z.array(z.object({
    day: z.string(),
    slots: z.array(z.object({
      startTime: z.string(),
      endTime: z.string()
    }))
  }))
})

interface SubjectSelection {
  area: string
  subjects: string[]
}

interface TeacherProfile {
  name: string;
  email: string;
  bio: string;
  phone: string;
  teacherProfile: {
    qualifications: Array<{
      degree: string;
      institution: string;
      year: number;
    }>;
    subjects: Array<{
      area: string;
      subjects: string[];
    }>;
    verificationStatus: string;
    verificationHistory?: Array<{
      status: string;
      date: Date;
      reason: string;
      feedback: string;
      canReapplyAfter: Date;
    }>;
  };
}

export function TeacherProfileForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [selectedSubjects, setSelectedSubjects] = useState<Array<SubjectSelection>>([])
  const [qualifications, setQualifications] = useState<Array<{
    degree: string;
    institution: string;
    year: number;
  }>>([])
  const [rejectionInfo, setRejectionInfo] = useState<{
    reason: string;
    feedback: string;
    canReapplyAfter: Date;
  } | null>(null)

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: "",
      phone: "",
      subjects: [],
      qualifications: [],
      availability: []
    }
  })

  useEffect(() => {
    fetchTeacherProfile()
  }, [])

  useEffect(() => {
    if (teacher?.teacherProfile?.verificationStatus === 'rejected') {
      const lastRejection = teacher.teacherProfile.verificationHistory
        ?.filter(h => h.status === 'rejected')
        .sort((a, b) => b.date - a.date)[0]

      setRejectionInfo(lastRejection)
    }
  }, [teacher])

  const fetchTeacherProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/teacher/profile')
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setTeacher(data)

      // Update form with existing data
      form.reset({
        name: data.name || "",
        email: data.email || "",
        bio: data.bio || "",
        phone: data.phone || "",
        subjects: data.teacherProfile?.subjects || [],
        qualifications: data.teacherProfile?.qualifications || [],
        availability: data.teacherProfile?.availability || []
      })

      // Set state for complex fields
      setSelectedSubjects(data.teacherProfile?.subjects || [])
      setQualifications(data.teacherProfile?.qualifications || [])

      setIsLoading(false)
    } catch (error) {
      toast.error("Failed to load profile")
      setIsLoading(false)
    }
  }

  // Add handlers for adding/removing subjects and qualifications

  const handleAddSubject = (areaValue: string, subject: Subject) => {
    const area = subjectAreas.find(a => a.value === areaValue)
    if (!area) return

    setSelectedSubjects(prev => {
      // Check if subject already exists
      const exists = prev.some(s => 
        s.area === areaValue && s.subjects.includes(subject.value)
      )
      if (exists) return prev

      // Create new subjects array with level selection
      const newSubjects = [
        ...prev,
        {
          area: areaValue,
          subjects: [subject.value]
        }
      ]

      // Update form value
      form.setValue("subjects", newSubjects)
      return newSubjects
    })
  }

  const handleRemoveSubject = (index: number) => {
    setSelectedSubjects(prev => prev.filter((_, i) => i !== index))
    form.setValue("subjects", selectedSubjects)
  }

  const handleAddQualification = () => {
    setQualifications(prev => [
      ...prev,
      { degree: "", institution: "", year: new Date().getFullYear() }
    ])
  }

  const handleRemoveQualification = (index: number) => {
    setQualifications(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      setIsSaving(true)
      
      // Prepare the data to match the User model structure
      const formData = {
        bio: data.bio,
        phone: data.phone,
        teacherProfile: {
          subjects: selectedSubjects.map(subject => ({
            area: subject.area,
            subjects: subject.subjects
          })),
          qualifications: qualifications.map(qual => ({
            degree: qual.degree,
            institution: qual.institution,
            year: qual.year
          }))
        }
      }

      const response = await fetch('/api/teacher/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      toast.success(
        result.verificationRequired
          ? "Profile updated successfully. Re-verification required."
          : "Profile updated successfully"
      )
      
      await fetchTeacherProfile()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={teacher?.name} disabled />
          </div>
          
          <div>
            <Label>Email</Label>
            <Input value={teacher?.email} disabled />
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea
              placeholder="Tell us about your teaching experience..."
              {...form.register("bio")}
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input {...form.register("phone")} />
          </div>
        </div>

        {/* Verification Status */}
        {teacher?.teacherProfile?.verificationStatus && (
          <div className="rounded-lg bg-muted p-4">
            <Label>Verification Status</Label>
            <Badge variant={teacher.teacherProfile.verificationStatus === 'verified' ? 'success' : 'warning'}>
              {teacher.teacherProfile.verificationStatus}
            </Badge>
          </div>
        )}

        {teacher?.teacherProfile?.verificationStatus === 'rejected' && rejectionInfo && (
          <div className="rounded-lg bg-destructive/10 p-6 space-y-4">
            <h3 className="font-semibold text-destructive">Verification Rejected</h3>
            <div className="space-y-2">
              <p><strong>Reason:</strong> {rejectionInfo.reason}</p>
              <p><strong>Feedback:</strong> {rejectionInfo.feedback}</p>
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">How to Reapply:</p>
                <ul className="text-sm text-blue-600 list-disc list-inside mt-2">
                  <li>Review and update your qualifications</li>
                  <li>Ensure all required documentation is provided</li>
                  <li>Complete your subject expertise information</li>
                  <li>Click "Save Changes" to submit for re-verification</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Label>Subject Areas</Label>
          <div className="flex flex-wrap gap-2">
            {selectedSubjects.map((subject, index) => (
              <Badge key={index} variant="secondary">
                {subjectAreas.find(a => a.value === subject.area)?.label}: 
                {subject.subjects.map(s => 
                  subjectAreas
                    .find(a => a.value === subject.area)
                    ?.subjects.find(sub => sub.value === s)
                    ?.label
                ).join(", ")}
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(index)}
                  className="ml-2"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          {/* Subject selection controls */}
          {subjectAreas.map(area => (
            <div key={area.value} className="space-y-2">
              <h4 className="font-medium">{area.label}</h4>
              <div className="grid grid-cols-2 gap-2">
                {area.subjects.map(subject => (
                  <Button
                    key={subject.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={
                      selectedSubjects.some(s => 
                        s.area === area.value && s.subjects.includes(subject.value)
                      ) ? 'bg-primary/10' : ''
                    }
                    onClick={() => handleAddSubject(area.value, subject)}
                  >
                    {subject.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Label>Qualifications</Label>
          {qualifications.map((qual, index) => (
            <div key={index} className="grid gap-4 p-4 border rounded-lg">
              <Input
                placeholder="Degree"
                value={qual.degree}
                onChange={(e) => {
                  const newQuals = [...qualifications]
                  newQuals[index].degree = e.target.value
                  setQualifications(newQuals)
                  form.setValue("qualifications", newQuals)
                }}
              />
              <Input
                placeholder="Institution"
                value={qual.institution}
                onChange={(e) => {
                  const newQuals = [...qualifications]
                  newQuals[index].institution = e.target.value
                  setQualifications(newQuals)
                  form.setValue("qualifications", newQuals)
                }}
              />
              <Input
                type="number"
                placeholder="Year"
                value={qual.year}
                onChange={(e) => {
                  const newQuals = [...qualifications]
                  newQuals[index].year = parseInt(e.target.value)
                  setQualifications(newQuals)
                  form.setValue("qualifications", newQuals)
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleRemoveQualification(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddQualification}
          >
            Add Qualification
          </Button>
        </div>

        <div>
          <Label>Availability</Label>
          {/* Availability schedule UI */}
          {/* ... */}
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            {teacher?.teacherProfile?.verificationStatus === 'rejected' 
              ? 'Submitting for Re-verification...'
              : 'Saving changes...'}
          </>
        ) : (
          teacher?.teacherProfile?.verificationStatus === 'rejected'
            ? 'Update Profile & Submit for Re-verification'
            : 'Save Changes'
        )}
      </Button>

      {/* Show verification status warning */}
      {teacher?.teacherProfile?.verificationStatus === 'verified' && (
        <p className="text-sm text-yellow-600 text-center">
          Note: Updating your profile will require re-verification by admin
        </p>
      )}
    </form>
  )
}
