// app/page.tsx
'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { usePublishedPosts } from '@/lib/hooks/usePosts';
import { Button } from '@/components/ui/button';
import PostCard from '@/components/post/PostCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PenSquare, Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { data: posts, isLoading, error } = usePublishedPosts(20);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600">
                  Publishing Platform
                </h1>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/write">
                    <Button size="sm">
                      <PenSquare className="w-4 h-4 mr-2" />
                      Write
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <span className="text-sm text-gray-700">
                    {user.displayName}
                  </span>
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-4">
            Welcome to Publishing Platform
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
          {!user && (
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Start Writing
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Posts</h2>
          <p className="text-gray-600 mt-2">
            Explore the latest stories from our community
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading posts...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            Failed to load posts. Please try again later.
          </div>
        )}

        {/* Posts Grid */}
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                No posts yet. Be the first to write!
              </p>
              {user && (
                <Link href="/write">
                  <Button>
                    <PenSquare className="w-4 h-4 mr-2" />
                    Write Your First Post
                  </Button>
                </Link>
              )}
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2025 Publishing Platform. Built with Next.js & Firebase.
          </p>
        </div>
      </footer>
    </div>
  );
}