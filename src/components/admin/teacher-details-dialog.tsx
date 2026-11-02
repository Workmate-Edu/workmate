"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CircleUser, Mail, Phone, Star, Users, GraduationCap, X } from "lucide-react" // Add icons
import { useEffect, useState } from "react"
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { publicHttpsUrl } from '@/lib/safe-url'

interface TeacherDetailsDialogProps {
  teacher: any;
  onClose: () => void;
  isOpen: boolean;
  onVerify?: (teacher: any) => void;
  onReject?: (teacher: any) => void;
  onIntroductionVideoUpdated?: (teacherId: string, introductionVideoUrl: string) => void;
}

export function TeacherDetailsDialog({
  teacher,
  onClose,
  isOpen,
  onVerify,
  onReject,
  onIntroductionVideoUpdated
}: TeacherDetailsDialogProps) {
  const [externalReviews, setExternalReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [introductionVideoUrl, setIntroductionVideoUrl] = useState('')
  const [savingIntroductionVideo, setSavingIntroductionVideo] = useState(false)

  useEffect(() => {
    if (!isOpen || !teacher?._id) return
    setReviewsLoading(true)
    fetch(`/api/teacher/reviews?teacherId=${teacher?._id}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setExternalReviews(Array.isArray(data) ? data : []))
      .finally(() => setReviewsLoading(false))
  }, [isOpen, teacher?._id])

  useEffect(() => {
    setIntroductionVideoUrl(teacher?.teacherProfile?.introductionVideoUrl || '')
  }, [teacher?._id, teacher?.teacherProfile?.introductionVideoUrl])

  const saveIntroductionVideo = async () => {
    const normalizedVideoUrl = introductionVideoUrl.trim() ? publicHttpsUrl(introductionVideoUrl) : ''
    if (introductionVideoUrl.trim() && !normalizedVideoUrl) {
      toast.error('Use a public HTTPS introduction video link without embedded credentials')
      return
    }
    setSavingIntroductionVideo(true)
    try {
      const response = await fetch(`/api/admin/teachers/${teacher._id}/introduction-video`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ introductionVideoUrl: normalizedVideoUrl }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save introduction video')
      setIntroductionVideoUrl(result.introductionVideoUrl)
      onIntroductionVideoUpdated?.(teacher._id, result.introductionVideoUrl)
      toast.success(result.introductionVideoUrl ? 'Introduction video saved' : 'Introduction video removed')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save introduction video')
    } finally {
      setSavingIntroductionVideo(false)
    }
  }

  if (!teacher) return null;

  // --- NEW: Get students count from teacherProfile.students array ---
  const studentsCount =
    Array.isArray(teacher.teacherProfile?.assignedStudents)
      ? teacher.teacherProfile.assignedStudents.length
      : 0

  // Helper: reviews from teacherProfile.reviews (legacy) or show ratings/count from teacherProfile.ratings
  const reviews: Array<any> = Array.isArray(teacher.teacherProfile?.reviews)
    ? teacher.teacherProfile.reviews
    : []

  const ratings = teacher.teacherProfile?.ratings

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] p-0">
        {/* Add positioning for close button */}
        <div className="absolute right-4 top-4 z-50">
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CircleUser className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">{teacher.name}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  <Badge variant={
                    teacher.teacherProfile.verificationStatus === 'verified' ? 'success' :
                    teacher.teacherProfile.verificationStatus === 'rejected' ? 'destructive' :
                    'secondary'
                  }>
                    {teacher.teacherProfile.verificationStatus}
                  </Badge>
                </p>
              </div>
            </div>
            {teacher.teacherProfile.verificationStatus === 'pending' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onVerify?.(teacher)}
                  className="text-green-600 hover:text-green-700"
                >
                  Verify
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onReject?.(teacher)}
                  className="text-red-600 hover:text-red-700"
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-full max-h-[calc(85vh-80px)] rounded-md">
          <div className="p-6 space-y-6">
            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-4 rounded-lg border">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{teacher.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 rounded-lg border">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{teacher.phone}</p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {teacher.bio && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  About
                </h4>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {teacher.bio}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2 rounded-lg border p-4">
              <h4 className="text-sm font-medium">Parent-facing introduction video</h4>
              <p className="text-xs text-muted-foreground">Add or replace an optional public HTTPS link when helping this teacher complete their profile.</p>
              <div className="flex flex-col gap-2 sm:flex-row"><Input type="url" value={introductionVideoUrl} onChange={event => setIntroductionVideoUrl(event.target.value)} placeholder="https://…" disabled={savingIntroductionVideo} /><Button type="button" className="whitespace-nowrap" onClick={saveIntroductionVideo} disabled={savingIntroductionVideo}>{savingIntroductionVideo ? 'Saving…' : introductionVideoUrl ? 'Save link' : 'Add link'}</Button></div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-primary/5 p-4 rounded-lg space-y-2 text-center">
                <Users className="h-5 w-5 mx-auto text-primary" />
                <p className="text-2xl font-bold">{studentsCount}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg space-y-2 text-center">
                <Star className="h-5 w-5 mx-auto text-primary" />
                <p className="text-2xl font-bold">
                  {typeof ratings?.average === "number"
                    ? ratings.average.toFixed(1)
                    : teacher.teacherProfile.rating?.toFixed?.(1) ?? 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">Rating</p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg space-y-2 text-center">
                <GraduationCap className="h-5 w-5 mx-auto text-primary" />
                <p className="text-2xl font-bold">
                  {typeof ratings?.count === "number"
                    ? ratings.count
                    : Array.isArray(reviews) ? reviews.length : 0}
                </p>
                <p className="text-sm text-muted-foreground">Reviews</p>
              </div>
            </div>

            {/* Teacher Reviews Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Teacher Reviews
              </h4>
              {reviewsLoading ? (
                <div className="text-muted-foreground text-sm">Loading reviews...</div>
              ) : Array.isArray(externalReviews) && externalReviews.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {externalReviews.map((review, idx) => (
                    <div key={review._id || idx} className="border rounded-lg p-3 bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{review.rating}/5</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString()
                            : ""}
                        </span>
                        {review.reviewerRole && (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                            {review.reviewerRole.charAt(0).toUpperCase() + review.reviewerRole.slice(1)}
                          </span>
                        )}
                      </div>
                      {review.comment && (
                        <div className="text-sm text-muted-foreground">{review.comment}</div>
                      )}
                      {review.parentEndorsed && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          Parent Endorsed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">No reviews yet.</div>
              )}
              {/* Show summary if available */}
              {ratings?.count > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Average Rating: <span className="font-semibold">{ratings.average?.toFixed(1) ?? "N/A"}</span> ({ratings.count} reviews)
                </div>
              )}
            </div>

            {/* Qualifications */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Qualifications</h4>
              <div className="grid gap-3">
                {teacher.teacherProfile.qualifications.map((qual: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{qual.degree}</p>
                      <p className="text-sm text-muted-foreground">
                        {qual.institution} • {qual.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Updated Subject Areas section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Subject Areas</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {teacher.teacherProfile.subjects.map((area: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg border space-y-2">
                    <Badge className="mb-2">{area.area}</Badge>
                    <div className="flex flex-wrap gap-1.5">
                      {area.subjects.map((subject: string, j: number) => (
                        <Badge key={j} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
