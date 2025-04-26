"use client";

import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ParentChildrenSelectProps {
  selectedChild: { id: string; name: string } | null;
  onSelectChild: (child: { id: string; name: string } | null) => void;
}

export function ParentChildrenSelect({ selectedChild, onSelectChild }: ParentChildrenSelectProps) {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await fetch('/api/parent/children');
        if (!res.ok) throw new Error('Failed to fetch children');
        const data = await res.json();
        setChildren(data.children);
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
      <Card className="p-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <Select
        value={selectedChild?.id || ""}
        onValueChange={(value) => {
          const child = children.find(c => c.id === value);
          onSelectChild(child ? { id: child.id, name: child.name } : null);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a child" />
        </SelectTrigger>
        <SelectContent>
          {children.map((child) => (
            <SelectItem key={child.id} value={child.id}>
              {child.name} - Grade {child.grade}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Card>
  );
}
