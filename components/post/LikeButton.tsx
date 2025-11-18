// components/post/LikeButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { checkIfLiked, toggleLike, getLikeCount } from '@/lib/services/likeService';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

  // Check if user has liked this post AND get actual count
  const refreshLikeState = async () => {
    if (user && postId) {
      try {
        const liked = await checkIfLiked(postId, user.uid);
        setIsLiked(!!liked);
        
        // Get actual like count from server
        const count = await getLikeCount(postId);
        setLikeCount(count);
        
        console.log('Like state refreshed:', { liked: !!liked, count });
      } catch (error) {
        console.error('Error refreshing like state:', error);
      }
    }
  };

  // Initial load
  useEffect(() => {
    refreshLikeState();
  }, [user, postId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);

    // Optimistic update (for instant feedback)
    const previousLikeState = isLiked;
    const previousCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      // Toggle in Firebase
      await toggleLike(postId, user.uid);
      
      // IMPORTANT: Refresh from server to get actual state
      // This ensures we show the correct count from database
      await refreshLikeState();
      
      console.log('✅ Like toggled successfully');
    } catch (error: any) {
      console.error('❌ Error toggling like:', error);
      
      // Rollback on error
      setIsLiked(previousLikeState);
      setLikeCount(previousCount);

      alert(`Failed to update like: ${error.message}`);
    } finally {
      setLoading(false);
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
  <span className="hidden sm:inline">
    {likeCount === 1 ? 'Like' : 'Likes'}
  </span>
</Button>

  );
}