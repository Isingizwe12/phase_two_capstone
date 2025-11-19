'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Post } from '@/types';
import PostCard from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Tag, Loader2 } from 'lucide-react';

export default function TagPage() {
  const params = useParams();
  const tagSlug = params.slug as string;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostsByTag = async () => {
      try {
        setLoading(true);

        // Query posts that contain this tag
        const q = query(
          collection(db, 'posts'),
          where('status', '==', 'published'),
          where('tags', 'array-contains', tagSlug)
        );

        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Post));

        // Sort by published date (client-side since we can't orderBy with array-contains)
        fetchedPosts.sort((a, b) => {
          const dateA = a.publishedAt instanceof Date ? a.publishedAt : a.publishedAt?.toDate();
          const dateB = b.publishedAt instanceof Date ? b.publishedAt : b.publishedAt?.toDate();
          return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
        });

        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts by tag:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostsByTag();
  }, [tagSlug]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-8 h-8" />
            <h1 className="text-4xl font-bold capitalize">{tagSlug.replace(/-/g, ' ')}</h1>
          </div>
          <p className="text-blue-100 text-lg">
            {loading ? 'Loading posts...' : `${posts.length} ${posts.length === 1 ? 'post' : 'posts'} tagged with "${tagSlug}"`}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600 mb-6">No posts have been tagged with "{tagSlug}" yet.</p>
              <Link href="/">
                <Button>Browse All Posts</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Posts Grid */}
        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}