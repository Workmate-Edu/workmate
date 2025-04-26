"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";
import { AssignTeacherButton } from "./assign-teacher-button";

interface Subject {
  area: string;
  name: string;
  progress?: number;
  _id?: string;
}

interface ViewAssessmentDialogProps {
  assessment: {
    id: string;
    type: string;
    status: string;
    createdAt: string;
    submittedAt: string;
    student?: {
      name: string;
      email: string;
    };
    child?: {
      name: string;
      grade: string;
      subjects: Array<{
        name: string;
        area: string;
      }>;
    };
    parent?: {
      name: string;
      email: string;
    };
    subject?: {
      name: string;
      area: string;
    };
    responses: Array<{
      category: string;
      questions: Array<{
        question: string;
        answer: string | string[];
      }>;
    }>;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign?: () => void;
}

export function ViewAssessmentDialog({
  assessment,
  open,
  onOpenChange,
  onAssign,
}: ViewAssessmentDialogProps) {
  if (!assessment) return null;

  // Get student/child name and determine assessment type
  const getAssessmentDetails = () => {
    const isInitialAssessment = Boolean(assessment.student);
    const name = isInitialAssessment
      ? assessment.student?.name || "Unknown Student"
      : assessment.child?.name || "Unknown Child";

    return { name, isInitialAssessment };
  };

  const { name, isInitialAssessment } = getAssessmentDetails();

  const renderAssessmentOverview = () => (
    <div className="bg-muted/30 p-4 rounded-lg mb-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <Badge
            variant={
              assessment.status === "pending" ? "warning" : "default"
            }
          >
            {assessment.status}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Submitted</p>
          <p className="font-medium">
            {assessment.createdAt
              ? format(new Date(assessment.createdAt), "PPP")
              : "Not available"}
          </p>
        </div>
      </div>
    </div>
  );

  const renderLearnerDetails = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {isInitialAssessment ? "Student Details" : "Child Details"}
        </h3>
        <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{name}</p>
          </div>
          {isInitialAssessment ? (
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">
                {assessment.student?.email || "N/A"}
              </p>
            </div>
          ) : (
            <>
              {assessment.child?.grade && (
                <div>
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <p className="font-medium">{assessment.child.grade}</p>
                </div>
              )}

              {assessment.parent && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Parent Name</p>
                    <p className="font-medium">
                      {assessment.parent.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Parent Email
                    </p>
                    <p className="font-medium">
                      {assessment.parent.email || "N/A"}
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderSubjectsSection = () => (
    <div className="space-y-2 mt-6">
      <h3 className="text-lg font-semibold">Subject Information</h3>
      <div className="bg-muted/20 p-4 rounded-lg">
        {isInitialAssessment ? (
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="font-medium">
                  {assessment.subject?.name || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Area</p>
                <p className="font-medium">
                  {assessment.subject?.area || "Not specified"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Selected Subjects
            </p>
            <div className="flex flex-wrap gap-2">
              {assessment.child?.subjects?.length ? (
                assessment.child.subjects.map((subject, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {typeof subject === "string"
                      ? subject
                      : `${subject.name || ""} (${subject.area || ""})`}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No subjects selected
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderResults = () => {
    if (!assessment.results) return null;

    return (
      <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-green-700 mb-2">
          Assessment Results
        </h3>
        <div className="space-y-2">
          {assessment.results.proficiencyLevel && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600">Proficiency Level:</span>
              <Badge variant="outline" className="capitalize">
                {assessment.results.proficiencyLevel}
              </Badge>
            </div>
          )}
          {assessment.results.recommendedLevel && (
            <p className="text-sm text-green-600">
              <strong>Recommended Level:</strong>{" "}
              {assessment.results.recommendedLevel}
            </p>
          )}
          {assessment.results.adminNotes && (
            <div className="mt-3 bg-white bg-opacity-50 p-3 rounded">
              <p className="text-sm text-green-800 font-medium">Admin Notes:</p>
              <p className="text-sm text-green-600">
                {assessment.results.adminNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderChildResponses = (responses: any[]) => {
    if (!responses?.length) {
      return (
        <div className="p-4 bg-muted/20 rounded-lg">
          <p className="text-center text-muted-foreground">
            No responses available
          </p>
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
                <div
                  key={qIndex}
                  className="bg-background p-4 rounded-lg border shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <span className="font-medium text-muted-foreground min-w-[24px]">
                        {qIndex + 1}.
                      </span>
                      <div className="space-y-3 flex-1">
                        <p className="font-medium text-primary">{q.question}</p>
                        <div className="bg-muted/50 p-4 rounded-md">
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Answer:
                          </p>
                          <p className="text-sm whitespace-pre-wrap">
                            {q.answer || "No answer provided"}
                          </p>
                        </div>
                        {q.notes && (
                          <div className="bg-blue-50 p-4 rounded-md">
                            <p className="text-sm font-medium text-blue-600 mb-2">
                              Additional Notes:
                            </p>
                            <p className="text-sm text-blue-600">{q.notes}</p>
                          </div>
                        )}
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

  const renderResponses = () => {
    if (!assessment?.responses?.length) {
      return (
        <div className="p-4 bg-muted/20 rounded-lg">
          <p className="text-center text-muted-foreground">
            No responses available
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {assessment.responses.map((section, index) => (
          <div key={index} className="bg-muted/20 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-primary mb-4 pb-2 border-b">
              {section.category}
            </h4>
            <div className="space-y-4">
              {section.questions?.map((q, qIndex) => (
                <div
                  key={qIndex}
                  className="bg-background p-4 rounded-lg border"
                >
                  <p className="font-medium mb-2">{q.question}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {q.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTeacherRecommendations = () => {
    if (!assessment.results?.suggestedTeachers?.length) return null;

    return (
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-700 mb-3">
          Teacher Recommendations
        </h3>
        <div className="space-y-3">
          {assessment.results.suggestedTeachers.map((teacher, index) => (
            <div
              key={index}
              className="bg-white p-3 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{teacher.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">
                    Match: {Math.round(teacher.matchScore * 100)}%
                  </Badge>
                  {teacher.availability ? (
                    <Badge variant="success">Available</Badge>
                  ) : (
                    <Badge variant="warning">Limited Availability</Badge>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAssign(teacher.teacherId)}
              >
                Assign
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLearningProfile = () => {
    if (!assessment.learningProfile) return null;

    return (
      <div className="mt-6 bg-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-700 mb-3">
          Learning Profile
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Subject Confidence</h4>
            <div className="grid gap-2">
              {assessment.learningProfile.preferredSubjects.map(
                (subject, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span>{subject.name}</span>
                    <div className="w-48 h-2 bg-purple-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${subject.confidence}%` }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
          {assessment.learningProfile.parentFeedback && (
            <div>
              <h4 className="font-medium mb-2">Parent Feedback</h4>
              <p className="text-sm text-muted-foreground">
                {assessment.learningProfile.parentFeedback}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getAssignButtonDetails = () => {
    const isChild = Boolean(assessment?.child);
    return {
      studentId: isChild ? assessment?.child?.id : assessment?.student?.id,
      studentName: isChild
        ? assessment?.child?.name
        : assessment?.student?.name,
      studentType: isChild ? "child" : "independent",
      grade: isChild ? assessment?.child?.grade : undefined,
      subjects: isChild
        ? assessment?.child?.subjects
        : assessment?.subject
        ? [assessment.subject]
        : [],
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col gap-0">
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle>Assessment Details - {name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-4">
            {renderAssessmentOverview()}
            {renderLearnerDetails()}
            {renderSubjectsSection()}
            {renderLearningProfile()}
            {renderTeacherRecommendations()}
            {assessment.results && renderResults()}
            {assessment.responses?.length > 0 && renderResponses()}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 p-4 border-t bg-background mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <AssignTeacherButton
            {...getAssignButtonDetails()}
            onAssigned={() => {
              onAssign?.();
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
