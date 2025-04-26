"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

interface Teacher {
  id: string;
  _id: string;
  name: string;
  email: string;
  subjects: Array<{
    name: string;
    area: string;
  }>;
}

interface ParentTeacherListProps {
  onSelectTeacher: (teacher: Teacher) => void;
  searchQuery?: string;
  activeTeacherId?: string;
}

export function ParentTeacherList({
  onSelectTeacher,
  searchQuery = "",
  activeTeacherId
}: ParentTeacherListProps) {
  const { data: session } = useSession();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachersFromChildren = async () => {
      try {
        setLoading(true);
        // First get list of children
        const childrenRes = await fetch('/api/parent/children');
        if (!childrenRes.ok) throw new Error('Failed to fetch children');
        const childrenData = await childrenRes.json();

        // Then fetch details for each child to get teacher info
        const teacherMap = new Map();
        
        for (const child of childrenData.children) {
          const detailRes = await fetch(`/api/parent/children/${child.id}`);
          if (!detailRes.ok) continue;
          const detailData = await detailRes.json();

          detailData.child.activeCourses?.forEach((course: any) => {
            if (course.teacher) {
              const teacherId = course.teacher.id;
              if (!teacherMap.has(teacherId)) {
                teacherMap.set(teacherId, {
                  id: teacherId,
                  _id: teacherId,
                  name: course.teacher.name,
                  email: course.teacher.email,
                  subjects: [{ name: course.name, area: course.area }],
                  students: [{ id: child.id, name: child.name }]
                });
              } else {
                const existing = teacherMap.get(teacherId);
                if (!existing.subjects.find((s: any) => s.name === course.name)) {
                  existing.subjects.push({ name: course.name, area: course.area });
                }
                if (!existing.students.find((s: any) => s.id === child.id)) {
                  existing.students.push({ id: child.id, name: child.name });
                }
              }
            }
          });
        }

        setTeachers(Array.from(teacherMap.values()));
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachersFromChildren();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {filteredTeachers.map((teacher) => (
        <button
          key={teacher.id}
          onClick={() => onSelectTeacher(teacher)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left
            ${activeTeacherId === teacher.id ? 'bg-muted' : ''}`}
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-semibold">{teacher.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{teacher.name}</p>
            <p className="text-xs text-muted-foreground">
              Teaching: {teacher.subjects.map(s => s.name).join(', ')}
            </p>
            <p className="text-xs text-muted-foreground">
              Students: {teacher.students.map(s => s.name).join(', ')}
            </p>
          </div>
        </button>
      ))}

      {filteredTeachers.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          {searchQuery ? 'No matching teachers found' : 'No teachers available'}
        </div>
      )}
    </div>
  );
}
