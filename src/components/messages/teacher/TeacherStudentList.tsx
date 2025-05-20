// src/components/messages/teacher/TeacherStudentList.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Student {
  _id: string;
  name: string;
  email: string;
  studentProfile?: {
    registeredAs?: "child" | "independent";
    parent?: string;    // parent userId
  };
}

export function TeacherStudentList({
  onSelectStudent,
  searchQuery = ""
}: {
  onSelectStudent: (conversation: any) => void;
  searchQuery?: string;
}) {
  const { data: session } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch only assigned students for this teacher
    const fetchAssignedStudents = async () => {
      try {
        setLoading(true);
        // Use the teacher's assigned students endpoint instead
        const res = await fetch('/api/teacher/assigned-students')
        if (!res.ok) throw new Error('Failed to fetch students');
        const data = await res.json();
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error("Unable to load assigned students");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedStudents();
  }, [session?.user?.id]);

  const handleSelectStudent = async (student: Student) => {
    const isChild = student.studentProfile?.registeredAs === "child";
    let participantId = student._id;
    let participantRole = "student";
    let participantName = student.name;
    let participantEmail = student.email;
    let childId: string | undefined;
    let childName: string | undefined;

    if (isChild && student.studentProfile?.parent) {
      // 1) Switch to parent as the conversation target
      participantId   = student.studentProfile.parent;
      participantRole = "parent";

      // 2) Store child info for the schema
      childId   = student._id;
      childName = student.name;

      // 3) Fetch parent’s name/email
      const parentRes = await fetch(`/api/users/${participantId}`);
      if (!parentRes.ok) throw new Error("Failed to fetch parent");
      const parent = await parentRes.json();
      participantName  = parent.name;
      participantEmail = parent.email;
    }

    // 4) Build the POST payload
    const payload: any = {
      participantId,
      type:        isChild ? "parent_teacher" : "direct_student",
      studentType: isChild ? "child"          : "independent",
      participant: {
        userId: participantId,
        role:   participantRole,
        name:   participantName,
        email:  participantEmail,
      }
    };
    if (childId)   payload.childId   = childId;
    if (childName) payload.childName = childName;

    // 5) Fire the request
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to start conversation");

    onSelectStudent(await res.json());
  };

  if (loading) {
    return <div className="flex justify-center py-4"><Loader2 className="animate-spin"/></div>;
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {filtered.map(s => (
        <button
          key={s._id}
          onClick={() => handleSelectStudent(s)}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-semibold">{s.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{s.name}</p>
            <p className="text-xs text-muted-foreground">
              {s.studentProfile?.registeredAs === "child"
                ? "Child Student (messaged via parent)"
                : "Independent Student"}
            </p>
          </div>
        </button>
      ))}
      {filtered.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          {searchQuery ? "No matching students" : "No students available"}
        </div>
      )}
    </div>
  );
}
