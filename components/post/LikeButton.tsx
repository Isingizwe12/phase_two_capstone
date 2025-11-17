// components/post/LikeButton.tsx
'use client';

// React hooks
import { useState, useEffect } from 'react';

// Auth context
import { useAuth } from '@/lib/context/AuthContext';

// Like service functions
import { checkIfLiked, toggleLike } from '@/lib/services/likeService';

// UI components
import { Button } from '@/components/ui/button';

// Icons
import { Heart } from 'lucide-react';

// Next.js navigation
import { useRouter } from 'next/navigation';

/**
 * Props for LikeButton component
 */
interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
}

export default function LikeButton({ postId, initialLikeCount }: LikeButtonProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  // Check if user has liked this post
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user && postId) {
        try {
          const liked = await checkIfLiked(postId, user.uid);
          setIsLiked(!!liked);
          console.log('Like status checked:', { postId, liked: !!liked });
        } catch (error) {
          console.error('Error checking like status:', error);
        }
      }
    };

    checkLikeStatus();
  }, [user, postId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('=== LIKE BUTTON CLICKED ===');
    console.log('User:', user);
    console.log('Post ID:', postId);
    console.log('Current like status:', isLiked);

    if (!user) {
      console.log('No user logged in, redirecting...');
      router.push('/login');
      return;
    }

    if (loading) {
      console.log('Already processing, ignoring click');
      return;
    }

    setLoading(true);

    // Optimistic update
    const previousLikeState = isLiked;
    const previousCount = likeCount;

    console.log('Optimistic update: like =', !isLiked, 'count =', isLiked ? likeCount - 1 : likeCount + 1);
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      console.log('Calling toggleLike service...');
      const result = await toggleLike(postId, user.uid);
      console.log('Toggle like result:', result);
      console.log('Like action completed successfully!');
    } catch (error: any) {
      console.error('Error toggling like:', error);
      console.error('Error message:', error.message);
      
      // Rollback
      setIsLiked(previousLikeState);
      setLikeCount(previousCount);

      alert(`Failed to update like: ${error.message}`);
    } finally {
      setLoading(false);
      console.log('=== LIKE ACTION FINISHED ===');
    }
  };

  return (
    <Button
      onClick={handleLike}
      disabled={loading}
      variant={isLiked ? 'default' : 'outline'}
      size="sm"
      className={`gap-2 ${
        isLiked
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'hover:bg-red-50 hover:text-red-600'
      }`}
    >
      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
      <span>{likeCount}</span>
      <span className="hidden sm:inline">{isLiked ? 'Liked' : 'Like'}</span>
    </Button>
  );
}