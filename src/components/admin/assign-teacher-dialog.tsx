"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Star } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  bio?: string;
  subjects: Array<{ area: string; name: string }>;
  rating: number;
  matchingSubjects: Array<{ name: string; area: string }>;
  matchPercentage: number;
  experienceYears: number;
}

interface TeacherAssignment {
  teacherId: string;
  teacherName: string;
  email: string;  // Add email field
  rating?: number; // Add rating field
  subject: {
    name: string;
    area: string;
  };
}

interface AssignTeacherDialogProps {
  studentId: string;
  studentName: string;
  studentType: "independent" | "child";
  subjects: Array<{ name: string; area: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
  currentAssignments: TeacherAssignment[];
}

export function AssignTeacherDialog({
  studentId,
  studentName,
  studentType,
  subjects,
  open,
  onOpenChange,
  onAssigned,
  currentAssignments = [], // Add default empty array
}: AssignTeacherDialogProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<Record<string, string[]>>({});
  const [assignmentData, setAssignmentData] = useState<any[]>([]);

  useEffect(() => {
    if (open) fetchEligibleTeachers();
  }, [open]);

  // Initialize selectedTeachers with current assignments
  useEffect(() => {
    if (currentAssignments?.length) {
      const initialSelections: Record<string, string[]> = {};
      
      currentAssignments.forEach((assignment) => {
        const key = `${assignment.subject.name}:${assignment.subject.area}`;
        if (!initialSelections[key]) {
          initialSelections[key] = [];
        }
        initialSelections[key].push(assignment.teacherId);
      });

      setSelectedTeachers(initialSelections);
    }
  }, [currentAssignments]);

  const fetchEligibleTeachers = async () => {
    setLoading(true);
    
    // Safely handle currentAssignments
    const assignedSubjects = (currentAssignments || []).reduce((acc, assignment) => {
      if (assignment?.subject && assignment?.teacher) {
        acc[`${assignment.subject.name}-${assignment.subject.area}`.toLowerCase()] = assignment.teacher.id
      }
      return acc
    }, {} as Record<string, string>)

    console.log('Current assignments:', assignedSubjects)

    try {
      const eligibleSubjects = subjects.filter(s => 
        !assignedSubjects[`${s.name}-${s.area}`.toLowerCase()]
      )

      if (eligibleSubjects.length === 0) {
        setTeachers([])
        return
      }

      const response = await fetch(
        `/api/admin/teachers/eligible?${new URLSearchParams({
          subjects: JSON.stringify(eligibleSubjects),
          studentId
        })}`
      )
      if (!response.ok) throw new Error("Failed to fetch teachers");
      const data = await response.json();
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error('Error fetching teachers:', error)
      toast.error('Failed to load eligible teachers')
    } finally {
      setLoading(false)
    }
  };

  const handleTeacherSelection = (subjectKey: string, teacherId: string, checked: boolean) => {
    // Validate against current assignments
    const [subjectName, subjectArea] = subjectKey.split(':')
    const isAlreadyAssigned = currentAssignments.some(
      ca => ca.subject.name.toLowerCase() === subjectName.toLowerCase() &&
           ca.subject.area.toLowerCase() === subjectArea.toLowerCase()
    )

    if (isAlreadyAssigned) {
      console.log('Subject already has teacher assigned:', subjectKey)
      return
    }

    setSelectedTeachers((prev) => {
      const currentIds = prev[subjectKey] || [];
      const updatedIds = checked
        ? [...new Set([...currentIds, teacherId])]
        : currentIds.filter((id) => id !== teacherId);
      const selectedDetails = teachers.filter((t) => updatedIds.includes(t.id));
      console.log("Currently Selected Teachers for", subjectKey, ":", selectedDetails);
      return { ...prev, [subjectKey]: updatedIds };
    });
  };

  useEffect(() => {
    const assignments: any[] = [];
    Object.entries(selectedTeachers).forEach(([key, teacherIds]) => {

      console.log("Selected Teachers for", key, ":", teacherIds);

      const [name, area] = key.split(":");
      teacherIds.forEach((id) => {
        assignments.push({ teacherId: id, subject: { name, area } });
      });
    });
    console.log("🧠 Structuring assignments:", assignments);
    setAssignmentData(assignments);
  }, [selectedTeachers]);
 
 
  console.log("Final Payload for Assignment:", assignmentData);

  const handleAssign = async () => {
    setAssigning(true);

    try {
      const response = await fetch("/api/admin/assign-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          studentType,
          assignments: assignmentData,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success)
        throw new Error(result.error || "Assignment failed");

      toast.success("Teachers assigned successfully");
      onAssigned();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  const getAssignmentStatus = () => {
    // Count subjects that either have new selections or existing assignments
    const assigned = subjects.filter((subject) => {
      const key = `${subject.name}:${subject.area}`;
      const hasNewSelection = selectedTeachers[key]?.length > 0;
      const hasExistingAssignment = currentAssignments.some(a => 
        a.subject.name.toLowerCase() === subject.name.toLowerCase() &&
        a.subject.area.toLowerCase() === subject.area.toLowerCase()
      );

      return hasNewSelection || hasExistingAssignment;
    });

    return {
      assignedCount: assigned.length,
      totalSubjects: subjects.length,
      hasPartialAssignment: assigned.length > 0,
      isFullyAssigned: assigned.length === subjects.length,
      // Fix: Only disable when there are no new selections to process
      hasUnassignedSubjects: Object.keys(selectedTeachers).length > 0
    };
  };

  const status = getAssignmentStatus();

  const getTeacherForSubject = (subject: { name: string, area: string }) => {
    return currentAssignments?.find(a => 
      a.subject.name.toLowerCase() === subject.name.toLowerCase() &&
      a.subject.area.toLowerCase() === subject.area.toLowerCase()
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[80vh] custom-scrollbar">
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: hsl(var(--muted));
            border-radius: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: hsl(var(--muted-foreground));
            border-radius: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: hsl(var(--accent));
          }

          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: hsl(var(--muted-foreground)) hsl(var(--muted));
          }
        `}</style>
        <DialogHeader>
          <DialogTitle>Assign Teachers to {studentName}</DialogTitle>
          <DialogDescription>
            Assign teachers to subjects. You can assign some subjects now and complete others later.
          </DialogDescription>
          {status.hasPartialAssignment && (
            <div className="mt-2 text-sm">
              <Badge variant="outline">
                {status.assignedCount} of {status.totalSubjects} subjects assigned
              </Badge>
            </div>
          )}
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">Loading teachers...</div>
        ) : (
          <div className="space-y-6">
            {subjects.map((subject) => {
              const key = `${subject.name}:${subject.area}`;
              const hasTeacherAssigned = selectedTeachers[key]?.length > 0;
              const assignedTeacher = getTeacherForSubject(subject);
              
              const eligibleTeachers = teachers.filter((t) =>
                t.matchingSubjects.some(
                  (ms) => ms.name === subject.name && ms.area === subject.area
                )
              );

              return (
                <div key={key} className={`border rounded p-4 ${hasTeacherAssigned || assignedTeacher ? 'border-green-500' : 'border-yellow-500'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">
                      {subject.name} ({subject.area})
                    </h4>
                    <Badge variant={hasTeacherAssigned || assignedTeacher ? "success" : "warning"}>
                      {hasTeacherAssigned || assignedTeacher ? "Teacher(s) Assigned" : "Requires Assignment"}
                    </Badge>
                  </div>

                  {/* Show assigned teacher if exists */}
                  {assignedTeacher && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{assignedTeacher.teacherName}</p>
                          <p className="text-sm text-muted-foreground">{assignedTeacher.email}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{assignedTeacher.rating || 0}/5</span>
                          </div>
                        </div>
                        <Badge variant="outline">Currently Assigned</Badge>
                      </div>
                    </div>
                  )}

                  {/* Show eligible teachers */}
                  {eligibleTeachers.length > 0 && (
                    <div className="space-y-3">
                      {!assignedTeacher && <p className="text-sm font-medium">Available Teachers</p>}
                      {eligibleTeachers.map((teacher) => (
                        <label
                          key={teacher.id}
                          className="flex items-start space-x-3 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedTeachers[key]?.includes(teacher.id)}
                            onCheckedChange={(checked) =>
                              handleTeacherSelection(key, teacher.id, !!checked)
                            }
                            className="mt-1"
                          />

                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{teacher.name}</p>
                                <p className="text-sm">{teacher.email}</p>
                                {teacher.bio && <p className="text-sm mt-1">{teacher.bio}</p>}
                              </div>
                              <Badge variant="secondary">
                                {teacher.matchPercentage}% match
                              </Badge>
                            </div>
                            <div className="text-sm mt-2">
                              Rating: {teacher.rating}/5 • {teacher.experienceYears} yrs
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {eligibleTeachers.length === 0 && !assignedTeacher && (
                    <p className="text-muted-foreground">No additional teachers available.</p>
                  )}
                </div>
              );
            })}
            <div className="flex flex-col gap-2">
              {!status.hasPartialAssignment && (
                <p className="text-yellow-600 text-sm">
                  Please assign at least one subject to continue.
                </p>
              )}
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Save for Later
                </Button>
                <Button 
                  disabled={assigning || !status.hasUnassignedSubjects} 
                  onClick={handleAssign}
                >
                  {assigning ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" /> 
                      Assigning...
                    </>
                  ) : (
                    status.isFullyAssigned 
                      ? "All Teachers Assigned" 
                      : "Assign Selected Teachers"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
