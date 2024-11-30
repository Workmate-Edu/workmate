'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [username, setUsername] = useState(session?.user?.username || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole,
          username: username,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      // Update the session with new role
      await updateSession();

      // Redirect to the appropriate dashboard
      router.push(`/dashboard/${selectedRole}`);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome to Workmate!</h1>
          <p className="text-gray-500">
            Please tell us a bit about yourself to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>Choose your username</Label>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>I am a...</Label>
            <div className="grid grid-cols-1 gap-4">
              <RadioGroup
                name="role"
                value={selectedRole}
                onChange={(value) => setSelectedRole(value)}
              >
                <RadioGroupItem
                  value="student"
                  label="Student"
                  className={`relative flex cursor-default select-none items-center rounded-lg px-3 py-4 border ${
                    selectedRole === 'student' ? 'border-primary' : ''
                  }`}
                />
                <RadioGroupItem
                  value="teacher"
                  label="Teacher"
                  className={`relative flex cursor-default select-none items-center rounded-lg px-3 py-4 border ${
                    selectedRole === 'teacher' ? 'border-primary' : ''
                  }`}
                />
                <RadioGroupItem
                  value="parent"
                  label="Parent"
                  className={`relative flex cursor-default select-none items-center rounded-lg px-3 py-4 border ${
                    selectedRole === 'parent' ? 'border-primary' : ''
                  }`}
                />
              </RadioGroup>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !selectedRole}
          >
            {isLoading ? 'Updating...' : 'Continue'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
