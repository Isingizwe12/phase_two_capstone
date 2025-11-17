// components/post/PostCard.tsx
import Link from 'next/link';
import { Post } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Clock, Eye, MessageSquare, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LikeButton from './LikeButton';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  // Format date
  const publishedDate = post.publishedAt
    ? formatDistanceToNow(
        post.publishedAt instanceof Date
          ? post.publishedAt
          : post.publishedAt.toDate(),
        { addSuffix: true }
      )
    : 'Draft';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Cover Image - Clickable */}
      <Link href={`/post/${post.slug}`}>
        {post.coverImage && (
          <div className="aspect-video overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </Link>

      {/* Content - Clickable */}
      <Link href={`/post/${post.slug}`}>
        <CardHeader>
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 line-clamp-2">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-gray-600 mt-2 line-clamp-3">{post.excerpt}</p>
        </CardHeader>

        <CardContent>
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{post.readTime} min read</span>
            </div>
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
        </CardContent>

        <CardFooter className="text-sm text-gray-500">
          Published {publishedDate}
        </CardFooter>
      </Link>

      {/* Like Button - NOT inside Link, with proper event stopping */}
      <div className="px-6 pb-4">
        <LikeButton postId={post.id} initialLikeCount={post.likesCount || 0} />
      </div>
    </Card>
  );
}