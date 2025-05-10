"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { User, Book, History, Star, BookOpen, UserX, Eye, ArrowLeft } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { ViewAssessmentDialog } from "@/components/admin/view-assessment-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AssignTeacherButton } from "@/components/admin/assign-teacher-button"
import { useStudentAssessments } from "@/hooks/use-student-assessments"
import { useChildAssessment } from '@/hooks/use-child-assessment'

interface StudentProgress {
  weekNumber: number;
  scores: {
    understanding: number;
    participation: number;
    homework: number;
    notes?: string;
  };
  averageScore: number;
  createdAt: string;
}

interface Subject {
  name: string;
  area: string;
  progress: number;
  progressHistory?: StudentProgress[];
  teacher?: {
    name: string;
    email: string;
    rating?: number;
  };
  isAssigned?: boolean;
}

interface Student {
  id: string;
  name: string;
  email: string;
  username: string;
  type: 'independent' | 'child';
  status: string;
  gender: string;
  grade?: string;
  subjects: Subject[];
  assessmentStatus?: string;
  parent?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Assessment {
  _id: string
  type: 'initial' | 'parent_questionnaire'
  status: string
  subject?: {
    name: string
    area: string
  }
  responses: Array<{
    category: string
    questions: Array<{
      question: string
      answer: string
    }>
  }>
  submittedAt: string
  createdAt: string
}

const formatDate = (date: string | null) => {
  if (!date) return 'Not available'
  try {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid date'
  }
}

const ProgressTab = ({ subject }: { subject: Subject }) => {
  const progressHistory = subject.progressHistory || [];
  const latestProgress = progressHistory[0];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">{subject.name}</h3>
          <p className="text-sm text-muted-foreground">{subject.area}</p>
        </div>
        <Badge variant={subject.teacher ? "default" : "secondary"}>
          {subject.teacher ? 'Assigned' : 'Unassigned'}
        </Badge>
      </div>

      {progressHistory.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Understanding</Label>
              <Progress value={latestProgress.scores.understanding * 10} className="h-2" />
              <p className="text-sm text-right">{latestProgress.scores.understanding}/10</p>
            </div>
            <div className="space-y-2">
              <Label>Participation</Label>
              <Progress value={latestProgress.scores.participation * 10} className="h-2" />
              <p className="text-sm text-right">{latestProgress.scores.participation}/10</p>
            </div>
            <div className="space-y-2">
              <Label>Homework</Label>
              <Progress value={latestProgress.scores.homework * 10} className="h-2" />
              <p className="text-sm text-right">{latestProgress.scores.homework}/10</p>
            </div>
            <div className="space-y-2">
              <Label>Average</Label>
              <Progress value={latestProgress.averageScore * 10} className="h-2" />
              <p className="text-sm text-right">{latestProgress.averageScore.toFixed(1)}/10</p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground mt-4">
            <div className="flex justify-between">
              <span>Week {latestProgress.weekNumber}</span>
              <span>Updated {formatDate(latestProgress.createdAt)}</span>
            </div>
            <p className="mt-2">
              Progress entries: {progressHistory.length}
            </p>
          </div>

          {/* If there are multiple entries, show a summary */}
          {progressHistory.length > 1 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Progress History Summary</p>
              <div className="space-y-1 text-sm">
                <p>Latest Score: {latestProgress.averageScore.toFixed(1)}/10</p>
                <p>Total Entries: {progressHistory.length}</p>
                <p>First Entry: {formatDate(progressHistory[progressHistory.length - 1].createdAt)}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No progress data available
        </div>
      )}

      {/* Teacher info section */}
      {subject.teacher && (
        <div className="pt-4 border-t mt-4">
          <p className="text-sm text-muted-foreground mb-2">Teacher</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold">{subject.teacher.name[0]}</span>
            </div>
            <div>
              <p className="font-medium text-sm">{subject.teacher.name}</p>
              <p className="text-xs text-muted-foreground">{subject.teacher.email}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default function StudentDetailPage({ params }: { params: { studentId: string } }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const { assessments, loading: loadingAssessments } = useStudentAssessments(params.studentId);
  const { assessment: childAssessment, loading: loadingChildAssessment } = useChildAssessment(params.studentId)

  useEffect(() => {
    fetchStudentDetails();
  }, [params.studentId]);

  useEffect(() => {
    console.log('Student ID:', params.studentId)
    console.log('Student Type:', student?.type)
    if (student?.type === 'child') {
      console.log('Child Assessment:', childAssessment)
      console.log('Loading Child Assessment:', loadingChildAssessment)
    }
  }, [params.studentId, student?.type, childAssessment, loadingChildAssessment])

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/students/${params.studentId}`);

      if (!response.ok) {
        throw new Error('Failed to load student details');
      }

      const data = await response.json();
      console.log('Student details:', data);

      // No need for additional transformation, use data directly
      setStudent(data);
    } catch (error) {
      console.error('Error fetching student:', error);
      toast.error(error.message || "Failed to load student details");
    } finally {
      setLoading(false);
    }
  };

  const renderAssessmentResponses = (responses: any[]) => {
    if (!responses?.length) {
      return (
        <div className="p-4 bg-muted/20 rounded-lg">
          <p className="text-center text-muted-foreground">No responses available</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {responses.map((section, index) => (
          <div key={index} className="bg-muted/20 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-primary mb-4 pb-2 border-b">
              {section.category}
            </h4>
            <div className="space-y-6">
              {section.questions?.map((q: any, qIndex: number) => (
                <div key={qIndex} className="bg-background p-4 rounded-lg border shadow-sm">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="space-y-3 flex-1">
                        <p className="font-medium text-primary">
                          {q.question}
                        </p>
                        <div className="bg-muted/50 p-4 rounded-md">
                          <p className="text-sm whitespace-pre-wrap">
                            {Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAssessmentsContent = () => {
    if (loadingAssessments || loadingChildAssessment) {
      console.log('Loading assessments...')
      return <div className="text-center py-8">Loading assessments...</div>
    }

    console.log('Child Assessment in render:', childAssessment)
    console.log('Student type:', student?.type)

    const hasAssessments = (assessments.initial.length + assessments.child.length) > 0;
    if (!hasAssessments) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No assessments found
        </div>
      );
    }

    // For independent students, show table
    if (student?.type === 'independent') {
      return (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.initial.map((assessment) => (
                <TableRow key={assessment._id}>
                  <TableCell className="font-medium">
                    {assessment.subject?.name || 'N/A'}
                  </TableCell>
                  <TableCell>{assessment.subject?.area || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={assessment.status === 'pending' ? 'warning' : 'default'}>
                      {assessment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(assessment.submittedAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        setShowAssessmentDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    // For children, show parent questionnaire first
    if (student?.type === 'child') {
      if (!childAssessment) {
        console.log('No child assessment found')
        return (
          <div className="text-center py-8 text-muted-foreground">
            No parent questionnaire found
          </div>
        )
      }

      return (
        <ScrollArea className="h-[600px] rounded-md border p-4">
          {childAssessment && (
            <div className="mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium">Parent Questionnaire</h4>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {formatDate(childAssessment.createdAt)}
                  </p>
                </div>
                <Badge>{childAssessment.status}</Badge>
              </div>
              {renderAssessmentResponses(childAssessment.responses)}
              
              {/* Family Background Section */}
              {childAssessment.familyBackground && (
                <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                  <h4 className="font-semibold mb-4">Family Background</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Primary Language:</span> {childAssessment.familyBackground.primaryLanguage}</p>
                    {childAssessment.familyBackground.otherLanguages?.length > 0 && (
                      <p><span className="font-medium">Other Languages:</span> {childAssessment.familyBackground.otherLanguages.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Goals and Challenges */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <h4 className="font-semibold mb-4">Goals</h4>
                  {childAssessment.goals?.length > 0 ? (
                    <ul className="list-disc pl-4">
                      {childAssessment.goals.map((goal, idx) => (
                        <li key={idx}>{goal}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No goals specified</p>
                  )}
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <h4 className="font-semibold mb-4">Challenge Areas</h4>
                  {childAssessment.challengeAreas?.length > 0 ? (
                    <ul className="list-disc pl-4">
                      {childAssessment.challengeAreas.map((area, idx) => (
                        <li key={idx}>{area}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No challenge areas specified</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Show other assessments if any */}
          {assessments.initial.map(assessment => (
            <div key={assessment._id} className="mb-8 last:mb-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium">
                    {assessment.type === 'initial' ? 'Initial Assessment' : 'Parent Questionnaire'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {formatDate(assessment.submittedAt)}
                  </p>
                </div>
                <Badge>{assessment.status}</Badge>
              </div>
              {renderAssessmentResponses(assessment.responses)}
            </div>
          ))}
        </ScrollArea>
      )
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse bg-muted rounded" />
          <div className="h-4 w-32 animate-pulse bg-muted rounded" />
          <Card className="p-6">
            <div className="space-y-4">
              <div className="h-4 w-24 animate-pulse bg-muted rounded" />
              <div className="h-12 w-full animate-pulse bg-muted rounded" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!student) {
    return <div className="container py-8">Student not found</div>;
  }

  return (
    <div className="container py-8">
      {/* Add back button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/admin/students" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{student?.name}</h1>
          <p className="text-muted-foreground">{student?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge>{student?.type}</Badge>
            <Badge variant={student?.status === 'active' ? 'success' : 'secondary'}>
              {student?.status}
            </Badge>
          </div>
        </div>
        {/* {!student.assignedTeacher && (
          <AssignTeacherButton
            studentId={student.id}
            studentName={student.name}
            studentType={student.type}
            grade={student.grade} // Access grade directly from student
            subjects={student.subjects}
            onAssigned={fetchStudentDetails}
          />
        )} */}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="assessments">Initial Assessments</TabsTrigger>
          {/* <TabsTrigger value="teacher">Assigned Teacher</TabsTrigger> */}
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Student Information</h3>
              <div className="space-y-4">
                <div>
                  <Label>Username</Label>
                  <p className="font-medium">{student?.username}</p>
                </div>
                <div>
                  <Label>Gender</Label>
                  <p className="font-medium">{student?.gender}</p>
                </div>
                <div>
                  <Label>Joined</Label>
                  <p className="font-medium">
                    {student?.createdAt ? formatDate(student.createdAt) : 'Not available'}
                  </p>
                </div>
                {student?.parent && (
                  <div>
                    <Label>Parent</Label>
                    <p className="font-medium">{student.parent.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.parent.email}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Education Information</h3>
              <div className="space-y-4">
                <div>
                  <Label>Grade</Label>
                  <p className="font-medium">{student?.grade || 'Not specified'}</p>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <p className="font-medium">
                    {student?.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
                <div>
                  <Label>Initial Assessment Status</Label>
                  <Badge variant={student?.assessmentStatus === 'pending' ? 'warning' : 'default'}>
                    {student?.assessmentStatus || 'Not started'}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subjects">
          <Card className="p-6">
            <div className="grid gap-4">
              {student?.subjects?.map((subject, index) => (
                <div 
                  key={`${subject.area}-${subject.name}-${index}`} 
                  className="flex justify-between items-start p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{subject.name}</h4>
                    <p className="text-sm text-muted-foreground">{subject.area}</p>
                    {subject.startDate && (
                      <p className="text-sm text-muted-foreground">
                        Started: {new Date(subject.startDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Progress value={subject.progress} className="w-24" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="assessments">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Initial Assessment Status</h3>
                  <Badge className="mt-2" variant={student?.assessmentStatus === 'pending' ? 'warning' : 'default'}>
                    {student?.assessmentStatus || 'Not started'}
                  </Badge>
                </div>
              </div>

              {renderAssessmentsContent()}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="teacher">
          <Card className="p-6">
            {student?.subjects?.some(s => s.teacher) ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Assigned Teachers</h3>
                <div className="divide-y">
                  {student.subjects
                    .filter(s => s.teacher)
                    .map((subject, index) => (
                      <div key={index} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{subject.name}</h4>
                            <p className="text-sm text-muted-foreground">{subject.area}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{subject.teacher?.name}</p>
                            <p className="text-sm text-muted-foreground">{subject.teacher?.email}</p>
                            {subject.teacher?.rating !== undefined && (
                              <div className="flex items-center gap-1 mt-1 justify-end">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{subject.teacher.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {student.subjects.some(s => !s.teacher) && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-muted-foreground mb-4">Subjects without teachers:</p>
                    <div className="space-y-2">
                      {student.subjects
                        .filter(s => !s.teacher)
                        .map((subject, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{subject.name}</p>
                              <p className="text-sm text-muted-foreground">{subject.area}</p>
                            </div>
                            <AssignTeacherButton
                              studentId={student.id}
                              studentName={student.name}
                              studentType={student.type}
                              subjects={[{ name: subject.name, area: subject.area }]}
                              onAssigned={fetchStudentDetails}
                              variant="outline"
                              size="sm"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground mb-4">No teachers assigned yet</p>
                <AssignTeacherButton
                  studentId={student.id}
                  studentName={student.name}
                  studentType={student.type}
                  subjects={student.subjects}
                  onAssigned={fetchStudentDetails}
                />
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {student?.subjects?.map((subject: any) => (
              <ProgressTab key={subject.name} subject={subject} />
            ))}
          </div>

          {(!student?.subjects || student.subjects.length === 0) && (
            <div className="text-center py-6 text-muted-foreground">
              No subjects assigned yet
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Assessment Detail Dialog */}
      <ViewAssessmentDialog
        assessment={selectedAssessment}
        open={showAssessmentDialog}
        onOpenChange={setShowAssessmentDialog}
        onAssign={() => {
          setShowAssessmentDialog(false);
          // Handle teacher assignment if needed
        }}
      />
    </div>
  );
}
