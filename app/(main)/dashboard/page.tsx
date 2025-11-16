'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your posts and drafts</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Draft Saved!</h2>
          <p className="text-gray-600 mb-6">Your post has been saved as a draft.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/write">
              <Button>Write Another Post</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Go to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}