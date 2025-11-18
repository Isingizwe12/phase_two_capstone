'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPostsByAuthor, deletePost } from '@/lib/services/postService';
import { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  PenSquare, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        try {
          setLoading(true);
          const userPosts = await getPostsByAuthor(user.uid, true);
          setPosts(userPosts);
        } catch (error) {
          console.error('Error fetching posts:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPosts();
  }, [user]);

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleDelete = async (postId: string, postTitle: string) => {
    if (!confirm(`Delete "${postTitle}"? This cannot be undone.`)) return;

    try {
      setDeleting(postId);
      await deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setDeleting(null);
    }
  };

  const drafts = posts.filter(p => p.status === 'draft');
  const published = posts.filter(p => p.status === 'published');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-2 sm:py-0 gap-2 sm:gap-0">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm sm:text-base">Back to Home</span>
            </Link>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-center sm:justify-end w-full sm:w-auto">
              <Link href={`/profile/${user.username}`}>
                <Button variant="outline" size="sm">View Profile</Button>
              </Link>
              <Link href="/write">
                <Button size="sm">
                  <PenSquare className="w-4 h-4 mr-2" />
                  Write Post
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <Avatar className="w-16 h-16">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold">
                {user.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </Avatar>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Dashboard</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage your posts and drafts</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Posts</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{posts.length}</p>
                </div>
                <FileText className="w-10 sm:w-12 h-10 sm:h-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{published.length}</p>
                </div>
                <CheckCircle className="w-10 sm:w-12 h-10 sm:h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Drafts</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">{drafts.length}</p>
                </div>
                <Clock className="w-10 sm:w-12 h-10 sm:h-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Start writing your first post!</p>
              <Link href="/write">
                <Button>
                  <PenSquare className="w-4 h-4 mr-2" />
                  Write Your First Post
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Drafts Section */}
        {!loading && drafts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              Drafts ({drafts.length})
            </h2>
            <div className="space-y-4">
              {drafts.map((post) => (
                <PostItem key={post.id} post={post} onDelete={handleDelete} deleting={deleting === post.id} />
              ))}
            </div>
          </div>
        )}

        {/* Published Section */}
        {!loading && published.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              Published ({published.length})
            </h2>
            <div className="space-y-4">
              {published.map((post) => (
                <PostItem key={post.id} post={post} onDelete={handleDelete} deleting={deleting === post.id} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Post Item Component
interface PostItemProps {
  post: Post;
  onDelete: (id: string, title: string) => void;
  deleting: boolean;
}

function PostItem({ post, onDelete, deleting }: PostItemProps) {
  const publishedDate = post.publishedAt
    ? formatDistanceToNow(
        post.publishedAt instanceof Date ? post.publishedAt : post.publishedAt.toDate(),
        { addSuffix: true }
      )
    : 'Not published';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Post Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {post.status === 'draft' ? (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Draft</span>
              ) : (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Published</span>
              )}
              {post.tags && post.tags.length > 0 &&
                post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{tag}</span>
                ))
              }
            </div>

            <Link href={`/post/${post.slug}`}>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-600 mb-2 line-clamp-2">
                {post.title}
              </h3>
            </Link>

            <p className="text-gray-600 text-sm sm:text-base mb-3 line-clamp-2">{post.excerpt}</p>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 text-sm sm:text-base text-gray-500">
              <span>{publishedDate}</span>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.viewsCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{post.likesCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{post.commentsCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Link href={`/post/edit/${post.id}`}>
              <Button size="sm" variant="outline" className="w-full sm:w-auto flex-1 sm:flex-none">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(post.id, post.title)}
              disabled={deleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto flex-1 sm:flex-none"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </>}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
