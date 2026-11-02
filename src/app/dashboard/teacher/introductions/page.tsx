import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { TeacherIntroductions } from '@/components/teacher-introductions';
export default async function IntroductionsPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect('/sign-in');
  if (session.user.role !== 'teacher') redirect('/dashboard');
  return <div className="mx-auto max-w-3xl space-y-6 p-6"><h1 className="text-3xl font-bold">Teacher introductions</h1><TeacherIntroductions /></div>;
}
