"use client";

import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Parent {
  _id: string;
  name: string;
  email: string;
}

interface Student {
  id: string;
  name: string;
  grade: string;
  isChild: boolean;
  parentId?: string;
}

interface ParentTeacherListProps {
  onSelectParent: (parent: Parent) => void;
  searchQuery?: string;
  activeParentId?: string;
}

export function TeacherParentList({
  onSelectParent,
  searchQuery = "",
  activeParentId
}: ParentTeacherListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/teacher/students');
        if (!res.ok) throw new Error('Failed to fetch students');
        const data = await res.json();
        console.log('Fetched students:', data);
        setStudents(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Get parent when student is selected
  useEffect(() => {
    const getParent = async () => {
      const student = students.find(s => s.id === selectedStudent);
      if (!student?.parentId) return;

      try {
        const res = await fetch(`/api/users/${student.parentId}`);
        if (!res.ok) throw new Error('Failed to fetch parent');
        const parent = await res.json();
        onSelectParent(parent);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (selectedStudent) {
      getParent();
    }
  }, [selectedStudent, students]);

  // Filter only students registered as children
  const childStudents = students.filter(student => student.isChild);

  return (
    <div className="space-y-4">
      <Select
        value={selectedStudent}
        onValueChange={setSelectedStudent}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a student" />
        </SelectTrigger>
        <SelectContent>
          {childStudents.map((student) => (
            <SelectItem key={student.id} value={student.id}>
              {student.name} - Grade {student.grade}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!loading && childStudents.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No students registered as children
        </div>
      )}
    </div>
  );
}
