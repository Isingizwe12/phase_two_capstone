
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Clock, Eye, MessageSquare, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LikeButton from './LikeButton';
import { getUserById } from '@/lib/services/userService';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  
  // Fetch author data
  const [author, setAuthor] = useState<any>(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      const authorData = await getUserById(post.authorId);
      setAuthor(authorData);
    };
    fetchAuthor();
  }, [post.authorId]);

  // Format date
  const publishedDate = post.publishedAt
    ? formatDistanceToNow(
        post.publishedAt instanceof Date
          ? post.publishedAt
          : post.publishedAt.toDate(),
        { addSuffix: true }
      )
    : 'Draft';

  // Handle card click (navigate to post)
  const handleCardClick = () => {
    router.push(`/post/${post.slug}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Cover Image - Clickable */}
      <div onClick={handleCardClick} className="cursor-pointer">
        {post.coverImage && (
          <div className="aspect-video overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </div>

      <CardHeader>
        {/* Author Info - Clickable, Separate from Post Link */}
        {author && (
          <div className="flex items-center gap-2 mb-3">
            <Link 
              href={`/profile/${author.username}`}
              className="flex items-center gap-2 hover:opacity-80"
            >
              <Avatar className="w-8 h-8">
                {author.photoURL ? (
                  <img src={author.photoURL} alt={author.displayName} />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                    {author.displayName?.[0]?.toUpperCase() || 'A'}
                  </div>
                )}
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">{author.displayName}</span>
                <span className="text-xs text-gray-500">@{author.username}</span>
              </div>
            </Link>
          </div>
        )}

        {/* Tags, Title, Excerpt - Clickable to go to post */}
        <div onClick={handleCardClick} className="cursor-pointer">
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
        </div>
      </CardHeader>

      <CardContent onClick={handleCardClick} className="cursor-pointer">
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

      <CardFooter onClick={handleCardClick} className="text-sm text-gray-500 cursor-pointer">
        Published {publishedDate}
      </CardFooter>

      {/* Like Button - Separate, not clickable to post */}
      <div className="px-6 pb-4">
        <LikeButton postId={post.id} initialLikeCount={post.likesCount || 0} />
      </div>
    </Card>
  );
}