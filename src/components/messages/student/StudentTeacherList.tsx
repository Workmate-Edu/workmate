"use client"

import { useEffect, useState } from "react"
import { BookOpen } from "lucide-react"

interface TeacherSubject {
  area: string;
  subjects: string[];
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  role: string;
  teacherProfile?: {
    subjects: TeacherSubject[];
    verificationStatus: string;
  };
}

export function StudentTeacherList({ onSelectTeacher }: { onSelectTeacher: (teacher: Teacher) => void }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/users?role=teacher');
        if (!res.ok) throw new Error('Failed to fetch teachers');
        const data = await res.json();
        setTeachers(data.filter(t => t.teacherProfile?.verificationStatus === 'verified'));
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {teachers.map((teacher) => (
        <button
          key={teacher._id}
          onClick={() => onSelectTeacher(teacher)}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{teacher.name}</p>
            {teacher.teacherProfile?.subjects && (
              <p className="text-sm text-muted-foreground">
                {teacher.teacherProfile.subjects.map(s => 
                  s.area.charAt(0).toUpperCase() + s.area.slice(1)
                ).join(', ')}
              </p>
            )}
          </div>
        </button>
      ))}

      {teachers.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No verified teachers available
        </div>
      )}
    </div>
  );
}
