"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";
import { toast } from "sonner";

interface StudentWithParent {
  _id: string;
  name: string;
  email: string;
  studentType: 'independent' | 'child';
  parent?: {
    _id: string;
    name: string;
    email: string;
  };
}

export function TeacherTeacherList() {
  const [students, setStudents] = useState<StudentWithParent[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students');
        const data = await res.json();
        setStudents(data);
      } catch (error) {
        toast.error('Failed to fetch students');
      }
    };

    fetchStudents();
  }, []);

  const renderStudentItem = (student: StudentWithParent) => (
    <div key={student._id} className="space-y-2 p-3 hover:bg-muted rounded-lg">
      {student.studentType === 'independent' ? (
        // Independent student - direct messaging
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => startConversation({
            participantId: student._id,
            type: 'direct_student',
            studentType: 'independent'
          })}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Message {student.name}
        </Button>
      ) : (
        // Child student - message parent instead
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => startConversation({
            participantId: student.parent!._id,
            type: 'parent',
            studentType: 'child',
            childId: student._id,
            childName: student.name
          })}
        >
          <Users className="h-4 w-4 mr-2" />
          Message Parent ({student.parent!.name}) about {student.name}
        </Button>
      )}
    </div>
  );

  const startConversation = async (params: {
    participantId: string;
    type: 'direct_student' | 'parent';
    studentType: 'independent' | 'child';
    childId?: string;
    childName?: string;
  }) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!res.ok) throw new Error('Failed to start conversation');
      const conversation = await res.json();
      // Handle successful conversation start
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  return (
    <div className="space-y-4">
      {students.map(renderStudentItem)}
    </div>
  );
}