"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

interface Child {
  id: string;
  name: string;
  grade?: string;
  subjects?: Array<{
    name: string;
    area: string;
    progress: number;
  }>;
}

interface ParentChildrenListProps {
  selectedChild?: string;
  onSelectChild: (childId: string) => void;
}

export function ParentChildrenList({
  selectedChild,
  onSelectChild
}: ParentChildrenListProps) {
  const { data: session } = useSession();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        // Use the parent-specific endpoint instead
        const res = await fetch('/api/parent/children');
        if (!res.ok) throw new Error('Failed to fetch children');
        const data = await res.json();
        setChildren(data.children); // Access the children array from response
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {children.length > 0 ? (
        children.map((child) => (
          <button
            key={child.id}
            onClick={() => onSelectChild(child.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left
              ${selectedChild === child.id ? 'bg-muted' : ''}`}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold">
                {child.name[0]}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium">{child.name}</p>
              {child.grade && (
                <p className="text-sm text-muted-foreground">
                  Grade {child.grade}
                </p>
              )}
            </div>
          </button>
        ))
      ) : (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No children found
        </div>
      )}
    </div>
  );
}
