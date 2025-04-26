"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  email: string;
  studentProfile?: {
    grade?: string;
    registeredAs?: string;
    parent?: string;
  };
}

interface TeacherStudentListProps {
  onSelectStudent: (student: any) => void;
  searchQuery?: string;
}

export function TeacherStudentList({
  onSelectStudent,
  searchQuery = ""
}: TeacherStudentListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/users?role=student');
        if (!res.ok) throw new Error('Failed to fetch students');
        const data = await res.json();
        setStudents(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-4">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>;
  }

  return (
    <div className="space-y-2">
      {filteredStudents.map((student) => (
        <button
          key={student._id}
          onClick={() => onSelectStudent(student)}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-semibold">{student.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{student.name}</p>
            <p className="text-xs text-muted-foreground">
              {student.studentProfile?.registeredAs === 'child' 
                ? 'Child Student (Click to message parent)' 
                : 'Independent Student'}
            </p>
          </div>
        </button>
      ))}
      {filteredStudents.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          {searchQuery ? 'No matching students' : 'No students available'}
        </div>
      )}
    </div>
  );
}
