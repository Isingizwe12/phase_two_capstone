// components/profile/FollowButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { checkIfFollowing, toggleFollow } from '@/lib/services/followService';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FollowButtonProps {
  userId: string; // User to follow/unfollow
  initialFollowersCount: number;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({ 
  userId, 
  initialFollowersCount,
  onFollowChange 
}: FollowButtonProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [loading, setLoading] = useState(false);

  // Check if current user is following this user
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (user && userId) {
        try {
          const following = await checkIfFollowing(user.uid, userId);
          setIsFollowing(!!following);
        } catch (error) {
          console.error('Error checking follow status:', error);
        }
      }
    };

    checkFollowStatus();
  }, [user, userId]);

  const handleFollow = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (loading) return;

    setLoading(true);

    // Optimistic update
    const previousFollowState = isFollowing;
    const previousCount = followersCount;

    setIsFollowing(!isFollowing);
    setFollowersCount(isFollowing ? followersCount - 1 : followersCount + 1);

    try {
      const nowFollowing = await toggleFollow(user.uid, userId);
      
      // Notify parent component
      if (onFollowChange) {
        onFollowChange(nowFollowing);
      }

      console.log('Follow toggled successfully');
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      
      // Rollback
      setIsFollowing(previousFollowState);
      setFollowersCount(previousCount);

      alert(`Failed to ${isFollowing ? 'unfollow' : 'follow'}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={isFollowing ? 'outline' : 'default'}
      className={isFollowing ? 'border-gray-300' : ''}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-4 h-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}