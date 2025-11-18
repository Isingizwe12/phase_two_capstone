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
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-2 sm:py-0">
            <div className="flex items-center mb-2 sm:mb-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600">
                  Publishing Platform
                </h1>
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-center sm:justify-end w-full sm:w-auto">
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
                  <span className="text-sm text-gray-700 truncate max-w-[120px] sm:max-w-none">
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
      <div className="relative overflow-hidden py-20 sm:py-28 bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
            Welcome to Publishing Platform
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
          {!user && (
            <Link href="/signup">
              <Button 
                size="lg" 
                className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-white text-blue-700 hover:bg-gray-100"
              >
                Start Writing
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Latest Posts</h2>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Explore the latest stories from our community
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col sm:flex-row justify-center items-center py-8 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-gray-600 text-sm sm:text-base">Loading posts...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm sm:text-base">
            Failed to load posts. Please try again later.
          </div>
        )}

        {/* Posts Grid */}
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-base sm:text-lg mb-4">
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

      <footer className="mt-12 sm:mt-20 border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700">Publishing Platform</h2>
            <p className="text-gray-400 text-xs sm:text-sm">© 2025 All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
