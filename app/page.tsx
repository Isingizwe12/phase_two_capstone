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

      {/* Hero Section – Ultra Clean Card Style */}
<div className="relative min-h-screen flex items-center justify-center bg-gray-50 px-4 overflow-hidden">
  {/* Subtle background grid */}
  <div className="absolute inset-0 bg-grid-gray-200/30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_60%,transparent)]" />

  <div className="relative max-w-4xl w-full">
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
      <div className="px-8 py-20 sm:px-12 sm:py-24 md:px-16 md:py-28 text-center">
        {/* Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900">
          Welcome to
          <span className="block mt-3 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700">
            Publishing Platform
          </span>
        </h1>

        {/* Clean subtitle – no dots, no commas, just flow */}
        <p className="mt-8 text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
          Discover remarkable stories<br />
          bold ideas<br />
          and expert insights from writers worldwide
        </p>

        {/* CTA – only shows when not logged in */}
        {!user && (
          <div className="mt-12">
            <Link href="/signup">
              <Button
                size="lg"
                className="px-10 py-7 text-xl font-semibold rounded-2xl bg-gray-900 text-white hover:bg-black 
                           shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Start Writing — It’s Free
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>

    {/* Soft glow at bottom */}
    <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-gray-900/5 rounded-full blur-3xl -z-10" />
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
