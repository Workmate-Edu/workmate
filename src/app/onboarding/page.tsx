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
            <RadioGroup
              value={selectedRole}
              onValueChange={setSelectedRole}
              className="grid grid-cols-1 gap-4"
            >
              <label
                className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer ${
                  selectedRole === 'student' ? 'border-primary' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="font-medium">Student</div>
                  <div className="text-sm text-gray-500">
                    I want to learn and connect with teachers
                  </div>
                </div>
                <RadioGroupItem value="student" className="h-5 w-5" />
              </label>

              <label
                className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer ${
                  selectedRole === 'teacher' ? 'border-primary' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="font-medium">Teacher</div>
                  <div className="text-sm text-gray-500">
                    I want to teach and connect with students
                  </div>
                </div>
                <RadioGroupItem value="teacher" className="h-5 w-5" />
              </label>

              <label
                className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer ${
                  selectedRole === 'parent' ? 'border-primary' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="font-medium">Parent</div>
                  <div className="text-sm text-gray-500">
                    I want to manage my children's education
                  </div>
                </div>
                <RadioGroupItem value="parent" className="h-5 w-5" />
              </label>
            </RadioGroup>
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
