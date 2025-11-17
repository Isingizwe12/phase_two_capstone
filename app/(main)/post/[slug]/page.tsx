// app/(main)/post/[slug]/page.tsx

// 'use client' tells Next.js this component runs in the browser (needs hooks like useState)
'use client';

// Import React hooks
import { useEffect, useState } from 'react';

// Import Next.js components for navigation and links
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Import our custom hook to fetch post by slug (URL-friendly ID)
import { usePostBySlug } from '@/lib/hooks/usePosts';

// Import auth hook to check if user is logged in
import { useAuth } from '@/lib/context/AuthContext';

// Import service functions
import { incrementViewCount } from '@/lib/services/postService';
import { getUserById } from '@/lib/services/userService';

// Import UI components from shadcn
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

// Import icons from lucide-react
import { ArrowLeft, Calendar, Clock, Eye, Heart, MessageSquare, User } from 'lucide-react';

// Import date formatting library
import { format } from 'date-fns';

// Import comment components
import CommentForm from '@/components/comment/commentForm';
import CommentList from '@/components/comment/CommentList';

// Import like button component
import LikeButton from '@/components/post/LikeButton';

// This is the main component for viewing a single post
export default function SinglePostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { user } = useAuth();

  // Fetch the post from Firestore using React Query
  const { data: post, isLoading, error } = usePostBySlug(slug);

  // Fetch author data
  const [author, setAuthor] = useState<any>(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (post?.authorId) {
        const authorData = await getUserById(post.authorId);
        setAuthor(authorData);
        console.log('Author loaded:', authorData);
      }
    };
    fetchAuthor();
  }, [post?.authorId]);

  // Track page view
  useEffect(() => {
    if (post?.id) {
      incrementViewCount(post.id);
    }
  }, [post?.id]);

  // Show loading spinner while fetching post
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  // Show error message if fetch failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">Failed to load post. Please try again.</p>
            <div className="mt-4 text-center">
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show 404 message if post doesn't exist
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-gray-600 text-center text-lg">Post not found</p>
            <div className="mt-4 text-center">
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format the published date
  const publishedDate = post.publishedAt
    ? format(
        post.publishedAt instanceof Date ? post.publishedAt : post.publishedAt.toDate(),
        'MMMM dd, yyyy'
      )
    : 'Draft';

  // Main render - show the full post
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back button */}
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>

            {/* User info or Login button */}
            <div className="flex items-center gap-4">
              {user ? (
                <span className="text-sm text-gray-700">{user.displayName}</span>
              ) : (
                <Link href="/login">
                  <Button size="sm" variant="outline">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Cover Image (if exists) */}
          {post.coverImage && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
         {/* Author Section - PROMINENT */}
            {author && (
              <div className="flex items-center gap-3 py-4 mb-6 border-y">
                <Link href={`/profile/${author.username}`} className="flex items-center gap-3 hover:opacity-80">
                  <Avatar className="w-12 h-12">
                    {author.photoURL ? (
                      <img src={author.photoURL} alt={author.displayName} />
                    ) : (
                      <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xl font-semibold">
                        {author.displayName?.[0]?.toUpperCase() || 'A'}
                      </div>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{author.displayName}</p>
                    <p className="text-sm text-gray-600">@{author.username}</p>
                  </div>
                </Link>
              </div>
            )}
          {/* Post Content */}
          <div className="p-8">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/tag/${tag}`}>
                    <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 cursor-pointer">
                      {tag}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
            )}

           

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-6 mb-6 border-b">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{publishedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.readTime} min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.viewsCount || 0} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{post.likesCount || 0} likes</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{post.commentsCount || 0} comments</span>
              </div>
            </div>

            {/* Post Content (HTML from rich text editor) */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Edit button (only for post author) */}
            {user && user.uid === post.authorId && (
              <div className="mt-8 pt-6 border-t">
                <Link href={`/post/edit/${post.id}`}>
                  <Button>Edit Post</Button>
                </Link>
              </div>
            )}

            {/* Like Button Section */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center justify-center">
                <LikeButton postId={post.id} initialLikeCount={post.likesCount || 0} />
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-8">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">
                Comments ({post.commentsCount || 0})
              </h2>
              
              {/* Comment Form */}
              <CommentForm 
                postId={post.id} 
                onCommentAdded={() => {
                  window.location.reload();
                }} 
              />
              
              {/* Comments List */}
              <div className="mt-8">
                <CommentList 
                  postId={post.id} 
                  onCommentAdded={() => {}} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}